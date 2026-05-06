/**
 * EOTC Voice Studio — Maximum Cinematic Motion Design
 * 
 * ═══ PARALLAX CAMERA ENGINE ═══
 * We separate the scene into 3 depth layers: Background, Midground, Foreground.
 * As the "virtual camera" pans and tilts (using continuous sine waves), 
 * the layers move at different speeds to create true 3D parallax depth.
 * 
 * ═══ AUDIO REACTIVITY ═══
 * Amplitude drives the main cross's scale and glow, pulsing with the voice.
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

// ── Bulletproof Amharic font ──
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

  // ── Audio Reactivity ──
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
      .catch(() => continueRender(audioHandle));
  }, [audioSrc, audioHandle]);

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
      // Average bass/mid frequencies for a smooth pulse
      audioPulse = (visualization[0] + visualization[1] + visualization[2] + visualization[3]) / 4;
    } catch {
      audioPulse = 0;
    }
  }

  // ════════════════════════════════════════════════════════════
  // 📸 VIRTUAL PARALLAX CAMERA ENGINE
  // Continually wanders through 3D space. Layers move at different
  // rates to simulate a camera panning through a deep environment.
  // ════════════════════════════════════════════════════════════
  
  // Base camera coordinates (continuous wandering)
  const panX = Math.sin(frame * 0.0035) * 50; 
  const panY = Math.cos(frame * 0.0025) * 35;
  const rotZ = Math.sin(frame * 0.0015) * 2.5; // Dutch angle tilt
  const cameraZ = Math.sin(frame * 0.004) * 0.06; // Breathing zoom
  
  // Intro push-in effect (smooth landing)
  const introZoom = interpolate(frame, [0, introFrames], [0.15, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });

  const baseScale = 1.05 + cameraZ + introZoom;

  // Layer multipliers (further away = moves less)
  // Background
  const bgTransform = `scale(${baseScale * 1.15}) translate3d(${-panX * 0.2}px, ${-panY * 0.2}px, 0) rotate(${-rotZ * 0.2}deg)`;
  // Midground (Particles, Rays)
  const midTransform = `scale(${baseScale * 1.08}) translate3d(${-panX * 0.5}px, ${-panY * 0.5}px, 0) rotate(${-rotZ * 0.5}deg)`;
  // Foreground (Text, Cross)
  const fgTransform = `scale(${baseScale}) translate3d(${-panX * 1.1}px, ${-panY * 1.1}px, 0) rotate(${-rotZ}deg)`;

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
        perspective: '1200px', // Establish 3D space
      }}
    >
      {/* ── LAYER 1: BACKGROUND (Deepest) ── */}
      <div style={{ position: 'absolute', inset: 0, transform: bgTransform, willChange: 'transform' }}>
        <AnimatedBackground />
      </div>

      {/* ── LAYER 2: MIDGROUND (Atmosphere) ── */}
      <div style={{ position: 'absolute', inset: 0, transform: midTransform, willChange: 'transform' }}>
        <LightRays />
        <ParticleField />
      </div>

      {/* ── LAYER 3: FOREGROUND (Subject) ── */}
      <div style={{ position: 'absolute', inset: 0, transform: fgTransform, willChange: 'transform' }}>
        <CrossWatermark audioPulse={audioPulse} />
        
        {audioSrc && (
          <Sequence from={introFrames}>
            <Audio src={audioSrc} />
          </Sequence>
        )}

        {words.length > 0 && (
          <CaptionOverlay words={words} introFrames={introFrames} />
        )}
      </div>

      {/* ── UI OVERLAYS (Static to Screen) ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <IntroSequence title={title} />
        <OutroSequence outroStartFrame={outroStartFrame} />
      </div>
    </div>
  );
};
