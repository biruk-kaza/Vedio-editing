/**
 * EOTC Voice Studio — Netflix-Grade Video Caption Overlay
 * 
 * ═══ DESIGN PHILOSOPHY ═══
 * 
 * Inspired by Apple TV+, Netflix, and HBO Max subtitle systems.
 * 
 * 1. NO per-word highlighting — all words appear uniformly at full brightness
 * 2. Cinematic spring entry from below with subtle blur reveal
 * 3. Premium frosted glass pill with organic breathing
 * 4. Silky-smooth line transitions — each line dissolves out, next slides in
 * 5. Constant 700 weight, zero layout jitter, zero visual noise
 * 6. Typography: large, crisp, high-contrast with double shadow stack
 */
import React, { useMemo } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  AbsoluteFill,
  Easing,
} from 'remotion';
import { theme } from '../utils/theme.js';

// ═══ CONFIG ═══
const WORDS_PER_LINE = 4;
const FONT_SIZE = 72;
const LINE_HEIGHT = 1.45;

function groupWordsIntoLines(words, max) {
  const lines = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= max) {
      lines.push({
        words: [...cur],
        text: cur.map(w => w.word).join(' '),
        start: cur[0].start,
        end: cur[cur.length - 1].end,
      });
      cur = [];
    }
  }
  if (cur.length) {
    lines.push({
      words: [...cur],
      text: cur.map(w => w.word).join(' '),
      start: cur[0].start,
      end: cur[cur.length - 1].end,
    });
  }
  return lines;
}

/* ═══════════════════════════════════════════════
   CAPTION LINE — Netflix-Grade Subtitle Block
   
   NO per-word highlighting.
   The entire line appears as one solid, uniform,
   perfectly legible block of text.
   ═══════════════════════════════════════════════ */
const CaptionLine = ({ line, fps }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();
  const pageDurFrames = Math.ceil((line.end - line.start) * fps);

  // ── ENTRY: Cinematic spring slide-up ──
  // Tight, critically-damped spring — zero bounce, pure silk
  const enterSpring = spring({
    frame,
    fps: configFps,
    config: { damping: 28, stiffness: 200, mass: 0.6 },
    durationInFrames: 14,
  });

  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const entryY = interpolate(enterSpring, [0, 1], [18, 0]);
  const entryBlur = interpolate(enterSpring, [0, 1], [4, 0]); // Subtle blur reveal
  const entryScale = interpolate(enterSpring, [0, 1], [0.96, 1.0]);

  // ── EXIT: Smooth dissolve upward ──
  const exitStart = pageDurFrames + 2;
  const exitProgress = interpolate(
    frame,
    [exitStart, exitStart + 10],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }
  );
  const exitOpacity = 1 - exitProgress;
  const exitY = interpolate(exitProgress, [0, 1], [0, -8]);
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 1.02]);

  const totalOpacity = entryOpacity * exitOpacity;
  if (totalOpacity < 0.01) return null;

  const totalY = entryY + exitY;
  const totalScale = entryScale * exitScale;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>

      {/* ── CINEMATIC BOTTOM GRADIENT ──
          Deep, smooth gradient that makes text pop on ANY video content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)',
          opacity: totalOpacity,
        }}
      />

      {/* ── PERFECT CENTER CONTAINER ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '22%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: totalOpacity,
          transform: `translateY(${totalY}px) scale(${totalScale})`,
          filter: entryBlur > 0.1 ? `blur(${entryBlur}px)` : 'none',
          willChange: 'transform, opacity, filter',
        }}
      >
        {/* ── FROSTED GLASS PILL ──
            Apple-style glassmorphism with organic inner glow */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0 14px',
            padding: '18px 36px',
            borderRadius: 20,
            background: 'rgba(10, 10, 10, 0.5)',
            backdropFilter: 'blur(16px) saturate(160%)',
            WebkitBackdropFilter: 'blur(16px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: `
              0 16px 48px rgba(0, 0, 0, 0.6),
              0 4px 12px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.04)
            `,
            maxWidth: '90%',
          }}
        >
          {/* ── UNIFORM TEXT — No highlighting, every word identical ── */}
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.97)',
              fontSize: FONT_SIZE,
              fontFamily: theme.fonts.caption,
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: LINE_HEIGHT,
              letterSpacing: '0.5px',
              textShadow: `
                0 2px 6px rgba(0, 0, 0, 0.95),
                0 0 2px rgba(0, 0, 0, 0.9),
                0 8px 20px rgba(0, 0, 0, 0.4)
              `,
              WebkitTextStroke: '1px rgba(0, 0, 0, 0.3)',
              paintOrder: 'stroke fill',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            {line.text}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════ */
export const VideoCaptionOverlay = ({ words = [] }) => {
  const { fps } = useVideoConfig();

  const lines = useMemo(
    () => groupWordsIntoLines(words, WORDS_PER_LINE),
    [words]
  );

  return (
    <AbsoluteFill style={{ zIndex: 10, pointerEvents: 'none' }}>
      {lines.map((line, i) => {
        const startFrame = Math.floor(line.start * fps) - 2;
        const endFrame = Math.floor(line.end * fps) + 14;
        const duration = Math.max(1, endFrame - startFrame);

        return (
          <Sequence
            key={`caption-${i}`}
            from={Math.max(0, startFrame)}
            durationInFrames={duration}
          >
            <CaptionLine line={line} fps={fps} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
