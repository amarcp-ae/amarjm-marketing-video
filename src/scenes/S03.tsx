import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S03';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S03: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const leftIn = spring({frame: frame - 8, fps, config: {damping: 16, stiffness: 90}});
  const rightIn = spring({frame: frame - 16, fps, config: {damping: 16, stiffness: 90}});

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'حساباتك'},
          {text: 'من'},
          {text: 'جوّالك', gold: true},
        ]}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 72,
          paddingTop: 48,
        }}
      >
        <div style={{transform: `translateX(${interpolate(leftIn, [0, 1], [-80, 0])}px)`}}>
          <DeviceStage
            src={ASSETS.screens.S03.salesInvoice}
            variant="phone"
            width={400}
            tiltDeg={3}
            crop={{objectPosition: '50% 30%', scale: 1.15}}
            enterDelay={6}
          />
        </div>
        <div style={{transform: `translateX(${interpolate(rightIn, [0, 1], [80, 0])}px)`}}>
          <DeviceStage
            src={ASSETS.screens.S03.paymentEntry}
            variant="phone"
            width={400}
            tiltDeg={3}
            crop={{objectPosition: '50% 55%', scale: 1.15}}
            enterDelay={12}
            callout={{label: 'حفظ', x: 200, y: 620, delay: Math.round(1.1 * fps)}}
          />
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S03;
