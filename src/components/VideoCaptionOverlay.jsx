/**
 * EOTC Voice Studio — Broadcast-Grade Video Caption Overlay
 * 
 * Design: CENTERED, CLEAN, PROFESSIONAL
 * 
 * - Flexbox-centered text (never drifts to side)
 * - Semi-transparent backdrop pill for guaranteed readability
 * - 8-frame butter-smooth highlight ramp
 * - Active word: bright white, 3% scale
 * - Clean entry/exit: opacity + 6px slide
 * - NO glow, NO blur, NO gimmicks
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

const HIGHLIGHT_RAMP = 8;

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
   CLEAN WORD — Pure, crisp, zero artifacts
   ═══════════════════════════════════════════════ */
const CleanWord = ({ word, wi, absoluteTimeSec, fps }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();

  const rampSec = HIGHLIGHT_RAMP / fps;

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

  const opacity = interpolate(
    progress, [0, 1],
    [isPast ? 0.6 : 0.35, 1.0]
  );
  const scale = interpolate(progress, [0, 1], [1.0, 1.04]);
  const fontWeight = progress > 0.5 ? 700 : 600;

  // ── PREMIUM SUBTLE STAGGER ──
  const enterSpring = spring({
    frame: frame - wi * 2, // 2-frame stagger
    fps: configFps,
    config: { damping: 18, stiffness: 140, mass: 0.5 },
    durationInFrames: 12,
  });

  const entryY = interpolate(enterSpring, [0, 1], [15, 0]);
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  return (
    <span
      style={{
        display: 'inline-block',
        color: `rgba(255, 255, 255, ${opacity * entryOpacity})`,
        fontSize: 78,
        fontFamily: theme.fonts.caption,
        fontWeight,
        transform: `translateY(${entryY}px) scale(${scale})`,
        transformOrigin: 'center bottom',
        textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.8)',
        WebkitTextStroke: '1.5px rgba(0,0,0,0.4)',
        paintOrder: 'stroke fill',
        margin: '0 8px',
        lineHeight: 1.4,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {word.word}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION LINE — Perfectly centered with backdrop
   ═══════════════════════════════════════════════ */
const CaptionLine = ({ line, fps }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();
  const pageDurFrames = Math.ceil((line.end - line.start) * fps);

  // Entry: smooth spring (no bounce)
  const enterSpring = spring({
    frame,
    fps: configFps,
    config: { damping: 22, stiffness: 120, mass: 0.5 },
    durationInFrames: 12,
  });
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const entryY = interpolate(enterSpring, [0, 1], [8, 0]);

  // Exit: smooth fade
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
      {/* Gradient backdrop for readability */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background:
            'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)',
          opacity: totalOpacity,
        }}
      />

      {/* ── PERFECT CENTER CONTAINER ──
          Uses flexbox to guarantee horizontal + vertical centering.
          The text never drifts to the side. */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '25%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: totalOpacity,
          transform: `translateY(${entryY + exitY}px)`,
          willChange: 'transform, opacity',
        }}
      >
          {/* ── PREMIUM FROSTED GLASS PILL ── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 32px',
            borderRadius: 24,
            background: 'rgba(15, 15, 15, 0.45)',
            backdropFilter: 'blur(12px) saturate(140%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
            maxWidth: '92%',
          }}
        >
          {line.words.map((word, wi) => (
            <CleanWord
              key={`${line.start}-${wi}`}
              word={word}
              wi={wi}
              absoluteTimeSec={absoluteTimeSec}
              fps={fps}
            />
          ))}
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
