/**
 * EOTC Voice Studio — Main Video Composition
 * 
 * Layer Stack (bottom → top):
 * ─────────────────────────────
 * 1. AnimatedBackground   — cinematic gradient with drifting orbs
 * 2. LightRays            — volumetric god-ray effect
 * 3. CrossWatermark       — subtle rotating EOTC cross
 * 4. ParticleField        — floating golden particles
 * 5. Audio                — original voiceover (starts after intro)
 * 6. CaptionOverlay       — word-by-word animated captions
 * 7. IntroSequence        — cinematic opening (overlays everything)
 * 8. OutroSequence        — branded closing card
 * 
 * Font Loading:
 * Uses @remotion/google-fonts for bulletproof Amharic rendering.
 * Noto Sans Ethiopic is loaded with proper character shaping
 * so glyphs like ፒኬ render correctly during frame-by-frame capture.
 */
import React, { useEffect, useState } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  continueRender,
  delayRender,
  Sequence,
} from 'remotion';
import { loadFont as loadEthiopic } from '@remotion/google-fonts/NotoSansEthiopic';
import { AnimatedBackground } from './components/AnimatedBackground.jsx';
import { ParticleField } from './components/ParticleField.jsx';
import { LightRays } from './components/LightRays.jsx';
import { CrossWatermark } from './components/CrossWatermark.jsx';
import { CaptionOverlay } from './components/CaptionOverlay.jsx';
import { IntroSequence } from './components/IntroSequence.jsx';
import { OutroSequence } from './components/OutroSequence.jsx';
import { theme } from './utils/theme.js';

// ── Load Amharic font via @remotion/google-fonts ──
// This ensures proper character shaping during headless rendering
const { fontFamily: ethiopicFont } = loadEthiopic('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['ethiopic', 'latin'],
});

// Inter for display text
const INTER_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';

export const EOTCVideo = ({
  words = [],
  audioFileName = '',
  title = 'EOTC Voice Studio',
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  // ── Font Loading ──
  // delayRender blocks frame capture until Inter is loaded
  // (Ethiopic is already loaded via @remotion/google-fonts above)
  const [fontsHandle] = useState(() => delayRender('Loading display font...'));

  useEffect(() => {
    const loadFonts = async () => {
      try {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = INTER_URL;
        await new Promise((resolve) => {
          link.onload = resolve;
          link.onerror = resolve;
          document.head.appendChild(link);
        });
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading issue (non-critical):', e);
      }
      continueRender(fontsHandle);
    };
    loadFonts();
  }, [fontsHandle]);

  // ── Timing ──
  const introFrames = theme.timing.introDuration;
  const outroFrames = theme.timing.outroDuration;
  const outroStartFrame = durationInFrames - outroFrames;

  const audioSrc = audioFileName ? staticFile(audioFileName) : null;

  return (
    <div
      style={{
        width: theme.video.width,
        height: theme.video.height,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: theme.bg.deep,
        fontFamily: ethiopicFont,
      }}
    >
      {/* ── Layer 1: Animated Background ── */}
      <AnimatedBackground />

      {/* ── Layer 2: Volumetric Light Rays ── */}
      <LightRays />

      {/* ── Layer 3: Cross Watermark ── */}
      <CrossWatermark />

      {/* ── Layer 4: Floating Particles ── */}
      <ParticleField />

      {/* ── Layer 5: Audio Track ── */}
      {audioSrc && (
        <Sequence from={introFrames}>
          <Audio src={audioSrc} />
        </Sequence>
      )}

      {/* ── Layer 6: Animated Captions ── */}
      {words.length > 0 && (
        <CaptionOverlay
          words={words}
          introFrames={introFrames}
        />
      )}

      {/* ── Layer 7: Intro Sequence ── */}
      <IntroSequence title={title} />

      {/* ── Layer 8: Outro Sequence ── */}
      <OutroSequence outroStartFrame={outroStartFrame} />
    </div>
  );
};
