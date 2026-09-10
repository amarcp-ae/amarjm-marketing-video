/**
 * assembly-v2 audio regen:
 * - VO at speed 1.08 with timestamps
 * - Music bed-v2 @ 110s, force_instrumental
 * Updates assets/audio/manifest.json and sceneFrames.json (VO + 0.4s tail)
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
const FPS = 30;
const TAIL_SEC = 0.4;

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'usjDi9nBY6UHvtKrL4ba';
const MODEL_ID = 'eleven_multilingual_v2';

const VOICE_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.8,
  style: 0.2,
  speed: 1.08,
} as const;

const MUSIC_PROMPT =
  'Minimal, premium corporate-cinematic underscore. Soft sustained strings and warm piano, a very subtle oud motif, low-end pulse at 88 BPM, no drums until 60 s, no vocals, restrained and elegant, 110 seconds.';

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
    const body = (parts[i + 1] || '').replace(/\[S\d+\]/g, '').replace(/\r\n/g, '\n').trim();
    if (!id || !body) continue;
    const num = id.replace(/^S/, '');
    scenes.push({scene: `S${num.padStart(2, '0')}`, text: body});
  }
  if (scenes.length !== 13) throw new Error(`Expected 13 scenes, got ${scenes.length}`);
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

function durationFromAlignment(alignment: Alignment | null | undefined): number {
  const ends = alignment?.character_end_times_seconds;
  if (!ends?.length) return 0;
  return ends[ends.length - 1] ?? 0;
}

async function synthesizeScene(apiKey: string, text: string) {
  const res = await elFetch(apiKey, `/text-to-speech/${encodeURIComponent(VOICE_ID)}/with-timestamps`, {
    method: 'POST',
    query: {output_format: 'mp3_44100_128'},
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS,
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {
    audio_base64?: string;
    alignment?: Alignment | null;
    normalized_alignment?: Alignment | null;
  };
  if (!json.audio_base64) throw new Error('missing audio_base64');
  const alignment = json.alignment ?? json.normalized_alignment ?? null;
  return {
    audio: Buffer.from(json.audio_base64, 'base64'),
    alignment,
    durationSec: durationFromAlignment(alignment),
    words: alignmentToWords(alignment),
  };
}

async function composeMusic(apiKey: string): Promise<Buffer> {
  // Docs: music_length_ms, force_instrumental
  const res = await elFetch(apiKey, '/music', {
    method: 'POST',
    query: {output_format: 'mp3_44100_128'},
    body: JSON.stringify({
      prompt: MUSIC_PROMPT,
      music_length_ms: 110_000,
      force_instrumental: true,
      model_id: 'music_v2',
    }),
  });
  if (!res.ok) throw new Error(`Music ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error(`Music tiny body ${buf.length}`);
  return buf;
}

async function main() {
  const apiKey = requireApiKey();
  const scenes = parseScript(await readFile(SCRIPT_PATH, 'utf8'));
  await mkdir(VO_DIR, {recursive: true});
  await mkdir(MUSIC_DIR, {recursive: true});

  console.log(`VO regen speed=1.08 · ${scenes.length} scenes`);
  const sceneEntries: Record<
    string,
    {file: string; durationSec: number; timestampsFile: string}
  > = {};
  const frames: Record<string, number> = {};

  for (const {scene, text} of scenes) {
    console.log(`VO ${scene}…`);
    const {audio, alignment, durationSec, words} = await synthesizeScene(apiKey, text);
    const file = `vo/${scene}.mp3`;
    const timestampsFile = `vo/${scene}.timestamps.json`;
    await writeFile(path.join(AUDIO_ROOT, file), audio);
    await writeFile(
      path.join(AUDIO_ROOT, timestampsFile),
      `${JSON.stringify({scene, text, durationSec, words, alignment}, null, 2)}\n`,
    );
    sceneEntries[scene] = {
      file,
      durationSec: Number(durationSec.toFixed(3)),
      timestampsFile,
    };
    frames[scene] = Math.max(1, Math.round((durationSec + TAIL_SEC) * FPS));
    console.log(`  → ${durationSec.toFixed(2)}s · ${frames[scene]}f · ${words.length} words`);
  }

  console.log('Music bed-v2…');
  const musicBuf = await composeMusic(apiKey);
  await writeFile(path.join(MUSIC_DIR, 'bed-v2.mp3'), musicBuf);
  console.log(`  → music/bed-v2.mp3 (${musicBuf.length} bytes)`);

  const manifest = {
    voice: {
      name: 'Abdullah - Saudi Arabic Narrator',
      voice_id: VOICE_ID,
      model_id: MODEL_ID,
    },
    voiceSettings: VOICE_SETTINGS,
    scenes: sceneEntries,
    music: {file: 'music/bed-v2.mp3', durationSec: 110},
    sfx: [
      {id: 'barcode-beep', file: 'sfx/barcode-beep.mp3'},
      {id: 'ui-whoosh', file: 'sfx/ui-whoosh.mp3'},
      {id: 'receipt-printer', file: 'sfx/receipt-printer.mp3'},
      {id: 'phone-notification', file: 'sfx/phone-notification.mp3'},
      {id: 'cash-drawer', file: 'sfx/cash-drawer.mp3'},
      {id: 'rfid-chirp', file: 'sfx/rfid-chirp.mp3'},
    ],
  };
  await writeFile(path.join(AUDIO_ROOT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(ROOT, 'src', 'sceneFrames.json'), `${JSON.stringify(frames, null, 2)}\n`);
  const totalFrames = Object.values(frames).reduce((a, b) => a + b, 0);
  console.log(`Total ${totalFrames} frames = ${(totalFrames / FPS).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
