/**
 * EOTC Voice Studio — Caption Overlay
 * 
 * World-class word-by-word animated captions with:
 * - Spring-based word entrance animations
 * - Active word highlighting with golden glow
 * - Smooth line transitions with fade-in/out
 * - Amharic-optimized typography
 * 
 * This is the hero component — the centerpiece of the video.
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
 * Single animated word component.
 */
const AnimatedWord = ({ word, isActive, isPast, entranceFrame, fps }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  // Spring entrance
  const entranceProgress = spring({
    frame: frame - entranceFrame,
    fps,
    config: theme.timing.wordSpring,
    durationInFrames: 20,
  });

  // Scale pop on active
  const activeScale = isActive
    ? spring({
        frame: frame - entranceFrame,
        fps,
        config: { damping: 12, mass: 0.5, stiffness: 220 },
        durationInFrames: 12,
      })
    : 1;

  const scale = interpolate(entranceProgress, [0, 1], [0.7, 1]) *
    (isActive ? interpolate(activeScale, [0, 1], [1, theme.caption.highlightScale]) : 1);

  const opacity = interpolate(entranceProgress, [0, 1], [0, 1]);

  // Y offset for entrance
  const translateY = interpolate(entranceProgress, [0, 1], [14, 0]);

  // Color and glow
  const color = isActive
    ? theme.gold.bright
    : isPast
      ? theme.text.primary
      : theme.text.secondary;

  const textShadow = isActive
    ? `0 0 ${theme.caption.glowRadius}px ${theme.gold.glow}, 0 0 ${theme.caption.glowRadius * 2}px ${theme.gold.subtle}`
    : isPast
      ? `0 2px 8px rgba(0,0,0,0.5)`
      : `0 2px 8px rgba(0,0,0,0.3)`;

  const fontWeight = isActive ? 700 : isPast ? 500 : 400;

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
        transition: 'color 0.15s ease, text-shadow 0.15s ease',
        lineHeight: theme.caption.lineHeight,
      }}
    >
      {word.word}
    </span>
  );
};

/**
 * A single caption line with entrance and exit animations.
 */
const CaptionLine = ({ line, lineIndex, isVisible, fps, introFrames }) => {
  const frame = useCurrentFrame();
  const currentTime = (frame - introFrames) / fps;

  // Line entrance/exit
  const lineStartFrame = introFrames + Math.floor(line.start * fps);
  const lineEndFrame = introFrames + Math.floor(line.end * fps);

  const fadeIn = interpolate(
    frame,
    [lineStartFrame - theme.timing.captionFadeIn, lineStartFrame],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const fadeOut = interpolate(
    frame,
    [lineEndFrame, lineEndFrame + theme.timing.captionFadeOut],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const lineOpacity = fadeIn * fadeOut;

  // Slide up on entrance
  const slideY = interpolate(
    fadeIn,
    [0, 1],
    [20, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (lineOpacity < 0.01) return null;

  return (
    <div
      style={{
        opacity: lineOpacity,
        transform: `translateY(${slideY}px)`,
        textAlign: 'center',
        maxWidth: theme.caption.maxWidth,
        margin: '0 auto',
        direction: 'ltr', // Amharic is LTR
      }}
    >
      {line.words.map((word, wordIndex) => {
        const wordStartFrame = introFrames + Math.floor(word.start * fps);
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
          />
        );
      })}
    </div>
  );
};

/**
 * Main Caption Overlay — renders the active line(s) at the bottom of frame.
 */
export const CaptionOverlay = ({ words = [], introFrames = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = (frame - introFrames) / fps;

  // Group words into lines
  const lines = useMemo(() => groupWordsIntoLines(words, 4), [words]);

  // Find visible lines (current + maybe one more for overlap)
  const visibleLines = lines.filter((line) => {
    const buffer = theme.timing.captionFadeOut / fps;
    return currentTime >= line.start - 0.3 && currentTime <= line.end + buffer;
  });

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
        gap: 8,
        padding: '0 60px',
        zIndex: 10,
      }}
    >
      {/* Subtle backdrop blur behind captions */}
      {visibleLines.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            left: '10%',
            right: '10%',
            height: 160,
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.4) 100%)',
            borderRadius: 24,
            filter: 'blur(30px)',
            zIndex: -1,
          }}
        />
      )}

      {visibleLines.map((line, i) => (
        <CaptionLine
          key={`line-${line.start}`}
          line={line}
          lineIndex={i}
          isVisible={true}
          fps={fps}
          introFrames={introFrames}
        />
      ))}
    </div>
  );
};
