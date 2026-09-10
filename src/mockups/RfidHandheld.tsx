import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {brand} from '../brand';

/** S07 RFID handheld reader mock with animating counter → 312/312. */
export const RfidHandheld: React.FC<{phase: 1 | 2}> = ({phase}) => {
  const frame = useCurrentFrame();
  const count = Math.round(
    interpolate(frame, [0, 90], [phase === 1 ? 0 : 156, phase === 1 ? 156 : 312], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const scan = (frame % 40) / 40;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(160deg, #1c1c22, #0c0c10)',
        padding: 36,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: brand.fontFamily,
        color: brand.colors.ivory,
      }}
    >
      <div style={{fontSize: 28, opacity: 0.75, letterSpacing: '0.12em'}}>
        RFID {phase === 1 ? '01' : '02'}
      </div>
      <div
        style={{
          marginTop: 28,
          width: 420,
          height: 420,
          borderRadius: 28,
          background: '#050507',
          border: `1.5px solid ${brand.colors.gold}66`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${scan * 100}%`,
            height: 4,
            background: brand.colors.gold,
            boxShadow: `0 0 16px ${brand.colors.gold}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 56,
            borderRadius: '50%',
            border: `2px dashed ${brand.colors.gold}55`,
          }}
        />
      </div>
      <div style={{marginTop: 40, fontSize: 96, fontWeight: 700, color: brand.colors.gold}}>
        {count}
        <span style={{fontSize: 44, color: brand.colors.ivory}}> / 312</span>
      </div>
      <div dir="rtl" style={{marginTop: 10, fontSize: 32, opacity: 0.9}}>
        قطعة
      </div>
    </div>
  );
};
