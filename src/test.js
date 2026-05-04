/**
 * EOTC Voice Studio — Test Suite
 * 
 * Quick validation tests to ensure all components work correctly.
 * Run: node src/test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Test colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ${GREEN}✓${RESET} ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ${RED}✗${RESET} ${name}`);
    console.log(`    ${RED}${err.message}${RESET}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

console.log(`\n${BOLD}🧪 EOTC Voice Studio — Test Suite${RESET}\n`);

// ═══════════════════════════════════════════
// File Structure Tests
// ═══════════════════════════════════════════
console.log(`${BOLD}📁 File Structure${RESET}`);

test('package.json exists', () => {
  assert(fs.existsSync(path.join(ROOT, 'package.json')));
});

test('package.json has type: module', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
  assert(pkg.type === 'module', `Expected "module", got "${pkg.type}"`);
});

test('GitHub Actions workflows exist', () => {
  assert(fs.existsSync(path.join(ROOT, '.github/workflows/transcribe.yml')));
  assert(fs.existsSync(path.join(ROOT, '.github/workflows/render-video.yml')));
});

test('Source files exist', () => {
  assert(fs.existsSync(path.join(ROOT, 'src/transcribe.js')));
  assert(fs.existsSync(path.join(ROOT, 'src/render.js')));
  assert(fs.existsSync(path.join(ROOT, 'src/captions.js')));
});

test('Template files exist', () => {
  assert(fs.existsSync(path.join(ROOT, 'templates/background.html')));
});

test('input/ directory exists', () => {
  assert(fs.existsSync(path.join(ROOT, 'input')));
});

test('output/ directory exists', () => {
  assert(fs.existsSync(path.join(ROOT, 'output')));
});

// ═══════════════════════════════════════════
// Module Import Tests
// ═══════════════════════════════════════════
console.log(`\n${BOLD}📦 Module Imports${RESET}`);

test('transcribe.js exports loadCaptions', async () => {
  const mod = await import('./transcribe.js');
  assert(typeof mod.loadCaptions === 'function');
  assert(typeof mod.parseReviewFile === 'function');
  assert(typeof mod.groupWordsIntoLines === 'function');
});

test('captions.js exports generateASS', async () => {
  const mod = await import('./captions.js');
  assert(typeof mod.generateASS === 'function');
});

// ═══════════════════════════════════════════
// Caption Parser Tests
// ═══════════════════════════════════════════
console.log(`\n${BOLD}📝 Caption Parsing${RESET}`);

test('parseReviewFile parses timestamps correctly', async () => {
  const { parseReviewFile } = await import('./transcribe.js');
  
  // Create a temp review file
  const tempPath = path.join(ROOT, 'output', '_test_review.txt');
  fs.mkdirSync(path.dirname(tempPath), { recursive: true });
  fs.writeFileSync(tempPath, [
    '═══════════════════════════════════════',
    'WORD-BY-WORD TIMESTAMPS:',
    '═══════════════════════════════════════',
    '[0.000 → 0.500]  ስብሐት',
    '[0.500 → 1.200]  ለእግዚአብሔር',
    '[1.200 → 1.800]  አሜን',
  ].join('\n'), 'utf-8');
  
  const words = parseReviewFile(tempPath);
  assert(words.length === 3, `Expected 3 words, got ${words.length}`);
  assert(words[0].word === 'ስብሐት', `First word should be ስብሐት`);
  assert(words[0].start === 0, `Start should be 0`);
  assert(words[0].end === 0.5, `End should be 0.5`);
  assert(words[2].word === 'አሜን');
  
  // Clean up
  fs.unlinkSync(tempPath);
});

test('groupWordsIntoLines groups correctly', async () => {
  const { groupWordsIntoLines } = await import('./transcribe.js');
  
  const words = [
    { word: 'a', start: 0, end: 1 },
    { word: 'b', start: 1, end: 2 },
    { word: 'c', start: 2, end: 3 },
    { word: 'd', start: 3, end: 4 },
    { word: 'e', start: 4, end: 5 },
  ];
  
  const lines = groupWordsIntoLines(words, 3);
  assert(lines.length === 2, `Expected 2 lines, got ${lines.length}`);
  assert(lines[0].words.length === 3);
  assert(lines[1].words.length === 2);
  assert(lines[0].start === 0);
  assert(lines[0].end === 3);
});

// ═══════════════════════════════════════════
// ASS Subtitle Tests
// ═══════════════════════════════════════════
console.log(`\n${BOLD}🎬 ASS Subtitle Generation${RESET}`);

test('generateASS creates valid .ass file', async () => {
  const { generateASS } = await import('./captions.js');
  
  const testWords = [
    { word: 'ስብሐት', start: 0.0, end: 0.5 },
    { word: 'ለእግዚአብሔር', start: 0.5, end: 1.2 },
    { word: 'አሜን', start: 1.2, end: 1.8 },
  ];
  
  const assPath = generateASS(testWords, 'word-highlight');
  assert(fs.existsSync(assPath), 'ASS file should exist');
  
  const content = fs.readFileSync(assPath, 'utf-8');
  assert(content.includes('[Script Info]'), 'Should have Script Info section');
  assert(content.includes('[V4+ Styles]'), 'Should have Styles section');
  assert(content.includes('[Events]'), 'Should have Events section');
  assert(content.includes('Dialogue:'), 'Should have Dialogue events');
  assert(content.includes('Noto Sans Ethiopic'), 'Should use Ethiopic font');
  assert(content.includes('1080'), 'Should be 1080 width');
  assert(content.includes('1920'), 'Should be 1920 height');
});

// ═══════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════
console.log(`\n${'─'.repeat(40)}`);
console.log(`${BOLD}Results:${RESET} ${GREEN}${passed} passed${RESET}, ${failed > 0 ? RED : ''}${failed} failed${RESET}`);
console.log(`${'─'.repeat(40)}\n`);

if (failed > 0) {
  process.exit(1);
}
