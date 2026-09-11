import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {brand} from '../brand';

const FLAGS = [
  {code: 'ae', label: 'الإمارات', file: 'flags/ae.png'},
  {code: 'sa', label: 'السعودية', file: 'flags/sa.png'},
  {code: 'om', label: 'عُمان', file: 'flags/om.png'},
] as const;

const CHIPS = [
  {id: 'zatca', label: 'ZATCA'},
  {id: 'uae', label: 'UAE eInvoicing'},
  {id: 'omn', label: 'Oman eInvoicing'},
];

/** Official flag-icons SVGs (sa = green field + white shahada + sword, hilt right). */
const FlagGlyph: React.FC<{file: string; code: string}> = ({file, code}) => (
  <div
    style={{
      width: 140,
      height: 93,
      borderRadius: 6,
      overflow: 'hidden',
      border: `1px solid ${brand.colors.gold}88`,
      boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
      background: code === 'sa' ? '#006c35' : '#0a0a0a',
    }}
  >
    <Img
      src={staticFile(file)}
      style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
    />
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
              <FlagGlyph file={f.file} code={f.code} />
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
                ✓ معتمد
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
