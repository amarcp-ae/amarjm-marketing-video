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
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S12';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const COMMAND = 'أصدر فاتورة مشتريات للعميل محمد';

/** Voice/text report dialog → purchase invoice with ✓ تمّ التنفيذ. */
export const S12: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps, durationInFrames: dur} = useVideoConfig();
  const half = Math.floor(dur / 2);

  const wave = 1 + Math.sin(frame / 5) * 0.35;
  const textGlow = interpolate(frame, [Math.round(0.9 * fps), Math.round(1.4 * fps)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const check = spring({
    frame: frame - (half + Math.round(0.5 * fps)),
    fps,
    config: {damping: 12, stiffness: 160},
  });

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'تكلّم'},
          {text: 'مع'},
          {text: 'نظامك', gold: true},
        ]}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 36}}>
        <Sequence from={0} durationInFrames={half} layout="none">
          <div style={{position: 'relative'}}>
            <DeviceStage
              src={ASSETS.screens.S12.reportDialog}
              width={1480}
              height={760}
              tiltDeg={3}
              crop={{objectPosition: '50% 40%', scale: 1.55}}
              callout={{label: 'أمر صوتي', x: 640, y: 420, delay: Math.round(0.5 * fps)}}
            />
            {/* Waveform pulse on voice */}
            <div
              style={{
                position: 'absolute',
                left: 180,
                bottom: 180,
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
              <div
                style={{
                  marginRight: 10,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: brand.colors.accent,
                  boxShadow: `0 0 0 ${6 * wave}px ${brand.colors.accent}33`,
                }}
              />
              <span
                dir="rtl"
                style={{
                  color: brand.colors.ivory,
                  fontFamily: brand.fontFamily,
                  fontSize: 16,
                  marginRight: 8,
                }}
              >
                ٠:٢٢ / ٢:٠٠
              </span>
            </div>
            <div
              dir="rtl"
              lang="ar"
              style={{
                position: 'absolute',
                bottom: 150,
                left: 260,
                minWidth: 520,
                backgroundColor: 'rgba(247,243,235,0.96)',
                color: brand.colors.ink,
                borderRadius: 999,
                padding: '12px 22px',
                fontSize: 22,
                fontWeight: 600,
                fontFamily: brand.fontFamily,
                boxShadow: textGlow > 0.5 ? `0 0 0 3px ${brand.colors.gold}` : undefined,
              }}
            >
              {COMMAND}
            </div>
          </div>
        </Sequence>
        <Sequence from={half} durationInFrames={dur - half} layout="none">
          <div style={{position: 'relative'}}>
            <DeviceStage
              src={ASSETS.screens.S12.home}
              width={1480}
              height={760}
              tiltDeg={3}
              crop={{objectPosition: '48% 35%', scale: 1.35}}
              callout={{label: 'فاتورة مشتريات', x: 700, y: 280, delay: Math.round(0.35 * fps)}}
            />
            <div
              dir="rtl"
              lang="ar"
              style={{
                position: 'absolute',
                right: 120,
                top: 160,
                transform: `scale(${Math.max(check, 0.01)})`,
                opacity: check,
                border: '3px solid #2e7d32',
                color: '#2e7d32',
                background: 'rgba(247,243,235,0.94)',
                fontWeight: 700,
                fontSize: 28,
                padding: '8px 16px',
                fontFamily: brand.fontFamily,
              }}
            >
              ✓ تمّ التنفيذ
            </div>
          </div>
        </Sequence>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S12;
