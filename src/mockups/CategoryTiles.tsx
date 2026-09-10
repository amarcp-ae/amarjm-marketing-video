import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {brand} from '../brand';
import {ASSETS} from '../lib/assets';

const TILES: Array<{label: string; item: string | null}> = [
  {label: 'ذهب', item: ASSETS.items.goldBangle22k},
  {label: 'مجوهرات', item: ASSETS.items.goldPendantNecklace21k},
  {label: 'ألماس', item: ASSETS.items.diamondSolitaireRing},
  {label: 'ساعات', item: null},
];

/** S02 — 4 category tiles after the rate ticker. */
export const CategoryTiles: React.FC<{delay?: number}> = ({delay = 40}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 56,
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 22,
        zIndex: 30,
      }}
    >
      {TILES.map((t, i) => {
        const appear = interpolate(frame, [delay + i * 6, delay + i * 6 + 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={t.label}
            style={{
              width: 280,
              height: 240,
              borderRadius: 14,
              background: 'rgba(247,243,235,0.96)',
              border: `1.5px solid ${brand.colors.gold}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: appear,
              transform: `translateY(${(1 - appear) * 24}px)`,
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            }}
          >
            {t.item ? (
              <Img src={staticFile(t.item)} style={{width: 110, height: 110, objectFit: 'contain'}} />
            ) : (
              <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
                <circle
                  cx="36"
                  cy="36"
                  r="28"
                  fill="none"
                  stroke={brand.colors.gold}
                  strokeWidth="3"
                />
                <circle cx="36" cy="36" r="4" fill={brand.colors.ink} />
                <line
                  x1="36"
                  y1="36"
                  x2="36"
                  y2="20"
                  stroke={brand.colors.ink}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="36"
                  y1="36"
                  x2="48"
                  y2="36"
                  stroke={brand.colors.gold}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
            <div
              dir="rtl"
              style={{
                marginTop: 10,
                fontFamily: brand.fontFamily,
                fontSize: 26,
                fontWeight: 700,
                color: brand.colors.ink,
              }}
            >
              {t.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
