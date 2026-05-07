/**
 * EOTC Voice Studio — Intro Sequence (Remotion Best Practice)
 * 
 * ✅ AbsoluteFill layout
 * ✅ interpolate + Easing.bezier for all motion
 * ✅ spring for organic pop
 * ✅ Composing: single progress drives multiple properties
 */
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Easing,
} from 'remotion';
import { theme } from '../utils/theme.js';

const EASE_ENTER = Easing.bezier(0.16, 1, 0.3, 1);

export const IntroSequence = ({ title = 'EOTC Voice Studio' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = theme.timing.introDuration;

  if (frame > dur + 20) return null;

  // Black overlay fade
  const bgFade = interpolate(frame, [0, 35], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Cross: spring entrance
  const crossSpring = spring({
    frame, fps,
    config: { damping: 14, mass: 1.0, stiffness: 90 },
    durationInFrames: 45,
  });
  const crossScale = interpolate(crossSpring, [0, 1], [0.2, 1]);
  const crossOp = interpolate(crossSpring, [0, 1], [0, 1]);

  // Title: composing progress → multiple properties
  const titleProgress = interpolate(frame, [18, 48], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_ENTER,
  });
  const titleScale = interpolate(titleProgress, [0, 1], [0.95, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [18, 0]);
  const titleSpacing = interpolate(titleProgress, [0, 1], [14, 7]);
  const titleGlow = interpolate(titleProgress, [0, 0.5, 1], [0, 1, 0.4]);

  // Divider width
  const divW = interpolate(frame, [28, 58], [0, 240], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_ENTER,
  });

  // Subtitle
  const subProgress = interpolate(frame, [38, 63], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_ENTER,
  });

  // Exit: everything fades + scales slightly
  const exitProgress = interpolate(frame, [dur - 28, dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const fadeOut = 1 - exitProgress;
  const fadeScale = 1 + exitProgress * 0.025;

  return (
    <AbsoluteFill
      style={{
        zIndex: 20,
        justifyContent: 'center', alignItems: 'center',
        opacity: fadeOut, transform: `scale(${fadeScale})`,
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, backgroundColor: '#000',
        opacity: bgFade, zIndex: 30,
      }} />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, zIndex: 31,
      }}>
        <svg viewBox="0 0 200 280" width={120} height={168} style={{
          opacity: crossOp,
          transform: `scale(${crossScale})`,
          filter: `drop-shadow(0 0 18px ${theme.gold.glow})`,
        }}>
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

        <div style={{
          opacity: titleProgress,
          transform: `translateY(${titleY}px) scale(${titleScale})`,
          fontSize: 38, fontFamily: theme.fonts.display, fontWeight: 300,
          color: theme.text.primary, letterSpacing: titleSpacing,
          textTransform: 'uppercase',
          textShadow: `0 0 ${30 * titleGlow}px ${theme.gold.glow}, 0 2px 8px rgba(0,0,0,0.3)`,
        }}>
          {title}
        </div>

        <div style={{
          width: divW, height: 1.5,
          background: `linear-gradient(90deg, transparent, ${theme.gold.primary}, transparent)`,
          opacity: titleProgress * 0.8,
        }} />

        <div style={{
          opacity: subProgress,
          transform: `translateY(${interpolate(subProgress, [0, 1], [10, 0])}px) scale(${interpolate(subProgress, [0, 1], [0.95, 1])})`,
          fontSize: 21, fontFamily: theme.fonts.caption, fontWeight: 400,
          color: theme.gold.warm, letterSpacing: 3,
          textShadow: `0 0 12px ${theme.gold.subtle}`,
        }}>
          ✦ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ✦
        </div>
      </div>
    </AbsoluteFill>
  );
};
