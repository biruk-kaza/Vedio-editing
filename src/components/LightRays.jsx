/**
 * EOTC Voice Studio — Premium Volumetric Light Rays
 * 
 * Soft, cinematic god-rays emanating from top-center:
 * - Multiple ray widths with independent breathing
 * - Central bloom source with smooth pulse
 * - Very slow rotation for organic movement
 * - Layered opacity for depth
 */
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

const RAY_COUNT = 12;

export const LightRays = () => {
  const frame = useCurrentFrame();

  // Ultra-slow rotation — barely perceptible
  const rotation = frame * 0.025;

  // Smooth breathing pulse
  const pulse = interpolate(
    Math.sin(frame * 0.01),
    [-1, 1],
    [0.45, 0.8]
  );

  // Secondary pulse for depth
  const pulse2 = interpolate(
    Math.sin(frame * 0.007 + 1),
    [-1, 1],
    [0.6, 0.9]
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
      {/* Primary central glow source */}
      <div
        style={{
          position: 'absolute',
          top: '-8%',
          left: '50%',
          width: 500,
          height: 500,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.gold.glow} 0%, rgba(212,165,116,0.08) 40%, transparent 70%)`,
          filter: 'blur(70px)',
          opacity: pulse2,
        }}
      />

      {/* Secondary warm glow */}
      <div
        style={{
          position: 'absolute',
          top: '-3%',
          left: '50%',
          width: 300,
          height: 300,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(245,212,160,0.15) 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
      />

      {/* Rays container */}
      <div
        style={{
          position: 'absolute',
          top: '-12%',
          left: '50%',
          width: '220%',
          height: '130%',
          transform: `translate(-50%, 0) rotate(${rotation}deg)`,
          transformOrigin: '50% 0%',
        }}
      >
        {Array.from({ length: RAY_COUNT }, (_, i) => {
          const angle = (i / RAY_COUNT) * 360;
          const width = 1.5 + (i % 4) * 0.8;

          // Each ray breathes independently
          const rayPhase = i * 0.6;
          const rayOpacity = interpolate(
            Math.sin(frame * 0.018 + rayPhase),
            [-1, 1],
            [0.01, 0.035]
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
                  ${theme.fx.ray} 30%,
                  transparent 75%
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
