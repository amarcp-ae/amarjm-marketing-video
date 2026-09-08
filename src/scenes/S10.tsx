import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S10';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S10: React.FC = () => {
  return <ScenePlaceholder sceneNumber={10} />;
};

export default S10;
