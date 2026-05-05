/**
 * EOTC Voice Studio — Design Tokens
 * 
 * World-class cinematic theme inspired by Ethiopian Orthodox iconography.
 * Deep sacred colors, gold accents, ethereal light effects.
 */

export const theme = {
  // ── Background Palette ──
  bg: {
    deep: '#080810',
    gradient1: '#140a24',    // Deep royal purple
    gradient2: '#0a1628',    // Sacred navy
    gradient3: '#1a0e0e',    // Dark burgundy warmth
  },

  // ── Gold Accent System ──
  gold: {
    primary: '#d4a574',
    bright: '#f0c987',
    warm: '#c4915e',
    glow: 'rgba(212, 165, 116, 0.35)',
    glowStrong: 'rgba(240, 201, 135, 0.5)',
    subtle: 'rgba(212, 165, 116, 0.12)',
  },

  // ── Text Colors ──
  text: {
    primary: '#f5f0eb',
    secondary: 'rgba(245, 240, 235, 0.55)',
    dimmed: 'rgba(245, 240, 235, 0.25)',
    highlighted: '#ffffff',
  },

  // ── Particle / FX Colors ──
  fx: {
    particle: 'rgba(212, 165, 116, 0.6)',
    particleBright: 'rgba(240, 201, 135, 0.8)',
    ray: 'rgba(212, 165, 116, 0.03)',
    rayBright: 'rgba(240, 201, 135, 0.06)',
    cross: 'rgba(212, 165, 116, 0.06)',
  },

  // ── Typography ──
  fonts: {
    // Primary font for Amharic text — Noto Sans Ethiopic has excellent Ge'ez support
    caption: "'Noto Sans Ethiopic', 'Noto Sans', sans-serif",
    // Display font for titles / Latin text
    display: "'Inter', 'Noto Sans', sans-serif",
  },

  // ── Spacing & Sizing ──
  caption: {
    fontSize: 52,
    lineHeight: 1.55,
    maxWidth: 880,
    bottomOffset: 340,     // Distance from bottom of frame
    wordGap: 14,
    highlightScale: 1.08,
    glowRadius: 24,
  },

  // ── Video Dimensions (9:16 TikTok/Reels) ──
  video: {
    width: 1080,
    height: 1920,
    fps: 30,
  },

  // ── Animation Timings ──
  timing: {
    introFadeDuration: 45,     // frames (1.5s at 30fps)
    outroFadeDuration: 45,
    introDuration: 90,         // 3s intro
    outroDuration: 90,         // 3s outro
    captionFadeIn: 8,          // frames
    captionFadeOut: 12,
    wordSpring: { damping: 14, mass: 0.8, stiffness: 180 },
  },
};
