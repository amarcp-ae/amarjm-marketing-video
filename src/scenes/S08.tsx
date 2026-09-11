import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S08';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S08: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps, durationInFrames: dur} = useVideoConfig();
  const crossAt = Math.round(dur * 0.45);
  const closingOpacity = interpolate(frame, [crossAt - 10, crossAt + 10], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const openingOpacity = interpolate(frame, [crossAt - 10, crossAt + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const redStamp = spring({
    frame: frame - Math.round(0.7 * fps),
    fps,
    config: {damping: 11, stiffness: 150},
  });
  const greenStamp = spring({
    frame: frame - (crossAt + Math.round(0.4 * fps)),
    fps,
    config: {damping: 11, stiffness: 150},
  });

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'أمانٌ', gold: true},
          {text: 'لا'},
          {text: 'يتهاون'},
        ]}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 36}}>
        <div style={{position: 'relative'}}>
          <DeviceStage
            src={ASSETS.screens.S08.posClosingEntry}
            width={1200}
            height={740}
            tiltDeg={7}
            crop={{objectPosition: '50% 40%', scale: 1.4}}
            callout={{label: 'الإقفال', x: 620, y: 280, delay: Math.round(0.9 * fps)}}
          >
            <div style={{position: 'relative', width: '100%', height: '100%'}}>
              <Img
                src={staticFile(ASSETS.screens.S08.posClosingEntry)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: '50% 40%',
                  transform: 'scale(1.4)',
                  opacity: closingOpacity,
                }}
              />
              <Img
                src={staticFile(ASSETS.screens.S08.posOpeningEntry)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: '50% 40%',
                  transform: 'scale(1.4)',
                  opacity: openingOpacity,
                }}
              />
            </div>
          </DeviceStage>
          <div
            style={{
              position: 'absolute',
              right: 70,
              top: 110,
              transform: `scale(${redStamp}) rotate(-16deg)`,
              opacity: Math.min(1, redStamp) * closingOpacity,
              border: `3px solid ${brand.colors.accent}`,
              color: brand.colors.accent,
              backgroundColor: 'rgba(247,243,235,0.92)',
              fontWeight: 700,
              fontSize: 32,
              padding: '8px 16px',
            }}
          >
            CLOSED
          </div>
          <div
            dir="rtl"
            lang="ar"
            style={{
              position: 'absolute',
              right: 90,
              top: 150,
              transform: `scale(${greenStamp}) rotate(-10deg)`,
              opacity: greenStamp,
              border: '3px solid #2e7d32',
              color: '#2e7d32',
              backgroundColor: 'rgba(247,243,235,0.92)',
              fontWeight: 700,
              fontSize: 30,
              padding: '8px 16px',
            }}
          >
            verified ✓
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S08;
