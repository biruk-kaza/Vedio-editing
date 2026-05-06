/**
 * EOTC Voice Studio — Cinematic Motion Design Composition
 * 
 * ═══ CINEMATIC FEATURES ═══
 * 
 * 1. CAMERA MOVEMENT
 *    Entire scene wrapped in a slow zoom-out container:
 *    Scale 1.05 → 1.0 over the full clip duration.
 *    Creates a subtle cinematic "pull-back" effect.
 * 
 * 2. AUDIO REACTIVITY
 *    Audio amplitude is extracted via getAudioData + visualizeAudio.
 *    The bass amplitude drives a "pulse" variable that's passed
 *    to the CrossWatermark, making it breathe with the speaker's voice.
 * 
 * 3. AMBIENT BACKGROUND
 *    Pulsating gradient + sparse floating particles (existing).
 * 
 * 4. FONT LOADING
 *    @remotion/google-fonts for bulletproof Amharic rendering.
 *    Proper character shaping for ፒኬ etc during frame capture.
 * 
 * Layer Stack (bottom → top):
 * ─────────────────────────────
 * 1. AnimatedBackground   — cinematic gradient + bokeh
 * 2. LightRays            — volumetric god-rays
 * 3. CrossWatermark       — audio-reactive EOTC cross
 * 4. ParticleField        — floating golden dust
 * 5. Audio                — voiceover (starts after intro)
 * 6. CaptionOverlay       — kinetic typography
 * 7. IntroSequence        — cinematic opening
 * 8. OutroSequence        — branded closing
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
  interpolate,
  Easing,
} from 'remotion';
import { getAudioData, visualizeAudio } from '@remotion/media-utils';
import { loadFont as loadEthiopic } from '@remotion/google-fonts/NotoSansEthiopic';
import { AnimatedBackground } from './components/AnimatedBackground.jsx';
import { ParticleField } from './components/ParticleField.jsx';
import { LightRays } from './components/LightRays.jsx';
import { CrossWatermark } from './components/CrossWatermark.jsx';
import { CaptionOverlay } from './components/CaptionOverlay.jsx';
import { IntroSequence } from './components/IntroSequence.jsx';
import { OutroSequence } from './components/OutroSequence.jsx';
import { theme } from './utils/theme.js';

// ── Bulletproof Amharic font via @remotion/google-fonts ──
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

  // ── Font Loading ──
  const [fontsHandle] = useState(() => delayRender('Loading fonts...'));
  useEffect(() => {
    const load = async () => {
      try {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = INTER_URL;
        await new Promise((res) => { link.onload = res; link.onerror = res; document.head.appendChild(link); });
        await document.fonts.ready;
      } catch (e) { console.warn('Font load issue:', e); }
      continueRender(fontsHandle);
    };
    load();
  }, [fontsHandle]);

  // ── Audio Reactivity: extract amplitude ──
  const audioSrc = audioFileName ? staticFile(audioFileName) : null;
  const [audioData, setAudioData] = useState(null);
  const [audioHandle] = useState(() => audioSrc ? delayRender('Loading audio data...') : null);

  useEffect(() => {
    if (!audioSrc || !audioHandle) return;
    getAudioData(audioSrc)
      .then((data) => {
        setAudioData(data);
        continueRender(audioHandle);
      })
      .catch(() => {
        // Don't block render if audio analysis fails
        continueRender(audioHandle);
      });
  }, [audioSrc, audioHandle]);

  // ── Compute audio amplitude for current frame ──
  const introFrames = theme.timing.introDuration;
  let audioPulse = 0;
  if (audioData && frame >= introFrames) {
    try {
      const visualization = visualizeAudio({
        fps,
        frame: frame - introFrames,
        audioData,
        numberOfSamples: 16,
      });
      // Average the first 4 samples (bass/mid frequencies)
      audioPulse = (visualization[0] + visualization[1] + visualization[2] + visualization[3]) / 4;
    } catch {
      audioPulse = 0;
    }
  }

  // ── CAMERA MOVEMENT: slow zoom-out 1.05 → 1.0 ──
  const cameraScale = interpolate(
    frame,
    [0, durationInFrames],
    [1.05, 1.0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  const outroFrames = theme.timing.outroDuration;
  const outroStartFrame = durationInFrames - outroFrames;

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
      {/* ── CAMERA ZOOM-OUT WRAPPER ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${cameraScale})`,
          transformOrigin: '50% 50%',
          willChange: 'transform',
        }}
      >
        {/* Layer 1: Animated Background */}
        <AnimatedBackground />

        {/* Layer 2: Light Rays */}
        <LightRays />

        {/* Layer 3: Audio-Reactive Cross */}
        <CrossWatermark audioPulse={audioPulse} />

        {/* Layer 4: Particles */}
        <ParticleField />

        {/* Layer 5: Audio */}
        {audioSrc && (
          <Sequence from={introFrames}>
            <Audio src={audioSrc} />
          </Sequence>
        )}

        {/* Layer 6: Kinetic Typography */}
        {words.length > 0 && (
          <CaptionOverlay words={words} introFrames={introFrames} />
        )}

        {/* Layer 7: Intro */}
        <IntroSequence title={title} />

        {/* Layer 8: Outro */}
        <OutroSequence outroStartFrame={outroStartFrame} />
      </div>
    </div>
  );
};
