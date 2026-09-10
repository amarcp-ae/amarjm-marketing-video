import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {GoldPlate} from '../components/GoldPlate';
import {PhoneFrame} from '../components/PhoneFrame';
import {SceneCaptions} from '../components/SceneCaptions';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S11';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S11: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const leftIn = spring({
    frame: frame - 4,
    fps,
    config: {damping: 16, stiffness: 100},
  });
  const rightIn = spring({
    frame: frame - 12,
    fps,
    config: {damping: 16, stiffness: 100},
  });

  const bounce = spring({
    frame: frame - Math.round(1.5 * fps),
    fps,
    config: {damping: 8, stiffness: 160},
  });
  const sifY = interpolate(bounce, [0, 1], [-80, 0]);

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
        <div style={{transform: `translateX(${interpolate(leftIn, [0, 1], [-360, 0])}px)`, position: 'relative'}}>
          <PhoneFrame width={340} height={680}>
            <Img
              src={staticFile(ASSETS.screens.S03.salesInvoice)}
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </PhoneFrame>
          <div
            style={{
              position: 'absolute',
              top: 54,
              left: 24,
              right: 24,
              height: 42,
              backgroundColor: brand.colors.accent,
              color: brand.colors.ivory,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 20,
              borderRadius: 8,
              letterSpacing: '0.08em',
            }}
          >
            HR
          </div>
        </div>

        <div style={{transform: `translateX(${interpolate(rightIn, [0, 1], [360, 0])}px)`, position: 'relative'}}>
          <PhoneFrame width={340} height={680}>
            <Img
              src={staticFile(ASSETS.screens.S03.paymentEntry)}
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </PhoneFrame>
          <div
            style={{
              position: 'absolute',
              top: 54,
              left: 24,
              right: 24,
              height: 42,
              backgroundColor: brand.colors.accent,
              color: brand.colors.ivory,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 20,
              borderRadius: 8,
              letterSpacing: '0.08em',
            }}
          >
            HR
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 120,
            transform: `translateY(${sifY}px) scale(${bounce})`,
            opacity: bounce,
            width: 120,
            height: 140,
            backgroundColor: brand.colors.ivory,
            borderRadius: 12,
            border: `2px solid ${brand.colors.gold}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 14px 30px rgba(0,0,0,0.35)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 68,
              backgroundColor: brand.colors.ink,
              borderRadius: 6,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 18,
                height: 18,
                background: `linear-gradient(135deg, transparent 50%, ${brand.colors.gold} 50%)`,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 10,
              fontWeight: 700,
              color: brand.colors.ink,
              fontSize: 22,
            }}
          >
            .SIF
          </div>
          <div style={{fontSize: 14, color: brand.colors.ink, opacity: 0.7}}>WPS</div>
        </div>
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S11;
