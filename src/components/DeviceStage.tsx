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
  /** Scale ≥ 1 for crop/zoom into the meaningful region. */
  scale?: number;
};

type DeviceStageProps = {
  src: string;
  kind?: 'image' | 'video';
  variant?: 'laptop' | 'phone';
  width?: number;
  height?: number;
  /** Perspective tilt in degrees (6–8). */
  tiltDeg?: number;
  crop?: CropFocus;
  /** Delay (frames) before the device enters from the left. */
  enterDelay?: number;
  callout?: {label: string; x: number; y: number; delay?: number; ringSize?: number};
  children?: React.ReactNode;
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
 * Cropped/zoomed screen inside a tilted device frame with gold rim light,
 * long shadow, and a slow push-in. Enters from the left.
 */
export const DeviceStage: React.FC<DeviceStageProps> = ({
  src,
  kind = 'image',
  variant = 'laptop',
  width = 1180,
  height = 720,
  tiltDeg = 7,
  crop = {objectPosition: '50% 40%', scale: 1.35},
  enterDelay = 10,
  callout,
  children,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const enter = interpolate(frame, [enterDelay, enterDelay + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const x = interpolate(enter, [0, 1], [-160, 0]);
  const opacity = enter;
  const push = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [1, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isPhone = variant === 'phone';
  const radius = isPhone ? 36 : 18;
  const inset = isPhone ? 12 : 16;
  const scale = Math.max(1, crop.scale ?? 1.25);

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: crop.objectPosition ?? '50% 40%',
    transform: `scale(${scale * push})`,
    transformOrigin: crop.objectPosition ?? '50% 40%',
  };

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        opacity,
        transform: `translateX(${x}px) perspective(1400px) rotateY(${-tiltDeg}deg) rotateX(2deg)`,
        transformStyle: 'preserve-3d',
        filter: `drop-shadow(28px 40px 60px rgba(0,0,0,0.65)) drop-shadow(0 0 18px ${brand.colors.gold}44)`,
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
      {/* Gold rim light */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: `linear-gradient(120deg, ${brand.colors.gold}55 0%, transparent 28%, transparent 72%, ${brand.colors.gold}33 100%)`,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: inset,
          left: inset,
          right: inset,
          bottom: inset + (isPhone ? 8 : 22),
          borderRadius: isPhone ? 28 : 10,
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
            bottom: 6,
            height: 12,
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
          delay={callout.delay ?? 24}
          ringSize={callout.ringSize ?? 68}
        />
      ) : null}
    </div>
  );
};
