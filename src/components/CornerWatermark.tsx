import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BrandMark} from './BrandMark';

const MARK_W = 96;
const MARGIN = 24;

/**
 * Persistent bottom-left brand watermark (skip S01 / S13).
 * Captions stay bottom-center — mark sits clear of the caption pill.
 */
export const CornerWatermark: React.FC = () => {
  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 40}}>
      <div
        style={{
          position: 'absolute',
          left: MARGIN,
          bottom: MARGIN,
          // Keep clear of centered caption pill (max ~78% width)
          maxWidth: MARK_W,
        }}
      >
        <BrandMark width={MARK_W} turn shineEverySec={5} shineMs={350} opacity={0.85} />
      </div>
    </AbsoluteFill>
  );
};
