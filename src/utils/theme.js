/**
 * EOTC Voice Studio — Ultra-Premium Design System
 * 
 * ═══ VISUAL DIRECTION ═══
 * Theme: Luxury minimalist. Deep black canvas.
 * Gold: Champagne metallic gradient accents.
 * Motion: Zero linear easing. All cubic-bezier / spring.
 * 
 * ═══ CUSTOM EASING CURVES ═══
 * glowReveal:  bezier(0.16, 1, 0.3, 1)    — exponential ease-out
 * springPop:   bezier(0.34, 1.56, 0.64, 1) — spring with overshoot
 * smoothExit:  bezier(0.4, 0, 0.2, 1)      — Material standard
 * silkIn:      bezier(0.0, 0.0, 0.2, 1)    — very smooth ease-in
 * silkOut:     bezier(0.4, 0.0, 1.0, 1.0)  — smooth ease-out
 */

export const theme = {
  // ── Deep Black Canvas ──
  bg: {
    deep: '#030305',
    gradient1: '#0c0618',
    gradient2: '#060d1a',
    gradient3: '#0e0608',
    gradient4: '#080614',
  },

  // ── Champagne Gold Accents ──
  gold: {
    primary: '#c9a96e',
    bright: '#e8d5a3',
    warm: '#b8944f',
    hotGlow: '#f0dea0',
    metallic: 'linear-gradient(135deg, #c9a96e 0%, #e8d5a3 50%, #c9a96e 100%)',
    glow: 'rgba(232, 213, 163, 0.35)',
    glowStrong: 'rgba(232, 213, 163, 0.60)',
    subtle: 'rgba(201, 169, 110, 0.08)',
  },

  // ── Text Colors ──
  text: {
    // Active words illuminate to bright white-gold
    active: '#f5edd8',
    // Past words settle to clean muted tone
    past: 'rgba(220, 215, 205, 0.75)',
    // Future words are barely visible
    future: 'rgba(180, 175, 165, 0.28)',
    // Intro/outro text
    primary: '#f0ebe0',
  },

  // ── Particle FX ──
  fx: {
    particle: 'rgba(201, 169, 110, 0.45)',
    particleBright: 'rgba(232, 213, 163, 0.70)',
    particleWhite: 'rgba(255, 255, 255, 0.25)',
    ray: 'rgba(201, 169, 110, 0.02)',
    rayBright: 'rgba(232, 213, 163, 0.04)',
  },

  // ── Typography ──
  fonts: {
    caption: "'Noto Sans Ethiopic', 'Noto Sans', sans-serif",
    display: "'Inter', 'Noto Sans', sans-serif",
  },

  // ── Caption Layout — 1-3 words, centered, massive ──
  caption: {
    fontSize: 68,
    fontWeight: 700,
    lineHeight: 1.4,
    maxWidth: 920,
    wordGap: 18,
    wordsPerLine: 3,
    // Glow reveal scale range
    scaleFrom: 0.94,
    scaleTo: 1.0,
    // Active word highlight scale
    highlightScale: 1.06,
    // Glow radius for active word
    glowRadius: 22,
    // Text stroke
    stroke: { width: 2.5, color: 'rgba(0, 0, 0, 0.65)' },
  },

  // ── Video ──
  video: {
    width: 1080,
    height: 1920,
    fps: 30,
  },

  // ── Timing ──
  timing: {
    introDuration: 90,
    outroDuration: 90,
    // Glow reveal entrance duration (frames)
    revealFrames: 14,
    // Exit drift duration (frames)
    exitFrames: 12,
    // Word stagger delay (frames between each word)
    wordStagger: 2,
    // Caption offset — positive = words appear later (fixes "too fast")
    captionOffsetSec: 0.10,
    // Spring config for word pop
    wordSpring: { damping: 13, mass: 0.4, stiffness: 180 },
  },
};
