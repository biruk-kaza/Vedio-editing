/**
 * EOTC Voice Studio — Volumetric Light Rays
 * 
 * Subtle, slowly rotating god-rays emanating from the upper center.
 * Creates a sense of divine, ethereal light — key to the EOTC aesthetic.
 */
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

const RAY_COUNT = 8;

export const LightRays = () => {
  const frame = useCurrentFrame();

  // Very slow rotation
  const rotation = frame * 0.04;

  // Breathing pulse
  const pulse = interpolate(
    Math.sin(frame * 0.015),
    [-1, 1],
    [0.5, 0.9]
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: pulse,
      }}
    >
      {/* Central glow source */}
      <div
        style={{
          position: 'absolute',
          top: '-5%',
          left: '50%',
          width: 400,
          height: 400,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.gold.glow} 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Rays */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          width: '200%',
          height: '120%',
          transform: `translate(-50%, 0) rotate(${rotation}deg)`,
          transformOrigin: '50% 0%',
        }}
      >
        {Array.from({ length: RAY_COUNT }, (_, i) => {
          const angle = (i / RAY_COUNT) * 360;
          const width = 2 + (i % 3) * 1.5;
          const rayOpacity = interpolate(
            Math.sin(frame * 0.025 + i * 0.8),
            [-1, 1],
            [0.015, 0.04]
          );

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                width: `${width}%`,
                height: '100%',
                background: `linear-gradient(
                  180deg,
                  ${theme.fx.rayBright} 0%,
                  ${theme.fx.ray} 40%,
                  transparent 85%
                )`,
                transform: `rotate(${angle}deg)`,
                transformOrigin: '50% 0%',
                opacity: rayOpacity,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
