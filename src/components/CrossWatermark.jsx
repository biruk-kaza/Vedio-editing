/**
 * EOTC Voice Studio — Audio-Reactive Cross Watermark
 * 
 * The cross BREATHES with the speaker's voice.
 * audioPulse (0→1) from visualizeAudio drives the scale.
 * When the speaker is silent, the cross rests.
 * When speaking, it subtly grows with the amplitude.
 * 
 * Also has baseline slow rotation + breathing for
 * moments of silence.
 */
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

export const CrossWatermark = ({ audioPulse = 0 }) => {
  const frame = useCurrentFrame();

  // Slow rotation (always)
  const rotation = frame * 0.012;

  // Baseline breathing opacity (always)
  const baseOpacity = interpolate(
    Math.sin(frame * 0.006),
    [-1, 1],
    [0.025, 0.055]
  );

  // ── AUDIO REACTIVITY ──
  // Map audioPulse (0→1) to scale boost
  // Silent: scale = 1.0, Speaking loud: scale = 1.15
  const audioScale = 1 + audioPulse * 0.15;

  // Map audioPulse to opacity boost
  // Silent: base opacity, Speaking: up to 0.09
  const audioOpacity = baseOpacity + audioPulse * 0.04;

  // Map audioPulse to glow intensity
  const glowSize = audioPulse * 25;

  // Baseline scale breathing (for silence)
  const baseScale = interpolate(
    Math.sin(frame * 0.005),
    [-1, 1],
    [0.97, 1.03]
  );

  const finalScale = baseScale * audioScale;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <svg
        viewBox="0 0 200 280"
        width={280}
        height={392}
        style={{
          opacity: audioOpacity,
          transform: `rotate(${rotation}deg) scale(${finalScale})`,
          marginTop: '-10%',
          filter: `blur(1px)${glowSize > 0.5 ? ` drop-shadow(0 0 ${glowSize}px ${theme.gold.glow})` : ''}`,
        }}
      >
        <g fill={theme.gold.primary} fillRule="evenodd">
          {/* Vertical beam */}
          <rect x="88" y="20" width="24" height="240" rx="3" />
          {/* Horizontal beam */}
          <rect x="30" y="68" width="140" height="24" rx="3" />
          {/* Finials */}
          <circle cx="100" cy="20" r="14" />
          <circle cx="30" cy="80" r="10" />
          <circle cx="170" cy="80" r="10" />
          <circle cx="100" cy="260" r="10" />
          {/* Center diamond */}
          <rect x="86" y="66" width="28" height="28" rx="4" transform="rotate(45 100 80)" />
          {/* Inner detail */}
          <rect x="95" y="40" width="10" height="80" rx="2" opacity="0.3" />
          <rect x="55" y="75" width="90" height="10" rx="2" opacity="0.3" />
        </g>
      </svg>
    </div>
  );
};
