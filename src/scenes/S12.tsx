import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {GoldPlate} from '../components/GoldPlate';
import {KenBurnsMedia} from '../components/KenBurnsMedia';
import {LaptopFrame} from '../components/LaptopFrame';
import {SceneCaptions} from '../components/SceneCaptions';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S12';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const PROMPT = 'أغلق وردية دبي وأرسل التقرير';

export const S12: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const typeStart = Math.round(0.8 * fps);
  const charsShown = Math.min(
    PROMPT.length,
    Math.max(0, Math.floor((frame - typeStart) / 2)),
  );
  const typed = PROMPT.slice(0, charsShown);

  const pulse = 1 + Math.sin(frame / 6) * 0.18;
  const check = spring({
    frame: frame - (typeStart + PROMPT.length * 2 + 8),
    fps,
    config: {damping: 12, stiffness: 160},
  });
  const reportIn = spring({
    frame: frame - (typeStart + PROMPT.length * 2 + 20),
    fps,
    config: {damping: 14, stiffness: 100},
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
        }}
      >
        <LaptopFrame width={1100} height={700}>
          <KenBurnsMedia src={ASSETS.screens.S12.home} kind="image" />
        </LaptopFrame>

        <div
          style={{
            position: 'absolute',
            left: 120,
            bottom: 160,
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: brand.colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {[1, 2, 3].map((ring) => (
            <div
              key={ring}
              style={{
                position: 'absolute',
                inset: -ring * 14 * pulse,
                borderRadius: '50%',
                border: `2px solid ${brand.colors.gold}`,
                opacity: Math.max(0, 0.55 - ring * 0.15),
              }}
            />
          ))}
          <div style={{color: brand.colors.ivory, fontSize: 28}}>🎤</div>
        </div>

        <div
          dir="rtl"
          lang="ar"
          style={{
            position: 'absolute',
            bottom: 170,
            left: 220,
            minWidth: 520,
            backgroundColor: 'rgba(247,243,235,0.92)',
            color: brand.colors.ink,
            borderRadius: 999,
            padding: '14px 24px',
            fontSize: 28,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span>{typed}</span>
          <span
            style={{
              opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
              color: brand.colors.gold,
            }}
          >
            |
          </span>
          <span
            style={{
              marginRight: 'auto',
              transform: `scale(${check})`,
              opacity: check,
              color: '#2e7d32',
              fontWeight: 700,
              fontSize: 32,
            }}
          >
            ✓
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 100,
            top: 140,
            width: 320,
            transform: `translateY(${interpolate(reportIn, [0, 1], [40, 0])}px) scale(${reportIn})`,
            opacity: reportIn,
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            border: `2px solid ${brand.colors.gold}`,
          }}
        >
          <Img
            src={staticFile(ASSETS.screens.S04.jewelleryGrossProfit)}
            style={{width: '100%', height: 200, objectFit: 'cover'}}
          />
        </div>
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S12;
