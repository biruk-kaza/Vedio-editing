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

  // ── FLUID STRETCH PHYSICS (RUBBER-BAND) & TIKTOK PUNCH ──
  // Dramatic scale up for active word, push back for inactive
  const stretchY = 1.0 + activeBump * 0.25; // More vertical stretch
  const squashX = 1.0 - activeBump * 0.08;  // More horizontal squash
  
  // Base scale: active word pops HUGE (1.25x), inactive words shrink slightly (0.9x)
  const baseScale = isCurrent ? 1.0 + activeBump * 0.25 : (isPast ? 0.9 : 0.85);
  
  // Z-depth: active word pushes forward, inactive fall back
  const wordZ = isCurrent ? activeBump * 50 : (isPast ? -30 : -50);

  // Dynamic energetic rotation (alternates slightly based on index)
  const rotationPunch = isCurrent ? activeBump * (wi % 2 === 0 ? 4 : -4) : 0;


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
    ? `${redFringe}, ${blueFringe}, 0 0 ${glowRadius}px rgba(212,175,55,${0.6 + audioGlow * 0.3}), 0 4px 15px rgba(0,0,0,0.9)`
    : '0 3px 10px rgba(0,0,0,0.6)';

  // ── 3D STAGGER ENTRANCE ──
  const enterSpring = spring({
    frame: localFrame - wi * 2.5,
    fps: configFps,
    config: { damping: 14, stiffness: 180, mass: 0.5 },
    durationInFrames: 14,
  });

  const entryY = interpolate(enterSpring, [0, 1], [35, 0]);
  const entryZ = interpolate(enterSpring, [0, 1], [200, 0]);
  const entryRotateX = interpolate(enterSpring, [0, 1], [-65, 0]);
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

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
          translate3d(${jitterX}px, ${entryY + jitterY}px, ${entryZ + wordZ}px) 
          rotateX(${entryRotateX}deg) 
          rotateZ(${rotationPunch}deg)
          scaleX(${squashX * baseScale}) 
          scaleY(${stretchY * baseScale})
        `,
        transformOrigin: 'center bottom',
        textShadow: textShadowStack,
        margin: '0 12px',
        lineHeight: 1.45,
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

  // Exit
  const exitStart = pageDurFrames + 3;
  const exitProgress = interpolate(localFrame, [exitStart, exitStart + 10], [0, 1], {
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
          translate(${gateWeaveX}px, ${gateWeaveY}px)
          translateZ(${totalZ}px) 
          scale(${totalScale}) 
          rotateX(${totalRotateX}deg)
        `,
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
export const CaptionOverlay = ({ words = [], introFrames = 0, audioPulse = 0 }) => {
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
    </AbsoluteFill>
  );
};
