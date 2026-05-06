/**
 * EOTC Voice Studio — Subtle God-Rays
 * 
 * Barely perceptible volumetric light.
 * Adds sacred atmosphere without competing.
 */
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

export const LightRays = () => {
  const frame = useCurrentFrame();
  const rotation = frame * 0.02;
  const pulse = interpolate(Math.sin(frame * 0.008), [-1, 1], [0.35, 0.65]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: pulse }}>
      {/* Central glow */}
      <div style={{
        position: 'absolute', top: '-8%', left: '50%',
        width: 450, height: 450,
        transform: 'translate(-50%,-50%)', borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.gold.glow} 0%, rgba(201,169,110,0.06) 40%, transparent 70%)`,
        filter: 'blur(65px)',
      }} />
      {/* Rays */}
      <div style={{
        position: 'absolute', top: '-12%', left: '50%',
        width: '200%', height: '130%',
        transform: `translate(-50%,0) rotate(${rotation}deg)`,
        transformOrigin: '50% 0%',
      }}>
        {Array.from({ length: 10 }, (_, i) => {
          const angle = (i / 10) * 360;
          const w = 1.2 + (i % 3) * 0.6;
          const op = interpolate(Math.sin(frame * 0.015 + i * 0.7), [-1, 1], [0.008, 0.028]);
          return (
            <div key={i} style={{
              position: 'absolute', top: 0, left: '50%',
              width: `${w}%`, height: '100%',
              background: `linear-gradient(180deg, ${theme.fx.rayBright} 0%, ${theme.fx.ray} 30%, transparent 75%)`,
              transform: `rotate(${angle}deg)`, transformOrigin: '50% 0%',
              opacity: op,
            }} />
          );
        })}
      </div>
    </div>
  );
};
