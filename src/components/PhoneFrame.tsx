import React from 'react';
import {brand} from '../brand';

/** iPhone-class portrait ratio (19.5:9). */
export const PHONE_ASPECT = 19.5 / 9;

/** Max phone width in a 1920×1080 master frame (30%). */
export const PHONE_MAX_WIDTH = Math.round(1920 * 0.3); // 576

/** Reference logical size (CSS px). */
export const PHONE_LOGICAL = {width: 393, height: 852} as const;

export const phoneSize = (width: number): {width: number; height: number} => {
  const w = Math.min(PHONE_MAX_WIDTH, Math.max(1, Math.round(width)));
  return {width: w, height: Math.round(w * PHONE_ASPECT)};
};

type PhoneFrameProps = {
  children?: React.ReactNode;
  /** Outer width — capped at 30% of 1920. Height derived from 19.5:9. */
  width?: number;
  /** Ignored if it breaks 19.5:9 — height is always derived from width. */
  height?: number;
  /** Gold rim + drop shadow (DeviceStage look). */
  showRim?: boolean;
};

/**
 * True phone chrome: 19.5:9, 48px corners, Dynamic Island.
 * Screen content is never stretched — fill + crop/letterbox via overflow hidden.
 */
export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  width = PHONE_LOGICAL.width,
  showRim = true,
}) => {
  const {width: w, height: h} = phoneSize(width);
  const inset = Math.max(10, Math.round(w * 0.028));
  const outerRadius = 48;
  const screenRadius = Math.max(36, outerRadius - inset);
  const islandW = Math.round(w * 0.32);
  const islandH = Math.max(22, Math.round(h * 0.028));
  const islandTop = inset + Math.round(h * 0.012);

  return (
    <div
      style={{
        width: w,
        height: h,
        position: 'relative',
        flexShrink: 0,
        filter: showRim
          ? `drop-shadow(18px 28px 40px rgba(0,0,0,0.55)) drop-shadow(0 0 14px ${brand.colors.gold}33)`
          : 'drop-shadow(0 16px 32px rgba(0,0,0,0.45))',
      }}
    >
      {/* Shell */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: outerRadius,
          background: `linear-gradient(145deg, #1c1c22 0%, ${brand.colors.ink} 55%, #0a0a0c 100%)`,
          border: showRim ? `1.5px solid ${brand.colors.gold}aa` : '1px solid #2a2a30',
          boxShadow: showRim
            ? `inset 0 0 0 1px ${brand.colors.gold}33, 0 0 20px ${brand.colors.gold}22`
            : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      />
      {/* Side buttons hint */}
      <div
        style={{
          position: 'absolute',
          right: -3,
          top: h * 0.22,
          width: 3,
          height: h * 0.08,
          borderRadius: 2,
          background: '#2a2a30',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -3,
          top: h * 0.18,
          width: 3,
          height: h * 0.05,
          borderRadius: 2,
          background: '#2a2a30',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -3,
          top: h * 0.26,
          width: 3,
          height: h * 0.09,
          borderRadius: 2,
          background: '#2a2a30',
        }}
      />

      {/* Screen */}
      <div
        style={{
          position: 'absolute',
          top: inset,
          left: inset,
          right: inset,
          bottom: inset,
          borderRadius: screenRadius,
          overflow: 'hidden',
          backgroundColor: '#050507',
        }}
      >
        {/* Content — fill frame; crop overflow, never stretch aspect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
          }}
        >
          {children}
        </div>

        {/* Dynamic Island */}
        <div
          style={{
            position: 'absolute',
            top: islandTop - inset,
            left: '50%',
            transform: 'translateX(-50%)',
            width: islandW,
            height: islandH,
            borderRadius: islandH,
            background: '#0a0a0a',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: islandH * 0.35,
              top: '50%',
              transform: 'translateY(-50%)',
              width: islandH * 0.42,
              height: islandH * 0.42,
              borderRadius: '50%',
              background: '#151518',
              boxShadow: 'inset 0 0 0 1px #222',
            }}
          />
        </div>
      </div>
    </div>
  );
};
