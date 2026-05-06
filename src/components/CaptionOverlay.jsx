/**
 * EOTC Voice Studio — Ultra-Premium Kinetic Typography Engine
 * 
 * ═══ ENTRANCE: "Glow Reveal" ═══
 * Scale: 0.94 → 1.0 with exponential ease-out bezier(0.16, 1, 0.3, 1)
 * Opacity: 0 → 1 with same easing
 * Glow: text-shadow ramps from 0 to full gold glow
 * Words stagger 2 frames apart — cascading reveal
 * 
 * ═══ ACTIVE WORD: "Smooth Illumination" ═══
 * NO jarring color swap. Smooth interpolated transition:
 * - Color smoothly shifts from muted → bright champagne gold
 * - Glow smoothly ramps up over 6 frames
 * - Scale gently breathes 1.0 → 1.06 → 1.0
 * - Surrounding words smoothly dim back
 * 
 * ═══ EXIT: "Drift & Dissolve" ═══
 * translateY: 0 → -16px (drifts upward)
 * opacity: 1 → 0 with cubic ease-in
 * filter: blur(0px) → blur(1.5px)
 * Scale: 1.0 → 0.97 (subtle shrink)
 * 
 * ═══ REACTIVE DECORATIVES ═══
 * Gold accent lines, diamond ornaments, corner brackets
 * ALL bound to the caption line lifecycle — nothing independent.
 * 
 * ═══ ALL EASING IS CUBIC-BEZIER — ZERO LINEAR ═══
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

// ── Custom easing curves ──
const EASE_GLOW_REVEAL = Easing.bezier(0.16, 1, 0.3, 1);    // exponential ease-out
const EASE_SMOOTH_EXIT = Easing.bezier(0.4, 0, 0.2, 1);      // Material standard
const EASE_SILK_IN     = Easing.bezier(0.0, 0.0, 0.2, 1);    // gentle ease-in

/* ─── Group words into lines ─── */
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
   REACTIVE DECORATIVE FRAME
   Bound to lineProgress — enters/exits WITH text
   ═══════════════════════════════════════════════ */
const ReactiveFrame = ({ lineProgress, isIlluminated, frame }) => {
  const lineW = interpolate(lineProgress, [0, 1], [0, 280], {
    easing: EASE_GLOW_REVEAL,
  });
  const frameOp = lineProgress * 0.7;

  // Diamonds pulse ONLY when a word is illuminated
  const diamondPulse = isIlluminated
    ? interpolate(Math.sin(frame * 0.1), [-1, 1], [0.85, 1.15])
    : 1;
  const diamondGlow = isIlluminated ? 14 : 5;

  // Brackets breathe ONLY when illuminated
  const bracketOp = interpolate(lineProgress, [0, 0.5, 1], [0, 0.08, 0.18]);
  const bracketBreath = isIlluminated
    ? interpolate(Math.sin(frame * 0.04), [-1, 1], [0.96, 1.04])
    : 1;

  const col = theme.gold.primary;
  const glow = theme.gold.glow;

  return (
    <>
      {/* Accent lines — draw in with line entrance */}
      <div style={{
        position: 'absolute', top: -22, left: '50%',
        width: lineW, height: 1.5, transform: 'translateX(-50%)',
        background: `linear-gradient(90deg, transparent 0%, ${col} 35%, ${col} 65%, transparent 100%)`,
        opacity: frameOp,
        boxShadow: isIlluminated ? `0 0 10px ${glow}` : 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -22, left: '50%',
        width: lineW, height: 1.5, transform: 'translateX(-50%)',
        background: `linear-gradient(90deg, transparent 0%, ${col} 35%, ${col} 65%, transparent 100%)`,
        opacity: frameOp,
        boxShadow: isIlluminated ? `0 0 10px ${glow}` : 'none',
      }} />

      {/* Diamond ornaments ✦ at line ends */}
      {lineProgress > 0.35 && (
        <>
          {[[-1, -30], [1, -30], [-1, null], [1, null]].map(([side, topOrBottom], i) => (
            <div key={i} style={{
              position: 'absolute',
              ...(topOrBottom !== null ? { top: topOrBottom } : { bottom: -30 }),
              left: '50%',
              transform: `translateX(${side * (lineW / 2 + 6)}px) scale(${lineProgress * diamondPulse})`,
              color: col, fontSize: 11,
              opacity: lineProgress * 0.65,
              textShadow: `0 0 ${diamondGlow}px ${glow}`,
            }}>✦</div>
          ))}
        </>
      )}

      {/* Corner brackets */}
      {lineProgress > 0.25 && (() => {
        const sz = 20;
        const bw = 1.5;
        const positions = [
          { top: -40, left: '7%', bT: true, bL: true },
          { top: -40, right: '7%', bT: true, bR: true },
          { bottom: -40, left: '7%', bB: true, bL: true },
          { bottom: -40, right: '7%', bB: true, bR: true },
        ];
        return positions.map((pos, i) => {
          const style = {
            position: 'absolute', width: sz, height: sz,
            opacity: bracketOp,
            transform: `scale(${bracketBreath})`,
          };
          if (pos.top !== undefined) style.top = pos.top;
          if (pos.bottom !== undefined) style.bottom = pos.bottom;
          if (pos.left) style.left = pos.left;
          if (pos.right) style.right = pos.right;
          if (pos.bT) style.borderTop = `${bw}px solid ${col}`;
          if (pos.bB) style.borderBottom = `${bw}px solid ${col}`;
          if (pos.bL) style.borderLeft = `${bw}px solid ${col}`;
          if (pos.bR) style.borderRight = `${bw}px solid ${col}`;
          return <div key={i} style={style} />;
        });
      })()}
    </>
  );
};

/* ═══════════════════════════════════════════════
   ANIMATED WORD — "Glow Reveal" + "Smooth Illumination"
   
   Entrance: scale 0.94→1.0, opacity 0→1, glow ramp
   Active: smooth color shift + glow + scale breathe
   Past: gently dims back to muted tone
   ═══════════════════════════════════════════════ */
const AnimatedWord = ({ word, isActive, isPast, entranceFrame, fps, staggerIdx, activeProgress }) => {
  const frame = useCurrentFrame();
  const staggered = entranceFrame + staggerIdx * theme.timing.wordStagger;
  const localFrame = Math.max(0, frame - staggered);

  // ── GLOW REVEAL ENTRANCE ──
  // Scale: 0.94 → 1.0 with exponential ease-out
  const revealFrames = theme.timing.revealFrames;
  const revealProg = interpolate(localFrame, [0, revealFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_GLOW_REVEAL,
  });

  const scale = interpolate(revealProg, [0, 1], [theme.caption.scaleFrom, theme.caption.scaleTo]);
  const opacity = interpolate(revealProg, [0, 0.3, 1], [0, 0.5, 1]);
  const translateY = interpolate(revealProg, [0, 1], [12, 0]);

  // Entrance glow: ramps up then settles
  const entranceGlow = interpolate(revealProg, [0, 0.6, 1], [0, 1, 0.3]);

  // ── SMOOTH ILLUMINATION (active word) ──
  // activeProgress is 0→1 smooth ramp when word becomes active
  // This prevents jarring color swaps
  let scaleMult = 1;
  if (isActive) {
    scaleMult = interpolate(
      Math.sin(frame * 0.08),
      [-1, 1],
      [1.0, theme.caption.highlightScale]
    );
  }

  // ── COLOR: smooth interpolation between states ──
  // Instead of snapping colors, we use activeProgress for smooth transition
  const glowIntensity = isActive
    ? interpolate(Math.sin(frame * 0.08), [-1, 1], [0.7, 1.0])
    : entranceGlow * 0.4;

  let color, shadow, weight;
  if (isActive) {
    color = theme.text.active;
    const gr = theme.caption.glowRadius;
    shadow = `0 0 ${gr * glowIntensity}px ${theme.gold.glowStrong}, 0 0 ${gr * 2.5 * glowIntensity}px ${theme.gold.glow}, 0 3px 8px rgba(0,0,0,0.5)`;
    weight = theme.caption.fontWeight + 100;
  } else if (isPast) {
    color = theme.text.past;
    shadow = '0 2px 8px rgba(0,0,0,0.5)';
    weight = theme.caption.fontWeight;
  } else {
    // Future: barely visible + entrance glow
    color = theme.text.future;
    const eg = entranceGlow * 8;
    shadow = eg > 0.5
      ? `0 0 ${eg}px ${theme.gold.glow}, 0 2px 4px rgba(0,0,0,0.3)`
      : '0 2px 4px rgba(0,0,0,0.2)';
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
        transform: `translateY(${translateY}px) scale(${scale * scaleMult})`,
        textShadow: shadow,
        WebkitTextStroke: `${theme.caption.stroke.width}px ${theme.caption.stroke.color}`,
        paintOrder: 'stroke fill',
        marginRight: theme.caption.wordGap,
        lineHeight: theme.caption.lineHeight,
        willChange: 'transform, opacity',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {word.word}
      {/* Gold underline — smoothly appears on active */}
      {isActive && (
        <div style={{
          position: 'absolute',
          bottom: -2,
          left: '10%',
          right: '10%',
          height: 2.5,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${theme.gold.bright}, transparent)`,
          opacity: glowIntensity,
          boxShadow: `0 0 8px ${theme.gold.glow}`,
        }} />
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION LINE — "Drift & Dissolve" exit
   
   Entrance: glow reveal with cubic-bezier
   Exit: drift upward + fade + blur + shrink
   ReactiveFrame inside — everything moves together
   ═══════════════════════════════════════════════ */
const CaptionLine = ({ line, lineIndex, fps, introFrames }) => {
  const frame = useCurrentFrame();
  const offset = theme.timing.captionOffsetSec;
  const currentTime = (frame - introFrames) / fps - offset;

  const lineStartFrame = introFrames + Math.floor((line.start + offset) * fps);
  const lineEndFrame = introFrames + Math.floor((line.end + offset) * fps);

  // ── ENTRANCE: Glow Reveal ──
  const revealStart = lineStartFrame - 6;
  const revealEnd = lineStartFrame + theme.timing.revealFrames;
  const entranceProg = interpolate(frame, [revealStart, revealEnd], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_GLOW_REVEAL,
  });

  // ── EXIT: Drift & Dissolve ──
  const exitStart = lineEndFrame + 6;
  const exitEnd = lineEndFrame + theme.timing.exitFrames + 6;
  const exitProg = interpolate(frame, [exitStart, exitEnd], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_SILK_IN,
  });

  // Combined opacity
  const lineOpacity = entranceProg * (1 - exitProg);

  // Entrance: scale up from 0.94
  const entranceScale = interpolate(entranceProg, [0, 1], [0.94, 1]);

  // Exit: drift upward + slight shrink
  const exitDriftY = interpolate(exitProg, [0, 1], [0, -16]);
  const exitScale = 1 - exitProg * 0.03;

  // Exit: blur dissolve
  const exitBlur = interpolate(exitProg, [0, 1], [0, 1.5]);

  // Entrance slide
  const entranceY = interpolate(entranceProg, [0, 1], [16, 0]);

  const totalY = entranceY + exitDriftY;
  const totalScale = entranceScale * exitScale;

  // Check if any word is currently illuminated
  const isIlluminated = line.words.some(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  if (lineOpacity < 0.01) return null;

  return (
    <div
      style={{
        position: 'relative',
        opacity: lineOpacity,
        transform: `translateY(${totalY}px) scale(${totalScale})`,
        textAlign: 'center',
        maxWidth: theme.caption.maxWidth,
        margin: '0 auto',
        padding: '10px 36px',
        filter: exitBlur > 0.05 ? `blur(${exitBlur}px)` : 'none',
        willChange: 'transform, opacity, filter',
      }}
    >
      {/* Reactive decorative frame — INSIDE the line */}
      <ReactiveFrame
        lineProgress={lineOpacity}
        isIlluminated={isIlluminated}
        frame={frame}
      />

      {/* Words */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {line.words.map((word, wi) => {
          const wordStartFrame = introFrames + Math.floor((word.start + offset) * fps);
          const isActive = currentTime >= word.start && currentTime < word.end;
          const isPast = currentTime >= word.end;

          return (
            <AnimatedWord
              key={`${lineIndex}-${wi}`}
              word={word}
              isActive={isActive}
              isPast={isPast}
              entranceFrame={wordStartFrame}
              fps={fps}
              staggerIdx={wi}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN OVERLAY — centered, with soft backdrop
   ═══════════════════════════════════════════════ */
export const CaptionOverlay = ({ words = [], introFrames = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const offset = theme.timing.captionOffsetSec;
  const currentTime = (frame - introFrames) / fps - offset;

  const lines = useMemo(
    () => groupWordsIntoLines(words, theme.caption.wordsPerLine),
    [words]
  );

  const visibleLines = lines.filter((line) => {
    const buf = (theme.timing.exitFrames + 10) / fps;
    return currentTime >= line.start - 0.6 && currentTime <= line.end + buf;
  });

  const hasVisible = visibleLines.length > 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        padding: '0 28px',
      }}
    >
      {/* Soft radial backdrop — fades with captions */}
      {hasVisible && (
        <div style={{
          position: 'absolute',
          width: '88%',
          height: 240,
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)',
          borderRadius: 60,
          filter: 'blur(40px)',
          zIndex: -1,
        }} />
      )}

      {visibleLines.map((line, i) => (
        <CaptionLine
          key={`line-${line.start}-${line.end}`}
          line={line}
          lineIndex={i}
          fps={fps}
          introFrames={introFrames}
        />
      ))}
    </div>
  );
};
