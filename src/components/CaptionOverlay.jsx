/**
 * EOTC Voice Studio — Cinema-Grade Kinetic Typography Engine
 * 
 * ═══ ART DIRECTION ═══
 * 1. VARIETY — 7 layout presets, no two phrases the same
 * 2. ICONS — Path-trace draw-on SVG icons per phrase
 * 3. INTERACTIVE LIGHTING — Icon glow casts onto text
 * 4. CONTINUOUS ENLARGEMENT — Text scales 100%→103% over duration
 * 5. CINEMATIC SNAP — Explosive 0→80% in 10 frames, buttery ease-in
 * 6. SPECULAR GOLD — Text glow with metallic sheen
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

// ── Cinematic Snap Easing ──
// Explosive 0→80% in first 10 frames, buttery ease-in for rest
const EASE_CINEMATIC = Easing.bezier(0.05, 0.95, 0.15, 1.0);
const EASE_EXIT = Easing.bezier(0.4, 0, 0.2, 1);

// ═══ LAYOUT PRESETS ═══
const LAYOUTS = [
  {
    name: 'CENTER_HERO',
    position: { top: '42%', left: '50%', transform: 'translate(-50%, -50%)' },
    align: 'center',
    sizeMultiplier: 1.35,
    slideFrom: { x: 0, y: 45 },
    slideExit: { x: 0, y: -28 },
    iconPos: { top: '-80px', left: '50%', transform: 'translateX(-50%)' },
    lightCast: { x: '50%', y: '35%' },
  },
  {
    name: 'LEFT_SLIDE',
    position: { top: '40%', left: '8%', transform: 'translateY(-50%)' },
    align: 'left',
    sizeMultiplier: 1.0,
    slideFrom: { x: -90, y: 0 },
    slideExit: { x: -50, y: 0 },
    iconPos: { top: '-70px', left: '0' },
    lightCast: { x: '15%', y: '35%' },
  },
  {
    name: 'RIGHT_SLIDE',
    position: { top: '45%', right: '8%', transform: 'translateY(-50%)' },
    align: 'right',
    sizeMultiplier: 1.0,
    slideFrom: { x: 90, y: 0 },
    slideExit: { x: 50, y: 0 },
    iconPos: { top: '-70px', right: '0' },
    lightCast: { x: '85%', y: '40%' },
  },
  {
    name: 'BOTTOM_POP',
    position: { bottom: '22%', left: '50%', transform: 'translateX(-50%)' },
    align: 'center',
    sizeMultiplier: 1.15,
    slideFrom: { x: 0, y: 55 },
    slideExit: { x: 0, y: 35 },
    iconPos: { top: '-75px', left: '50%', transform: 'translateX(-50%)' },
    lightCast: { x: '50%', y: '68%' },
  },
  {
    name: 'CENTER_COMPACT',
    position: { top: '38%', left: '50%', transform: 'translate(-50%, -50%)' },
    align: 'center',
    sizeMultiplier: 0.88,
    slideFrom: { x: 65, y: 12 },
    slideExit: { x: -35, y: -12 },
    iconPos: { top: '-65px', left: '50%', transform: 'translateX(-50%)' },
    lightCast: { x: '55%', y: '32%' },
  },
  {
    name: 'TOP_WIDE',
    position: { top: '26%', left: '50%', transform: 'translate(-50%, -50%)' },
    align: 'center',
    sizeMultiplier: 1.2,
    slideFrom: { x: 0, y: -45 },
    slideExit: { x: 0, y: -35 },
    iconPos: { top: '-72px', left: '50%', transform: 'translateX(-50%)' },
    lightCast: { x: '50%', y: '20%' },
  },
  {
    name: 'LEFT_LOW',
    position: { bottom: '28%', left: '10%' },
    align: 'left',
    sizeMultiplier: 1.08,
    slideFrom: { x: -75, y: 22 },
    slideExit: { x: -40, y: -18 },
    iconPos: { top: '-70px', left: '0' },
    lightCast: { x: '18%', y: '62%' },
  },
];

function getDynamicFontSize(wordCount, multiplier) {
  const base = theme.caption.fontSize;
  if (wordCount === 1) return Math.round(base * 1.55 * multiplier);
  if (wordCount === 2) return Math.round(base * 1.22 * multiplier);
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
   ANIMATED WORD — Cinematic snap + specular highlight
   ═══════════════════════════════════════════════ */
const AnimatedWord = ({ word, isActive, isPast, fps, idx, pageFrame, fontSize, isEmphasis }) => {
  const staggerDelay = idx * theme.timing.wordStagger;
  const local = Math.max(0, pageFrame - staggerDelay);

  // Cinematic snap spring
  const enterSpring = spring({
    frame: local, fps,
    config: theme.timing.wordSpring,
    durationInFrames: 16,
  });

  const scale = interpolate(enterSpring, [0, 1], [0.78, 1.0]);
  const opacity = interpolate(local, [0, 4], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Active word: instant white POP with specular
  const activeScale = isActive ? theme.caption.highlightScale : 1;
  const emphasisScale = isEmphasis ? 1.18 : 1;

  const color = isActive ? theme.text.active
    : isPast ? theme.text.past
    : theme.text.future;

  const fontWeight = isActive ? theme.caption.fontWeight
    : isPast ? theme.caption.fontWeight - 100
    : theme.caption.fontWeight - 200;

  // Specular gold glow for active word
  const shadow = isActive
    ? `0 0 ${theme.caption.glowRadius}px ${theme.gold.glow}, 0 0 ${theme.caption.glowRadius * 2.5}px ${theme.gold.glowSoft}, 0 4px 18px rgba(0,0,0,0.6)`
    : '0 3px 12px rgba(0,0,0,0.5)';

  const wordFontSize = isEmphasis ? fontSize * 1.22 : fontSize;

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
      {/* Active underline — metallic gold bar */}
      {isActive && (
        <div style={{
          position: 'absolute', bottom: -6,
          left: '2%', right: '2%', height: 3.5,
          borderRadius: 2,
          background: theme.gold.metallic,
          boxShadow: `0 0 14px ${theme.gold.glow}, 0 2px 6px ${theme.gold.glowSoft}`,
        }} />
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION PAGE — Unique layout + icon + light cast
   + continuous enlargement
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

  // Emphasis: longest word
  const emphasisIdx = line.words.reduce((best, w, i) =>
    w.word.length > (line.words[best]?.word.length || 0) ? i : best, 0);

  // ── CINEMATIC SNAP ENTRANCE ──
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

  // ── CONTINUOUS ENLARGEMENT — 100% → 103% ──
  const breatheProgress = interpolate(frame, [0, pageDurFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.45, 0, 0.55, 1),
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
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 0.85]);
  const exitOpacity = 1 - exitProgress;

  // Combined
  const totalX = slideX + exitSlideX;
  const totalY = slideY + exitSlideY;
  const totalScale = entryScale * exitScale * breatheScale;
  const totalOpacity = entryOpacity * exitOpacity;

  // Word highlighting
  const absoluteTimeSec = pageStartSec + (frame / fps) - offset;

  // Icon glow intensity (for light cast)
  const iconDrawComplete = interpolate(frame, [theme.timing.iconDrawFrames, theme.timing.iconDrawFrames + 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  if (totalOpacity < 0.01) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Interactive light cast from icon onto text */}
      <IconLightCast
        x={layout.lightCast.x}
        y={layout.lightCast.y}
        intensity={iconDrawComplete * totalOpacity}
      />

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
        {/* Glow Icon — draws on with path trace */}
        <div style={{
          position: 'absolute',
          ...layout.iconPos,
          opacity: totalOpacity,
        }}>
          <GlowIcon iconName={iconName} size={56} delay={3} />
        </div>

        {/* Accent line */}
        {layout.align === 'center' && (
          <div style={{
            position: 'absolute', bottom: -16, left: '12%', right: '12%',
            height: 2, borderRadius: 1,
            background: `linear-gradient(90deg, transparent, ${theme.gold.primary}, transparent)`,
            opacity: totalOpacity * 0.45,
            boxShadow: `0 0 10px ${theme.gold.glow}`,
          }} />
        )}
        {(layout.align === 'left' || layout.align === 'right') && (
          <div style={{
            position: 'absolute',
            [layout.align]: 0,
            bottom: -12,
            width: 55, height: 2.5, borderRadius: 1,
            backgroundColor: theme.gold.primary,
            opacity: totalOpacity * 0.55,
            boxShadow: `0 0 10px ${theme.gold.glow}`,
          }} />
        )}

        {/* Words */}
        <div style={{ position: 'relative', zIndex: 2 }}>
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
