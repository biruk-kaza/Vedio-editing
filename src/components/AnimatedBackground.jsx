/**
 * EOTC Voice Studio — Cinematic Background
 * 
 * Deep black canvas with purposeful, subtle atmospheric layers:
 * 1. Rich radial gradient (barely visible — just adds depth)
 * 2. Organic bokeh orbs (slow, dreamy drift)
 * 3. Soft pulsing vignette (breathes slowly)
 * 4. Film grain texture
 * 5. Cinematic letterbox gradients
 * 
 * NO random shapes. Background serves the typography.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

export const AnimatedBackground = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / Math.max(durationInFrames, 1);

  // Slow pulse on base gradient
  const basePulse = interpolate(Math.sin(frame * 0.01), [-1, 1], [0.85, 1.0]);

  // Organic bokeh orbs — very slow, dreamy
  const orbs = [
    { x: 50 + Math.sin(frame * 0.004) * 16, y: 28 + Math.cos(frame * 0.003) * 12, size: 650, color: 'rgba(80,35,130,0.07)', blur: 110 },
    { x: 70 + Math.cos(frame * 0.0025) * 18, y: 62 + Math.sin(frame * 0.004) * 14, size: 500, color: 'rgba(201,169,110,0.05)', blur: 120 },
    { x: 25 + Math.sin(frame * 0.003 + 2) * 12, y: 76 + Math.cos(frame * 0.005) * 8, size: 480, color: 'rgba(18,50,100,0.06)', blur: 100 },
    { x: 58 + Math.cos(frame * 0.005 + 1) * 10, y: 38 + Math.sin(frame * 0.0025 + 3) * 16, size: 420, color: 'rgba(120,50,70,0.04)', blur: 130 },
  ];

  // Soft pulsing vignette — breathes slowly
  const vignetteStrength = interpolate(
    Math.sin(frame * 0.008),
    [-1, 1],
    [0.45, 0.55]
  );

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: theme.bg.deep }}>
      {/* Base gradient — barely visible warmth */}
      <div style={{
        position: 'absolute', inset: '-20%',
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${theme.bg.gradient1} 0%, ${theme.bg.gradient2} 40%, ${theme.bg.deep} 100%)`,
        opacity: basePulse,
        transform: `rotate(${t * 12}deg) scale(1.08)`,
      }} />

      {/* Bokeh orbs */}
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${o.x}%`, top: `${o.y}%`,
          width: o.size, height: o.size, borderRadius: '50%',
          background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
          transform: 'translate(-50%,-50%)', filter: `blur(${o.blur}px)`,
        }} />
      ))}

      {/* Film grain */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.018,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }} />

      {/* Pulsing vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 55% 42% at 50% 50%, transparent 10%, rgba(0,0,0,${vignetteStrength}) 100%)`,
      }} />

      {/* Letterbox gradients */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12%', background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '18%', background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)' }} />
    </div>
  );
};
