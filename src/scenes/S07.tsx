import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S07';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S07: React.FC = () => {
  return <ScenePlaceholder sceneNumber={7} />;
};

export default S07;
