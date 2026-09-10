import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneWords} from '../lib/captionWords';

export type HeadlineToken = {
  text: string;
  gold?: boolean;
};

type KineticHeadlineProps = {
  tokens: HeadlineToken[];
  /** Scene id for VO word-onset sync (optional). */
  sceneId?: string;
  /** Frames before settling to the corner. */
  settleAfterFrames?: number;
};

/**
 * Large RTL Arabic headline: word-by-word with VO, then settles top-right.
 */
export const KineticHeadline: React.FC<KineticHeadlineProps> = ({
  tokens,
  sceneId,
  settleAfterFrames = 48,
}) => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = useMemo(() => (sceneId ? getSceneWords(sceneId) : []), [sceneId]);

  const settle = interpolate(frame, [settleAfterFrames, settleAfterFrames + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fontSize = interpolate(settle, [0, 1], [88, 42]);
  const top = interpolate(settle, [0, 1], [120, 56]);
  const right = interpolate(settle, [0, 1], [120, 64]);
  const maxWidth = interpolate(settle, [0, 1], [1400, 720]);

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        position: 'absolute',
        top,
        right,
        maxWidth,
        zIndex: 40,
        textAlign: 'right',
        fontFamily: brand.fontFamily,
        fontSize,
        fontWeight: 700,
        lineHeight: 1.25,
        color: brand.colors.ivory,
        pointerEvents: 'none',
        textShadow: '0 8px 28px rgba(0,0,0,0.55)',
      }}
    >
      {tokens.map((token, i) => {
        const voStart =
          words[i] && typeof words[i].startSec === 'number'
            ? Math.floor(words[i].startSec * fps)
            : Math.round(i * 5);
        const appear = interpolate(frame, [voStart, voStart + 5], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const y = interpolate(frame, [voStart, voStart + 8], [18, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <span
            key={`${token.text}-${i}`}
            style={{
              display: 'inline-block',
              marginInline: 8,
              opacity: appear,
              transform: `translateY(${y}px)`,
              color: token.gold ? brand.colors.gold : brand.colors.ivory,
            }}
          >
            {token.text}
          </span>
        );
      })}
    </div>
  );
};
