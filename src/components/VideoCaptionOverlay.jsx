/**
 * EOTC Voice Studio — Broadcast-Grade Video Caption Overlay
 * 
 * Design Philosophy: LESS IS MORE
 * 
 * - NO glow effects (causes blur in renders)
 * - NO metallic gradients (causes glitches)
 * - NO gold underlines (looks cheap)
 * - NO excessive scale animations (distracting)
 * 
 * INSTEAD:
 * - Crisp white text on semi-transparent dark backdrop
 * - Smooth 8-frame highlight ramp (butter-smooth)
 * - Active word: bright white, subtle 3% scale
 * - Inactive: softly dimmed, zero visual noise
 * - Professional entry/exit: simple opacity + 6px slide
 * 
 * This is the approach used by Netflix, Apple, and
 * broadcast television. Clean. Readable. Perfect.
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

// Smooth 8-frame ramp = ~0.27s at 30fps — ultra-smooth transitions
const HIGHLIGHT_RAMP = 8;

// Group words into fixed-size lines
function groupWordsIntoLines(words, max) {
  const lines = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= max) {
      lines.push({
        words: [...cur],
        start: cur[0].start,
        end: cur[cur.length - 1].end,
      });
      cur = [];
    }
  }
  if (cur.length) {
    lines.push({
      words: [...cur],
      start: cur[0].start,
      end: cur[cur.length - 1].end,
    });
  }
  return lines;
}

/* ═══════════════════════════════════════════════
   CLEAN WORD — Broadcast-grade highlighting
   
   The ONLY thing that changes is:
   1. Opacity (0.45 → 1.0)
   2. Scale (1.0 → 1.03)
   3. Color temperature (cool gray → pure white)
   
   That's it. No glow. No blur. No gimmicks.
   ═══════════════════════════════════════════════ */
const CleanWord = ({ word, absoluteTimeSec, fps }) => {
  const rampSec = HIGHLIGHT_RAMP / fps;

  // Smooth envelope: ramps up before word, holds, ramps down after
  const rampIn = interpolate(
    absoluteTimeSec,
    [word.start - rampSec, word.start],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const rampOut = interpolate(
    absoluteTimeSec,
    [word.end, word.end + rampSec],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const progress = Math.min(rampIn, rampOut);

  const isPast = absoluteTimeSec > word.end + rampSec;

  // Opacity: future words are dim, active is full, past is slightly bright
  const opacity = interpolate(
    progress,
    [0, 1],
    [isPast ? 0.65 : 0.4, 1.0]
  );

  // Scale: barely perceptible pop (3%) — enough to feel, not enough to distract
  const scale = interpolate(progress, [0, 1], [1.0, 1.03]);

  // Font weight: subtle thickening
  const fontWeight = progress > 0.5 ? 700 : 600;

  return (
    <span
      style={{
        display: 'inline-block',
        color: `rgba(255, 255, 255, ${opacity})`,
        fontSize: 76,
        fontFamily: theme.fonts.caption,
        fontWeight,
        transform: `scale(${scale})`,
        transformOrigin: 'center bottom',
        // Clean, tight drop shadow for separation — NO blur glow
        textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.7)',
        WebkitTextStroke: '1.5px rgba(0,0,0,0.35)',
        paintOrder: 'stroke fill',
        marginRight: 16,
        lineHeight: 1.45,
        transition: 'font-weight 0.15s',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {word.word}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION LINE — Bottom-third with backdrop
   ═══════════════════════════════════════════════ */
const CaptionLine = ({ line, fps }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();
  const pageDurFrames = Math.ceil((line.end - line.start) * fps);

  // Entry: gentle spring-in (no bounce)
  const enterSpring = spring({
    frame,
    fps: configFps,
    config: { damping: 22, stiffness: 120, mass: 0.5 },
    durationInFrames: 12,
  });
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const entryY = interpolate(enterSpring, [0, 1], [6, 0]);

  // Exit: smooth ease-out fade
  const exitStart = pageDurFrames + 4;
  const exitProgress = interpolate(
    frame,
    [exitStart, exitStart + 8],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }
  );
  const exitOpacity = 1 - exitProgress;
  const exitY = exitProgress * 6;

  const totalOpacity = entryOpacity * exitOpacity;
  if (totalOpacity < 0.01) return null;

  const absoluteTimeSec = line.start + frame / fps;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Gradient backdrop — ensures readability on any video */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '28%',
          background:
            'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)',
          opacity: totalOpacity,
        }}
      />

      {/* Text container — centered, bottom 15% */}
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '4%',
          right: '4%',
          textAlign: 'center',
          opacity: totalOpacity,
          transform: `translateY(${entryY + exitY}px)`,
          willChange: 'transform, opacity',
        }}
      >
        {line.words.map((word, wi) => (
          <CleanWord
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
   MAIN EXPORT — Video Caption Overlay
   ═══════════════════════════════════════════════ */
export const VideoCaptionOverlay = ({ words = [] }) => {
  const { fps } = useVideoConfig();

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
