import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {brand} from '../brand';
import {GoldPlate} from '../components/GoldPlate';
import {SceneCaptions} from '../components/SceneCaptions';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S09';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const PANELS = [
  ASSETS.screens.S09.vatReport,
  ASSETS.screens.S09.taxFreeTransaction,
  ASSETS.screens.S09.customerKyc,
];

export const S09: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {durationInFrames: dur} = useVideoConfig();

  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateX = interpolate(frame, [0, Math.max(1, dur - 1)], [0, -1920 * 2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const chipOpacity = interpolate(frame, [40, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <GoldPlate />
      <AbsoluteFill style={{opacity: fade, overflow: 'hidden', fontFamily: brand.fontFamily}}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: 1920 * 3,
            height: '100%',
            transform: `translateX(${translateX}px)`,
          }}
        >
          {PANELS.map((src) => (
            <div
              key={src}
              style={{
                width: 1920,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 48,
                boxSizing: 'border-box',
              }}
            >
              <Img
                src={staticFile(src)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 8,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
                }}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 64,
            left: 64,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <span style={{fontSize: 36}}>🇦🇪</span>
          <span style={{fontSize: 36}}>🇸🇦</span>
          <span
            style={{
              opacity: chipOpacity,
              backgroundColor: brand.colors.ink,
              color: brand.colors.gold,
              border: `1px solid ${brand.colors.gold}`,
              borderRadius: 999,
              padding: '8px 18px',
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Planet
          </span>
        </div>
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S09;
