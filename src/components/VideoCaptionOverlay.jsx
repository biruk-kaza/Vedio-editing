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
   CLEAN WORD — Pure, Snappy, AE-Style Physics
   ═══════════════════════════════════════════════ */
const CleanWord = ({ word, wi, globalFrame, localFrame, fps }) => {
  const { fps: configFps } = useVideoConfig();

  // 100% Accurate Absolute Timing
  const absoluteTimeSec = globalFrame / fps;
  const wordEndPadded = word.end + 0.05; // Hold slightly
  const isCurrent = absoluteTimeSec >= word.start && absoluteTimeSec < wordEndPadded;
  const isPast = absoluteTimeSec >= wordEndPadded;

  // Snappy Color Cut (No mushy ramps)
  const opacity = isCurrent ? 1.0 : (isPast ? 0.75 : 0.4);

  // ── AFTER EFFECTS STYLE SNAPPY HIGHLIGHT SPRING ──
  const wordStartFrame = Math.round(word.start * fps);
  const framesSinceStart = globalFrame - wordStartFrame;
  const wordEndFrame = Math.round(wordEndPadded * fps);
  const framesSinceEnd = globalFrame - wordEndFrame;

  const popSpring = spring({
    frame: framesSinceStart,
    fps: configFps,
    config: { damping: 12, stiffness: 300, mass: 0.4 },
  });
  const downSpring = spring({
    frame: framesSinceEnd,
    fps: configFps,
    config: { damping: 14, stiffness: 250, mass: 0.4 },
  });

  const activeBump = Math.max(0, popSpring - downSpring);
  const scale = 1.0 + activeBump * 0.05; // Subtle 5% pop

  // ── PREMIUM SUBTLE STAGGER ──
  const enterSpring = spring({
    frame: localFrame - wi * 2, // 2-frame stagger
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
        fontWeight: 700, // CONSTANT to prevent layout wobble
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
const CaptionLine = ({ line, fps, seqStartFrame }) => {
  const localFrame = useCurrentFrame();
  const globalFrame = seqStartFrame + localFrame;
  const { fps: configFps } = useVideoConfig();
  const pageDurFrames = Math.ceil((line.end - line.start) * fps);

  // Entry: smooth spring (no bounce)
  const enterSpring = spring({
    frame: localFrame,
    fps: configFps,
    config: { damping: 22, stiffness: 120, mass: 0.5 },
    durationInFrames: 12,
  });
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const entryY = interpolate(enterSpring, [0, 1], [8, 0]);

  // Exit: smooth fade
  const exitStart = pageDurFrames + 4;
  const exitProgress = interpolate(
    localFrame,
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

  // ── AUDIO-REACTIVE GLOW & CONTINUOUS ZOOM ──
  // A very subtle continuous zoom (Ken Burns effect) for the caption container
  const breatheScale = interpolate(localFrame, [0, pageDurFrames + 10], [1.0, 1.05], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
  });
  
  // Audio-reactive ambient glow (simulated using sine waves)
  const reactivePulse = interpolate(Math.sin((globalFrame) * 0.15), [-1, 1], [0.15, 0.4]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', perspective: '1000px' }}>
      {/* Dynamic Audio-Reactive Glow behind the pill */}
      <div
        style={{
          position: 'absolute',
          bottom: '8%',
          left: '50%',
          width: '70%',
          height: '20%',
          transform: `translate(-50%, ${entryY + exitY}px)`,
          background: `radial-gradient(ellipse, rgba(255,255,255,${reactivePulse * totalOpacity}) 0%, transparent 60%)`,
          filter: 'blur(40px)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Gradient backdrop for overall readability */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '35%',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
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
          height: '25%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: totalOpacity,
          transform: `translateY(${entryY + exitY}px) scale(${breatheScale})`,
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
              globalFrame={globalFrame}
              localFrame={localFrame}
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
            <CaptionLine line={line} fps={fps} seqStartFrame={Math.max(0, startFrame)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
