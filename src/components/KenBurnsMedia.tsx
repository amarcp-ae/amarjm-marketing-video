import React from 'react';
import {Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

type KenBurnsMediaProps = {
  /** Relative path under publicDir, or an already-resolved staticFile URL. */
  src: string;
  kind: 'image' | 'video';
  style?: React.CSSProperties;
};

const resolveSrc = (src: string): string => {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  if (src.startsWith('/')) {
    return src;
  }
  return staticFile(src);
};

/**
 * Slow Ken Burns zoom (1 → 1.04) over the scene duration. Never stretches — objectFit contain.
 */
export const KenBurnsMedia: React.FC<KenBurnsMediaProps> = ({src, kind, style}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const scale = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [1, 1.04], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const resolved = resolveSrc(src);
  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    ...style,
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      {kind === 'video' ? (
        <OffthreadVideo src={resolved} style={mediaStyle} muted />
      ) : (
        <Img src={resolved} style={mediaStyle} />
      )}
    </div>
  );
};
