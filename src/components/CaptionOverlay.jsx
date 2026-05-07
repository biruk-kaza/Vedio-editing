/**
 * EOTC Voice Studio — Cinema-Grade Kinetic Typography
 * 
 * ═══ ICON-TEXT COMPOSITION ═══
 * Icon and text form a SINGLE UNIT. Text shifts based
 * on where the icon lives. Five compositions:
 * 
 * 1. ICON_ABOVE  — icon centered above, text below
 * 2. ICON_LEFT   — icon on left, text shifts right
 * 3. ICON_RIGHT  — icon on right, text shifts left
 * 4. ICON_INLINE — icon inline with text (same row)
 * 5. ICON_BEHIND — large icon behind, text over it
 * 
 * All stay in center comfort zone (38-52% vertical)
 * 
 * ═══ SMOOTH WORD HIGHLIGHTING ═══
 * activeProgress (0→1→0) over 4-frame ramp
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
const HIGHLIGHT_RAMP = 6;

// ═══ ICON-TEXT COMPOSITIONS ═══
// Each defines how the icon and text relate spatially
const COMPOSITIONS = [
  {
    name: 'ICON_ABOVE',
    // Overall position
    anchor: { top: '42%', left: '50%', transform: 'translate(-50%, -50%)' },
    // Icon placement relative to text
    iconPlacement: 'above',
    iconSize: 80,
    textAlign: 'center',
    textShift: { x: 0, y: 0 },
    sizeMultiplier: 1.25,
    slideFrom: { x: 0, y: 45 },
    slideExit: { x: 0, y: -22 },
    lightCast: { x: '50%', y: '35%' },
  },
  {
    name: 'ICON_LEFT',
    anchor: { top: '44%', left: '48%', transform: 'translate(-50%, -50%)' },
    iconPlacement: 'left',
    iconSize: 70,
    textAlign: 'left',
    textShift: { x: 40, y: 0 },   // text shifts right to make room
    sizeMultiplier: 1.0,
    slideFrom: { x: -55, y: 8 },
    slideExit: { x: -30, y: -8 },
    lightCast: { x: '35%', y: '38%' },
  },
  {
    name: 'ICON_RIGHT',
    anchor: { top: '46%', left: '52%', transform: 'translate(-50%, -50%)' },
    iconPlacement: 'right',
    iconSize: 70,
    textAlign: 'right',
    textShift: { x: -40, y: 0 },   // text shifts left
    sizeMultiplier: 1.0,
    slideFrom: { x: 55, y: 8 },
    slideExit: { x: 30, y: -8 },
    lightCast: { x: '65%', y: '40%' },
  },
  {
    name: 'ICON_INLINE',
    anchor: { top: '43%', left: '50%', transform: 'translate(-50%, -50%)' },
    iconPlacement: 'inline',
    iconSize: 50,
    textAlign: 'center',
    textShift: { x: 0, y: 0 },
    sizeMultiplier: 1.1,
    slideFrom: { x: 0, y: -38 },
    slideExit: { x: 0, y: -20 },
    lightCast: { x: '50%', y: '36%' },
  },
  {
    name: 'ICON_BEHIND',
    anchor: { top: '45%', left: '50%', transform: 'translate(-50%, -50%)' },
    iconPlacement: 'behind',
    iconSize: 140,
    textAlign: 'center',
    textShift: { x: 0, y: 0 },
    sizeMultiplier: 1.3,
    slideFrom: { x: 0, y: 50 },
    slideExit: { x: 0, y: 25 },
    lightCast: { x: '50%', y: '40%' },
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
   SMOOTH WORD — Liquid highlight flow
   ═══════════════════════════════════════════════ */
const SmoothWord = ({ word, absoluteTimeSec, fps, fontSize, isEmphasis }) => {
  const rampSec = HIGHLIGHT_RAMP / fps;

  const rampIn = interpolate(
    absoluteTimeSec, [word.start - rampSec, word.start], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const rampOut = interpolate(
    absoluteTimeSec, [word.end, word.end + rampSec], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const activeProgress = Math.min(rampIn, rampOut);
  const isPast = absoluteTimeSec > word.end + rampSec;
  const isFuture = absoluteTimeSec < word.start - rampSec;

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
   CAPTION PAGE — Icon-Text Composition
   ═══════════════════════════════════════════════ */
const CaptionPage = ({ line, lineIdx, fps }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();
  const offset = theme.timing.captionOffsetSec;

  const pageDurFrames = Math.ceil((line.end - line.start) * fps);
  const pageStartSec = line.start;

  const comp = COMPOSITIONS[lineIdx % COMPOSITIONS.length];
  const fontSize = getDynamicFontSize(line.words.length, comp.sizeMultiplier);
  const iconName = getIconForLine(lineIdx);

  const emphasisIdx = line.words.reduce((best, w, i) =>
    w.word.length > (line.words[best]?.word.length || 0) ? i : best, 0);

  // ── ENTRANCE ──
  const enterSpring = spring({
    frame, fps: configFps,
    config: { damping: 12, stiffness: 180, mass: 0.35 },
    durationInFrames: 14,
  });
  const slideX = interpolate(enterSpring, [0, 1], [comp.slideFrom.x, 0]);
  const slideY = interpolate(enterSpring, [0, 1], [comp.slideFrom.y, 0]);
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
  const exitSlideX = interpolate(exitProgress, [0, 1], [0, comp.slideExit.x]);
  const exitSlideY = interpolate(exitProgress, [0, 1], [0, comp.slideExit.y]);
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 0.88]);
  const exitOpacity = 1 - exitProgress;

  const totalX = slideX + exitSlideX;
  const totalY = slideY + exitSlideY;
  const totalScale = entryScale * exitScale * breatheScale;
  const totalOpacity = entryOpacity * exitOpacity;

  const absoluteTimeSec = pageStartSec + (frame / fps) - offset;

  const iconDrawComplete = interpolate(frame, [theme.timing.iconDrawFrames, theme.timing.iconDrawFrames + 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  if (totalOpacity < 0.01) return null;

  // ── Build icon-text layout based on placement ──
  const iconElement = (
    <GlowIcon iconName={iconName} size={comp.iconSize} delay={2} />
  );

  const textElement = (
    <div style={{
      textAlign: comp.textAlign,
      transform: `translate(${comp.textShift.x}px, ${comp.textShift.y}px)`,
    }}>
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
  );

  // Render the composition based on icon placement
  let innerLayout;

  if (comp.iconPlacement === 'above') {
    innerLayout = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {iconElement}
        {textElement}
      </div>
    );
  } else if (comp.iconPlacement === 'left') {
    innerLayout = (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 28 }}>
        {iconElement}
        {textElement}
      </div>
    );
  } else if (comp.iconPlacement === 'right') {
    innerLayout = (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 28 }}>
        {textElement}
        {iconElement}
      </div>
    );
  } else if (comp.iconPlacement === 'inline') {
    innerLayout = (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        {iconElement}
        {textElement}
      </div>
    );
  } else if (comp.iconPlacement === 'behind') {
    innerLayout = (
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.15,
        }}>
          {iconElement}
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {textElement}
        </div>
      </div>
    );
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <IconLightCast
        x={comp.lightCast.x}
        y={comp.lightCast.y}
        intensity={iconDrawComplete * totalOpacity}
      />

      <div style={{
        position: 'absolute',
        ...comp.anchor,
        maxWidth: 960,
        padding: '10px 24px',
        opacity: totalOpacity,
        transform: `translate(${totalX}px, ${totalY}px) scale(${totalScale})`,
        willChange: 'transform, opacity',
      }}>
        {innerLayout}
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
