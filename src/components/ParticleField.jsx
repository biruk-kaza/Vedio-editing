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
      // ── TRUE DEPTH OF FIELD ──
      // bg = far away (slow, small, blurry)
      // mid = subject depth (normal speed, crisp)
      // fg = close to lens (fast, huge, very blurry)
      const depthRand = r(0);
      const depth = depthRand < 0.35 ? 'bg' : depthRand < 0.85 ? 'mid' : 'fg';
      const tier = r(1) < 0.7 ? 'dust' : 'orb';
      
      let baseSize, baseSpeed, blur;
      if (depth === 'bg') {
        baseSize = tier === 'dust' ? 1.5 : 3.5;
        baseSpeed = 0.03;
        blur = 3;
      } else if (depth === 'mid') {
        baseSize = tier === 'dust' ? 2 : 5;
        baseSpeed = 0.08;
        blur = 0;
      } else { // fg
        baseSize = tier === 'dust' ? 6 : 14;
        baseSpeed = 0.25;
        blur = 6;
      }

      return {
        id: i, depth, tier, blur,
        x: r(2) * 110 - 5,
        startY: r(3) * 130 + 10,
        size: baseSize * (r(4) * 0.5 + 0.75),
        speed: baseSpeed * (r(5) * 0.4 + 0.8),
        drift: (r(6) - 0.5) * 0.25,
        baseOp: depth === 'fg' ? 0.15 : depth === 'mid' ? (tier === 'dust' ? 0.3 : 0.45) : 0.2,
        twinkle: r(7) * 0.03 + 0.01,
        delay: r(8) * 300,
        isGold: r(9) > 0.4,
        isWhite: r(9) < 0.15,
        phase: r(10) * Math.PI * 2,
      };
    }),
  []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {particles.map((p) => {
        const progress = ((frame + p.delay) * p.speed) % 150;
        const y = p.startY - progress;
        const xOff = Math.sin((frame + p.delay) * 0.012 + p.phase) * (p.depth === 'fg' ? 20 : 10) * p.drift;
        
        // Organic twinkle
        const twinkle = interpolate(Math.sin((frame + p.delay) * p.twinkle + p.phase), [-1, 1], [p.baseOp * 0.4, p.baseOp]);
        const fadeOut = interpolate(y, [-10, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const fadeIn = interpolate(y, [100, 120], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const op = twinkle * fadeOut * fadeIn;
        
        if (op < 0.01) return null;

        const color = p.isWhite ? theme.fx.particleWhite : p.isGold ? theme.fx.particleBright : theme.fx.particle;
        const glowRadius = p.tier === 'orb' ? p.size * 2 : 0;

        return (
          <div key={p.id} style={{
            position: 'absolute', left: `${p.x + xOff}%`, top: `${y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            backgroundColor: color, opacity: op,
            boxShadow: glowRadius > 0 ? `0 0 ${glowRadius}px ${glowRadius * 0.5}px ${color}` : 'none',
            transform: 'translate(-50%,-50%)',
            filter: p.blur > 0 ? `blur(${p.blur}px)` : 'none',
            willChange: 'transform, opacity',
          }} />
        );
      })}
    </div>
  );
};
