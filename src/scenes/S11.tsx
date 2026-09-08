import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S11';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S11: React.FC = () => {
  return <ScenePlaceholder sceneNumber={11} />;
};

export default S11;
