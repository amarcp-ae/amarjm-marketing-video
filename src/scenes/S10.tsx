import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {brand} from '../brand';
import {GoldPlate} from '../components/GoldPlate';
import {KenBurnsMedia} from '../components/KenBurnsMedia';
import {LaptopFrame} from '../components/LaptopFrame';
import {SceneCaptions} from '../components/SceneCaptions';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S10';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S10: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const keyPress = spring({
    frame: frame - Math.round(1.1 * fps),
    fps,
    config: {damping: 12, stiffness: 180},
  });
  const keyY = interpolate(keyPress, [0, 1], [0, 8]);

  const fly = spring({
    frame: frame - Math.round(2 * fps),
    fps,
    config: {damping: 14, stiffness: 90},
  });
  const thumbX = interpolate(fly, [0, 1], [420, 0]);
  const thumbY = interpolate(fly, [0, 1], [-220, 0]);
  const thumbScale = interpolate(fly, [0, 1], [0.35, 1]);

  return (
    <AbsoluteFill>
      <GoldPlate />
      <AbsoluteFill
        style={{
          opacity: fade,
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: brand.fontFamily,
        }}
      >
        <LaptopFrame width={1100} height={700}>
          <KenBurnsMedia src={ASSETS.screens.S10.supportDialog} kind="image" />
        </LaptopFrame>

        <div
          style={{
            position: 'absolute',
            bottom: 120,
            left: 160,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          {['Alt', '0'].map((label, i) => (
            <div
              key={label}
              style={{
                minWidth: 64,
                height: 64,
                borderRadius: 10,
                backgroundColor: '#2a2a2a',
                border: `2px solid ${brand.colors.gold}`,
                color: brand.colors.ivory,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
                transform: `translateY(${i === 1 ? keyY : 0}px) scale(${i === 1 ? 1 - keyPress * 0.08 : 1})`,
                boxShadow: '0 8px 0 #111',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            right: 120,
            bottom: 140,
            width: 280,
            backgroundColor: brand.colors.ivory,
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            transform: `translate(${thumbX}px, ${thumbY}px) scale(${thumbScale})`,
            opacity: fly,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: brand.colors.ink,
              marginBottom: 10,
            }}
          >
            Support Ticket
          </div>
          <Img
            src={staticFile(ASSETS.screens.S10.supportDialog)}
            style={{width: '100%', height: 120, objectFit: 'cover', borderRadius: 6}}
          />
        </div>
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S10;
