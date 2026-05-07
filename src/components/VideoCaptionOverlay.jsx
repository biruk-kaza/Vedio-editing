/**
 * EOTC Voice Studio — Video Caption Overlay
 * 
 * Clean, bottom-third caption style for video overlays.
 * Text is pinned to lower 20% of screen.
 * 
 * ═══ SILKY SMOOTH WORD HIGHLIGHTING ═══
 * Instead of binary isActive (true/false), we compute a
 * continuous activeProgress (0.0 → 1.0 → 0.0) that smoothly
 * ramps over ~4 frames. ALL visual properties (color, scale,
 * glow, underline) are driven by this float via interpolate().
 * 
 * Result: The highlight FLOWS like liquid across words.
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

// Smooth ramp duration (frames) for highlight transition
const HIGHLIGHT_RAMP = 4;

function groupWordsIntoLines(words, max) {
  const lines = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= max) {
      lines.push({ words: [...cur], start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    }
  }
  if (cur.length) {
    lines.push({ words: [...cur], start: cur[0].start, end: cur[cur.length - 1].end });
  }
  return lines;
}

/* ═══════════════════════════════════════════════
   SMOOTH WORD — Continuous activeProgress float
   
   activeProgress:
   0.0 = fully inactive (gray)
   1.0 = fully active (bright white)
   
   Ramps up 4 frames before word.start,
   holds at 1.0 during word,
   ramps down 4 frames after word.end.
   ═══════════════════════════════════════════════ */
const SmoothWord = ({ word, absoluteTimeSec, fps }) => {
  // ── Compute continuous activeProgress (0→1→0) ──
  const rampSec = HIGHLIGHT_RAMP / fps; // ~0.13s at 30fps
  const wordStart = word.start;
  const wordEnd = word.end;

  // Ramp up: starts rampSec before word, reaches 1.0 at word.start
  const rampIn = interpolate(
    absoluteTimeSec,
    [wordStart - rampSec, wordStart],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Ramp down: starts at word.end, reaches 0 at word.end + rampSec
  const rampOut = interpolate(
    absoluteTimeSec,
    [wordEnd, wordEnd + rampSec],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Combined: min of rampIn and rampOut gives the smooth envelope
  const activeProgress = Math.min(rampIn, rampOut);

  // Past word (already spoken): subtle dim
  const isPast = absoluteTimeSec > wordEnd + rampSec;

  // ── Derive ALL properties from activeProgress ──
  // Color: smooth blend from gray to white
  const r = interpolate(activeProgress, [0, 1], [isPast ? 190 : 160, 255]);
  const g = interpolate(activeProgress, [0, 1], [isPast ? 185 : 155, 255]);
  const b = interpolate(activeProgress, [0, 1], [isPast ? 180 : 150, 255]);
  const alpha = interpolate(activeProgress, [0, 1], [isPast ? 0.6 : 0.32, 1.0]);

  // Scale: smooth pop
  const scale = interpolate(activeProgress, [0, 1], [1.0, 1.08]);

  // Glow: smooth ramp
  const glowRadius = interpolate(activeProgress, [0, 1], [0, 16]);
  const glowOpacity = interpolate(activeProgress, [0, 1], [0, 0.4]);

  // Underline opacity
  const underlineOp = interpolate(activeProgress, [0, 0.5, 1], [0, 0.3, 0.9]);

  // Font weight
  const fontWeight = Math.round(interpolate(activeProgress, [0, 1], [600, 800]));

  return (
    <span style={{
      display: 'inline-block', position: 'relative',
      color: `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`,
      fontSize: 52, fontFamily: theme.fonts.caption,
      fontWeight,
      transform: `scale(${scale})`,
      textShadow: glowRadius > 0.5
        ? `0 0 ${glowRadius}px rgba(212,175,55,${glowOpacity}), 0 2px 8px rgba(0,0,0,0.6)`
        : '0 2px 8px rgba(0,0,0,0.6)',
      WebkitTextStroke: '1px rgba(0,0,0,0.3)',
      paintOrder: 'stroke fill',
      marginRight: 16,
      lineHeight: 1.4,
      willChange: 'transform, color',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {word.word}
      {/* Smooth underline */}
      {underlineOp > 0.05 && (
        <div style={{
          position: 'absolute', bottom: -4,
          left: '5%', right: '5%', height: 3,
          borderRadius: 2,
          background: theme.gold.metallic,
          opacity: underlineOp,
          boxShadow: `0 0 8px rgba(212,175,55,${underlineOp * 0.5})`,
        }} />
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION LINE — Bottom-third, clean, centered
   ═══════════════════════════════════════════════ */
const CaptionLine = ({ line, fps }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();
  const pageStartSec = line.start;
  const pageDurFrames = Math.ceil((line.end - line.start) * fps);

  // Entrance: gentle scale pop
  const enterSpring = spring({
    frame, fps: configFps,
    config: { damping: 16, stiffness: 140, mass: 0.4 },
    durationInFrames: 14,
  });
  const entryScale = interpolate(enterSpring, [0, 1], [0.92, 1.0]);
  const entryY = interpolate(enterSpring, [0, 1], [12, 0]);
  const entryOpacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Exit: smooth fade down
  const exitStart = pageDurFrames + 2;
  const exitProgress = interpolate(frame, [exitStart, exitStart + 8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const exitOpacity = 1 - exitProgress;
  const exitY = exitProgress * 8;

  const totalOpacity = entryOpacity * exitOpacity;
  if (totalOpacity < 0.01) return null;

  // Absolute time for word highlighting
  const absoluteTimeSec = pageStartSec + (frame / fps);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Dark gradient behind captions for readability */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
        opacity: totalOpacity,
      }} />

      {/* Caption container — bottom 20% */}
      <div style={{
        position: 'absolute', bottom: '10%', left: '5%', right: '5%',
        textAlign: 'center',
        opacity: totalOpacity,
        transform: `translateY(${entryY + exitY}px) scale(${entryScale})`,
        willChange: 'transform, opacity',
      }}>
        {line.words.map((word, wi) => (
          <SmoothWord
            key={`${line.start}-${wi}`}
            word={word}
            absoluteTimeSec={absoluteTimeSec}
            fps={fps}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   MAIN CAPTION OVERLAY — Video mode
   ═══════════════════════════════════════════════ */
export const VideoCaptionOverlay = ({ words = [] }) => {
  const { fps } = useVideoConfig();

  // For video: use 4 words per line (more text visible at once)
  const lines = useMemo(
    () => groupWordsIntoLines(words, 4),
    [words]
  );

  return (
    <AbsoluteFill style={{ zIndex: 10, pointerEvents: 'none' }}>
      {lines.map((line, i) => {
        const startFrame = Math.floor(line.start * fps) - 3;
        const endFrame = Math.floor(line.end * fps) + 12;
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
