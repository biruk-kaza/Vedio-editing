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
  const parsed = { title: 'EOTC Voice Studio' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title' && args[i + 1]) {
      parsed.title = args[++i];
    }
  }
  return parsed;
}

// ── Load Captions ──
function loadCaptions() {
  const jsonPath = path.join(__dirname, 'captions.json');
  const reviewPath = path.join(__dirname, 'captions_review.txt');

  if (fs.existsSync(jsonPath)) {
    console.log('📖 Loading captions from captions.json...');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    if (!data.words || data.words.length === 0) {
      throw new Error('captions.json has no word timestamps. Re-run transcription.');
    }
    console.log(`   ✅ ${data.words.length} words loaded`);
    return {
      words: data.words,
      totalDuration: data.total_duration || data.words[data.words.length - 1].end,
    };
  }

  if (fs.existsSync(reviewPath)) {
    console.log('📖 Loading from captions_review.txt...');
    const content = fs.readFileSync(reviewPath, 'utf-8');
    const wordPattern = /^\[(\d+\.?\d*)\s*→\s*(\d+\.?\d*)\]\s+(.+)$/gm;
    const words = [];
    let match;
    while ((match = wordPattern.exec(content)) !== null) {
      words.push({
        word: match[3].trim(),
        start: parseFloat(match[1]),
        end: parseFloat(match[2]),
      });
    }
    if (words.length === 0) throw new Error('No timestamps found in captions_review.txt');
    console.log(`   ✅ ${words.length} words loaded from review file`);
    return { words, totalDuration: words[words.length - 1].end };
  }

  throw new Error('No caption files found! Run transcription (Phase 1) first.');
}

// ── Find Audio File ──
function findAudioFile() {
  const inputDir = path.join(__dirname, 'input');
  const extensions = ['.mp3', '.ogg', '.wav', '.m4a', '.flac', '.aac'];
  if (!fs.existsSync(inputDir)) throw new Error('input/ directory not found');
  const files = fs.readdirSync(inputDir);
  const audioFile = files.find(f => extensions.includes(path.extname(f).toLowerCase()));
  if (!audioFile) throw new Error('No audio file found in input/ directory');
  return path.join(inputDir, audioFile);
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

  // 2. Find and copy audio to public/
  const audioPath = findAudioFile();
  const ext = path.extname(audioPath);
  const audioFileName = `audio${ext}`;
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.copyFileSync(audioPath, path.join(publicDir, audioFileName));
  console.log(`🎵 Audio: ${audioPath} → public/${audioFileName}`);

  // 3. Calculate duration
  const introDurationSec = 3;
  const outroDurationSec = 3;
  const totalSeconds = introDurationSec + totalDuration + outroDurationSec + 0.5;

  // 4. Write render-props.json
  const props = {
    words,
    audioFileName,
    title: args.title,
    totalDuration,
    totalSeconds,
  };

  const propsPath = path.join(__dirname, 'render-props.json');
  fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));

  console.log('');
  console.log(`📊 Render Parameters:`);
  console.log(`   📝 Words: ${words.length}`);
  console.log(`   ⏱️  Audio: ${totalDuration.toFixed(1)}s`);
  console.log(`   ⏱️  Total: ${totalSeconds.toFixed(1)}s (intro + audio + outro)`);
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
