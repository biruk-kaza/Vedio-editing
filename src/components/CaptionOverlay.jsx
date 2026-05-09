/**
 * EOTC Voice Studio — World-Class Kinetic Typography Engine
 * 
 * ═══ CINEMATIC FEATURES ═══
 * 
 * 1. FLUID STRETCH PHYSICS — Words don't just "pop", they
 *    stretch vertically like rubber then snap back. Simulates
 *    real physical matter with elastic deformation.
 * 
 * 2. CHROMATIC ABERRATION — Active words show subtle red/blue
 *    color fringing at the edges, simulating anamorphic optics.
 * 
 * 3. ORGANIC HAND-JITTER — Micro-noise on active words removes
 *    the sterile "digital" feel. Feels hand-animated.
 * 
 * 4. GATE WEAVE — The entire frame subtly shifts randomly,
 *    simulating film transport instability for a vintage look.
 * 
 * 5. REACTIVE ICONS — Icons pulse and tilt in sync with speech.
 * 
 * 6. 3D Z-DEPTH — Text emerges from deep perspective space
 *    with staggered word-by-word reveals.
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

// Deterministic noise function for gate weave
function noise(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1; // -1 to 1
}

// ═══ COMPOSITIONS — All perfectly centered ═══
const COMPOSITIONS = [
  { name: 'ICON_ABOVE', iconPos: 'above', iconSize: 75 },
  { name: 'ICON_LEFT',  iconPos: 'left',  iconSize: 65 },
  { name: 'ICON_RIGHT', iconPos: 'right', iconSize: 65 },
  { name: 'ICON_BELOW', iconPos: 'below', iconSize: 70 },
  { name: 'ICON_BG',    iconPos: 'behind', iconSize: 140 },
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
   ELITE WORD — Fluid Stretch + Chromatic Aberration
   ═══════════════════════════════════════════════ */
const SmoothWord = ({ word, wi, globalFrame, fps, fontSize, localFrame, audioPulse }) => {
  const { fps: configFps } = useVideoConfig();

  // 100% Accurate Absolute Timing
  const absoluteTimeSec = globalFrame / fps;
  const wordEndPadded = word.end + 0.05;
  const isCurrent = absoluteTimeSec >= word.start && absoluteTimeSec < wordEndPadded;
  const isPast = absoluteTimeSec >= wordEndPadded;

  // Snappy Color Cut
  const opacity = isCurrent ? 1.0 : (isPast ? 0.55 : 0.25);
  
  // ── SNAPPY HIGHLIGHT SPRING ──
  const wordStartFrame = Math.round(word.start * fps);
  const framesSinceStart = globalFrame - wordStartFrame;
  const wordEndFrame = Math.round(wordEndPadded * fps);
  const framesSinceEnd = globalFrame - wordEndFrame;

  const popSpring = spring({
    frame: framesSinceStart,
    fps: configFps,
    config: { damping: 12, stiffness: 300, mass: 0.4 },
  });
  const downSpring = spring({
    frame: framesSinceEnd,
    fps: configFps,
    config: { damping: 14, stiffness: 250, mass: 0.4 },
  });

  const activeBump = Math.max(0, popSpring - downSpring);

  // ── SILKY SMOOTH TYPOGRAPHY & TRACKING ──
  // Instead of violently stretching, the word expands elegantly
  const trackingPx = activeBump * 3.5; // Letter spacing expands when spoken
  const baseScale = isCurrent ? 1.0 + activeBump * 0.12 : (isPast ? 0.95 : 0.88);
  const wordZ = isCurrent ? activeBump * 40 : (isPast ? -15 : -30);

  // Subtle Y-axis lift, not a rubber band stretch
  const liftY = activeBump * -8;


  // ── CHROMATIC ABERRATION ──
  const aberration = activeBump * 2.5;
  const redFringe = `-${aberration}px 0 1.5px rgba(255, 60, 60, 0.35)`;
  const blueFringe = `${aberration}px 0 1.5px rgba(60, 60, 255, 0.35)`;

  // ── ORGANIC HAND-JITTER ──
  const jitterX = isCurrent ? noise(globalFrame * 0.8 + wi) * 0.7 : 0;
  const jitterY = isCurrent ? noise(globalFrame * 0.7 + wi * 3) * 0.7 : 0;

  // Active color (Golden pop with very bright warm tone)
  const r = 255;
  const g = isCurrent ? 230 : 255;
  const b = isCurrent ? 120 : 255;

  // ── AUDIO-REACTIVE GLOW ──
  const audioGlow = (audioPulse || 0) * (isCurrent ? 1.0 : 0.3);
  const glowRadius = isCurrent ? 18 + audioGlow * 20 : 0;

  const textShadowStack = isCurrent
    ? `${redFringe}, ${blueFringe}, 0 0 ${glowRadius + activeBump * 15}px rgba(255,215,0,${0.8 + audioGlow * 0.4}), 0 0 ${glowRadius/2}px rgba(255,255,255,0.9), 0 6px 20px rgba(0,0,0,0.95)`
    : '0 4px 12px rgba(0,0,0,0.8)';

  // ── 3D STAGGER ENTRANCE ──
  const enterSpring = spring({
    frame: localFrame - wi * 2.5,
    fps: configFps,
    config: { damping: 14, stiffness: 180, mass: 0.5 },
    durationInFrames: 14,
  });

  const entryY = interpolate(enterSpring, [0, 1], [35 + wi * 5, 0]);
  const entryZ = interpolate(enterSpring, [0, 1], [200, 0]); // Smoother start
  const entryRotateX = interpolate(enterSpring, [0, 1], [-45, 0]); // Softer flip
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  // Optical motion blur on entry
  const entryBlur = interpolate(enterSpring, [0, 1], [15, 0]);

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        color: `rgba(${r}, ${g}, ${b}, ${opacity * entryOpacity})`,
        fontSize,
        fontFamily: theme.fonts.caption,
        fontWeight: 800,
        transform: `
          translate3d(${jitterX}px, ${entryY + jitterY + liftY}px, ${entryZ + wordZ}px) 
          rotateX(${entryRotateX}deg) 
          scale(${baseScale}) 
        `,
        transformOrigin: 'center bottom',
        textShadow: textShadowStack,
        margin: '0 12px',
        letterSpacing: `${trackingPx}px`,
        filter: `blur(${entryBlur}px)`,
        lineHeight: 1.45,
        WebkitFontSmoothing: 'antialiased',
        transformStyle: 'preserve-3d',
        willChange: 'transform, color, text-shadow, letter-spacing, filter',
      }}
    >
      {word.word}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   WORLD-CLASS CAPTION PAGE — Cathedral Lighting + Gate Weave
   ═══════════════════════════════════════════════ */
const CaptionPage = ({ line, lineIdx, fps, seqStartFrame, audioPulse }) => {
  const localFrame = useCurrentFrame();
  const globalFrame = seqStartFrame + localFrame;
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
  const enterSpring = spring({
    frame: localFrame,
    fps: configFps,
    config: { damping: 18, stiffness: 100, mass: 0.6 },
    durationInFrames: 18,
  });

  const entryZ = interpolate(enterSpring, [0, 1], [-120, 0]);
  const entryScale = interpolate(enterSpring, [0, 1], [0.7, 1.0]);
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const entryRotateX = interpolate(enterSpring, [0, 1], [8, 0]);

  // Ken Burns zoom
  const breathe = interpolate(localFrame, [0, pageDurFrames], [1.0, 1.04], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Dramatic Exit: Fly towards the camera
  const exitStart = pageDurFrames + 3;
  const exitProgress = interpolate(localFrame, [exitStart, exitStart + 16], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.6, 0, 0.4, 1), // Silky S-curve
  });
  const exitZ = interpolate(exitProgress, [0, 1], [0, 300]); // Elegant float forward
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 1.1]); 
  const exitOpacity = 1 - exitProgress;
  const exitRotateX = interpolate(exitProgress, [0, 1], [0, 10]);
  const exitBlur = interpolate(exitProgress, [0, 0.4, 1], [0, 0, 12]); // Motion blur on exit

  const totalScale = entryScale * exitScale * breathe;
  const totalZ = entryZ + exitZ;
  const totalOpacity = entryOpacity * exitOpacity;
  const totalRotateX = entryRotateX + exitRotateX;

  if (totalOpacity < 0.01) return null;

  // ── GATE WEAVE (REMOVED AS PER REQUEST) ──
  // Subtle random frame-to-frame position shift removed for cleaner look
  const gateWeaveX = 0;
  const gateWeaveY = 0;

  // ── REACTIVE ICON LOGIC ──
  const absoluteTimeSec = globalFrame / fps;
  const isAnyWordActive = line.words.some(w => {
    const wordEndPadded = w.end + 0.05;
    return absoluteTimeSec >= w.start && absoluteTimeSec < wordEndPadded;
  });

  // ── CATHEDRAL LIGHTING ──
  // When words are active, the icon's light intensifies
  const cathedralIntensity = isAnyWordActive ? 1.2 : 0.6;
  // Flickering candle effect
  const flicker = 1.0 + noise(globalFrame * 2.3) * 0.08;

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
      maxWidth: 900,
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

  // Build layout based on icon position
  let layout;
  if (comp.iconPos === 'above') {
    layout = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        {iconEl}
        {textEl}
      </div>
    );
  } else if (comp.iconPos === 'left') {
    layout = (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 36 }}>
        {iconEl}
        {textEl}
      </div>
    );
  } else if (comp.iconPos === 'right') {
    layout = (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 36 }}>
        {textEl}
        {iconEl}
      </div>
    );
  } else if (comp.iconPos === 'below') {
    layout = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {textEl}
        {iconEl}
      </div>
    );
  } else { // behind
    layout = (
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          position: 'absolute',
          opacity: 0.10 + (audioPulse || 0) * 0.08,
          transform: `scale(${1 + totalScale * 0.12})`,
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
      {/* ── CATHEDRAL LIGHT CAST ──
          Dynamic golden radial that intensifies with speech */}
      <IconLightCast
        x="50%"
        y="45%"
        intensity={cathedralIntensity * flicker * totalOpacity}
      />

      {/* ── MAIN CONTAINER WITH GATE WEAVE ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: totalOpacity,
        transform: `
          translateZ(${totalZ}px) 
          scale(${totalScale}) 
          rotateX(${totalRotateX}deg)
        `,
        filter: `blur(${exitBlur}px)`,
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity, filter',
      }}>
        {layout}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   VIRTUAL 3D CAMERA (The Whip & Push)
   ═══════════════════════════════════════════════ */
const VirtualCamera = ({ words, fps, children }) => {
  const frame = useCurrentFrame();
  const absoluteTimeSec = frame / fps;

  // Find if a word just started recently (within the last 0.2 seconds)
  let activeWordIndex = -1;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (absoluteTimeSec >= w.start && absoluteTimeSec < w.end + 0.1) {
      activeWordIndex = i;
      break;
    }
  }

  // Generate a continuous spring that "bumps" whenever a new word starts
  // We use the word index as the target for the spring, so it moves 1 unit per word
  const cameraBumpSpring = spring({
    frame: frame,
    fps,
    config: { damping: 18, stiffness: 100, mass: 0.8 }, // Heavy, liquid camera pan
  });

  // Calculate local bump based on how close we are to the start of the active word
  let localBump = 0;
  if (activeWordIndex !== -1) {
    const activeWord = words[activeWordIndex];
    const framesSinceStart = frame - (activeWord.start * fps);
    if (framesSinceStart >= 0) {
      // Smooth attack, very slow decay
      const push = spring({
        frame: framesSinceStart,
        fps,
        config: { damping: 20, stiffness: 150, mass: 0.6 }
      });
      const pull = spring({
        frame: Math.max(0, framesSinceStart - 8), 
        fps,
        config: { damping: 22, stiffness: 80, mass: 1.0 } // Sluggish pullback
      });
      localBump = Math.max(0, push - pull);
    }
  }

  // The "Silky Push" effect
  const cameraScale = 1.0 + (localBump * 0.08); // Less aggressive zoom
  
  // Whip tilt is much softer
  const tiltDir = activeWordIndex % 2 === 0 ? 1 : -1;
  const cameraTiltZ = localBump * 1.0 * tiltDir;
  const cameraTiltX = localBump * 1.5; 

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      transform: `scale(${cameraScale}) rotateZ(${cameraTiltZ}deg) rotateX(${cameraTiltX}deg)`,
      transformOrigin: 'center center',
      willChange: 'transform',
      transformStyle: 'preserve-3d',
      perspective: '1200px',
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
          const endFrame = introFrames + Math.floor((line.end + offset) * fps) + 15;
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
