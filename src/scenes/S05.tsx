import React from 'react';
import {AbsoluteFill} from 'remotion';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {MapReservation} from '../mockups/MapReservation';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S05';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S05: React.FC = () => {
  ensureBrandFont();
  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'قطعةٌ'},
          {text: 'في'},
          {text: 'دبي', gold: true},
          {text: 'بيعٌ'},
          {text: 'في'},
          {text: 'مسقط', gold: true},
        ]}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 48,
          paddingTop: Math.round(1080 * 0.2),
        }}
      >
        <MapReservation />
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S05;
