/**
 * EOTC Voice Studio — World-Class Kinetic Typography Engine
 * 
 * ═══ NATE HERK–LEVEL DESIGN SYSTEM ═══
 * 
 * CORE PRINCIPLE: No two phrases look the same.
 * 
 * Each phrase gets a unique LAYOUT PRESET that determines:
 *   → Position (center, left, right, top, bottom)
 *   → Alignment (left, center, right)
 *   → Font size (dynamic: fewer words = bigger text)
 *   → Slide direction (from-left, from-right, from-bottom, from-top)
 *   → Emphasis style (which word gets extra scale)
 * 
 * ═══ LAYOUT PRESETS ═══
 * 0: CENTER_HERO    — massive centered text, slides up
 * 1: LEFT_SLIDE     — left-aligned, slides from left
 * 2: RIGHT_SLIDE    — right-aligned, slides from right
 * 3: BOTTOM_POP     — lower third position, pops up
 * 4: CENTER_COMPACT — smaller centered, slides from right
 * 5: TOP_WIDE       — upper area, wide layout, slides down
 * 6: LEFT_STACKED   — left side, stacked vertically, slides left
 * 
 * ═══ MOTION ═══
 * ENTER: spring(damping:12, stiffness:220) + directional slide
 * EXIT:  scale 1.0→0.88 + opposite slide + fade
 * ACTIVE: instant white pop + scale boost + gold underline
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

// ═══ LAYOUT PRESET DEFINITIONS ═══
const LAYOUTS = [
  {
    name: 'CENTER_HERO',
    position: { top: '42%', left: '50%', transform: 'translate(-50%, -50%)' },
    align: 'center',
    sizeMultiplier: 1.3,
    slideFrom: { x: 0, y: 40 },   // slides up
    slideExit: { x: 0, y: -25 },
  },
  {
    name: 'LEFT_SLIDE',
    position: { top: '40%', left: '8%', transform: 'translateY(-50%)' },
    align: 'left',
    sizeMultiplier: 1.0,
    slideFrom: { x: -80, y: 0 },  // slides from left
    slideExit: { x: -40, y: 0 },
  },
  {
    name: 'RIGHT_SLIDE',
    position: { top: '45%', right: '8%', transform: 'translateY(-50%)' },
    align: 'right',
    sizeMultiplier: 1.0,
    slideFrom: { x: 80, y: 0 },   // slides from right
    slideExit: { x: 40, y: 0 },
  },
  {
    name: 'BOTTOM_POP',
    position: { bottom: '22%', left: '50%', transform: 'translateX(-50%)' },
    align: 'center',
    sizeMultiplier: 1.1,
    slideFrom: { x: 0, y: 50 },   // pops up from below
    slideExit: { x: 0, y: 30 },
  },
  {
    name: 'CENTER_COMPACT',
    position: { top: '38%', left: '50%', transform: 'translate(-50%, -50%)' },
    align: 'center',
    sizeMultiplier: 0.85,
    slideFrom: { x: 60, y: 10 },  // slides from right
    slideExit: { x: -30, y: -10 },
  },
  {
    name: 'TOP_WIDE',
    position: { top: '25%', left: '50%', transform: 'translate(-50%, -50%)' },
    align: 'center',
    sizeMultiplier: 1.15,
    slideFrom: { x: 0, y: -40 },  // slides down
    slideExit: { x: 0, y: -30 },
  },
  {
    name: 'LEFT_LOW',
    position: { bottom: '30%', left: '10%' },
    align: 'left',
    sizeMultiplier: 1.05,
    slideFrom: { x: -70, y: 20 }, // slides from bottom-left
    slideExit: { x: -35, y: -15 },
  },
];

// Dynamic font size: fewer words = bigger text
function getDynamicFontSize(wordCount, multiplier) {
  const base = theme.caption.fontSize;
  if (wordCount === 1) return Math.round(base * 1.5 * multiplier);
  if (wordCount === 2) return Math.round(base * 1.2 * multiplier);
  return Math.round(base * multiplier);
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
   ANIMATED WORD — Spring pop + instant white highlight
   ═══════════════════════════════════════════════ */
const AnimatedWord = ({ word, isActive, isPast, fps, idx, pageFrame, fontSize, isEmphasis }) => {
  const staggerDelay = idx * theme.timing.wordStagger;
  const local = Math.max(0, pageFrame - staggerDelay);

  // Spring pop entry
  const enterSpring = spring({
    frame: local, fps,
    config: theme.timing.wordSpring,
    durationInFrames: 18,
  });

  const scale = interpolate(enterSpring, [0, 1], [0.82, 1.0]);
  const opacity = interpolate(local, [0, 5], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Active word: instant white pop
  const activeScale = isActive ? theme.caption.highlightScale : 1;
  const emphasisScale = isEmphasis ? 1.15 : 1;

  const color = isActive ? theme.text.active
    : isPast ? theme.text.past
    : theme.text.future;

  const fontWeight = isActive ? theme.caption.fontWeight
    : isPast ? theme.caption.fontWeight - 100
    : theme.caption.fontWeight - 200;

  const shadow = isActive
    ? `0 0 ${theme.caption.glowRadius}px ${theme.gold.glow}, 0 0 50px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.6)`
    : '0 3px 10px rgba(0,0,0,0.5)';

  // Emphasis words get slightly different size
  const wordFontSize = isEmphasis ? fontSize * 1.2 : fontSize;

  return (
    <span style={{
      display: 'inline-block', position: 'relative', color,
      fontSize: wordFontSize, fontFamily: theme.fonts.caption,
      fontWeight, opacity,
      transform: `scale(${scale * activeScale * emphasisScale})`,
      textShadow: shadow,
      WebkitTextStroke: `${theme.caption.stroke.width}px ${theme.caption.stroke.color}`,
      paintOrder: 'stroke fill',
      marginRight: theme.caption.wordGap,
      lineHeight: theme.caption.lineHeight,
      willChange: 'transform, opacity',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {word.word}
      {isActive && (
        <div style={{
          position: 'absolute', bottom: -5,
          left: '3%', right: '3%', height: 3.5,
          borderRadius: 2,
          backgroundColor: theme.gold.bright,
          boxShadow: `0 0 12px ${theme.gold.glow}`,
        }} />
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION PAGE — Unique layout per phrase
   ═══════════════════════════════════════════════ */
const CaptionPage = ({ line, lineIdx, fps, introFrames }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();
  const offset = theme.timing.captionOffsetSec;

  const pageDurFrames = Math.ceil((line.end - line.start) * fps);
  const pageStartSec = line.start;

  // ── PICK LAYOUT ──
  // Cycle through presets, ensuring consecutive phrases differ
  const layout = LAYOUTS[lineIdx % LAYOUTS.length];
  const fontSize = getDynamicFontSize(line.words.length, layout.sizeMultiplier);

  // Pick which word to emphasize (longest word in the phrase)
  const emphasisIdx = line.words.reduce((best, w, i) =>
    w.word.length > (line.words[best]?.word.length || 0) ? i : best, 0);

  // ── DIRECTIONAL SLIDE ENTRANCE ──
  const enterSpring = spring({
    frame, fps: configFps,
    config: { damping: 14, stiffness: 150, mass: 0.4 },
    durationInFrames: 16,
  });

  const slideX = interpolate(enterSpring, [0, 1], [layout.slideFrom.x, 0]);
  const slideY = interpolate(enterSpring, [0, 1], [layout.slideFrom.y, 0]);
  const entryScale = interpolate(enterSpring, [0, 1], [0.88, 1.0]);
  const entryOpacity = interpolate(frame, [0, 7], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── EXIT: opposite direction + scale down ──
  const exitStart = pageDurFrames + 3;
  const exitDur = theme.timing.exitFrames;
  const exitProgress = interpolate(frame, [exitStart, exitStart + exitDur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_EXIT,
  });

  const exitSlideX = interpolate(exitProgress, [0, 1], [0, layout.slideExit.x]);
  const exitSlideY = interpolate(exitProgress, [0, 1], [0, layout.slideExit.y]);
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 0.88]);
  const exitOpacity = 1 - exitProgress;

  // Combined
  const totalX = slideX + exitSlideX;
  const totalY = slideY + exitSlideY;
  const totalScale = entryScale * exitScale;
  const totalOpacity = entryOpacity * exitOpacity;

  // Word highlighting
  const absoluteTimeSec = pageStartSec + (frame / fps) - offset;

  if (totalOpacity < 0.01) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        ...layout.position,
        textAlign: layout.align,
        maxWidth: layout.align === 'center' ? 920 : 750,
        padding: '10px 24px',
        opacity: totalOpacity,
        transform: `translate(${totalX}px, ${totalY}px) scale(${totalScale})`,
        willChange: 'transform, opacity',
      }}>
        {/* Clean accent line */}
        {layout.align === 'center' && (
          <div style={{
            position: 'absolute', bottom: -14, left: '15%', right: '15%',
            height: 2, borderRadius: 1,
            background: `linear-gradient(90deg, transparent, ${theme.gold.primary}, transparent)`,
            opacity: totalOpacity * 0.5,
            boxShadow: `0 0 8px ${theme.gold.glow}`,
          }} />
        )}
        {layout.align === 'left' && (
          <div style={{
            position: 'absolute', left: 0, bottom: -10,
            width: 60, height: 2.5, borderRadius: 1,
            backgroundColor: theme.gold.primary,
            opacity: totalOpacity * 0.6,
            boxShadow: `0 0 8px ${theme.gold.glow}`,
          }} />
        )}
        {layout.align === 'right' && (
          <div style={{
            position: 'absolute', right: 0, bottom: -10,
            width: 60, height: 2.5, borderRadius: 1,
            backgroundColor: theme.gold.primary,
            opacity: totalOpacity * 0.6,
            boxShadow: `0 0 8px ${theme.gold.glow}`,
          }} />
        )}

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
              fontSize={fontSize}
              isEmphasis={wi === emphasisIdx}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   MAIN OVERLAY — Each phrase in its own Sequence
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
        const startFrame = introFrames + Math.floor((line.start + offset) * fps) - 5;
        const endFrame = introFrames + Math.floor((line.end + offset) * fps) + 16;
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
