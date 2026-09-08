import React from 'react';
import {brand} from '../brand';

type PhoneFrameProps = {
  children?: React.ReactNode;
  width?: number;
  height?: number;
};

/**
 * Pure CSS/SVG phone bezel — no image assets.
 */
export const PhoneFrame: React.FC<PhoneFrameProps> = ({children, width = 320, height = 640}) => {
  const inset = 12;
  const notchWidth = width * 0.36;
  const notchHeight = 18;

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.4))',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{position: 'absolute', inset: 0}}
        aria-hidden
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={36}
          fill={brand.colors.ink}
          stroke={brand.colors.gold}
          strokeWidth={2}
        />
        <rect
          x={inset}
          y={inset}
          width={width - inset * 2}
          height={height - inset * 2}
          rx={28}
          fill="#050505"
        />
        <rect
          x={(width - notchWidth) / 2}
          y={inset + 6}
          width={notchWidth}
          height={notchHeight}
          rx={9}
          fill="#111"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: inset + notchHeight + 10,
          left: inset,
          width: width - inset * 2,
          height: height - inset * 2 - notchHeight - 16,
          overflow: 'hidden',
          borderRadius: 24,
        }}
      >
        {children}
      </div>
    </div>
  );
};
