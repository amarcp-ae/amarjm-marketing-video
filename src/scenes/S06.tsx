import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S06';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S06: React.FC = () => {
  return <ScenePlaceholder sceneNumber={6} />;
};

export default S06;
