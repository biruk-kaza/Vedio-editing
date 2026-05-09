/**
 * EOTC Voice Studio — Liquid Aurora Background
 * 
 * Uses @remotion/noise to generate an impossibly smooth,
 * non-repeating fluid simulation for the background.
 * Looks like expensive Apple/Stripe motion graphics.
 */
import React from 'react';
import { useCurrentFrame, AbsoluteFill, useVideoConfig } from 'remotion';
import { noise3D } from '@remotion/noise';
import { theme } from '../utils/theme.js';

export const AnimatedBackground = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  // Generate ultra-smooth fluid movement vectors using 3D noise
  // We use time as the Z-axis so it morphs seamlessly over time
  const getOrbPosition = (seed, speedX, speedY, offset) => {
    // Noise returns -1 to 1. We map it to -20% to 120% of the screen
    const nx = noise3D('x' + seed, time * speedX, 0, offset);
    const ny = noise3D('y' + seed, 0, time * speedY, offset);
    return {
      x: 50 + nx * 70, // Swirls smoothly across the entire X axis
      y: 50 + ny * 70, // Swirls smoothly across the entire Y axis
    };
  };

  const orb1 = getOrbPosition('gold1', 0.1, 0.15, 0);
  const orb2 = getOrbPosition('gold2', 0.12, 0.1, 100);
  const orb3 = getOrbPosition('deep1', 0.08, 0.12, 200);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg.deep, overflow: 'hidden' }}>
      
      {/* Base charcoal layer */}
      <AbsoluteFill style={{ backgroundColor: '#07080a' }} />

      {/* Fluid Orb 1 - Bright Warm Gold */}
      <div style={{
        position: 'absolute',
        left: `${orb1.x}%`,
        top: `${orb1.y}%`,
        width: '1200px',
        height: '1200px',
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 60%)`,
        filter: 'blur(100px)',
        willChange: 'transform',
      }} />

      {/* Fluid Orb 2 - Deep Copper/Bronze */}
      <div style={{
        position: 'absolute',
        left: `${orb2.x}%`,
        top: `${orb2.y}%`,
        width: '1400px',
        height: '1400px',
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, rgba(160,80,30,0.12) 0%, transparent 60%)`,
        filter: 'blur(120px)',
        willChange: 'transform',
      }} />

      {/* Fluid Orb 3 - Deep Navy/Purple (Provides contrast) */}
      <div style={{
        position: 'absolute',
        left: `${orb3.x}%`,
        top: `${orb3.y}%`,
        width: '1600px',
        height: '1600px',
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, rgba(30,40,80,0.15) 0%, transparent 60%)`,
        filter: 'blur(140px)',
        willChange: 'transform',
      }} />

      {/* 35mm Film Grain — binds the liquid gradients into a tactile cinematic surface */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: theme.bg.grainOpacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
        backgroundSize: theme.bg.grainScale,
        mixBlendMode: 'overlay',
      }} />

      {/* Edge darkening (Vignette) */}
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 150px rgba(0,0,0,0.9)', pointerEvents: 'none' }} />

    </AbsoluteFill>
  );
};
