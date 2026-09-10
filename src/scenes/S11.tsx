import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S11';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S11: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const leftIn = spring({frame: frame - 4, fps, config: {damping: 16, stiffness: 100}});
  const rightIn = spring({frame: frame - 12, fps, config: {damping: 16, stiffness: 100}});
  const bounce = spring({
    frame: frame - Math.round(1.4 * fps),
    fps,
    config: {damping: 8, stiffness: 160},
  });

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'فريقك'},
          {text: 'على'},
          {text: 'الهاتف', gold: true},
        ]}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 64,
          paddingTop: 48,
        }}
      >
        <div style={{transform: `translateX(${interpolate(leftIn, [0, 1], [-60, 0])}px)`}}>
          <DeviceStage
            src={ASSETS.screens.S03.salesInvoice}
            variant="phone"
            width={340}
            height={680}
            tiltDeg={8}
            crop={{objectPosition: '50% 25%', scale: 1.2}}
            enterDelay={6}
            callout={{label: 'HR', x: 170, y: 120, delay: Math.round(0.8 * fps)}}
          />
        </div>
        <div style={{transform: `translateX(${interpolate(rightIn, [0, 1], [60, 0])}px)`}}>
          <DeviceStage
            src={ASSETS.screens.S03.paymentEntry}
            variant="phone"
            width={340}
            height={680}
            tiltDeg={6}
            crop={{objectPosition: '50% 40%', scale: 1.2}}
            enterDelay={12}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 110,
            transform: `translateY(${interpolate(bounce, [0, 1], [-50, 0])}px) scale(${bounce})`,
            opacity: bounce,
            padding: '14px 22px',
            border: `1.5px solid ${brand.colors.gold}`,
            color: brand.colors.gold,
            fontFamily: brand.fontFamily,
            fontWeight: 700,
            fontSize: 28,
            background: 'rgba(14,14,18,0.75)',
          }}
        >
          .SIF · WPS
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S11;
