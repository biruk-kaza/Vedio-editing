/**
 * EOTC Voice Studio — Outro Sequence (Remotion Best Practice)
 * 
 * ✅ AbsoluteFill layout
 * ✅ spring for organic pop
 * ✅ Composing: progress → properties
 * ✅ Easing.in for fade-to-black
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

export const OutroSequence = ({ outroStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // frame is local to this Sequence (starts at 0)
  const dur = theme.timing.outroDuration;

  if (frame > dur + 10) return null;

  // Fade in background
  const fadeIn = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_ENTER,
  });

  // Content spring
  const sp = spring({
    frame, fps,
    config: { damping: 16, mass: 0.8, stiffness: 100 },
    durationInFrames: 35,
  });
  const contentY = interpolate(sp, [0, 1], [30, 0]);
  const contentScale = interpolate(sp, [0, 1], [0.95, 1]);
  const divW = interpolate(sp, [0, 1], [0, 180]);
  const glowStr = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.5, 1.0]);

  // Fade to black
  const toBlack = interpolate(frame, [dur - 25, dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ zIndex: 20, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(3,3,5,0.75)', opacity: fadeIn,
      }} />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
        opacity: fadeIn, transform: `translateY(${contentY}px) scale(${contentScale})`, zIndex: 1,
      }}>
        <svg viewBox="0 0 200 280" width={70} height={98} style={{
          filter: `drop-shadow(0 0 ${12 * glowStr}px ${theme.gold.glow})`,
        }}>
          <g fill={theme.gold.primary}>
            <rect x="88" y="20" width="24" height="240" rx="3" />
            <rect x="30" y="68" width="140" height="24" rx="3" />
            <circle cx="100" cy="20" r="14" />
            <circle cx="30" cy="80" r="10" />
            <circle cx="170" cy="80" r="10" />
            <circle cx="100" cy="260" r="10" />
          </g>
        </svg>

        <div style={{
          width: divW, height: 1,
          background: `linear-gradient(90deg, transparent, ${theme.gold.primary}, transparent)`,
        }} />

        <div style={{
          fontSize: 24, fontFamily: theme.fonts.display, fontWeight: 300,
          color: theme.text.primary, letterSpacing: 7, textTransform: 'uppercase',
          textShadow: `0 0 16px ${theme.gold.subtle}`,
        }}>EOTC VOICE STUDIO</div>

        <div style={{
          fontSize: 18, fontFamily: theme.fonts.caption,
          color: theme.gold.warm, opacity: 0.7, letterSpacing: 1,
        }}>ክብር ለእግዚአብሔር</div>
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#000', opacity: toBlack, zIndex: 2,
      }} />
    </AbsoluteFill>
  );
};
