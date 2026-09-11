import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {brand} from '../brand';
import {ensureBrandFont} from '../lib/loadFont';

type LogoWordmarkProps = {
  size?: number;
  /** Frame when the gold light sweep starts. */
  sweepAt?: number;
  arabic?: boolean;
};

/**
 * AMARSoft wordmark with a single gold light sweep.
 */
export const LogoWordmark: React.FC<LogoWordmarkProps> = ({
  size = 120,
  sweepAt = 12,
  arabic = true,
}) => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [sweepAt, sweepAt + 28], [-40, 140], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
          display: 'inline-block',
          fontSize: size,
          fontWeight: 700,
          letterSpacing: '0.04em',
          lineHeight: 1.1,
          color: brand.colors.gold,
          overflow: 'hidden',
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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, transparent ${sweep - 12}%, rgba(247,243,235,0.85) ${sweep}%, transparent ${sweep + 12}%)`,
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
