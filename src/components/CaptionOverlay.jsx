/**
 * EOTC Voice Studio — Remotion Best-Practice Kinetic Typography
 * 
 * Follows @remotion/skills best practices:
 * ✅ Each caption page wrapped in <Sequence> with from/durationInFrames
 * ✅ interpolate + Easing.bezier for ALL motion (NO CSS transitions)
 * ✅ Composing interpolations: separate timing from mapping
 * ✅ Easing.out for entrances, Easing.in for exits
 * ✅ spring for spring animations
 * ✅ whiteSpace: "pre" for caption text
 * 
 * ═══ MOTION DESIGN ═══
 * ENTRY:  Crisp UI entrance bezier(0.16, 1, 0.3, 1) — 15 frames
 *         translateY +20→0, scale 0.95→1.0, rotateX -60→0 (hinge)
 * EXIT:   Smooth ease-in bezier(0.4, 0, 1, 1) — 9 frames
 *         translateY 0→-20, scale 1.0→0.97, blur 0→1.5px
 * ACTIVE: brightness(1.35) + drop-shadow glow, breathing scale
 * 
 * ═══ DYNAMIC BRACKETS ═══
 * Width computed from text content, animated via spring(damping:14)
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

// ── Easing: crisp entrance / smooth exit (from skill rules) ──
const EASE_ENTER = Easing.bezier(0.16, 1, 0.3, 1);   // strong ease-out
const EASE_EXIT  = Easing.bezier(0.4, 0, 1.0, 1.0);   // ease-in (accelerate away)

// ── Dynamic bracket sizing ──
const CHAR_WIDTH = 40;
const BRACKET_PAD = 60;
const MIN_W = 120;
const MAX_W = 640;

function estimateWidth(words) {
  const chars = words.reduce((s, w) => s + w.word.length, 0);
  const gaps = Math.max(0, words.length - 1) * theme.caption.wordGap;
  return Math.max(MIN_W, Math.min(MAX_W, chars * CHAR_WIDTH + gaps + BRACKET_PAD));
}

/* ─── Group words into lines (pages) ─── */
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
   DYNAMIC BRACKETS — spring-loaded accent lines
   ═══════════════════════════════════════════════ */
const DynamicBrackets = ({ bracketSpring, targetW, isActive, frame }) => {
  const w = interpolate(bracketSpring, [0, 1], [0, targetW]);
  const op = interpolate(bracketSpring, [0, 0.3, 1], [0, 0.3, 0.65]);
  const bScale = interpolate(bracketSpring, [0, 1], [0.1, 1]);
  const bOp = interpolate(bracketSpring, [0, 0.4, 1], [0, 0.04, 0.18]);
  const pulse = isActive ? interpolate(Math.sin(frame * 0.1), [-1, 1], [0.88, 1.12]) : 1;
  const breath = isActive ? interpolate(Math.sin(frame * 0.04), [-1, 1], [0.96, 1.04]) : 1;
  const inset = Math.max(16, (920 - targetW) / 2 - 8);
  const col = theme.gold.primary;
  const glow = theme.gold.glow;
  const glowAmt = isActive ? 10 : 0;

  return (
    <>
      {/* Accent lines */}
      <div style={{ position: 'absolute', top: -20, left: '50%', width: w, height: 1.5, transform: 'translateX(-50%)', background: `linear-gradient(90deg, transparent 0%, ${col} 30%, ${col} 70%, transparent 100%)`, opacity: op, boxShadow: glowAmt ? `0 0 ${glowAmt}px ${glow}` : 'none' }} />
      <div style={{ position: 'absolute', bottom: -20, left: '50%', width: w, height: 1.5, transform: 'translateX(-50%)', background: `linear-gradient(90deg, transparent 0%, ${col} 30%, ${col} 70%, transparent 100%)`, opacity: op, boxShadow: glowAmt ? `0 0 ${glowAmt}px ${glow}` : 'none' }} />

      {/* Diamonds */}
      {bracketSpring > 0.35 && [[-1, 'top'], [1, 'top'], [-1, 'bottom'], [1, 'bottom']].map(([s, v], i) => (
        <div key={i} style={{ position: 'absolute', ...(v === 'top' ? { top: -28 } : { bottom: -28 }), left: '50%', transform: `translateX(${s * (w / 2 + 5)}px) scale(${bracketSpring * pulse})`, color: col, fontSize: 10, opacity: bracketSpring * 0.55, textShadow: `0 0 ${isActive ? 14 : 5}px ${glow}` }}>✦</div>
      ))}

      {/* Corner brackets */}
      {bracketSpring > 0.1 && (
        <>
          <div style={{ position: 'absolute', top: -38, left: inset, width: 20, height: 20, opacity: bOp, borderTop: `1.5px solid ${col}`, borderLeft: `1.5px solid ${col}`, transform: `scale(${bScale * breath})`, transformOrigin: 'top left' }} />
          <div style={{ position: 'absolute', top: -38, right: inset, width: 20, height: 20, opacity: bOp, borderTop: `1.5px solid ${col}`, borderRight: `1.5px solid ${col}`, transform: `scale(${bScale * breath})`, transformOrigin: 'top right' }} />
          <div style={{ position: 'absolute', bottom: -38, left: inset, width: 20, height: 20, opacity: bOp, borderBottom: `1.5px solid ${col}`, borderLeft: `1.5px solid ${col}`, transform: `scale(${bScale * breath})`, transformOrigin: 'bottom left' }} />
          <div style={{ position: 'absolute', bottom: -38, right: inset, width: 20, height: 20, opacity: bOp, borderBottom: `1.5px solid ${col}`, borderRight: `1.5px solid ${col}`, transform: `scale(${bScale * breath})`, transformOrigin: 'bottom right' }} />
        </>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════
   ANIMATED WORD — spring-based hinge + glow filter
   ═══════════════════════════════════════════════ */
const AnimatedWord = ({ word, isActive, isPast, entranceFrame, fps, idx }) => {
  const frame = useCurrentFrame();
  const stagger = entranceFrame + idx * theme.timing.wordStagger;
  const local = Math.max(0, frame - stagger);

  // ── ENTRY: Composing interpolation (separate timing from mapping) ──
  const enterProgress = interpolate(local, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_ENTER,
  });

  // Derive multiple properties from same progress (skill best practice)
  const scale = interpolate(enterProgress, [0, 1], [0.95, 1.0]);
  const opacity = interpolate(enterProgress, [0, 0.35, 1], [0, 0.6, 1]);
  const translateY = interpolate(enterProgress, [0, 1], [20, 0]);
  const rotateX = interpolate(enterProgress, [0, 1], [-60, 0]);

  // Active breathing
  let scaleMult = 1;
  if (isActive) {
    scaleMult = interpolate(Math.sin(frame * 0.08), [-1, 1], [1.0, theme.caption.highlightScale]);
  }

  // Active glow filter (not just color — brightness + drop-shadow)
  let filter = 'none';
  if (isActive) {
    const g = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.7, 1.0]);
    filter = `brightness(1.35) drop-shadow(0 0 ${theme.caption.glowRadius * g}px ${theme.gold.glowStrong})`;
  }

  // Color states
  let color, shadow, weight;
  if (isActive) {
    color = theme.text.active;
    shadow = `0 0 ${theme.caption.glowRadius}px ${theme.gold.glow}, 0 3px 6px rgba(0,0,0,0.4)`;
    weight = theme.caption.fontWeight + 100;
  } else if (isPast) {
    color = theme.text.past;
    shadow = '0 2px 5px rgba(0,0,0,0.4)';
    weight = theme.caption.fontWeight;
  } else {
    color = theme.text.future;
    shadow = '0 2px 3px rgba(0,0,0,0.2)';
    weight = theme.caption.fontWeight - 100;
  }

  return (
    <span style={{
      display: 'inline-block', position: 'relative', color,
      fontSize: theme.caption.fontSize, fontFamily: theme.fonts.caption,
      fontWeight: weight, opacity,
      transform: `translateY(${translateY}px) scale(${scale * scaleMult}) rotateX(${rotateX}deg)`,
      transformOrigin: '50% 100%',
      textShadow: shadow, filter,
      WebkitTextStroke: `${theme.caption.stroke.width}px ${theme.caption.stroke.color}`,
      paintOrder: 'stroke fill',
      marginRight: theme.caption.wordGap,
      lineHeight: theme.caption.lineHeight,
      willChange: 'transform, opacity, filter',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {word.word}
      {isActive && (
        <div style={{
          position: 'absolute', bottom: -2, left: '10%', right: '10%',
          height: 2.5, borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${theme.gold.bright}, transparent)`,
          opacity: 0.8, boxShadow: `0 0 8px ${theme.gold.glow}`,
        }} />
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION PAGE — Each wrapped in <Sequence>
   Proper enter/exit with bezier easing
   ═══════════════════════════════════════════════ */
const CaptionPage = ({ line, lineIdx, fps, introFrames }) => {
  const frame = useCurrentFrame(); // frame is LOCAL to this Sequence
  const { fps: configFps } = useVideoConfig();
  const offset = theme.timing.captionOffsetSec;

  // The Sequence `from` is set externally, so frame=0 is the start of this page
  const pageStartSec = line.start;
  const pageDurSec = line.end - line.start;
  const pageDurFrames = Math.ceil(pageDurSec * fps);

  const targetW = estimateWidth(line.words);

  // ── ENTRY: Composing — single progress drives all ──
  const enterDur = 15;
  const enterProgress = interpolate(frame, [0, enterDur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_ENTER,
  });

  // ── EXIT ──
  const exitStart = pageDurFrames + 6;
  const exitDur = 9;
  const exitProgress = interpolate(frame, [exitStart, exitStart + exitDur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_EXIT,
  });

  // Derive transforms from progress (skill best practice)
  const lineOpacity = enterProgress * (1 - exitProgress);
  const entryY = interpolate(enterProgress, [0, 1], [20, 0]);
  const entryScale = interpolate(enterProgress, [0, 1], [0.95, 1.0]);
  const exitY = exitProgress * -20;
  const exitScale = 1 - exitProgress * 0.03;
  const exitBlur = exitProgress * 1.5;

  const totalY = entryY + exitY;
  const totalScale = entryScale * exitScale;

  // Spring for brackets
  const bSpring = spring({
    frame, fps: configFps,
    config: { damping: 14, stiffness: 120, mass: 0.5 },
    durationInFrames: 35,
  });
  const bVal = bSpring * (1 - exitProgress);

  // Calculate absolute time for word highlighting
  const absoluteTimeSec = pageStartSec + (frame / fps) - offset;
  const isActive = line.words.some(w => absoluteTimeSec >= w.start && absoluteTimeSec < w.end);

  if (lineOpacity < 0.01) return null;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        position: 'relative', textAlign: 'center',
        maxWidth: theme.caption.maxWidth, padding: '10px 36px',
        transform: `translateY(${totalY}px) scale(${totalScale})`,
        opacity: lineOpacity,
        filter: exitBlur > 0.05 ? `blur(${exitBlur}px)` : 'none',
        willChange: 'transform, opacity, filter',
      }}>
        <DynamicBrackets bracketSpring={bVal} targetW={targetW} isActive={isActive} frame={frame} />

        <div style={{ position: 'relative', zIndex: 1, whiteSpace: 'pre-wrap' }}>
          {line.words.map((word, wi) => {
            const wordFrame = Math.floor((word.start - pageStartSec + offset) * fps);
            const active = absoluteTimeSec >= word.start && absoluteTimeSec < word.end;
            const past = absoluteTimeSec >= word.end;

            return (
              <AnimatedWord
                key={`${lineIdx}-${wi}`} word={word}
                isActive={active} isPast={past}
                entranceFrame={wordFrame} fps={fps} idx={wi}
              />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   MAIN OVERLAY — Sequences for each caption page
   Each page gets its own <Sequence> with proper timing
   ═══════════════════════════════════════════════ */
export const CaptionOverlay = ({ words = [], introFrames = 0 }) => {
  const { fps } = useVideoConfig();
  const offset = theme.timing.captionOffsetSec;

  const lines = useMemo(
    () => groupWordsIntoLines(words, theme.caption.wordsPerLine),
    [words]
  );

  return (
    <AbsoluteFill style={{ zIndex: 10, pointerEvents: 'none' }}>
      {/* Soft radial backdrop */}
      <AbsoluteFill style={{
        justifyContent: 'center', alignItems: 'center',
      }}>
        <div style={{
          width: '88%', height: 240,
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.06) 55%, transparent 100%)',
          borderRadius: 60, filter: 'blur(40px)',
        }} />
      </AbsoluteFill>

      {/* Each caption page in its own <Sequence> */}
      {lines.map((line, i) => {
        const startFrame = introFrames + Math.floor((line.start + offset) * fps) - 9;
        const endFrame = introFrames + Math.floor((line.end + offset) * fps) + 20;
        const duration = Math.max(1, endFrame - startFrame);

        return (
          <Sequence
            key={`page-${i}`}
            from={Math.max(0, startFrame)}
            durationInFrames={duration}
          >
            <CaptionPage
              line={line} lineIdx={i} fps={fps} introFrames={introFrames}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
