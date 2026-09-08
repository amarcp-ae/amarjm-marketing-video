import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {ensureBrandFont} from '../lib/loadFont';

type CalloutProps = {
  label: string;
  x: number;
  y: number;
  ringSize?: number;
  delay?: number;
};

/**
 * Animated highlight ring + RTL label callout.
 */
export const Callout: React.FC<CalloutProps> = ({label, x, y, ringSize = 72, delay = 0}) => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {damping: 14, stiffness: 120},
  });

  const scale = interpolate(progress, [0, 1], [0.4, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const pulse = interpolate(Math.sin(((frame - delay) / fps) * Math.PI * 2), [-1, 1], [0.85, 1.1]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: '50%',
          border: `3px solid ${brand.colors.gold}`,
          boxShadow: `0 0 0 ${6 * pulse}px ${brand.colors.gold}33`,
          transform: `scale(${pulse})`,
        }}
      />
      <div
        dir="rtl"
        lang="ar"
        style={{
          position: 'absolute',
          top: ringSize + 8,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          color: brand.colors.ivory,
          backgroundColor: brand.colors.accent,
          fontFamily: brand.fontFamily,
          fontSize: 22,
          fontWeight: 600,
          padding: '6px 14px',
          borderRadius: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
};
