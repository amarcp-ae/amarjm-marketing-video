/**
 * ElevenLabs VO fetch skeleton.
 *
 * Verified against official ElevenLabs API docs:
 * - POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
 * - POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps
 * - Auth header: xi-api-key
 *
 * Writes:
 * - assets/audio/*.mp3
 * - assets/audio/vo.timestamps.json
 * - assets/audio/manifest.json  (per-scene durationInFrames @ 30fps)
 */

import 'dotenv/config';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {FPS, SCENE_IDS, FALLBACK_SCENE_FRAMES, type SceneId} from '../src/lib/audioManifest';

const AUDIO_DIR = path.join(process.cwd(), 'assets', 'audio');
const SCENE_FRAMES_PATH = path.join(process.cwd(), 'src', 'sceneFrames.json');
const API_BASE = 'https://api.elevenlabs.io/v1';

const writeSceneFramesMirror = async (entries: ManifestEntry[]): Promise<void> => {
  const frames = Object.fromEntries(
    SCENE_IDS.map((scene) => {
      const match = entries.find((e) => e.scene === scene);
      return [scene, match?.durationInFrames ?? FALLBACK_SCENE_FRAMES];
    }),
  );
  await writeFile(SCENE_FRAMES_PATH, `${JSON.stringify(frames, null, 2)}\n`, 'utf8');
};

type SceneScript = {
  scene: SceneId;
  text: string;
};

// TODO: replace with final Arabic VO script per scene.
const PLACEHOLDER_SCRIPTS: SceneScript[] = SCENE_IDS.map((scene) => ({
  scene,
  text: `نص تجريبي للمشهد ${scene}`,
}));

type ManifestEntry = {
  scene: SceneId;
  durationInFrames: number;
  audioFile: string;
};

async function fetchSpeechWithTimestamps(
  voiceId: string,
  text: string,
  apiKey: string,
): Promise<{audioBase64: string; durationSeconds: number}> {
  // Official endpoint: Create speech with timing
  // https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
  const url = `${API_BASE}/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
      Accept: 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${body}`);
  }

  const json = (await res.json()) as {
    audio_base64: string;
    alignment?: {
      character_end_times_seconds?: number[];
    };
  };

  const ends = json.alignment?.character_end_times_seconds ?? [];
  const durationSeconds = ends.length > 0 ? ends[ends.length - 1] : FALLBACK_SCENE_FRAMES / FPS;

  return {audioBase64: json.audio_base64, durationSeconds};
}

async function main(): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  await mkdir(AUDIO_DIR, {recursive: true});

  if (!apiKey || !voiceId) {
    console.warn(
      'ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID not set. Writing fallback manifest only.',
    );
    const fallback: ManifestEntry[] = SCENE_IDS.map((scene) => ({
      scene,
      durationInFrames: FALLBACK_SCENE_FRAMES,
      audioFile: `${scene}.mp3`,
    }));
    await writeFile(
      path.join(AUDIO_DIR, 'manifest.json'),
      `${JSON.stringify({scenes: fallback}, null, 2)}\n`,
      'utf8',
    );
    await writeFile(
      path.join(AUDIO_DIR, 'vo.timestamps.json'),
      `${JSON.stringify({cues: []}, null, 2)}\n`,
      'utf8',
    );
    await writeSceneFramesMirror(fallback);
    return;
  }

  const manifest: ManifestEntry[] = [];
  const allCues: Array<{text: string; startFrame: number; endFrame: number}> = [];
  let cursorSeconds = 0;

  for (const script of PLACEHOLDER_SCRIPTS) {
    // TODO: wire final scripts, confirm voice_id, and decide whether to use
    // /text-to-speech/{id} (audio only) vs /with-timestamps (audio + alignment).
    const {audioBase64, durationSeconds} = await fetchSpeechWithTimestamps(
      voiceId,
      script.text,
      apiKey,
    );

    const file = `${script.scene}.mp3`;
    await writeFile(path.join(AUDIO_DIR, file), Buffer.from(audioBase64, 'base64'));

    const durationInFrames = Math.max(1, Math.ceil(durationSeconds * FPS));
    manifest.push({scene: script.scene, durationInFrames, audioFile: file});

    allCues.push({
      text: script.text,
      startFrame: Math.round(cursorSeconds * FPS),
      endFrame: Math.round((cursorSeconds + durationSeconds) * FPS),
    });
    cursorSeconds += durationSeconds;
  }

  await writeFile(
    path.join(AUDIO_DIR, 'manifest.json'),
    `${JSON.stringify({scenes: manifest}, null, 2)}\n`,
    'utf8',
  );
  await writeFile(
    path.join(AUDIO_DIR, 'vo.timestamps.json'),
    `${JSON.stringify({cues: allCues}, null, 2)}\n`,
    'utf8',
  );
  await writeSceneFramesMirror(manifest);

  console.log(`Wrote ${manifest.length} scene audio files + manifest.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
