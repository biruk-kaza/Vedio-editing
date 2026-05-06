/**
 * EOTC Voice Studio — FINAL Premium Intro Sequence
 * 
 * Cinematic reveal with staggered spring animations:
 * - Smooth fade from black
 * - Cross scales in with spring + rotation + glow
 * - Title fades up with animated letter-spacing
 * - Gold divider draws from center
 * - Amharic subtitle delayed entrance
 * - Global fade-out with scale
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
  const { fps } = useVideoConfig();
  const dur = theme.timing.introDuration;

  if (frame > dur + 20) return null;

  // Fade from black
  const bgFade = interpolate(frame, [0, 35], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Cross entrance spring
  const crossProg = spring({
    frame,
    fps,
    config: { damping: 14, mass: 1.0, stiffness: 90 },
    durationInFrames: 45,
  });
  const crossScale = interpolate(crossProg, [0, 1], [0.2, 1]);
  const crossOpacity = interpolate(crossProg, [0, 1], [0, 1]);
  const crossRot = interpolate(crossProg, [0, 1], [-8, 0]);

  // Title entrance (delayed)
  const titleProg = interpolate(frame, [18, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const titleY = interpolate(titleProg, [0, 1], [25, 0]);
  const titleSpacing = interpolate(titleProg, [0, 1], [14, 8]);

  // Divider draw
  const divW = interpolate(frame, [28, 58], [0, 260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Subtitle
  const subProg = interpolate(frame, [38, 63], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Fade out
  const fadeOut = interpolate(frame, [dur - 28, dur], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const fadeScale = 1 + (1 - fadeOut) * 0.03;

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
        transform: `scale(${fadeScale})`,
      }}
    >
      {/* Black overlay */}
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
          gap: 28,
          zIndex: 31,
        }}
      >
        {/* Ethiopian Cross */}
        <svg
          viewBox="0 0 200 280"
          width={130}
          height={182}
          style={{
            opacity: crossOpacity,
            transform: `scale(${crossScale}) rotate(${crossRot}deg)`,
            filter: `drop-shadow(0 0 20px ${theme.gold.glow})`,
          }}
        >
          <g fill={theme.gold.primary}>
            <rect x="88" y="20" width="24" height="240" rx="3" />
            <rect x="30" y="68" width="140" height="24" rx="3" />
            <circle cx="100" cy="20" r="14" />
            <circle cx="30" cy="80" r="10" />
            <circle cx="170" cy="80" r="10" />
            <circle cx="100" cy="260" r="10" />
            <rect x="86" y="66" width="28" height="28" rx="4" transform="rotate(45 100 80)" />
          </g>
        </svg>

        {/* Title */}
        <div
          style={{
            opacity: titleProg,
            transform: `translateY(${titleY}px)`,
            fontSize: 40,
            fontFamily: theme.fonts.display,
            fontWeight: 300,
            color: theme.text.primary,
            letterSpacing: titleSpacing,
            textTransform: 'uppercase',
            textShadow: `0 0 35px ${theme.gold.glow}, 0 2px 10px rgba(0,0,0,0.3)`,
          }}
        >
          {title}
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: divW,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${theme.gold.primary}, transparent)`,
            opacity: titleProg * 0.8,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            opacity: subProg,
            transform: `translateY(${interpolate(subProg, [0, 1], [12, 0])}px)`,
            fontSize: 22,
            fontFamily: theme.fonts.caption,
            fontWeight: 400,
            color: theme.gold.warm,
            letterSpacing: 3,
            textShadow: `0 0 15px ${theme.gold.subtle}`,
          }}
        >
          ✦ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ✦
        </div>
      </div>
    </div>
  );
};
