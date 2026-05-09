/**
 * EOTC Voice Studio — Cinematic Kinetic Typography Engine
 * 
 * ═══ DESIGN PRINCIPLES ═══
 * 
 * 1. CLEAN TYPOGRAPHY — Silky smooth letter-spacing expansion
 *    replaces rubbery stretch. Words feel weighted and elegant.
 * 
 * 2. OPTICAL MOTION BLUR — Entry and exit blur simulates
 *    real camera optics, not digital popping.
 * 
 * 3. SOFT VIRTUAL CAMERA — Heavy, cinematic camera push
 *    that feels like a Steadicam, not a handheld phone.
 * 
 * 4. PREMIUM ICON INTEGRATION — Icons breathe and pulse
 *    in perfect sync with the spoken word timing.
 * 
 * 5. CATHEDRAL ATMOSPHERE — Warm golden lighting casts
 *    from the icon position onto nearby text.
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

// Deterministic noise (subtle organic feel)
function noise(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

// ═══ ICON COMPOSITIONS ═══
const COMPOSITIONS = [
  { name: 'ICON_ABOVE', iconPos: 'above', iconSize: 80 },
  { name: 'ICON_LEFT', iconPos: 'left', iconSize: 70 },
  { name: 'ICON_RIGHT', iconPos: 'right', iconSize: 70 },
  { name: 'ICON_BELOW', iconPos: 'below', iconSize: 75 },
  { name: 'ICON_BG', iconPos: 'behind', iconSize: 150 },
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
   SMOOTH WORD — Clean, weighted typography
   ═══════════════════════════════════════════════ */
const SmoothWord = ({ word, wi, globalFrame, fps, fontSize, localFrame, audioPulse }) => {
  const { fps: configFps } = useVideoConfig();

  const absoluteTimeSec = globalFrame / fps;
  const wordEndPadded = word.end + 0.05;
  const isCurrent = absoluteTimeSec >= word.start && absoluteTimeSec < wordEndPadded;
  const isPast = absoluteTimeSec >= wordEndPadded;

  // Clean opacity states
  const opacity = isCurrent ? 1.0 : (isPast ? 0.5 : 0.2);

  // ── HIGHLIGHT SPRING ──
  const wordStartFrame = Math.round(word.start * fps);
  const framesSinceStart = globalFrame - wordStartFrame;
  const wordEndFrame = Math.round(wordEndPadded * fps);
  const framesSinceEnd = globalFrame - wordEndFrame;

  const popSpring = spring({
    frame: framesSinceStart,
    fps: configFps,
    config: { damping: 14, stiffness: 260, mass: 0.4 },
  });
  const downSpring = spring({
    frame: framesSinceEnd,
    fps: configFps,
    config: { damping: 16, stiffness: 200, mass: 0.45 },
  });

  const activeBump = Math.max(0, popSpring - downSpring);

  // ── CLEAN SCALE + TRACKING ──
  const trackingPx = activeBump * 2.0;
  const baseScale = isCurrent ? 1.0 + activeBump * 0.08 : (isPast ? 0.96 : 0.92);
  const liftY = activeBump * -4;

  // ── CHROMATIC ABERRATION (subtle) ──
  const aberration = activeBump * 1.5;

  // ── ORGANIC MICRO-JITTER (very subtle) ──
  const jitterX = isCurrent ? noise(globalFrame * 0.6 + wi) * 0.4 : 0;
  const jitterY = isCurrent ? noise(globalFrame * 0.5 + wi * 3) * 0.4 : 0;

  // Color: Pure white when active, warm white when past, dim when future
  const color = isCurrent
    ? 'rgba(255, 255, 255, 1.0)'
    : isPast
      ? `rgba(220, 210, 195, ${opacity})`
      : `rgba(180, 175, 165, ${opacity})`;

  // ── GLOW SYSTEM ──
  const audioGlow = (audioPulse || 0) * (isCurrent ? 1.0 : 0.2);
  const glowRadius = isCurrent ? 12 + audioGlow * 15 : 0;

  const textShadow = isCurrent
    ? `
        -${aberration}px 0 1px rgba(255, 80, 80, 0.2),
        ${aberration}px 0 1px rgba(80, 80, 255, 0.2),
        0 0 ${glowRadius}px rgba(255, 215, 0, ${0.5 + audioGlow * 0.3}),
        0 0 ${glowRadius * 0.4}px rgba(255, 255, 255, 0.6),
        0 4px 16px rgba(0, 0, 0, 0.9)
      `
    : '0 3px 10px rgba(0, 0, 0, 0.7)';

  // ── STAGGERED 3D ENTRANCE ──
  const enterSpring = spring({
    frame: localFrame - wi * 2,
    fps: configFps,
    config: { damping: 16, stiffness: 160, mass: 0.5 },
    durationInFrames: 16,
  });

  const entryY = interpolate(enterSpring, [0, 1], [30 + wi * 3, 0]);
  const entryZ = interpolate(enterSpring, [0, 1], [150, 0]);
  const entryRotateX = interpolate(enterSpring, [0, 1], [-35, 0]);
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const entryBlur = interpolate(enterSpring, [0, 1], [8, 0]);

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        color,
        fontSize,
        fontFamily: theme.fonts.caption,
        fontWeight: 800,
        transform: `
          translate3d(${jitterX}px, ${entryY + jitterY + liftY}px, ${entryZ}px) 
          rotateX(${entryRotateX}deg) 
          scale(${baseScale}) 
        `,
        transformOrigin: 'center bottom',
        textShadow,
        margin: '0 10px',
        letterSpacing: `${trackingPx}px`,
        filter: entryBlur > 0.1 ? `blur(${entryBlur}px)` : 'none',
        lineHeight: 1.4,
        WebkitFontSmoothing: 'antialiased',
        transformStyle: 'preserve-3d',
        willChange: 'transform, color, text-shadow',
      }}
    >
      {word.word}
    </span>
  );
};

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

  const textEl = (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: 880,
    }}>
      {line.words.map((word, wi) => (
        <SmoothWord
          key={`${lineIdx}-${wi}`}
          word={word}
          wi={wi}
          globalFrame={globalFrame}
          localFrame={localFrame}
          fps={fps}
          fontSize={fontSize}
          audioPulse={audioPulse}
        />
      ))}
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
   VIRTUAL CAMERA — Smooth Steadicam Push
   ═══════════════════════════════════════════════ */
const VirtualCamera = ({ words, fps, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const absoluteTimeSec = frame / fps;

  // Find active word
  let activeWordIndex = -1;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (absoluteTimeSec >= w.start && absoluteTimeSec < w.end + 0.1) {
      activeWordIndex = i;
      break;
    }
  }

  // Smooth camera bump on each new word
  let localBump = 0;
  if (activeWordIndex !== -1) {
    const activeWord = words[activeWordIndex];
    const framesSinceStart = frame - (activeWord.start * fps);
    if (framesSinceStart >= 0) {
      const push = spring({
        frame: framesSinceStart,
        fps,
        config: { damping: 22, stiffness: 120, mass: 0.8 }
      });
      const pull = spring({
        frame: Math.max(0, framesSinceStart - 10),
        fps,
        config: { damping: 25, stiffness: 60, mass: 1.2 }
      });
      localBump = Math.max(0, push - pull);
    }
  }

  // Gentle push (5% max zoom)
  const cameraScale = 1.0 + (localBump * 0.05);

  // Very soft tilt
  const tiltDir = activeWordIndex % 2 === 0 ? 1 : -1;
  const cameraTiltZ = localBump * 0.6 * tiltDir;

  // Slow organic drift (like a Steadicam on a dolly)
  const driftX = Math.sin(frame * 0.002) * 3;
  const driftY = Math.cos(frame * 0.0015) * 2;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      transform: `translate(${driftX}px, ${driftY}px) scale(${cameraScale}) rotateZ(${cameraTiltZ}deg)`,
      transformOrigin: 'center center',
      willChange: 'transform',
      transformStyle: 'preserve-3d',
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
      <VirtualCamera words={words} fps={fps}>
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
      </VirtualCamera>
    </AbsoluteFill>
  );
};
