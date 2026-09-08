import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S02';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S02: React.FC = () => {
  return <ScenePlaceholder sceneNumber={2} />;
};

export default S02;
