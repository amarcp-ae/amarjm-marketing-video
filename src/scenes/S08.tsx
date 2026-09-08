import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S08';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S08: React.FC = () => {
  return <ScenePlaceholder sceneNumber={8} />;
};

export default S08;
