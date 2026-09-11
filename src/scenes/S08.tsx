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
import {GoldPlate} from '../components/GoldPlate';
import {LaptopFrame} from '../components/LaptopFrame';
import {SceneCaptions} from '../components/SceneCaptions';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S08';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S08: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps, durationInFrames: dur} = useVideoConfig();

  const crossfadeAt = Math.round(dur * 0.45);
  const closingOpacity = interpolate(frame, [crossfadeAt - 12, crossfadeAt + 12], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const openingOpacity = interpolate(frame, [crossfadeAt - 12, crossfadeAt + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const redStamp = spring({
    frame: frame - Math.round(0.8 * fps),
    fps,
    config: {damping: 11, stiffness: 150},
  });
  const greenStamp = spring({
    frame: frame - (crossfadeAt + Math.round(0.5 * fps)),
    fps,
    config: {damping: 11, stiffness: 150},
  });

  return (
    <AbsoluteFill>
      <GoldPlate />
      <AbsoluteFill
        style={{
          opacity: fade,
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: brand.fontFamily,
        }}
      >
        <div style={{position: 'relative'}}>
          <LaptopFrame width={1100} height={700}>
            <div style={{position: 'relative', width: '100%', height: '100%'}}>
              <Img
                src={staticFile(ASSETS.screens.S08.posClosingEntry)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
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
                  objectFit: 'contain',
                  opacity: openingOpacity,
                }}
              />
            </div>
          </LaptopFrame>

          <div
            style={{
              position: 'absolute',
              right: 80,
              top: 120,
              transform: `scale(${redStamp}) rotate(-18deg)`,
              opacity: Math.min(1, redStamp) * closingOpacity,
              border: `4px solid ${brand.colors.accent}`,
              color: brand.colors.accent,
              backgroundColor: 'rgba(247,243,235,0.9)',
              fontWeight: 700,
              fontSize: 36,
              padding: '10px 20px',
            }}
          >
            CLOSED
          </div>

          <div
            dir="rtl"
            lang="ar"
            style={{
              position: 'absolute',
              right: 100,
              top: 160,
              transform: `scale(${greenStamp}) rotate(-12deg)`,
              opacity: greenStamp,
              border: '4px solid #2e7d32',
              color: '#2e7d32',
              backgroundColor: 'rgba(247,243,235,0.92)',
              fontWeight: 700,
              fontSize: 34,
              padding: '10px 20px',
            }}
          >
            verified ✓
          </div>
        </div>
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S08;
