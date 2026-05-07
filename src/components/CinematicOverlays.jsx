/**
 * EOTC Voice Studio — Cinematic Overlays
 * 
 * ═══ FEATURE 1: ATMOSPHERIC DEPTH ═══
 * 
 * 1. FLOATING DUST MOTES — Tiny golden particles that drift
 *    lazily through Z-space. Each has unique size, speed, and
 *    opacity. Creates the feeling of light catching real dust
 *    in a cathedral environment.
 * 
 * 2. ANAMORPHIC LIGHT LEAKS — Horizontal lens flares that
 *    sweep across the frame at key moments. These emulate
 *    the optical artifacts from high-end cinema lenses
 *    (Panavision C-Series, Cooke Anamorphic).
 * 
 * 3. EDGE VIGNETTE — Soft, breathing vignette that darkens
 *    the periphery and draws focus to the center/bottom.
 */
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
} from 'remotion';

// ═══════════════════════════════════════════════
// DUST MOTES — Golden cathedral particles
// ═══════════════════════════════════════════════
const DUST_COUNT = 35;

// Deterministic pseudo-random from seed
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const dustParticles = Array.from({ length: DUST_COUNT }, (_, i) => {
  const r = (s) => seededRandom(i * 17 + s);
  return {
    id: i,
    x: r(1) * 100,         // start X (%)
    y: r(2) * 100,         // start Y (%)
    size: 1.5 + r(3) * 3,  // 1.5–4.5px
    speed: 0.15 + r(4) * 0.35, // drift speed
    drift: (r(5) - 0.5) * 0.4, // horizontal drift
    opacity: 0.12 + r(6) * 0.25,
    delay: r(7) * 200,     // frame offset
    twinkleSpeed: 0.02 + r(8) * 0.04,
  };
});

export const FloatingDust = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
      {dustParticles.map((p) => {
        const t = frame + p.delay;
        // Slow upward drift with horizontal sinusoidal sway
        const y = ((p.y - t * p.speed * 0.3) % 120 + 120) % 120 - 10;
        const x = p.x + Math.sin(t * p.drift * 0.05) * 8;
        // Twinkle: opacity oscillates
        const twinkle = 0.5 + 0.5 * Math.sin(t * p.twinkleSpeed);
        const opacity = p.opacity * twinkle;
        // Size pulse
        const sizeBreath = p.size * (0.85 + 0.15 * Math.sin(t * 0.015 + p.id));

        if (y < -5 || y > 105 || opacity < 0.03) return null;

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: sizeBreath,
              height: sizeBreath,
              borderRadius: '50%',
              backgroundColor: `rgba(212, 175, 55, ${opacity})`,
              boxShadow: `0 0 ${sizeBreath * 2}px rgba(212, 175, 55, ${opacity * 0.6})`,
              willChange: 'transform',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════
// ANAMORPHIC LIGHT LEAKS — Cinema lens artifacts
// ═══════════════════════════════════════════════
const LEAK_CONFIGS = [
  { startFrame: 30, duration: 50, x: '20%', color: 'rgba(212,175,55,0.08)', width: '60%' },
  { startFrame: 180, duration: 45, x: '60%', color: 'rgba(255,220,130,0.06)', width: '50%' },
  { startFrame: 400, duration: 55, x: '30%', color: 'rgba(212,175,55,0.07)', width: '70%' },
  { startFrame: 650, duration: 40, x: '70%', color: 'rgba(255,200,100,0.05)', width: '45%' },
  { startFrame: 900, duration: 50, x: '40%', color: 'rgba(212,175,55,0.08)', width: '55%' },
  { startFrame: 1200, duration: 45, x: '55%', color: 'rgba(255,230,150,0.06)', width: '65%' },
  { startFrame: 1500, duration: 50, x: '25%', color: 'rgba(212,175,55,0.07)', width: '50%' },
];

export const AnamorphicLeaks = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 4, overflow: 'hidden' }}>
      {LEAK_CONFIGS.map((leak, i) => {
        const localFrame = frame - leak.startFrame;
        if (localFrame < -5 || localFrame > leak.duration + 5) return null;

        // Bell curve intensity
        const progress = localFrame / leak.duration;
        const intensity = Math.sin(progress * Math.PI); // 0→1→0
        if (intensity < 0.01) return null;

        // Horizontal sweep
        const sweepX = interpolate(progress, [0, 1], [-20, 20]);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: leak.x,
              top: '30%',
              width: leak.width,
              height: '40%',
              transform: `translateX(${sweepX}%)`,
              background: `radial-gradient(ellipse 100% 8% at 50% 50%, ${leak.color.replace(/[\d.]+\)$/, `${intensity * 0.12})`)}, transparent)`,
              opacity: intensity,
              mixBlendMode: 'screen',
              willChange: 'opacity, transform',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════
// BREATHING VIGNETTE — Soft edge darkening
// ═══════════════════════════════════════════════
export const BreathingVignette = () => {
  const frame = useCurrentFrame();
  
  // Slow breathing cycle
  const breathe = 0.5 + 0.5 * Math.sin(frame * 0.006);
  const vignetteOpacity = interpolate(breathe, [0, 1], [0.35, 0.5]);

  return (
    <AbsoluteFill style={{
      pointerEvents: 'none',
      zIndex: 3,
      background: `radial-gradient(ellipse 60% 55% at 50% 55%, transparent 20%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
    }} />
  );
};
