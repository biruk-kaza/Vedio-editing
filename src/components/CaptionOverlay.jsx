/**
 * EOTC Voice Studio — Nate Herk–Level Kinetic Typography
 * 
 * ═══ DESIGN PRINCIPLES ═══
 * 1. PUNCHY — Spring overshoot pop, not gradual fades
 * 2. CLEAN — Minimal ornaments, no clutter
 * 3. CENTERED — Locked anchor, no wandering
 * 4. SNAPPY — 10-frame reveals, 1-frame word stagger
 * 5. CONTRAST — Active word = bright white POP
 * 
 * ═══ MOTION ═══
 * ENTER: spring(damping:12, stiffness:220) with overshoot
 *        scale 0.85→1.0 (overshoots to ~1.08 then settles)
 *        translateY +25→0
 *        opacity 0→1
 * 
 * EXIT:  bezier(0.4, 0, 0.2, 1) — 8 frames
 *        scale 1.0→0.92
 *        opacity 1→0
 *        translateY 0→-12
 * 
 * ACTIVE WORD: instant white pop + scale 1.08 + underline
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

const EASE_EXIT = Easing.bezier(0.4, 0, 0.2, 1);

const CHAR_WIDTH = 42;
const BRACKET_PAD = 50;
const MIN_W = 100;
const MAX_W = 680;

function estimateWidth(words) {
  const chars = words.reduce((s, w) => s + w.word.length, 0);
  const gaps = Math.max(0, words.length - 1) * theme.caption.wordGap;
  return Math.max(MIN_W, Math.min(MAX_W, chars * CHAR_WIDTH + gaps + BRACKET_PAD));
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
   CLEAN ACCENT LINES — just two gold lines, no clutter
   Width tracks text via spring, minimal and elegant
   ═══════════════════════════════════════════════ */
const AccentLines = ({ springVal, targetW, isActive }) => {
  const w = interpolate(springVal, [0, 1], [0, targetW]);
  const op = interpolate(springVal, [0, 0.5, 1], [0, 0.4, 0.6]);
  const col = theme.gold.primary;
  const glowAmt = isActive ? 8 : 0;

  return (
    <>
      <div style={{
        position: 'absolute', top: -16, left: '50%',
        width: w, height: 1.5, transform: 'translateX(-50%)',
        background: `linear-gradient(90deg, transparent, ${col} 25%, ${col} 75%, transparent)`,
        opacity: op,
        boxShadow: glowAmt ? `0 0 ${glowAmt}px ${theme.gold.glow}` : 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -16, left: '50%',
        width: w, height: 1.5, transform: 'translateX(-50%)',
        background: `linear-gradient(90deg, transparent, ${col} 25%, ${col} 75%, transparent)`,
        opacity: op,
        boxShadow: glowAmt ? `0 0 ${glowAmt}px ${theme.gold.glow}` : 'none',
      }} />
    </>
  );
};

/* ═══════════════════════════════════════════════
   ANIMATED WORD — Punchy spring pop + white highlight
   ═══════════════════════════════════════════════ */
const AnimatedWord = ({ word, isActive, isPast, fps, idx, pageFrame }) => {
  const staggerDelay = idx * theme.timing.wordStagger;
  const local = Math.max(0, pageFrame - staggerDelay);

  // ── SPRING POP ENTRY ──
  // Spring overshoot: scales past 1.0 then settles
  const enterSpring = spring({
    frame: local,
    fps,
    config: theme.timing.wordSpring,
    durationInFrames: 20,
  });

  const scale = interpolate(enterSpring, [0, 1], [0.85, 1.0]);
  const translateY = interpolate(enterSpring, [0, 1], [25, 0]);
  const opacity = interpolate(local, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── ACTIVE WORD: instant white POP ──
  const activeScale = isActive ? theme.caption.highlightScale : 1;
  const color = isActive
    ? theme.text.active         // Bright white
    : isPast
    ? theme.text.past           // Muted
    : theme.text.future;        // Dimmed

  const fontWeight = isActive
    ? theme.caption.fontWeight
    : isPast
    ? theme.caption.fontWeight - 100
    : theme.caption.fontWeight - 200;

  // Active word glow
  const shadow = isActive
    ? `0 0 ${theme.caption.glowRadius}px ${theme.gold.glow}, 0 0 40px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.5)`
    : isPast
    ? '0 2px 8px rgba(0,0,0,0.5)'
    : '0 2px 4px rgba(0,0,0,0.3)';

  return (
    <span style={{
      display: 'inline-block',
      position: 'relative',
      color,
      fontSize: theme.caption.fontSize,
      fontFamily: theme.fonts.caption,
      fontWeight,
      opacity,
      transform: `translateY(${translateY}px) scale(${scale * activeScale})`,
      textShadow: shadow,
      WebkitTextStroke: `${theme.caption.stroke.width}px ${theme.caption.stroke.color}`,
      paintOrder: 'stroke fill',
      marginRight: theme.caption.wordGap,
      lineHeight: theme.caption.lineHeight,
      willChange: 'transform, opacity',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {word.word}
      {/* Active word underline — clean gold bar */}
      {isActive && (
        <div style={{
          position: 'absolute', bottom: -4,
          left: '5%', right: '5%', height: 3,
          borderRadius: 2,
          backgroundColor: theme.gold.bright,
          boxShadow: `0 0 10px ${theme.gold.glow}`,
        }} />
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION PAGE — Spring pop in, smooth scale out
   ═══════════════════════════════════════════════ */
const CaptionPage = ({ line, lineIdx, fps, introFrames }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();
  const offset = theme.timing.captionOffsetSec;

  const pageStartSec = line.start;
  const pageDurFrames = Math.ceil((line.end - line.start) * fps);
  const targetW = estimateWidth(line.words);

  // ── SPRING POP ENTRANCE ──
  const enterSpring = spring({
    frame,
    fps: configFps,
    config: { damping: 14, stiffness: 150, mass: 0.4 },
    durationInFrames: 18,
  });

  const entryScale = interpolate(enterSpring, [0, 1], [0.88, 1.0]);
  const entryY = interpolate(enterSpring, [0, 1], [30, 0]);
  const entryOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── SMOOTH EXIT ──
  const exitStart = pageDurFrames + 4;
  const exitDur = theme.timing.exitFrames;
  const exitProgress = interpolate(frame, [exitStart, exitStart + exitDur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_EXIT,
  });

  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 0.92]);
  const exitY = interpolate(exitProgress, [0, 1], [0, -12]);
  const exitOpacity = 1 - exitProgress;

  // Combined
  const totalScale = entryScale * exitScale;
  const totalY = entryY + exitY;
  const totalOpacity = entryOpacity * exitOpacity;

  // Bracket spring
  const bSpring = spring({
    frame, fps: configFps,
    config: { damping: 14, stiffness: 120, mass: 0.5 },
    durationInFrames: 30,
  });
  const bVal = bSpring * exitOpacity;

  // Word highlighting
  const absoluteTimeSec = pageStartSec + (frame / fps) - offset;
  const isActive = line.words.some(w => absoluteTimeSec >= w.start && absoluteTimeSec < w.end);

  if (totalOpacity < 0.01) return null;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        position: 'relative', textAlign: 'center',
        maxWidth: theme.caption.maxWidth,
        padding: '12px 40px',
        transform: `translateY(${totalY}px) scale(${totalScale})`,
        opacity: totalOpacity,
        willChange: 'transform, opacity',
      }}>
        <AccentLines springVal={bVal} targetW={targetW} isActive={isActive} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {line.words.map((word, wi) => {
            const active = absoluteTimeSec >= word.start && absoluteTimeSec < word.end;
            const past = absoluteTimeSec >= word.end;

            return (
              <AnimatedWord
                key={`${lineIdx}-${wi}`}
                word={word}
                isActive={active}
                isPast={past}
                fps={configFps}
                idx={wi}
                pageFrame={frame}
              />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   MAIN OVERLAY — Clean, centered, no spatial offsets
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
      {lines.map((line, i) => {
        const startFrame = introFrames + Math.floor((line.start + offset) * fps) - 6;
        const endFrame = introFrames + Math.floor((line.end + offset) * fps) + 18;
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
