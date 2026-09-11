import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {brand} from '../brand';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S12';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const COMMAND = 'أصدر فاتورة مشتريات للعميل محمد';

/**
 * Voice/text dialog visible from frame 1 (no black), then purchase-invoice slide.
 * Dialog is shown as a large centered plate — not a tiny crop on a dark laptop.
 */
export const S12: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps, durationInFrames: dur} = useVideoConfig();
  const half = Math.floor(dur / 2);

  const wave = 1 + Math.sin(frame / 5) * 0.35;
  const textGlow = interpolate(frame, [Math.round(0.5 * fps), Math.round(1.0 * fps)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const check = spring({
    frame: frame - (half + Math.round(0.35 * fps)),
    fps,
    config: {damping: 12, stiffness: 160},
  });
  // Dialog plate always visible in first half (no enterDelay fade from black).
  const plateIn = interpolate(frame, [0, 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[{text: 'تكلّم'}, {text: 'مع'}, {text: 'نظامك', gold: true}]}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 180}}>
        <Sequence from={0} durationInFrames={half} layout="none">
          <div
            style={{
              position: 'relative',
              width: 1320,
              height: 780,
              opacity: plateIn,
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: `0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px ${brand.colors.gold}55`,
              background: '#1a1a1f',
            }}
          >
            <Img
              src={staticFile(ASSETS.screens.S12.reportDialog)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center',
                background: '#f7f3eb',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 48,
                bottom: 88,
                display: 'flex',
                gap: 4,
                alignItems: 'flex-end',
                height: 40,
              }}
            >
              {[0.4, 0.7, 1, 0.65, 0.9, 0.5].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 40 * h * wave,
                    borderRadius: 3,
                    background: brand.colors.accent,
                  }}
                />
              ))}
              <span
                dir="rtl"
                style={{
                  color: brand.colors.ink,
                  fontFamily: brand.fontFamily,
                  fontSize: 18,
                  fontWeight: 700,
                  marginRight: 10,
                  background: 'rgba(247,243,235,0.92)',
                  padding: '4px 10px',
                  borderRadius: 8,
                }}
              >
                أمر صوتي
              </span>
            </div>
            <div
              dir="rtl"
              lang="ar"
              style={{
                position: 'absolute',
                bottom: 28,
                left: '50%',
                transform: 'translateX(-50%)',
                minWidth: 640,
                backgroundColor: 'rgba(247,243,235,0.98)',
                color: brand.colors.ink,
                borderRadius: 999,
                padding: '14px 28px',
                fontSize: 26,
                fontWeight: 700,
                fontFamily: brand.fontFamily,
                boxShadow: textGlow > 0.5 ? `0 0 0 3px ${brand.colors.gold}` : '0 8px 24px rgba(0,0,0,0.2)',
                textAlign: 'center',
              }}
            >
              {COMMAND}
            </div>
          </div>
        </Sequence>
        <Sequence from={half} durationInFrames={dur - half} layout="none">
          <div
            style={{
              position: 'relative',
              width: 1480,
              height: 780,
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: `0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px ${brand.colors.gold}55`,
              background: '#0b0b0e',
            }}
          >
            <Img
              src={staticFile(
                ASSETS.screens.S12.purchaseInvoice ?? ASSETS.screens.S12.home,
              )}
              style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '48% 30%'}}
            />
            <div
              dir="rtl"
              lang="ar"
              style={{
                position: 'absolute',
                right: 48,
                top: 36,
                transform: `scale(${Math.max(check, 0.01)})`,
                opacity: check,
                border: '3px solid #2e7d32',
                color: '#2e7d32',
                background: 'rgba(247,243,235,0.96)',
                fontWeight: 700,
                fontSize: 32,
                padding: '10px 18px',
                fontFamily: brand.fontFamily,
                borderRadius: 12,
              }}
            >
              ✓ تمّ التنفيذ — فاتورة مشتريات
            </div>
          </div>
        </Sequence>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S12;
