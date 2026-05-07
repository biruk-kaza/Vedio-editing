/**
 * EOTC Voice Studio — Cinematic Intro Sequence
 * 
 * ═══ TYPOGRAPHIC TRANSITION ═══
 * Phase 1: [0→40] Cross draws on with path-trace
 * Phase 2: [25→55] "EOTC VOICE STUDIO" enters with cinematic snap
 * Phase 3: [45→75] English chars fragment, scale, and morph
 * Phase 4: [60→90] Amharic script reconstructs elegantly
 * Phase 5: [85→105] Everything fades into main content
 * 
 * The English→Amharic transition is an EVENT,
 * not a cut or dissolve.
 */
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Easing,
} from 'remotion';
import { theme } from '../utils/theme.js';
import { GlowIcon } from './IconLibrary.jsx';

const EASE_SNAP = Easing.bezier(0.05, 0.95, 0.15, 1.0);
const EASE_ENTER = Easing.bezier(0.16, 1, 0.3, 1);

export const IntroSequence = ({ title = 'EOTC Voice Studio' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = theme.timing.introDuration;

  if (frame > dur + 20) return null;

  // ── Phase 1: Black overlay lifts ──
  const bgFade = interpolate(frame, [0, 40], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // ── Phase 2: Title enters with cinematic snap ──
  const titleSpring = spring({
    frame: Math.max(0, frame - 20), fps,
    config: { damping: 12, stiffness: 180, mass: 0.35 },
    durationInFrames: 25,
  });
  const titleScale = interpolate(titleSpring, [0, 1], [0.7, 1.0]);
  const titleY = interpolate(titleSpring, [0, 1], [35, 0]);
  const titleOpacity = interpolate(frame, [20, 30], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const titleSpacing = interpolate(titleSpring, [0, 1], [18, 8]);
  const titleGlow = interpolate(frame, [25, 40, 55], [0, 1, 0.4], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── Phase 3: English fragments out ──
  const engFragmentProgress = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const engScale = interpolate(engFragmentProgress, [0, 0.5, 1], [1, 1.15, 0.6]);
  const engOpacity = interpolate(engFragmentProgress, [0, 0.6, 1], [1, 0.8, 0]);
  const engBlur = interpolate(engFragmentProgress, [0, 1], [0, 3]);
  const engSpacing = interpolate(engFragmentProgress, [0, 1], [8, 25]);

  // ── Phase 4: Amharic reconstructs ──
  const amhSpring = spring({
    frame: Math.max(0, frame - 58), fps,
    config: { damping: 14, stiffness: 140, mass: 0.4 },
    durationInFrames: 30,
  });
  const amhScale = interpolate(amhSpring, [0, 1], [0.5, 1.0]);
  const amhY = interpolate(amhSpring, [0, 1], [20, 0]);
  const amhOpacity = interpolate(frame, [58, 68], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Amharic characters enter staggered
  const amhText = '✦ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ✦';
  const amhChars = amhText.split('');

  // ── Divider line ──
  const divW = interpolate(frame, [30, 55], [0, 260], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_SNAP,
  });

  // ── Phase 5: Everything exits ──
  const exitProgress = interpolate(frame, [dur - 25, dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const fadeOut = 1 - exitProgress;
  const fadeScale = 1 + exitProgress * 0.04;

  return (
    <AbsoluteFill style={{
      zIndex: 20, justifyContent: 'center', alignItems: 'center',
      opacity: fadeOut, transform: `scale(${fadeScale})`,
    }}>
      {/* Black overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#000', opacity: bgFade, zIndex: 30,
      }} />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 28, zIndex: 31,
      }}>
        {/* Cross icon — path trace draw-on */}
        <GlowIcon iconName="cross" size={130} delay={5} />

        {/* English title — cinematic snap in, then fragments out */}
        <div style={{
          opacity: titleOpacity * engOpacity,
          transform: `translateY(${titleY}px) scale(${titleScale * engScale})`,
          fontSize: 36, fontFamily: theme.fonts.display, fontWeight: 300,
          color: theme.text.primary, letterSpacing: engSpacing,
          textTransform: 'uppercase',
          textShadow: `0 0 ${35 * titleGlow}px ${theme.gold.glow}, 0 2px 10px rgba(0,0,0,0.4)`,
          filter: engBlur > 0.1 ? `blur(${engBlur}px)` : 'none',
        }}>
          {title}
        </div>

        {/* Metallic gold divider */}
        <div style={{
          width: divW, height: 2,
          background: theme.gold.metallic,
          opacity: titleOpacity * 0.8,
          boxShadow: `0 0 12px ${theme.gold.glow}`,
        }} />

        {/* Amharic script — reconstructs with staggered characters */}
        <div style={{
          opacity: amhOpacity,
          transform: `translateY(${amhY}px) scale(${amhScale})`,
          fontSize: 22, fontFamily: theme.fonts.caption, fontWeight: 500,
          color: theme.gold.warm, letterSpacing: 3,
          textShadow: `0 0 16px ${theme.gold.glowSoft}`,
        }}>
          {amhChars.map((ch, ci) => {
            const charDelay = 58 + ci * 0.8;
            const charProgress = interpolate(frame, [charDelay, charDelay + 8], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
              easing: EASE_ENTER,
            });
            return (
              <span key={ci} style={{
                display: 'inline-block',
                opacity: charProgress,
                transform: `translateY(${(1 - charProgress) * 8}px) scale(${0.85 + charProgress * 0.15})`,
              }}>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
