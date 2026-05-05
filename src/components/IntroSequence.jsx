/**
 * EOTC Voice Studio — Intro Sequence
 * 
 * Cinematic fade-in with:
 * - Background fades in from black
 * - Ethiopian cross scales in with spring animation
 * - Title text fades up
 * - Golden divider line draws in
 * - Everything fades out before captions begin
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

export const IntroSequence = ({ title = 'EOTC Voice Studio' }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const introDuration = theme.timing.introDuration;

  // Only render during intro period
  if (frame > introDuration + 15) return null;

  // ── Phase timings (in frames) ──
  // 0-30: fade from black, cross appears
  // 15-50: title fades up
  // 25-55: divider draws in
  // 60-90: everything fades out

  // Background fade from solid black
  const bgFade = interpolate(frame, [0, 30], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Cross entrance with spring
  const crossSpring = spring({
    frame,
    fps,
    config: { damping: 15, mass: 1.2, stiffness: 100 },
    durationInFrames: 40,
  });

  const crossScale = interpolate(crossSpring, [0, 1], [0.3, 1]);
  const crossOpacity = interpolate(crossSpring, [0, 1], [0, 1]);

  // Title entrance
  const titleProgress = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const titleOpacity = titleProgress;
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  // Divider line draw
  const dividerWidth = interpolate(frame, [25, 55], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Subtitle
  const subtitleProgress = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Global fade out
  const fadeOut = interpolate(frame, [introDuration - 25, introDuration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
        opacity: fadeOut,
      }}
    >
      {/* Black overlay for fade-from-black */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000',
          opacity: bgFade,
          zIndex: 30,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          zIndex: 31,
        }}
      >
        {/* Ethiopian Cross */}
        <svg
          viewBox="0 0 200 280"
          width={140}
          height={196}
          style={{
            opacity: crossOpacity,
            transform: `scale(${crossScale})`,
          }}
        >
          <g fill={theme.gold.primary}>
            <rect x="88" y="20" width="24" height="240" rx="3" />
            <rect x="30" y="68" width="140" height="24" rx="3" />
            <circle cx="100" cy="20" r="14" />
            <circle cx="30" cy="80" r="10" />
            <circle cx="170" cy="80" r="10" />
            <circle cx="100" cy="260" r="10" />
            <rect
              x="86" y="66" width="28" height="28" rx="4"
              transform="rotate(45 100 80)"
            />
          </g>
        </svg>

        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontSize: 42,
            fontFamily: theme.fonts.display,
            fontWeight: 300,
            color: theme.text.primary,
            letterSpacing: 8,
            textTransform: 'uppercase',
            textShadow: `0 0 30px ${theme.gold.glow}`,
          }}
        >
          {title}
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: `${dividerWidth * 2.5}px`,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${theme.gold.primary}, transparent)`,
            opacity: titleOpacity,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleProgress,
            transform: `translateY(${interpolate(subtitleProgress, [0, 1], [15, 0])}px)`,
            fontSize: 22,
            fontFamily: theme.fonts.caption,
            fontWeight: 400,
            color: theme.gold.warm,
            letterSpacing: 2,
          }}
        >
          ✦ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ✦
        </div>
      </div>
    </div>
  );
};
