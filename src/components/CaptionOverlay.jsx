/**
 * EOTC Voice Studio — FINAL Premium Caption Engine
 * 
 * Professional motion-graphics level karaoke captions:
 * - CENTERED on screen
 * - 72px bold Ethiopic typography with text stroke
 * - 3 words per line for cinematic impact
 * - Spring "pop" entrance per word
 * - Active word = bright gold with breathing glow
 * - Past words = clean white
 * - Future words = dim, waiting
 * - Frosted glass backdrop
 * - +0.12s timing offset (fixes "too fast" sync)
 * - All interpolate calls use strictly increasing input ranges
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

/* ─── Group words into lines of N ─── */
function groupWordsIntoLines(words, maxPerLine) {
  const lines = [];
  let current = [];
  for (const word of words) {
    current.push(word);
    if (current.length >= maxPerLine) {
      lines.push({
        words: [...current],
        start: current[0].start,
        end: current[current.length - 1].end,
      });
      current = [];
    }
  }
  if (current.length > 0) {
    lines.push({
      words: [...current],
      start: current[0].start,
      end: current[current.length - 1].end,
    });
  }
  return lines;
}

/* ═══════════════════════════════════════
   ANIMATED WORD — spring pop + glow
   ═══════════════════════════════════════ */
const AnimatedWord = ({ word, isActive, isPast, entranceFrame, fps }) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - entranceFrame);

  // Spring pop: 0 → overshoots past 1 → settles at 1
  const pop = spring({
    frame: localFrame,
    fps,
    config: { damping: 11, mass: 0.35, stiffness: 220 },
    durationInFrames: 22,
  });

  // Base scale from spring
  const baseScale = interpolate(pop, [0, 1], [0.55, 1]);

  // Active word gets a subtle breathing scale pulse
  let scaleMult = 1;
  if (isActive) {
    scaleMult = interpolate(
      Math.sin(localFrame * 0.1),
      [-1, 1],
      [1.0, theme.caption.highlightScale]
    );
  }

  const scale = baseScale * scaleMult;

  // Opacity: smooth 3-stop fade in
  const opacity = interpolate(pop, [0, 0.25, 1], [0, 0.4, 1]);

  // Y float: words rise into position
  const translateY = interpolate(pop, [0, 1], [20, 0]);

  // ── Visual states ──
  let color, shadow, weight, stroke;

  if (isActive) {
    color = theme.gold.hotGlow;
    shadow = `0 0 ${theme.caption.glowRadius}px ${theme.gold.glowStrong}, 0 0 ${theme.caption.glowRadius * 3}px ${theme.gold.glow}, 0 3px 8px rgba(0,0,0,0.5)`;
    weight = 800;
    stroke = `${theme.caption.stroke.width}px ${theme.caption.stroke.color}`;
  } else if (isPast) {
    color = theme.text.primary;
    shadow = '0 2px 10px rgba(0,0,0,0.6), 0 0 3px rgba(0,0,0,0.3)';
    weight = 700;
    stroke = '2px rgba(0,0,0,0.5)';
  } else {
    color = theme.text.secondary;
    shadow = '0 2px 6px rgba(0,0,0,0.35)';
    weight = 600;
    stroke = '1.5px rgba(0,0,0,0.25)';
  }

  return (
    <span
      style={{
        display: 'inline-block',
        color,
        fontSize: theme.caption.fontSize,
        fontFamily: theme.fonts.caption,
        fontWeight: weight,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
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
    </span>
  );
};

/* ═══════════════════════════════════════
   CAPTION LINE — fade in/out + scale
   ═══════════════════════════════════════ */
const CaptionLine = ({ line, lineIndex, fps, introFrames }) => {
  const frame = useCurrentFrame();
  const offset = theme.timing.captionOffsetSec;
  const currentTime = (frame - introFrames) / fps - offset;

  const lineStartFrame = introFrames + Math.floor((line.start + offset) * fps);
  const lineEndFrame = introFrames + Math.floor((line.end + offset) * fps);

  // Entrance fade (0→1) — cubic ease-out
  const fadeInStart = lineStartFrame - theme.timing.captionFadeIn;
  const fadeInEnd = lineStartFrame + 3;
  const fadeIn = interpolate(frame, [fadeInStart, fadeInEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Exit fade (1→0) — cubic ease-in
  const fadeOutStart = lineEndFrame + 8;
  const fadeOutEnd = lineEndFrame + theme.timing.captionFadeOut + 8;
  const fadeOut = interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const lineOpacity = fadeIn * fadeOut;

  // Entrance scale: 0.90 → 1.0
  const entranceScale = interpolate(fadeIn, [0, 1], [0.90, 1]);

  // Exit scale: use fadeOut (1→0) mapped to scale (1.0→0.95)
  // fadeOut goes 1→0, so: when fadeOut=1 (visible), scale=1; when fadeOut=0 (gone), scale=0.95
  const exitScale = 0.95 + fadeOut * 0.05;

  const lineScale = entranceScale * exitScale;

  // Slide up on entrance
  const slideY = interpolate(fadeIn, [0, 1], [22, 0]);

  if (lineOpacity < 0.01) return null;

  return (
    <div
      style={{
        opacity: lineOpacity,
        transform: `translateY(${slideY}px) scale(${lineScale})`,
        textAlign: 'center',
        maxWidth: theme.caption.maxWidth,
        margin: '0 auto',
        direction: 'ltr',
        willChange: 'transform, opacity',
      }}
    >
      {line.words.map((word, wi) => {
        const wordStartFrame =
          introFrames + Math.floor((word.start + offset) * fps);
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
          />
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════
   CAPTION OVERLAY — centered container
   ═══════════════════════════════════════ */
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
    const buf = (theme.timing.captionFadeOut + 10) / fps;
    return currentTime >= line.start - 0.5 && currentTime <= line.end + buf;
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
        padding: '0 36px',
      }}
    >
      {/* Soft radial backdrop for readability */}
      {hasVisible && (
        <div
          style={{
            position: 'absolute',
            width: '92%',
            height: 220,
            background: `radial-gradient(
              ellipse 100% 100% at 50% 50%,
              rgba(0, 0, 0, 0.28) 0%,
              rgba(0, 0, 0, 0.12) 55%,
              transparent 100%
            )`,
            borderRadius: 50,
            filter: 'blur(45px)',
            zIndex: -1,
          }}
        />
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
