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
  let hit = 0;
  for (const w of words) {
    const cw = clean(w.word);
    if (cw === target || cw.includes(target) || target.includes(cw)) {
      if (hit === occurrence) return w.startSec;
      hit += 1;
    }
  }
  return null;
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

