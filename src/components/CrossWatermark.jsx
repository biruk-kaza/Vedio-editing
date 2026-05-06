/**
 * EOTC Voice Studio — Cross Watermark
 * 
 * Ultra-subtle Ethiopian Orthodox cross rendered as a translucent watermark.
 * Barely visible — just enough to brand the frame.
 * - Very slow rotation
 * - Gentle breathing pulse
 * - Smooth scale oscillation
 */
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

export const CrossWatermark = () => {
  const frame = useCurrentFrame();

  // Ultra-slow rotation
  const rotation = frame * 0.015;

  // Gentle breathing opacity
  const opacity = interpolate(
    Math.sin(frame * 0.008),
    [-1, 1],
    [0.03, 0.065]
  );

  // Subtle scale breathing
  const scale = interpolate(
    Math.sin(frame * 0.006),
    [-1, 1],
    [0.97, 1.03]
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
        width={300}
        height={420}
        style={{
          opacity,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          marginTop: '-12%',
          filter: `blur(1px)`,
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
            x="86" y="66" width="28" height="28" rx="4"
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
