import React from 'react';
import {Composition} from 'remotion';
import {FontCheck} from './FontCheck';
import {Master, Vertical, Square, MASTER_DURATION_IN_FRAMES} from './Video';
import {FPS, SCENE_IDS, defaultSceneFrames, totalDurationInFrames} from './lib/audioManifest';
import {S01, durationInFrames as d01} from './scenes/S01';
import {S02, durationInFrames as d02} from './scenes/S02';
import {S03, durationInFrames as d03} from './scenes/S03';
import {S04, durationInFrames as d04} from './scenes/S04';
import {S05, durationInFrames as d05} from './scenes/S05';
import {S06, durationInFrames as d06} from './scenes/S06';
import {S07, durationInFrames as d07} from './scenes/S07';
import {S08, durationInFrames as d08} from './scenes/S08';
import {S09, durationInFrames as d09} from './scenes/S09';
import {S10, durationInFrames as d10} from './scenes/S10';
import {S11, durationInFrames as d11} from './scenes/S11';
import {S12, durationInFrames as d12} from './scenes/S12';
import {S13, durationInFrames as d13} from './scenes/S13';

const SCENE_COMPONENTS = {
  S01,
  S02,
  S03,
  S04,
  S05,
  S06,
  S07,
  S08,
  S09,
  S10,
  S11,
  S12,
  S13,
} as const;

const SCENE_DURATION_EXPORTS: Record<(typeof SCENE_IDS)[number], number> = {
  S01: d01,
  S02: d02,
  S03: d03,
  S04: d04,
  S05: d05,
  S06: d06,
  S07: d07,
  S08: d08,
  S09: d09,
  S10: d10,
  S11: d11,
  S12: d12,
  S13: d13,
};

const frames = defaultSceneFrames();
for (const id of SCENE_IDS) {
  frames[id] = SCENE_DURATION_EXPORTS[id];
}

const totalFrames = totalDurationInFrames(frames) || MASTER_DURATION_IN_FRAMES;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Master"
        component={Master}
        durationInFrames={totalFrames}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Vertical"
        component={Vertical}
        durationInFrames={totalFrames}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="Square"
        component={Square}
        durationInFrames={totalFrames}
        fps={FPS}
        width={1080}
        height={1080}
      />
      <Composition
        id="FontCheck"
        component={FontCheck}
        durationInFrames={1}
        fps={FPS}
        width={1920}
        height={1080}
      />
      {SCENE_IDS.map((id) => {
        const Component = SCENE_COMPONENTS[id];
        return (
          <Composition
            key={id}
            id={id}
            component={Component}
            durationInFrames={frames[id]}
            fps={FPS}
            width={1920}
            height={1080}
          />
        );
      })}
    </>
  );
};
