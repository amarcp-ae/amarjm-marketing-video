import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {HrCarousel} from '../mockups/HrCarousel';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S11';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S11: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {durationInFrames: dur, fps} = useVideoConfig();
  const seg = Math.max(1, Math.floor(dur / 4));
  const index = Math.min(3, Math.floor(frame / seg));

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'تطبيقٌ'},
          {text: 'كاملٌ', gold: true},
          {text: 'للموظّفين'},
        ]}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 180,
          gap: 48,
          flexDirection: 'row',
        }}
      >
        <DeviceStage
          key={index}
          variant="phone"
          width={720}
          height={980}
          tiltDeg={3}
          crop={{scale: 1}}
          callout={{
            label: ['حضور', 'مستندات', 'تقييم', 'رواتب'][index],
            x: 360,
            y: 200,
            delay: Math.round(0.35 * fps),
          }}
        >
          <HrCarousel index={index} />
        </DeviceStage>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S11;
