import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ComplianceBadges} from '../mockups/ComplianceBadges';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S09';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const PANELS = [
  {
    src: ASSETS.screens.S09.vatReport,
    crop: {objectPosition: '50% 35%', scale: 1.55},
    label: 'ضريبة',
  },
  {
    src: ASSETS.screens.S09.taxFreeTransaction,
    crop: {objectPosition: '50% 45%', scale: 1.5},
    label: 'بلانِت',
  },
  {
    src: ASSETS.screens.S09.customerKyc,
    crop: {objectPosition: '55% 40%', scale: 1.55},
    label: 'اعرف عميلك',
  },
] as const;

export const S09: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {durationInFrames: dur, fps} = useVideoConfig();
  const intro = Math.round(2.2 * fps);
  const seg = Math.max(1, Math.floor((dur - intro) / 3));
  const idx =
    frame < intro ? -1 : Math.min(PANELS.length - 1, Math.floor((frame - intro) / seg));

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
      <AbsoluteFill style={{paddingTop: 200}}>
        <ComplianceBadges />
        {idx >= 0 ? (
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 40}}>
            <DeviceStage
              src={PANELS[idx].src}
              width={1480}
              height={760}
              tiltDeg={3}
              crop={PANELS[idx].crop}
              callout={{
                label: PANELS[idx].label,
                x: 740,
                y: 300,
                delay: Math.round(0.35 * fps),
              }}
            />
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S09;
