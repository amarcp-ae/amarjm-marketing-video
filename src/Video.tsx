import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
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
import {brand} from './brand';
import {ensureBrandFont} from './lib/loadFont';
import {LayoutProvider, type LayoutMode} from './lib/layout';
import {FPS, SCENE_IDS, type SceneId} from './lib/audioManifest';

const SCENE_DURATIONS = [d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13];

export const MASTER_DURATION_IN_FRAMES = SCENE_DURATIONS.reduce((a, b) => a + b, 0);

const SCENES = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13];

const SCENE_STARTS: number[] = (() => {
  const starts: number[] = [];
  let cursor = 0;
  for (const d of SCENE_DURATIONS) {
    starts.push(cursor);
    cursor += d;
  }
  return starts;
})();

const startsById: Record<SceneId, number> = SCENE_IDS.reduce(
  (acc, id, i) => {
    acc[id] = SCENE_STARTS[i];
    return acc;
  },
  {} as Record<SceneId, number>,
);

/** −26 dB under VO; −16 dB only in S01 first 6s and S13 last 6s */
const VOL_UNDER_VO = Math.pow(10, -26 / 20);
const VOL_OPEN = Math.pow(10, -16 / 20);
const VOL_SFX = Math.pow(10, -10 / 20);
const SIDECHAIN_FRAMES = Math.round(0.6 * FPS);
const OPEN_FRAMES = Math.round(6 * FPS);

const MusicBed: React.FC = () => {
  const frame = useCurrentFrame();
  const volume = useMemo(() => {
    const inOpenHead = frame < OPEN_FRAMES;
    const inOpenTail = frame >= MASTER_DURATION_IN_FRAMES - OPEN_FRAMES;
    let base = inOpenHead || inOpenTail ? VOL_OPEN : VOL_UNDER_VO;

    // Soft ramp out of the S01 open window into under-VO
    if (!inOpenHead && frame < OPEN_FRAMES + SIDECHAIN_FRAMES) {
      base = interpolate(
        frame,
        [OPEN_FRAMES, OPEN_FRAMES + SIDECHAIN_FRAMES],
        [VOL_OPEN, VOL_UNDER_VO],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      );
    }
    // Soft ramp into the S13 open window
    const tailStart = MASTER_DURATION_IN_FRAMES - OPEN_FRAMES;
    if (!inOpenTail && frame > tailStart - SIDECHAIN_FRAMES && frame < tailStart) {
      base = interpolate(
        frame,
        [tailStart - SIDECHAIN_FRAMES, tailStart],
        [VOL_UNDER_VO, VOL_OPEN],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      );
    }

    // 600ms side-chain duck on every VO onset (scene start)
    let sidechain = 1;
    for (const onset of SCENE_STARTS) {
      const t = frame - onset;
      if (t >= 0 && t < SIDECHAIN_FRAMES) {
        const env = Math.sin((t / SIDECHAIN_FRAMES) * Math.PI); // 0→1→0
        sidechain = Math.min(sidechain, 1 - 0.35 * env);
      }
    }

    // Keep the open windows audible — lighten sidechain there
    if (inOpenHead || inOpenTail) {
      sidechain = 1 - (1 - sidechain) * 0.25;
    }

    return base * sidechain;
  }, [frame]);

  return <Audio src={staticFile('audio/music/bed-v2.mp3')} volume={volume} loop />;
};

type VideoProps = {
  layout: LayoutMode;
};

export const VideoComposition: React.FC<VideoProps> = ({layout}) => {
  ensureBrandFont();

  const scale = layout === 'vertical' ? 0.92 : layout === 'square' ? 0.88 : 1;
  const cropStyle: React.CSSProperties =
    layout === 'vertical' || layout === 'square'
      ? {
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }
      : {};

  return (
    <LayoutProvider layout={layout}>
      <AbsoluteFill style={{backgroundColor: brand.colors.ink}}>
        <AbsoluteFill style={cropStyle}>
          {SCENES.map((Scene, index) => {
            const duration = SCENE_DURATIONS[index];
            const start = SCENE_STARTS[index];
            const sceneId = SCENE_IDS[index];
            return (
              <Sequence key={sceneId} from={start} durationInFrames={duration}>
                <Scene />
                <Audio src={staticFile(`audio/vo/${sceneId}.mp3`)} volume={1} />
              </Sequence>
            );
          })}
        </AbsoluteFill>

        <MusicBed />

        {/* SFX at −10 dB */}
        <Sequence from={startsById.S07 + Math.round(2.2 * FPS)} durationInFrames={45}>
          <Audio src={staticFile('audio/sfx/barcode-beep.mp3')} volume={VOL_SFX} />
        </Sequence>
        <Sequence from={startsById.S07 + Math.round(7.5 * FPS)} durationInFrames={60}>
          <Audio src={staticFile('audio/sfx/ui-whoosh.mp3')} volume={VOL_SFX} />
        </Sequence>
        <Sequence from={startsById.S07 + Math.round(10.5 * FPS)} durationInFrames={60}>
          <Audio src={staticFile('audio/sfx/rfid-chirp.mp3')} volume={VOL_SFX} />
        </Sequence>
        <Sequence from={startsById.S03 + Math.round(4 * FPS)} durationInFrames={45}>
          <Audio src={staticFile('audio/sfx/ui-whoosh.mp3')} volume={VOL_SFX} />
        </Sequence>
        <Sequence from={startsById.S08 + Math.round(6 * FPS)} durationInFrames={60}>
          <Audio src={staticFile('audio/sfx/cash-drawer.mp3')} volume={VOL_SFX} />
        </Sequence>
        <Sequence from={startsById.S10 + Math.round(3 * FPS)} durationInFrames={45}>
          <Audio src={staticFile('audio/sfx/phone-notification.mp3')} volume={VOL_SFX} />
        </Sequence>
        <Sequence from={startsById.S06 + Math.round(8 * FPS)} durationInFrames={45}>
          <Audio src={staticFile('audio/sfx/ui-whoosh.mp3')} volume={VOL_SFX} />
        </Sequence>
      </AbsoluteFill>
    </LayoutProvider>
  );
};

export const Master: React.FC = () => <VideoComposition layout="master" />;
export const Vertical: React.FC = () => <VideoComposition layout="vertical" />;
export const Square: React.FC = () => <VideoComposition layout="square" />;
