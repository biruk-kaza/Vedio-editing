/**
 * EOTC Voice Studio — Remotion Entry Point
 * 
 * ✅ Zod schema for type-safe CLI rendering
 * ✅ calculateMetadata for dynamic duration
 * ✅ Schema exported for external use
 */
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { EOTCVideo } from './Video.jsx';
import { eotcVideoSchema } from './schema.js';
import { theme } from './utils/theme.js';

// Demo words for Remotion Studio preview
const DEMO_WORDS = [
  { word: 'በስመ', start: 0.0, end: 0.8 },
  { word: 'አብ', start: 0.8, end: 1.2 },
  { word: 'ወወልድ', start: 1.2, end: 1.8 },
  { word: 'ወመንፈስ', start: 1.8, end: 2.5 },
  { word: 'ቅዱስ', start: 2.5, end: 3.2 },
  { word: 'አሐዱ', start: 3.2, end: 3.8 },
  { word: 'አምላክ', start: 3.8, end: 4.5 },
  { word: 'አሜን', start: 4.5, end: 5.2 },
];

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="EOTCVideo"
        component={EOTCVideo}
        schema={eotcVideoSchema}
        durationInFrames={theme.video.fps * 15}
        fps={theme.video.fps}
        width={theme.video.width}
        height={theme.video.height}
        defaultProps={{
          words: DEMO_WORDS,
          audioFileName: '',
          title: 'EOTC Voice Studio',
          totalDuration: 5.2,
          totalSeconds: 11.7,
          brandColors: {
            goldPrimary: '#c9a96e',
            goldBright: '#e8d5a3',
            bgDeep: '#030305',
          },
          showProgressBar: true,
        }}
        calculateMetadata={async ({ props }) => {
          const fps = theme.video.fps;
          const totalSec = props.totalSeconds || 15;
          return {
            durationInFrames: Math.ceil(totalSec * fps),
            fps,
            width: theme.video.width,
            height: theme.video.height,
          };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
