/**
 * EOTC Voice Studio — Premium Intro Sequence
 * 
 * Cinematic reveal with staggered animations:
 * - Fade from black with smooth ease
 * - Cross scales in with spring + subtle rotation
 * - Title text fades up with letter-spacing animation
 * - Golden divider draws from center out
 * - Amharic subtitle with delayed entrance
 * - Smooth global fade-out with scale
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

  const introDuration = theme.timing.introDuration;

  // Only render during intro period
  if (frame > introDuration + 20) return null;

  // ── Fade from black — smooth cubic ease ──
  const bgFade = interpolate(frame, [0, 35], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // ── Cross entrance — spring with slight rotation ──
  const crossSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 1.0, stiffness: 90 },
    durationInFrames: 45,
  });

  const crossScale = interpolate(crossSpring, [0, 1], [0.2, 1]);
  const crossOpacity = interpolate(crossSpring, [0, 0.3, 1], [0, 0.5, 1]);
  const crossRotation = interpolate(crossSpring, [0, 1], [-8, 0]);

  // ── Title entrance — staggered after cross ──
  const titleDelay = 18;
  const titleProgress = interpolate(frame, [titleDelay, titleDelay + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const titleOpacity = titleProgress;
  const titleY = interpolate(titleProgress, [0, 1], [25, 0]);
  const titleLetterSpacing = interpolate(titleProgress, [0, 1], [14, 8]);

  // ── Gold divider draw ──
  const dividerDelay = 28;
  const dividerWidth = interpolate(frame, [dividerDelay, dividerDelay + 30], [0, 260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // ── Subtitle — delayed fade up ──
  const subDelay = 38;
  const subtitleProgress = interpolate(frame, [subDelay, subDelay + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // ── Global fade out — smooth with scale ──
  const fadeOut = interpolate(frame, [introDuration - 28, introDuration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const fadeOutScale = interpolate(frame, [introDuration - 28, introDuration], [1, 1.03], {
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
        transform: `scale(${fadeOutScale})`,
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
            transform: `scale(${crossScale}) rotate(${crossRotation}deg)`,
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
            fontSize: 40,
            fontFamily: theme.fonts.display,
            fontWeight: 300,
            color: theme.text.primary,
            letterSpacing: titleLetterSpacing,
            textTransform: 'uppercase',
            textShadow: `0 0 35px ${theme.gold.glow}, 0 2px 10px rgba(0,0,0,0.3)`,
          }}
        >
          {title}
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: dividerWidth,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${theme.gold.primary}, transparent)`,
            opacity: titleOpacity * 0.8,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleProgress,
            transform: `translateY(${interpolate(subtitleProgress, [0, 1], [12, 0])}px)`,
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
