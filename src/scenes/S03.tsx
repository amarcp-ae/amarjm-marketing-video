import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S03';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S03: React.FC = () => {
  return <ScenePlaceholder sceneNumber={3} />;
};

export default S03;
