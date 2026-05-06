/**
 * EOTC Voice Studio — Ultra-Smooth Caption Overlay
 * 
 * World-class karaoke-style word-by-word captions with:
 * - Buttery smooth cubic-bezier entrance animations
 * - Active word glows with gradient highlight
 * - Frosted glass backdrop behind text
 * - Precise timing sync with configurable offset
 * - Smooth color interpolation between states
 * - Sub-pixel anti-aliased text rendering
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

/**
 * Group words into display lines of N words each.
 */
function groupWordsIntoLines(words, maxPerLine = 4) {
  const lines = [];
  let current = [];

  for (const word of words) {
    current.push(word);
    if (current.length >= maxPerLine) {
      lines.push({
        words: [...current],
        start: current[0].start,
        end: current[current.length - 1].end,
        text: current.map((w) => w.word).join(' '),
      });
      current = [];
    }
  }

  if (current.length > 0) {
    lines.push({
      words: [...current],
      start: current[0].start,
      end: current[current.length - 1].end,
      text: current.map((w) => w.word).join(' '),
    });
  }

  return lines;
}

/**
 * Single animated word — silky smooth transitions.
 */
const AnimatedWord = ({ word, isActive, isPast, entranceFrame, fps, wordIndex }) => {
  const frame = useCurrentFrame();

  // Smooth spring entrance — tuned for butter
  const localFrame = frame - entranceFrame;
  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, mass: 0.5, stiffness: 140 },
    durationInFrames: 24,
  });

  // Smooth scale — active word gently pops
  const activeProgress = isActive
    ? interpolate(
        spring({
          frame: localFrame,
          fps,
          config: { damping: 20, mass: 0.4, stiffness: 200 },
          durationInFrames: 15,
        }),
        [0, 1],
        [1, theme.caption.highlightScale]
      )
    : 1;

  const baseScale = interpolate(entranceProgress, [0, 1], [0.85, 1]);
  const scale = baseScale * activeProgress;

  // Opacity — words fade in smoothly, stay bright
  const opacity = interpolate(entranceProgress, [0, 0.4, 1], [0, 0.6, 1], {
    extrapolateRight: 'clamp',
  });

  // Y entrance — subtle upward float
  const translateY = interpolate(entranceProgress, [0, 1], [10, 0]);

  // ── Color states with smooth interpolation ──
  let color, textShadow, fontWeight;

  if (isActive) {
    // Active word: bright gold with dual glow
    color = theme.gold.hotGlow;
    textShadow = [
      `0 0 ${theme.caption.glowRadius}px ${theme.gold.glow}`,
      `0 0 ${theme.caption.glowRadius * 2.5}px ${theme.gold.subtle}`,
      `0 2px 4px rgba(0,0,0,0.4)`,
    ].join(', ');
    fontWeight = 700;
  } else if (isPast) {
    // Past word: bright white, no glow
    color = theme.text.primary;
    textShadow = `0 1px 6px rgba(0,0,0,0.35)`;
    fontWeight = 600;
  } else {
    // Future word: dimmed
    color = theme.text.secondary;
    textShadow = `0 1px 4px rgba(0,0,0,0.25)`;
    fontWeight = 400;
  }

  return (
    <span
      style={{
        display: 'inline-block',
        color,
        fontSize: theme.caption.fontSize,
        fontFamily: theme.fonts.caption,
        fontWeight,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        textShadow,
        marginRight: theme.caption.wordGap,
        lineHeight: theme.caption.lineHeight,
        willChange: 'transform, opacity',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {word.word}
    </span>
  );
};

/**
 * A single caption line with smooth entrance and exit.
 */
const CaptionLine = ({ line, lineIndex, fps, introFrames }) => {
  const frame = useCurrentFrame();
  const offset = theme.timing.captionOffsetSec;
  const currentTime = (frame - introFrames) / fps + offset;

  const lineStartFrame = introFrames + Math.floor((line.start + offset) * fps);
  const lineEndFrame = introFrames + Math.floor((line.end + offset) * fps);

  // Smooth cubic fade in
  const fadeIn = interpolate(
    frame,
    [lineStartFrame - theme.timing.captionFadeIn, lineStartFrame],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  // Smooth cubic fade out
  const fadeOut = interpolate(
    frame,
    [lineEndFrame + 3, lineEndFrame + theme.timing.captionFadeOut + 3],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.cubic),
    }
  );

  const lineOpacity = fadeIn * fadeOut;

  // Smooth slide up entrance
  const slideY = interpolate(fadeIn, [0, 1], [16, 0], {
    easing: Easing.out(Easing.cubic),
  });

  // Smooth scale entrance
  const lineScale = interpolate(fadeIn, [0, 1], [0.97, 1], {
    easing: Easing.out(Easing.cubic),
  });

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
      {line.words.map((word, wordIndex) => {
        const wordStartFrame =
          introFrames + Math.floor((word.start + offset) * fps);
        const isActive =
          currentTime >= word.start && currentTime < word.end;
        const isPast = currentTime >= word.end;

        return (
          <AnimatedWord
            key={`${lineIndex}-${wordIndex}`}
            word={word}
            isActive={isActive}
            isPast={isPast}
            entranceFrame={wordStartFrame}
            fps={fps}
            wordIndex={wordIndex}
          />
        );
      })}
    </div>
  );
};

/**
 * Main Caption Overlay — frosted glass container with smooth lines.
 */
export const CaptionOverlay = ({ words = [], introFrames = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const offset = theme.timing.captionOffsetSec;
  const currentTime = (frame - introFrames) / fps + offset;

  // Group words into lines
  const lines = useMemo(() => groupWordsIntoLines(words, 4), [words]);

  // Find visible lines
  const visibleLines = lines.filter((line) => {
    const bufferSec = (theme.timing.captionFadeOut + 5) / fps;
    return (
      currentTime >= line.start - 0.4 &&
      currentTime <= line.end + bufferSec
    );
  });

  // Backdrop opacity tracks caption visibility
  const hasVisibleCaptions = visibleLines.length > 0;
  const backdropOpacity = hasVisibleCaptions ? 1 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: theme.caption.bottomOffset,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
        padding: '0 50px',
        zIndex: 10,
      }}
    >
      {/* Frosted glass backdrop */}
      {hasVisibleCaptions && (
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: '5%',
            right: '5%',
            height: 180,
            background: `linear-gradient(
              180deg,
              transparent 0%,
              rgba(0, 0, 0, 0.15) 30%,
              rgba(0, 0, 0, 0.35) 70%,
              rgba(0, 0, 0, 0.2) 100%
            )`,
            borderRadius: 30,
            filter: 'blur(40px)',
            zIndex: -1,
            opacity: backdropOpacity,
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
