import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {KineticHeadline} from '../components/KineticHeadline';
import {LogoWordmark} from '../components/LogoWordmark';
import {SceneShell} from '../components/SceneShell';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S13';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S13: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps, durationInFrames: dur} = useVideoConfig();
  const settle = spring({frame, fps, config: {damping: 14, stiffness: 80}});
  const scale = interpolate(settle, [0, 1], [0.9, 1]);
  const qrOpacity = interpolate(frame, [36, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const endSettle = interpolate(frame, [dur - 24, dur - 1], [1, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneShell sceneId={SCENE_ID} isLast showHairline={false}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'ثلاثة'},
          {text: 'عشر'},
          {text: 'عامًا…'},
          {text: 'نظامٌ', gold: true},
          {text: 'واحد'},
        ]}
        
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${scale * endSettle})`,
          fontFamily: brand.fontFamily,
        }}
      >
        <LogoWordmark size={110} sweepAt={18} />
        <div
          style={{
            marginTop: 36,
            opacity: qrOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Img
            src={staticFile('brand/qr-amarcp.svg')}
            style={{
              width: 220,
              height: 220,
              borderRadius: 12,
              boxShadow: `0 16px 40px rgba(0,0,0,0.45), 0 0 0 2px ${brand.colors.gold}55`,
            }}
          />
          <div
            style={{
              color: brand.colors.gold,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}
          >
            amarcp.ae
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S13;
