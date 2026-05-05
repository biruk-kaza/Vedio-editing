/**
 * EOTC Voice Studio — Particle Field
 * 
 * Floating golden particles that drift upward slowly, creating
 * an ethereal, sacred atmosphere. Each particle has randomized
 * size, speed, opacity, and horizontal drift.
 */
import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

// Deterministic pseudo-random using seed
function seededRandom(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLE_COUNT = 45;

export const ParticleField = () => {
  const frame = useCurrentFrame();
  const { height, durationInFrames } = useVideoConfig();

  // Generate particles once with deterministic positions
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: seededRandom(i * 1) * 100,
      startY: seededRandom(i * 2) * 120 + 10,
      size: seededRandom(i * 3) * 3.5 + 1,
      speed: seededRandom(i * 4) * 0.3 + 0.08,
      horizontalDrift: (seededRandom(i * 5) - 0.5) * 0.15,
      opacity: seededRandom(i * 6) * 0.5 + 0.15,
      twinkleSpeed: seededRandom(i * 7) * 0.06 + 0.02,
      delay: seededRandom(i * 8) * 200,
      isGold: seededRandom(i * 9) > 0.6,
    }));
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {particles.map((p) => {
        // Upward drift
        const progress = ((frame + p.delay) * p.speed) % 130;
        const y = p.startY - progress;

        // Horizontal wobble
        const xOffset = Math.sin((frame + p.delay) * 0.02 + p.id) * 8 * p.horizontalDrift;
        const currentX = p.x + xOffset;

        // Twinkle
        const twinkle = interpolate(
          Math.sin((frame + p.delay) * p.twinkleSpeed),
          [-1, 1],
          [p.opacity * 0.4, p.opacity]
        );

        // Fade out at top
        const fadeOut = interpolate(y, [-5, 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // Fade in at bottom
        const fadeIn = interpolate(y, [95, 105], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const finalOpacity = twinkle * fadeOut * fadeIn;

        if (finalOpacity < 0.01) return null;

        const color = p.isGold ? theme.fx.particleBright : theme.fx.particle;

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${currentX}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: finalOpacity,
              boxShadow: p.size > 3
                ? `0 0 ${p.size * 3}px ${color}`
                : 'none',
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
};
