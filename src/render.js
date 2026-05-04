/**
 * EOTC Voice Studio — Video Renderer
 * 
 * Composes a cinematic 9:16 TikTok/Reels-ready vertical video using FFmpeg:
 *   - Beautiful EOTC background with Ken Burns zoom effect
 *   - Vignette overlay for premium feel
 *   - ASS subtitle overlay for animated captions
 *   - Voice audio mixed as primary track
 *   - 30fps, H.264, 1080x1920
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
  // Quality presets
  presets: {
    fast: { crf: 28, preset: 'veryfast', bitrate: '2M' },
    high: { crf: 20, preset: 'medium', bitrate: '5M' },
    ultra: { crf: 16, preset: 'slow', bitrate: '8M' }
  }
};

/**
 * Find the FFmpeg binary — try npm package first, then system
 */
async function findFFmpeg() {
  try {
    // Try @ffmpeg-installer/ffmpeg
    const installer = await import('@ffmpeg-installer/ffmpeg');
    if (installer.path && fs.existsSync(installer.path)) {
      console.log(`   🔧 Using npm FFmpeg: ${installer.path}`);
      return installer.path;
    }
  } catch (e) {
    // Not installed via npm
  }
  
  // Try system ffmpeg
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    console.log('   🔧 Using system FFmpeg');
    return 'ffmpeg';
  } catch (e) {
    throw new Error(
      'FFmpeg not found! Install via:\n' +
      '  npm install @ffmpeg-installer/ffmpeg\n' +
      '  OR: sudo apt-get install ffmpeg'
    );
  }
}

// Cached FFmpeg path
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
      { encoding: 'utf-8' }
    ).trim();
    return parseFloat(result);
  } catch (e) {
    console.warn('⚠️ Could not detect audio duration, using caption duration');
    return null;
  }
}

/**
 * Ensure background image exists
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
  
  // Generate a simple gradient background with FFmpeg
  console.log('   🎨 Generating background with FFmpeg...');
  fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
  const ffmpegBin = await getFFmpegPath();
  
  try {
    execSync(
      `"${ffmpegBin}" -y -f lavfi -i "color=c=0x0a0a0f:s=1080x1920:d=1" ` +
      `-vf "drawbox=x=0:y=0:w=1080:h=960:c=0x0a0a0f@1:t=fill,` +
      `drawbox=x=0:y=960:w=1080:h=960:c=0x1a1520@1:t=fill,` +
      `gblur=sigma=80" ` +
      `-frames:v 1 "${bgPath}"`,
      { stdio: 'pipe' }
    );
  } catch (e) {
    // Fallback: simple solid color
    execSync(
      `"${ffmpegBin}" -y -f lavfi -i "color=c=0x0a0a0f:s=1080x1920:d=1" -frames:v 1 "${bgPath}"`,
      { stdio: 'pipe' }
    );
  }
  
  console.log('   ✅ Background generated');
  return bgPath;
}

/**
 * Run FFmpeg with full pipeline
 */
async function renderVideo(audioPath, assPath, bgPath, quality = 'high') {
  const outputDir = path.join(ROOT, 'output');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'tiktok_ready.mp4');
  
  const preset = CONFIG.presets[quality] || CONFIG.presets.high;
  const duration = getAudioDuration(audioPath);
  const ffmpegBin = await getFFmpegPath();
  
  console.log(`\n🎬 Rendering video...`);
  console.log(`   📐 Resolution: ${CONFIG.width}x${CONFIG.height}`);
  console.log(`   🎞️ FPS: ${CONFIG.fps}`);
  console.log(`   📊 Quality: ${quality} (CRF ${preset.crf}, ${preset.preset})`);
  if (duration) console.log(`   ⏱️ Duration: ${duration.toFixed(1)}s`);
  
  // Build the FFmpeg filter complex
  const durationArg = duration ? duration + 1 : 300; // Max 5 min fallback
  
  // Escape path for ASS filter (handle Windows/Linux paths)
  const assPathEscaped = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
  
  const filterComplex = [
    `[0:v]scale=1296:2304,`,
    `zoompan=z='1.1-0.1*on/(${Math.round(durationArg * CONFIG.fps)})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(durationArg * CONFIG.fps)}:s=${CONFIG.width}x${CONFIG.height}:fps=${CONFIG.fps},`,
    `vignette=PI/4:mode=forward,`,
    `colorbalance=rm=0.04:gm=-0.01:bm=-0.04,`,
    `ass='${assPathEscaped}'`,
    `[vout]`
  ].join('');
  
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
  
  return new Promise((resolve, reject) => {
    console.log('\n   🔄 FFmpeg processing...\n');
    
    const ffmpeg = spawn(ffmpegBin, ffmpegArgs, {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stderr = '';
    let lastProgress = '';
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      // Parse progress
      const timeMatch = data.toString().match(/time=(\d+:\d+:\d+\.\d+)/);
      if (timeMatch && timeMatch[1] !== lastProgress) {
        lastProgress = timeMatch[1];
        process.stdout.write(`\r   ⏳ Progress: ${lastProgress}`);
      }
    });
    
    ffmpeg.on('close', (code) => {
      console.log(''); // New line after progress
      
      if (code !== 0) {
        console.error('\n❌ FFmpeg error output:');
        console.error(stderr.slice(-2000)); // Last 2000 chars of error
        reject(new Error(`FFmpeg exited with code ${code}`));
        return;
      }
      
      // Verify output
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
  const audioIdx = args.indexOf('--audio');
  const qualityIdx = args.indexOf('--quality');
  const styleIdx = args.indexOf('--style');
  
  let audioPath = audioIdx !== -1 ? args[audioIdx + 1] : null;
  const quality = qualityIdx !== -1 ? args[qualityIdx + 1] : 'high';
  const style = styleIdx !== -1 ? args[styleIdx + 1] : (process.env.CAPTION_STYLE || 'word-highlight');
  
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
