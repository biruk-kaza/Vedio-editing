/**
 * EOTC Voice Studio — World-Class Kinetic Typography Engine
 * 
 * ═══ DESIGN PHILOSOPHY ═══
 * 
 * 1. PERFECT CENTER — All text lives in flexbox-centered
 *    container at exact screen center. Never drifts.
 * 
 * 2. Z-AXIS DEPTH — Text enters from Z-depth (scale 0.7)
 *    and pushes forward to 1.0 with perspective. Creates
 *    a cinematic "emerging from depth" feel.
 * 
 * 3. CLEAN ICONS — Minimal, elegant liturgical icons that
 *    complement the text without competing.
 * 
 * 4. SMOOTH TRANSITIONS — 8-frame highlight ramp, spring
 *    entry, bezier exit. Zero jitter.
 * 
 * 5. VARIETY WITHOUT CHAOS — 5 layouts that all stay
 *    perfectly centered. Variety is in icon position only.
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

const HIGHLIGHT_RAMP = 8;
const EASE_EXIT = Easing.bezier(0.4, 0, 0.2, 1);

// ═══ COMPOSITIONS — All perfectly centered ═══
// Icon position varies, text ALWAYS at dead center
const COMPOSITIONS = [
  { name: 'ICON_ABOVE', iconPos: 'above', iconSize: 70 },
  { name: 'ICON_LEFT',  iconPos: 'left',  iconSize: 60 },
  { name: 'ICON_RIGHT', iconPos: 'right', iconSize: 60 },
  { name: 'ICON_BELOW', iconPos: 'below', iconSize: 65 },
  { name: 'ICON_BG',    iconPos: 'behind', iconSize: 130 },
];

function groupWordsIntoLines(words, max) {
  const lines = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= max) {
      lines.push({
        words: [...cur],
        start: cur[0].start,
        end: cur[cur.length - 1].end,
      });
      cur = [];
    }
  }
  if (cur.length) {
    lines.push({
      words: [...cur],
      start: cur[0].start,
      end: cur[cur.length - 1].end,
    });
  }
  return lines;
}

/* ═══════════════════════════════════════════════
   CLEAN WORD — Crisp, glitch-free highlighting
   ═══════════════════════════════════════════════ */
const SmoothWord = ({ word, wi, absoluteTimeSec, fps, fontSize }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();

  const rampSec = HIGHLIGHT_RAMP / fps;

  const rampIn = interpolate(
    absoluteTimeSec, [word.start - rampSec, word.start], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const rampOut = interpolate(
    absoluteTimeSec, [word.end, word.end + rampSec], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const progress = Math.min(rampIn, rampOut);
  const isPast = absoluteTimeSec > word.end + rampSec;

  // Clean white color with smooth opacity transition
  const opacity = interpolate(progress, [0, 1], [isPast ? 0.6 : 0.35, 1.0]);
  const scale = interpolate(progress, [0, 1], [1.0, 1.06]);
  const fontWeight = progress > 0.5 ? 700 : 600;

  // Subtle gold tint when active
  const goldTint = interpolate(progress, [0, 1], [0, 45]);
  const r = 255;
  const g = Math.round(255 - goldTint * 0.2);
  const b = Math.round(255 - goldTint);

  // ── JAW-DROPPING 3D STAGGER ENTRANCE ──
  const enterSpring = spring({
    frame: frame - wi * 3.5, // 3.5 frame stagger per word
    fps: configFps,
    config: { damping: 14, stiffness: 140, mass: 0.6 },
    durationInFrames: 16,
  });

  const entryY = interpolate(enterSpring, [0, 1], [25, 0]);
  const entryZ = interpolate(enterSpring, [0, 1], [150, 0]);
  const entryRotateX = interpolate(enterSpring, [0, 1], [-55, 0]);
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        color: `rgba(${r}, ${g}, ${b}, ${opacity * entryOpacity})`,
        fontSize,
        fontFamily: theme.fonts.caption,
        fontWeight,
        transform: `translate3d(0, ${entryY}px, ${entryZ}px) rotateX(${entryRotateX}deg) scale(${scale})`,
        transformOrigin: 'center bottom',
        textShadow: progress > 0.3
          ? `0 0 12px rgba(212,175,55,${progress * 0.45}), 0 4px 12px rgba(0,0,0,0.8)`
          : '0 3px 8px rgba(0,0,0,0.5)',
        margin: '0 10px',
        lineHeight: 1.45,
        WebkitFontSmoothing: 'antialiased',
        transformStyle: 'preserve-3d',
      }}
    >
      {word.word}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION PAGE — Center-locked with Z-depth
   ═══════════════════════════════════════════════ */
const CaptionPage = ({ line, lineIdx, fps }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();

  const pageDurFrames = Math.ceil((line.end - line.start) * fps);
  const comp = COMPOSITIONS[lineIdx % COMPOSITIONS.length];
  const iconName = getIconForLine(lineIdx);

  // Dynamic font size based on word count
  const wordCount = line.words.length;
  const baseFontSize = theme.caption.fontSize || 55;
  const fontSize = wordCount <= 2
    ? Math.round(baseFontSize * 1.4)
    : wordCount <= 3
    ? Math.round(baseFontSize * 1.15)
    : baseFontSize;

  // ═══ Z-AXIS ENTRANCE ═══
  // Text emerges from depth (scale 0.7 → 1.0) with perspective
  const enterSpring = spring({
    frame,
    fps: configFps,
    config: { damping: 18, stiffness: 100, mass: 0.6 },
    durationInFrames: 18,
  });

  // Z-depth: starts far away, comes to rest
  const entryZ = interpolate(enterSpring, [0, 1], [-120, 0]);
  const entryScale = interpolate(enterSpring, [0, 1], [0.7, 1.0]);
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const entryRotateX = interpolate(enterSpring, [0, 1], [8, 0]);

  // Slow continuous zoom during display (Ken Burns effect)
  const breathe = interpolate(frame, [0, pageDurFrames], [1.0, 1.04], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ═══ Z-AXIS EXIT ═══
  // Text recedes back into depth
  const exitStart = pageDurFrames + 3;
  const exitProgress = interpolate(frame, [exitStart, exitStart + 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_EXIT,
  });
  const exitZ = interpolate(exitProgress, [0, 1], [0, 80]);
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 0.85]);
  const exitOpacity = 1 - exitProgress;
  const exitRotateX = interpolate(exitProgress, [0, 1], [0, -5]);

  const totalScale = entryScale * exitScale * breathe;
  const totalZ = entryZ + exitZ;
  const totalOpacity = entryOpacity * exitOpacity;
  const totalRotateX = entryRotateX + exitRotateX;

  if (totalOpacity < 0.01) return null;

  const absoluteTimeSec = line.start + (frame / fps);

  // Icon element
  const iconEl = <GlowIcon iconName={iconName} size={comp.iconSize} delay={2} />;

  // Text element
  const textEl = (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: 900,
    }}>
      {line.words.map((word, wi) => (
        <SmoothWord
          key={`${lineIdx}-${wi}`}
          word={word}
          wi={wi}
          absoluteTimeSec={absoluteTimeSec}
          fps={fps}
          fontSize={fontSize}
        />
      ))}
    </div>
  );

  // Build layout based on icon position
  let layout;
  if (comp.iconPos === 'above') {
    layout = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {iconEl}
        {textEl}
      </div>
    );
  } else if (comp.iconPos === 'left') {
    layout = (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 32 }}>
        {iconEl}
        {textEl}
      </div>
    );
  } else if (comp.iconPos === 'right') {
    layout = (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 32 }}>
        {textEl}
        {iconEl}
      </div>
    );
  } else if (comp.iconPos === 'below') {
    layout = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {textEl}
        {iconEl}
      </div>
    );
  } else { // behind
    layout = (
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          position: 'absolute',
          opacity: 0.12,
          transform: `scale(${1 + totalScale * 0.1})`,
        }}>
          {iconEl}
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {textEl}
        </div>
      </div>
    );
  }

  return (
    <AbsoluteFill style={{
      pointerEvents: 'none',
      perspective: '1200px',
    }}>
      {/* Light cast from icon */}
      <IconLightCast
        x="50%"
        y="45%"
        intensity={entryOpacity * exitOpacity * 0.8}
      />

      {/* ── PERFECT CENTER CONTAINER ──
          Flexbox guarantees dead-center on screen.
          Z-depth transform gives cinematic depth feel. */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: totalOpacity,
        transform: `translateZ(${totalZ}px) scale(${totalScale}) rotateX(${totalRotateX}deg)`,
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
      }}>
        {layout}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   MAIN OVERLAY
   ═══════════════════════════════════════════════ */
export const CaptionOverlay = ({ words = [], introFrames = 0 }) => {
  const { fps } = useVideoConfig();
  const offset = theme.timing.captionOffsetSec || 0;

  const lines = useMemo(
    () => groupWordsIntoLines(words, theme.caption.wordsPerLine || 4),
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
