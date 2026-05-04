/**
 * EOTC Voice Studio — Video Renderer (Robust Edition)
 * 
 * Composes a cinematic 9:16 TikTok/Reels-ready vertical video using FFmpeg:
 *   - Beautiful EOTC background with Ken Burns zoom effect
 *   - Vignette overlay for premium feel
 *   - ASS subtitle overlay for animated captions
 *   - Voice audio mixed as primary track
 *   - 30fps, H.264, 1080x1920
 * 
 * Designed for maximum compatibility with FFmpeg 4.x and 5.x+
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';
import { loadCaptions } from './transcribe.js';
import { generateASS } from './captions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ═══════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════
const CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  presets: {
    fast: { crf: 28, preset: 'veryfast' },
    high: { crf: 20, preset: 'medium' },
    ultra: { crf: 16, preset: 'slow' }
  }
};

/**
 * Find FFmpeg binary.
 * PRIORITY: system ffmpeg first (modern, installed via apt-get on CI),
 * then npm package as last resort.
 */
async function findFFmpeg() {
  // 1. Try system ffmpeg FIRST — it's always newer on GitHub Actions
  try {
    const version = execSync('ffmpeg -version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    const versionMatch = version.match(/ffmpeg version (\S+)/);
    console.log(`   🔧 Using system FFmpeg${versionMatch ? ` (${versionMatch[1]})` : ''}`);
    return 'ffmpeg';
  } catch (e) {
    // System ffmpeg not available
  }

  // 2. Fallback: try npm @ffmpeg-installer/ffmpeg
  try {
    const installer = await import('@ffmpeg-installer/ffmpeg');
    if (installer.path && fs.existsSync(installer.path)) {
      console.log(`   🔧 Using npm FFmpeg: ${installer.path}`);
      return installer.path;
    }
  } catch (e) {
    // Not installed
  }

  throw new Error(
    'FFmpeg not found! Install via:\n' +
    '  sudo apt-get install ffmpeg\n' +
    '  OR: npm install @ffmpeg-installer/ffmpeg'
  );
}

// Cached path
let _ffmpegPath = null;
async function getFFmpegPath() {
  if (!_ffmpegPath) _ffmpegPath = await findFFmpeg();
  return _ffmpegPath;
}

/**
 * Get audio duration using ffprobe
 */
function getAudioDuration(audioPath) {
  try {
    const result = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioPath}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    const dur = parseFloat(result);
    if (isNaN(dur) || dur <= 0) throw new Error('Invalid duration');
    return dur;
  } catch (e) {
    console.warn('   ⚠️ Could not detect audio duration via ffprobe, using caption duration');
    return null;
  }
}

/**
 * Ensure background image exists and is valid
 */
async function ensureBackground() {
  const bgPath = path.join(ROOT, 'assets', 'background.png');

  if (fs.existsSync(bgPath)) {
    const stats = fs.statSync(bgPath);
    if (stats.size > 1000) {
      console.log('   🖼️ Using existing background.png');
      return bgPath;
    }
  }

  console.log('   🎨 Generating background with FFmpeg...');
  fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
  const ffmpegBin = await getFFmpegPath();

  // Try progressively simpler backgrounds until one works
  const attempts = [
    // Attempt 1: gradient with blur
    `"${ffmpegBin}" -y -f lavfi -i "color=c=0x0a0a0f:s=1080x1920:d=1" -vf "gblur=sigma=20" -frames:v 1 "${bgPath}"`,
    // Attempt 2: solid dark color
    `"${ffmpegBin}" -y -f lavfi -i "color=c=0x0a0a0f:s=1080x1920:d=1" -frames:v 1 "${bgPath}"`
  ];

  for (const cmd of attempts) {
    try {
      execSync(cmd, { stdio: 'pipe', timeout: 15000 });
      if (fs.existsSync(bgPath) && fs.statSync(bgPath).size > 100) {
        console.log('   ✅ Background generated');
        return bgPath;
      }
    } catch (e) {
      continue;
    }
  }

  throw new Error('Failed to generate background image with any method');
}

/**
 * Detect FFmpeg capabilities to build compatible filter chain
 */
function detectFFmpegCapabilities(ffmpegBin) {
  const caps = { hasVignette: false, hasZoompan: true, hasAss: false };
  try {
    const filters = execSync(`"${ffmpegBin}" -filters`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    caps.hasVignette = filters.includes('vignette');
    caps.hasAss = filters.includes(' ass ') || filters.includes('libass');
    caps.hasZoompan = filters.includes('zoompan');
  } catch (e) {
    // Assume basic capabilities
  }
  return caps;
}

/**
 * Render the final video — robust, compatible with FFmpeg 4.x+
 */
async function renderVideo(audioPath, assPath, bgPath, quality = 'high') {
  const outputDir = path.join(ROOT, 'output');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'tiktok_ready.mp4');

  const preset = CONFIG.presets[quality] || CONFIG.presets.high;
  const duration = getAudioDuration(audioPath);
  const ffmpegBin = await getFFmpegPath();
  const caps = detectFFmpegCapabilities(ffmpegBin);

  console.log(`\n🎬 Rendering video...`);
  console.log(`   📐 Resolution: ${CONFIG.width}x${CONFIG.height}`);
  console.log(`   🎞️ FPS: ${CONFIG.fps}`);
  console.log(`   📊 Quality: ${quality} (CRF ${preset.crf}, ${preset.preset})`);
  console.log(`   🔧 Capabilities: vignette=${caps.hasVignette} ass=${caps.hasAss} zoompan=${caps.hasZoompan}`);
  if (duration) console.log(`   ⏱️ Duration: ${duration.toFixed(1)}s`);

  const durationArg = duration ? Math.ceil(duration) + 1 : 300;
  const totalFrames = Math.round(durationArg * CONFIG.fps);

  // Escape ASS path for the filter (Linux-safe)
  const assPathEscaped = assPath
    .replace(/\\/g, '/')
    .replace(/:/g, '\\:')
    .replace(/'/g, "'\\''");

  // Build filter chain step by step — only use what's available
  const filters = [];

  // Step 1: Scale background slightly larger for Ken Burns
  filters.push(`scale=1296:2304`);

  // Step 2: Ken Burns slow zoom
  if (caps.hasZoompan) {
    filters.push(
      `zoompan=z='1.08-0.08*on/${totalFrames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${CONFIG.width}x${CONFIG.height}:fps=${CONFIG.fps}`
    );
  } else {
    // Fallback: just scale to target
    filters.push(`scale=${CONFIG.width}:${CONFIG.height}`);
  }

  // Step 3: Vignette (skip if not available)
  if (caps.hasVignette) {
    filters.push(`vignette=PI/4`);
  }

  // Step 4: ASS subtitles
  if (caps.hasAss) {
    filters.push(`ass='${assPathEscaped}'`);
  } else {
    // Fallback: try subtitles filter
    filters.push(`subtitles='${assPathEscaped}'`);
  }

  const filterComplex = `[0:v]${filters.join(',')}[vout]`;

  const ffmpegArgs = [
    '-y',
    '-loop', '1', '-i', bgPath,
    '-i', audioPath,
    '-filter_complex', filterComplex,
    '-map', '[vout]',
    '-map', '1:a',
    '-c:v', 'libx264',
    '-crf', String(preset.crf),
    '-preset', preset.preset,
    '-profile:v', 'high',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '44100',
    '-shortest',
    '-t', String(durationArg),
    '-metadata', 'title=EOTC Voice Studio',
    '-metadata', 'artist=Ethiopian Orthodox Tewahedo Church',
    '-movflags', '+faststart',
    outputPath
  ];

  console.log(`\n   📝 Filter: ${filterComplex.substring(0, 120)}...`);

  return new Promise((resolve, reject) => {
    console.log('   🔄 FFmpeg processing...\n');

    const ffmpeg = spawn(ffmpegBin, ffmpegArgs, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stderr = '';
    let lastProgress = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      const timeMatch = data.toString().match(/time=(\d+:\d+:\d+\.\d+)/);
      if (timeMatch && timeMatch[1] !== lastProgress) {
        lastProgress = timeMatch[1];
        process.stdout.write(`\r   ⏳ Progress: ${lastProgress}`);
      }
    });

    ffmpeg.on('close', (code) => {
      console.log('');

      if (code !== 0) {
        console.error('\n❌ FFmpeg error output (last 2000 chars):');
        console.error(stderr.slice(-2000));
        reject(new Error(`FFmpeg exited with code ${code}`));
        return;
      }

      if (!fs.existsSync(outputPath)) {
        reject(new Error('FFmpeg completed but output file not found'));
        return;
      }

      const stats = fs.statSync(outputPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);

      console.log(`\n   ✅ Video rendered successfully!`);
      console.log(`   📁 Output: ${outputPath}`);
      console.log(`   📦 Size: ${sizeMB} MB`);

      resolve(outputPath);
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to start FFmpeg: ${err.message}`));
    });
  });
}

// ═══════════════════════════════════════════
// Main CLI Entry
// ═══════════════════════════════════════════
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🎬 EOTC Voice Studio — Video Render   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // Parse arguments
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const idx = args.indexOf(name);
    return idx !== -1 ? args[idx + 1] : null;
  };

  let audioPath = getArg('--audio');
  const quality = getArg('--quality') || 'high';
  const style = getArg('--style') || process.env.CAPTION_STYLE || 'word-highlight';

  // Auto-detect audio if not specified
  if (!audioPath) {
    const inputDir = path.join(ROOT, 'input');
    if (fs.existsSync(inputDir)) {
      const audioFiles = fs.readdirSync(inputDir)
        .filter(f => /\.(mp3|ogg|wav|m4a|flac)$/i.test(f));
      if (audioFiles.length > 0) {
        audioPath = path.join(inputDir, audioFiles[0]);
        console.log(`   🔍 Auto-detected audio: ${audioPath}`);
      }
    }
  }

  if (!audioPath || !fs.existsSync(audioPath)) {
    console.error('❌ No audio file found!');
    console.error('   Usage: node src/render.js --audio input/voice.mp3');
    console.error('   Or place an audio file in the input/ directory.');
    process.exit(1);
  }

  // Step 1: Load captions
  console.log('📖 Step 1: Loading captions...');
  const captions = loadCaptions();

  // Step 2: Generate ASS subtitles
  console.log('\n📝 Step 2: Generating subtitles...');
  const assPath = generateASS(captions.words, style);

  // Step 3: Ensure background
  console.log('\n🖼️ Step 3: Preparing background...');
  const bgPath = await ensureBackground();

  // Step 4: Render video
  console.log('\n🎬 Step 4: Rendering video...');
  try {
    const outputPath = await renderVideo(audioPath, assPath, bgPath, quality);

    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   ✅ VIDEO RENDERED SUCCESSFULLY!        ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log(`\n   📁 ${outputPath}`);

  } catch (err) {
    console.error(`\n❌ Render failed: ${err.message}`);
    process.exit(1);
  }
}

main();
