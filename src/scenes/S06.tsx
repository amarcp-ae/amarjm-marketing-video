import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S06';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const CounterStrip: React.FC = () => (
  <div
    dir="rtl"
    lang="ar"
    style={{
      display: 'flex',
      gap: 18,
      marginTop: 18,
      fontFamily: brand.fontFamily,
    }}
  >
    {[
      {l: 'محفظة الذهب', v: '٤٢٫٣ غ'},
      {l: 'النقد', v: '٨٬٥٠٠ د.إ'},
      {l: 'النقاط', v: '١٬٢٤٠'},
    ].map((c) => (
      <div
        key={c.l}
        style={{
          padding: '10px 18px',
          borderRadius: 12,
          background: 'rgba(14,14,18,0.9)',
          border: `1px solid ${brand.colors.gold}`,
          color: brand.colors.ivory,
          minWidth: 160,
          textAlign: 'center',
        }}
      >
        <div style={{fontSize: 13, opacity: 0.75}}>{c.l}</div>
        <div style={{fontSize: 22, fontWeight: 700, color: brand.colors.gold}}>{c.v}</div>
      </div>
    ))}
  </div>
);

const SoldOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stamp = spring({
    frame: frame - Math.round(0.8 * fps),
    fps,
    config: {damping: 11, stiffness: 150},
  });
  const hide = interpolate(frame, [Math.round(1.6 * fps), Math.round(2.2 * fps)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        right: '18%',
        top: '42%',
        transform: `scale(${stamp}) rotate(-14deg)`,
        opacity: stamp * hide,
        border: `3px solid ${brand.colors.accent}`,
        color: brand.colors.accent,
        background: 'rgba(247,243,235,0.94)',
        fontWeight: 700,
        fontSize: 28,
        padding: '6px 14px',
        fontFamily: brand.fontFamily,
        zIndex: 6,
      }}
    >
      مُباعة
    </div>
  );
};

/** Real Johar storefront captures — laptop + phone, sold stamp, wallet counters. */
export const S06: React.FC = () => {
  ensureBrandFont();
  const {durationInFrames: dur, fps} = useVideoConfig();
  const third = Math.max(1, Math.floor(dur / 3));

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'متجرٌ'},
          {text: 'تداولٌ', gold: true},
          {text: 'محفظةُ'},
          {text: 'وولاء'},
        ]}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: Math.round(1080 * 0.16),
          flexDirection: 'column',
        }}
      >
        <Sequence from={0} durationInFrames={third} layout="none">
          <div style={{position: 'relative'}}>
            <DeviceStage
              src={ASSETS.screens.S06.homeDesktop}
              width={1480}
              height={760}
              tiltDeg={3}
              crop={{objectPosition: '50% 20%', scale: 1.05}}
            />
            <SoldOverlay />
          </div>
        </Sequence>
        <Sequence from={third} durationInFrames={third} layout="none">
          <div style={{display: 'flex', gap: 28, alignItems: 'center'}}>
            <DeviceStage
              src={ASSETS.screens.S06.productDesktop}
              width={1180}
              height={700}
              tiltDeg={3}
              crop={{objectPosition: '50% 30%', scale: 1.08}}
            />
            <DeviceStage
              variant="phone"
              src={ASSETS.screens.S06.homeIphone}
              width={400}
              tiltDeg={3}
              crop={{objectPosition: '50% 20%', scale: 1.05}}
              callout={{label: 'المتجر', x: 200, y: 240, delay: Math.round(0.4 * fps)}}
            />
          </div>
        </Sequence>
        <Sequence from={third * 2} durationInFrames={dur - third * 2} layout="none">
          <DeviceStage
            src={ASSETS.screens.S06.walletDesktop}
            width={1480}
            height={720}
            tiltDeg={3}
            crop={{objectPosition: '50% 35%', scale: 1.1}}
            callout={{label: 'المحفظة', x: 720, y: 280, delay: Math.round(0.35 * fps)}}
          />
        </Sequence>
        <CounterStrip />
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S06;
