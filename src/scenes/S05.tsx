import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S05';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S05: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const arrow = interpolate(frame, [16, 64], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'قطعة'},
          {text: 'في'},
          {text: 'دبي', gold: true},
          {text: '،'},
          {text: 'بيعٌ'},
          {text: 'في'},
          {text: 'مسقط', gold: true},
        ]}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 28,
          paddingTop: 40,
        }}
      >
        <DeviceStage
          src={ASSETS.screens.S05.itemMetal}
          width={760}
          height={520}
          tiltDeg={8}
          crop={{objectPosition: '45% 35%', scale: 1.4}}
          enterDelay={8}
        />
        <DeviceStage
          src={ASSETS.screens.S05.stockBalance}
          width={760}
          height={520}
          tiltDeg={6}
          crop={{objectPosition: '55% 40%', scale: 1.35}}
          enterDelay={14}
          callout={{label: 'المخزون', x: 380, y: 220, delay: Math.round(1.2 * fps)}}
        />
        <svg
          width={240}
          height={70}
          style={{position: 'absolute', top: '48%', left: '50%', transform: 'translate(-50%,-50%)'}}
        >
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={brand.colors.gold} />
            </marker>
          </defs>
          <line
            x1={10}
            y1={40}
            x2={10 + arrow * 200}
            y2={40}
            stroke={brand.colors.gold}
            strokeWidth={3}
            markerEnd="url(#arr)"
          />
          <text x={40} y={24} fill={brand.colors.ivory} fontSize={16} fontFamily={brand.fontFamily}>
            Dubai → Muscat
          </text>
        </svg>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S05;
