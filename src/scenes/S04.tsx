import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S04';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const NODES = [
  {id: 'UAE', x: 150, y: 100, label: 'UAE'},
  {id: 'OMN', x: 290, y: 190, label: 'OMN'},
  {id: 'KSA', x: 90, y: 210, label: 'KSA'},
  {id: 'BHR', x: 220, y: 70, label: 'BHR'},
];

export const S04: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lineProgress = interpolate(frame, [18, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'عدّة', gold: true},
          {text: 'دول،'},
          {text: 'تقريرٌ'},
          {text: 'واحد', gold: true},
        ]}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 36}}>
        <DeviceStage
          src={ASSETS.screens.S04.jewelleryGrossProfit}
          width={1480}
          height={760}
          tiltDeg={3}
          crop={{objectPosition: '48% 42%', scale: 1.55}}
          callout={{label: 'التقرير', x: 620, y: 300, delay: Math.round(0.9 * fps)}}
        />
        <svg
          width={360}
          height={280}
          style={{position: 'absolute', right: 48, bottom: 100, opacity: 0.95}}
        >
          <line
            x1={NODES[0].x}
            y1={NODES[0].y}
            x2={NODES[1].x}
            y2={NODES[1].y}
            stroke={brand.colors.gold}
            strokeWidth={2}
            strokeDasharray={`${lineProgress * 220} 220`}
          />
          <line
            x1={NODES[0].x}
            y1={NODES[0].y}
            x2={NODES[2].x}
            y2={NODES[2].y}
            stroke={brand.colors.gold}
            strokeWidth={2}
            strokeDasharray={`${lineProgress * 200} 200`}
          />
          <line
            x1={NODES[0].x}
            y1={NODES[0].y}
            x2={NODES[3].x}
            y2={NODES[3].y}
            stroke={brand.colors.gold}
            strokeWidth={2}
            strokeDasharray={`${lineProgress * 160} 160`}
          />
          {NODES.map((n, i) => {
            const pulse = 1 + Math.sin(frame / 11 + i) * 0.18;
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={9 * pulse} fill={brand.colors.gold} opacity={0.95} />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={16 * pulse}
                  fill="none"
                  stroke={brand.colors.gold}
                  strokeWidth={1}
                  opacity={0.35}
                />
                <text
                  x={n.x}
                  y={n.y + 28}
                  textAnchor="middle"
                  fill={brand.colors.ivory}
                  fontSize={15}
                  fontFamily={brand.fontFamily}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S04;
