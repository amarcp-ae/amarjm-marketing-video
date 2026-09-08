import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
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
import {Caption} from './components/Caption';
import {brand} from './brand';
import {ensureBrandFont} from './lib/loadFont';

const SCENE_DURATIONS = [d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13];

export const MASTER_DURATION_IN_FRAMES = SCENE_DURATIONS.reduce((a, b) => a + b, 0);

const SCENES = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13];

type VideoProps = {
  layout: 'master' | 'vertical' | 'square';
};

export const VideoComposition: React.FC<VideoProps> = ({layout}) => {
  ensureBrandFont();

  let from = 0;

  return (
    <AbsoluteFill style={{backgroundColor: brand.colors.ink}}>
      {SCENES.map((Scene, index) => {
        const duration = SCENE_DURATIONS[index];
        const start = from;
        from += duration;
        return (
          <Sequence key={Scene.name ?? index} from={start} durationInFrames={duration}>
            <Scene />
          </Sequence>
        );
      })}
      <Caption />
      {layout !== 'master' ? (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            border: `2px solid ${brand.colors.gold}22`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const Master: React.FC = () => <VideoComposition layout="master" />;
export const Vertical: React.FC = () => <VideoComposition layout="vertical" />;
export const Square: React.FC = () => <VideoComposition layout="square" />;
