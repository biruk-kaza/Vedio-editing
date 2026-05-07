/**
 * EOTC Voice Studio — Cinema-Grade Kinetic Typography
 * 
 * ═══ THE "CENTER ZONE VARIETY" PRINCIPLE ═══
 * Eyes stay focused on ONE comfort zone (center 35-55% of screen)
 * but every phrase FEELS different through:
 * 
 *   → Font size changes (1 word = massive, 3 words = normal)
 *   → Horizontal shift (slight left/center/slight right — NOT edges)
 *   → Slide direction (up/left/right/down — still varied)
 *   → Emphasis word sizing (longest word 1.2× bigger)
 *   → Accent line style (top/bottom/left bar/none)
 * 
 * Result: VARIETY + COMFORT. Eyes never chase the text.
 * 
 * ═══ SMOOTH WORD HIGHLIGHTING ═══
 * activeProgress float (0→1→0) over 4-frame ramp.
 * ALL properties derived via interpolate().
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
import { GlowIcon, IconLightCast, getIconForLine } from './IconLibrary.jsx';

const EASE_EXIT = Easing.bezier(0.4, 0, 0.2, 1);
const HIGHLIGHT_RAMP = 4; // frames for smooth highlight transition

// ═══ CENTER-ZONE LAYOUTS ═══
// All stay in the vertical center band (38-52%)
// Horizontal variety is subtle (±8% from center)
const LAYOUTS = [
  {
    name: 'CENTER',
    position: { top: '45%', left: '50%', transform: 'translate(-50%, -50%)' },
    align: 'center',
    sizeMultiplier: 1.3,
    slideFrom: { x: 0, y: 40 },
    slideExit: { x: 0, y: -20 },
    iconPos: { top: '-75px', left: '50%', transform: 'translateX(-50%)' },
    lightCast: { x: '50%', y: '38%' },
    accentStyle: 'center',
  },
  {
    name: 'SLIGHT_LEFT',
    position: { top: '43%', left: '42%', transform: 'translate(-50%, -50%)' },
    align: 'center',
    sizeMultiplier: 1.05,
    slideFrom: { x: -50, y: 10 },
    slideExit: { x: -25, y: -10 },
    iconPos: { top: '-70px', left: '50%', transform: 'translateX(-50%)' },
    lightCast: { x: '42%', y: '36%' },
    accentStyle: 'left',
  },
  {
    name: 'SLIGHT_RIGHT',
    position: { top: '47%', left: '58%', transform: 'translate(-50%, -50%)' },
    align: 'center',
    sizeMultiplier: 1.05,
    slideFrom: { x: 50, y: 10 },
    slideExit: { x: 25, y: -10 },
    iconPos: { top: '-70px', left: '50%', transform: 'translateX(-50%)' },
    lightCast: { x: '58%', y: '40%' },
    accentStyle: 'right',
  },
  {
    name: 'CENTER_HIGH',
    position: { top: '40%', left: '50%', transform: 'translate(-50%, -50%)' },
    align: 'center',
    sizeMultiplier: 1.18,
    slideFrom: { x: 0, y: -35 },
    slideExit: { x: 0, y: -25 },
    iconPos: { top: '-72px', left: '50%', transform: 'translateX(-50%)' },
    lightCast: { x: '50%', y: '33%' },
    accentStyle: 'center',
  },
  {
    name: 'CENTER_LOW',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    align: 'center',
    sizeMultiplier: 1.12,
    slideFrom: { x: 0, y: 45 },
    slideExit: { x: 0, y: 20 },
    iconPos: { top: '-70px', left: '50%', transform: 'translateX(-50%)' },
    lightCast: { x: '50%', y: '43%' },
    accentStyle: 'bottom',
  },
];

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
   SMOOTH WORD — Continuous activeProgress (0→1→0)
   Highlight flows like liquid across words
   ═══════════════════════════════════════════════ */
const SmoothWord = ({ word, absoluteTimeSec, fps, fontSize, isEmphasis }) => {
  const rampSec = HIGHLIGHT_RAMP / fps;

  // Smooth ramp up (4 frames before word.start → 1.0 at word.start)
  const rampIn = interpolate(
    absoluteTimeSec,
    [word.start - rampSec, word.start],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Smooth ramp down (1.0 at word.end → 0 after 4 frames)
  const rampOut = interpolate(
    absoluteTimeSec,
    [word.end, word.end + rampSec],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const activeProgress = Math.min(rampIn, rampOut);
  const isPast = absoluteTimeSec > word.end + rampSec;
  const isFuture = absoluteTimeSec < word.start - rampSec;

  // ── ALL properties from activeProgress ──
  const r = interpolate(activeProgress, [0, 1], [isPast ? 190 : isFuture ? 130 : 160, 255]);
  const g = interpolate(activeProgress, [0, 1], [isPast ? 185 : isFuture ? 125 : 155, 255]);
  const b = interpolate(activeProgress, [0, 1], [isPast ? 180 : isFuture ? 120 : 150, 255]);
  const alpha = interpolate(activeProgress, [0, 1], [isPast ? 0.58 : isFuture ? 0.28 : 0.45, 1.0]);

  const scale = interpolate(activeProgress, [0, 1], [1.0, theme.caption.highlightScale]);
  const glowRadius = interpolate(activeProgress, [0, 1], [0, theme.caption.glowRadius]);
  const glowOpacity = interpolate(activeProgress, [0, 1], [0, 0.45]);
  const underlineOp = interpolate(activeProgress, [0, 0.4, 1], [0, 0.2, 0.85]);
  const fontWeight = Math.round(interpolate(activeProgress, [0, 1], [600, theme.caption.fontWeight]));

  const emphasisScale = isEmphasis ? 1.18 : 1;
  const wordFontSize = isEmphasis ? fontSize * 1.2 : fontSize;

  return (
    <span style={{
      display: 'inline-block', position: 'relative',
      color: `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`,
      fontSize: wordFontSize, fontFamily: theme.fonts.caption,
      fontWeight,
      transform: `scale(${scale * emphasisScale})`,
      textShadow: glowRadius > 0.5
        ? `0 0 ${glowRadius}px rgba(212,175,55,${glowOpacity}), 0 0 ${glowRadius * 2.5}px ${theme.gold.glowSoft}, 0 4px 14px rgba(0,0,0,0.6)`
        : '0 3px 10px rgba(0,0,0,0.5)',
      WebkitTextStroke: `${theme.caption.stroke.width}px ${theme.caption.stroke.color}`,
      paintOrder: 'stroke fill',
      marginRight: theme.caption.wordGap,
      lineHeight: theme.caption.lineHeight,
      willChange: 'transform, color',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {word.word}
      {underlineOp > 0.05 && (
        <div style={{
          position: 'absolute', bottom: -5,
          left: '3%', right: '3%', height: 3.5,
          borderRadius: 2,
          background: theme.gold.metallic,
          opacity: underlineOp,
          boxShadow: `0 0 12px rgba(212,175,55,${underlineOp * 0.5})`,
        }} />
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   ACCENT LINE — varies per layout
   ═══════════════════════════════════════════════ */
const AccentLine = ({ style, opacity }) => {
  if (style === 'center') {
    return (
      <div style={{
        position: 'absolute', bottom: -18, left: '12%', right: '12%',
        height: 2, borderRadius: 1,
        background: `linear-gradient(90deg, transparent, ${theme.gold.primary}, transparent)`,
        opacity: opacity * 0.45,
        boxShadow: `0 0 10px ${theme.gold.glow}`,
      }} />
    );
  }
  if (style === 'left') {
    return (
      <div style={{
        position: 'absolute', left: 0, bottom: -14,
        width: 50, height: 2.5, borderRadius: 1,
        backgroundColor: theme.gold.primary,
        opacity: opacity * 0.5,
        boxShadow: `0 0 8px ${theme.gold.glow}`,
      }} />
    );
  }
  if (style === 'right') {
    return (
      <div style={{
        position: 'absolute', right: 0, bottom: -14,
        width: 50, height: 2.5, borderRadius: 1,
        backgroundColor: theme.gold.primary,
        opacity: opacity * 0.5,
        boxShadow: `0 0 8px ${theme.gold.glow}`,
      }} />
    );
  }
  if (style === 'bottom') {
    return (
      <div style={{
        position: 'absolute', bottom: -20, left: '25%', right: '25%',
        height: 1.5, borderRadius: 1,
        background: `linear-gradient(90deg, transparent, ${theme.gold.warm}, transparent)`,
        opacity: opacity * 0.35,
      }} />
    );
  }
  return null;
};

/* ═══════════════════════════════════════════════
   CAPTION PAGE
   ═══════════════════════════════════════════════ */
const CaptionPage = ({ line, lineIdx, fps }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();
  const offset = theme.timing.captionOffsetSec;

  const pageDurFrames = Math.ceil((line.end - line.start) * fps);
  const pageStartSec = line.start;

  const layout = LAYOUTS[lineIdx % LAYOUTS.length];
  const fontSize = getDynamicFontSize(line.words.length, layout.sizeMultiplier);
  const iconName = getIconForLine(lineIdx);

  const emphasisIdx = line.words.reduce((best, w, i) =>
    w.word.length > (line.words[best]?.word.length || 0) ? i : best, 0);

  // ── ENTRANCE ──
  const enterSpring = spring({
    frame, fps: configFps,
    config: { damping: 12, stiffness: 180, mass: 0.35 },
    durationInFrames: 14,
  });

  const slideX = interpolate(enterSpring, [0, 1], [layout.slideFrom.x, 0]);
  const slideY = interpolate(enterSpring, [0, 1], [layout.slideFrom.y, 0]);
  const entryScale = interpolate(enterSpring, [0, 1], [0.85, 1.0]);
  const entryOpacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── CONTINUOUS ENLARGEMENT ──
  const breatheProgress = interpolate(frame, [0, pageDurFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const breatheScale = 1 + breatheProgress * theme.caption.breatheScale;

  // ── EXIT ──
  const exitStart = pageDurFrames + 2;
  const exitDur = theme.timing.exitFrames;
  const exitProgress = interpolate(frame, [exitStart, exitStart + exitDur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_EXIT,
  });

  const exitSlideX = interpolate(exitProgress, [0, 1], [0, layout.slideExit.x]);
  const exitSlideY = interpolate(exitProgress, [0, 1], [0, layout.slideExit.y]);
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 0.88]);
  const exitOpacity = 1 - exitProgress;

  const totalX = slideX + exitSlideX;
  const totalY = slideY + exitSlideY;
  const totalScale = entryScale * exitScale * breatheScale;
  const totalOpacity = entryOpacity * exitOpacity;

  const absoluteTimeSec = pageStartSec + (frame / fps) - offset;

  // Icon glow
  const iconDrawComplete = interpolate(frame, [theme.timing.iconDrawFrames, theme.timing.iconDrawFrames + 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  if (totalOpacity < 0.01) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <IconLightCast
        x={layout.lightCast.x}
        y={layout.lightCast.y}
        intensity={iconDrawComplete * totalOpacity}
      />

      <div style={{
        position: 'absolute',
        ...layout.position,
        textAlign: layout.align,
        maxWidth: 920,
        padding: '10px 24px',
        opacity: totalOpacity,
        transform: `translate(${totalX}px, ${totalY}px) scale(${totalScale})`,
        willChange: 'transform, opacity',
      }}>
        {/* Icon */}
        <div style={{
          position: 'absolute',
          ...layout.iconPos,
          opacity: totalOpacity,
        }}>
          <GlowIcon iconName={iconName} size={52} delay={3} />
        </div>

        {/* Accent line */}
        <AccentLine style={layout.accentStyle} opacity={totalOpacity} />

        {/* Words with smooth highlighting */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {line.words.map((word, wi) => (
            <SmoothWord
              key={`${lineIdx}-${wi}`}
              word={word}
              absoluteTimeSec={absoluteTimeSec}
              fps={fps}
              fontSize={fontSize}
              isEmphasis={wi === emphasisIdx}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   MAIN OVERLAY
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
        const startFrame = introFrames + Math.floor((line.start + offset) * fps) - 4;
        const endFrame = introFrames + Math.floor((line.end + offset) * fps) + 15;
        const duration = Math.max(1, endFrame - startFrame);

        return (
          <Sequence
            key={`page-${i}`}
            from={Math.max(0, startFrame)}
            durationInFrames={duration}
          >
            <CaptionPage line={line} lineIdx={i} fps={fps} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
