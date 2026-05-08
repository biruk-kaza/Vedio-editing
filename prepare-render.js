/**
 * EOTC Voice Studio — Render Preparation Script
 * 
 * This script runs BEFORE Remotion render to:
 * 1. Find the audio file in input/
 * 2. Copy it to public/ for Remotion static serving
 * 3. Load captions from captions.json or captions_review.txt
 * 4. Calculate exact video duration
 * 5. Write render-props.json consumed by `npx remotion render --props`
 * 
 * Usage: node prepare-render.js [--title "Custom Title"]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Parse CLI Args ──
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { title: 'EOTC Voice Studio', mode: '' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title' && args[i + 1]) {
      parsed.title = args[++i];
    }
    if (args[i] === '--mode' && args[i + 1]) {
      parsed.mode = args[++i]; // 'kinetic' or 'caption'
    }
  }
  return parsed;
}

// ── Load Captions ──
function loadCaptions() {
  const jsonPath = path.join(__dirname, 'captions.json');
  const reviewPath = path.join(__dirname, 'captions_review.txt');

  // ── FORMAT 1: captions.json with word-level timestamps ──
  if (fs.existsSync(jsonPath)) {
    console.log('📖 Loading captions from captions.json...');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Case A: has word-level timestamps (ideal)
    if (data.words && data.words.length > 0) {
      console.log(`   ✅ ${data.words.length} words loaded (word-level timestamps)`);
      return {
        words: data.words,
        totalDuration: data.total_duration || data.words[data.words.length - 1].end,
      };
    }

    // Case B: has segments (phrases) — split each segment text into evenly-spaced words
    if (data.segments && data.segments.length > 0) {
      console.log(`   ⚠️  No word-level timestamps found. Converting ${data.segments.length} segments to words...`);
      const words = [];
      for (const seg of data.segments) {
        const segWords = (seg.text || '').trim().split(/\s+/).filter(Boolean);
        if (segWords.length === 0) continue;
        const segDur = (seg.end - seg.start);
        const wordDur = segDur / segWords.length;
        segWords.forEach((w, i) => {
          words.push({
            word: w,
            start: Math.round((seg.start + i * wordDur) * 100) / 100,
            end: Math.round((seg.start + (i + 1) * wordDur) * 100) / 100,
          });
        });
      }
      if (words.length === 0) throw new Error('Could not extract words from segments.');
      console.log(`   ✅ ${words.length} words generated from segments`);
      return {
        words,
        totalDuration: data.total_duration || data.segments[data.segments.length - 1].end,
      };
    }

    throw new Error('captions.json has no words or segments. See CAPTIONS_FORMAT.md for the correct format.');
  }

  // ── FORMAT 2: captions_review.txt with [start → end] word format ──
  if (fs.existsSync(reviewPath)) {
    console.log('📖 Loading from captions_review.txt...');
    const content = fs.readFileSync(reviewPath, 'utf-8');
    const wordPattern = /^\[(\d+\.?\d*)\s*[→\-\>]+\s*(\d+\.?\d*)\]\s+(.+)$/gm;
    const words = [];
    let match;
    while ((match = wordPattern.exec(content)) !== null) {
      words.push({
        word: match[3].trim(),
        start: parseFloat(match[1]),
        end: parseFloat(match[2]),
      });
    }
    if (words.length === 0) throw new Error('No timestamps found in captions_review.txt. Format: [0.0 → 0.5] word');
    console.log(`   ✅ ${words.length} words loaded from captions_review.txt`);
    return { words, totalDuration: words[words.length - 1].end };
  }

  throw new Error(
    'No caption files found!\n' +
    '  Option 1: Add captions.json to repo root (see CAPTIONS_FORMAT.md)\n' +
    '  Option 2: Add captions_review.txt with [start → end] word format\n' +
    '  Option 3: Provide captions_url in the GitHub Actions workflow input'
  );
}

// ── Find Media Files ──
function findMediaFiles() {
  const inputDir = path.join(__dirname, 'input');
  const audioExts = ['.mp3', '.ogg', '.wav', '.m4a', '.flac', '.aac'];
  const videoExts = ['.mp4', '.webm', '.mov', '.avi', '.mkv']; // mp4 first priority
  if (!fs.existsSync(inputDir)) throw new Error('input/ directory not found');
  const files = fs.readdirSync(inputDir);

  // Find all video files, pick the largest one (most likely the final render)
  const videoFiles = files.filter(f => videoExts.includes(path.extname(f).toLowerCase()));
  let videoFile = null;
  if (videoFiles.length > 0) {
    videoFile = videoFiles.sort((a, b) => {
      const sA = fs.statSync(path.join(inputDir, a)).size;
      const sB = fs.statSync(path.join(inputDir, b)).size;
      return sB - sA; // largest first
    })[0];
  }
  const audioFile = files.find(f => audioExts.includes(path.extname(f).toLowerCase()));

  return {
    videoPath: videoFile ? path.join(inputDir, videoFile) : null,
    audioPath: audioFile ? path.join(inputDir, audioFile) : null,
  };
}

// ── Main ──
function main() {
  const args = parseArgs();

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   📋 EOTC Voice Studio — Preparing Render Props     ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // 1. Load captions
  const { words, totalDuration } = loadCaptions();

  // 2. Find media files
  const { videoPath, audioPath } = findMediaFiles();
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  let videoFileName = '';
  let audioFileName = '';
  let mode = args.mode || 'kinetic'; // Default or forced via --mode

  // Video mode: copy video to public/
  if (videoPath && mode !== 'kinetic') {
    const vExt = path.extname(videoPath);
    videoFileName = `video${vExt}`;
    fs.copyFileSync(videoPath, path.join(publicDir, videoFileName));
    console.log(`🎬 Video: ${videoPath} → public/${videoFileName}`);
    mode = 'caption'; // Video overlay = caption mode
  }

  // Audio mode: copy audio to public/
  if (audioPath && !videoPath) {
    const aExt = path.extname(audioPath);
    audioFileName = `audio${aExt}`;
    fs.copyFileSync(audioPath, path.join(publicDir, audioFileName));
    console.log(`🎵 Audio: ${audioPath} → public/${audioFileName}`);
  }

  if (!videoPath && !audioPath) {
    throw new Error('No media file found in input/. Add a video (.mov/.mp4) or audio (.mp3/.m4a) file.');
  }

  // 3. Calculate duration
  const introDurationSec = mode === 'caption' ? 0 : 3.5;
  const outroDurationSec = mode === 'caption' ? 0 : 3;
  const totalSeconds = introDurationSec + totalDuration + outroDurationSec + 0.5;

  // 4. Write render-props.json
  const props = {
    words,
    audioFileName,
    videoFileName,
    mode, // 'kinetic' or 'caption'
    title: args.title,
    totalDuration,
    totalSeconds,
  };

  const propsPath = path.join(__dirname, 'render-props.json');
  fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));

  console.log('');
  console.log(`📊 Render Parameters:`);
  console.log(`   🎯 Mode: ${mode === 'caption' ? '📹 Video Caption Overlay' : '✨ Kinetic Typography'}`);
  console.log(`   📝 Words: ${words.length}`);
  console.log(`   ⏱️  Media: ${totalDuration.toFixed(1)}s`);
  console.log(`   ⏱️  Total: ${totalSeconds.toFixed(1)}s`);
  console.log(`   🎬 Title: "${args.title}"`);
  console.log(`   📁 Props: ${propsPath}`);
  console.log('');
  console.log('✅ Ready for Remotion render!');
  console.log('');

  // 5. Ensure output directory
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
}

try {
  main();
} catch (err) {
  console.error(`❌ Preparation failed: ${err.message}`);
  process.exit(1);
}
