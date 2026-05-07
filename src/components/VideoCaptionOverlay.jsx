/**
 * EOTC Voice Studio — World-Class Video Caption Overlay
 * 
 * ═══ FEATURE 2: METALLIC TEXT TEXTURE ═══
 * Active words get a moving gradient that simulates light
 * reflecting off gold leaf. The shine position shifts with
 * frame, creating a "living metal" effect.
 * 
 * ═══ FEATURE 4: SMART RHYTHMIC GROUPING ═══
 * Instead of dumb 4-word splits, we detect natural phrase
 * boundaries using time gaps between words. If there's a
 * gap > 0.6s between words, we split there. This keeps
 * "ዳዊት ዘመዳ ኢያቄም ወለዳ" together as one rhythmic unit.
 * 
 * ═══ SILKY SMOOTH WORD HIGHLIGHTING ═══
 * 6-frame ramp activeProgress (0→1→0). ALL properties
 * derived from this single continuous float.
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

const HIGHLIGHT_RAMP = 6;

/* ═══════════════════════════════════════════════
   SMART RHYTHMIC GROUPING
   
   Rules:
   1. If gap between words > 0.6s → new phrase
   2. Max 5 words per phrase (readability)
   3. Min 1 word per phrase
   
   Result: "ዳዊት ዘመዳ ኢያቄም ወለዳ" stays together
   ═══════════════════════════════════════════════ */
function groupWordsByRhythm(words, maxPerLine = 5) {
  if (!words.length) return [];
  const GAP_THRESHOLD = 0.6; // seconds
  const lines = [];
  let cur = [words[0]];

  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    const atMax = cur.length >= maxPerLine;

    if (gap > GAP_THRESHOLD || atMax) {
      lines.push({
        words: [...cur],
        start: cur[0].start,
        end: cur[cur.length - 1].end,
      });
      cur = [words[i]];
    } else {
      cur.push(words[i]);
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
   METALLIC WORD — Gold leaf with moving specular shine
   
   When active, the text gets a CSS gradient that moves
   across the surface, simulating light on metal. The
   gradient angle shifts with frame for a "living" feel.
   ═══════════════════════════════════════════════ */
const MetallicWord = ({ word, absoluteTimeSec, fps, globalFrame }) => {
  const rampSec = HIGHLIGHT_RAMP / fps;
  const wordStart = word.start;
  const wordEnd = word.end;

  const rampIn = interpolate(
    absoluteTimeSec, [wordStart - rampSec, wordStart], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const rampOut = interpolate(
    absoluteTimeSec, [wordEnd, wordEnd + rampSec], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const activeProgress = Math.min(rampIn, rampOut);
  const isPast = absoluteTimeSec > wordEnd + rampSec;
  const isFuture = absoluteTimeSec < wordStart - rampSec;

  // ── Color: white when active, dim when not ──
  const r = interpolate(activeProgress, [0, 1], [isPast ? 200 : isFuture ? 140 : 170, 255]);
  const g = interpolate(activeProgress, [0, 1], [isPast ? 195 : isFuture ? 135 : 165, 255]);
  const b = interpolate(activeProgress, [0, 1], [isPast ? 190 : isFuture ? 130 : 160, 255]);
  const alpha = interpolate(activeProgress, [0, 1], [isPast ? 0.65 : isFuture ? 0.3 : 0.45, 1.0]);

  const scale = interpolate(activeProgress, [0, 1], [1.0, 1.12]);
  const glowRadius = interpolate(activeProgress, [0, 1], [0, 24]);
  const glowOpacity = interpolate(activeProgress, [0, 1], [0, 0.55]);
  const underlineOp = interpolate(activeProgress, [0, 0.4, 1], [0, 0.2, 0.9]);
  const fontWeight = Math.round(interpolate(activeProgress, [0, 1], [600, 800]));

  // ── METALLIC GRADIENT ──
  // The shine angle moves across the text surface over time
  const shineAngle = interpolate(
    Math.sin(globalFrame * 0.015 + wordStart * 2),
    [-1, 1], [110, 160]
  );
  // Shine position shifts — the "hot spot" crawls across
  const shinePosition = interpolate(
    Math.sin(globalFrame * 0.02 + wordStart),
    [-1, 1], [30, 70]
  );

  // When active, use metallic gradient. When not, solid color.
  const useMetallic = activeProgress > 0.1;
  const metallicGradient = useMetallic
    ? `linear-gradient(${Math.round(shineAngle)}deg, 
        rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha}) 0%, 
        rgba(255,245,220,${alpha * (0.6 + activeProgress * 0.4)}) ${Math.round(shinePosition)}%, 
        rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha}) 100%)`
    : 'none';

  return (
    <span style={{
      display: 'inline-block', position: 'relative',
      color: useMetallic ? 'transparent' : `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`,
      background: useMetallic ? metallicGradient : 'none',
      WebkitBackgroundClip: useMetallic ? 'text' : 'unset',
      backgroundClip: useMetallic ? 'text' : 'unset',
      fontSize: 92, fontFamily: theme.fonts.caption,
      fontWeight,
      transform: `scale(${scale})`,
      textShadow: glowRadius > 0.5
        ? `0 0 ${glowRadius}px rgba(212,175,55,${glowOpacity}), 0 0 ${glowRadius * 2.5}px rgba(212,175,55,${glowOpacity * 0.4}), 0 4px 16px rgba(0,0,0,0.85)`
        : '0 4px 16px rgba(0,0,0,0.85)',
      WebkitTextStroke: useMetallic ? '0px transparent' : '3px rgba(0,0,0,0.5)',
      paintOrder: 'stroke fill',
      marginRight: 18,
      lineHeight: 1.5,
      willChange: 'transform, color, background',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {word.word}
      {/* Gold underline */}
      {underlineOp > 0.05 && (
        <div style={{
          position: 'absolute', bottom: -5,
          left: '3%', right: '3%', height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${theme.gold.metallic}, transparent)`,
          opacity: underlineOp,
          boxShadow: `0 0 12px rgba(212,175,55,${underlineOp * 0.6})`,
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
  const { fps: configFps, durationInFrames } = useVideoConfig();
  const pageStartSec = line.start;
  const pageDurFrames = Math.ceil((line.end - line.start) * fps);

  // Global frame for metallic gradient sync
  const globalFrame = Math.floor(pageStartSec * fps) + frame;

  // Entrance: gentle spring
  const enterSpring = spring({
    frame, fps: configFps,
    config: { damping: 16, stiffness: 140, mass: 0.4 },
    durationInFrames: 14,
  });
  const entryScale = interpolate(enterSpring, [0, 1], [0.92, 1.0]);
  const entryY = interpolate(enterSpring, [0, 1], [14, 0]);
  const entryOpacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Exit
  const exitStart = pageDurFrames + 2;
  const exitProgress = interpolate(frame, [exitStart, exitStart + 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const exitOpacity = 1 - exitProgress;
  const exitY = exitProgress * 10;

  const totalOpacity = entryOpacity * exitOpacity;
  if (totalOpacity < 0.01) return null;

  const absoluteTimeSec = pageStartSec + (frame / fps);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Dark gradient for readability */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '32%',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)',
        opacity: totalOpacity,
      }} />

      {/* Caption container */}
      <div style={{
        position: 'absolute', bottom: '14%', left: '3%', right: '3%',
        textAlign: 'center',
        opacity: totalOpacity,
        transform: `translateY(${entryY + exitY}px) scale(${entryScale})`,
        willChange: 'transform, opacity',
      }}>
        {line.words.map((word, wi) => (
          <MetallicWord
            key={`${line.start}-${wi}`}
            word={word}
            absoluteTimeSec={absoluteTimeSec}
            fps={fps}
            globalFrame={globalFrame}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   MAIN CAPTION OVERLAY — Video mode
   ═══════════════════════════════════════════════ */
export const VideoCaptionOverlay = ({ words = [], segments = [] }) => {
  const { fps } = useVideoConfig();

  // SMART grouping: use rhythm-aware splitting
  const lines = useMemo(
    () => groupWordsByRhythm(words, 5),
    [words]
  );

  return (
    <AbsoluteFill style={{ zIndex: 10, pointerEvents: 'none' }}>
      {lines.map((line, i) => {
        const startFrame = Math.floor(line.start * fps) - 4;
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
