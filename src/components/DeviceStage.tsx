import React from 'react';
import {
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {brand} from '../brand';
import {Callout} from './Callout';

type CropFocus = {
  /** CSS object-position, e.g. "55% 40%" */
  objectPosition?: string;
  /** Scale ≥ 1 for crop/zoom into the meaningful region. Never < 1. */
  scale?: number;
};

type DeviceStageProps = {
  src?: string;
  kind?: 'image' | 'video';
  variant?: 'laptop' | 'phone';
  /** Defaults to ≥70% of 1920 frame width. */
  width?: number;
  height?: number;
  /** Perspective tilt — v3 default 3°. */
  tiltDeg?: number;
  crop?: CropFocus;
  enterDelay?: number;
  callout?: {label: string; x: number; y: number; delay?: number; ringSize?: number};
  children?: React.ReactNode;
};

const FRAME_W = 1920;
const MIN_WIDTH = Math.round(FRAME_W * 0.7); // 1344

const resolveSrc = (src: string): string => {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  if (src.startsWith('/')) return src;
  return staticFile(src);
};

/**
 * Large cropped screen (≥70% frame width), 3° tilt, gold rim.
 * Never downscales media below 1:1 (object-fit cover + scale ≥ 1).
 */
export const DeviceStage: React.FC<DeviceStageProps> = ({
  src = '',
  kind = 'image',
  variant = 'laptop',
  width = MIN_WIDTH,
  height = 780,
  tiltDeg = 3,
  crop = {objectPosition: '50% 40%', scale: 1.5},
  enterDelay = 8,
  callout,
  children,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const isPhone = variant === 'phone';
  // Default prop is already ≥70% frame width; honor explicit smaller widths for multi-device layouts.
  const w = width;
  const enter = interpolate(frame, [enterDelay, enterDelay + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const x = interpolate(enter, [0, 1], [-80, 0]);
  const opacity = enter;
  const push = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [1, 1.04], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const radius = isPhone ? 40 : 16;
  const inset = isPhone ? 14 : 14;
  const scale = Math.max(1, crop.scale ?? 1.5);

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: crop.objectPosition ?? '50% 40%',
    transform: `scale(${scale * push})`,
    transformOrigin: crop.objectPosition ?? '50% 40%',
    imageRendering: 'auto',
  };

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height,
        opacity,
        transform: `translateX(${x}px) perspective(1600px) rotateY(${-tiltDeg}deg)`,
        transformStyle: 'preserve-3d',
        filter: `drop-shadow(24px 36px 50px rgba(0,0,0,0.6)) drop-shadow(0 0 16px ${brand.colors.gold}33)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: `linear-gradient(145deg, #1a1a1f 0%, ${brand.colors.ink} 55%, #121216 100%)`,
          border: `1.5px solid ${brand.colors.gold}aa`,
          boxShadow: `inset 0 0 0 1px ${brand.colors.gold}33, 0 0 24px ${brand.colors.gold}22`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: `linear-gradient(120deg, ${brand.colors.gold}55 0%, transparent 28%, transparent 72%, ${brand.colors.gold}33 100%)`,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          opacity: 0.45,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: inset,
          left: inset,
          right: inset,
          bottom: inset + (isPhone ? 8 : 18),
          borderRadius: isPhone ? 28 : 8,
          overflow: 'hidden',
          backgroundColor: '#050507',
        }}
      >
        {children ? (
          children
        ) : kind === 'video' ? (
          <OffthreadVideo src={resolveSrc(src)} style={mediaStyle} muted />
        ) : (
          <Img src={resolveSrc(src)} style={mediaStyle} />
        )}
      </div>
      {!isPhone ? (
        <div
          style={{
            position: 'absolute',
            left: '18%',
            right: '18%',
            bottom: 5,
            height: 10,
            borderRadius: 4,
            background: '#1c1c22',
            borderTop: `1px solid ${brand.colors.gold}55`,
          }}
        />
      ) : null}
      {callout ? (
        <Callout
          label={callout.label}
          x={callout.x}
          y={callout.y}
          delay={callout.delay ?? 20}
          ringSize={callout.ringSize ?? 64}
        />
      ) : null}
    </div>
  );
};

export const DEVICE_MIN_WIDTH = MIN_WIDTH;
