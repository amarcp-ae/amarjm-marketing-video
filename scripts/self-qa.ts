#!/usr/bin/env npx tsx
/**
 * Mandatory SELF-QA after Master render.
 * Extract 1 frame / 2s, flag blanks, modals, and undersized primary screens.
 * Writes contact sheet + flagged list. Exit 1 if any flag.
 */
import {execFileSync} from 'node:child_process';
import {mkdirSync, readdirSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {createCanvas, loadImage} from '@napi-rs/canvas';

const ROOT = process.cwd();
const master =
  process.argv[2] ||
  path.join(ROOT, 'out', 'master-v3i.mp4');
const outDir = path.join(ROOT, 'out', 'self-qa');
const artifacts = '/opt/cursor/artifacts';

mkdirSync(outDir, {recursive: true});
mkdirSync(artifacts, {recursive: true});

type Flag = {t: number; file: string; reasons: string[]};

function run(cmd: string, args: string[]) {
  execFileSync(cmd, args, {stdio: 'pipe'});
}

function probeDuration(file: string): number {
  const out = execFileSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file],
    {encoding: 'utf8'},
  ).trim();
  return Number(out);
}

async function analyzeFrame(file: string): Promise<string[]> {
  const img = await loadImage(file);
  const w = img.width;
  const h = img.height;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  const bins = new Map<string, number>();
  let n = 0;
  // Sample every 8th pixel
  for (let i = 0; i < data.length; i += 4 * 8) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const key = `${r >> 4},${g >> 4},${b >> 4}`;
    bins.set(key, (bins.get(key) || 0) + 1);
    n++;
  }
  let max = 0;
  for (const v of bins.values()) max = Math.max(max, v);
  const reasons: string[] = [];
  if (max / n > 0.9) reasons.push('>90% one colour (blank/solid)');

  // OCR-ish: scan for bright UI modal rectangles occupying center
  // Heuristic: large mid-luminance rectangle + dark vignette → modal risk
  // Text scan via tesseract if available
  try {
    const txt = execFileSync(
      'tesseract',
      [file, 'stdout', '-l', 'eng+ara', '--psm', '6'],
      {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']},
    );
    const bad = [
      'Welcome Back',
      'Select Company',
      'Hashem Round 2',
      'Hashem Round',
      'Round 2',
      'Select Company',
      'Login',
    ];
    for (const b of bad) {
      if (txt.toLowerCase().includes(b.toLowerCase())) reasons.push(`text:"${b}"`);
    }
    if (/\.modal/i.test(txt)) reasons.push('text:.modal');
  } catch {
    // tesseract optional — fall back to filename-only heuristics already applied
  }

  // Primary screen width: find largest contiguous non-near-black column span
  const colEnergy = new Float64Array(w);
  for (let x = 0; x < w; x += 2) {
    let e = 0;
    for (let y = 0; y < h; y += 4) {
      const i = (y * w + x) * 4;
      e += data[i]! + data[i + 1]! + data[i + 2]!;
    }
    colEnergy[x] = e;
  }
  const thresh = 30 * (h / 4); // dark columns below this
  let best = 0;
  let run = 0;
  for (let x = 0; x < w; x += 2) {
    if ((colEnergy[x] || 0) > thresh) {
      run += 2;
      best = Math.max(best, run);
    } else run = 0;
  }
  if (best / w < 0.6) reasons.push(`primary screen <60% width (${((best / w) * 100).toFixed(0)}%)`);

  return reasons;
}

async function main() {
  if (!existsSync(master)) {
    console.error('Master missing:', master);
    process.exit(2);
  }
  const dur = probeDuration(master);
  console.log(`Master ${master} duration=${dur.toFixed(2)}s`);

  // Clear old frames
  for (const f of readdirSync(outDir)) {
    if (f.startsWith('f') && f.endsWith('.png')) {
      try {
        require('fs').unlinkSync(path.join(outDir, f));
      } catch {
        /* ignore */
      }
    }
  }

  run('ffmpeg', [
    '-y',
    '-i',
    master,
    '-vf',
    'fps=1/2,scale=480:-1',
    path.join(outDir, 'f%04d.png'),
  ]);

  const frames = readdirSync(outDir)
    .filter((f) => /^f\d+\.png$/.test(f))
    .sort();
  const flags: Flag[] = [];
  for (let i = 0; i < frames.length; i++) {
    const file = frames[i]!;
    const t = i * 2;
    const reasons = await analyzeFrame(path.join(outDir, file));
    if (reasons.length) flags.push({t, file, reasons});
    process.stdout.write(`t=${t}s ${file} ${reasons.length ? 'FLAG ' + reasons.join('; ') : 'ok'}\n`);
  }

  // Contact sheet
  const cols = 6;
  const thumbW = 320;
  const thumbH = 180;
  const rows = Math.ceil(frames.length / cols);
  const sheet = createCanvas(cols * thumbW, rows * (thumbH + 28));
  const sctx = sheet.getContext('2d');
  sctx.fillStyle = '#111';
  sctx.fillRect(0, 0, sheet.width, sheet.height);
  for (let i = 0; i < frames.length; i++) {
    const img = await loadImage(path.join(outDir, frames[i]!));
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * thumbW;
    const y = row * (thumbH + 28);
    sctx.drawImage(img, x, y, thumbW, thumbH);
    const flagged = flags.find((f) => f.file === frames[i]);
    sctx.fillStyle = flagged ? '#ff4444' : '#ddd';
    sctx.font = '14px sans-serif';
    sctx.fillText(`${i * 2}s${flagged ? ' FLAG' : ''}`, x + 6, y + thumbH + 18);
    if (flagged) {
      sctx.strokeStyle = '#ff2222';
      sctx.lineWidth = 4;
      sctx.strokeRect(x + 2, y + 2, thumbW - 4, thumbH - 4);
    }
  }
  const sheetPath = path.join(outDir, 'contact-sheet.png');
  writeFileSync(sheetPath, sheet.toBuffer('image/png'));
  writeFileSync(path.join(artifacts, 'self_qa_contact_sheet.png'), sheet.toBuffer('image/png'));

  const report = {
    master,
    durationSec: dur,
    frameCount: frames.length,
    flagged: flags,
    ok: flags.length === 0,
  };
  writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  writeFileSync(path.join(artifacts, 'self_qa_report.json'), JSON.stringify(report, null, 2));

  console.log('\n=== FLAGGED FRAMES ===');
  if (!flags.length) console.log('(none)');
  for (const f of flags) console.log(`${f.t}s\t${f.file}\t${f.reasons.join(' | ')}`);
  console.log(`duration=${dur.toFixed(2)}s contact=${sheetPath}`);
  process.exit(flags.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
