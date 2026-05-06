/**
 * EOTC Voice Studio — Cross Watermark
 * 
 * Ultra-subtle. Barely there. Just brands the frame.
 * Slow rotation + breathing opacity + 1px blur for softness.
 */
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../utils/theme.js';

export const CrossWatermark = () => {
  const frame = useCurrentFrame();
  const rotation = frame * 0.012;
  const opacity = interpolate(Math.sin(frame * 0.006), [-1, 1], [0.025, 0.055]);
  const scale = interpolate(Math.sin(frame * 0.005), [-1, 1], [0.97, 1.03]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <svg viewBox="0 0 200 280" width={280} height={392} style={{
        opacity, transform: `rotate(${rotation}deg) scale(${scale})`,
        marginTop: '-10%', filter: 'blur(1px)',
      }}>
        <g fill={theme.gold.primary} fillRule="evenodd">
          <rect x="88" y="20" width="24" height="240" rx="3" />
          <rect x="30" y="68" width="140" height="24" rx="3" />
          <circle cx="100" cy="20" r="14" />
          <circle cx="30" cy="80" r="10" />
          <circle cx="170" cy="80" r="10" />
          <circle cx="100" cy="260" r="10" />
          <rect x="86" y="66" width="28" height="28" rx="4" transform="rotate(45 100 80)" />
          <rect x="95" y="40" width="10" height="80" rx="2" opacity="0.3" />
          <rect x="55" y="75" width="90" height="10" rx="2" opacity="0.3" />
        </g>
      </svg>
    </div>
  );
};
