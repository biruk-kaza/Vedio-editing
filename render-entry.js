/**
 * EOTC Voice Studio — Render Entry Script
 * 
 * CLI script for GitHub Actions to render the final video via Remotion.
 * 
 * Pipeline:
 * 1. Load captions from captions.json / captions_review.txt
 * 2. Detect audio file in input/
 * 3. Copy audio to public/ so Remotion can serve it
 * 4. Calculate exact video duration (intro + audio + outro)
 * 5. Bundle & render via Remotion's programmatic API
 * 6. Output MP4 to output/tiktok_ready.mp4
 * 
 * Usage:
 *   node render-entry.js [--quality high|ultra|fast] [--title "Custom Title"]
 */
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Parse CLI Args ──
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    quality: 'high',
    title: 'EOTC Voice Studio',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--quality' && args[i + 1]) {
      parsed.quality = args[++i];
    } else if (args[i] === '--title' && args[i + 1]) {
      parsed.title = args[++i];
    }
  }

  return parsed;
}

// ── Quality Presets ──
const QUALITY_PRESETS = {
  fast: { crf: 28, codec: 'h264', concurrency: 4 },
  high: { crf: 18, codec: 'h264', concurrency: 2 },
  ultra: { crf: 14, codec: 'h264', concurrency: 1 },
};

// ── Load Captions ──
function loadCaptions() {
  const jsonPath = path.join(__dirname, 'captions.json');
  const reviewPath = path.join(__dirname, 'captions_review.txt');

  // Try JSON first (more reliable for Remotion)
  if (fs.existsSync(jsonPath)) {
    console.log('📖 Loading captions from captions.json...');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    if (!data.words || data.words.length === 0) {
      throw new Error('captions.json has no word timestamps');
    }

    console.log(`   ✅ ${data.words.length} words loaded`);
    return {
      words: data.words,
      totalDuration: data.total_duration || data.words[data.words.length - 1].end,
    };
  }

  // Fallback: parse review file
  if (fs.existsSync(reviewPath)) {
    console.log('📖 Loading captions from captions_review.txt...');
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

    if (words.length === 0) {
      throw new Error('No word timestamps found in captions_review.txt');
    }

    console.log(`   ✅ ${words.length} words loaded from review file`);
    return {
      words,
      totalDuration: words[words.length - 1].end,
    };
  }

  throw new Error(
    'No caption files found! Run transcription first.\n' +
    'Expected: captions.json or captions_review.txt'
  );
}

// ── Find Audio File ──
function findAudioFile() {
  const inputDir = path.join(__dirname, 'input');
  const extensions = ['.mp3', '.ogg', '.wav', '.m4a', '.flac', '.aac'];

  if (!fs.existsSync(inputDir)) {
    throw new Error('input/ directory not found');
  }

  const files = fs.readdirSync(inputDir);
  const audioFile = files.find((f) =>
    extensions.includes(path.extname(f).toLowerCase())
  );

  if (!audioFile) {
    throw new Error('No audio file found in input/ directory');
  }

  return path.join(inputDir, audioFile);
}

// ── Copy audio to public/ so Remotion can serve it ──
function prepareAudioForBundle(audioPath) {
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const ext = path.extname(audioPath);
  const destName = `audio${ext}`;
  const destPath = path.join(publicDir, destName);

  fs.copyFileSync(audioPath, destPath);
  console.log(`🎵 Audio copied to public/${destName} for Remotion serving`);

  // Return the staticFile name (just the filename, Remotion resolves from public/)
  return destName;
}

// ── Main Render ──
async function main() {
  const startTime = Date.now();
  const args = parseArgs();
  const preset = QUALITY_PRESETS[args.quality] || QUALITY_PRESETS.high;

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   🎬 EOTC Voice Studio — Remotion Renderer v2.0     ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // 1. Load captions
  const { words, totalDuration } = loadCaptions();

  // 2. Find and prepare audio
  const audioPath = findAudioFile();
  console.log(`🎵 Audio source: ${audioPath}`);

  const audioFileName = prepareAudioForBundle(audioPath);

  // 3. Calculate duration
  // intro (3s) + audio content + outro (3s) + 0.5s padding
  const FPS = 30;
  const introDurationSec = 3;
  const outroDurationSec = 3;
  const totalSeconds = introDurationSec + totalDuration + outroDurationSec + 0.5;
  const durationInFrames = Math.ceil(totalSeconds * FPS);

  console.log('');
  console.log(`📊 Video Parameters:`);
  console.log(`   ⏱️  Duration: ${totalSeconds.toFixed(1)}s (${durationInFrames} frames @ ${FPS}fps)`);
  console.log(`   📝 Words: ${words.length}`);
  console.log(`   🎨 Quality: ${args.quality} (CRF ${preset.crf})`);
  console.log(`   📐 Resolution: 1080×1920 (9:16)`);
  console.log(`   🎬 Title: ${args.title}`);
  console.log('');

  // 4. Bundle the Remotion project
  console.log('📦 Bundling Remotion project...');
  const bundleLocation = await bundle({
    entryPoint: path.join(__dirname, 'src', 'index.jsx'),
    webpackOverride: (config) => config,
    publicDir: path.join(__dirname, 'public'),
  });
  console.log('   ✅ Bundle ready');

  // 5. Select composition & override duration
  const inputProps = {
    words,
    audioFileName,
    title: args.title,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'EOTCVideo',
    inputProps,
  });

  // Override duration to match actual content
  composition.durationInFrames = durationInFrames;
  composition.fps = FPS;

  // 6. Ensure output directory
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'tiktok_ready.mp4');

  // 7. Render
  console.log('');
  console.log('🎬 Rendering video...');
  console.log('   This may take several minutes for high quality...');
  console.log('');

  let lastProgress = 0;
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: preset.codec,
    outputLocation: outputPath,
    inputProps,
    crf: preset.crf,
    concurrency: preset.concurrency,
    chromiumOptions: {
      enableMultiProcessOnLinux: true,
    },
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct >= lastProgress + 5) {
        const filled = Math.floor(pct / 5);
        const empty = 20 - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        console.log(`   [${bar}] ${pct}%  (${elapsed}s elapsed)`);
        lastProgress = pct;
      }
    },
  });

  // 8. Cleanup temp audio from public/
  try {
    const tempAudio = path.join(__dirname, 'public', audioFileName);
    if (fs.existsSync(tempAudio)) {
      fs.unlinkSync(tempAudio);
    }
  } catch (e) {
    // Non-critical
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const fileSizeMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(1);

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   ✅ RENDER COMPLETE                                 ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`   📁 Output:     ${outputPath}`);
  console.log(`   📦 Size:       ${fileSizeMB} MB`);
  console.log(`   ⏱️  Render time: ${elapsed}s`);
  console.log(`   📐 Resolution: 1080×1920`);
  console.log(`   🎞️  Frames:    ${durationInFrames}`);
  console.log(`   🎨 Quality:    ${args.quality} (CRF ${preset.crf})`);
  console.log(`   🎬 Engine:     Remotion 4.0`);
  console.log('');
}

main().catch((err) => {
  console.error('');
  console.error('╔══════════════════════════════════════════════════════╗');
  console.error('║   ❌ RENDER FAILED                                   ║');
  console.error('╚══════════════════════════════════════════════════════╝');
  console.error('');
  console.error(`   Error: ${err.message}`);
  console.error('');
  if (err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
});
