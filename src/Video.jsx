/**
 * EOTC Voice Studio — Remotion Best-Practice Main Composition
 * 
 * Follows @remotion/skills best practices:
 * ✅ AbsoluteFill for layout
 * ✅ Sequence for scene timing
 * ✅ useWindowedAudioData for audio reactivity
 * ✅ interpolate + Easing.bezier for all motion (NO CSS transitions)
 * ✅ @remotion/google-fonts for font loading
 * ✅ staticFile() for assets
 * ✅ Camera zoom-out via interpolate over full duration
 * ✅ Parallax depth layers
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
  AbsoluteFill,
  interpolate,
  Easing,
} from 'remotion';
import { useWindowedAudioData, visualizeAudio } from '@remotion/media-utils';
import { loadFont as loadEthiopic } from '@remotion/google-fonts/NotoSansEthiopic';
import { AnimatedBackground } from './components/AnimatedBackground.jsx';
import { ParticleField } from './components/ParticleField.jsx';
import { LightRays } from './components/LightRays.jsx';
import { CrossWatermark } from './components/CrossWatermark.jsx';
import { CaptionOverlay } from './components/CaptionOverlay.jsx';
import { IntroSequence } from './components/IntroSequence.jsx';
import { OutroSequence } from './components/OutroSequence.jsx';
import { theme } from './utils/theme.js';

// ── Font: @remotion/google-fonts blocks render until ready ──
const { fontFamily: ethiopicFont } = loadEthiopic('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['ethiopic', 'latin'],
});

const INTER_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';

export const EOTCVideo = ({
  words = [],
  audioFileName = '',
  title = 'EOTC Voice Studio',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ── Inter font (display text) ──
  const [fontsHandle] = useState(() => delayRender('Loading Inter font...'));
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = INTER_URL;
    link.onload = () => { document.fonts.ready.then(() => continueRender(fontsHandle)); };
    link.onerror = () => continueRender(fontsHandle);
    document.head.appendChild(link);
  }, [fontsHandle]);

  // ── Audio source ──
  const audioSrc = audioFileName ? staticFile(audioFileName) : null;

  // ── Audio reactivity: useWindowedAudioData (best practice) ──
  const audioResult = audioSrc
    ? useWindowedAudioData({ src: audioSrc, frame, fps, windowInSeconds: 30 })
    : null;

  let audioPulse = 0;
  const introFrames = theme.timing.introDuration;

  if (audioResult?.audioData && frame >= introFrames) {
    try {
      const frequencies = visualizeAudio({
        fps,
        frame: frame - introFrames,
        audioData: audioResult.audioData,
        numberOfSamples: 32,
        optimizeFor: 'speed',
        dataOffsetInSeconds: audioResult.dataOffsetInSeconds,
      });
      // Bass-reactive: average low frequencies (skill best practice)
      const lowFreqs = frequencies.slice(0, 8);
      audioPulse = lowFreqs.reduce((sum, v) => sum + v, 0) / lowFreqs.length;
    } catch {
      audioPulse = 0;
    }
  }

  // ── CAMERA: slow zoom-out 1.05→1.0 with editorial ease-in-out ──
  const cameraScale = interpolate(frame, [0, durationInFrames], [1.05, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.45, 0, 0.55, 1), // editorial timing
  });

  // ── PARALLAX: camera wander ──
  const panX = Math.sin(frame * 0.003) * 35;
  const panY = Math.cos(frame * 0.002) * 25;
  const rotZ = Math.sin(frame * 0.0012) * 1.8;

  // Layer multipliers (deeper = moves less)
  const bgTransform = `scale(${cameraScale * 1.12}) translate3d(${-panX * 0.15}px, ${-panY * 0.15}px, 0) rotate(${-rotZ * 0.15}deg)`;
  const midTransform = `scale(${cameraScale * 1.06}) translate3d(${-panX * 0.4}px, ${-panY * 0.4}px, 0) rotate(${-rotZ * 0.4}deg)`;
  const fgTransform = `scale(${cameraScale}) translate3d(${-panX}px, ${-panY}px, 0) rotate(${-rotZ}deg)`;

  const outroStartFrame = durationInFrames - theme.timing.outroDuration;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg.deep,
        fontFamily: ethiopicFont,
        overflow: 'hidden',
      }}
    >
      {/* ── BACKGROUND LAYER (deepest parallax) ── */}
      <AbsoluteFill style={{ transform: bgTransform, willChange: 'transform' }}>
        <AnimatedBackground />
      </AbsoluteFill>

      {/* ── MIDGROUND LAYER (atmosphere) ── */}
      <AbsoluteFill style={{ transform: midTransform, willChange: 'transform' }}>
        <LightRays />
        <ParticleField />
      </AbsoluteFill>

      {/* ── FOREGROUND LAYER (subject) ── */}
      <AbsoluteFill style={{ transform: fgTransform, willChange: 'transform' }}>
        {/* Audio-reactive cross */}
        <CrossWatermark audioPulse={audioPulse} />

        {/* Audio track in a Sequence (starts after intro) */}
        {audioSrc && (
          <Sequence from={introFrames} layout="none">
            <Audio src={audioSrc} />
          </Sequence>
        )}

        {/* Kinetic typography */}
        {words.length > 0 && (
          <CaptionOverlay words={words} introFrames={introFrames} />
        )}
      </AbsoluteFill>

      {/* ── UI OVERLAYS (fixed to screen, not affected by camera) ── */}
      <Sequence durationInFrames={introFrames + 25} layout="none">
        <IntroSequence title={title} />
      </Sequence>

      <Sequence from={outroStartFrame} layout="none">
        <OutroSequence outroStartFrame={outroStartFrame} />
      </Sequence>
    </AbsoluteFill>
  );
};
