import React from 'react';
import {ScenePlaceholder} from '../components/ScenePlaceholder';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S13';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S13: React.FC = () => {
  return <ScenePlaceholder sceneNumber={13} />;
};

export default S13;
