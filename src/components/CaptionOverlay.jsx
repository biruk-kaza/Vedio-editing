/**
 * EOTC Voice Studio — Maximum Cinematic Kinetic Typography
 * 
 * ═══ 3D SPATIAL KINETICS ═══
 * 
 * 1. DYNAMIC PLACEMENT (Z-Space Tracking)
 *    Text blocks don't just appear dead-center.
 *    Each phrase has a unique offset (X, Y, RotZ) based on its index.
 *    This forces the viewer's eye to move, creating high-end dynamic pacing.
 * 
 * 2. CONTINUOUS PUSH
 *    While a phrase is on screen, it slowly pushes forward in Z-space
 *    and drifts slightly, preventing any static moments.
 * 
 * 3. 3D HINGE ENTRY
 *    Words swing into view using rotateX(-85deg -> 0deg) combined
 *    with the previous translateY and scale. 
 * 
 * 4. SPRING BRACKETS
 *    Brackets dynamically fit the text width and track with the
 *    3D transforms of the text block.
 */
import React, { useMemo } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { theme } from '../utils/theme.js';

const EASE_GLOW_REVEAL = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_SILK_IN     = Easing.bezier(0.0, 0.0, 0.2, 1);

const CHAR_WIDTH_PX = 41;
const MIN_BRACKET_WIDTH = 120;
const MAX_BRACKET_WIDTH = 640;
const BRACKET_PADDING = 60;

function estimateLineWidth(words) {
  const chars = words.reduce((s, w) => s + w.word.length, 0);
  const gaps = Math.max(0, words.length - 1) * theme.caption.wordGap;
  return Math.max(MIN_BRACKET_WIDTH, Math.min(MAX_BRACKET_WIDTH, chars * CHAR_WIDTH_PX + gaps + BRACKET_PADDING));
}

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
   SPRING-LOADED DYNAMIC BRACKETS
   ═══════════════════════════════════════════════ */
const DynamicBrackets = ({ bracketSpring, targetWidth, isIlluminated, frame }) => {
  const lineW = interpolate(bracketSpring, [0, 1], [0, targetWidth]);
  const frameOp = interpolate(bracketSpring, [0, 0.3, 1], [0, 0.35, 0.7]);

  const diamondPulse = isIlluminated
    ? interpolate(Math.sin(frame * 0.1), [-1, 1], [0.88, 1.12])
    : 1;
  const diamondGlow = isIlluminated ? 14 : 5;

  const bracketScale = interpolate(bracketSpring, [0, 1], [0.15, 1]);
  const bracketOp = interpolate(bracketSpring, [0, 0.4, 1], [0, 0.05, 0.20]);
  const bracketBreath = isIlluminated
    ? interpolate(Math.sin(frame * 0.04), [-1, 1], [0.96, 1.04])
    : 1;

  const bracketInset = Math.max(20, (920 - targetWidth) / 2 - 10);

  const col = theme.gold.primary;
  const glow = theme.gold.glow;
  const bw = 1.5;
  const sz = 22;

  return (
    <>
      <div style={{ position: 'absolute', top: -22, left: '50%', width: lineW, height: 1.5, transform: 'translateX(-50%)', background: `linear-gradient(90deg, transparent 0%, ${col} 30%, ${col} 70%, transparent 100%)`, opacity: frameOp, boxShadow: isIlluminated ? `0 0 10px ${glow}` : 'none' }} />
      <div style={{ position: 'absolute', bottom: -22, left: '50%', width: lineW, height: 1.5, transform: 'translateX(-50%)', background: `linear-gradient(90deg, transparent 0%, ${col} 30%, ${col} 70%, transparent 100%)`, opacity: frameOp, boxShadow: isIlluminated ? `0 0 10px ${glow}` : 'none' }} />

      {bracketSpring > 0.35 && (
        <>
          {[[-1, 'top'], [1, 'top'], [-1, 'bottom'], [1, 'bottom']].map(([side, vert], i) => (
            <div key={i} style={{ position: 'absolute', ...(vert === 'top' ? { top: -30 } : { bottom: -30 }), left: '50%', transform: `translateX(${side * (lineW / 2 + 6)}px) scale(${bracketSpring * diamondPulse})`, color: col, fontSize: 11, opacity: bracketSpring * 0.6, textShadow: `0 0 ${diamondGlow}px ${glow}` }}>✦</div>
          ))}
        </>
      )}

      {bracketSpring > 0.12 && (
        <>
          <div style={{ position: 'absolute', top: -40, left: bracketInset, width: sz, height: sz, opacity: bracketOp, borderTop: `${bw}px solid ${col}`, borderLeft: `${bw}px solid ${col}`, transform: `scale(${bracketScale * bracketBreath})`, transformOrigin: 'top left' }} />
          <div style={{ position: 'absolute', top: -40, right: bracketInset, width: sz, height: sz, opacity: bracketOp, borderTop: `${bw}px solid ${col}`, borderRight: `${bw}px solid ${col}`, transform: `scale(${bracketScale * bracketBreath})`, transformOrigin: 'top right' }} />
          <div style={{ position: 'absolute', bottom: -40, left: bracketInset, width: sz, height: sz, opacity: bracketOp, borderBottom: `${bw}px solid ${col}`, borderLeft: `${bw}px solid ${col}`, transform: `scale(${bracketScale * bracketBreath})`, transformOrigin: 'bottom left' }} />
          <div style={{ position: 'absolute', bottom: -40, right: bracketInset, width: sz, height: sz, opacity: bracketOp, borderBottom: `${bw}px solid ${col}`, borderRight: `${bw}px solid ${col}`, transform: `scale(${bracketScale * bracketBreath})`, transformOrigin: 'bottom right' }} />
        </>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════
   3D WORD-LEVEL ENTRY
   Words swing down like a hinge (rotateX -85 -> 0)
   ═══════════════════════════════════════════════ */
const AnimatedWord = ({ word, isActive, isPast, entranceFrame, fps, staggerIdx }) => {
  const frame = useCurrentFrame();
  const staggered = entranceFrame + staggerIdx * theme.timing.wordStagger;
  const localFrame = Math.max(0, frame - staggered);

  const entryFrames = 15;
  const entryProg = interpolate(localFrame, [0, entryFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_GLOW_REVEAL,
  });

  const scale = interpolate(entryProg, [0, 1], [0.95, 1.0]);
  const opacity = interpolate(entryProg, [0, 0.4, 1], [0, 0.7, 1]);
  const translateY = interpolate(entryProg, [0, 1], [25, 0]);
  
  // 3D Hinge entry
  const rotateX = interpolate(entryProg, [0, 1], [-85, 0]);

  let scaleMult = 1;
  if (isActive) {
    scaleMult = interpolate(Math.sin(frame * 0.08), [-1, 1], [1.0, theme.caption.highlightScale]);
  }

  let filterVal = 'none';
  if (isActive) {
    const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.7, 1.0]);
    filterVal = `brightness(1.35) drop-shadow(0 0 ${theme.caption.glowRadius * glowPulse}px ${theme.gold.glowStrong})`;
  }

  let color, shadow, weight;
  if (isActive) {
    color = theme.text.active;
    shadow = `0 0 ${theme.caption.glowRadius}px ${theme.gold.glow}, 0 3px 6px rgba(0,0,0,0.4)`;
    weight = theme.caption.fontWeight + 100;
  } else if (isPast) {
    color = theme.text.past;
    shadow = '0 2px 6px rgba(0,0,0,0.45)';
    weight = theme.caption.fontWeight;
  } else {
    color = theme.text.future;
    shadow = '0 2px 4px rgba(0,0,0,0.2)';
    weight = theme.caption.fontWeight - 100;
  }

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        color,
        fontSize: theme.caption.fontSize,
        fontFamily: theme.fonts.caption,
        fontWeight: weight,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale * scaleMult}) rotateX(${rotateX}deg)`,
        transformOrigin: '50% 100%', // Hinge from bottom
        textShadow: shadow,
        filter: filterVal,
        WebkitTextStroke: `${theme.caption.stroke.width}px ${theme.caption.stroke.color}`,
        paintOrder: 'stroke fill',
        marginRight: theme.caption.wordGap,
        lineHeight: theme.caption.lineHeight,
        willChange: 'transform, opacity, filter',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {word.word}
      {isActive && (
        <div style={{
          position: 'absolute', bottom: -2, left: '10%', right: '10%', height: 2.5, borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${theme.gold.bright}, transparent)`,
          opacity: 0.8, boxShadow: `0 0 8px ${theme.gold.glow}`,
        }} />
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   DYNAMIC SPATIAL LINE
   Each line is placed at a unique X/Y offset
   and continuously drifts toward the camera.
   ═══════════════════════════════════════════════ */
const CaptionLine = ({ line, lineIndex, fps, introFrames }) => {
  const frame = useCurrentFrame();
  const offset = theme.timing.captionOffsetSec;
  const currentTime = (frame - introFrames) / fps - offset;

  const lineStartFrame = introFrames + Math.floor((line.start + offset) * fps);
  const lineEndFrame = introFrames + Math.floor((line.end + offset) * fps);

  const targetWidth = estimateLineWidth(line.words);

  // ── SPATIAL PLACEMENT ──
  // Alternating positions so the text dances around the center
  const isEven = lineIndex % 2 === 0;
  const placementX = isEven ? 25 : -25;
  const placementY = (lineIndex % 3 === 0) ? -15 : (lineIndex % 3 === 1) ? 0 : 15;
  const placementRotZ = isEven ? 1.2 : -1.2;

  // ── CONTINUOUS DRIFT ──
  // Slowly push towards the camera while on screen
  const continuousZ = interpolate(frame, [lineStartFrame, lineEndFrame], [0, 40], { extrapolateRight: 'clamp' });

  // ── OVERLAPPING ENTRANCE ──
  const overlapFrames = 9;
  const entranceStart = lineStartFrame - overlapFrames;
  const entranceEnd = lineStartFrame + 6;
  const entranceProg = interpolate(frame, [entranceStart, entranceEnd], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_GLOW_REVEAL,
  });

  // ── OVERLAPPING EXIT ──
  const exitStart = lineEndFrame + 3;
  const exitEnd = exitStart + overlapFrames;
  const exitProg = interpolate(frame, [exitStart, exitEnd], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_SILK_IN,
  });

  const lineOpacity = entranceProg * (1 - exitProg);

  // Entry kinetics
  const entranceScale = interpolate(entranceProg, [0, 1], [0.92, 1.0]);
  const entranceY = interpolate(entranceProg, [0, 1], [30, 0]);

  // Exit kinetics (fly past camera)
  const exitDriftY = exitProg * -30;
  const exitScale = 1 + exitProg * 0.15; // grows slightly as it fades
  const exitBlur = exitProg * 2.5;

  const totalY = entranceY + exitDriftY + placementY;
  const totalScale = entranceScale * exitScale;

  const bracketSpring = spring({
    frame: Math.max(0, frame - entranceStart), fps,
    config: { damping: 14, stiffness: 120, mass: 0.5 },
    durationInFrames: 35,
  });
  const bracketVal = bracketSpring * (1 - exitProg);

  const isIlluminated = line.words.some(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  if (lineOpacity < 0.01) return null;

  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top: '50%',
        // Combine placement, drift, entrance, and exit physics
        transform: `translate3d(calc(-50% + ${placementX}px), calc(-50% + ${totalY}px), ${continuousZ}px) scale(${totalScale}) rotateZ(${placementRotZ}deg)`,
        opacity: lineOpacity,
        textAlign: 'center',
        maxWidth: theme.caption.maxWidth,
        margin: '0 auto',
        padding: '10px 36px',
        filter: exitBlur > 0.05 ? `blur(${exitBlur}px)` : 'none',
        willChange: 'transform, opacity, filter',
        transformStyle: 'preserve-3d',
      }}
    >
      <DynamicBrackets bracketSpring={bracketVal} targetWidth={targetWidth} isIlluminated={isIlluminated} frame={frame} />
      <div style={{ position: 'relative', zIndex: 1, transformStyle: 'preserve-3d' }}>
        {line.words.map((word, wi) => {
          const wordStartFrame = introFrames + Math.floor((word.start + offset) * fps);
          const isActive = currentTime >= word.start && currentTime < word.end;
          const isPast = currentTime >= word.end;
          return (
            <AnimatedWord
              key={`${lineIndex}-${wi}`} word={word} isActive={isActive} isPast={isPast} entranceFrame={wordStartFrame} fps={fps} staggerIdx={wi}
            />
          );
        })}
      </div>
    </div>
  );
};

export const CaptionOverlay = ({ words = [], introFrames = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const offset = theme.timing.captionOffsetSec;
  const currentTime = (frame - introFrames) / fps - offset;

  const lines = useMemo(() => groupWordsIntoLines(words, theme.caption.wordsPerLine), [words]);

  const visibleLines = lines.filter((line) => {
    const buf = 22 / fps;
    return currentTime >= line.start - 0.5 && currentTime <= line.end + buf;
  });

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10, pointerEvents: 'none',
      perspective: '1200px', // Establish deep Z-space
    }}>
      <div style={{ position: 'relative', width: '100%', height: 160, maxWidth: theme.caption.maxWidth, transformStyle: 'preserve-3d' }}>
        {visibleLines.map((line, i) => (
          <CaptionLine key={`line-${line.start}-${line.end}`} line={line} lineIndex={i} fps={fps} introFrames={introFrames} />
        ))}
      </div>
    </div>
  );
};
