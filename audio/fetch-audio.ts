/**
 * Fetch AmarJM marketing audio from ElevenLabs.
 *
 * Verified against official docs:
 * - VO + timing: POST /v1/text-to-speech/{voice_id}/with-timestamps
 *   https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
 * - Voices:      GET  /v1/voices
 * - Music:       POST /v1/music
 *   https://elevenlabs.io/docs/api-reference/music/compose
 * - SFX:         POST /v1/sound-generation
 *   https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert
 *
 * Auth header: xi-api-key
 *
 * Outputs:
 * - assets/audio/vo/S01.mp3 … S13.mp3
 * - assets/audio/vo/S01.timestamps.json …
 * - assets/audio/manifest.json  (per scene: file, durationSec, timestampsFile)
 * - assets/audio/music/bed.mp3 (skipped if Music unavailable on key)
 * - assets/audio/sfx/*.mp3
 */

import 'dotenv/config';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

const API_BASE = 'https://api.elevenlabs.io/v1';
const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, 'audio', 'script.ar.txt');
const AUDIO_ROOT = path.join(ROOT, 'assets', 'audio');
const VO_DIR = path.join(AUDIO_ROOT, 'vo');
const MUSIC_DIR = path.join(AUDIO_ROOT, 'music');
const SFX_DIR = path.join(AUDIO_ROOT, 'sfx');

/** Chosen: Abdullah - Saudi Arabic Narrator */
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'usjDi9nBY6UHvtKrL4ba';
const VOICE_NAME = 'Abdullah - Saudi Arabic Narrator';
const MODEL_ID = 'eleven_multilingual_v2';

const VOICE_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.8,
  style: 0.2,
  speed: 0.95,
} as const;

const MUSIC_PROMPT =
  'Cinematic Arabic-fusion underscore: oud and qanun over soft electronic pulse, warm and premium, no vocals, builds gently to a confident close, 100 seconds, 90 BPM.';

const SFX_CLIPS: Array<{id: string; text: string; durationSeconds: number}> = [
  {
    id: 'barcode-beep',
    text: 'Short crisp retail barcode scanner beep, single clean electronic chirp',
    durationSeconds: 1.2,
  },
  {
    id: 'ui-whoosh',
    text: 'Soft modern UI whoosh transition, airy digital swipe',
    durationSeconds: 1.5,
  },
  {
    id: 'receipt-printer',
    text: 'Small thermal receipt printer whirring and tearing paper',
    durationSeconds: 2.0,
  },
  {
    id: 'phone-notification',
    text: 'Gentle smartphone notification chime, short and polite',
    durationSeconds: 1.5,
  },
  {
    id: 'cash-drawer',
    text: 'Cash register drawer opening with metallic spring and soft thud',
    durationSeconds: 1.8,
  },
  {
    id: 'rfid-chirp',
    text: 'RFID reader confirmation chirp, short electronic ping',
    durationSeconds: 1.2,
  },
];

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

type WordTimestamp = {
  word: string;
  startSec: number;
  endSec: number;
};

type SceneManifestEntry = {
  file: string;
  durationSec: number;
  timestampsFile: string;
};

type AudioManifest = {
  voice: {name: string; voice_id: string; model_id: string};
  voiceSettings: typeof VOICE_SETTINGS;
  scenes: Record<string, SceneManifestEntry>;
  music: {file: string; durationSec: number; skipped?: string};
  sfx: Array<{id: string; file: string}>;
};

function requireApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) throw new Error('ELEVENLABS_API_KEY missing in .env');
  return key;
}

async function elFetch(
  apiKey: string,
  pathname: string,
  init: RequestInit & {query?: Record<string, string>} = {},
): Promise<Response> {
  const url = new URL(`${API_BASE}${pathname}`);
  if (init.query) {
    for (const [k, v] of Object.entries(init.query)) url.searchParams.set(k, v);
  }
  const headers = new Headers(init.headers);
  headers.set('xi-api-key', apiKey);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, {...init, headers});
}

function parseScript(raw: string): Array<{scene: string; text: string}> {
  const parts = raw.split(/^\[(S\d+)\]\s*$/m);
  const scenes: Array<{scene: string; text: string}> = [];
  for (let i = 1; i < parts.length; i += 2) {
    const id = parts[i];
    const body = (parts[i + 1] || '')
      .replace(/\[S\d+\]/g, '')
      .replace(/\r\n/g, '\n')
      .trim();
    if (!id || !body) continue;
    const num = id.replace(/^S/, '');
    scenes.push({scene: `S${num.padStart(2, '0')}`, text: body});
  }
  if (scenes.length !== 13) {
    throw new Error(`Expected 13 scenes in script.ar.txt, got ${scenes.length}`);
  }
  return scenes;
}

function alignmentToWords(alignment: Alignment | null | undefined): WordTimestamp[] {
  if (!alignment?.characters?.length) return [];
  const {
    characters,
    character_start_times_seconds: starts,
    character_end_times_seconds: ends,
  } = alignment;
  const words: WordTimestamp[] = [];
  let buf = '';
  let start = 0;
  let end = 0;
  let inWord = false;

  const flush = () => {
    const word = buf.trim();
    if (word) words.push({word, startSec: start, endSec: end});
    buf = '';
    inWord = false;
  };

  for (let i = 0; i < characters.length; i++) {
    const ch = characters[i] ?? '';
    if (/\s/.test(ch)) {
      if (inWord) flush();
      continue;
    }
    if (!inWord) {
      inWord = true;
      start = starts[i] ?? 0;
      buf = ch;
    } else {
      buf += ch;
    }
    end = ends[i] ?? end;
  }
  if (inWord) flush();
  return words;
}

function durationFromAlignment(alignment: Alignment | null | undefined): number {
  const ends = alignment?.character_end_times_seconds;
  if (!ends?.length) return 0;
  return ends[ends.length - 1] ?? 0;
}

async function synthesizeScene(
  apiKey: string,
  voiceId: string,
  text: string,
): Promise<{
  audio: Buffer;
  alignment: Alignment | null;
  durationSec: number;
  words: WordTimestamp[];
}> {
  const res = await elFetch(
    apiKey,
    `/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps`,
    {
      method: 'POST',
      query: {output_format: 'mp3_44100_128'},
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: VOICE_SETTINGS,
      }),
    },
  );
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {
    audio_base64?: string;
    alignment?: Alignment | null;
    normalized_alignment?: Alignment | null;
  };
  if (!json.audio_base64) throw new Error('TTS response missing audio_base64');
  const alignment = json.alignment ?? json.normalized_alignment ?? null;
  return {
    audio: Buffer.from(json.audio_base64, 'base64'),
    alignment,
    durationSec: durationFromAlignment(alignment),
    words: alignmentToWords(alignment),
  };
}

async function composeMusic(
  apiKey: string,
): Promise<{ok: true; audio: Buffer} | {ok: false; reason: string}> {
  const res = await elFetch(apiKey, '/music', {
    method: 'POST',
    query: {output_format: 'mp3_44100_128'},
    body: JSON.stringify({
      prompt: MUSIC_PROMPT,
      music_length_ms: 100_000,
      force_instrumental: true,
      model_id: 'music_v2',
    }),
  });
  if (!res.ok) {
    return {ok: false, reason: `${res.status}: ${(await res.text()).slice(0, 400)}`};
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) {
    return {
      ok: false,
      reason: `unexpected tiny body (${buf.length} bytes): ${buf.toString('utf8').slice(0, 200)}`,
    };
  }
  return {ok: true, audio: buf};
}

async function generateSfx(apiKey: string, text: string, durationSeconds: number): Promise<Buffer> {
  const res = await elFetch(apiKey, '/sound-generation', {
    method: 'POST',
    query: {output_format: 'mp3_44100_128'},
    body: JSON.stringify({
      text,
      duration_seconds: durationSeconds,
      prompt_influence: 0.35,
      model_id: 'eleven_text_to_sound_v2',
    }),
  });
  if (!res.ok) throw new Error(`SFX ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main(): Promise<void> {
  const apiKey = requireApiKey();
  const scenes = parseScript(await readFile(SCRIPT_PATH, 'utf8'));

  await mkdir(VO_DIR, {recursive: true});
  await mkdir(MUSIC_DIR, {recursive: true});
  await mkdir(SFX_DIR, {recursive: true});

  console.log(`Voice ${VOICE_NAME} (${VOICE_ID}) · ${MODEL_ID} · ${scenes.length} scenes`);

  const sceneEntries: Record<string, SceneManifestEntry> = {};
  for (const {scene, text} of scenes) {
    console.log(`VO ${scene}… (${text.length} chars)`);
    const {audio, alignment, durationSec, words} = await synthesizeScene(apiKey, VOICE_ID, text);
    const file = `vo/${scene}.mp3`;
    const timestampsFile = `vo/${scene}.timestamps.json`;
    await writeFile(path.join(AUDIO_ROOT, file), audio);
    await writeFile(
      path.join(AUDIO_ROOT, timestampsFile),
      `${JSON.stringify({scene, text, durationSec, words, alignment}, null, 2)}\n`,
      'utf8',
    );
    sceneEntries[scene] = {
      file,
      durationSec: Number(durationSec.toFixed(3)),
      timestampsFile,
    };
    console.log(`  → ${file} ${durationSec.toFixed(2)}s · ${words.length} words`);
  }

  console.log('Music…');
  let music: AudioManifest['music'];
  const musicResult = await composeMusic(apiKey);
  if (musicResult.ok) {
    const file = 'music/bed.mp3';
    await writeFile(path.join(AUDIO_ROOT, file), musicResult.audio);
    music = {file, durationSec: 100};
    console.log(`  → ${file}`);
  } else {
    music = {file: 'music/bed.mp3', durationSec: 0, skipped: musicResult.reason};
    console.warn(`  Music skipped — ${musicResult.reason}`);
  }

  const sfxOut: AudioManifest['sfx'] = [];
  for (const clip of SFX_CLIPS) {
    console.log(`SFX ${clip.id}…`);
    const audio = await generateSfx(apiKey, clip.text, clip.durationSeconds);
    const file = `sfx/${clip.id}.mp3`;
    await writeFile(path.join(AUDIO_ROOT, file), audio);
    sfxOut.push({id: clip.id, file});
    console.log(`  → ${file} (${audio.length} bytes)`);
  }

  const manifest: AudioManifest = {
    voice: {name: VOICE_NAME, voice_id: VOICE_ID, model_id: MODEL_ID},
    voiceSettings: VOICE_SETTINGS,
    scenes: sceneEntries,
    music,
    sfx: sfxOut,
  };
  await writeFile(path.join(AUDIO_ROOT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log('Wrote assets/audio/manifest.json');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
