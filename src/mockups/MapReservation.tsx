import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {brand} from '../brand';

/** S05 — large UAE→Oman map with pulsing dots, drawing arrow, reservation card. */
export const MapReservation: React.FC = () => {
  const frame = useCurrentFrame();
  const arrow = interpolate(frame, [20, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const card = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pulse = 1 + Math.sin(frame / 10) * 0.12;

  return (
    <div
      style={{
        position: 'relative',
        width: 1400,
        height: 780,
        borderRadius: 18,
        background: `radial-gradient(ellipse at 40% 45%, ${brand.colors.gold}22 0%, #121218 55%, #0a0a0e 100%)`,
        border: `1.5px solid ${brand.colors.gold}88`,
        overflow: 'hidden',
        boxShadow: `0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px ${brand.colors.gold}33`,
      }}
    >
      <svg width="1400" height="780" style={{position: 'absolute', inset: 0}}>
        {/* Simplified peninsula shapes */}
        <ellipse cx="520" cy="360" rx="160" ry="200" fill={`${brand.colors.gold}18`} stroke={brand.colors.gold} strokeWidth="2" />
        <ellipse cx="860" cy="480" rx="120" ry="140" fill={`${brand.colors.gold}14`} stroke={brand.colors.gold} strokeWidth="2" />
        <text x="520" y="250" textAnchor="middle" fill={brand.colors.ivory} fontSize="28" fontFamily={brand.fontFamily}>
          UAE
        </text>
        <text x="860" y="420" textAnchor="middle" fill={brand.colors.ivory} fontSize="28" fontFamily={brand.fontFamily}>
          Oman
        </text>
        {/* Dots */}
        <circle cx="560" cy="340" r={14 * pulse} fill={brand.colors.gold} />
        <circle cx="820" cy="500" r={14 * pulse} fill={brand.colors.gold} />
        {/* Arrow */}
        <defs>
          <marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={brand.colors.gold} />
          </marker>
        </defs>
        <path
          d={`M580 360 Q700 400 800 480`}
          fill="none"
          stroke={brand.colors.gold}
          strokeWidth="4"
          strokeDasharray={`${arrow * 320} 320`}
          markerEnd="url(#arr)"
        />
      </svg>

      <div
        dir="rtl"
        lang="ar"
        style={{
          position: 'absolute',
          right: 48,
          bottom: 48,
          width: 360,
          padding: '22px 26px',
          background: brand.colors.ivory,
          color: brand.colors.ink,
          borderRadius: 14,
          border: `2px solid ${brand.colors.accent}`,
          opacity: card,
          transform: `translateY(${(1 - card) * 30}px)`,
          fontFamily: brand.fontFamily,
          boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{fontSize: 22, fontWeight: 700, color: brand.colors.accent, marginBottom: 8}}>
          محجوزة
        </div>
        <div style={{fontSize: 28, fontWeight: 600}}>دبي → مسقط</div>
        <div style={{marginTop: 8, fontSize: 20, opacity: 0.75}}>قطعة ٢٢ قيراط · جاهزة للشحن</div>
      </div>
    </div>
  );
};
