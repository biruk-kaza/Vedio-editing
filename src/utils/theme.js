/**
 * EOTC Voice Studio — Cinematic Art Direction System
 * 
 * ═══ VISUAL IDENTITY ═══
 * Canvas: Textured charcoal #0A0A0A (not flat black)
 * Gold: Rich metallic #D4AF37 with specular highlights
 * Grain: 35mm film grain, 2.5% opacity
 * Vignette: Organic, asymmetric, breathing
 * 
 * ═══ MOTION PHILOSOPHY ═══
 * Easing: Explosive 0→80% in first 10 frames,
 *         then exaggerated buttery ease-in for seconds
 * Curve:  bezier(0.05, 0.95, 0.15, 1.0)  — "cinematic snap"
 * Spring: damping:10, stiffness:280, mass:0.25 — punchy overshoot
 */

export const theme = {
  // ── Textured Charcoal Canvas (NOT flat black) ──
  bg: {
    deep: '#0A0A0A',
    gradient1: '#0e0820',
    gradient2: '#08101e',
    gradient3: '#120810',
    gradient4: '#0a0818',
    // Film grain
    grainOpacity: 0.025,
    grainScale: '96px',
  },

  // ── Rich Metallic Gold with Specular ──
  gold: {
    primary: '#D4AF37',
    bright: '#F0D875',
    warm: '#C49B2A',
    hotGlow: '#FFE88A',
    // Specular highlight (bright white-gold flash)
    specular: '#FFF8E1',
    // Metallic gradient with specular band
    metallic: 'linear-gradient(135deg, #C49B2A 0%, #D4AF37 25%, #F0D875 48%, #FFF8E1 52%, #F0D875 55%, #D4AF37 75%, #C49B2A 100%)',
    // Glow levels
    glow: 'rgba(212, 175, 55, 0.35)',
    glowStrong: 'rgba(240, 216, 117, 0.55)',
    glowSoft: 'rgba(212, 175, 55, 0.12)',
    subtle: 'rgba(212, 175, 55, 0.06)',
  },

  // ── Text Colors — Cinema-grade contrast ──
  text: {
    active: '#FFFFFF',
    past: 'rgba(220, 215, 205, 0.60)',
    future: 'rgba(160, 155, 145, 0.28)',
    primary: '#F5F0E0',
    brand: '#D4AF37',
  },

  // ── Particle FX ──
  fx: {
    particle: 'rgba(212, 175, 55, 0.40)',
    particleBright: 'rgba(240, 216, 117, 0.65)',
    particleWhite: 'rgba(255, 255, 255, 0.18)',
    ray: 'rgba(212, 175, 55, 0.015)',
    rayBright: 'rgba(240, 216, 117, 0.03)',
  },

  // ── Typography ──
  fonts: {
    caption: "'Noto Sans Ethiopic', 'Noto Sans', sans-serif",
    display: "'Inter', 'Noto Sans', sans-serif",
  },

  // ── Caption Layout ──
  caption: {
    fontSize: 74,
    fontWeight: 800,
    lineHeight: 1.32,
    maxWidth: 920,
    wordGap: 22,
    wordsPerLine: 3,
    highlightScale: 1.10,
    glowRadius: 16,
    stroke: { width: 1.5, color: 'rgba(0, 0, 0, 0.45)' },
    // Continuous enlargement: 100% → 103% over phrase duration
    breatheScale: 0.03,
  },

  // ── Video ──
  video: {
    width: 1080,
    height: 1920,
    fps: 30,
  },

  // ── Motion — Cinematic Snap ──
  timing: {
    introDuration: 105,   // 3.5 seconds (longer for typographic transition)
    outroDuration: 90,
    revealFrames: 10,
    exitFrames: 8,
    wordStagger: 1,
    captionOffsetSec: 0.10,
    // Punchy overshoot spring
    wordSpring: { damping: 10, stiffness: 280, mass: 0.25 },
    // Icon draw-on duration
    iconDrawFrames: 20,
  },

  // ── Liturgical Icon Set ──
  icons: [
    'cross', 'book', 'dove', 'candle', 'church', 'prayer', 'sun', 'bell',
  ],
};
