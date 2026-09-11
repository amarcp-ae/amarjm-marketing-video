import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';

const MARK_SRC = staticFile('brand/logo-mark.png');

type BrandMarkProps = {
  width: number;
  /** Continuous gentle Y-axis turn (±14° / 6s ease-in-out). */
  turn?: boolean;
  /** Diagonal specular shine period in seconds (0 = off). */
  shineEverySec?: number;
  /** Shine duration in ms. */
  shineMs?: number;
  opacity?: number;
  style?: React.CSSProperties;
};

/** Smoothstep 0→1. */
const easeInOut = (t: number) => t * t * (3 - 2 * t);

/**
 * AMARSoft swoosh mark (coral→purple). Optional continuous Y-turn + specular shine.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({
  width,
  turn = false,
  shineEverySec = 0,
  shineMs = 350,
  opacity = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const height = Math.round(width * (80 / 98));

  let rotateY = 0;
  if (turn) {
    const loopSec = 6;
    const u = (frame / fps) % loopSec;
    const half = loopSec / 2;
    if (u < half) {
      rotateY = interpolate(easeInOut(u / half), [0, 1], [-14, 14]);
    } else {
      rotateY = interpolate(easeInOut((u - half) / half), [0, 1], [14, -14]);
    }
  }

  const shinePeriod = shineEverySec > 0 ? Math.round(shineEverySec * fps) : 0;
  const shineDur = Math.max(1, Math.round((shineMs / 1000) * fps));
  const local = shinePeriod > 0 ? frame % shinePeriod : 0;
  const shining = shinePeriod > 0 && local < shineDur;
  const shinePos = shining
    ? interpolate(local, [0, shineDur], [-30, 130], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : -40;

  return (
    <div
      style={{
        width,
        height,
        opacity,
        perspective: 600,
        perspectiveOrigin: '50% 50%',
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: turn ? `rotateY(${rotateY}deg)` : undefined,
          filter: [
            'drop-shadow(0 8px 18px rgba(0,0,0,0.55))',
            `drop-shadow(0 0 10px ${brand.colors.gold}55)`,
            `drop-shadow(0 0 2px ${brand.colors.gold}88)`,
          ].join(' '),
        }}
      >
        <Img
          src={MARK_SRC}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
        {shinePeriod > 0 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 4,
              pointerEvents: 'none',
              opacity: shining ? 1 : 0,
              background: `linear-gradient(125deg, transparent ${shinePos - 14}%, rgba(255,255,255,0.75) ${shinePos}%, transparent ${shinePos + 14}%)`,
              mixBlendMode: 'screen',
              WebkitMaskImage: `url(${MARK_SRC})`,
              maskImage: `url(${MARK_SRC})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
