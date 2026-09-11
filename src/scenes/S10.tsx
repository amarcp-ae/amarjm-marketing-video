import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
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

const SCENE_ID: SceneId = 'S10';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

/** Report dialog with Screenshot → collapses to ticket #1042 · مفتوحة. */
export const S10: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps, durationInFrames: dur} = useVideoConfig();
  const collapseAt = Math.round(dur * 0.55);
  const dialogOut = interpolate(frame, [collapseAt - 8, collapseAt + 8], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ticketIn = spring({
    frame: frame - collapseAt,
    fps,
    config: {damping: 14, stiffness: 110},
  });
  const toast = spring({
    frame: frame - (collapseAt + Math.round(0.35 * fps)),
    fps,
    config: {damping: 14, stiffness: 120},
  });

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'الخطأ', gold: true},
          {text: 'يصل'},
          {text: 'قبل'},
          {text: 'الشكوى'},
        ]}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 36}}>
        <div
          style={{
            opacity: dialogOut,
            transform: `scale(${0.92 + dialogOut * 0.08})`,
          }}
        >
          <DeviceStage
            src={ASSETS.screens.S10.reportDialog}
            width={1480}
            height={760}
            tiltDeg={3}
            crop={{objectPosition: '50% 40%', scale: 1.55}}
            callout={{label: 'لقطة الشاشة', x: 520, y: 420, delay: Math.round(0.7 * fps)}}
          />
        </div>
        <div
          dir="rtl"
          lang="ar"
          style={{
            position: 'absolute',
            right: 120,
            bottom: 160,
            padding: '16px 22px',
            backgroundColor: brand.colors.ivory,
            color: brand.colors.ink,
            borderRadius: 12,
            fontFamily: brand.fontFamily,
            fontWeight: 700,
            fontSize: 24,
            transform: `translate(${interpolate(ticketIn, [0, 1], [80, 0])}px, ${interpolate(ticketIn, [0, 1], [-40, 0])}px) scale(${Math.max(ticketIn, 0.01)})`,
            opacity: ticketIn,
            border: `2px solid ${brand.colors.gold}`,
            boxShadow: '0 16px 36px rgba(0,0,0,0.35)',
          }}
        >
          #1042 · مفتوحة
        </div>
        <div
          dir="rtl"
          lang="ar"
          style={{
            position: 'absolute',
            left: 100,
            bottom: 140,
            padding: '12px 18px',
            background: 'rgba(14,14,18,0.92)',
            color: brand.colors.ivory,
            borderRadius: 10,
            fontFamily: brand.fontFamily,
            fontSize: 18,
            opacity: toast,
            transform: `translateY(${(1 - toast) * 20}px)`,
            border: `1px solid ${brand.colors.gold}`,
          }}
        >
          وصل بلاغ جديد من الفرع
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S10;
