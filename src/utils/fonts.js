/**
 * EOTC Voice Studio — Font Loading Utility
 * 
 * Loads Google Fonts for both Amharic (Noto Sans Ethiopic) and Latin (Inter).
 * These are loaded at render time inside Remotion compositions.
 */
import { continueRender, delayRender, staticFile } from 'remotion';

const GOOGLE_FONTS_CSS = [
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
];

let fontsLoaded = false;

/**
 * Load all required fonts. Safe to call multiple times — only loads once.
 */
export async function loadFonts() {
  if (fontsLoaded) return;

  const promises = GOOGLE_FONTS_CSS.map(async (url) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);

    // Wait for the stylesheet to load
    await new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = reject;
    });
  });

  await Promise.all(promises);

  // Give fonts time to be applied
  await document.fonts.ready;
  fontsLoaded = true;
}

/**
 * React hook to ensure fonts are loaded before rendering.
 * Use inside any component that renders text.
 */
export function useFonts() {
  const [handle] = React.useState(() => delayRender('Loading EOTC fonts...'));

  React.useEffect(() => {
    loadFonts()
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error('Font loading failed:', err);
        continueRender(handle);
      });
  }, [handle]);
}

import React from 'react';
