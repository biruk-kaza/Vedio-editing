/**
 * EOTC Voice Studio — World-Class Video Caption Overlay
 * 
 * ═══ DESIGN PHILOSOPHY ═══
 * 
 * Beyond Netflix/Apple TV+ — This is CINEMATIC OVERLAY DESIGN.
 * 
 * 1. FLUID GHOSTING TRANSITIONS — Text leaves a motion-blurred
 *    "trail" as it enters/exits, simulating cinema camera motion blur
 * 
 * 2. DYNAMIC SEARCHLIGHT — A golden specular "sheen" sweeps
 *    across the text left-to-right as the line is being spoken
 * 
 * 3. PARALLAX DEPTH — Captions float in 3D space with subtle
 *    perspective offset, creating depth against the video
 * 
 * 4. ADAPTIVE FROSTED GLASS — Premium glassmorphism with
 *    breathing inner glow and organic edge softness
 * 
 * 5. ZERO per-word highlighting — uniform professional text
 */
import React, { useMemo } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  AbsoluteFill,
  Easing,
} from 'remotion';
import { theme } from '../utils/theme.js';

// ═══ CONFIG ═══
const WORDS_PER_LINE = 4;
const FONT_SIZE = 72;
const LINE_HEIGHT = 1.45;

function groupWordsIntoLines(words, max) {
  const lines = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= max) {
      lines.push({
        words: [...cur],
        text: cur.map(w => w.word).join(' '),
        start: cur[0].start,
        end: cur[cur.length - 1].end,
      });
      cur = [];
    }
  }
  if (cur.length) {
    lines.push({
      words: [...cur],
      text: cur.map(w => w.word).join(' '),
      start: cur[0].start,
      end: cur[cur.length - 1].end,
    });
  }
  return lines;
}

/* ═══════════════════════════════════════════════
   WORLD-CLASS CAPTION LINE
   
   Features:
   - Fluid ghosting transitions (motion blur trail)
   - Dynamic searchlight sweep (golden sheen)
   - Parallax depth (3D floating)
   - Adaptive frosted glass pill
   ═══════════════════════════════════════════════ */
const CaptionLine = ({ line, fps, lineIndex, seqStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();
  const globalFrame = seqStartFrame + frame;
  const pageDurFrames = Math.ceil((line.end - line.start) * fps);

  // ── ENTRY: Critically-damped spring slide-up ──
  const enterSpring = spring({
    frame,
    fps: configFps,
    config: { damping: 28, stiffness: 200, mass: 0.6 },
    durationInFrames: 14,
  });

  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const entryY = interpolate(enterSpring, [0, 1], [22, 0]);
  const entryBlur = interpolate(enterSpring, [0, 1], [6, 0]);
  const entryScale = interpolate(enterSpring, [0, 1], [0.94, 1.0]);

  // ── EXIT: Smooth dissolve upward with ghost trail ──
  const exitStart = pageDurFrames + 2;
  const exitProgress = interpolate(
    frame,
    [exitStart, exitStart + 10],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }
  );
  const exitOpacity = 1 - exitProgress;
  const exitY = interpolate(exitProgress, [0, 1], [0, -12]);
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 1.03]);
  // Ghost trail blur on exit (simulates motion blur)
  const exitBlur = interpolate(exitProgress, [0, 0.3, 1], [0, 0, 5]);

  const totalOpacity = entryOpacity * exitOpacity;
  if (totalOpacity < 0.01) return null;

  const totalY = entryY + exitY;
  const totalScale = entryScale * exitScale;
  const totalBlur = entryBlur + exitBlur;

  // ── DYNAMIC SEARCHLIGHT SWEEP ──
  // A golden specular "sheen" that sweeps left-to-right as the line is spoken
  const lineProgress = interpolate(
    frame,
    [0, pageDurFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  // Searchlight position: -20% to 120% of the pill width
  const searchlightX = interpolate(lineProgress, [0, 1], [-20, 120]);
  const searchlightIntensity = interpolate(
    lineProgress, [0, 0.05, 0.5, 0.95, 1], [0, 0.6, 0.8, 0.6, 0]
  );

  // ── PARALLAX DEPTH ──
  // Subtle 3D floating — captions shift slightly opposite to a simulated camera pan
  const parallaxX = Math.sin(globalFrame * 0.008) * 2.5;
  const parallaxY = Math.cos(globalFrame * 0.006) * 1.5;
  // Micro perspective tilt for depth
  const perspTiltX = Math.sin(globalFrame * 0.005) * 0.4;
  const perspTiltY = Math.cos(globalFrame * 0.007) * 0.3;

  // ── ORGANIC BREATHING ──
  // Very slow, barely perceptible scale pulse
  const breathScale = interpolate(
    Math.sin(frame * 0.025), [-1, 1], [0.998, 1.002]
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', perspective: '1200px' }}>

      {/* ── CINEMATIC BOTTOM GRADIENT ──
          Multi-layered for maximum depth */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '45%',
          background: `
            linear-gradient(0deg, 
              rgba(0,0,0,0.88) 0%, 
              rgba(0,0,0,0.6) 30%, 
              rgba(0,0,0,0.25) 55%, 
              rgba(0,0,0,0.08) 75%, 
              transparent 100%
            )
          `,
          opacity: totalOpacity,
        }}
      />

      {/* ── GHOST TRAIL LAYER ──
          A faint, blurred duplicate that lingers during exit */}
      {exitProgress > 0.01 && exitProgress < 0.95 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '22%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: totalOpacity * 0.35 * (1 - exitProgress),
            transform: `translateY(${totalY + 4}px) scale(${totalScale * 0.99})`,
            filter: `blur(${8 + exitProgress * 6}px)`,
          }}
        >
          <div style={{
            padding: '18px 36px',
            borderRadius: 20,
            maxWidth: '90%',
          }}>
            <span style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: FONT_SIZE,
              fontFamily: theme.fonts.caption,
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: LINE_HEIGHT,
            }}>
              {line.text}
            </span>
          </div>
        </div>
      )}

      {/* ── PERFECT CENTER CONTAINER WITH PARALLAX ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '22%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: totalOpacity,
          transform: `
            translateX(${parallaxX}px)
            translateY(${totalY + parallaxY}px) 
            scale(${totalScale * breathScale}) 
            rotateX(${perspTiltX}deg) 
            rotateY(${perspTiltY}deg)
          `,
          filter: totalBlur > 0.1 ? `blur(${totalBlur}px)` : 'none',
          willChange: 'transform, opacity, filter',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ── PREMIUM FROSTED GLASS PILL ── */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0 14px',
            padding: '20px 40px',
            borderRadius: 22,
            background: 'rgba(8, 8, 8, 0.52)',
            backdropFilter: 'blur(20px) saturate(170%)',
            WebkitBackdropFilter: 'blur(20px) saturate(170%)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.65),
              0 6px 16px rgba(0, 0, 0, 0.45),
              inset 0 1px 0 rgba(255, 255, 255, 0.05),
              inset 0 -1px 0 rgba(0, 0, 0, 0.2)
            `,
            maxWidth: '90%',
            overflow: 'hidden',
          }}
        >
          {/* ── SEARCHLIGHT SWEEP ──
              A golden specular sheen that moves across the pill */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${searchlightX}%`,
              width: '25%',
              height: '100%',
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(212, 175, 55, ${0.06 * searchlightIntensity}) 30%, 
                rgba(255, 248, 225, ${0.10 * searchlightIntensity}) 50%, 
                rgba(212, 175, 55, ${0.06 * searchlightIntensity}) 70%, 
                transparent 100%
              )`,
              pointerEvents: 'none',
              filter: 'blur(8px)',
            }}
          />

          {/* ── TOP EDGE HIGHLIGHT ──
              Simulates light catching the top edge of the glass */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '1px',
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.12) 30%, 
                rgba(255, 255, 255, 0.18) 50%, 
                rgba(255, 255, 255, 0.12) 70%, 
                transparent 100%
              )`,
            }}
          />

          {/* ── UNIFORM TEXT ── */}
          <span
            style={{
              position: 'relative',
              zIndex: 2,
              color: 'rgba(255, 255, 255, 0.97)',
              fontSize: FONT_SIZE,
              fontFamily: theme.fonts.caption,
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: LINE_HEIGHT,
              letterSpacing: '0.5px',
              textShadow: `
                0 2px 6px rgba(0, 0, 0, 0.95),
                0 0 2px rgba(0, 0, 0, 0.9),
                0 8px 24px rgba(0, 0, 0, 0.5)
              `,
              WebkitTextStroke: '0.8px rgba(0, 0, 0, 0.25)',
              paintOrder: 'stroke fill',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            {line.text}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════ */
export const VideoCaptionOverlay = ({ words = [] }) => {
  const { fps } = useVideoConfig();

  const lines = useMemo(
    () => groupWordsIntoLines(words, WORDS_PER_LINE),
    [words]
  );

  return (
    <AbsoluteFill style={{ zIndex: 10, pointerEvents: 'none' }}>
      {lines.map((line, i) => {
        const startFrame = Math.floor(line.start * fps) - 2;
        const endFrame = Math.floor(line.end * fps) + 14;
        const duration = Math.max(1, endFrame - startFrame);

        return (
          <Sequence
            key={`caption-${i}`}
            from={Math.max(0, startFrame)}
            durationInFrames={duration}
          >
            <CaptionLine
              line={line}
              fps={fps}
              lineIndex={i}
              seqStartFrame={Math.max(0, startFrame)}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
