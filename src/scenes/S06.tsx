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
import {DeviceStage} from '../components/DeviceStage';
import {FloatingItems} from '../components/FloatingItems';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S06';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const STOREFRONT = [
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
        gap: 14,
        padding: 18,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        background: `linear-gradient(160deg, ${brand.colors.ivory}, #efe6d4)`,
      }}
    >
      {STOREFRONT.map((item, i) => {
        const isSold = i === 1;
        return (
          <div
            key={item}
            style={{
              position: 'relative',
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: isSold ? soldOpacity : 1,
            }}
          >
            <Img src={staticFile(item)} style={{width: '100%', height: 100, objectFit: 'contain'}} />
            <div style={{marginTop: 6, fontSize: 14, fontWeight: 600, color: brand.colors.ink}}>
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
                }}
              >
                <span
                  style={{
                    border: `3px solid ${brand.colors.accent}`,
                    color: brand.colors.accent,
                    fontWeight: 700,
                    fontSize: 26,
                    padding: '4px 12px',
                    backgroundColor: 'rgba(247,243,235,0.9)',
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
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'متجرك…'},
          {text: 'مرتبطٌ', gold: true},
          {text: 'بمخزونك'},
        ]}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 40,
          paddingTop: 40,
        }}
      >
        <DeviceStage
          src=""
          width={980}
          height={640}
          tiltDeg={7}
          enterDelay={8}
          callout={{label: 'المتجر', x: 500, y: 260, delay: Math.round(1.4 * fps)}}
        >
          {grid}
        </DeviceStage>
        <DeviceStage
          src=""
          variant="phone"
          width={300}
          height={600}
          tiltDeg={6}
          enterDelay={14}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: brand.colors.ivory,
              padding: 10,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {STOREFRONT.slice(0, 3).map((item) => (
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
                <Img src={staticFile(item)} style={{width: 52, height: 52, objectFit: 'contain'}} />
                <span style={{fontSize: 13, fontWeight: 600, color: brand.colors.ink}}>AED 4,120</span>
              </div>
            ))}
          </div>
        </DeviceStage>
      </AbsoluteFill>
      <FloatingItems
        items={[ASSETS.items.diamondTennisBracelet, ASSETS.items.goldDropEarrings18k]}
        side="right"
      />
    </SceneShell>
  );
};

export default S06;
