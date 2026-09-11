import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {Callout} from '../components/Callout';
import {GoldPlate} from '../components/GoldPlate';
import {KenBurnsMedia} from '../components/KenBurnsMedia';
import {LaptopFrame} from '../components/LaptopFrame';
import {SceneCaptions} from '../components/SceneCaptions';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S04';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const NODES = [
  {id: 'UAE', x: 120, y: 90, label: 'UAE'},
  {id: 'OMN', x: 260, y: 180, label: 'OMN'},
  {id: 'KSA', x: 80, y: 200, label: 'KSA'},
];

export const S04: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lineProgress = interpolate(frame, [20, 80], [0, 1], {
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
        }}
      >
        <div style={{position: 'relative'}}>
          <LaptopFrame width={1080} height={690}>
            <KenBurnsMedia src={ASSETS.screens.S04.jewelleryGrossProfit} kind="image" />
          </LaptopFrame>
          <Callout label="الشركة" x={280} y={200} ringSize={70} delay={Math.round(0.8 * fps)} />
        </div>

        <div
          style={{
            position: 'absolute',
            right: 64,
            top: 120,
            width: 360,
            height: 300,
            backgroundColor: 'rgba(26,26,26,0.72)',
            border: `1px solid ${brand.colors.gold}88`,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <svg width={328} height={268} viewBox="0 0 328 268">
            <line
              x1={NODES[0].x}
              y1={NODES[0].y}
              x2={NODES[1].x}
              y2={NODES[1].y}
              stroke={brand.colors.gold}
              strokeWidth={2}
              strokeDasharray={`${lineProgress * 200} 200`}
              opacity={0.9}
            />
            <line
              x1={NODES[0].x}
              y1={NODES[0].y}
              x2={NODES[2].x}
              y2={NODES[2].y}
              stroke={brand.colors.gold}
              strokeWidth={2}
              strokeDasharray={`${lineProgress * 180} 180`}
              opacity={0.9}
            />
            <line
              x1={NODES[1].x}
              y1={NODES[1].y}
              x2={NODES[2].x}
              y2={NODES[2].y}
              stroke={brand.colors.gold}
              strokeWidth={2}
              strokeDasharray={`${lineProgress * 160} 160`}
              opacity={0.85}
            />
            {NODES.map((n, i) => {
              const pulse = 1 + Math.sin(frame / 12 + i) * 0.12;
              return (
                <g key={n.id}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={10 * pulse}
                    fill={brand.colors.gold}
                    opacity={0.95}
                  />
                  <text
                    x={n.x}
                    y={n.y + 28}
                    textAnchor="middle"
                    fill={brand.colors.ivory}
                    fontSize={16}
                    fontFamily={brand.fontFamily}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S04;
