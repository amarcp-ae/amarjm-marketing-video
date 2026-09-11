import 'dotenv/config';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const exec = promisify(execFile);
const API = 'https://api.elevenlabs.io/v1';
const OUT = path.join(process.cwd(), 'artifacts', 'vo-candidates');
const SCRIPT = path.join(process.cwd(), 'audio', 'script.ar.txt');
const MODEL = 'eleven_multilingual_v2';
const SETTINGS = {stability: 0.3, similarity_boost: 0.85, style: 0.55, speed: 1.05};

// From GET /v1/voices — Arabic male narration / energetic
const VOICES = [
  {id: 'usjDi9nBY6UHvtKrL4ba', slug: 'abdullah', label: 'Abdullah — Saudi Arabic Narrator (baseline)'},
  {id: 'MI88rOZjXbH22N8KHXUo', slug: 'ali', label: 'Ali — Calm & Deep Arabic Saudi Narrator'},
  {id: 'NMWQDQipWXm8HlCLKapi', slug: 'houssam', label: 'Houssam — Warm, Friendly & Energetic'},
];

function parse(raw: string) {
  const parts = raw.split(/^\[(S\d+)\]\s*$/m);
  const map: Record<string, string> = {};
  for (let i = 1; i < parts.length; i += 2) {
    const n = parts[i].replace(/^S0?/, '');
    map[`S${n.padStart(2, '0')}`] = (parts[i + 1] || '').trim();
  }
  return map;
}

async function tts(apiKey: string, voiceId: string, text: string) {
  const res = await fetch(
    `${API}/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {'xi-api-key': apiKey, 'Content-Type': 'application/json'},
      body: JSON.stringify({text, model_id: MODEL, voice_settings: SETTINGS}),
    },
  );
  if (!res.ok) throw new Error(`${voiceId} ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {audio_base64: string};
  return Buffer.from(json.audio_base64, 'base64');
}

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY!.trim();
  await mkdir(OUT, {recursive: true});
  const scenes = parse(await readFile(SCRIPT, 'utf8'));
  const candidates: Array<{scene: string; slug: string; label: string; file: string}> = [];
  for (const scene of ['S01', 'S13'] as const) {
    const text = scenes[scene];
    console.log(`\n=== ${scene} EXACT TEXT ===\n${text}\n`);
    for (const v of VOICES) {
      console.log(`TTS ${scene}/${v.slug}`);
      const buf = await tts(apiKey, v.id, text);
      const raw = path.join(OUT, `${scene}-${v.slug}.raw.mp3`);
      const out = path.join(OUT, `${scene}-${v.slug}.mp3`);
      await writeFile(raw, buf);
      await exec('ffmpeg', ['-y', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', '192k', out]);
      candidates.push({scene, slug: v.slug, label: v.label, file: `artifacts/vo-candidates/${scene}-${v.slug}.mp3`});
      console.log(' →', out);
    }
  }
  await writeFile(path.join(OUT, 'index.json'), JSON.stringify({model: MODEL, settings: SETTINGS, candidates}, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
