import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {brand} from '../brand';
import {ASSETS} from '../lib/assets';

const GREEN = '#4CAF50';
const BG = '#0a0f0d';

const SCANNED = [
  {name: 'سوار ذهبي', weight: '23.45', time: '10:23', img: ASSETS.items.goldBangle22k},
  {name: 'خاتم ذهبي', weight: '8.12', time: '10:22', img: ASSETS.items.goldRubyRing18k},
  {name: 'قلادة ذهبية', weight: '12.68', time: '10:21', img: ASSETS.items.goldPendantNecklace21k},
  {name: 'أقراط ذهبية', weight: '5.30', time: '10:20', img: ASSETS.items.goldDropEarrings18k},
];

const DIFF_ROWS = [
  {name: 'سوار', expected: 48, img: ASSETS.items.goldBangle22k},
  {name: 'خاتم', expected: 76, img: ASSETS.items.goldRubyRing18k},
  {name: 'قلادة', expected: 52, img: ASSETS.items.goldPendantNecklace21k},
  {name: 'أقراط', expected: 36, img: ASSETS.items.goldDropEarrings18k},
  {name: 'ساعة', expected: 100, img: ASSETS.items.roseGoldChain18k},
];

const StatusBar: React.FC<{time: string}> = ({time}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 18,
      opacity: 0.85,
      marginBottom: 10,
      color: '#fff',
    }}
  >
    <span>{time}</span>
    <span style={{letterSpacing: 3}}>▮▮▮ ☰</span>
  </div>
);

/** Crisp 1080p RFID handheld UI — matches assets/mockups IMG_5063 / IMG_5068. */
export const RfidHandheld: React.FC<{phase: 1 | 2}> = ({phase}) => {
  const frame = useCurrentFrame();
  const count = Math.round(
    interpolate(frame, [0, 70], [phase === 1 ? 180 : 312, 312], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const ring = interpolate(frame, [0, 70], [phase === 1 ? 0.7 : 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (phase === 2) {
    return (
      <div
        dir="rtl"
        lang="ar"
        style={{
          width: '100%',
          height: '100%',
          background: BG,
          padding: '28px 32px',
          boxSizing: 'border-box',
          fontFamily: brand.fontFamily,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <StatusBar time="10:28" />
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18}}>
          <div style={{fontSize: 22}}>☰</div>
          <div style={{flex: 1, textAlign: 'center', fontSize: 28, fontWeight: 700}}>فروقات الجرد</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0 28px'}}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: GREEN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              color: '#fff',
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          <div style={{marginTop: 16, fontSize: 64, fontWeight: 700}}>
            0 <span style={{fontSize: 32, fontWeight: 600}}>فروقات</span>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 0.7fr 0.7fr 0.5fr',
            gap: 8,
            fontSize: 18,
            opacity: 0.7,
            paddingBottom: 10,
            borderBottom: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <span>القطعة</span>
          <span>المتوقع</span>
          <span>المحسوب</span>
          <span>الحالة</span>
        </div>
        {DIFF_ROWS.map((row) => (
          <div
            key={row.name}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 0.7fr 0.7fr 0.5fr',
              gap: 8,
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              fontSize: 22,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <Img src={staticFile(row.img)} style={{width: 36, height: 36, objectFit: 'contain'}} />
              <span>{row.name}</span>
            </div>
            <span>{row.expected}</span>
            <span>{row.expected}</span>
            <span style={{color: GREEN, fontWeight: 700}}>✓</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        width: '100%',
        height: '100%',
        background: BG,
        padding: '28px 32px',
        boxSizing: 'border-box',
        fontFamily: brand.fontFamily,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StatusBar time="10:24" />
      <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8}}>
        <div style={{fontSize: 22}}>☰</div>
        <div style={{flex: 1, textAlign: 'center', fontSize: 28, fontWeight: 700}}>جرد RFID</div>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0 20px'}}>
        <svg width={240} height={240} viewBox="0 0 240 240">
          <circle cx={120} cy={120} r={100} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={14} />
          <circle
            cx={120}
            cy={120}
            r={100}
            fill="none"
            stroke={GREEN}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={`${ring * 628} 628`}
            transform="rotate(-90 120 120)"
          />
          <text
            x={120}
            y={118}
            textAnchor="middle"
            fill="#fff"
            fontSize={42}
            fontWeight={700}
            fontFamily={brand.fontFamily}
          >
            {count} / 312
          </text>
          <text
            x={120}
            y={152}
            textAnchor="middle"
            fill="rgba(255,255,255,0.75)"
            fontSize={22}
            fontFamily={brand.fontFamily}
          >
            قطعة
          </text>
        </svg>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, color: GREEN, fontSize: 24, fontWeight: 700}}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: GREEN,
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            ✓
          </span>
          تم الانتهاء
        </div>
      </div>

      <div style={{fontSize: 22, fontWeight: 700, marginBottom: 12}}>القطع الممسوحة حديثاً</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 0.8fr 0.6fr',
          gap: 8,
          fontSize: 16,
          opacity: 0.65,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <span>القطعة</span>
        <span>الوزن (غ) ↑</span>
        <span>الوقت</span>
      </div>
      {SCANNED.map((row) => (
        <div
          key={row.name}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 0.8fr 0.6fr',
            gap: 8,
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontSize: 20,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <Img src={staticFile(row.img)} style={{width: 34, height: 34, objectFit: 'contain'}} />
            <span>{row.name}</span>
          </div>
          <span style={{color: GREEN}}>{row.weight}</span>
          <span style={{opacity: 0.8}}>{row.time}</span>
        </div>
      ))}
    </div>
  );
};
