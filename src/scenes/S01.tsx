import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {LogoWordmark} from '../components/LogoWordmark';
import {SceneShell} from '../components/SceneShell';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S01';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const BEATS = [
  {title: 'الوزن', subtitle: 'دقة العيار والوزن في كل قطعة'},
  {title: 'الضريبة', subtitle: 'امتثال ضريبي عبر الفروع'},
  {title: 'الفروع', subtitle: 'من محلٍ واحد إلى مجموعة'},
];

export const S01: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const beat = Math.min(
    BEATS.length - 1,
    Math.floor(interpolate(frame, [0, 150], [0, BEATS.length], {extrapolateRight: 'clamp'})),
  );
  const local = frame - beat * 50;
  const beatOpacity = interpolate(local, [0, 10, 40, 50], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badge = spring({
    frame: frame - Math.round(2 * fps),
    fps,
    config: {damping: 12, stiffness: 140},
  });

  const line = BEATS[beat];

  return (
    <SceneShell sceneId={SCENE_ID} isFirst showHairline={false}>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: brand.fontFamily,
        }}
      >
        <div
          dir="rtl"
          lang="ar"
          style={{
            position: 'absolute',
            top: '16%',
            opacity: beatOpacity,
            textAlign: 'center',
            color: brand.colors.ivory,
          }}
        >
          <div style={{fontSize: 56, fontWeight: 600, marginBottom: 10, color: brand.colors.gold}}>
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
            bottom: '20%',
            transform: `scale(${badge})`,
            opacity: badge,
            color: brand.colors.ivory,
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: '0.04em',
            borderBottom: `2px solid ${brand.colors.gold}`,
            paddingBottom: 8,
          }}
        >
          ثلاثة عشر عامًا
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S01;
