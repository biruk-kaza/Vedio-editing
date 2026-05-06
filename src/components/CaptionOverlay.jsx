/**
 * EOTC Voice Studio — After Effects-Grade Kinetic Typography
 * 
 * ═══ AFTER EFFECTS ANIMATION PRINCIPLES ═══
 * 
 * 1. LOCKED ANCHOR POINT
 *    The text container is fixed-height at screen center.
 *    Text grows downward from a stable baseline.
 *    No vertical jitter when switching between 1-line and 2-line states.
 * 
 * 2. FLUID BRACKET SCALING
 *    Corner brackets and accent lines use spring physics.
 *    They smoothly GLIDE to frame the new text — never snap.
 * 
 * 3. OVERLAPPING TRANSITIONS
 *    No hard cuts. Outgoing line drifts up 12px + fades out over 9 frames.
 *    Incoming line scales 0.95→1.0 + fades in simultaneously.
 *    5-frame overlap window creates continuous flow.
 * 
 * 4. ACTIVE WORD GLOW FILTER
 *    Active word gets CSS filter: brightness(1.4) + drop-shadow blur,
 *    not just a hex color swap.
 * 
 * ═══ ALL MOTION: cubic-bezier / spring — ZERO linear ═══
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
const EASE_GLOW_REVEAL = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_SILK_IN     = Easing.bezier(0.0, 0.0, 0.2, 1);
const EASE_SPRING_OUT  = Easing.bezier(0.34, 1.56, 0.64, 1);

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
   FLUID REACTIVE FRAME
   
   Brackets and accent lines use SPRING PHYSICS
   to smoothly glide to their target dimensions.
   They NEVER snap — always ease into position.
   ═══════════════════════════════════════════════ */
const FluidFrame = ({ entranceSpring, isIlluminated, frame }) => {
  // entranceSpring is a spring value 0→1 with overshoot
  // This drives smooth bracket scaling

  // Accent line width — spring-driven, smooth glide
  const lineW = interpolate(entranceSpring, [0, 1], [0, 280]);
  const frameOp = interpolate(entranceSpring, [0, 0.3, 1], [0, 0.4, 0.7]);

  // Diamond pulse — only when illuminated
  const diamondPulse = isIlluminated
    ? interpolate(Math.sin(frame * 0.1), [-1, 1], [0.88, 1.12])
    : 1;
  const diamondGlow = isIlluminated ? 14 : 5;

  // Bracket dimensions — spring-driven (fluid, never snapping)
  const bracketScale = interpolate(entranceSpring, [0, 1], [0.3, 1]);
  const bracketOp = interpolate(entranceSpring, [0, 0.4, 1], [0, 0.06, 0.20]);
  const bracketBreath = isIlluminated
    ? interpolate(Math.sin(frame * 0.04), [-1, 1], [0.96, 1.04])
    : 1;

  const col = theme.gold.primary;
  const glow = theme.gold.glow;
  const bw = 1.5;
  const sz = 22;

  return (
    <>
      {/* ── ACCENT LINES — spring-animated width ── */}
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

      {/* ── DIAMONDS ✦ — positioned at accent line ends ── */}
      {entranceSpring > 0.35 && (
        <>
          {[[-1, 'top'], [1, 'top'], [-1, 'bottom'], [1, 'bottom']].map(([side, vert], i) => (
            <div key={i} style={{
              position: 'absolute',
              ...(vert === 'top' ? { top: -30 } : { bottom: -30 }),
              left: '50%',
              transform: `translateX(${side * (lineW / 2 + 6)}px) scale(${entranceSpring * diamondPulse})`,
              color: col, fontSize: 11,
              opacity: entranceSpring * 0.6,
              textShadow: `0 0 ${diamondGlow}px ${glow}`,
            }}>✦</div>
          ))}
        </>
      )}

      {/* ── CORNER BRACKETS — fluid spring-scaled ── */}
      {entranceSpring > 0.15 && (
        <>
          {/* Top-left */}
          <div style={{
            position: 'absolute', top: -42, left: '6%',
            width: sz, height: sz, opacity: bracketOp,
            borderTop: `${bw}px solid ${col}`, borderLeft: `${bw}px solid ${col}`,
            transform: `scale(${bracketScale * bracketBreath})`,
            transformOrigin: 'top left',
          }} />
          {/* Top-right */}
          <div style={{
            position: 'absolute', top: -42, right: '6%',
            width: sz, height: sz, opacity: bracketOp,
            borderTop: `${bw}px solid ${col}`, borderRight: `${bw}px solid ${col}`,
            transform: `scale(${bracketScale * bracketBreath})`,
            transformOrigin: 'top right',
          }} />
          {/* Bottom-left */}
          <div style={{
            position: 'absolute', bottom: -42, left: '6%',
            width: sz, height: sz, opacity: bracketOp,
            borderBottom: `${bw}px solid ${col}`, borderLeft: `${bw}px solid ${col}`,
            transform: `scale(${bracketScale * bracketBreath})`,
            transformOrigin: 'bottom left',
          }} />
          {/* Bottom-right */}
          <div style={{
            position: 'absolute', bottom: -42, right: '6%',
            width: sz, height: sz, opacity: bracketOp,
            borderBottom: `${bw}px solid ${col}`, borderRight: `${bw}px solid ${col}`,
            transform: `scale(${bracketScale * bracketBreath})`,
            transformOrigin: 'bottom right',
          }} />
        </>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════
   ANIMATED WORD
   
   Entrance: Glow Reveal (scale 0.94→1.0)
   Active: brightness filter + drop-shadow blur (NOT just color)
   Past: smoothly dims
   ═══════════════════════════════════════════════ */
const AnimatedWord = ({ word, isActive, isPast, entranceFrame, fps, staggerIdx }) => {
  const frame = useCurrentFrame();
  const staggered = entranceFrame + staggerIdx * theme.timing.wordStagger;
  const localFrame = Math.max(0, frame - staggered);

  // Glow Reveal entrance
  const revealProg = interpolate(localFrame, [0, theme.timing.revealFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_GLOW_REVEAL,
  });

  const scale = interpolate(revealProg, [0, 1], [theme.caption.scaleFrom, theme.caption.scaleTo]);
  const opacity = interpolate(revealProg, [0, 0.3, 1], [0, 0.5, 1]);
  const translateY = interpolate(revealProg, [0, 1], [10, 0]);

  // Active word: gentle breathing scale
  let scaleMult = 1;
  if (isActive) {
    scaleMult = interpolate(Math.sin(frame * 0.08), [-1, 1], [1.0, theme.caption.highlightScale]);
  }

  // ── GLOW FILTER on active word (not just hex color) ──
  // Active: brightness boost + gold drop-shadow
  let filterVal = 'none';
  if (isActive) {
    const glowIntensity = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.7, 1.0]);
    filterVal = `brightness(1.35) drop-shadow(0 0 ${theme.caption.glowRadius * glowIntensity}px ${theme.gold.glowStrong})`;
  }

  // Color states
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
        transform: `translateY(${translateY}px) scale(${scale * scaleMult})`,
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
      {/* Gold underline on active word */}
      {isActive && (
        <div style={{
          position: 'absolute', bottom: -2,
          left: '10%', right: '10%', height: 2.5, borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${theme.gold.bright}, transparent)`,
          opacity: 0.8,
          boxShadow: `0 0 8px ${theme.gold.glow}`,
        }} />
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION LINE — with OVERLAPPING TRANSITIONS
   
   • Entrance: 9 frames before line start — overlap with previous exit
   • Exit: begins at line end, 9 frames (0.3s at 30fps)
   • Outgoing: drifts UP 12px + fades out
   • Incoming: scales 0.95→1.0 + fades in
   • 5-frame overlap window with adjacent lines
   • Spring drives the FluidFrame brackets
   ═══════════════════════════════════════════════ */
const CaptionLine = ({ line, lineIndex, fps, introFrames }) => {
  const frame = useCurrentFrame();
  const offset = theme.timing.captionOffsetSec;
  const currentTime = (frame - introFrames) / fps - offset;

  const lineStartFrame = introFrames + Math.floor((line.start + offset) * fps);
  const lineEndFrame = introFrames + Math.floor((line.end + offset) * fps);

  // ── OVERLAPPING ENTRANCE ──
  // Start fading in 9 frames before the line should be visible
  // This overlaps with the previous line's exit by ~5 frames
  const overlapFrames = 9; // 0.3s at 30fps
  const entranceStart = lineStartFrame - overlapFrames;
  const entranceEnd = lineStartFrame + 5;
  const entranceProg = interpolate(frame, [entranceStart, entranceEnd], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_GLOW_REVEAL,
  });

  // ── OVERLAPPING EXIT ──
  // Start exiting a few frames after last word ends
  // Exit takes 9 frames (0.3s) — overlaps with next line entrance
  const exitStart = lineEndFrame + 3;
  const exitEnd = exitStart + overlapFrames;
  const exitProg = interpolate(frame, [exitStart, exitEnd], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_SILK_IN,
  });

  // Combined opacity (entrance fades in, exit fades out)
  const lineOpacity = entranceProg * (1 - exitProg);

  // ── ENTRANCE: scale 0.95 → 1.0 (from below) ──
  const entranceScale = interpolate(entranceProg, [0, 1], [0.95, 1]);
  const entranceY = interpolate(entranceProg, [0, 1], [14, 0]);

  // ── EXIT: drift UP 12px + slight shrink ──
  const exitDriftY = exitProg * -12;
  const exitScale = 1 - exitProg * 0.03;

  // ── EXIT: blur dissolve ──
  const exitBlur = exitProg * 1.5;

  const totalY = entranceY + exitDriftY;
  const totalScale = entranceScale * exitScale;

  // ── SPRING for FluidFrame brackets (smooth glide, not snap) ──
  const bracketSpring = spring({
    frame: Math.max(0, frame - entranceStart),
    fps,
    config: { damping: 18, mass: 0.6, stiffness: 120 },
    durationInFrames: 30,
  });
  // Apply exit fade to bracket spring
  const bracketVal = bracketSpring * (1 - exitProg);

  // Is any word currently illuminated?
  const isIlluminated = line.words.some(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  if (lineOpacity < 0.01) return null;

  return (
    <div
      style={{
        // ABSOLUTE position within the locked container
        // This prevents baseline jitter
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: `translateY(calc(-50% + ${totalY}px)) scale(${totalScale})`,
        opacity: lineOpacity,
        textAlign: 'center',
        maxWidth: theme.caption.maxWidth,
        margin: '0 auto',
        padding: '10px 36px',
        filter: exitBlur > 0.05 ? `blur(${exitBlur}px)` : 'none',
        willChange: 'transform, opacity, filter',
      }}
    >
      {/* FluidFrame — driven by spring, not lineOpacity */}
      <FluidFrame
        entranceSpring={bracketVal}
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
   MAIN OVERLAY — LOCKED ANCHOR POINT
   
   Fixed-height container at screen center.
   Lines are positioned ABSOLUTE inside it.
   The container NEVER moves — only content inside it.
   This eliminates vertical jitter on line transitions.
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
    const buf = (9 + 12) / fps; // overlap + exit frames
    return currentTime >= line.start - 0.5 && currentTime <= line.end + buf;
  });

  const hasVisible = visibleLines.length > 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* ── LOCKED ANCHOR CONTAINER ──
          Fixed height. Never moves. Lines absolute inside.
          This is the anchor point — all text motion is relative to this. */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 160, // Fixed height — prevents vertical jitter
          maxWidth: theme.caption.maxWidth,
        }}
      >
        {/* Soft radial backdrop */}
        {hasVisible && (
          <div style={{
            position: 'absolute',
            top: -50, bottom: -50, left: -60, right: -60,
            background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)',
            borderRadius: 60,
            filter: 'blur(40px)',
            zIndex: -1,
          }} />
        )}

        {/* Lines — absolutely positioned at center of locked container */}
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
    </div>
  );
};
