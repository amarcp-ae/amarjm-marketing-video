import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S05';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S05: React.FC = () => {
  return <ScenePlaceholder sceneNumber={5} />;
};

export default S05;
