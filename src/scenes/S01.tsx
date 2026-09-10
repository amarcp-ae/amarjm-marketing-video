import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {GoldPlate} from '../components/GoldPlate';
import {SceneCaptions} from '../components/SceneCaptions';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S01';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const FADE = 12;

const PANELS = [
  {title: 'الوزن', subtitle: 'دقة العيار والوزن في كل قطعة'},
  {title: 'الضريبة', subtitle: 'امتثال ضريبي عبر الفروع'},
  {title: 'الفروع', subtitle: 'من محلٍ واحد إلى مجموعة'},
];

export const S01: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const panelIndex = Math.min(
    PANELS.length - 1,
    Math.floor(interpolate(frame, [0, 180], [0, PANELS.length], {extrapolateRight: 'clamp'})),
  );

  const panelLocal = frame - panelIndex * 60;
  const panelOpacity = interpolate(panelLocal, [0, FADE, 48, 60], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const logoOpacity = interpolate(frame, [40, 40 + FADE], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const logoY = interpolate(frame, [40, 40 + FADE], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badgeDelay = Math.round(2 * fps);
  const badgeSpring = spring({
    frame: frame - badgeDelay,
    fps,
    config: {damping: 12, stiffness: 140},
  });

  const panel = PANELS[panelIndex];

  return (
    <AbsoluteFill>
      <GoldPlate />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: brand.fontFamily,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '18%',
            opacity: panelOpacity,
            textAlign: 'center',
            color: brand.colors.ivory,
            direction: 'rtl',
          }}
        >
          <div style={{fontSize: 56, fontWeight: 600, marginBottom: 12}}>{panel.title}</div>
          <div style={{fontSize: 28, opacity: 0.85}}>{panel.subtitle}</div>
        </div>

        <div
          style={{
            opacity: logoOpacity,
            transform: `translateY(${logoY}px)`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 700,
              letterSpacing: '0.04em',
              backgroundImage: `linear-gradient(120deg, ${brand.colors.gold} 0%, #f0e0a0 45%, ${brand.colors.gold} 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1.1,
            }}
          >
            AMARSoft
          </div>
          <div
            dir="rtl"
            lang="ar"
            style={{
              marginTop: 16,
              fontSize: 42,
              fontWeight: 500,
              color: brand.colors.ivory,
            }}
          >
            أمارسوفت
          </div>
        </div>

        <div
          dir="rtl"
          lang="ar"
          style={{
            position: 'absolute',
            bottom: '22%',
            transform: `scale(${badgeSpring})`,
            opacity: badgeSpring,
            backgroundColor: brand.colors.accent,
            color: brand.colors.ivory,
            fontSize: 32,
            fontWeight: 700,
            padding: '12px 28px',
            borderRadius: 8,
            border: `2px solid ${brand.colors.gold}`,
          }}
        >
          13 عامًا
        </div>
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S01;
