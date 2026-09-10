import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ShopMock} from '../mockups/ShopMock';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S06';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S06: React.FC = () => {
  ensureBrandFont();
  const {durationInFrames: dur, fps} = useVideoConfig();
  const half = Math.floor(dur / 2);

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'متجرٌ'},
          {text: 'تداولٌ', gold: true},
          {text: 'محفظةُ'},
          {text: 'وولاء'},
        ]}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: Math.round(1080 * 0.18),
        }}
      >
        <Sequence from={0} durationInFrames={half} layout="none">
          <DeviceStage width={1480} height={780} tiltDeg={3} crop={{scale: 1}}>
            <ShopMock variant="shop-01" />
          </DeviceStage>
        </Sequence>
        <Sequence from={half} durationInFrames={dur - half} layout="none">
          <div style={{display: 'flex', gap: 28, alignItems: 'center'}}>
            <DeviceStage width={1180} height={700} tiltDeg={3} crop={{scale: 1}}>
              <ShopMock variant="shop-02" />
            </DeviceStage>
            <DeviceStage
              variant="phone"
              width={480}
              height={860}
              tiltDeg={3}
              crop={{scale: 1}}
              callout={{label: 'ولاء', x: 240, y: 280, delay: Math.round(0.5 * fps)}}
            >
              <ShopMock variant="shop-03" />
            </DeviceStage>
          </div>
        </Sequence>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S06;
