/**
 * EOTC Voice Studio — Cinematic Progress Bar
 * 
 * Thin gold line at the bottom of the screen that tracks
 * frame / durationInFrames. Feels like a premium video player.
 * 
 * ✅ interpolate for smooth width
 * ✅ Gold gradient with glow
 * ✅ Fades in after intro, fades out before outro
 */
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  Easing,
} from 'remotion';
import { theme } from '../utils/theme.js';

export const ProgressBar = ({ introFrames = 90, outroFrames = 90 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Progress: 0% → 100% over full video
  const progress = frame / Math.max(durationInFrames - 1, 1);
  const widthPercent = progress * 100;

  // Fade in after intro
  const fadeIn = interpolate(frame, [introFrames, introFrames + 20], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Fade out before outro
  const outroStart = durationInFrames - outroFrames;
  const fadeOut = interpolate(frame, [outroStart - 10, outroStart + 5], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const opacity = fadeIn * fadeOut;
  if (opacity < 0.01) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 25 }}>
      {/* Track (background) */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: '8%',
        right: '8%',
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 1,
        opacity,
      }}>
        {/* Fill (gold gradient) */}
        <div style={{
          width: `${widthPercent}%`,
          height: '100%',
          borderRadius: 1,
          background: `linear-gradient(90deg, ${theme.gold.warm}, ${theme.gold.bright})`,
          boxShadow: `0 0 8px ${theme.gold.glow}, 0 0 2px ${theme.gold.primary}`,
          position: 'relative',
        }}>
          {/* Dot at end */}
          <div style={{
            position: 'absolute',
            right: -3,
            top: -2.5,
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: theme.gold.bright,
            boxShadow: `0 0 6px ${theme.gold.glow}`,
          }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
