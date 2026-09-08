import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S09';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S09: React.FC = () => {
  return <ScenePlaceholder sceneNumber={9} />;
};

export default S09;
