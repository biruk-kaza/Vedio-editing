/**
 * EOTC Voice Studio — Ultra-Premium Animated Background
 * 
 * Multi-layer cinematic backdrop with:
 * 1. Deep radial base gradient with gentle color cycling
 * 2. Multiple drifting bokeh orbs with organic bezier motion
 * 3. Soft aurora bands that sweep across the frame
 * 4. Film grain texture overlay
 * 5. Cinematic vignette
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

export const AnimatedBackground = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Normalized time 0→1
  const t = frame / Math.max(durationInFrames, 1);

  // ── Slow color cycling on base gradient ──
  const hueShift = Math.sin(t * Math.PI * 2) * 8;
  const basePulse = interpolate(
    Math.sin(frame * 0.012),
    [-1, 1],
    [0.88, 1.0]
  );

  // ── Orb positions — smooth sine/cosine paths ──
  const orbs = [
    {
      x: 50 + Math.sin(frame * 0.005) * 18,
      y: 25 + Math.cos(frame * 0.004) * 14,
      size: 700,
      color: `rgba(90, 40, 150, 0.09)`,
      blur: 100,
    },
    {
      x: 72 + Math.cos(frame * 0.003) * 20,
      y: 60 + Math.sin(frame * 0.005) * 16,
      size: 550,
      color: `rgba(212, 165, 116, 0.07)`,
      blur: 110,
    },
    {
      x: 22 + Math.sin(frame * 0.004 + 2) * 14,
      y: 78 + Math.cos(frame * 0.006) * 10,
      size: 500,
      color: `rgba(20, 60, 120, 0.08)`,
      blur: 90,
    },
    {
      x: 60 + Math.cos(frame * 0.006 + 1) * 12,
      y: 40 + Math.sin(frame * 0.003 + 3) * 18,
      size: 480,
      color: `rgba(140, 60, 80, 0.06)`,
      blur: 120,
    },
    {
      x: 35 + Math.sin(frame * 0.007) * 10,
      y: 15 + Math.cos(frame * 0.005 + 1) * 12,
      size: 400,
      color: `rgba(180, 140, 90, 0.05)`,
      blur: 95,
    },
  ];

  // ── Aurora sweep ──
  const auroraX = Math.sin(frame * 0.003) * 30;
  const auroraOpacity = interpolate(
    Math.sin(frame * 0.01),
    [-1, 1],
    [0.02, 0.06]
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
      {/* Layer 1: Base radial gradient */}
      <div
        style={{
          position: 'absolute',
          inset: '-25%',
          background: `
            radial-gradient(
              ellipse 85% 65% at 50% 38%,
              ${theme.bg.gradient1} 0%,
              ${theme.bg.gradient2} 35%,
              ${theme.bg.gradient4} 65%,
              ${theme.bg.deep} 100%
            )
          `,
          opacity: basePulse,
          transform: `rotate(${t * 15}deg) scale(1.1)`,
        }}
      />

      {/* Layer 2: Drifting bokeh orbs */}
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: `blur(${orb.blur}px)`,
          }}
        />
      ))}

      {/* Layer 3: Aurora sweep */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: `${30 + auroraX}%`,
          width: '60%',
          height: '45%',
          background: `linear-gradient(
            135deg,
            rgba(100, 50, 160, 0.04) 0%,
            rgba(212, 165, 116, 0.03) 50%,
            rgba(40, 80, 140, 0.04) 100%
          )`,
          opacity: auroraOpacity,
          filter: 'blur(80px)',
          borderRadius: '50%',
          transform: `rotate(${frame * 0.03}deg)`,
        }}
      />

      {/* Layer 4: Film grain texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Layer 5: Cinematic vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(
              ellipse 65% 50% at 50% 50%,
              transparent 20%,
              rgba(0, 0, 0, 0.45) 100%
            )
          `,
        }}
      />

      {/* Layer 6: Top/bottom gradient bars for cinematic feel */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '12%',
          background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '18%',
          background: `linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)`,
        }}
      />
    </div>
  );
};
