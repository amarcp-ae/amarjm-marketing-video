import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {brand} from '../brand';
import {GoldPlate} from '../components/GoldPlate';
import {LaptopFrame} from '../components/LaptopFrame';
import {SceneCaptions} from '../components/SceneCaptions';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S07';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const ScanSegment: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{opacity: fade, alignItems: 'center', justifyContent: 'center'}}>
      <LaptopFrame width={1100} height={700}>
        <OffthreadVideo
          src={staticFile(ASSETS.video.S07PosScan)}
          style={{width: '100%', height: '100%', objectFit: 'contain'}}
          muted
        />
      </LaptopFrame>
    </AbsoluteFill>
  );
};

const PaymentSegment: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cashPulse = 0.9 + Math.sin(frame / 8) * 0.1;
  const cardPulse = 0.9 + Math.sin(frame / 8 + 1.2) * 0.1;

  return (
    <AbsoluteFill style={{opacity: fade, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'relative'}}>
        <LaptopFrame width={1100} height={700}>
          <Img
            src={staticFile(ASSETS.screens.S07.posPaymentDialog)}
            style={{width: '100%', height: '100%', objectFit: 'contain'}}
          />
        </LaptopFrame>
        <div
          style={{
            position: 'absolute',
            left: 280,
            bottom: 160,
            width: 160,
            height: 56,
            border: `3px solid ${brand.colors.gold}`,
            borderRadius: 8,
            transform: `scale(${cashPulse})`,
            boxShadow: `0 0 0 6px ${brand.colors.gold}33`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 480,
            bottom: 160,
            width: 160,
            height: 56,
            border: `3px solid ${brand.colors.accent}`,
            borderRadius: 8,
            transform: `scale(${cardPulse})`,
            boxShadow: `0 0 0 6px ${brand.colors.accent}33`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const RfidSegment: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames: dur} = useVideoConfig();
  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const count = Math.round(
    interpolate(frame, [0, Math.max(1, dur - 20)], [0, 312], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  return (
    <AbsoluteFill style={{opacity: fade}}>
      <GoldPlate />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: brand.fontFamily,
          color: brand.colors.ivory,
        }}
      >
        <div
          dir="rtl"
          lang="ar"
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: brand.colors.gold,
            textAlign: 'center',
          }}
        >
          {count} / 312 قطعة
        </div>
        <div style={{marginTop: 16, fontSize: 28, opacity: 0.85}}>RFID</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const S07: React.FC = () => {
  ensureBrandFont();
  const {durationInFrames: dur} = useVideoConfig();
  const seg = Math.max(1, Math.floor(dur / 3));

  return (
    <AbsoluteFill style={{backgroundColor: brand.colors.ink}}>
      <Sequence from={0} durationInFrames={seg}>
        <AbsoluteFill>
          <GoldPlate />
          <ScanSegment />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={seg} durationInFrames={seg}>
        <AbsoluteFill>
          <GoldPlate />
          <PaymentSegment />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={seg * 2} durationInFrames={dur - seg * 2}>
        <RfidSegment />
      </Sequence>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S07;
