/**
 * EOTC Voice Studio — Transcription Module
 * 
 * Local transcription helper using Whisper.
 * On GitHub Actions, we use Python's openai-whisper directly (more reliable for Amharic).
 * This module handles parsing and validation of transcription output.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

/**
 * Parse captions_review.txt back into structured word data.
 * This is used when the user has manually edited the review file.
 * 
 * Expected format per line:
 *   [0.000 → 0.500]  word
 */
export function parseReviewFile(reviewPath) {
  const content = fs.readFileSync(reviewPath, 'utf-8');
  const lines = content.split('\n');
  const words = [];
  
  // Match lines like: [0.000 → 0.500]  word
  const wordPattern = /^\[(\d+\.?\d*)\s*→\s*(\d+\.?\d*)\]\s+(.+)$/;
  
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(wordPattern);
    if (match) {
      words.push({
        word: match[3].trim(),
        start: parseFloat(match[1]),
        end: parseFloat(match[2])
      });
    }
  }
  
  if (words.length === 0) {
    throw new Error('No word timestamps found in captions_review.txt. File may be corrupted.');
  }
  
  return words;
}

/**
 * Load captions from the best available source.
 * Priority: captions_review.txt > captions.json
 */
export function loadCaptions() {
  const reviewPath = path.join(ROOT, 'captions_review.txt');
  const jsonPath = path.join(ROOT, 'captions.json');
  
  // Try reviewed captions first
  if (fs.existsSync(reviewPath)) {
    try {
      console.log('📖 Loading from captions_review.txt (user-reviewed)...');
      const words = parseReviewFile(reviewPath);
      console.log(`   ✅ Loaded ${words.length} words from review file`);
      
      // Also try to get full text from JSON if available
      let fullText = words.map(w => w.word).join(' ');
      if (fs.existsSync(jsonPath)) {
        try {
          const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
          if (json.full_text) fullText = json.full_text;
        } catch (e) {
          // Use word-joined text
        }
      }
      
      return {
        source: 'review',
        words,
        fullText,
        totalDuration: words.length > 0 ? words[words.length - 1].end : 0
      };
    } catch (err) {
      console.warn(`⚠️ Failed to parse review file: ${err.message}`);
      console.log('   Falling back to captions.json...');
    }
  }
  
  // Fallback to JSON
  if (fs.existsSync(jsonPath)) {
    console.log('📖 Loading from captions.json...');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    if (!data.words || data.words.length === 0) {
      throw new Error('captions.json has no word timestamps. Re-run transcription.');
    }
    
    console.log(`   ✅ Loaded ${data.words.length} words from JSON`);
    return {
      source: 'json',
      words: data.words,
      fullText: data.full_text || '',
      totalDuration: data.total_duration || 0
    };
  }
  
  throw new Error(
    'No caption files found!\n' +
    'Run Phase 1 (Transcribe) first, or ensure captions.json / captions_review.txt exist.'
  );
}

/**
 * Group words into display lines for subtitle rendering.
 * Groups ~3-5 words per line for readability.
 */
export function groupWordsIntoLines(words, maxWordsPerLine = 4) {
  const lines = [];
  let currentLine = [];
  
  for (const word of words) {
    currentLine.push(word);
    
    if (currentLine.length >= maxWordsPerLine) {
      lines.push({
        words: [...currentLine],
        start: currentLine[0].start,
        end: currentLine[currentLine.length - 1].end,
        text: currentLine.map(w => w.word).join(' ')
      });
      currentLine = [];
    }
  }
  
  // Don't forget the last partial line
  if (currentLine.length > 0) {
    lines.push({
      words: [...currentLine],
      start: currentLine[0].start,
      end: currentLine[currentLine.length - 1].end,
      text: currentLine.map(w => w.word).join(' ')
    });
  }
  
  return lines;
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const captions = loadCaptions();
    console.log('\n📊 Caption Summary:');
    console.log(`   Source: ${captions.source}`);
    console.log(`   Words: ${captions.words.length}`);
    console.log(`   Duration: ${captions.totalDuration.toFixed(1)}s`);
    console.log(`   Text preview: ${captions.fullText.substring(0, 100)}...`);
    
    const lines = groupWordsIntoLines(captions.words);
    console.log(`   Lines: ${lines.length}`);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
}
