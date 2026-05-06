/**
 * EOTC Voice Studio — After Effects-Grade Kinetic Typography
 * 
 * ═══ EXACT MOTION DESIGN SPECS ═══
 * 
 * 1. SPRING PHYSICS (no CSS transitions)
 *    All motion uses Remotion's spring() and interpolate() with
 *    custom cubic-bezier easing. Zero linear animations.
 * 
 * 2. KINETIC ENTRY (15 frames)
 *    - Y-axis: +20px → 0px
 *    - Scale: 0.95 → 1.0
 *    - SkewY: 5deg → 0deg (pops out of background)
 *    - Opacity: 0 → 1
 *    - Easing: bezier(0.16, 1, 0.3, 1) — exponential ease-out
 * 
 * 3. EXIT OVERLAP
 *    - Y-axis: 0 → -20px (drifts up)
 *    - Opacity: 1 → 0
 *    - Scale: 1.0 → 0.97
 *    - Blur: 0 → 1.5px
 *    - Overlaps next phrase entrance by 5 frames
 * 
 * 4. SPRING-LOADED BRACKETS
 *    - Width dynamically computed from text character count
 *    - Animated via spring({ damping: 14, stiffness: 120 })
 *    - Slight bounce on entrance
 * 
 * 5. WORD-LEVEL HIGHLIGHTING
 *    - Each word tracked by its own start/end timestamps
 *    - Active: smooth gold color + brightness(1.35) filter + drop-shadow
 *    - Inactive: muted white/grey
 *    - No jarring color snaps — smooth interpolated transition
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

// ── Dynamic bracket sizing ──
const CHAR_WIDTH_PX = 41; // Amharic avg at 68px font
const MIN_BRACKET_WIDTH = 120;
const MAX_BRACKET_WIDTH = 640;
const BRACKET_PADDING = 60;

function estimateLineWidth(words) {
  const chars = words.reduce((s, w) => s + w.word.length, 0);
  const gaps = Math.max(0, words.length - 1) * theme.caption.wordGap;
  return Math.max(MIN_BRACKET_WIDTH, Math.min(MAX_BRACKET_WIDTH, chars * CHAR_WIDTH_PX + gaps + BRACKET_PADDING));
}

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
   SPRING-LOADED DYNAMIC BRACKETS
   
   spring({ damping: 14, stiffness: 120 })
   Width computed from character count — animates with bounce
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
      {/* DYNAMIC ACCENT LINES — width tracks text block */}
      <div style={{
        position: 'absolute', top: -22, left: '50%',
        width: lineW, height: 1.5, transform: 'translateX(-50%)',
        background: `linear-gradient(90deg, transparent 0%, ${col} 30%, ${col} 70%, transparent 100%)`,
        opacity: frameOp,
        boxShadow: isIlluminated ? `0 0 10px ${glow}` : 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -22, left: '50%',
        width: lineW, height: 1.5, transform: 'translateX(-50%)',
        background: `linear-gradient(90deg, transparent 0%, ${col} 30%, ${col} 70%, transparent 100%)`,
        opacity: frameOp,
        boxShadow: isIlluminated ? `0 0 10px ${glow}` : 'none',
      }} />

      {/* DIAMONDS at accent endpoints */}
      {bracketSpring > 0.35 && (
        <>
          {[[-1, 'top'], [1, 'top'], [-1, 'bottom'], [1, 'bottom']].map(([side, vert], i) => (
            <div key={i} style={{
              position: 'absolute',
              ...(vert === 'top' ? { top: -30 } : { bottom: -30 }),
              left: '50%',
              transform: `translateX(${side * (lineW / 2 + 6)}px) scale(${bracketSpring * diamondPulse})`,
              color: col, fontSize: 11,
              opacity: bracketSpring * 0.6,
              textShadow: `0 0 ${diamondGlow}px ${glow}`,
            }}>✦</div>
          ))}
        </>
      )}

      {/* CORNER BRACKETS — spring-scaled from corners */}
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
   WORD-LEVEL ANIMATED WORD
   
   Each word independently tracked by start/end timestamps.
   Active: gold + brightness filter + drop-shadow glow
   Inactive: muted grey/white
   ═══════════════════════════════════════════════ */
const AnimatedWord = ({ word, isActive, isPast, entranceFrame, fps, staggerIdx }) => {
  const frame = useCurrentFrame();
  const staggered = entranceFrame + staggerIdx * theme.timing.wordStagger;
  const localFrame = Math.max(0, frame - staggered);

  // ── KINETIC ENTRY over 15 frames ──
  // Y: +20px → 0
  // Scale: 0.95 → 1.0
  // SkewY: 5deg → 0deg
  // Opacity: 0 → 1
  const entryFrames = 15;
  const entryProg = interpolate(localFrame, [0, entryFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_GLOW_REVEAL,
  });

  const scale = interpolate(entryProg, [0, 1], [0.95, 1.0]);
  const opacity = interpolate(entryProg, [0, 0.3, 1], [0, 0.5, 1]);
  const translateY = interpolate(entryProg, [0, 1], [20, 0]);
  const skewY = interpolate(entryProg, [0, 1], [5, 0]);

  // Active breathing scale
  let scaleMult = 1;
  if (isActive) {
    scaleMult = interpolate(Math.sin(frame * 0.08), [-1, 1], [1.0, theme.caption.highlightScale]);
  }

  // ── ACTIVE WORD: brightness filter + gold drop-shadow glow ──
  let filterVal = 'none';
  if (isActive) {
    const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.7, 1.0]);
    filterVal = `brightness(1.35) drop-shadow(0 0 ${theme.caption.glowRadius * glowPulse}px ${theme.gold.glowStrong})`;
  }

  // ── COLOR: smooth word-level highlighting ──
  // Active: champagne gold with text-shadow glow
  // Inactive past: muted slightly transparent white
  // Inactive future: barely visible grey
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
        transform: `translateY(${translateY}px) scale(${scale * scaleMult}) skewY(${skewY}deg)`,
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
   CAPTION LINE — overlapping kinetic transitions
   
   Enter: Y +20→0, scale 0.95→1.0, skewY 5→0, opacity 0→1, over 15 frames
   Exit:  Y 0→-20, scale 1.0→0.97, opacity 1→0, blur 0→1.5px
   Overlap: 5-frame window between phrases
   Brackets: spring({ damping: 14, stiffness: 120 })
   ═══════════════════════════════════════════════ */
const CaptionLine = ({ line, lineIndex, fps, introFrames }) => {
  const frame = useCurrentFrame();
  const offset = theme.timing.captionOffsetSec;
  const currentTime = (frame - introFrames) / fps - offset;

  const lineStartFrame = introFrames + Math.floor((line.start + offset) * fps);
  const lineEndFrame = introFrames + Math.floor((line.end + offset) * fps);

  const targetWidth = estimateLineWidth(line.words);

  // ── OVERLAPPING ENTRANCE (9 frames) ──
  const overlapFrames = 9;
  const entranceStart = lineStartFrame - overlapFrames;
  const entranceEnd = lineStartFrame + 6;
  const entranceProg = interpolate(frame, [entranceStart, entranceEnd], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_GLOW_REVEAL,
  });

  // ── OVERLAPPING EXIT (9 frames) ──
  const exitStart = lineEndFrame + 3;
  const exitEnd = exitStart + overlapFrames;
  const exitProg = interpolate(frame, [exitStart, exitEnd], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_SILK_IN,
  });

  const lineOpacity = entranceProg * (1 - exitProg);

  // ── KINETIC ENTRY: Y +20→0, scale 0.95→1.0, skewY 5→0 ──
  const entranceScale = interpolate(entranceProg, [0, 1], [0.95, 1.0]);
  const entranceY = interpolate(entranceProg, [0, 1], [20, 0]);
  const entranceSkewY = interpolate(entranceProg, [0, 1], [5, 0]);

  // ── KINETIC EXIT: Y 0→-20, scale 1.0→0.97, blur ──
  const exitDriftY = exitProg * -20;
  const exitScale = 1 - exitProg * 0.03;
  const exitBlur = exitProg * 1.5;

  const totalY = entranceY + exitDriftY;
  const totalScale = entranceScale * exitScale;

  // ── SPRING-LOADED BRACKETS: damping 14, stiffness 120 ──
  const bracketSpring = spring({
    frame: Math.max(0, frame - entranceStart),
    fps,
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
        position: 'absolute',
        left: 0, right: 0, top: '50%',
        transform: `translateY(calc(-50% + ${totalY}px)) scale(${totalScale}) skewY(${entranceSkewY}deg)`,
        opacity: lineOpacity,
        textAlign: 'center',
        maxWidth: theme.caption.maxWidth,
        margin: '0 auto',
        padding: '10px 36px',
        filter: exitBlur > 0.05 ? `blur(${exitBlur}px)` : 'none',
        willChange: 'transform, opacity, filter',
      }}
    >
      <DynamicBrackets
        bracketSpring={bracketVal}
        targetWidth={targetWidth}
        isIlluminated={isIlluminated}
        frame={frame}
      />

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
   Lines absolutely positioned inside — no vertical jitter.
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
    const buf = 22 / fps;
    return currentTime >= line.start - 0.5 && currentTime <= line.end + buf;
  });

  const hasVisible = visibleLines.length > 0;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10, pointerEvents: 'none',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: 160,
        maxWidth: theme.caption.maxWidth,
      }}>
        {hasVisible && (
          <div style={{
            position: 'absolute',
            top: -50, bottom: -50, left: -60, right: -60,
            background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)',
            borderRadius: 60, filter: 'blur(40px)', zIndex: -1,
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
    </div>
  );
};
