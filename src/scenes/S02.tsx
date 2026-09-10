import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {GoldPlate} from '../components/GoldPlate';
import {KenBurnsMedia} from '../components/KenBurnsMedia';
import {LaptopFrame} from '../components/LaptopFrame';
import {SceneCaptions} from '../components/SceneCaptions';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S02';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const ITEMS = [
  ASSETS.items.goldBangle22k,
  ASSETS.items.diamondSolitaireRing,
  ASSETS.items.goldCoinPendant22k,
];

export const S02: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {durationInFrames: dur} = useVideoConfig();

  const price = interpolate(frame, [0, Math.max(1, dur - 1)], [235, 241.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <GoldPlate />
      <AbsoluteFill
        style={{
          opacity: fadeIn,
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: brand.fontFamily,
        }}
      >
        <LaptopFrame width={1100} height={700}>
          <KenBurnsMedia src={ASSETS.video.S02MetalRate} kind="video" />
        </LaptopFrame>

        <div
          style={{
            position: 'absolute',
            top: 72,
            right: 96,
            backgroundColor: 'rgba(26,26,26,0.82)',
            border: `1px solid ${brand.colors.gold}`,
            borderRadius: 10,
            padding: '14px 22px',
            color: brand.colors.gold,
            minWidth: 220,
            textAlign: 'left',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <div style={{fontSize: 16, color: brand.colors.ivory, opacity: 0.8, marginBottom: 4}}>
            Gold / 24K
          </div>
          <div style={{fontSize: 40, fontWeight: 700}}>
            {price.toFixed(2)}
            <span style={{fontSize: 18, marginLeft: 8, color: brand.colors.ivory}}>AED/g</span>
          </div>
        </div>

        {ITEMS.map((item, i) => {
          const drift = Math.sin(frame / 28 + i * 1.7) * 18;
          const x = 80 + i * 70;
          const y = 620 + i * 40 + drift;
          const opacity = interpolate(frame, [20 + i * 10, 32 + i * 10], [0, 0.95], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <Img
              key={item}
              src={staticFile(item)}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 140,
                height: 140,
                objectFit: 'contain',
                opacity,
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.45))',
                transform: `translateY(${drift}px) rotate(${(i - 1) * 8}deg)`,
              }}
            />
          );
        })}
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S02;
