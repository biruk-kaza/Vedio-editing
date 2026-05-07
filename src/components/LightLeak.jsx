/**
 * EOTC Voice Studio — Custom Light Leak Overlay
 * 
 * Cinematic light leak flares at scene transition points.
 * Golden/amber anamorphic flare that sweeps across the frame.
 * 
 * Used at: intro→main and main→outro transitions.
 * NOT random — triggered at specific frame ranges.
 */
import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  AbsoluteFill,
  Easing,
} from 'remotion';
import { theme } from '../utils/theme.js';

export const LightLeak = ({ startFrame = 0, durationFrames = 25 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < -5 || localFrame > durationFrames + 10) return null;

  // Normalized progress 0→1
  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });

  // Flare sweeps from left to right
  const flareX = interpolate(progress, [0, 1], [-30, 130]);

  // Intensity: ramps up, peaks at 40%, fades out
  const intensity = interpolate(progress, [0, 0.3, 0.5, 0.8, 1], [0, 0.7, 1, 0.5, 0]);

  // Vertical wobble
  const flareY = 40 + Math.sin(progress * Math.PI * 2) * 15;

  // Scale breathing
  const flareScale = interpolate(progress, [0, 0.5, 1], [0.6, 1.2, 0.8]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 18, overflow: 'hidden' }}>
      {/* Main anamorphic flare */}
      <div style={{
        position: 'absolute',
        left: `${flareX}%`,
        top: `${flareY}%`,
        width: 600,
        height: 200,
        transform: `translate(-50%, -50%) scale(${flareScale}) rotate(-8deg)`,
        background: `radial-gradient(ellipse 100% 40% at 50% 50%, rgba(232,213,163,${0.25 * intensity}) 0%, rgba(201,169,110,${0.12 * intensity}) 40%, transparent 80%)`,
        filter: `blur(${40 + (1 - intensity) * 20}px)`,
      }} />

      {/* Secondary horizontal streak */}
      <div style={{
        position: 'absolute',
        left: `${flareX - 10}%`,
        top: `${flareY + 5}%`,
        width: '120%',
        height: 3,
        transform: 'translateY(-50%)',
        background: `linear-gradient(90deg, transparent 10%, rgba(232,213,163,${0.15 * intensity}) 40%, rgba(255,240,200,${0.25 * intensity}) 50%, rgba(232,213,163,${0.15 * intensity}) 60%, transparent 90%)`,
        filter: `blur(${6 + (1 - intensity) * 4}px)`,
      }} />

      {/* Warm color wash */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 60% 50% at ${flareX}% ${flareY}%, rgba(201,169,110,${0.04 * intensity}) 0%, transparent 70%)`,
      }} />
    </AbsoluteFill>
  );
};
