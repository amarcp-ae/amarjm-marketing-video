import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {brand} from '../brand';

/**
 * Obsidian plate: #0E0E12 with a slow drifting radial gold glow (12%),
 * fine grain ~3%, and an optional gold hairline divider.
 */
export const ObsidianPlate: React.FC<{showHairline?: boolean}> = ({showHairline = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cx = 50 + Math.sin(t * 0.22) * 18;
  const cy = 42 + Math.cos(t * 0.17) * 14;

  return (
    <AbsoluteFill style={{backgroundColor: brand.colors.ink, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 55% at ${cx}% ${cy}%, ${brand.colors.goldGlow} 0%, transparent 62%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.03,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '180px 180px',
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
      {showHairline ? (
        <div
          style={{
            position: 'absolute',
            left: '8%',
            right: '8%',
            top: 48,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${brand.colors.gold}88, transparent)`,
            opacity: 0.55,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
