import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {brand} from '../brand';

type HrSlide = {
  title: string;
  body: string;
  accent: string;
};

const SLIDES: HrSlide[] = [
  {title: 'الحضور', body: 'تسجيل من الهاتف · بصمة وموقع', accent: 'HR-01'},
  {title: 'المستندات', body: 'عقود · إقامات · أرشيف آمن', accent: 'HR-02'},
  {title: 'التقييم', body: 'رادار أداء · أهداف ربع سنوية', accent: 'HR-03'},
  {title: 'الرواتب', body: 'حماية الأجور · تحويل بنكي', accent: 'HR-04'},
];

/** S11 phone carousel — one HR screen per VO clause. */
export const HrCarousel: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const slide = SLIDES[Math.min(SLIDES.length - 1, Math.max(0, index))];
  const radar = interpolate(frame, [8, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(165deg, ${brand.colors.ivory}, #e8dfd0)`,
        padding: 20,
        boxSizing: 'border-box',
        fontFamily: brand.fontFamily,
        color: brand.colors.ink,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: brand.colors.gold,
          marginBottom: 8,
        }}
      >
        {slide.accent}
      </div>
      <div dir="rtl" style={{fontSize: 36, fontWeight: 700, marginBottom: 8}}>
        {slide.title}
      </div>
      <div dir="rtl" style={{fontSize: 24, opacity: 0.85, marginBottom: 18}}>
        {slide.body}
      </div>

      {index === 2 ? (
        <svg width="100%" height="280" viewBox="0 0 280 220">
          <polygon
            points="140,30 210,90 180,180 100,180 70,90"
            fill="none"
            stroke={brand.colors.gold}
            strokeWidth="2"
            strokeDasharray={`${radar * 520} 520`}
          />
          <polygon
            points="140,70 175,100 160,150 120,150 105,100"
            fill={`${brand.colors.gold}55`}
            opacity={radar}
          />
          <circle cx="140" cy="110" r="4" fill={brand.colors.accent} />
        </svg>
      ) : (
        <div
          style={{
            flex: 1,
            borderRadius: 12,
            background: '#fff',
            border: `1px solid ${brand.colors.gold}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 44,
            fontWeight: 700,
            color: brand.colors.gold,
            letterSpacing: '0.04em',
          }}
        >
          {index === 0 ? 'ATTEND' : index === 1 ? 'DOCS' : 'WPS'}
        </div>
      )}
    </div>
  );
};

/** Optional: wrap a real screen asset inside phone chrome content area. */
export const HrScreenImage: React.FC<{src: string}> = ({src}) => (
  <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
);
