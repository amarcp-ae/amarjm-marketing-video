import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S09';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const PANELS = [
  {
    src: ASSETS.screens.S09.vatReport,
    crop: {objectPosition: '50% 35%', scale: 1.5},
    label: 'ضريبة',
    fill: 0.92,
  },
  {
    src: ASSETS.screens.S09.taxFreeTransaction,
    crop: {objectPosition: '50% 45%', scale: 1.45},
    label: 'بلانِت',
    fill: 0.78,
  },
  {
    src: ASSETS.screens.S09.customerKyc,
    crop: {objectPosition: '55% 40%', scale: 1.55},
    label: 'اعرف عميلك',
    fill: 1,
  },
] as const;

export const S09: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {durationInFrames: dur, fps} = useVideoConfig();
  const seg = Math.max(1, Math.floor(dur / 3));
  const idx = Math.min(PANELS.length - 1, Math.floor(frame / seg));
  const panel = PANELS[idx];
  const local = frame - idx * seg;
  const boxFill = interpolate(local, [8, 40], [0, panel.fill], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'ضريبة', gold: true},
          {text: '·'},
          {text: 'بلانِت', gold: true},
          {text: '·'},
          {text: 'اعرف'},
          {text: 'عميلك'},
        ]}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 40}}>
        <DeviceStage
          src={panel.src}
          width={1180}
          height={720}
          tiltDeg={7}
          crop={panel.crop}
          callout={{
            label: panel.label,
            x: 640,
            y: 300,
            delay: Math.round(0.5 * fps),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 80,
            bottom: 120,
            display: 'flex',
            gap: 14,
            alignItems: 'flex-end',
          }}
        >
          {PANELS.map((p, i) => (
            <div key={p.label} style={{width: 56, textAlign: 'center'}}>
              <div
                style={{
                  height: 90,
                  width: 56,
                  border: `1px solid ${brand.colors.gold}88`,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'flex-end',
                  overflow: 'hidden',
                  background: 'rgba(14,14,18,0.6)',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${(i === idx ? boxFill : i < idx ? 1 : 0.15) * 100}%`,
                    background: `linear-gradient(180deg, ${brand.colors.gold}, ${brand.colors.gold}88)`,
                  }}
                />
              </div>
              <div
                dir="rtl"
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  color: i === idx ? brand.colors.gold : brand.colors.ivory,
                  fontFamily: brand.fontFamily,
                  opacity: 0.9,
                }}
              >
                {p.label}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S09;
