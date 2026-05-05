/**
 * EOTC Voice Studio — Outro Sequence
 * 
 * Branded closing card with:
 * - Fade-in from content
 * - Cross + branding
 * - Fade to black
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
  const { fps, durationInFrames } = useVideoConfig();

  const relativeFrame = frame - outroStartFrame;
  const outroDuration = theme.timing.outroDuration;

  // Only render during outro
  if (relativeFrame < -5 || relativeFrame > outroDuration + 10) return null;

  // Fade in
  const fadeIn = interpolate(relativeFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Content entrance
  const contentSpring = spring({
    frame: Math.max(0, relativeFrame),
    fps,
    config: { damping: 18, mass: 1, stiffness: 120 },
    durationInFrames: 30,
  });

  // Fade to black at the very end
  const fadeToBlack = interpolate(
    relativeFrame,
    [outroDuration - 20, outroDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const contentY = interpolate(contentSpring, [0, 1], [40, 0]);

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
      {/* Semi-transparent overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          opacity: fadeIn,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          opacity: fadeIn,
          transform: `translateY(${contentY}px)`,
          zIndex: 1,
        }}
      >
        {/* Small cross */}
        <svg
          viewBox="0 0 200 280"
          width={80}
          height={112}
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
            width: 180,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${theme.gold.primary}, transparent)`,
          }}
        />

        {/* Brand text */}
        <div
          style={{
            fontSize: 28,
            fontFamily: theme.fonts.display,
            fontWeight: 300,
            color: theme.text.primary,
            letterSpacing: 6,
            textTransform: 'uppercase',
          }}
        >
          EOTC Voice Studio
        </div>

        {/* Amharic tag */}
        <div
          style={{
            fontSize: 20,
            fontFamily: theme.fonts.caption,
            color: theme.gold.warm,
            opacity: 0.8,
          }}
        >
          ክብር ለእግዚአብሔር
        </div>
      </div>

      {/* Final fade to black */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000',
          opacity: fadeToBlack,
          zIndex: 2,
        }}
      />
    </div>
  );
};
