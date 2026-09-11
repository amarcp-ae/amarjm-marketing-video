import React from 'react';
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {brand} from '../brand';
import {ASSETS} from '../lib/assets';

const FlagImg: React.FC<{code: 'ae' | 'om' | 'sa'; size?: number}> = ({code, size = 18}) => (
  <Img
    src={staticFile(`flags/${code}.png`)}
    style={{width: size * 1.5, height: size, objectFit: 'cover', borderRadius: 2}}
  />
);

/** S05 — peninsula map, Dubai→Muscat, FX strip, reservation → transfer order. */
export const MapReservation: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const seg = Math.max(1, Math.floor(durationInFrames / 3));
  const phase = Math.min(2, Math.floor(frame / seg));
  const local = frame - phase * seg;

  const arrowT = spring({frame: frame - 8, fps, config: {damping: 14, stiffness: 80}});
  const bangleX = interpolate(arrowT, [0, 1], [560, 820]);
  const bangleY = interpolate(arrowT, [0, 1], [340, 500]);
  const fxPulse = 1 + Math.sin(frame / 7) * 0.04;

  const countdown = Math.max(0, 24 * 3600 - Math.floor(frame * 2));
  const hh = String(Math.floor(countdown / 3600)).padStart(2, '0');
  const mm = String(Math.floor((countdown % 3600) / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');
  const done = phase >= 2 && local > Math.round(0.45 * fps);
  const chip = spring({
    frame: local - Math.round(0.55 * fps),
    fps,
    config: {damping: 12, stiffness: 140},
  });

  const leftCard =
    phase === 0
      ? 1
      : interpolate(frame, [seg - 6, seg + 4], [1, 0.55], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
  const rightCard =
    phase >= 1 ? spring({frame: local, fps, config: {damping: 14, stiffness: 100}}) : 0;

  const fxLines = [
    {a: '٤٬٢٥٠ د.إ', b: 'المبلغ'},
    {a: '١ د.إ = ٠٫١٠٤٧ ر.ع', b: 'سعر الصرف'},
    {a: '٤٤٥٫٠ ر.ع', b: 'بعد التحويل'},
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: 1680,
        height: 820,
        borderRadius: 18,
        background: `radial-gradient(ellipse at 42% 48%, ${brand.colors.gold}20 0%, #121218 55%, #0a0a0e 100%)`,
        border: `1.5px solid ${brand.colors.gold}88`,
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
        fontFamily: brand.fontFamily,
      }}
    >
      <svg width="1680" height="820" style={{position: 'absolute', inset: 0}}>
        <path
          d="M480 180 C560 140, 700 150, 760 220 C820 290, 840 380, 800 470 C760 560, 680 620, 600 640 C520 660, 430 620, 390 540 C350 460, 360 320, 420 240 C440 210, 460 190, 480 180 Z"
          fill={`${brand.colors.gold}14`}
          stroke={brand.colors.gold}
          strokeWidth="2.5"
        />
        <path
          d="M760 420 C820 400, 900 430, 940 490 C980 550, 970 620, 910 660 C850 700, 760 690, 720 640 C680 590, 700 460, 760 420 Z"
          fill={`${brand.colors.gold}10`}
          stroke={brand.colors.gold}
          strokeWidth="2"
        />
        <circle cx="560" cy="340" r="10" fill={brand.colors.gold} />
        <circle
          cx="560"
          cy="340"
          r="18"
          fill="none"
          stroke={brand.colors.gold}
          strokeWidth="1.5"
          opacity={0.5}
        />
        <text
          x="560"
          y="310"
          textAnchor="middle"
          fill={brand.colors.ivory}
          fontSize="22"
          fontFamily={brand.fontFamily}
          fontWeight="700"
        >
          دبي
        </text>
        <circle cx="820" cy="500" r="10" fill={brand.colors.gold} />
        <circle
          cx="820"
          cy="500"
          r="18"
          fill="none"
          stroke={brand.colors.gold}
          strokeWidth="1.5"
          opacity={0.5}
        />
        <text
          x="820"
          y="470"
          textAnchor="middle"
          fill={brand.colors.ivory}
          fontSize="22"
          fontFamily={brand.fontFamily}
          fontWeight="700"
        >
          مسقط
        </text>
        <defs>
          <marker id="arrS05" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={brand.colors.gold} />
          </marker>
        </defs>
        <path
          d="M580 360 Q700 400 800 480"
          fill="none"
          stroke={brand.colors.gold}
          strokeWidth="4"
          strokeDasharray={`${arrowT * 340} 340`}
          markerEnd="url(#arrS05)"
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: bangleX - 36,
          top: bangleY - 36,
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(247,243,235,0.95)',
          border: `2px solid ${brand.colors.gold}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
        }}
      >
        <Img
          src={staticFile(ASSETS.items.goldBangle22k)}
          style={{width: 58, height: 58, objectFit: 'contain'}}
        />
      </div>

      <div
        dir="rtl"
        lang="ar"
        style={{
          position: 'absolute',
          left: 36,
          top: 48,
          width: 340,
          padding: '18px 20px',
          background: brand.colors.ivory,
          color: brand.colors.ink,
          borderRadius: 14,
          border: `2px solid ${brand.colors.gold}`,
          opacity: leftCard,
          transform: `translateY(${(1 - leftCard) * 16}px)`,
          boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{fontSize: 15, color: brand.colors.gold, fontWeight: 700, marginBottom: 6}}>
          المتاح في دبي
        </div>
        <div style={{fontSize: 22, fontWeight: 700, lineHeight: 1.35}}>
          سوار ذهب ٢٢K · ٣٢٫٤٠ غ · دبي · متاح
        </div>
      </div>

      <div
        dir="rtl"
        lang="ar"
        style={{
          position: 'absolute',
          left: '50%',
          top: 56,
          transform: `translateX(-50%) scale(${fxPulse})`,
          display: 'flex',
          gap: 12,
          padding: '12px 16px',
          background: 'rgba(14,14,18,0.88)',
          borderRadius: 14,
          border: `1.5px solid ${brand.colors.gold}`,
          boxShadow: `0 12px 30px ${brand.colors.gold}33`,
        }}
      >
        {fxLines.map((line, i) => {
          const on = phase === i || (phase > i && i === 2);
          const a = interpolate(frame, [i * seg, i * seg + 12], [0.45, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={line.b}
              style={{
                minWidth: 150,
                padding: '8px 12px',
                borderRadius: 10,
                background: on ? `${brand.colors.gold}28` : 'transparent',
                opacity: Math.max(a, phase > i ? 0.7 : a),
                textAlign: 'center',
              }}
            >
              <div style={{fontSize: 12, color: '#b8b0a4', marginBottom: 4}}>{line.b}</div>
              <div style={{fontSize: 20, fontWeight: 700, color: brand.colors.ivory}}>{line.a}</div>
              <div
                style={{
                  fontSize: 11,
                  color: brand.colors.gold,
                  marginTop: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {i === 0 ? (
                  <>
                    <FlagImg code="ae" /> AED
                  </>
                ) : i === 1 ? (
                  <>
                    <FlagImg code="ae" /> → <FlagImg code="om" /> OMR
                  </>
                ) : (
                  <>
                    <FlagImg code="om" /> OMR
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        dir="rtl"
        lang="ar"
        style={{
          position: 'absolute',
          right: 36,
          bottom: 48,
          width: 380,
          padding: '18px 20px',
          background: brand.colors.ivory,
          color: brand.colors.ink,
          borderRadius: 14,
          border: `2px solid ${brand.colors.accent}`,
          opacity: rightCard,
          transform: `translateY(${(1 - rightCard) * 24}px)`,
          boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{fontSize: 15, color: brand.colors.accent, fontWeight: 700, marginBottom: 6}}>
          بيع من مسقط · ٤٤٥٫٠ ر.ع
        </div>
        <div style={{fontSize: 26, fontWeight: 700, marginBottom: 8}}>
          {done ? 'تمّ' : `محجوزة ${hh}:${mm}:${ss}`}
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 6,
            padding: '8px 14px',
            borderRadius: 999,
            background: brand.colors.ink,
            color: brand.colors.gold,
            fontWeight: 700,
            fontSize: 16,
            transform: `scale(${done ? Math.max(chip, 0.01) : 0})`,
            opacity: done ? chip : 0,
          }}
        >
          أمر نقل: دبي → مسقط
        </div>
      </div>
    </div>
  );
};
