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
   CLEAN WORD — Snappy, AE-Style Physics
   ═══════════════════════════════════════════════ */
const SmoothWord = ({ word, wi, globalFrame, fps, fontSize, localFrame }) => {
  const { fps: configFps } = useVideoConfig();

  // 100% Accurate Absolute Timing
  const absoluteTimeSec = globalFrame / fps;
  const wordEndPadded = word.end + 0.05; // Hold slightly after word ends
  const isCurrent = absoluteTimeSec >= word.start && absoluteTimeSec < wordEndPadded;
  const isPast = absoluteTimeSec >= wordEndPadded;

  // Snappy Color Cut (No mushy ramps)
  const opacity = isCurrent ? 1.0 : (isPast ? 0.6 : 0.3);
  
  // ── AFTER EFFECTS STYLE SNAPPY HIGHLIGHT SPRING ──
  const wordStartFrame = Math.round(word.start * fps);
  const framesSinceStart = globalFrame - wordStartFrame;
  const wordEndFrame = Math.round(wordEndPadded * fps);
  const framesSinceEnd = globalFrame - wordEndFrame;

  // Extremely tight, fast spring for the highlight pop
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
  const scale = 1.0 + activeBump * 0.08; // Sharp 8% pop

  // Active color (Golden pop)
  const r = 255;
  const g = isCurrent ? 220 : 255;
  const b = isCurrent ? 150 : 255;

  // ── JAW-DROPPING 3D STAGGER ENTRANCE ──
  const enterSpring = spring({
    frame: localFrame - wi * 2.5, // Faster 2.5 frame stagger
    fps: configFps,
    config: { damping: 14, stiffness: 180, mass: 0.5 },
    durationInFrames: 14,
  });

  const entryY = interpolate(enterSpring, [0, 1], [30, 0]);
  const entryZ = interpolate(enterSpring, [0, 1], [200, 0]);
  const entryRotateX = interpolate(enterSpring, [0, 1], [-65, 0]);
  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // ── CHROMATIC ABERRATION & JITTER (AE-LEVEL) ──
  // Simulates lens color fringing and hand-animated jitter
  const jitterX = isCurrent ? Math.sin(globalFrame * 0.8) * 0.8 : 0;
  const jitterY = isCurrent ? Math.cos(globalFrame * 0.7) * 0.8 : 0;
  
  // Chromatic Aberration: Red/Blue fringe that grows with the pop
  const aberration = activeBump * 3.5;
  const redFringe = `-${aberration}px 0 2px rgba(255, 0, 0, 0.45)`;
  const blueFringe = `${aberration}px 0 2px rgba(0, 0, 255, 0.45)`;
  
  const textShadowStack = isCurrent
    ? `${redFringe}, ${blueFringe}, 0 0 20px rgba(212,175,55,0.8), 0 4px 15px rgba(0,0,0,0.9)`
    : '0 3px 10px rgba(0,0,0,0.6)';

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        color: `rgba(${r}, ${g}, ${b}, ${opacity * entryOpacity})`,
        fontSize,
        fontFamily: theme.fonts.caption,
        fontWeight: 800, // Thick for high impact
        transform: `translate3d(${jitterX}px, ${entryY + jitterY}px, ${entryZ}px) rotateX(${entryRotateX}deg) scale(${scale})`,
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
   CAPTION PAGE — Center-locked with Z-depth
   ═══════════════════════════════════════════════ */
const CaptionPage = ({ line, lineIdx, fps, seqStartFrame }) => {
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
  // Text emerges from depth (scale 0.7 → 1.0) with perspective
  const enterSpring = spring({
    frame: localFrame,
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
  const breathe = interpolate(localFrame, [0, pageDurFrames], [1.0, 1.04], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Calculate local exit timings
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

  // ── REACTIVE ICON LOGIC ──
  // Determine if ANY word in this line is currently active
  const absoluteTimeSec = globalFrame / fps;
  const isAnyWordActive = line.words.some(w => {
    const wordEndPadded = w.end + 0.05;
    return absoluteTimeSec >= w.start && absoluteTimeSec < wordEndPadded;
  });

  // Icon element with reactivity
  const iconEl = <GlowIcon 
    iconName={iconName} 
    size={comp.iconSize} 
    delay={2} 
    isActive={isAnyWordActive} 
  />;

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
          globalFrame={globalFrame}
          localFrame={localFrame}
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
            <CaptionPage line={line} lineIdx={i} fps={fps} seqStartFrame={Math.max(0, startFrame)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
