import type {SceneId} from './audioManifest';

import s01 from '../../assets/audio/vo/S01.timestamps.json';
import s02 from '../../assets/audio/vo/S02.timestamps.json';
import s03 from '../../assets/audio/vo/S03.timestamps.json';
import s04 from '../../assets/audio/vo/S04.timestamps.json';
import s05 from '../../assets/audio/vo/S05.timestamps.json';
import s06 from '../../assets/audio/vo/S06.timestamps.json';
import s07 from '../../assets/audio/vo/S07.timestamps.json';
import s08 from '../../assets/audio/vo/S08.timestamps.json';
import s09 from '../../assets/audio/vo/S09.timestamps.json';
import s10 from '../../assets/audio/vo/S10.timestamps.json';
import s11 from '../../assets/audio/vo/S11.timestamps.json';
import s12 from '../../assets/audio/vo/S12.timestamps.json';
import s13 from '../../assets/audio/vo/S13.timestamps.json';

export type CaptionWord = {
  word: string;
  startSec: number;
  endSec: number;
};

type TimestampsFile = {
  words?: Array<{word: string; startSec: number; endSec: number}>;
};

const normalize = (file: TimestampsFile): CaptionWord[] => {
  return (file.words ?? []).map((w) => ({
    word: w.word,
    startSec: w.startSec,
    endSec: w.endSec,
  }));
};

const WORDS_BY_SCENE: Record<SceneId, CaptionWord[]> = {
  S01: normalize(s01),
  S02: normalize(s02),
  S03: normalize(s03),
  S04: normalize(s04),
  S05: normalize(s05),
  S06: normalize(s06),
  S07: normalize(s07),
  S08: normalize(s08),
  S09: normalize(s09),
  S10: normalize(s10),
  S11: normalize(s11),
  S12: normalize(s12),
  S13: normalize(s13),
};

export const getSceneWords = (sceneId: string): CaptionWord[] => {
  return WORDS_BY_SCENE[sceneId as SceneId] ?? [];
};

