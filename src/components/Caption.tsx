import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Legacy caption slot. Scene-level captions are handled by `SceneCaptions`.
 * Kept as a no-op AbsoluteFill so `Video.tsx` continues to compile until updated.
 */
export const Caption: React.FC = () => {
  return <AbsoluteFill style={{pointerEvents: 'none'}} />;
};

export default Caption;
