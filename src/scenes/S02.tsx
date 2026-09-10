import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {CategoryTiles} from '../mockups/CategoryTiles';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S02';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S02: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {durationInFrames: dur, fps} = useVideoConfig();
  const price = interpolate(frame, [0, Math.max(1, dur - 1)], [235.4, 241.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        debug
        tokens={[
          {text: 'سعرٌ'},
          {text: 'حيّ', gold: true},
          {text: 'لحظةً'},
          {text: 'بلحظة'},
        ]}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 40,
          paddingTop: Math.round(1080 * 0.2),
        }}
      >
        <DeviceStage
          src={ASSETS.video.S02MetalRate}
          kind="video"
          width={1480}
          height={760}
          tiltDeg={3}
          crop={{objectPosition: '50% 32%', scale: 1.55}}
          callout={{label: 'سعر حيّ', x: 740, y: 260, delay: Math.round(1.1 * fps)}}
        />
        <div
          style={{
            position: 'absolute',
            top: 230,
            left: 80,
            color: brand.colors.gold,
            fontFamily: brand.fontFamily,
            fontVariantNumeric: 'tabular-nums',
            fontSize: 52,
            fontWeight: 700,
            textShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 20,
          }}
        >
          {price.toFixed(2)}
          <span style={{fontSize: 22, marginLeft: 10, color: brand.colors.ivory}}>AED/g</span>
        </div>
        <CategoryTiles delay={Math.round(0.45 * dur)} />
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S02;
