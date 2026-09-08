import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S12';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S12: React.FC = () => {
  return <ScenePlaceholder sceneNumber={12} />;
};

export default S12;
