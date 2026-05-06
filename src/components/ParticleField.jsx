/**
 * EOTC Voice Studio — Subtle Drift Particles
 * 
 * Very subtle, slow-drifting golden dust.
 * Adds atmospheric depth without distraction.
 * Three tiers: dust (tiny), sparkle (medium), orb (large with bloom).
 */
import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

function srand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const COUNT = 50;

export const ParticleField = () => {
  const frame = useCurrentFrame();

  const particles = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => {
      const r = (s) => srand(i * 10 + s);
      const tier = r(0) < 0.6 ? 'dust' : r(0) < 0.88 ? 'sparkle' : 'orb';
      return {
        id: i, tier,
        x: r(1) * 100,
        startY: r(2) * 130 + 5,
        size: tier === 'dust' ? r(3) * 1.8 + 0.6 : tier === 'sparkle' ? r(3) * 2 + 2 : r(3) * 2.5 + 3.5,
        speed: tier === 'dust' ? r(4) * 0.12 + 0.04 : tier === 'sparkle' ? r(4) * 0.18 + 0.07 : r(4) * 0.1 + 0.04,
        drift: (r(5) - 0.5) * 0.15,
        baseOp: tier === 'dust' ? r(6) * 0.2 + 0.08 : tier === 'sparkle' ? r(6) * 0.3 + 0.15 : r(6) * 0.25 + 0.2,
        twinkle: r(7) * 0.03 + 0.01,
        delay: r(8) * 250,
        isGold: r(9) > 0.5,
        isWhite: r(9) < 0.12,
        phase: r(10) * Math.PI * 2,
      };
    }),
  []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => {
        const progress = ((frame + p.delay) * p.speed) % 140;
        const y = p.startY - progress;
        const xOff = Math.sin((frame + p.delay) * 0.012 + p.phase) * 8 * p.drift;
        const twinkle = interpolate(Math.sin((frame + p.delay) * p.twinkle + p.phase), [-1, 1], [p.baseOp * 0.3, p.baseOp]);
        const fadeOut = interpolate(y, [-8, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const fadeIn = interpolate(y, [100, 115], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const op = twinkle * fadeOut * fadeIn;
        if (op < 0.01) return null;

        const color = p.isWhite ? theme.fx.particleWhite : p.isGold ? theme.fx.particleBright : theme.fx.particle;
        const glow = p.tier === 'orb' ? p.size * 3.5 : p.tier === 'sparkle' ? p.size * 2 : 0;

        return (
          <div key={p.id} style={{
            position: 'absolute', left: `${p.x + xOff}%`, top: `${y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            backgroundColor: color, opacity: op,
            boxShadow: glow > 0 ? `0 0 ${glow}px ${glow * 0.3}px ${color}` : 'none',
            transform: 'translate(-50%,-50%)',
          }} />
        );
      })}
    </div>
  );
};
