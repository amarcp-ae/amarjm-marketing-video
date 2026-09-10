import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {LogoWordmark} from '../components/LogoWordmark';
import {SceneShell} from '../components/SceneShell';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';
import {findWordOnsetFrame, currentSpokenWord} from '../lib/wordTiming';

const SCENE_ID: SceneId = 'S01';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const BEATS = [
  {word: 'الوزن', title: 'الوزن', subtitle: 'دقة الوزن في كل قطعة'},
  {word: 'العيار', title: 'العيار', subtitle: 'العيار مضبوط في كل فرع'},
  {word: 'الضريبة', title: 'الضريبة', subtitle: 'امتثال ضريبي بلا عناء'},
] as const;

const DEBUG = true;

export const S01: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const onsets = BEATS.map((b) => findWordOnsetFrame(SCENE_ID, b.word, fps) ?? Math.round(6 * fps));

  let active = 0;
  for (let i = 0; i < onsets.length; i++) {
    if (frame >= onsets[i]!) active = i;
  }
  const local = frame - (onsets[active] ?? 0);
  const beatOpacity = interpolate(local, [0, 6, 40, 55], [0, 1, 1, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badge = spring({
    frame: frame - Math.round(2 * fps),
    fps,
    config: {damping: 12, stiffness: 140},
  });

  const spoken = currentSpokenWord(SCENE_ID, frame / fps);
  const line = BEATS[active];

  return (
    <SceneShell sceneId={SCENE_ID} isFirst showHairline={false}>
      <AbsoluteFill
        style={{alignItems: 'center', justifyContent: 'center', fontFamily: brand.fontFamily}}
      >
        <div
          dir="rtl"
          lang="ar"
          style={{
            position: 'absolute',
            top: '14%',
            opacity: beatOpacity,
            textAlign: 'center',
            color: brand.colors.ivory,
          }}
        >
          <div style={{fontSize: 64, fontWeight: 700, marginBottom: 10, color: brand.colors.gold}}>
            {line.title}
          </div>
          <div style={{fontSize: 28, opacity: 0.85}}>{line.subtitle}</div>
        </div>

        <LogoWordmark size={128} sweepAt={36} />

        <div
          dir="rtl"
          lang="ar"
          style={{
            position: 'absolute',
            bottom: '18%',
            transform: `scale(${badge})`,
            opacity: badge,
            color: brand.colors.ivory,
            fontSize: 34,
            fontWeight: 700,
            borderBottom: `2px solid ${brand.colors.gold}`,
            paddingBottom: 8,
          }}
        >
          ثلاثة عشر عامًا
        </div>

        {DEBUG && spoken ? (
          <div
            style={{
              position: 'absolute',
              left: 28,
              bottom: 28,
              background: 'rgba(0,0,0,0.78)',
              color: '#7CFF7C',
              fontFamily: 'monospace',
              fontSize: 18,
              padding: '8px 14px',
              borderRadius: 6,
            }}
          >
            {spoken.word} @ {spoken.startSec.toFixed(3)}s
          </div>
        ) : null}
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S01;
