/**
 * EOTC Voice Studio — Premium Liturgical Icon Library
 * 
 * ═══ DESIGN PRINCIPLES ═══
 * 
 * 1. DETAILED FILLED ICONS — Not wireframes. Each icon has
 *    both stroke outlines AND warm golden fill that fades in
 *    after the draw-on completes. Feels solid and premium.
 * 
 * 2. SMOOTH REACTIVE ANIMATION — No erratic wobbling. When
 *    active, icons scale up smoothly with a golden pulse ring
 *    that radiates outward, then the icon settles back.
 * 
 * 3. MULTI-LAYERED GLOW — Three layers: deep warm glow,
 *    mid-range golden aura, and specular white highlight.
 * 
 * 4. CINEMATIC DRAW-ON — Path traces itself with a bright
 *    white leading edge, then golden fill blooms inward.
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

// ═══ DETAILED SVG ICONS (Filled + Stroked) ═══
const ICON_PATHS = {
  cross: {
    // Ethiopian Orthodox processional cross
    paths: [
      'M 48 5 L 48 95',           // vertical beam
      'M 22 28 L 74 28',           // horizontal beam
      'M 36 16 L 60 16',           // top crossbar
    ],
    fillPaths: [
      'M 44 5 L 52 5 L 52 95 L 44 95 Z',
      'M 22 24 L 74 24 L 74 32 L 22 32 Z',
      'M 36 12 L 60 12 L 60 20 L 36 20 Z',
    ],
    viewBox: '0 0 96 100',
    strokeWidth: 4,
    totalLength: 200,
  },
  book: {
    // Open scripture
    paths: [
      'M 10 18 C 10 10, 30 10, 48 16',
      'M 86 18 C 86 10, 66 10, 48 16',
      'M 48 16 L 48 82',
      'M 10 18 L 10 76 C 10 76, 30 72, 48 78',
      'M 86 18 L 86 76 C 86 76, 66 72, 48 78',
    ],
    fillPaths: [
      'M 10 18 C 10 10, 30 10, 48 16 L 48 78 C 30 72, 10 76, 10 76 Z',
      'M 86 18 C 86 10, 66 10, 48 16 L 48 78 C 66 72, 86 76, 86 76 Z',
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 3.5,
    totalLength: 340,
  },
  dove: {
    // Holy Spirit dove
    paths: [
      'M 18 55 Q 28 18, 55 28 Q 82 38, 76 55 Q 70 72, 48 65 Q 23 58, 18 55 Z',
      'M 55 28 Q 68 10, 82 18',
      'M 18 55 L 6 68',
    ],
    fillPaths: [
      'M 18 55 Q 28 18, 55 28 Q 82 38, 76 55 Q 70 72, 48 65 Q 23 58, 18 55 Z',
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 3.5,
    totalLength: 260,
  },
  candle: {
    // Liturgical candle with flame
    paths: [
      'M 42 40 L 42 82 L 54 82 L 54 40',
      'M 34 82 L 62 82',
      'M 42 40 L 54 40',
      'M 48 40 Q 38 22, 48 6 Q 58 22, 48 40',
    ],
    fillPaths: [
      'M 42 40 L 42 82 L 54 82 L 54 40 Z',
      'M 48 40 Q 38 22, 48 6 Q 58 22, 48 40 Z',
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 3.5,
    totalLength: 200,
  },
  church: {
    // Ethiopian church with dome
    paths: [
      'M 48 8 L 48 22',
      'M 40 22 L 56 22',
      'M 18 42 L 48 20 L 78 42',
      'M 22 42 L 22 85 L 74 85 L 74 42',
      'M 40 85 L 40 62 L 56 62 L 56 85',
      'M 48 42 A 12 12 0 1 0 48 66',
    ],
    fillPaths: [
      'M 18 42 L 48 20 L 78 42 Z',
      'M 22 42 L 22 85 L 74 85 L 74 42 Z',
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 3.5,
    totalLength: 350,
  },
  prayer: {
    // Praying hands
    paths: [
      'M 36 78 Q 36 50, 48 32 Q 60 50, 60 78',
      'M 36 52 Q 48 42, 60 52',
      'M 42 32 Q 48 20, 54 32',
    ],
    fillPaths: [
      'M 36 78 Q 36 50, 48 32 Q 60 50, 60 78 Z',
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 3.5,
    totalLength: 180,
  },
  sun: {
    // Morning star / glory
    paths: [
      'M 48 28 A 20 20 0 1 0 48 68 A 20 20 0 1 0 48 28',
      'M 48 4 L 48 18', 'M 48 78 L 48 92',
      'M 14 48 L 4 48', 'M 92 48 L 82 48',
      'M 22 22 L 32 32', 'M 64 64 L 74 74',
      'M 74 22 L 64 32', 'M 32 64 L 22 74',
    ],
    fillPaths: [
      'M 48 28 A 20 20 0 1 0 48 68 A 20 20 0 1 0 48 28 Z',
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 3.5,
    totalLength: 300,
  },
  bell: {
    // Church bell
    paths: [
      'M 28 64 Q 28 28, 48 18 Q 68 28, 68 64 L 28 64',
      'M 24 64 L 72 64',
      'M 48 10 L 48 18',
      'M 44 64 Q 44 76, 48 78 Q 52 76, 52 64',
    ],
    fillPaths: [
      'M 28 64 Q 28 28, 48 18 Q 68 28, 68 64 Z',
    ],
    viewBox: '0 0 96 96',
    strokeWidth: 3.5,
    totalLength: 240,
  },
};

/* ═══════════════════════════════════════════════
   PREMIUM GLOW ICON
   
   Phases:
   1. Draw-on: Stroke traces with specular leading edge
   2. Fill bloom: Golden fill fades in after draw completes
   3. Idle: Gentle breathing pulse
   4. Active: Smooth scale-up with radiating pulse ring
   ═══════════════════════════════════════════════ */

export const GlowIcon = ({ iconName = 'cross', size = 80, delay = 0, isActive = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  const iconData = ICON_PATHS[iconName] || ICON_PATHS.cross;
  const drawFrames = theme.timing.iconDrawFrames;

  // Draw-on progress (smooth ease)
  const drawProgress = interpolate(local, [0, drawFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.05, 0.95, 0.15, 1.0),
  });

  // Fill bloom (after draw completes)
  const fillProgress = interpolate(local, [drawFrames, drawFrames + 15], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  });

  // Scale spring entrance
  const scaleSpring = spring({
    frame: local, fps,
    config: { damping: 16, stiffness: 120, mass: 0.5 },
  });

  // ── SMOOTH REACTIVE SCALE (no wobble) ──
  const activeScale = isActive ? 1.18 : 1.0; // Clean scale up
  const iconScale = interpolate(scaleSpring, [0, 1], [0.4, 1.0]) * activeScale;
  
  // Gentle breathing (very subtle)
  const breath = interpolate(Math.sin(local * 0.03), [-1, 1], [0.98, 1.02]);
  
  const opacity = interpolate(local, [0, 5], [0, 1], { extrapolateLeft: 'clamp' });
  
  // ── MULTI-LAYERED GLOW ──
  const baseGlow = interpolate(fillProgress, [0, 1], [0, 20]);
  const activeGlow = isActive ? 35 : 0;
  const glowRadius = baseGlow + activeGlow;

  // ── RADIATING PULSE RING ──
  const pulseFrame = isActive ? local : 0;
  const pulseSpring = spring({
    frame: pulseFrame,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.6 },
  });
  const pulseScale = interpolate(pulseSpring, [0, 1], [0.6, 2.0]);
  const pulseOpacity = interpolate(pulseSpring, [0, 0.3, 1], [0, 0.7, 0], { extrapolateRight: 'clamp' });

  // Specular leading edge brightness
  const specularIntensity = interpolate(drawProgress, [0, 0.5, 0.9, 1], [0, 1, 0.6, 0.2]);

  if (opacity < 0.01) return null;

  return (
    <div style={{
      width: size, height: size,
      position: 'relative',
      opacity,
      transform: `scale(${iconScale * breath})`,
      filter: `drop-shadow(0 0 ${glowRadius}px ${theme.gold.glow}) drop-shadow(0 0 ${glowRadius * 0.5}px ${theme.gold.glowStrong})`,
      willChange: 'transform, opacity, filter',
      transformStyle: 'preserve-3d',
    }}>
      {/* PULSE RING (radiates outward when active) */}
      {isActive && pulseOpacity > 0.01 && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: size * 0.8, height: size * 0.8,
          marginTop: -size * 0.4, marginLeft: -size * 0.4,
          borderRadius: '50%',
          border: `1.5px solid ${theme.gold.bright}`,
          transform: `scale(${pulseScale})`,
          opacity: pulseOpacity,
          boxShadow: `0 0 12px ${theme.gold.glow}`,
          pointerEvents: 'none',
        }} />
      )}

      <svg
        viewBox={iconData.viewBox}
        width={size} height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={`glow-${iconName}`}>
            <feGaussianBlur stdDeviation="4" />
          </filter>
          {/* Golden gradient for fills */}
          <linearGradient id={`goldFill-${iconName}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.gold.warm} />
            <stop offset="50%" stopColor={theme.gold.primary} />
            <stop offset="100%" stopColor={theme.gold.bright} />
          </linearGradient>
        </defs>

        {/* Layer 1: Deep warm glow (behind everything) */}
        {fillProgress > 0.01 && iconData.paths.map((d, i) => (
          <path
            key={`deep-glow-${i}`}
            d={d}
            stroke={theme.gold.warm}
            strokeWidth={iconData.strokeWidth + 8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={fillProgress * 0.3}
            filter={`url(#glow-${iconName})`}
          />
        ))}

        {/* Layer 2: Golden fill (blooms in after draw) */}
        {fillProgress > 0.01 && iconData.fillPaths && iconData.fillPaths.map((d, i) => (
          <path
            key={`fill-${i}`}
            d={d}
            fill={`url(#goldFill-${iconName})`}
            opacity={fillProgress * 0.15}
            stroke="none"
          />
        ))}

        {/* Layer 3: Main stroke (draw-on via dashoffset) */}
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

        {/* Layer 4: Specular leading edge */}
        {drawProgress > 0.01 && drawProgress < 0.95 && iconData.paths.map((d, i) => (
          <path
            key={`spec-${i}`}
            d={d}
            stroke={theme.gold.specular}
            strokeWidth={iconData.strokeWidth + 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={`6 ${iconData.totalLength}`}
            strokeDashoffset={iconData.totalLength * (1 - drawProgress) - 3}
            opacity={specularIntensity}
          />
        ))}

        {/* Layer 5: Mid-range aura glow */}
        {fillProgress > 0.01 && iconData.paths.map((d, i) => (
          <path
            key={`aura-${i}`}
            d={d}
            stroke={theme.gold.glowStrong}
            strokeWidth={iconData.strokeWidth + 4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={fillProgress * 0.45}
            filter={`url(#glow-${iconName})`}
          />
        ))}
      </svg>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   INTERACTIVE LIGHT CAST
   ═══════════════════════════════════════════════ */
export const IconLightCast = ({ x = '50%', y = '40%', intensity = 0 }) => {
  if (intensity < 0.01) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse 50% 40% at ${x} ${y}, rgba(212,175,55,${0.08 * intensity}) 0%, transparent 70%)`,
      pointerEvents: 'none',
      zIndex: 5,
    }} />
  );
};

// Assign icon to phrase based on line index
export function getIconForLine(lineIdx) {
  return theme.icons[lineIdx % theme.icons.length];
}
