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
  const rotation = frame * 0.015;
  const pulse = interpolate(Math.sin(frame * 0.006), [-1, 1], [0.4, 0.8]);

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      pointerEvents: 'none', opacity: pulse,
      mixBlendMode: 'screen', // crucial for realistic light
      perspective: '1000px',
    }}>
      {/* Central intense glow source */}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%',
        width: 800, height: 600,
        transform: 'translate(-50%,-50%)', borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(255, 230, 180, 0.08) 0%, rgba(212, 175, 55, 0.04) 30%, transparent 70%)`,
        filter: 'blur(80px)',
      }} />

      {/* ── 3D VOLUMETRIC RAYS ── */}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%',
        width: '250%', height: '150%',
        transform: `translate(-50%,0) rotate(${rotation}deg) rotateX(25deg)`, // 3D tilt
        transformOrigin: '50% 0%',
        transformStyle: 'preserve-3d',
      }}>
        {Array.from({ length: 14 }, (_, i) => {
          const angle = (i / 14) * 360;
          const w = 1.5 + Math.sin(i * 1.5) * 0.8; // organic widths
          const op = interpolate(Math.sin(frame * 0.012 + i * 1.2), [-1, 1], [0.01, 0.04]);
          const lengthScale = interpolate(Math.sin(i * 3), [-1, 1], [0.6, 1.2]); // organic lengths
          
          return (
            <div key={i} style={{
              position: 'absolute', top: 0, left: '50%',
              width: `${w}%`, height: `${100 * lengthScale}%`,
              background: `linear-gradient(180deg, rgba(255, 240, 200, 0.6) 0%, rgba(212, 175, 55, 0.25) 25%, transparent 85%)`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: '50% 0%',
              opacity: op,
              filter: 'blur(4px)', // soft ray edges
            }} />
          );
        })}
      </div>
    </div>
  );
};
