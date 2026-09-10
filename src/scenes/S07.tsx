import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {RfidHandheld} from '../mockups/RfidHandheld';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S07';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S07: React.FC = () => {
  ensureBrandFont();
  const {durationInFrames: dur, fps} = useVideoConfig();
  const seg = Math.max(1, Math.floor(dur / 3));

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'امسح', gold: true},
          {text: 'أضف'},
          {text: 'اقبض'},
          {text: 'اطبع'},
        ]}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 200}}>
        <Sequence from={0} durationInFrames={seg} layout="none">
          <DeviceStage
            src={ASSETS.video.S07PosScan}
            kind="video"
            width={1480}
            height={760}
            tiltDeg={3}
            crop={{objectPosition: '50% 45%', scale: 1.5}}
            callout={{label: 'امسح', x: 740, y: 320, delay: Math.round(0.6 * fps)}}
          />
        </Sequence>
        <Sequence from={seg} durationInFrames={seg} layout="none">
          <DeviceStage
            src={ASSETS.screens.S07.posPaymentDialog}
            width={1480}
            height={760}
            tiltDeg={3}
            crop={{objectPosition: '50% 55%', scale: 1.55}}
            callout={{label: 'اقبض', x: 700, y: 480, delay: Math.round(0.4 * fps)}}
          />
        </Sequence>
        <Sequence from={seg * 2} durationInFrames={Math.floor((dur - seg * 2) / 2)} layout="none">
          <DeviceStage width={1480} height={760} tiltDeg={3} crop={{scale: 1}}>
            <RfidHandheld phase={1} />
          </DeviceStage>
        </Sequence>
        <Sequence
          from={seg * 2 + Math.floor((dur - seg * 2) / 2)}
          durationInFrames={dur - seg * 2 - Math.floor((dur - seg * 2) / 2)}
          layout="none"
        >
          <DeviceStage width={1480} height={760} tiltDeg={3} crop={{scale: 1}}>
            <RfidHandheld phase={2} />
          </DeviceStage>
        </Sequence>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S07;
