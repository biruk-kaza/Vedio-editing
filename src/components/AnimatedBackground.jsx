/**
 * EOTC Voice Studio — Premium Cinematic Background
 * 
 * Clean, purposeful layers — no random floating shapes.
 * The background should be a beautiful living backdrop,
 * not compete with the kinetic typography.
 * 
 * Layers:
 * 1. Deep radial gradient with slow color cycling
 * 2. Drifting bokeh orbs (organic, subtle)
 * 3. Aurora sweep
 * 4. Film grain texture
 * 5. Cinematic vignette
 * 6. Letterbox bars
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

export const AnimatedBackground = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / Math.max(durationInFrames, 1);

  const basePulse = interpolate(Math.sin(frame * 0.012), [-1, 1], [0.88, 1.0]);

  // Organic bokeh orbs — slow, purposeful movement
  const orbs = [
    { x: 50 + Math.sin(frame * 0.005) * 18, y: 25 + Math.cos(frame * 0.004) * 14, size: 700, color: 'rgba(90,40,150,0.09)', blur: 100 },
    { x: 72 + Math.cos(frame * 0.003) * 20, y: 60 + Math.sin(frame * 0.005) * 16, size: 550, color: 'rgba(212,165,116,0.07)', blur: 110 },
    { x: 22 + Math.sin(frame * 0.004 + 2) * 14, y: 78 + Math.cos(frame * 0.006) * 10, size: 500, color: 'rgba(20,60,120,0.08)', blur: 90 },
    { x: 60 + Math.cos(frame * 0.006 + 1) * 12, y: 40 + Math.sin(frame * 0.003 + 3) * 18, size: 480, color: 'rgba(140,60,80,0.06)', blur: 120 },
    { x: 35 + Math.sin(frame * 0.007) * 10, y: 15 + Math.cos(frame * 0.005 + 1) * 12, size: 400, color: 'rgba(180,140,90,0.05)', blur: 95 },
  ];

  const auroraX = Math.sin(frame * 0.003) * 30;
  const auroraOp = interpolate(Math.sin(frame * 0.01), [-1, 1], [0.02, 0.06]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: theme.bg.deep }}>
      {/* Base gradient */}
      <div style={{
        position: 'absolute', inset: '-25%',
        background: `radial-gradient(ellipse 85% 65% at 50% 38%, ${theme.bg.gradient1} 0%, ${theme.bg.gradient2} 35%, ${theme.bg.gradient4} 65%, ${theme.bg.deep} 100%)`,
        opacity: basePulse,
        transform: `rotate(${t * 15}deg) scale(1.1)`,
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

      {/* Aurora sweep */}
      <div style={{
        position: 'absolute', top: '15%', left: `${30 + auroraX}%`,
        width: '60%', height: '45%',
        background: 'linear-gradient(135deg, rgba(100,50,160,0.04) 0%, rgba(212,165,116,0.03) 50%, rgba(40,80,140,0.04) 100%)',
        opacity: auroraOp, filter: 'blur(80px)', borderRadius: '50%',
        transform: `rotate(${frame * 0.03}deg)`,
      }} />

      {/* Film grain */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.022,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }} />

      {/* Cinematic vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 45% at 50% 50%, transparent 15%, rgba(0,0,0,0.50) 100%)',
      }} />

      {/* Top/bottom letterbox bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '14%', background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%', background: 'linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 100%)' }} />
    </div>
  );
};
