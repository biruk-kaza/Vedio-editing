/**
 * EOTC Voice Studio — Premium Design Tokens
 * 
 * Ultra-cinematic theme system with refined color science,
 * smooth animation curves, and professional typography.
 */

export const theme = {
  // ── Background Palette — Deep cinematic tones ──
  bg: {
    deep: '#050508',
    gradient1: '#0f0720',        // Rich indigo
    gradient2: '#081020',        // Deep ocean blue
    gradient3: '#120810',        // Warm dark wine
    gradient4: '#0a0818',        // Midnight purple
  },

  // ── Gold Accent System — Refined metallics ──
  gold: {
    primary: '#d4a574',
    bright: '#f5d4a0',
    warm: '#c4915e',
    hotGlow: '#ffd78a',
    glow: 'rgba(245, 212, 160, 0.40)',
    glowStrong: 'rgba(245, 212, 160, 0.65)',
    subtle: 'rgba(212, 165, 116, 0.10)',
  },

  // ── Text Colors ──
  text: {
    primary: '#f8f4ef',
    secondary: 'rgba(248, 244, 239, 0.50)',
    dimmed: 'rgba(248, 244, 239, 0.22)',
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

  // ── Caption Styling ──
  caption: {
    fontSize: 48,
    lineHeight: 1.6,
    maxWidth: 900,
    bottomOffset: 360,
    wordGap: 12,
    highlightScale: 1.06,
    glowRadius: 20,
  },

  // ── Video Dimensions (9:16 TikTok/Reels) ──
  video: {
    width: 1080,
    height: 1920,
    fps: 30,
  },

  // ── Animation Timings — Buttery smooth ──
  timing: {
    introFadeDuration: 45,
    outroFadeDuration: 45,
    introDuration: 90,
    outroDuration: 90,
    captionFadeIn: 10,
    captionFadeOut: 15,
    wordSpring: { damping: 16, mass: 0.6, stiffness: 160 },
    // Caption timing offset — shift earlier to fix late sync
    captionOffsetSec: -0.15,
  },
};
