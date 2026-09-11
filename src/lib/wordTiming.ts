import {getSceneWords, type CaptionWord} from './captionWords';

const clean = (s: string) => s.replace(/[،.,…:؛!?«»""\-]/g, '').trim();

/** Onset of a spoken word from ElevenLabs word timestamps (char→word alignment). */
export const findWordOnsetSec = (
  sceneId: string,
  needle: string,
  occurrence = 0,
): number | null => {
  const words = getSceneWords(sceneId);
  const target = clean(needle);
  if (!target) return null;

  // Prefer exact (cleaned) matches first so short tokens like "ما" don't steal "أمارسوفت".
  const exact: number[] = [];
  const fuzzy: number[] = [];
  for (let i = 0; i < words.length; i++) {
    const cw = clean(words[i].word);
    if (!cw) continue;
    if (cw === target) exact.push(i);
    else if (cw.includes(target) || (target.length >= 3 && target.includes(cw) && cw.length >= 3)) {
      fuzzy.push(i);
    }
  }
  const pool = exact.length > 0 ? exact : fuzzy;
  const idx = pool[occurrence];
  return idx === undefined ? null : words[idx].startSec;
};

export const findWordOnsetFrame = (
  sceneId: string,
  needle: string,
  fps: number,
  occurrence = 0,
): number | null => {
  const sec = findWordOnsetSec(sceneId, needle, occurrence);
  return sec === null ? null : Math.round(sec * fps);
};

export const currentSpokenWord = (sceneId: string, timeSec: number): CaptionWord | null => {
  const words = getSceneWords(sceneId);
  for (let i = words.length - 1; i >= 0; i--) {
    if (timeSec >= words[i].startSec) return words[i];
  }
  return null;
};

/** Match headline tokens to VO words via sequential fuzzy match on alignment words. */
export const tokenOnsetFrames = (sceneId: string, tokens: string[], fps: number): number[] => {
  const words = getSceneWords(sceneId);
  let cursor = 0;
  return tokens.map((token, i) => {
    const t = clean(token);
    if (!t) return Math.round(i * 0.12 * fps);
    for (let j = cursor; j < words.length; j++) {
      const w = clean(words[j].word);
      if (w === t || w.includes(t) || t.includes(w)) {
        cursor = j + 1;
        return Math.floor(words[j].startSec * fps);
      }
    }
    const w = words[Math.min(cursor, Math.max(0, words.length - 1))];
    cursor = Math.min(cursor + 1, words.length);
    return w ? Math.floor(w.startSec * fps) : Math.round(i * 5);
  });
};

