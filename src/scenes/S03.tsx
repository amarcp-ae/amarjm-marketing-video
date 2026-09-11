import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';
import {MobileDeskForm} from '../mockups/MobileDeskForms';

const SCENE_ID: SceneId = 'S03';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const PHONES = [
  {kind: 'invoice' as const, label: 'فاتورة'},
  {kind: 'payment' as const, label: 'سند'},
  {kind: 'journal' as const, label: 'قيد'},
];

/** Three-phone carousel — invoice / receipt / journal, one per spoken beat. */
export const S03: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps, durationInFrames: dur} = useVideoConfig();
  const seg = Math.max(1, Math.floor(dur / 3));
  const active = Math.min(2, Math.floor(frame / seg));

  return (
    <SceneShell sceneId={SCENE_ID}>
      <KineticHeadline
        sceneId={SCENE_ID}
        tokens={[
          {text: 'حساباتك'},
          {text: 'من'},
          {text: 'جوّالك', gold: true},
        ]}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 36,
          paddingTop: 40,
        }}
      >
        {PHONES.map((p, i) => {
          const focus = i === active;
          const enter = spring({
            frame: frame - (6 + i * 8),
            fps,
            config: {damping: 16, stiffness: 90},
          });
          const scale = focus ? 1 : 0.86;
          const opacity = focus ? 1 : 0.55;
          const y = focus ? 0 : 28;
          return (
            <div
              key={p.kind}
              style={{
                transform: `translateY(${interpolate(enter, [0, 1], [60, y])}px) scale(${interpolate(enter, [0, 1], [0.9, scale])})`,
                opacity: enter * opacity,
                zIndex: focus ? 3 : 1,
              }}
            >
              <DeviceStage
                variant="phone"
                width={focus ? 420 : 360}
                tiltDeg={3}
                enterDelay={0}
                callout={
                  focus
                    ? {
                        label: p.label,
                        x: focus ? 210 : 180,
                        y: 560,
                        delay: Math.round(0.25 * fps),
                      }
                    : undefined
                }
              >
                <MobileDeskForm kind={p.kind} />
              </DeviceStage>
            </div>
          );
        })}
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S03;
