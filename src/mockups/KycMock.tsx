import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';

const TABS = ['الكيان', 'العلاقة', 'المستندات والأشخاص', 'الامتثال'] as const;

/** S09 KYC — Al Majd Trading Arabic HTML mock from the live record. */
export const KycMock: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const approved = spring({
    frame: frame - Math.round(1.4 * fps),
    fps,
    config: {damping: 12, stiffness: 140},
  });

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        width: '100%',
        height: '100%',
        background: brand.colors.ivory,
        fontFamily: brand.fontFamily,
        color: brand.colors.ink,
        boxSizing: 'border-box',
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div>
          <div style={{fontSize: 14, color: '#7a7268', marginBottom: 4}}>اعرف عميلك · KYC</div>
          <div style={{fontSize: 28, fontWeight: 700}}>المجد للتجارة ذ.م.م</div>
          <div style={{fontSize: 16, color: '#666', marginTop: 4}}>Al Majd Trading LLC</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end'}}>
          <div
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              background: approved > 0.5 ? '#E8F5E9' : '#FFF8E1',
              color: approved > 0.5 ? '#2E7D32' : '#F9A825',
              fontWeight: 700,
              fontSize: 16,
              border: `1.5px solid ${approved > 0.5 ? '#2E7D32' : '#F9A825'}`,
            }}
          >
            {approved > 0.5 ? 'معتمدة' : 'مسودة'}
          </div>
          <div style={{fontSize: 14}}>
            المخاطر: <strong>متوسط</strong>
          </div>
          <div style={{fontSize: 14, color: '#2E7D32', fontWeight: 700}}>✓ لا يوجد · العقوبات</div>
        </div>
      </div>

      <div style={{display: 'flex', gap: 8, borderBottom: '1px solid #e6dfd4', paddingBottom: 0}}>
        {TABS.map((t, i) => {
          const active = i === 2;
          return (
            <div
              key={t}
              style={{
                padding: '10px 16px',
                fontWeight: active ? 700 : 500,
                fontSize: 15,
                color: active ? brand.colors.gold : '#777',
                borderBottom: active ? `3px solid ${brand.colors.gold}` : '3px solid transparent',
              }}
            >
              {t}
            </div>
          );
        })}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, flex: 1}}>
        <Section title="الشركاء">
          <Row name="عمر" meta="٦٠٪" ok />
          <Row name="سارة" meta="٤٠٪" ok />
        </Section>
        <Section title="المستفيدون الحقيقيون">
          <Row name="سارة" meta="≥٢٥٪ · ٤٠٪" ok />
        </Section>
        <Section title="المفوّضون">
          <Row name="عمر" meta="المدير العام · الرخصة التجارية" ok />
        </Section>
      </div>
    </div>
  );
};

const Section: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e4ddd2',
      padding: 14,
      boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
    }}
  >
    <div style={{fontSize: 16, fontWeight: 700, color: brand.colors.gold, marginBottom: 10}}>
      {title}
    </div>
    {children}
  </div>
);

const Row: React.FC<{name: string; meta: string; ok?: boolean}> = ({name, meta, ok}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #f0ebe3',
      fontSize: 15,
    }}
  >
    <span style={{fontWeight: 700}}>{name}</span>
    <span style={{color: '#666'}}>
      {meta} {ok ? <span style={{color: '#2E7D32'}}>✓</span> : null}
    </span>
  </div>
);
