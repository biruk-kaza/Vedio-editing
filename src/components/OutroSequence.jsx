/**
 * EOTC Voice Studio — Premium Outro Sequence
 * 
 * Cinematic closing card with:
 * - Smooth fade from content
 * - Spring-animated cross + branding
 * - Pulsing gold glow
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

  const relativeFrame = frame - outroStartFrame;
  const outroDuration = theme.timing.outroDuration;

  // Only render during outro
  if (relativeFrame < -5 || relativeFrame > outroDuration + 10) return null;

  // Smooth cubic fade in
  const fadeIn = interpolate(relativeFrame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Content entrance spring
  const contentSpring = spring({
    frame: Math.max(0, relativeFrame),
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 100 },
    durationInFrames: 35,
  });

  // Fade to black at the very end
  const fadeToBlack = interpolate(
    relativeFrame,
    [outroDuration - 25, outroDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) }
  );

  const contentY = interpolate(contentSpring, [0, 1], [35, 0]);
  const contentScale = interpolate(contentSpring, [0, 1], [0.95, 1]);

  // Subtle gold pulse on cross
  const crossGlow = interpolate(
    Math.sin(relativeFrame * 0.06),
    [-1, 1],
    [0.5, 1.0]
  );

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
            filter: `drop-shadow(0 0 ${12 * crossGlow}px ${theme.gold.glow})`,
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
            width: interpolate(contentSpring, [0, 1], [0, 200]),
            height: 1,
            background: `linear-gradient(90deg, transparent, ${theme.gold.primary}, transparent)`,
          }}
        />

        {/* Brand text */}
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

        {/* Amharic tag */}
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
