/**
 * EOTC Voice Studio — Liturgical Icon Library
 * 
 * Minimalist gold vector icons for EOTC liturgical storytelling.
 * Each icon supports path-tracing "draw-on" reveal animation
 * using SVG stroke-dashoffset driven by interpolate().
 * 
 * The draw-on effect: gold outline traces itself with a bright
 * leading edge, then settles into soft luminescent fill.
 * 
 * Interactive lighting: each icon emits a glow that can
 * cast subtle highlights on nearby text.
 */
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { theme } from '../utils/theme.js';

// ── SVG Path data for each icon ──
const ICON_PATHS = {
  cross: {
    paths: [
      'M 48 8 L 48 92', // vertical
      'M 20 32 L 76 32', // horizontal
    ],
    viewBox: '0 0 96 100',
    strokeWidth: 9,
    totalLength: 140,
  },
  book: {
    paths: [
      'M 12 20 C 12 12, 28 12, 48 18',
      'M 84 20 C 84 12, 68 12, 48 18',
      'M 48 18 L 48 85',
      'M 12 20 L 12 78 C 12 78, 28 74, 48 80',
      'M 84 20 L 84 78 C 84 78, 68 74, 48 80',
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 7,
    totalLength: 320,
  },
  dove: {
    paths: [
      'M 20 60 Q 30 20, 55 30 Q 80 40, 75 55 Q 70 70, 48 65 Q 25 60, 20 60 Z',
      'M 55 30 Q 65 15, 78 22', // wing tip
      'M 20 60 L 8 72', // tail
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 7,
    totalLength: 250,
  },
  candle: {
    paths: [
      'M 48 38 L 48 85', // body
      'M 36 85 L 60 85', // base
      'M 36 38 L 60 38', // top
      'M 48 38 Q 40 20, 48 8 Q 56 20, 48 38', // flame
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 7.5,
    totalLength: 180,
  },
  church: {
    paths: [
      'M 48 10 L 48 30', // spire
      'M 40 30 L 56 30', // cross bar
      'M 20 40 L 48 25 L 76 40', // roof
      'M 24 40 L 24 82 L 72 82 L 72 40', // walls
      'M 42 82 L 42 62 L 54 62 L 54 82', // door
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 7,
    totalLength: 300,
  },
  prayer: {
    paths: [
      'M 38 80 Q 38 50, 48 35 Q 58 50, 58 80', // hands
      'M 38 55 Q 48 45, 58 55', // fingers
      'M 44 35 Q 48 25, 52 35', // fingertips
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 7.5,
    totalLength: 160,
  },
  sun: {
    paths: [
      'M 48 30 A 18 18 0 1 0 48 66 A 18 18 0 1 0 48 30', // circle
      'M 48 8 L 48 20', 'M 48 76 L 48 88', // vertical rays
      'M 18 48 L 8 48', 'M 88 48 L 78 48', // horizontal rays
      'M 26 26 L 34 34', 'M 62 62 L 70 70', // diagonal
      'M 70 26 L 62 34', 'M 34 62 L 26 70', // diagonal
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 7,
    totalLength: 280,
  },
  bell: {
    paths: [
      'M 30 62 Q 30 30, 48 22 Q 66 30, 66 62 L 30 62', // bell body
      'M 26 62 L 70 62', // lip
      'M 48 14 L 48 22', // top
      'M 44 62 Q 44 72, 48 74 Q 52 72, 52 62', // clapper
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 7.5,
    totalLength: 220,
  },
};

/* ═══════════════════════════════════════════════
   GLOW ICON — Path-trace draw-on with specular edge
   
   Animation phases:
   1. [0→drawFrames] : Outline traces itself on (stroke-dashoffset)
   2. [drawFrames→drawFrames+10] : Fill fades in with soft glow
   3. [throughout] : Subtle pulse breathing
   ═══════════════════════════════════════════════ */

export const GlowIcon = ({ iconName = 'cross', size = 80, delay = 0, isActive = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  const iconData = ICON_PATHS[iconName] || ICON_PATHS.cross;
  const drawFrames = theme.timing.iconDrawFrames;

  // Draw-on progress
  const drawProgress = interpolate(local, [0, drawFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.05, 0.95, 0.15, 1.0),
  });

  const glowProgress = interpolate(local, [drawFrames, drawFrames + 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Scale spring entrance
  const scaleSpring = spring({
    frame: local, fps,
    config: { damping: 14, stiffness: 120, mass: 0.5 },
  });
  
  // ── REACTIVE BUMP (TIKTOK PUNCH) ──
  const activeSpring = spring({
    frame: isActive ? local % 1000 : 0, 
    fps,
    config: { damping: 10, stiffness: 300, mass: 0.4 }, // Snappier
  });
  
  const iconScale = interpolate(scaleSpring, [0, 1], [0.6, 1.0]) * (isActive ? 1.3 : 1.0); // Bigger punch
  const breath = interpolate(Math.sin(local * 0.04), [-1, 1], [0.97, 1.03]);
  const opacity = interpolate(local, [0, 5], [0, 1], { extrapolateLeft: 'clamp' });
  const glowRadius = interpolate(glowProgress, [0, 1], [0, 45]) + (isActive ? 40 : 0); // Brighter glow

  // Continuous 3D rotation
  const rotateY = local * 0.5; // Constant slow spin
  const activeTilt = isActive ? Math.sin(local * 0.3) * 20 : 0; // Extra erratic tilt when active


  // Specular leading edge brightness
  const specularIntensity = interpolate(drawProgress, [0, 0.5, 0.9, 1], [0, 1, 0.6, 0.3]);

  if (opacity < 0.01) return null;

  return (
    <div style={{
      width: size, height: size,
      opacity,
      transform: `scale(${iconScale * breath}) rotateY(${rotateY + activeTilt}deg) rotateZ(${isActive ? -5 : 0}deg)`,
      filter: `drop-shadow(0 0 ${glowRadius}px ${theme.gold.glow})`,
      willChange: 'transform, opacity, filter',
      mixBlendMode: 'screen',
      transformStyle: 'preserve-3d',
    }}>
      <svg
        viewBox={iconData.viewBox}
        width={size} height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow layer (behind, blurred) */}
        {glowProgress > 0.01 && iconData.paths.map((d, i) => (
          <path
            key={`glow-${i}`}
            d={d}
            stroke={theme.gold.glowStrong}
            strokeWidth={iconData.strokeWidth + 6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={glowProgress * 0.6}
            filter="url(#iconBlur)"
          />
        ))}

        {/* Main stroke (draw-on via dashoffset) */}
        {iconData.paths.map((d, i) => {
          const segLen = iconData.totalLength / iconData.paths.length;
          const offset = segLen * (1 - drawProgress);
          return (
            <path
              key={`stroke-${i}`}
              d={d}
              stroke={theme.gold.primary}
              strokeWidth={iconData.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={segLen}
              strokeDashoffset={offset}
            />
          );
        })}

        {/* Specular leading edge (bright flash at draw tip) */}
        {drawProgress > 0.01 && drawProgress < 0.95 && iconData.paths.map((d, i) => (
          <path
            key={`spec-${i}`}
            d={d}
            stroke={theme.gold.specular}
            strokeWidth={iconData.strokeWidth + 1}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={`${8} ${iconData.totalLength}`}
            strokeDashoffset={iconData.totalLength * (1 - drawProgress) - 4}
            opacity={specularIntensity * 1.0}
          />
        ))}

        {/* Blur filter definition */}
        <defs>
          <filter id="iconBlur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   INTERACTIVE LIGHT CAST
   When an icon draws on, it casts a soft golden
   highlight onto nearby elements. Returns a div
   with a radial gradient positioned relative to
   the icon location.
   ═══════════════════════════════════════════════ */
export const IconLightCast = ({ x = '50%', y = '40%', intensity = 0 }) => {
  if (intensity < 0.01) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse 45% 35% at ${x} ${y}, rgba(212,175,55,${0.12 * intensity}) 0%, transparent 70%)`,
      pointerEvents: 'none',
      zIndex: 5,
    }} />
  );
};

// Assign icon to phrase based on line index (cycles through)
export function getIconForLine(lineIdx) {
  return theme.icons[lineIdx % theme.icons.length];
}
