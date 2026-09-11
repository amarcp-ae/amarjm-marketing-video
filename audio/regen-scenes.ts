/**
 * Regenerate VO for selected scenes only.
 * Usage: npx tsx audio/regen-scenes.ts S01 S02 S06 S09 S11
 */
import 'dotenv/config';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

const API_BASE = 'https://api.elevenlabs.io/v1';
const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, 'audio', 'script.ar.txt');
const VO_DIR = path.join(ROOT, 'assets', 'audio', 'vo');
const MANIFEST_PATH = path.join(ROOT, 'assets', 'audio', 'manifest.json');
const FRAMES_PATH = path.join(ROOT, 'src', 'sceneFrames.json');
const FPS = 30;
/** Non-VO hold after last spoken word. */
const DEFAULT_TAIL_SEC = 0.3;
const SCENE_TAIL_SEC: Record<string, number> = {
  S01: 1.5, // logo reveal
  S13: 3.0, // end card
};

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'l2PqipvTQvI6VY5pLWBt';
const MODEL_ID = 'eleven_multilingual_v2';
const VOICE_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.9,
  style: 0.25,
  speed: 1.08,
} as const;

const sceneTailSec = (id: string) => SCENE_TAIL_SEC[id] ?? DEFAULT_TAIL_SEC;

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

type WordTimestamp = {word: string; startSec: number; endSec: number};

function requireApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) throw new Error('ELEVENLABS_API_KEY missing');
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
    const body = (parts[i + 1] || '').replace(/\r\n/g, '\n').trim();
    if (!id || !body) continue;
    const num = id.replace(/^S/, '');
    scenes.push({scene: `S${num.padStart(2, '0')}`, text: body});
  }
  return scenes;
}

function alignmentToWords(alignment: Alignment | null | undefined): WordTimestamp[] {
  if (!alignment?.characters?.length) return [];
  const {characters, character_start_times_seconds: starts, character_end_times_seconds: ends} =
    alignment;
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

async function synthesizeScene(apiKey: string, text: string, sceneId: string) {
  const res = await elFetch(
    apiKey,
    `/text-to-speech/${encodeURIComponent(VOICE_ID)}/with-timestamps`,
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
  if (!json.audio_base64) throw new Error('missing audio_base64');
  const alignment = json.alignment ?? json.normalized_alignment ?? null;
  const ends = alignment?.character_end_times_seconds;
  const lastSpeech = ends?.length ? (ends[ends.length - 1] ?? 0) : 0;
  const holdSec = sceneTailSec(sceneId);
  const durationSec = lastSpeech + holdSec;
  return {
    audio: Buffer.from(json.audio_base64, 'base64'),
    alignment,
    durationSec,
    lastSpeechSec: lastSpeech,
    holdSec,
    words: alignmentToWords(alignment),
  };
}

async function main() {
  const wanted = (process.argv.slice(2).length
    ? process.argv.slice(2)
    : Array.from({length: 13}, (_, i) => `S${String(i + 1).padStart(2, '0')}`)
  ).map((s) => {
    const n = s.replace(/^S/i, '');
    return `S${n.padStart(2, '0')}`;
  });

  const apiKey = requireApiKey();
  await mkdir(VO_DIR, {recursive: true});
  const all = parseScript(await readFile(SCRIPT_PATH, 'utf8'));
  const byId = Object.fromEntries(all.map((s) => [s.scene, s]));

  const frames = JSON.parse(await readFile(FRAMES_PATH, 'utf8')) as Record<string, number>;
  let manifest: Record<string, unknown> = {};
  try {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  } catch {
    manifest = {};
  }

  for (const id of wanted) {
    const entry = byId[id];
    if (!entry) throw new Error(`Scene ${id} not in script`);
    console.log(`Regenerating ${id}…`);
    const {audio, alignment, durationSec, lastSpeechSec, holdSec, words} = await synthesizeScene(
      apiKey,
      entry.text,
      id,
    );
    await writeFile(path.join(VO_DIR, `${id}.mp3`), audio);
    await writeFile(
      path.join(VO_DIR, `${id}.timestamps.json`),
      JSON.stringify(
        {
          scene: id,
          text: entry.text,
          durationSec: Number(durationSec.toFixed(3)),
          lastSpeechSec: Number(lastSpeechSec.toFixed(3)),
          holdSec: Number(holdSec.toFixed(3)),
          words,
          alignment: alignment
            ? {
                characters: alignment.characters,
                character_start_times_seconds: alignment.character_start_times_seconds,
                character_end_times_seconds: alignment.character_end_times_seconds,
              }
            : null,
        },
        null,
        2,
      ),
    );
    frames[id] = Math.max(1, Math.round(durationSec * FPS));
    const scenes = (manifest.scenes as Record<string, unknown>) ?? {};
    scenes[id] = {
      file: `vo/${id}.mp3`,
      durationSec: Number(durationSec.toFixed(3)),
      lastSpeechSec: Number(lastSpeechSec.toFixed(3)),
      holdSec: Number(holdSec.toFixed(3)),
      timestampsFile: `vo/${id}.timestamps.json`,
      wordCount: words.length,
    };
    manifest.scenes = scenes;
    console.log(
      `  ${id}: speech ${lastSpeechSec.toFixed(2)}s + hold ${holdSec.toFixed(2)}s → ${durationSec.toFixed(2)}s / ${frames[id]}f (${words.length} words)`,
    );
  }

  manifest.voice = {
    name: 'Abdullah - Saudi Arabic Narrator',
    voice_id: VOICE_ID,
    model_id: MODEL_ID,
  };
  manifest.voiceSettings = {...VOICE_SETTINGS, loudnorm: {I: -16, TP: -1.5}};
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  await writeFile(FRAMES_PATH, JSON.stringify(frames, null, 2) + '\n');
  console.log('Updated manifest + sceneFrames.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
