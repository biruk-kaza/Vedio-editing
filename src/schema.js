/**
 * EOTC Voice Studio — Zod Schema for Input Props
 * 
 * Type-safe props for CLI rendering:
 *   npx remotion render src/index.jsx EOTCVideo out.mp4 --props='{"title":"My Video"}'
 * 
 * All fields are validated at render time. Invalid props = clear error message.
 */
import { z } from 'zod';

export const eotcVideoSchema = z.object({
  // ── Caption words from Whisper transcription ──
  words: z.array(z.object({
    word: z.string(),
    start: z.number(),
    end: z.number(),
  })).default([]),

  // ── Audio filename (in public/ directory) ──
  audioFileName: z.string().default(''),

  // ── Video filename (in public/ directory, for caption mode) ──
  videoFileName: z.string().default(''),

  // ── Mode: 'kinetic' (dark bg) or 'caption' (video overlay) ──
  mode: z.enum(['kinetic', 'caption']).default('kinetic'),

  // ── Display title for intro sequence ──
  title: z.string().default('EOTC Voice Studio'),

  // ── Duration metadata (set by prepare-render.js) ──
  totalDuration: z.number().default(5),
  totalSeconds: z.number().default(12),

  // ── Brand customization ──
  brandColors: z.object({
    goldPrimary: z.string().default('#c9a96e'),
    goldBright: z.string().default('#e8d5a3'),
    bgDeep: z.string().default('#030305'),
  }).default({}),

  // ── Optional background image URL ──
  backgroundImageUrl: z.string().optional(),

  // ── Show/hide progress bar ──
  showProgressBar: z.boolean().default(true),
});
