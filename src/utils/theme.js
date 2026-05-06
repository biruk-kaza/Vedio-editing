/**
 * EOTC Voice Studio — Premium Design Tokens
 * 
 * World-class cinematic theme. Centered "pop" captions,
 * massive bold typography, spring physics, gold highlights.
 */

export const theme = {
  // ── Background Palette ──
  bg: {
    deep: '#050508',
    gradient1: '#0f0720',
    gradient2: '#081020',
    gradient3: '#120810',
    gradient4: '#0a0818',
  },

  // ── Gold Accent System ──
  gold: {
    primary: '#d4a574',
    bright: '#f5d4a0',
    warm: '#c4915e',
    hotGlow: '#ffe4a0',
    glow: 'rgba(245, 212, 160, 0.40)',
    glowStrong: 'rgba(245, 212, 160, 0.65)',
    subtle: 'rgba(212, 165, 116, 0.10)',
  },

  // ── Text Colors ──
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.40)',
    dimmed: 'rgba(255, 255, 255, 0.18)',
    highlighted: '#ffffff',
  },

  // ── Particle / FX Colors ──
  fx: {
    particle: 'rgba(212, 165, 116, 0.55)',
    particleBright: 'rgba(245, 212, 160, 0.85)',
    particleWhite: 'rgba(255, 255, 255, 0.4)',
    ray: 'rgba(212, 165, 116, 0.025)',
    rayBright: 'rgba(240, 201, 135, 0.05)',
    cross: 'rgba(212, 165, 116, 0.05)',
  },

  // ── Typography ──
  fonts: {
    caption: "'Noto Sans Ethiopic', 'Noto Sans', sans-serif",
    display: "'Inter', 'Noto Sans', sans-serif",
  },

  // ── Caption Styling — CENTERED, MASSIVE, BOLD ──
  caption: {
    fontSize: 72,
    fontWeight: 800,
    lineHeight: 1.35,
    maxWidth: 950,
    wordGap: 16,
    highlightScale: 1.12,
    glowRadius: 28,
    wordsPerLine: 3,
    // Text stroke for readability over any background
    stroke: {
      width: 3,
      color: 'rgba(0, 0, 0, 0.7)',
    },
  },

  // ── Video Dimensions (9:16 TikTok/Reels) ──
  video: {
    width: 1080,
    height: 1920,
    fps: 30,
  },

  // ── Animation Timings ──
  timing: {
    introFadeDuration: 45,
    outroFadeDuration: 45,
    introDuration: 90,
    outroDuration: 90,
    captionFadeIn: 6,
    captionFadeOut: 10,
    // Caption timing offset — positive = later (fix "too fast")
    captionOffsetSec: 0.12,
    // Word spring config — buttery pop
    wordSpring: { damping: 12, mass: 0.4, stiffness: 200 },
  },
};
