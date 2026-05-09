/**
 * EOTC Voice Studio — Dual-Mode Composition
 * 
 * MODE 1: "kinetic" — Dark background + full kinetic typography
 * MODE 2: "caption" — Video background + clean bottom captions
 * 
 * Mode is auto-detected from props.mode (set by prepare-render.js)
 */
import React, { useEffect, useState } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  Audio,
  Video,
  staticFile,
  continueRender,
  delayRender,
  Sequence,
  AbsoluteFill,
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
import { VideoCaptionOverlay } from './components/VideoCaptionOverlay.jsx';
import { IntroSequence } from './components/IntroSequence.jsx';
import { OutroSequence } from './components/OutroSequence.jsx';
import { ProgressBar } from './components/ProgressBar.jsx';
import { LightLeak } from './components/LightLeak.jsx';
import { FloatingDust, AnamorphicLeaks, BreathingVignette } from './components/CinematicOverlays.jsx';
import { theme } from './utils/theme.js';

const { fontFamily: ethiopicFont } = loadEthiopic('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['ethiopic', 'latin'],
});

const INTER_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';

export const EOTCVideo = ({
  words = [],
  audioFileName = '',
  videoFileName = '',
  mode = 'kinetic',
  title = 'EOTC Voice Studio',
  showProgressBar = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const isVideoMode = mode === 'caption' && videoFileName;

  // ── Inter font ──
  const [fontsHandle] = useState(() => delayRender('Loading Inter...'));
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = INTER_URL;
    link.onload = () => { document.fonts.ready.then(() => continueRender(fontsHandle)); };
    link.onerror = () => continueRender(fontsHandle);
    document.head.appendChild(link);
  }, [fontsHandle]);

  // ── Media sources ──
  const audioSrc = audioFileName ? staticFile(audioFileName) : null;
  const videoSrc = videoFileName ? staticFile(videoFileName) : null;

  // ── Audio reactivity (kinetic mode only) ──
  const [audioData, setAudioData] = useState(null);
  const [audioHandle] = useState(() => audioSrc && !isVideoMode ? delayRender('Loading audio...') : null);

  useEffect(() => {
    if (!audioSrc || !audioHandle || isVideoMode) return;
    getAudioData(audioSrc)
      .then((data) => { setAudioData(data); continueRender(audioHandle); })
      .catch(() => continueRender(audioHandle));
  }, [audioSrc, audioHandle, isVideoMode]);

  let audioPulse = 0;
  let audioFrequencies = new Array(32).fill(0);
  const introFrames = isVideoMode ? 0 : theme.timing.introDuration;

  if (audioData && !isVideoMode && frame >= introFrames) {
    try {
      const frequencies = visualizeAudio({
        fps, frame: frame - introFrames, audioData,
        numberOfSamples: 32, optimizeFor: 'speed',
      });
      audioFrequencies = frequencies;
      const lowFreqs = frequencies.slice(0, 8);
      audioPulse = lowFreqs.reduce((s, v) => s + v, 0) / lowFreqs.length;
    } catch { 
      audioPulse = 0; 
      audioFrequencies = new Array(32).fill(0);
    }
  }

  // ═══════════════════════════════════
  // MODE: VIDEO CAPTION OVERLAY
  // ═══════════════════════════════════
  if (isVideoMode) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: ethiopicFont, overflow: 'hidden' }}>
        {/* Full-screen clean video (no shake, no blur) */}
        <Video
          src={videoSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Clean, professional bottom-third captions */}
        {words.length > 0 && (
          <VideoCaptionOverlay words={words} />
        )}

        {/* Subtle progress bar */}
        {showProgressBar && (
          <ProgressBar introFrames={0} outroFrames={0} />
        )}
      </AbsoluteFill>
    );
  }

  // ═══════════════════════════════════
  // MODE: KINETIC TYPOGRAPHY (dark bg)
  // ═══════════════════════════════════
  const cameraZ = interpolate(frame, [0, durationInFrames], [0, 80], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });
  const cameraScale = interpolate(frame, [0, durationInFrames], [1.06, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });

  // ── STEADY CAMERA (No Shaking) ──
  const panX = 0;
  const panY = 0;
  const rotZ = 0;

  const bgTransform = `scale(${cameraScale * 1.12}) translate3d(0px, 0px, ${-cameraZ * 0.3}px)`;
  const midTransform = `scale(${cameraScale * 1.06}) translate3d(0px, 0px, ${-cameraZ * 0.15}px)`;
  const fgTransform = `scale(${cameraScale}) translate3d(0px, 0px, 0px)`;

  const outroFrames = theme.timing.outroDuration;
  const outroStartFrame = durationInFrames - outroFrames;
  const lightLeakDuration = 25;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg.deep, fontFamily: ethiopicFont, overflow: 'hidden', perspective: '1400px' }}>

      <Sequence durationInFrames={durationInFrames}>
        <AbsoluteFill style={{ transform: bgTransform, willChange: 'transform' }}>
          <AnimatedBackground />
        </AbsoluteFill>
      </Sequence>

      <Sequence durationInFrames={durationInFrames}>
        <AbsoluteFill style={{ transform: midTransform, willChange: 'transform' }}>
          <LightRays />
          <ParticleField />
          <FloatingDust />
        </AbsoluteFill>
      </Sequence>

      <Sequence durationInFrames={durationInFrames}>
        <AbsoluteFill style={{ transform: fgTransform, willChange: 'transform' }}>
          <CrossWatermark audioPulse={audioPulse} />
        </AbsoluteFill>
      </Sequence>

      <Sequence durationInFrames={introFrames + 25} layout="none">
        <IntroSequence title={title} />
      </Sequence>

      <Sequence from={Math.max(0, introFrames - 10)} durationInFrames={lightLeakDuration} layout="none">
        <LightLeak startFrame={0} durationFrames={lightLeakDuration} />
      </Sequence>

      {audioSrc && (
        <Sequence from={introFrames} layout="none">
          <Audio src={audioSrc} />
        </Sequence>
      )}

      {words.length > 0 && (
        <Sequence durationInFrames={durationInFrames} layout="none">
          <AbsoluteFill style={{ transform: fgTransform, willChange: 'transform' }}>
            <CaptionOverlay words={words} introFrames={introFrames} audioPulse={audioPulse} audioFrequencies={audioFrequencies} />
          </AbsoluteFill>
        </Sequence>
      )}

      <Sequence from={Math.max(0, outroStartFrame - 10)} durationInFrames={lightLeakDuration} layout="none">
        <LightLeak startFrame={0} durationFrames={lightLeakDuration} />
      </Sequence>

      <Sequence from={outroStartFrame} layout="none">
        <OutroSequence outroStartFrame={0} />
      </Sequence>

      <Sequence durationInFrames={durationInFrames}>
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 15 }}>
          {/* 35mm Film Grain */}
          <div style={{
            position: 'absolute', inset: 0, opacity: theme.bg.grainOpacity,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
            backgroundSize: theme.bg.grainScale, mixBlendMode: 'overlay',
          }} />
          {/* Breathing Vignette */}
          <BreathingVignette />
          {/* Anamorphic Light Leaks */}
          <AnamorphicLeaks />
          {/* Film Halation — warm red glow on bright edges (vintage film look) */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 40% 35% at 50% 48%, rgba(180, 60, 30, 0.04) 0%, transparent 70%)`,
            mixBlendMode: 'screen',
            opacity: 0.6 + audioPulse * 0.4,
          }} />
        </AbsoluteFill>
      </Sequence>

      {showProgressBar && (
        <Sequence durationInFrames={durationInFrames} layout="none">
          <ProgressBar introFrames={introFrames} outroFrames={outroFrames} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
