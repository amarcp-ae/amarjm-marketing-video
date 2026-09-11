import sceneFrames from '../sceneFrames.json';

export const FPS = 30;
export const FALLBACK_SCENE_FRAMES = 90;
export const VO_TAIL_SEC = 0.3;

export type SceneId =
  | 'S01'
  | 'S02'
  | 'S03'
  | 'S04'
  | 'S05'
  | 'S06'
  | 'S07'
  | 'S08'
  | 'S09'
  | 'S10'
  | 'S11'
  | 'S12'
  | 'S13';

export const SCENE_IDS: SceneId[] = [
  'S01',
  'S02',
  'S03',
  'S04',
  'S05',
  'S06',
  'S07',
  'S08',
  'S09',
  'S10',
  'S11',
  'S12',
  'S13',
];

export type AudioManifestEntry = {
  scene: SceneId;
  durationInFrames: number;
  audioFile?: string;
};

export type AudioManifest = {
  scenes: AudioManifestEntry[];
};

export const getSceneDurationInFrames = (
  scene: SceneId,
  manifest?: Partial<Record<SceneId, number>> | null,
): number => {
  const fromArg = manifest?.[scene];
  if (typeof fromArg === 'number' && Number.isFinite(fromArg) && fromArg > 0) {
    return Math.round(fromArg);
  }

  const fromFile = (sceneFrames as Record<string, number>)[scene];
  if (typeof fromFile === 'number' && Number.isFinite(fromFile) && fromFile > 0) {
    return Math.round(fromFile);
  }

  return FALLBACK_SCENE_FRAMES;
};

export const framesFromManifest = (
  manifest: AudioManifest | AudioManifestEntry[] | null | undefined,
): Record<SceneId, number> => {
  const frames = defaultSceneFrames();
  if (!manifest) {
    return frames;
  }

  const entries = Array.isArray(manifest) ? manifest : manifest.scenes;
  for (const entry of entries ?? []) {
    if (entry?.scene && typeof entry.durationInFrames === 'number') {
      frames[entry.scene] = Math.max(1, Math.round(entry.durationInFrames));
    }
  }
  return frames;
};

export const defaultSceneFrames = (): Record<SceneId, number> => {
  return SCENE_IDS.reduce(
    (acc, id) => {
      acc[id] = getSceneDurationInFrames(id);
      return acc;
    },
    {} as Record<SceneId, number>,
  );
};

export const totalDurationInFrames = (frames: Record<SceneId, number>): number => {
  return SCENE_IDS.reduce((sum, id) => sum + frames[id], 0);
};

/** Cumulative start frame for each scene on the master timeline. */
export const sceneStartFrames = (
  frames: Record<SceneId, number> = defaultSceneFrames(),
): Record<SceneId, number> => {
  const starts = {} as Record<SceneId, number>;
  let cursor = 0;
  for (const id of SCENE_IDS) {
    starts[id] = cursor;
    cursor += frames[id];
  }
  return starts;
};
