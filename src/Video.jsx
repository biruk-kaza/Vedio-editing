/**
 * EOTC Voice Studio — Main Video Composition
 * 
 * The master composition that layers all visual elements:
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
 * Props (passed from render-entry.js):
 * @prop {Array} words           - [{word, start, end}, ...] from Whisper
 * @prop {string} audioFileName  - filename in public/ dir (e.g. "audio.m4a")
 * @prop {string} title          - intro title text
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
import { AnimatedBackground } from './components/AnimatedBackground.jsx';
import { ParticleField } from './components/ParticleField.jsx';
import { LightRays } from './components/LightRays.jsx';
import { CrossWatermark } from './components/CrossWatermark.jsx';
import { CaptionOverlay } from './components/CaptionOverlay.jsx';
import { IntroSequence } from './components/IntroSequence.jsx';
import { OutroSequence } from './components/OutroSequence.jsx';
import { theme } from './utils/theme.js';

// Google Fonts CSS URLs
const FONT_URLS = [
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
];

export const EOTCVideo = ({
  words = [],
  audioFileName = '',
  title = 'EOTC Voice Studio',
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  // ── Font Loading ──
  // delayRender prevents frame capture until fonts are loaded
  const [fontsHandle] = useState(() => delayRender('Loading EOTC fonts...'));

  useEffect(() => {
    const loadFonts = async () => {
      try {
        const promises = FONT_URLS.map((url) => {
          return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = resolve;
            link.onerror = resolve; // Don't block render on font failure
            document.head.appendChild(link);
          });
        });
        await Promise.all(promises);
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading issue (non-critical):', e);
      }
      continueRender(fontsHandle);
    };
    loadFonts();
  }, [fontsHandle]);

  // ── Timing Calculations ──
  const introFrames = theme.timing.introDuration;
  const outroFrames = theme.timing.outroDuration;
  const outroStartFrame = durationInFrames - outroFrames;

  // Resolve audio source via Remotion's staticFile
  const audioSrc = audioFileName ? staticFile(audioFileName) : null;

  return (
    <div
      style={{
        width: theme.video.width,
        height: theme.video.height,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: theme.bg.deep,
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
      {/* Audio starts after intro sequence */}
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

      {/* ── Layer 7: Intro Sequence (overlays everything) ── */}
      <IntroSequence title={title} />

      {/* ── Layer 8: Outro Sequence ── */}
      <OutroSequence outroStartFrame={outroStartFrame} />
    </div>
  );
};
