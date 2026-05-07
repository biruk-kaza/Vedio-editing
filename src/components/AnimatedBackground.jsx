/**
 * EOTC Voice Studio — Cinema-Grade Background
 * 
 * ═══ ART DIRECTION ═══
 * Canvas: Deep textured charcoal #0A0A0A (not flat black)
 * Vignette: Organic, asymmetric, slowly breathing
 * Grain: Fine 35mm film grain (binds digital elements)
 * Bokeh: Extremely subtle, deep-layer atmosphere orbs
 * Gradient: Dark warm undertone — barely visible
 * 
 * NO CSS transitions. All via interpolate().
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';
import { theme } from '../utils/theme.js';

export const AnimatedBackground = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / Math.max(durationInFrames, 1);

  // Slow pulse on base gradient
  const basePulse = interpolate(Math.sin(frame * 0.008), [-1, 1], [0.82, 1.0]);

  // Organic bokeh orbs — extremely slow, deep layer
  const orbs = [
    { x: 48 + Math.sin(frame * 0.003) * 14, y: 30 + Math.cos(frame * 0.0025) * 10, size: 700, color: 'rgba(70,30,110,0.05)', blur: 130 },
    { x: 72 + Math.cos(frame * 0.002) * 16, y: 60 + Math.sin(frame * 0.003) * 12, size: 550, color: 'rgba(212,175,55,0.03)', blur: 140 },
    { x: 22 + Math.sin(frame * 0.0025 + 2) * 10, y: 74 + Math.cos(frame * 0.004) * 7, size: 500, color: 'rgba(15,40,80,0.04)', blur: 120 },
  ];

  // Organic vignette — asymmetric, breathing
  // Offset center slightly and wobble
  const vigX = 50 + Math.sin(frame * 0.005) * 3;
  const vigY = 50 + Math.cos(frame * 0.004) * 2;
  const vigStrength = interpolate(Math.sin(frame * 0.006), [-1, 1], [0.50, 0.62]);

  // Secondary warm edge vignette
  const warmVigStrength = interpolate(Math.sin(frame * 0.003 + 1), [-1, 1], [0.02, 0.05]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg.deep, overflow: 'hidden' }}>
      {/* Subtle warm gradient undertone */}
      <div style={{
        position: 'absolute', inset: '-15%',
        background: `radial-gradient(ellipse 75% 55% at 50% 42%, ${theme.bg.gradient1} 0%, ${theme.bg.gradient2} 45%, ${theme.bg.deep} 100%)`,
        opacity: basePulse,
        transform: `rotate(${t * 8}deg) scale(1.06)`,
      }} />

      {/* Deep bokeh orbs */}
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${o.x}%`, top: `${o.y}%`,
          width: o.size, height: o.size, borderRadius: '50%',
          background: `radial-gradient(circle, ${o.color} 0%, transparent 65%)`,
          transform: 'translate(-50%,-50%)',
          filter: `blur(${o.blur}px)`,
        }} />
      ))}

      {/* 35mm Film Grain — fine texture to bind elements */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: theme.bg.grainOpacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
        backgroundSize: theme.bg.grainScale,
        mixBlendMode: 'overlay',
      }} />

      {/* Organic asymmetric vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 52% 40% at ${vigX}% ${vigY}%, transparent 8%, rgba(0,0,0,${vigStrength}) 100%)`,
      }} />

      {/* Warm edge tint (barely visible golden edge) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 60% 50% at 50% 50%, transparent 30%, rgba(212,175,55,${warmVigStrength}) 100%)`,
      }} />

      {/* Cinematic letterbox gradients */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '10%', background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '15%', background: 'linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 100%)' }} />
    </AbsoluteFill>
  );
};
