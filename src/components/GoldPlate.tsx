import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {brand} from '../brand';

const PARTICLES = Array.from({length: 20}, (_, i) => {
  const seed = (i + 1) * 17.13;
  return {
    left: ((seed * 37) % 100),
    top: ((seed * 53) % 100),
    size: 3 + ((seed * 11) % 7),
    opacity: 0.15 + ((seed * 7) % 21) / 100,
    speed: 0.35 + ((seed * 3) % 10) / 20,
    phase: seed,
  };
});

/**
 * Deep ink → warm gold atmospheric plate with drifting particle dots.
 * Used as a b-roll fallback when no plate footage exists.
 */
export const GoldPlate: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, ${brand.colors.ink} 0%, #2a2110 42%, ${brand.colors.gold} 100%)`,
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 70% 20%, rgba(201,162,39,0.35) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(26,26,26,0.55) 0%, transparent 50%)',
        }}
      />
      {PARTICLES.map((p, i) => {
        const driftX = Math.sin((frame / 40) * p.speed + p.phase) * 18;
        const driftY = Math.cos((frame / 50) * p.speed + p.phase * 0.7) * 14;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: brand.colors.ivory,
              opacity: p.opacity,
              transform: `translate(${driftX}px, ${driftY}px)`,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
