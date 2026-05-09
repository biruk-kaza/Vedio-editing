/**
 * EOTC Voice Studio — Cinematic Kinetic Typography Engine
 * 
 * ═══ DESIGN PRINCIPLES ═══
 * 
 * 1. UNIFORM TYPOGRAPHY — All words in a phrase render as
 *    one cohesive block. Same size, color, weight. No per-word
 *    highlighting. Clean, professional, world-class.
 * 
 * 2. SMOOTH PAGE TRANSITIONS — Each phrase fades and scales
 *    in/out as a single unit. Critically damped springs.
 * 
 * 3. PREMIUM ICON INTEGRATION — Icons draw on with specular
 *    edge, then breathe with the speech timing.
 * 
 * 4. CATHEDRAL ATMOSPHERE — Warm golden lighting casts
 *    from the icon position onto nearby text.
 * 
 * 5. STEADY CAMERA — Pure imperceptible dolly zoom.
 *    No drift. No tilt. No bumps.
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

// ═══ ICON COMPOSITIONS ═══
const COMPOSITIONS = [
  { name: 'ICON_ABOVE', iconPos: 'above', iconSize: 95 },
  { name: 'ICON_LEFT', iconPos: 'left', iconSize: 85 },
  { name: 'ICON_RIGHT', iconPos: 'right', iconSize: 85 },
  { name: 'ICON_BELOW', iconPos: 'below', iconSize: 90 },
  { name: 'ICON_BG', iconPos: 'behind', iconSize: 180 },
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
   No per-word component. Text is rendered as a
   single cohesive block inside CaptionPage.
   ═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   CAPTION PAGE — Icon + Text composition
   ═══════════════════════════════════════════════ */
const CaptionPage = ({ line, lineIdx, fps, seqStartFrame, audioPulse }) => {
  const localFrame = useCurrentFrame();
  const globalFrame = seqStartFrame + localFrame;
  const { fps: configFps } = useVideoConfig();

  const pageDurFrames = Math.ceil((line.end - line.start) * fps);
  const comp = COMPOSITIONS[lineIdx % COMPOSITIONS.length];
  const iconName = getIconForLine(lineIdx);

  // Dynamic font size
  const wordCount = line.words.length;
  const baseFontSize = theme.caption.fontSize || 55;
  const fontSize = wordCount <= 2
    ? Math.round(baseFontSize * 1.35)
    : wordCount <= 3
      ? Math.round(baseFontSize * 1.12)
      : baseFontSize;

  // ── SMOOTH ENTRANCE ──
  const enterSpring = spring({
    frame: localFrame,
    fps: configFps,
    config: { damping: 20, stiffness: 100, mass: 0.7 },
    durationInFrames: 20,
  });

  const entryScale = interpolate(enterSpring, [0, 1], [0.8, 1.0]);
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // Ken Burns (very subtle)
  const breathe = interpolate(localFrame, [0, pageDurFrames], [1.0, 1.02], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── CLEAN EXIT ──
  const exitStart = pageDurFrames + 3;
  const exitProgress = interpolate(localFrame, [exitStart, exitStart + 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 1.06]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const exitBlur = interpolate(exitProgress, [0, 0.5, 1], [0, 0, 8]);

  const totalScale = entryScale * exitScale * breathe;
  const totalOpacity = entryOpacity * exitOpacity;

  if (totalOpacity < 0.01) return null;

  // ── ICON REACTIVITY ──
  const absoluteTimeSec = globalFrame / fps;
  const isAnyWordActive = line.words.some(w => {
    return absoluteTimeSec >= w.start && absoluteTimeSec < w.end + 0.05;
  });

  // ── CATHEDRAL LIGHTING ──
  const cathedralIntensity = isAnyWordActive ? 1.0 : 0.4;
  const flicker = 1.0 + noise(globalFrame * 1.5) * 0.04;

  const iconEl = <GlowIcon
    iconName={iconName}
    size={comp.iconSize}
    delay={2}
    isActive={isAnyWordActive}
  />;

  // Build text as a single uniform string
  const lineText = line.words.map(w => w.word).join(' ');

  const textEl = (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: 880,
      color: 'rgba(255, 255, 255, 0.95)',
      fontSize,
      fontFamily: theme.fonts.caption,
      fontWeight: 800,
      textAlign: 'center',
      lineHeight: 1.4,
      textShadow: '0 4px 20px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.5)',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {lineText}
    </div>
  );

  // ── COMPOSITION LAYOUTS ──
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
          opacity: 0.08 + (audioPulse || 0) * 0.06,
          transform: `scale(${1.1 + totalScale * 0.1})`,
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
      {/* Cathedral light */}
      <IconLightCast
        x="50%"
        y="45%"
        intensity={cathedralIntensity * flicker * totalOpacity}
      />

      {/* Main container */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: totalOpacity,
        transform: `scale(${totalScale})`,
        filter: exitBlur > 0.1 ? `blur(${exitBlur}px)` : 'none',
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
      }}>
        {layout}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   STEADY CAMERA — Pure imperceptible dolly zoom.
   No drift. No tilt. No bumps.
   ═══════════════════════════════════════════════ */
const SteadyCamera = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Ultra-slow dolly zoom: 1.02 → 1.0 over the entire video
  const dolly = interpolate(frame, [0, durationInFrames], [1.02, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      transform: `scale(${dolly})`,
      transformOrigin: 'center center',
      willChange: 'transform',
    }}>
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN OVERLAY
   ═══════════════════════════════════════════════ */
export const CaptionOverlay = ({ words = [], introFrames = 0, audioPulse = 0 }) => {
  const { fps } = useVideoConfig();
  const offset = theme.timing.captionOffsetSec || 0;

  const lines = useMemo(
    () => groupWordsIntoLines(words, theme.caption.wordsPerLine || 4),
    [words]
  );

  return (
    <AbsoluteFill style={{ zIndex: 10, pointerEvents: 'none' }}>
      <SteadyCamera>
        {lines.map((line, i) => {
          const startFrame = introFrames + Math.floor((line.start + offset) * fps) - 4;
          const endFrame = introFrames + Math.floor((line.end + offset) * fps) + 18;
          const duration = Math.max(1, endFrame - startFrame);

          return (
            <Sequence
              key={`page-${i}`}
              from={Math.max(0, startFrame)}
              durationInFrames={duration}
            >
              <CaptionPage
                line={line}
                lineIdx={i}
                fps={fps}
                seqStartFrame={Math.max(0, startFrame)}
                audioPulse={audioPulse}
              />
            </Sequence>
          );
        })}
      </SteadyCamera>
    </AbsoluteFill>
  );
};
