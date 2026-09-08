import React from 'react';
import {brand} from '../brand';

type LaptopFrameProps = {
  children?: React.ReactNode;
  width?: number;
  height?: number;
};

/**
 * Pure CSS/SVG laptop bezel — no image assets.
 */
export const LaptopFrame: React.FC<LaptopFrameProps> = ({children, width = 960, height = 620}) => {
  const screenInset = 18;
  const baseHeight = 28;
  const lidHeight = height - baseHeight;

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.45))',
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
          height={lidHeight}
          rx={18}
          fill={brand.colors.ink}
          stroke={brand.colors.gold}
          strokeWidth={2}
        />
        <rect
          x={screenInset}
          y={screenInset}
          width={width - screenInset * 2}
          height={lidHeight - screenInset * 2 - 8}
          rx={8}
          fill="#0a0a0a"
        />
        <rect
          x={width * 0.18}
          y={lidHeight}
          width={width * 0.64}
          height={baseHeight}
          rx={4}
          fill="#2a2a2a"
        />
        <rect
          x={width * 0.08}
          y={lidHeight + baseHeight - 6}
          width={width * 0.84}
          height={6}
          rx={2}
          fill="#1f1f1f"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: screenInset,
          left: screenInset,
          width: width - screenInset * 2,
          height: lidHeight - screenInset * 2 - 8,
          overflow: 'hidden',
          borderRadius: 8,
        }}
      >
        {children}
      </div>
    </div>
  );
};
