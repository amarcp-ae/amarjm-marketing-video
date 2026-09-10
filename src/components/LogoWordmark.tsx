import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {brand} from '../brand';
import {ensureBrandFont} from '../lib/loadFont';

const MARK_SRC = staticFile('brand/logo-mark.png');

type LogoWordmarkProps = {
  size?: number;
  /** Frame when the shared gold light sweep starts. */
  sweepAt?: number;
  arabic?: boolean;
  /** Large swoosh mark beside the wordmark (S01 / S13). */
  markWidth?: number;
};

/**
 * AMARSoft mark + wordmark with a single shared gold light sweep.
 */
export const LogoWordmark: React.FC<LogoWordmarkProps> = ({
  size = 120,
  sweepAt = 12,
  arabic = true,
  markWidth = 320,
}) => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [sweepAt, sweepAt + 28], [-20, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const markH = Math.round(markWidth * (80 / 98));

  return (
    <div
      style={{
        textAlign: 'center',
        opacity,
        fontFamily: brand.fontFamily,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: Math.round(markWidth * 0.12),
          overflow: 'hidden',
          filter: [
            `drop-shadow(0 10px 24px rgba(0,0,0,0.5))`,
            `drop-shadow(0 0 12px ${brand.colors.gold}44)`,
          ].join(' '),
        }}
      >
        <Img
          src={MARK_SRC}
          style={{
            width: markWidth,
            height: markH,
            objectFit: 'contain',
            flexShrink: 0,
            display: 'block',
          }}
        />
        <div
          style={{
            fontSize: size,
            fontWeight: 700,
            letterSpacing: '0.04em',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              backgroundImage: `linear-gradient(120deg, ${brand.colors.gold} 0%, #f0e0a0 45%, ${brand.colors.gold} 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            AMARSoft
          </span>
        </div>
        {/* One shared specular sweep across mark + text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, transparent ${sweep - 10}%, rgba(247,243,235,0.9) ${sweep}%, transparent ${sweep + 10}%)`,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />
      </div>
      {arabic ? (
        <div
          dir="rtl"
          lang="ar"
          style={{
            marginTop: 16,
            fontSize: size * 0.35,
            fontWeight: 500,
            color: brand.colors.ivory,
          }}
        >
          أمارسوفت
        </div>
      ) : null}
    </div>
  );
};
