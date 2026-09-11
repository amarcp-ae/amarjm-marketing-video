import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ComplianceBadges} from '../mockups/ComplianceBadges';
import {KycMock} from '../mockups/KycMock';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S09';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

/**
 * Five beats on VO clauses:
 * 1 VAT table · 2 flags/chips overlay · 3 Planet register→QR · 4 tax invoice · 5 KYC
 */
export const S09: React.FC = () => {
  ensureBrandFont();
  const {durationInFrames: dur, fps} = useVideoConfig();
  const seg = Math.max(1, Math.floor(dur / 5));

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'ضريبة', gold: true},
          {text: 'وفوترة'},
          {text: 'إلكترونية'},
          {text: 'في'},
          {text: 'ثلاث', gold: true},
          {text: 'دول'},
        ]}
      />
      <AbsoluteFill style={{paddingTop: 180}}>
        <Sequence from={0} durationInFrames={seg} layout="none">
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <DeviceStage
              src={ASSETS.screens.S09.vatReport}
              width={1480}
              height={760}
              tiltDeg={3}
              crop={{objectPosition: '50% 35%', scale: 1.5}}
              callout={{label: 'المربع ٣', x: 740, y: 360, delay: Math.round(0.35 * fps)}}
            />
          </AbsoluteFill>
        </Sequence>

        <Sequence from={seg} durationInFrames={seg} layout="none">
          <AbsoluteFill>
            <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', filter: 'blur(6px)'}}>
              <DeviceStage
                src={ASSETS.screens.S09.vatReport}
                width={1480}
                height={760}
                tiltDeg={3}
                crop={{objectPosition: '50% 35%', scale: 1.5}}
              />
            </AbsoluteFill>
            <ComplianceBadges />
          </AbsoluteFill>
        </Sequence>

        <Sequence from={seg * 2} durationInFrames={seg} layout="none">
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <Sequence from={0} durationInFrames={Math.floor(seg / 2)} layout="none">
              <DeviceStage
                src={ASSETS.screens.S09.planetRegister}
                width={1480}
                height={760}
                tiltDeg={3}
                crop={{objectPosition: '50% 45%', scale: 1.4}}
                callout={{label: 'بلانِت', x: 740, y: 300, delay: Math.round(0.25 * fps)}}
              />
            </Sequence>
            <Sequence from={Math.floor(seg / 2)} durationInFrames={seg - Math.floor(seg / 2)} layout="none">
              <DeviceStage
                src={ASSETS.screens.S09.planetSuccess}
                width={1480}
                height={760}
                tiltDeg={3}
                crop={{objectPosition: '50% 45%', scale: 1.4}}
                callout={{label: 'QR', x: 740, y: 340, delay: Math.round(0.2 * fps)}}
              />
            </Sequence>
          </AbsoluteFill>
        </Sequence>

        <Sequence from={seg * 3} durationInFrames={seg} layout="none">
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <DeviceStage
              src={ASSETS.screens.S09.taxInvoice}
              width={1280}
              height={780}
              tiltDeg={3}
              crop={{objectPosition: '50% 70%', scale: 1.35}}
              callout={{label: 'بطاقة الإعفاء', x: 420, y: 520, delay: Math.round(0.3 * fps)}}
            />
          </AbsoluteFill>
        </Sequence>

        <Sequence from={seg * 4} durationInFrames={dur - seg * 4} layout="none">
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <DeviceStage width={1480} height={760} tiltDeg={3} crop={{scale: 1}}>
              <KycMock />
            </DeviceStage>
          </AbsoluteFill>
        </Sequence>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S09;
