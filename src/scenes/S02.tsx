import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {FloatingItems} from '../components/FloatingItems';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
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
        tokens={[
          {text: 'سعرٌ'},
          {text: 'حيّ', gold: true},
          {text: '،'},
          {text: 'لحظةً'},
          {text: 'بلحظة'},
        ]}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 40}}>
        <DeviceStage
          src={ASSETS.video.S02MetalRate}
          kind="video"
          width={1240}
          height={760}
          tiltDeg={7}
          crop={{objectPosition: '52% 35%', scale: 1.45}}
          callout={{label: 'سعر حيّ', x: 640, y: 280, delay: Math.round(1.2 * fps)}}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 120,
            left: 120,
            color: brand.colors.gold,
            fontFamily: brand.fontFamily,
            fontVariantNumeric: 'tabular-nums',
            fontSize: 48,
            fontWeight: 700,
            textShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {price.toFixed(2)}
          <span style={{fontSize: 20, marginLeft: 10, color: brand.colors.ivory}}>AED/g</span>
        </div>
      </AbsoluteFill>
      <FloatingItems
        items={[
          ASSETS.items.goldBangle22k,
          ASSETS.items.diamondSolitaireRing,
          ASSETS.items.goldCoinPendant22k,
        ]}
        side="left"
      />
    </SceneShell>
  );
};

export default S02;
