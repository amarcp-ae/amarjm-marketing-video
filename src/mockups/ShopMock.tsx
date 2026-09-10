import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {ASSETS} from '../lib/assets';

const ITEMS = [
  ASSETS.items.goldBangle22k,
  ASSETS.items.diamondSolitaireRing,
  ASSETS.items.goldRubyRing18k,
  ASSETS.items.diamondStudEarrings,
  ASSETS.items.goldPendantNecklace21k,
  ASSETS.items.roseGoldChain18k,
];

type ShopMockProps = {
  variant: 'shop-01' | 'shop-02' | 'shop-03';
};

/** S06 shop mockups: storefront / wallet / loyalty phone. */
export const ShopMock: React.FC<ShopMockProps> = ({variant}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  if (variant === 'shop-03') {
    const wallet = Math.round(interpolate(frame, [10, 80], [0, 12840], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
    const points = Math.round(interpolate(frame, [20, 90], [0, 2450], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
    const pulse = 1 + Math.sin(frame / 8) * 0.08;
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(160deg, ${brand.colors.ivory}, #efe6d4)`,
          padding: 18,
          boxSizing: 'border-box',
          fontFamily: brand.fontFamily,
          color: brand.colors.ink,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{fontSize: 22, fontWeight: 700, color: brand.colors.gold}}>المحفظة</div>
        <div style={{fontSize: 44, fontWeight: 700}}>{wallet.toLocaleString()} <span style={{fontSize: 22}}>AED</span></div>
        <div style={{fontSize: 24, opacity: 0.8}}>نقاط الولاء: <span style={{color: brand.colors.accent, fontWeight: 700}}>{points}</span></div>
        <div style={{display: 'flex', gap: 10, marginTop: 12}}>
          {['اشترِ', 'بِع'].map((label) => (
            <div
              key={label}
              dir="rtl"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '14px 0',
                borderRadius: 10,
                background: brand.colors.ink,
                color: brand.colors.gold,
                fontWeight: 700,
                fontSize: 24,
                transform: `scale(${pulse})`,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const soldOpacity = interpolate(frame, [Math.round(2.2 * fps), Math.round(2.6 * fps)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const stamp = spring({
    frame: frame - Math.round(2.4 * fps),
    fps,
    config: {damping: 10, stiffness: 160},
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        padding: 16,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        background: `linear-gradient(160deg, ${brand.colors.ivory}, #efe6d4)`,
      }}
    >
      {ITEMS.map((item, i) => {
        const isSold = i === 1 && variant === 'shop-02';
        return (
          <div
            key={`${variant}-${item}`}
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: 8,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: isSold ? soldOpacity : 1,
            }}
          >
            <Img src={staticFile(item)} style={{width: '100%', height: 140, objectFit: 'contain'}} />
            <div style={{marginTop: 8, fontSize: 22, fontWeight: 600, color: brand.colors.ink}}>AED 4,120</div>
            {isSold ? (
              <div
                dir="rtl"
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${stamp}) rotate(-12deg)`,
                  opacity: stamp,
                }}
              >
                <span
                  style={{
                    border: `3px solid ${brand.colors.accent}`,
                    color: brand.colors.accent,
                    fontWeight: 700,
                    fontSize: 22,
                    padding: '4px 10px',
                    background: 'rgba(247,243,235,0.9)',
                  }}
                >
                  مباعة
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
