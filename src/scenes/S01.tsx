import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S01';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S01: React.FC = () => {
  return <ScenePlaceholder sceneNumber={1} />;
};

export default S01;
