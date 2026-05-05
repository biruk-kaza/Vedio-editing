/**
 * EOTC Voice Studio — Animated Background
 * 
 * Cinematic multi-layer gradient background with slow, organic drift.
 * Creates a living, breathing backdrop that feels sacred and premium.
 * 
 * Layers:
 * 1. Base radial gradient (deep purple → navy → black)
 * 2. Drifting color orbs (subtle, out-of-focus light patches)
 * 3. Vignette overlay
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

export const AnimatedBackground = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Slow orbital drift — cycle over ~20 seconds
  const drift = (frame / durationInFrames) * 360;
  const slowDrift = drift * 0.15;

  // Orb positions drift organically
  const orb1X = 50 + Math.sin((frame * 0.008)) * 15;
  const orb1Y = 30 + Math.cos((frame * 0.006)) * 12;
  const orb2X = 70 + Math.cos((frame * 0.005)) * 18;
  const orb2Y = 65 + Math.sin((frame * 0.007)) * 14;
  const orb3X = 25 + Math.sin((frame * 0.004)) * 10;
  const orb3Y = 80 + Math.cos((frame * 0.009)) * 8;

  // Subtle pulse on the main gradient
  const pulseIntensity = interpolate(
    Math.sin(frame * 0.02),
    [-1, 1],
    [0.85, 1.0]
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: theme.bg.deep,
      }}
    >
      {/* Layer 1: Base gradient */}
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `
            radial-gradient(
              ellipse 80% 60% at 50% 40%,
              ${theme.bg.gradient1} 0%,
              ${theme.bg.gradient2} 45%,
              ${theme.bg.deep} 100%
            )
          `,
          opacity: pulseIntensity,
          transform: `rotate(${slowDrift}deg)`,
        }}
      />

      {/* Layer 2: Drifting color orbs */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* Warm purple orb */}
        <div
          style={{
            position: 'absolute',
            left: `${orb1X}%`,
            top: `${orb1Y}%`,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(120, 60, 180, 0.12) 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Gold orb */}
        <div
          style={{
            position: 'absolute',
            left: `${orb2X}%`,
            top: `${orb2Y}%`,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.gold.subtle} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(90px)',
          }}
        />
        {/* Deep blue orb */}
        <div
          style={{
            position: 'absolute',
            left: `${orb3X}%`,
            top: `${orb3Y}%`,
            width: 450,
            height: 450,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(30, 80, 140, 0.1) 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(70px)',
          }}
        />
      </div>

      {/* Layer 3: Subtle grain texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Layer 4: Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(
              ellipse 70% 50% at 50% 50%,
              transparent 30%,
              rgba(0, 0, 0, 0.5) 100%
            )
          `,
        }}
      />
    </div>
  );
};
