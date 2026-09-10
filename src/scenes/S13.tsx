import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {GoldPlate} from '../components/GoldPlate';
import {SceneCaptions} from '../components/SceneCaptions';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S13';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S13: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps, durationInFrames: dur} = useVideoConfig();

  const settle = spring({
    frame,
    fps,
    config: {damping: 14, stiffness: 80},
  });
  const scale = interpolate(settle, [0, 1], [0.86, 1]);
  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const lineOpacity = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const urlOpacity = interpolate(frame, [36, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const qrOpacity = interpolate(frame, [48, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const endSettle = interpolate(frame, [dur - 30, dur - 1], [1, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <GoldPlate />
      <AbsoluteFill
        style={{
          opacity: fade,
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: brand.fontFamily,
          transform: `scale(${scale * endSettle})`,
        }}
      >
        <div
          style={{
            fontSize: 108,
            fontWeight: 700,
            letterSpacing: '0.04em',
            backgroundImage: `linear-gradient(120deg, ${brand.colors.gold} 0%, #f0e0a0 45%, ${brand.colors.gold} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          AMARSoft
        </div>

        <div
          dir="rtl"
          lang="ar"
          style={{
            marginTop: 28,
            fontSize: 40,
            fontWeight: 600,
            color: brand.colors.ivory,
            opacity: lineOpacity,
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          13 عامًا من الخبرة في نظامٍ واحد
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: brand.colors.gold,
            opacity: urlOpacity,
            fontWeight: 500,
          }}
        >
          amarcp.ae
        </div>

        <div
          style={{
            marginTop: 40,
            opacity: qrOpacity,
            width: 160,
            height: 160,
            borderRadius: 18,
            backgroundColor: brand.colors.ivory,
            border: `3px solid ${brand.colors.gold}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: brand.colors.ink,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: '0.08em',
          }}
        >
          QR
        </div>
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S13;
