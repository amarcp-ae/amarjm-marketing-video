import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {GoldPlate} from '../components/GoldPlate';
import {KenBurnsMedia} from '../components/KenBurnsMedia';
import {LaptopFrame} from '../components/LaptopFrame';
import {SceneCaptions} from '../components/SceneCaptions';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S05';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S05: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const arrowProgress = interpolate(frame, [18, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const totalSeconds = 24 * 60;
  const elapsed = Math.min(totalSeconds, Math.floor((frame / fps) * 8));
  const remaining = Math.max(0, totalSeconds - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const cardOpacity = interpolate(frame, [30, 42], [0, 1], {
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
          flexDirection: 'row',
          gap: 36,
          fontFamily: brand.fontFamily,
        }}
      >
        <LaptopFrame width={720} height={480}>
          <KenBurnsMedia src={ASSETS.screens.S05.itemMetal} kind="image" />
        </LaptopFrame>
        <LaptopFrame width={720} height={480}>
          <KenBurnsMedia src={ASSETS.screens.S05.stockBalance} kind="image" />
        </LaptopFrame>

        <svg
          width={280}
          height={80}
          style={{
            position: 'absolute',
            top: '46%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <defs>
            <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={brand.colors.gold} />
            </marker>
          </defs>
          <line
            x1={20}
            y1={40}
            x2={20 + arrowProgress * 220}
            y2={40}
            stroke={brand.colors.gold}
            strokeWidth={4}
            markerEnd="url(#arrowHead)"
          />
          <text x={40} y={28} fill={brand.colors.ivory} fontSize={18} fontFamily={brand.fontFamily}>
            Dubai → Muscat
          </text>
        </svg>

        <div
          dir="rtl"
          lang="ar"
          style={{
            position: 'absolute',
            bottom: 140,
            opacity: cardOpacity,
            backgroundColor: brand.colors.ivory,
            color: brand.colors.ink,
            border: `2px solid ${brand.colors.accent}`,
            borderRadius: 12,
            padding: '16px 28px',
            fontSize: 28,
            fontWeight: 600,
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
          }}
        >
          محجوزة — {mm}:{ss}
        </div>
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S05;
