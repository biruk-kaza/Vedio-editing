/**
 * EOTC Voice Studio — FINAL Premium Outro Sequence
 * 
 * Cinematic closing card:
 * - Smooth cubic fade from content
 * - Spring-animated cross + branding
 * - Pulsing gold glow on cross
 * - Animated divider width
 * - Clean fade to black
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

export const OutroSequence = ({ outroStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - outroStartFrame;
  const dur = theme.timing.outroDuration;

  if (rel < -5 || rel > dur + 10) return null;

  // Fade in
  const fadeIn = interpolate(rel, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Content spring entrance
  const sp = spring({
    frame: Math.max(0, rel),
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 100 },
    durationInFrames: 35,
  });

  // Fade to black
  const toBlack = interpolate(rel, [dur - 25, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const contentY = interpolate(sp, [0, 1], [35, 0]);
  const contentScale = interpolate(sp, [0, 1], [0.95, 1]);
  const divW = interpolate(sp, [0, 1], [0, 200]);

  // Cross glow pulse
  const glowStr = interpolate(Math.sin(rel * 0.06), [-1, 1], [0.5, 1.0]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(5, 5, 8, 0.7)',
          opacity: fadeIn,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          opacity: fadeIn,
          transform: `translateY(${contentY}px) scale(${contentScale})`,
          zIndex: 1,
        }}
      >
        {/* Cross with glow */}
        <svg
          viewBox="0 0 200 280"
          width={75}
          height={105}
          style={{
            filter: `drop-shadow(0 0 ${12 * glowStr}px ${theme.gold.glow})`,
          }}
        >
          <g fill={theme.gold.primary}>
            <rect x="88" y="20" width="24" height="240" rx="3" />
            <rect x="30" y="68" width="140" height="24" rx="3" />
            <circle cx="100" cy="20" r="14" />
            <circle cx="30" cy="80" r="10" />
            <circle cx="170" cy="80" r="10" />
            <circle cx="100" cy="260" r="10" />
          </g>
        </svg>

        {/* Divider */}
        <div
          style={{
            width: divW,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${theme.gold.primary}, transparent)`,
          }}
        />

        {/* Brand */}
        <div
          style={{
            fontSize: 26,
            fontFamily: theme.fonts.display,
            fontWeight: 300,
            color: theme.text.primary,
            letterSpacing: 7,
            textTransform: 'uppercase',
            textShadow: `0 0 20px ${theme.gold.subtle}`,
          }}
        >
          EOTC VOICE STUDIO
        </div>

        {/* Amharic */}
        <div
          style={{
            fontSize: 19,
            fontFamily: theme.fonts.caption,
            color: theme.gold.warm,
            opacity: 0.75,
            letterSpacing: 1,
          }}
        >
          ክብር ለእግዚአብሔር
        </div>
      </div>

      {/* Fade to black */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000',
          opacity: toBlack,
          zIndex: 2,
        }}
      />
    </div>
  );
};
