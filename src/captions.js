/**
 * EOTC Voice Studio — ASS/SSA Subtitle Generator
 * 
 * Generates Advanced SubStation Alpha (.ass) subtitles from word timestamps.
 * Features:
 *   - TikTok-style word-by-word highlighting
 *   - Gold (#D4A574) active word with glow
 *   - Dimmed previous words
 *   - Large centered Noto Sans Ethiopic font
 *   - Glassmorphism text backdrop
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadCaptions, groupWordsIntoLines } from './transcribe.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ═══════════════════════════════════════════
// Color Palette (ASS uses &HBBGGRR& format)
// ═══════════════════════════════════════════
const COLORS = {
  // Gold highlight: #D4A574 → BGR = 74A5D4
  goldActive: '&H0074A5D4&',
  // Bright white for current line
  white: '&H00FFFFFF&',
  // Dimmed grey for past words: #8888AA → BGR = AA8888
  dimmed: '&H00AA8888&',
  // Shadow/outline: dark with gold tint
  shadow: '&H80000008&',
  // Glow color for active word: gold with transparency
  glow: '&H4074A5D4&',
  // Background box: semi-transparent dark
  boxBg: '&HA0140A08&',
  // Transparent
  transparent: '&H00000000&'
};

/**
 * Convert seconds to ASS timestamp format: H:MM:SS.cc (centiseconds)
 */
function toAssTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const cs = Math.floor((s % 1) * 100);
  const si = Math.floor(s);
  return `${h}:${String(m).padStart(2, '0')}:${String(si).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

/**
 * Generate the ASS script header with styles
 */
function generateHeader() {
  return `[Script Info]
Title: EOTC Voice Studio Captions
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: ActiveWord,Noto Sans Ethiopic,72,${COLORS.goldActive},${COLORS.white},${COLORS.shadow},${COLORS.boxBg},-1,0,0,0,100,100,2,0,1,4,2,5,80,80,450,1
Style: DimWord,Noto Sans Ethiopic,68,${COLORS.dimmed},${COLORS.white},${COLORS.shadow},${COLORS.boxBg},0,0,0,0,100,100,1,0,1,3,1,5,80,80,450,1
Style: GlowWord,Noto Sans Ethiopic,76,${COLORS.goldActive},${COLORS.glow},${COLORS.glow},${COLORS.transparent},-1,0,0,0,105,105,2,0,1,8,0,5,80,80,450,1
Style: LineText,Noto Sans Ethiopic,64,${COLORS.white},${COLORS.white},${COLORS.shadow},${COLORS.boxBg},0,0,0,0,100,100,1,0,1,3,1,5,80,80,450,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
}

/**
 * Build a line with word-by-word highlighting using ASS override tags.
 * The active word gets gold + glow + scale, others stay dimmed.
 */
function buildWordHighlightEvents(lines) {
  const events = [];
  
  for (const line of lines) {
    const { words } = line;
    
    for (let activeIdx = 0; activeIdx < words.length; activeIdx++) {
      const activeWord = words[activeIdx];
      const start = toAssTime(activeWord.start);
      const end = toAssTime(activeWord.end);
      
      // Build the text with inline overrides
      let text = '';
      for (let i = 0; i < words.length; i++) {
        if (i === activeIdx) {
          // Active word: gold, bold, slightly larger, with glow
          text += `{\\c${COLORS.goldActive}\\b1\\fscx110\\fscy110\\bord5\\3c${COLORS.glow}}${words[i].word}{\\r}`;
        } else if (i < activeIdx) {
          // Past word: dimmed
          text += `{\\c${COLORS.dimmed}\\b0\\fscx100\\fscy100}${words[i].word}{\\r}`;
        } else {
          // Future word: white but slightly transparent
          text += `{\\c&H60FFFFFF&\\b0\\fscx100\\fscy100}${words[i].word}{\\r}`;
        }
        
        if (i < words.length - 1) text += ' ';
      }
      
      // Main text layer
      events.push(
        `Dialogue: 0,${start},${end},LineText,,0,0,0,,${text}`
      );
      
      // Glow layer behind the active word (separate layer for the glow effect)
      const glowText = words.map((w, i) => {
        if (i === activeIdx) {
          return `{\\c${COLORS.glow}\\blur6\\fscx115\\fscy115}${w.word}{\\r}`;
        }
        return `{\\alpha&HFF&}${w.word}{\\r}`; // Invisible
      }).join(' ');
      
      events.push(
        `Dialogue: -1,${start},${end},GlowWord,,0,0,0,,${glowText}`
      );
    }
  }
  
  return events;
}

/**
 * Build karaoke-fill style events (text fills in gold as spoken)
 */
function buildKaraokeFillEvents(lines) {
  const events = [];
  
  for (const line of lines) {
    const lineStart = toAssTime(line.start);
    const lineEnd = toAssTime(line.end + 0.5); // Small buffer
    
    // Build karaoke timing string
    let karaokeText = '';
    let prevEnd = line.start;
    
    for (const word of line.words) {
      const duration = Math.round((word.end - word.start) * 100); // centiseconds
      const gap = Math.round((word.start - prevEnd) * 100);
      
      if (gap > 0) {
        karaokeText += `{\\k${gap}}`;
      }
      karaokeText += `{\\kf${duration}}${word.word} `;
      prevEnd = word.end;
    }
    
    events.push(
      `Dialogue: 0,${lineStart},${lineEnd},ActiveWord,,0,0,0,,${karaokeText.trim()}`
    );
  }
  
  return events;
}

/**
 * Build fade-in style events (each word fades in when spoken)
 */
function buildFadeInEvents(lines) {
  const events = [];
  
  for (const line of lines) {
    for (let i = 0; i < line.words.length; i++) {
      const word = line.words[i];
      const start = toAssTime(Math.max(0, word.start - 0.1));
      const end = toAssTime(line.end + 0.3);
      
      // Position each word with slight offset
      const xOffset = 540; // Center X
      
      events.push(
        `Dialogue: 0,${start},${end},ActiveWord,,0,0,0,,{\\fad(200,300)\\an5}${line.words.slice(0, i + 1).map(w => w.word).join(' ')}`
      );
    }
  }
  
  return events;
}

/**
 * Main: Generate ASS subtitle file
 */
export function generateASS(words, style = 'word-highlight') {
  console.log(`🎨 Generating ASS subtitles (style: ${style})...`);
  
  const lines = groupWordsIntoLines(words, 4);
  console.log(`   📝 ${words.length} words → ${lines.length} display lines`);
  
  let events;
  switch (style) {
    case 'karaoke-fill':
      events = buildKaraokeFillEvents(lines);
      break;
    case 'fade-in':
      events = buildFadeInEvents(lines);
      break;
    case 'word-highlight':
    default:
      events = buildWordHighlightEvents(lines);
      break;
  }
  
  const assContent = generateHeader() + events.join('\n') + '\n';
  
  const outputPath = path.join(ROOT, 'output', 'captions.ass');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, assContent, 'utf-8');
  
  console.log(`   ✅ Written to ${outputPath} (${events.length} events)`);
  return outputPath;
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    // Parse --style argument
    const styleIdx = process.argv.indexOf('--style');
    const style = styleIdx !== -1 ? process.argv[styleIdx + 1] : 'word-highlight';
    
    const captions = loadCaptions();
    generateASS(captions.words, style);
    
    console.log('\n✅ ASS subtitle generation complete!');
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
}
