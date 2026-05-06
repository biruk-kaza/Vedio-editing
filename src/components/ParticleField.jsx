/**
 * EOTC Voice Studio — Premium Particle Field
 * 
 * Floating golden dust particles with:
 * - Multiple size tiers (dust, sparkle, orb)
 * - Smooth sine-wave horizontal drift
 * - Depth-based parallax (different speeds)
 * - Soft bloom glow on larger particles
 * - Gentle twinkle with phase offsets
 */
import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

// Deterministic pseudo-random
function seededRandom(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLE_COUNT = 65;

export const ParticleField = () => {
  const frame = useCurrentFrame();

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const r = (s) => seededRandom(i * 10 + s);
      const tier = r(0) < 0.55 ? 'dust' : r(0) < 0.85 ? 'sparkle' : 'orb';
      return {
        id: i,
        tier,
        x: r(1) * 100,
        startY: r(2) * 130 + 5,
        size: tier === 'dust' ? r(3) * 2 + 0.8
            : tier === 'sparkle' ? r(3) * 2.5 + 2.5
            : r(3) * 3 + 4,
        speed: tier === 'dust' ? r(4) * 0.15 + 0.06
             : tier === 'sparkle' ? r(4) * 0.25 + 0.1
             : r(4) * 0.12 + 0.05,
        drift: (r(5) - 0.5) * 0.2,
        baseOpacity: tier === 'dust' ? r(6) * 0.3 + 0.1
                   : tier === 'sparkle' ? r(6) * 0.4 + 0.2
                   : r(6) * 0.35 + 0.25,
        twinkleSpeed: r(7) * 0.04 + 0.015,
        delay: r(8) * 250,
        isGold: r(9) > 0.45,
        isWhite: r(9) < 0.15,
        phase: r(10) * Math.PI * 2,
      };
    });
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
        // Upward drift with smooth looping
        const progress = ((frame + p.delay) * p.speed) % 140;
        const y = p.startY - progress;

        // Smooth horizontal wobble
        const xOffset =
          Math.sin((frame + p.delay) * 0.015 + p.phase) * 10 * p.drift +
          Math.cos((frame + p.delay) * 0.008 + p.phase * 2) * 4 * p.drift;
        const currentX = p.x + xOffset;

        // Smooth twinkle
        const twinkle = interpolate(
          Math.sin((frame + p.delay) * p.twinkleSpeed + p.phase),
          [-1, 1],
          [p.baseOpacity * 0.35, p.baseOpacity]
        );

        // Fade out at top
        const fadeOut = interpolate(y, [-8, 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // Fade in at bottom
        const fadeIn = interpolate(y, [100, 115], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const finalOpacity = twinkle * fadeOut * fadeIn;
        if (finalOpacity < 0.01) return null;

        const color = p.isWhite
          ? theme.fx.particleWhite
          : p.isGold
            ? theme.fx.particleBright
            : theme.fx.particle;

        const glowSize = p.tier === 'orb' ? p.size * 4
                       : p.tier === 'sparkle' ? p.size * 2.5
                       : 0;

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
              boxShadow: glowSize > 0
                ? `0 0 ${glowSize}px ${glowSize * 0.4}px ${color}`
                : 'none',
              transform: 'translate(-50%, -50%)',
              willChange: 'transform, opacity',
            }}
          />
        );
      })}
    </div>
  );
};
