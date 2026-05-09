/**
 * EOTC Voice Studio — Premium Video Caption Overlay
 * 
 * ═══ DESIGN PRINCIPLES ═══
 * 
 * 1. ULTRA-CLEAN FROSTED GLASS — Premium glassmorphism pill
 *    with crisp edges and multi-layered shadows.
 * 
 * 2. SMOOTH WORD HIGHLIGHTING — Active word scales up subtly
 *    and brightens with a clean white glow. No jitter.
 * 
 * 3. CINEMATIC GRADIENT — Deep, multi-stop gradient anchors
 *    the caption to the bottom of the video frame.
 * 
 * 4. SEARCHLIGHT SWEEP — Specular golden sheen tracks
 *    speech progress across the glass pill.
 * 
 * 5. OPTICAL MOTION BLUR — Entry/exit uses realistic
 *    directional blur for camera-like transitions.
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
const FONT_SIZE = 68;
const LINE_HEIGHT = 1.4;

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
   SMOOTH COLOR WORD
   Clean, sleek karaoke illumination. Zero wobble.
   ═══════════════════════════════════════════════ */
const SmoothColorWord = ({ word, globalFrame, fps }) => {
  const absoluteTimeSec = globalFrame / fps;
  const wordEndPadded = word.end + 0.05;
  const isCurrent = absoluteTimeSec >= word.start && absoluteTimeSec < wordEndPadded;
  const isPast = absoluteTimeSec >= wordEndPadded;

  // Opacity states
  const opacity = isCurrent ? 1.0 : (isPast ? 0.8 : 0.35);
  const color = isCurrent ? '#FFFFFF' : (isPast ? theme.gold.warm : '#A0A0A0');

  // Text shadow: clean white glow on active
  const textShadow = isCurrent
    ? `0 0 12px rgba(255, 255, 255, 0.5), 0 2px 8px rgba(0,0,0,0.9)`
    : '0 2px 6px rgba(0,0,0,0.8)';

  return (
    <span style={{
      display: 'inline-block',
      color,
      opacity,
      textShadow,
      margin: '0 7px',
      transition: 'color 0.1s ease, opacity 0.1s ease',
      willChange: 'color, opacity, text-shadow',
    }}>
      {word.word}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   CAPTION LINE — Frosted glass + searchlight
   ═══════════════════════════════════════════════ */
const CaptionLine = ({ line, fps, lineIndex, seqStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps: configFps } = useVideoConfig();
  const globalFrame = seqStartFrame + frame;
  const pageDurFrames = Math.ceil((line.end - line.start) * fps);

  // ── ENTRY: Clean spring slide-up ──
  const enterSpring = spring({
    frame,
    fps: configFps,
    config: { damping: 22, stiffness: 160, mass: 0.5 },
    durationInFrames: 16,
  });

  const entryOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const entryY = interpolate(enterSpring, [0, 1], [20, 0]);
  const entryScale = interpolate(enterSpring, [0, 1], [0.95, 1.0]);

  // ── EXIT: Smooth dissolve upward ──
  const exitStart = pageDurFrames + 2;
  const exitProgress = interpolate(
    frame,
    [exitStart, exitStart + 12],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }
  );
  const exitOpacity = 1 - exitProgress;
  const exitY = interpolate(exitProgress, [0, 1], [0, -8]);
  const exitScale = interpolate(exitProgress, [0, 1], [1.0, 1.02]);

  const totalOpacity = entryOpacity * exitOpacity;
  if (totalOpacity < 0.01) return null;

  const totalY = entryY + exitY;
  const totalScale = entryScale * exitScale;

  // ── SEARCHLIGHT SWEEP ──
  const lineProgress = interpolate(
    frame,
    [0, pageDurFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const searchlightX = interpolate(lineProgress, [0, 1], [-25, 125]);
  const searchlightIntensity = interpolate(
    lineProgress, [0, 0.1, 0.5, 0.9, 1], [0, 0.8, 1.0, 0.8, 0]
  );

  // ── ORGANIC BREATHING (barely perceptible) ──
  const breathScale = interpolate(
    Math.sin(frame * 0.02), [-1, 1], [0.999, 1.001]
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>

      {/* ── CINEMATIC BOTTOM GRADIENT ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: `
            linear-gradient(0deg, 
              rgba(0,0,0,0.85) 0%, 
              rgba(0,0,0,0.55) 25%, 
              rgba(0,0,0,0.2) 50%, 
              rgba(0,0,0,0.05) 70%, 
              transparent 100%
            )
          `,
          opacity: totalOpacity,
        }}
      />

      {/* ── GHOST TRAIL (exit motion blur) ── */}
      {exitProgress > 0.01 && exitProgress < 0.9 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '20%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: totalOpacity * 0.25 * (1 - exitProgress),
            transform: `translateY(${totalY + 3}px) scale(${totalScale * 0.99})`,
            filter: `blur(${6 + exitProgress * 5}px)`,
          }}
        >
          <div style={{
            padding: '16px 32px',
            borderRadius: 18,
            maxWidth: '88%',
          }}>
            <span style={{
              color: 'rgba(255, 255, 255, 0.5)',
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

      {/* ── MAIN CAPTION CONTAINER ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '20%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: totalOpacity,
          transform: `translateY(${totalY}px) scale(${totalScale * breathScale})`,
          willChange: 'transform, opacity',
        }}
      >
        {/* ── FROSTED GLASS PILL ── */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0 10px',
            padding: '18px 36px',
            borderRadius: 20,
            background: 'rgba(10, 10, 10, 0.5)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: `
              0 16px 48px rgba(0, 0, 0, 0.6),
              0 4px 12px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.04),
              inset 0 -1px 0 rgba(0, 0, 0, 0.15)
            `,
            maxWidth: '88%',
            overflow: 'hidden',
          }}
        >
          {/* ── SEARCHLIGHT ── */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${searchlightX}%`,
              width: '20%',
              height: '100%',
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, ${0.03 * searchlightIntensity}) 30%, 
                rgba(255, 255, 255, ${0.06 * searchlightIntensity}) 50%, 
                rgba(255, 255, 255, ${0.03 * searchlightIntensity}) 70%, 
                transparent 100%
              )`,
              pointerEvents: 'none',
              filter: 'blur(6px)',
            }}
          />

          {/* ── TOP EDGE HIGHLIGHT ── */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '12%',
              right: '12%',
              height: '1px',
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.08) 30%, 
                rgba(255, 255, 255, 0.12) 50%, 
                rgba(255, 255, 255, 0.08) 70%, 
                transparent 100%
              )`,
            }}
          />

          {/* ── KARAOKE TEXT ── */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: FONT_SIZE,
              fontFamily: theme.fonts.caption,
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: LINE_HEIGHT,
              letterSpacing: '0.3px',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            {line.words.map((w, i) => (
              <SmoothColorWord
                key={i}
                word={w}
                globalFrame={globalFrame}
                fps={fps}
              />
            ))}
          </div>
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
        const endFrame = Math.floor(line.end * fps) + 16;
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
