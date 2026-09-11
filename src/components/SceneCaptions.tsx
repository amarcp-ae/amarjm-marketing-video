import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneWords, type CaptionWord} from '../lib/captionWords';

type SceneCaptionsProps = {
  sceneId: string;
};

const WINDOW_SIZE = 8;

/**
 * Word-level RTL captions: rolling ~8-word window, max 2 lines, ivory pill.
 */
export const SceneCaptions: React.FC<SceneCaptionsProps> = ({sceneId}) => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = getSceneWords(sceneId);

  if (!words.length) {
    return null;
  }

  const currentSec = frame / fps;
  const visible = words.filter((w) => frame >= Math.floor(w.startSec * fps));
  if (!visible.length) {
    return null;
  }

  const windowWords: CaptionWord[] = visible.slice(-WINDOW_SIZE);
  const mid = Math.ceil(windowWords.length / 2);
  const line1 = windowWords.slice(0, mid);
  const line2 = windowWords.slice(mid);

  const renderWord = (w: CaptionWord, key: string) => {
    const startFrame = Math.floor(w.startSec * fps);
    const opacity = interpolate(frame, [startFrame, startFrame + 4], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const isCurrent = currentSec >= w.startSec && currentSec <= w.endSec;
    return (
      <span
        key={key}
        style={{
          opacity,
          fontWeight: isCurrent ? 700 : 500,
          marginInline: 6,
          display: 'inline-block',
        }}
      >
        {w.word}
      </span>
    );
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 56,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <div
        dir="rtl"
        lang="ar"
        style={{
          maxWidth: '78%',
          backgroundColor: 'rgba(247,243,235,0.7)',
          color: brand.colors.ink,
          fontFamily: brand.fontFamily,
          fontSize: 44,
          fontWeight: 500,
          lineHeight: 1.45,
          padding: '14px 32px',
          borderRadius: 999,
          textAlign: 'center',
        }}
      >
        <div>{line1.map((w, i) => renderWord(w, `l1-${i}-${w.word}`))}</div>
        {line2.length > 0 ? (
          <div>{line2.map((w, i) => renderWord(w, `l2-${i}-${w.word}`))}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
