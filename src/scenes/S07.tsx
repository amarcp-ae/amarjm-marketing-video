import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S07';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const Scan: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 36}}>
      <DeviceStage
        src={ASSETS.video.S07PosScan}
        kind="video"
        width={1220}
        height={740}
        tiltDeg={7}
        crop={{objectPosition: '50% 45%', scale: 1.5}}
        callout={{label: 'امسح', x: 620, y: 320, delay: Math.round(0.8 * fps)}}
      />
    </AbsoluteFill>
  );
};

const Pay: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = 0.92 + Math.sin(frame / 8) * 0.08;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 36}}>
      <div style={{position: 'relative'}}>
        <DeviceStage
          src={ASSETS.screens.S07.posPaymentDialog}
          width={1220}
          height={740}
          tiltDeg={6}
          crop={{objectPosition: '50% 60%', scale: 1.55}}
          callout={{label: 'اقبض', x: 600, y: 480, delay: Math.round(0.5 * fps)}}
        />
        <div
          style={{
            position: 'absolute',
            left: 300,
            bottom: 150,
            width: 150,
            height: 50,
            border: `2px solid ${brand.colors.gold}`,
            borderRadius: 6,
            transform: `scale(${pulse})`,
            boxShadow: `0 0 0 5px ${brand.colors.gold}33`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Rfid: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: dur} = useVideoConfig();
  const count = Math.round(
    interpolate(frame, [0, Math.max(1, dur - 12)], [0, 312], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: brand.fontFamily,
        color: brand.colors.ivory,
      }}
    >
      <div style={{fontSize: 96, fontWeight: 700, color: brand.colors.gold}}>
        {count}
        <span style={{fontSize: 48, color: brand.colors.ivory}}> / 312</span>
      </div>
      <div dir="rtl" lang="ar" style={{marginTop: 12, fontSize: 36, opacity: 0.9}}>
        قطعة
      </div>
      <Img
        src={staticFile(ASSETS.items.goldBangle22k)}
        style={{
          position: 'absolute',
          left: 160,
          bottom: 140,
          width: 140,
          height: 140,
          objectFit: 'contain',
          opacity: 0.9,
        }}
      />
    </AbsoluteFill>
  );
};

export const S07: React.FC = () => {
  ensureBrandFont();
  const {durationInFrames: dur} = useVideoConfig();
  const seg = Math.max(1, Math.floor(dur / 3));

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'امسح', gold: true},
          {text: '،'},
          {text: 'أضف'},
          {text: '،'},
          {text: 'اقبض'},
          {text: '،'},
          {text: 'اطبع'},
        ]}
      />
      <Sequence from={0} durationInFrames={seg}>
        <Scan />
      </Sequence>
      <Sequence from={seg} durationInFrames={seg}>
        <Pay />
      </Sequence>
      <Sequence from={seg * 2} durationInFrames={dur - seg * 2}>
        <Rfid />
      </Sequence>
    </SceneShell>
  );
};

export default S07;
