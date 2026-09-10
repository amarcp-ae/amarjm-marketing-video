import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {DeviceStage} from '../components/DeviceStage';
import {KineticHeadline} from '../components/KineticHeadline';
import {SceneShell} from '../components/SceneShell';
import {ASSETS} from '../lib/assets';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';

const SCENE_ID: SceneId = 'S12';

export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const PROMPT = 'أغلق وردية دبي وأرسل التقرير';

export const S12: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const typeStart = Math.round(0.7 * fps);
  const charsShown = Math.min(PROMPT.length, Math.max(0, Math.floor((frame - typeStart) / 2)));
  const typed = PROMPT.slice(0, charsShown);
  const pulse = 1 + Math.sin(frame / 6) * 0.16;
  const check = spring({
    frame: frame - (typeStart + PROMPT.length * 2 + 8),
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
        <DeviceStage
          src={ASSETS.screens.S12.home}
          width={1180}
          height={720}
          tiltDeg={7}
          crop={{objectPosition: '50% 30%', scale: 1.45}}
          callout={{label: 'صوت', x: 200, y: 520, delay: Math.round(1.1 * fps)}}
        />
        <div
          style={{
            position: 'absolute',
            left: 140,
            bottom: 150,
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: brand.colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 0 ${10 * pulse}px ${brand.colors.gold}33`,
          }}
        >
          <div
            style={{
              width: 18,
              height: 28,
              borderRadius: 9,
              background: brand.colors.ivory,
            }}
          />
        </div>
        <div
          dir="rtl"
          lang="ar"
          style={{
            position: 'absolute',
            bottom: 160,
            left: 230,
            minWidth: 520,
            backgroundColor: 'rgba(247,243,235,0.94)',
            color: brand.colors.ink,
            borderRadius: 999,
            padding: '12px 22px',
            fontSize: 26,
            fontWeight: 500,
            fontFamily: brand.fontFamily,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span>{typed}</span>
          <span
            style={{
              opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
              color: brand.colors.gold,
            }}
          >
            |
          </span>
          <span
            style={{
              marginRight: 'auto',
              transform: `scale(${check})`,
              opacity: check,
              color: '#2e7d32',
              fontWeight: 700,
              fontSize: 28,
            }}
          >
            ✓
          </span>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S12;
