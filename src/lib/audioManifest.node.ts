import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {
  defaultSceneFrames,
  framesFromManifest,
  type AudioManifest,
  type AudioManifestEntry,
  type SceneId,
} from './audioManifest';

const MANIFEST_PATH = path.join(process.cwd(), 'assets', 'audio', 'manifest.json');

/** Node-only helper for CLI scripts. Remotion compositions must not import this file. */
export const readAudioManifestFrames = (): Record<SceneId, number> => {
  if (!existsSync(MANIFEST_PATH)) {
    return defaultSceneFrames();
  }

  try {
    const raw = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as
      AudioManifest | AudioManifestEntry[];
    return framesFromManifest(raw);
  } catch (error) {
    console.warn('Failed to read audio manifest; using fallbacks', error);
    return defaultSceneFrames();
  }
};
