/**
 * EOTC Voice Studio — Cross Watermark
 * 
 * Subtle Ethiopian Orthodox cross rendered as a translucent watermark.
 * Slowly rotates and pulses for a living, sacred feel.
 */
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

export const CrossWatermark = () => {
  const frame = useCurrentFrame();

  // Very slow rotation
  const rotation = frame * 0.02;

  // Gentle pulse
  const opacity = interpolate(
    Math.sin(frame * 0.012),
    [-1, 1],
    [0.04, 0.08]
  );

  // Scale breath
  const scale = interpolate(
    Math.sin(frame * 0.01),
    [-1, 1],
    [0.98, 1.02]
  );

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
        width={320}
        height={448}
        style={{
          opacity,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          marginTop: '-15%',
        }}
      >
        {/* Ethiopian Orthodox Cross — simplified geometric form */}
        <g fill={theme.gold.primary} fillRule="evenodd">
          {/* Vertical beam */}
          <rect x="88" y="20" width="24" height="240" rx="3" />
          {/* Horizontal beam */}
          <rect x="30" y="68" width="140" height="24" rx="3" />
          {/* Top finial */}
          <circle cx="100" cy="20" r="14" />
          {/* Left finial */}
          <circle cx="30" cy="80" r="10" />
          {/* Right finial */}
          <circle cx="170" cy="80" r="10" />
          {/* Bottom finial */}
          <circle cx="100" cy="260" r="10" />
          {/* Center diamond */}
          <rect
            x="86"
            y="66"
            width="28"
            height="28"
            rx="4"
            transform="rotate(45 100 80)"
          />
          {/* Inner cross detail */}
          <rect x="95" y="40" width="10" height="80" rx="2" opacity="0.3" />
          <rect x="55" y="75" width="90" height="10" rx="2" opacity="0.3" />
        </g>
      </svg>
    </div>
  );
};
