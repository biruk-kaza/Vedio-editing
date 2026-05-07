/**
 * EOTC Voice Studio — Ultra-Premium Design System
 * 
 * ═══ NATE HERK–LEVEL VISUAL DIRECTION ═══
 * Theme: Clean, punchy, modern. Deep black canvas.
 * Gold: Bright champagne highlights — snappy, not gradual.
 * Motion: Punchy spring overshoots. Tight 10-frame transitions.
 * Typography: Bold, centered, massive. No clutter.
 * 
 * ═══ EASING CURVES ═══
 * punchyEnter:  bezier(0.34, 1.56, 0.64, 1)  — overshoot spring pop
 * crispEnter:   bezier(0.16, 1, 0.3, 1)       — fast deceleration
 * smoothExit:   bezier(0.4, 0, 0.2, 1)        — smooth departure
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

  // ── Champagne Gold ──
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

  // ── Text Colors — Punchy contrast ──
  text: {
    // Active word: bright white pop (not gold — Nate Herk style)
    active: '#ffffff',
    // Surrounding words: clean visible white
    past: 'rgba(220, 215, 205, 0.65)',
    // Future words: muted but readable
    future: 'rgba(180, 175, 165, 0.32)',
    // Intro/outro
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

  // ── Caption Layout ──
  caption: {
    fontSize: 72,        // Bigger = punchier
    fontWeight: 800,     // Extra bold
    lineHeight: 1.35,
    maxWidth: 920,
    wordGap: 20,
    wordsPerLine: 3,
    // Active word pop scale
    highlightScale: 1.08,
    // Glow radius for active word
    glowRadius: 18,
    // Text stroke (for readability on dark bg)
    stroke: { width: 2, color: 'rgba(0, 0, 0, 0.5)' },
  },

  // ── Video ──
  video: {
    width: 1080,
    height: 1920,
    fps: 30,
  },

  // ── Timing — Snappy, punchy ──
  timing: {
    introDuration: 90,    // 3 seconds
    outroDuration: 90,    // 3 seconds
    // Entry: fast spring pop (10 frames = 0.33s)
    revealFrames: 10,
    // Exit: quick departure (8 frames)
    exitFrames: 8,
    // Word stagger: tight (1 frame apart = rapid-fire)
    wordStagger: 1,
    // Caption offset
    captionOffsetSec: 0.10,
    // Word spring: punchy overshoot
    wordSpring: { damping: 12, mass: 0.3, stiffness: 220 },
  },
};
