import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

type FloatingItemsProps = {
  items: string[];
  /** Anchor corner / side. */
  side?: 'left' | 'right';
};

/**
 * Item PNGs as depth layers at two sizes with parallax drift.
 */
export const FloatingItems: React.FC<FloatingItemsProps> = ({items, side = 'left'}) => {
  const frame = useCurrentFrame();
  const baseX = side === 'left' ? 48 : 1680;

  return (
    <>
      {items.map((item, i) => {
        const size = i % 2 === 0 ? 160 : 110;
        const depth = 0.4 + (i % 3) * 0.25;
        const drift = Math.sin(frame / (26 + i * 3) + i) * (14 + depth * 10);
        const driftX = Math.cos(frame / (32 + i * 2) + i * 0.7) * (8 + depth * 6);
        const y = 520 + (i % 4) * 70 + drift;
        const x = baseX + (side === 'left' ? i * 56 : -i * 56) + driftX;
        const opacity = interpolate(frame, [12 + i * 6, 24 + i * 6], [0, 0.92], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <Img
            key={`${item}-${i}`}
            src={staticFile(item)}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              objectFit: 'contain',
              opacity,
              filter: `drop-shadow(0 ${10 + depth * 8}px ${18 + depth * 10}px rgba(0,0,0,0.5))`,
              transform: `translateZ(0) rotate(${(i - 1) * 6}deg)`,
              zIndex: 5 + i,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};
