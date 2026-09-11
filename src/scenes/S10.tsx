import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S10';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

export const S10: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const keyPress = spring({
    frame: frame - Math.round(1.1 * fps),
    fps,
    config: {damping: 12, stiffness: 180},
  });
  const fly = spring({
    frame: frame - Math.round(2 * fps),
    fps,
    config: {damping: 14, stiffness: 90},
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
        <DeviceStage
          src={ASSETS.screens.S10.supportDialog}
          width={1180}
          height={720}
          tiltDeg={7}
          crop={{objectPosition: '50% 35%', scale: 1.5}}
          callout={{label: 'الدعم', x: 640, y: 280, delay: Math.round(0.9 * fps)}}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 110,
            left: 140,
            display: 'flex',
            gap: 10,
          }}
        >
          {['Alt', '0'].map((label, i) => (
            <div
              key={label}
              style={{
                minWidth: 60,
                height: 60,
                borderRadius: 8,
                backgroundColor: '#1a1a20',
                border: `1.5px solid ${brand.colors.gold}`,
                color: brand.colors.ivory,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 700,
                transform: `translateY(${i === 1 ? interpolate(keyPress, [0, 1], [0, 6]) : 0}px)`,
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 100,
            bottom: 130,
            padding: '12px 18px',
            backgroundColor: brand.colors.ivory,
            color: brand.colors.ink,
            borderRadius: 10,
            fontFamily: brand.fontFamily,
            fontWeight: 700,
            fontSize: 22,
            transform: `translate(${interpolate(fly, [0, 1], [80, 0])}px, ${interpolate(fly, [0, 1], [-40, 0])}px) scale(${fly})`,
            opacity: fly,
            border: `2px solid ${brand.colors.gold}`,
          }}
        >
          Support Ticket
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S10;
