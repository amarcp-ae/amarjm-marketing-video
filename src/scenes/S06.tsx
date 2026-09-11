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
import {PhoneFrame} from '../components/PhoneFrame';
import {SceneCaptions} from '../components/SceneCaptions';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S06';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const STOREFRONT_ITEMS = [
  ASSETS.items.goldBangle22k,
  ASSETS.items.diamondSolitaireRing,
  ASSETS.items.goldRubyRing18k,
  ASSETS.items.diamondStudEarrings,
  ASSETS.items.goldPendantNecklace21k,
  ASSETS.items.roseGoldChain18k,
];

export const S06: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const soldOpacity = interpolate(frame, [Math.round(2.2 * fps), Math.round(2.6 * fps)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const stamp = spring({
    frame: frame - Math.round(2.4 * fps),
    fps,
    config: {damping: 10, stiffness: 160},
  });

  const grid = (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        padding: 20,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        background: `linear-gradient(160deg, ${brand.colors.ivory}, #efe6d4)`,
      }}
    >
      {STOREFRONT_ITEMS.map((item, i) => {
        const isSold = i === 1;
        return (
          <div
            key={item}
            style={{
              position: 'relative',
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: isSold ? soldOpacity : 1,
            }}
          >
            <Img
              src={staticFile(item)}
              style={{width: '100%', height: 110, objectFit: 'contain'}}
            />
            <div
              style={{
                marginTop: 8,
                fontSize: 16,
                fontWeight: 600,
                color: brand.colors.ink,
                fontFamily: brand.fontFamily,
              }}
            >
              AED 4,120
            </div>
            {isSold ? (
              <div
                dir="rtl"
                lang="ar"
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${stamp}) rotate(-12deg)`,
                  opacity: stamp,
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    border: `3px solid ${brand.colors.accent}`,
                    color: brand.colors.accent,
                    fontWeight: 700,
                    fontSize: 28,
                    padding: '6px 14px',
                    backgroundColor: 'rgba(247,243,235,0.85)',
                  }}
                >
                  مباعة
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <AbsoluteFill>
      <GoldPlate />
      <AbsoluteFill
        style={{
          opacity: fade,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 48,
          fontFamily: brand.fontFamily,
        }}
      >
        <LaptopFrame width={900} height={600}>
          {grid}
        </LaptopFrame>
        <PhoneFrame width={300} height={600}>
          <div
            style={{
              width: '100%',
              height: '100%',
              background: brand.colors.ivory,
              padding: 12,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {STOREFRONT_ITEMS.slice(0, 3).map((item) => (
              <div
                key={`m-${item}`}
                style={{
                  flex: 1,
                  background: '#fff',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 8,
                }}
              >
                <Img src={staticFile(item)} style={{width: 56, height: 56, objectFit: 'contain'}} />
                <span style={{fontSize: 14, fontWeight: 600, color: brand.colors.ink}}>
                  AED 4,120
                </span>
              </div>
            ))}
          </div>
        </PhoneFrame>
      </AbsoluteFill>
      <SceneCaptions sceneId={SCENE_ID} />
    </AbsoluteFill>
  );
};

export default S06;
