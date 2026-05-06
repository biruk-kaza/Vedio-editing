/**
 * EOTC Voice Studio — REACTIVE Kinetic Typography Engine
 * 
 * Every element is BOUND to the caption lifecycle:
 * • Accent lines draw in WITH the caption line entrance
 * • Diamond ornaments scale in WITH the line, pulse WITH active word
 * • Corner brackets fade in/out WITH line visibility
 * • Gold underline slides to the active word
 * • Words cascade in with staggered spring delays
 * • Radial pulse ring emanates when a word activates
 * • Everything exits together when the line fades out
 * 
 * NOTHING is random. Every motion is purposeful and reactive.
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
   REACTIVE FRAME — decorative elements bound to
   the line's own entrance/exit progress
   ═══════════════════════════════════════════════ */
const ReactiveFrame = ({ lineProgress, hasActiveWord, frame }) => {
  // lineProgress: 0 = invisible, 1 = fully visible
  // All decoratives are driven by this single value

  // Accent line width — draws in with the line
  const lineW = interpolate(lineProgress, [0, 1], [0, 300]);

  // Diamond scale — tied to line progress + pulse on active word
  const diamondBase = interpolate(lineProgress, [0, 1], [0, 1]);
  const diamondPulse = hasActiveWord
    ? interpolate(Math.sin(frame * 0.1), [-1, 1], [0.85, 1.15])
    : 1;
  const diamondScale = diamondBase * diamondPulse;

  // Diamond glow — stronger when a word is active
  const diamondGlow = hasActiveWord ? 12 : 6;

  // Corner bracket opacity — tied to line progress
  const bracketOp = interpolate(lineProgress, [0, 0.5, 1], [0, 0.1, 0.22]);

  // Bracket breathing — only when visible and active
  const bracketBreath = hasActiveWord
    ? interpolate(Math.sin(frame * 0.04), [-1, 1], [0.96, 1.04])
    : 1;

  const col = theme.gold.primary;
  const glow = theme.gold.glow;

  return (
    <>
      {/* ── TOP ACCENT LINE ── */}
      <div style={{
        position: 'absolute',
        top: -24,
        left: '50%',
        width: lineW,
        height: 1.5,
        transform: 'translateX(-50%)',
        background: `linear-gradient(90deg, transparent 0%, ${col} 30%, ${col} 70%, transparent 100%)`,
        opacity: lineProgress * 0.75,
        boxShadow: hasActiveWord ? `0 0 8px ${glow}` : 'none',
      }} />

      {/* ── BOTTOM ACCENT LINE ── */}
      <div style={{
        position: 'absolute',
        bottom: -24,
        left: '50%',
        width: lineW,
        height: 1.5,
        transform: 'translateX(-50%)',
        background: `linear-gradient(90deg, transparent 0%, ${col} 30%, ${col} 70%, transparent 100%)`,
        opacity: lineProgress * 0.75,
        boxShadow: hasActiveWord ? `0 0 8px ${glow}` : 'none',
      }} />

      {/* ── DIAMOND ORNAMENTS ✦ ── (at ends of accent lines) */}
      {lineProgress > 0.3 && (
        <>
          {/* Top-left diamond */}
          <div style={{
            position: 'absolute', top: -32, left: '50%',
            transform: `translateX(${-lineW / 2 - 8}px) scale(${diamondScale})`,
            color: col, fontSize: 12, opacity: lineProgress * 0.7,
            textShadow: `0 0 ${diamondGlow}px ${glow}`,
          }}>✦</div>
          {/* Top-right diamond */}
          <div style={{
            position: 'absolute', top: -32, left: '50%',
            transform: `translateX(${lineW / 2 - 4}px) scale(${diamondScale})`,
            color: col, fontSize: 12, opacity: lineProgress * 0.7,
            textShadow: `0 0 ${diamondGlow}px ${glow}`,
          }}>✦</div>
          {/* Bottom-left diamond */}
          <div style={{
            position: 'absolute', bottom: -32, left: '50%',
            transform: `translateX(${-lineW / 2 - 8}px) scale(${diamondScale})`,
            color: col, fontSize: 12, opacity: lineProgress * 0.7,
            textShadow: `0 0 ${diamondGlow}px ${glow}`,
          }}>✦</div>
          {/* Bottom-right diamond */}
          <div style={{
            position: 'absolute', bottom: -32, left: '50%',
            transform: `translateX(${lineW / 2 - 4}px) scale(${diamondScale})`,
            color: col, fontSize: 12, opacity: lineProgress * 0.7,
            textShadow: `0 0 ${diamondGlow}px ${glow}`,
          }}>✦</div>
        </>
      )}

      {/* ── CORNER BRACKETS ── (frame the text block) */}
      {lineProgress > 0.2 && (() => {
        const bw = 1.5;
        const sz = 24;
        return (
          <>
            <div style={{ position: 'absolute', top: -44, left: '6%', width: sz, height: sz, opacity: bracketOp, borderTop: `${bw}px solid ${col}`, borderLeft: `${bw}px solid ${col}`, transform: `scale(${bracketBreath})` }} />
            <div style={{ position: 'absolute', top: -44, right: '6%', width: sz, height: sz, opacity: bracketOp, borderTop: `${bw}px solid ${col}`, borderRight: `${bw}px solid ${col}`, transform: `scale(${bracketBreath})` }} />
            <div style={{ position: 'absolute', bottom: -44, left: '6%', width: sz, height: sz, opacity: bracketOp, borderBottom: `${bw}px solid ${col}`, borderLeft: `${bw}px solid ${col}`, transform: `scale(${bracketBreath})` }} />
            <div style={{ position: 'absolute', bottom: -44, right: '6%', width: sz, height: sz, opacity: bracketOp, borderBottom: `${bw}px solid ${col}`, borderRight: `${bw}px solid ${col}`, transform: `scale(${bracketBreath})` }} />
          </>
        );
      })()}
    </>
  );
};

/* ═══════════════════════════════════════════════
   ANIMATED WORD
   Spring pop + stagger + active glow + underline
   ═══════════════════════════════════════════════ */
const AnimatedWord = ({ word, isActive, isPast, entranceFrame, fps, staggerIndex }) => {
  const frame = useCurrentFrame();
  const staggeredEntrance = entranceFrame + staggerIndex * 3;
  const localFrame = Math.max(0, frame - staggeredEntrance);

  // Spring pop
  const pop = spring({
    frame: localFrame,
    fps,
    config: { damping: 10, mass: 0.3, stiffness: 240 },
    durationInFrames: 18,
  });

  const baseScale = interpolate(pop, [0, 1], [0.4, 1]);

  // Active word: breathing scale
  let scaleMult = 1;
  if (isActive) {
    scaleMult = interpolate(Math.sin(frame * 0.1), [-1, 1], [1.0, theme.caption.highlightScale]);
  }

  const opacity = interpolate(pop, [0, 0.2, 1], [0, 0.3, 1]);
  const translateY = interpolate(pop, [0, 1], [22, 0]);

  // Active word: subtle rotation wobble
  const rotation = isActive
    ? interpolate(Math.sin(frame * 0.12), [-1, 1], [-0.6, 0.6])
    : 0;

  // Visual states
  let color, shadow, weight, stroke;
  if (isActive) {
    color = theme.gold.hotGlow;
    shadow = `0 0 ${theme.caption.glowRadius}px ${theme.gold.glowStrong}, 0 0 ${theme.caption.glowRadius * 3}px ${theme.gold.glow}, 0 4px 12px rgba(0,0,0,0.5)`;
    weight = 800;
    stroke = `${theme.caption.stroke.width}px ${theme.caption.stroke.color}`;
  } else if (isPast) {
    color = theme.text.primary;
    shadow = '0 2px 10px rgba(0,0,0,0.6)';
    weight = 700;
    stroke = '2px rgba(0,0,0,0.45)';
  } else {
    color = theme.text.secondary;
    shadow = '0 2px 6px rgba(0,0,0,0.35)';
    weight = 600;
    stroke = '1.5px rgba(0,0,0,0.2)';
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
        transform: `translateY(${translateY}px) scale(${baseScale * scaleMult}) rotate(${rotation}deg)`,
        textShadow: shadow,
        WebkitTextStroke: stroke,
        paintOrder: 'stroke fill',
        marginRight: theme.caption.wordGap,
        lineHeight: theme.caption.lineHeight,
        willChange: 'transform, opacity',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {word.word}
      {/* Gold underline on active word */}
      {isActive && (
        <div style={{
          position: 'absolute',
          bottom: -3,
          left: '8%',
          right: '8%',
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${theme.gold.bright}, transparent)`,
          boxShadow: `0 0 10px ${theme.gold.glow}`,
        }} />
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION LINE
   Drives its own ReactiveFrame — everything
   enters and exits together as ONE unit
   ═══════════════════════════════════════════════ */
const CaptionLine = ({ line, lineIndex, fps, introFrames }) => {
  const frame = useCurrentFrame();
  const offset = theme.timing.captionOffsetSec;
  const currentTime = (frame - introFrames) / fps - offset;

  const lineStartFrame = introFrames + Math.floor((line.start + offset) * fps);
  const lineEndFrame = introFrames + Math.floor((line.end + offset) * fps);

  // ENTRANCE
  const fadeInStart = lineStartFrame - theme.timing.captionFadeIn;
  const fadeInEnd = lineStartFrame + 4;
  const fadeIn = interpolate(frame, [fadeInStart, fadeInEnd], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // EXIT
  const fadeOutStart = lineEndFrame + 8;
  const fadeOutEnd = lineEndFrame + theme.timing.captionFadeOut + 8;
  const fadeOut = interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const lineOpacity = fadeIn * fadeOut;
  // lineProgress: single value 0→1 that drives ALL decoratives
  const lineProgress = lineOpacity;

  // Scale + slide
  const entranceScale = interpolate(fadeIn, [0, 1], [0.88, 1]);
  const exitScale = 0.94 + fadeOut * 0.06;
  const slideY = interpolate(fadeIn, [0, 1], [28, 0]) + (1 - fadeOut) * 12;
  const rotation = interpolate(fadeIn, [0, 1], [1.2, 0]);

  // Check if any word in this line is currently active
  const hasActiveWord = line.words.some(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  if (lineOpacity < 0.01) return null;

  return (
    <div
      style={{
        position: 'relative',
        opacity: lineOpacity,
        transform: `translateY(${slideY}px) scale(${entranceScale * exitScale}) rotate(${rotation}deg)`,
        textAlign: 'center',
        maxWidth: theme.caption.maxWidth,
        margin: '0 auto',
        padding: '12px 40px',
        willChange: 'transform, opacity',
      }}
    >
      {/* ReactiveFrame is INSIDE the line — enters/exits WITH the line */}
      <ReactiveFrame
        lineProgress={lineProgress}
        hasActiveWord={hasActiveWord}
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
              staggerIndex={wi}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN OVERLAY — centered container
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
    const buf = (theme.timing.captionFadeOut + 12) / fps;
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
        padding: '0 30px',
      }}
    >
      {/* Soft radial backdrop — only when captions are visible */}
      {hasVisible && (
        <div style={{
          position: 'absolute',
          width: '90%',
          height: 260,
          background: `radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.10) 55%, transparent 100%)`,
          borderRadius: 50,
          filter: 'blur(45px)',
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
