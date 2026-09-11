import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S04';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const TABS = [
  {id: 'dxb', label: 'دبي'},
  {id: 'mct', label: 'مسقط'},
  {id: 'ruh', label: 'الرياض'},
] as const;

export const S04: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps, durationInFrames: dur} = useVideoConfig();
  const tab = Math.min(2, Math.floor(frame / Math.max(1, Math.floor(dur / 3))));

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'عدّة', gold: true},
          {text: 'دول،'},
          {text: 'تقريرٌ'},
          {text: 'واحد', gold: true},
        ]}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 24}}>
        <div style={{position: 'relative'}}>
          <DeviceStage
            src={ASSETS.screens.S04.jewelleryGrossProfit}
            width={1520}
            height={780}
            tiltDeg={3}
            crop={{objectPosition: '48% 42%', scale: 1.45}}
            callout={{label: 'التقرير', x: 640, y: 300, delay: Math.round(0.7 * fps)}}
          />
          <div
            dir="rtl"
            lang="ar"
            style={{
              position: 'absolute',
              top: 18,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 8,
              padding: 6,
              borderRadius: 999,
              background: 'rgba(14,14,18,0.88)',
              border: `1px solid ${brand.colors.gold}`,
              fontFamily: brand.fontFamily,
              zIndex: 5,
            }}
          >
            {TABS.map((t, i) => {
              const on = i === tab;
              const pulse = on ? 1 + Math.sin(frame / 8) * 0.03 : 1;
              return (
                <div
                  key={t.id}
                  style={{
                    padding: '8px 22px',
                    borderRadius: 999,
                    background: on ? brand.colors.gold : 'transparent',
                    color: on ? brand.colors.ink : brand.colors.ivory,
                    fontWeight: 700,
                    fontSize: 18,
                    transform: `scale(${pulse})`,
                    opacity: interpolate(frame, [i * 4, i * 4 + 10], [0.5, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                  }}
                >
                  {t.label}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S04;
