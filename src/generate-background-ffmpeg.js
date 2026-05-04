/**
 * EOTC Voice Studio — FFmpeg-only Background Generator
 * 
 * Generates a stunning dark gradient background with gold accents
 * using pure FFmpeg (no Puppeteer needed). Works on GitHub Actions.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function generateBackgroundFFmpeg() {
  console.log('🎨 Generating EOTC background with FFmpeg...');

  const outputPath = path.join(ROOT, 'assets', 'background.png');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // If background already exists, skip
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    if (stats.size > 10000) {
      console.log('   ✅ Background already exists, skipping generation');
      return outputPath;
    }
  }

  try {
    // Create a rich dark gradient background with multiple layers:
    // Layer 1: Base dark color
    // Layer 2: Radial gradient glow (gold center)
    // Layer 3: Vignette darkening
    // Layer 4: Subtle noise texture
    const filterComplex = [
      // Base: deep dark background
      'color=c=0x0a0a0f:s=1080x1920:d=1[base]',
      // Gold radial glow in the center
      'color=c=0xD4A574:s=1080x1920:d=1,',
      'format=rgba,',
      'geq=r=212*(1-sqrt((X-540)*(X-540)+(Y-960)*(Y-960))/1100):',
      'g=165*(1-sqrt((X-540)*(X-540)+(Y-960)*(Y-960))/1100):',
      'b=116*(1-sqrt((X-540)*(X-540)+(Y-960)*(Y-960))/1100):',
      'a=25*(1-clip(sqrt((X-540)*(X-540)+(Y-960)*(Y-960))/700\\,0\\,1))',
      '[glow]',
      // Merge base + glow
      '[base][glow]overlay=format=auto[merged]',
      // Add vignette
      '[merged]vignette=PI/3.5[final]'
    ].join(';');

    execSync(
      `ffmpeg -y -f lavfi -i "${filterComplex}" -map "[final]" -frames:v 1 "${outputPath}"`,
      { stdio: 'pipe', timeout: 30000 }
    );

    console.log(`   ✅ Background saved: ${outputPath}`);
  } catch (e) {
    console.warn('   ⚠️ Complex background failed, using simple gradient...');
    // Simpler fallback
    try {
      execSync(
        `ffmpeg -y -f lavfi -i "color=c=0x0a0a0f:s=1080x1920:d=1" ` +
        `-vf "vignette=PI/4" -frames:v 1 "${outputPath}"`,
        { stdio: 'pipe', timeout: 15000 }
      );
      console.log(`   ✅ Fallback background saved: ${outputPath}`);
    } catch (e2) {
      // Last resort: solid color
      execSync(
        `ffmpeg -y -f lavfi -i "color=c=0x0a0a0f:s=1080x1920:d=1" -frames:v 1 "${outputPath}"`,
        { stdio: 'pipe', timeout: 10000 }
      );
      console.log(`   ✅ Solid background saved: ${outputPath}`);
    }
  }

  return outputPath;
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateBackgroundFFmpeg();
}

export default generateBackgroundFFmpeg;
