import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ObsidianPlate} from './ObsidianPlate';
import {SceneCaptions} from './SceneCaptions';

const TRANSITION_SEC = 0.35;
const PUSH_PX = 20;

type SceneShellProps = {
  sceneId: string;
  isFirst?: boolean;
  isLast?: boolean;
  children: React.ReactNode;
  showHairline?: boolean;
};

/**
 * Shared scene chrome: obsidian plate, captions, and 350ms / 20px push dissolve edges.
 */
export const SceneShell: React.FC<SceneShellProps> = ({
  sceneId,
  isFirst = false,
  isLast = false,
  children,
  showHairline = true,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = Math.round(TRANSITION_SEC * fps);

  const opacity = interpolate(
    frame,
    [0, t, Math.max(t + 1, durationInFrames - t), durationInFrames],
    [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const x = interpolate(
    frame,
    [0, t, Math.max(t + 1, durationInFrames - t), durationInFrames],
    [isFirst ? 0 : PUSH_PX, 0, 0, isLast ? 0 : -PUSH_PX],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill style={{opacity, transform: `translateX(${x}px)`}}>
      <ObsidianPlate showHairline={showHairline} />
      {children}
      <SceneCaptions sceneId={sceneId} />
    </AbsoluteFill>
  );
};

export const TRANSITION_FRAMES = Math.round(TRANSITION_SEC * 30);
