import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {brand} from '../brand';

const FLAGS = [
  {
    code: 'UAE',
    label: 'الإمارات',
    stripes: ['#00732F', '#FFFFFF', '#000000'],
    hoist: '#FF0000',
  },
  {
    code: 'KSA',
    label: 'السعودية',
    stripes: ['#006C35', '#006C35', '#006C35'],
    hoist: null as string | null,
    mark: true,
  },
  {
    code: 'OMN',
    label: 'عُمان',
    stripes: ['#FFFFFF', '#DB161B', '#008000'],
    hoist: '#DB161B',
  },
];

const CHIPS = [
  {id: 'zatca', label: 'ZATCA'},
  {id: 'uae', label: 'UAE eInvoicing'},
  {id: 'omn', label: 'Oman eInvoicing'},
];

const FlagGlyph: React.FC<(typeof FLAGS)[number]> = (f) => (
  <div
    style={{
      width: 96,
      height: 64,
      borderRadius: 6,
      overflow: 'hidden',
      border: `1px solid ${brand.colors.gold}88`,
      display: 'flex',
      boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
    }}
  >
    {f.hoist ? (
      <div style={{width: '28%', height: '100%', background: f.hoist}} />
    ) : null}
    <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      {f.stripes.map((c, i) => (
        <div key={`${f.code}-${i}`} style={{flex: 1, background: c, position: 'relative'}}>
          {f.mark && i === 1 ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              ★
            </div>
          ) : null}
        </div>
      ))}
    </div>
  </div>
);

/** S09 compliance flags + certified chips with drawn checkmarks. */
export const ComplianceBadges: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: 'absolute',
        top: 220,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
        zIndex: 25,
        pointerEvents: 'none',
      }}
    >
      <div style={{display: 'flex', gap: 48}}>
        {FLAGS.map((f, i) => {
          const a = interpolate(frame, [6 + i * 8, 18 + i * 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={f.code}
              style={{
                opacity: a,
                transform: `translateY(${(1 - a) * 16}px)`,
                textAlign: 'center',
              }}
            >
              <FlagGlyph {...f} />
              <div
                dir="rtl"
                style={{
                  marginTop: 10,
                  color: brand.colors.ivory,
                  fontFamily: brand.fontFamily,
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {f.label}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', gap: 18}}>
        {CHIPS.map((c, i) => {
          const a = interpolate(frame, [28 + i * 10, 40 + i * 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const check = interpolate(frame, [40 + i * 10, 52 + i * 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 20px',
                borderRadius: 12,
                background: 'rgba(247,243,235,0.95)',
                border: `1.5px solid ${brand.colors.gold}`,
                opacity: a,
                transform: `scale(${0.9 + a * 0.1})`,
                fontFamily: brand.fontFamily,
                fontWeight: 700,
                fontSize: 22,
                color: brand.colors.ink,
              }}
            >
              <span>{c.label}</span>
              <svg width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="12" fill="#1b5e20" opacity={check} />
                <path
                  d="M8 14 L12 18 L20 10"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={`${check * 24} 24`}
                />
              </svg>
              <span dir="rtl" style={{color: '#1b5e20', fontSize: 22, opacity: check}}>
                معتمد
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
