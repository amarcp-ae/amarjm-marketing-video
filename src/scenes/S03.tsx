import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {brand} from '../brand';
import {Callout} from '../components/Callout';
import {GoldPlate} from '../components/GoldPlate';
import {PhoneFrame} from '../components/PhoneFrame';
import {SceneCaptions} from '../components/SceneCaptions';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S03';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S03: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const leftIn = spring({
    frame: frame - 6,
    fps,
    config: {damping: 16, stiffness: 90},
  });
  const rightIn = spring({
    frame: frame - 14,
    fps,
    config: {damping: 16, stiffness: 90},
  });

  const leftX = interpolate(leftIn, [0, 1], [-420, 0]);
  const rightX = interpolate(rightIn, [0, 1], [420, 0]);
  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <GoldPlate />
      <AbsoluteFill
        style={{
          opacity: fade,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 64,
          fontFamily: brand.fontFamily,
        }}
      >
        <div style={{transform: `translateX(${leftX}px)`}}>
          <PhoneFrame width={340} height={680}>
            <Img
              src={staticFile(ASSETS.screens.S03.salesInvoice)}
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </PhoneFrame>
        </div>
        <div style={{position: 'relative', transform: `translateX(${rightX}px)`}}>
          <PhoneFrame width={340} height={680}>
            <Img
              src={staticFile(ASSETS.screens.S03.paymentEntry)}
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </PhoneFrame>
          <Callout label="حفظ" x={170} y={560} ringSize={64} delay={Math.round(1.2 * fps)} />
        </div>
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S03;
