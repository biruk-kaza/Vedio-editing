/**
 * EOTC Voice Studio — Background Generator (Puppeteer)
 * Renders EOTC-themed background from HTML template using headless Chrome.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function generateBackground() {
  console.log('🖼️ Generating EOTC background with Puppeteer...');
  
  const outputPath = path.join(ROOT, 'assets', 'background.png');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  const templatePath = path.join(ROOT, 'templates', 'background.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  
  const html = fs.readFileSync(templatePath, 'utf-8');
  
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch (e) {
    console.log('⚠️ Puppeteer not available, using FFmpeg fallback');
    const { execSync } = await import('child_process');
    execSync(
      `ffmpeg -y -f lavfi -i "color=c=0x0a0a0f:s=1080x1920:d=1" -frames:v 1 "${outputPath}"`,
      { stdio: 'pipe' }
    );
    return outputPath;
  }
  
  const browser = await puppeteer.default.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
    console.log(`   ✅ Background saved to ${outputPath}`);
    return outputPath;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateBackground().catch(err => { console.error(`❌ ${err.message}`); process.exit(1); });
}

export default generateBackground;
