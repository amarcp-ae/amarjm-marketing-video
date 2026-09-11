import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {brand} from '../brand';

const CREAM = '#FDFBF7';
const GOLD = '#B88E4F';
const INK = '#1A1A1A';
const MUTED = '#8A8A8A';

const NavBar: React.FC<{active: 'home' | 'requests' | 'more'}> = ({active}) => {
  const items: Array<{id: 'home' | 'requests' | 'more' | 'notif'; label: string; icon: string}> = [
    {id: 'home', label: 'الرئيسية', icon: '⌂'},
    {id: 'requests', label: 'الطلبات', icon: '☰'},
    {id: 'notif', label: 'الإشعارات', icon: '◷'},
    {id: 'more', label: 'المزيد', icon: '◉'},
  ];
  return (
    <div
      style={{
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTop: '1px solid #eee',
        background: '#fff',
      }}
    >
      {items.map((it) => {
        const on = it.id === active;
        return (
          <div
            key={it.id}
            style={{
              textAlign: 'center',
              color: on ? GOLD : MUTED,
              fontSize: 14,
              fontWeight: on ? 700 : 500,
            }}
          >
            <div style={{fontSize: 22, marginBottom: 2}}>{it.icon}</div>
            {it.label}
          </div>
        );
      })}
    </div>
  );
};

const Status: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 14,
      color: MUTED,
      marginBottom: 8,
    }}
  >
    <span>9:41</span>
    <span>▮▮▮</span>
  </div>
);

const HrHome: React.FC = () => (
  <div
    dir="rtl"
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 8,
    }}
  >
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: `linear-gradient(145deg, ${GOLD}, #8a6a35)`,
        marginBottom: 10,
      }}
    />
    <div style={{fontSize: 28, fontWeight: 700, color: INK, marginBottom: 14}}>مرحباً أحمد</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 8, color: GOLD, fontSize: 18}}>
      <span>▣</span>
      <span>وردية اليوم</span>
    </div>
    <div style={{fontSize: 26, fontWeight: 700, color: INK, margin: '6px 0 18px'}}>10:00 – 19:00</div>
    <div
      style={{
        width: '100%',
        padding: '16px 0',
        borderRadius: 14,
        background: `linear-gradient(90deg, #BC8F46, #A67C37)`,
        color: '#fff',
        fontSize: 24,
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: 18,
      }}
    >
      ⌁  تسجيل حضور
    </div>
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}
    >
      {[
        {t: 'مستنداتي', i: '▤'},
        {t: 'طلباتي', i: '☑'},
        {t: 'تقييمي', i: '★'},
        {t: 'راتبي', i: '◈'},
      ].map((c) => (
        <div
          key={c.t}
          style={{
            background: '#fff',
            borderRadius: 14,
            padding: '22px 10px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{fontSize: 28, color: GOLD, marginBottom: 8}}>{c.i}</div>
          <div style={{fontSize: 20, fontWeight: 600, color: INK}}>{c.t}</div>
        </div>
      ))}
    </div>
    <NavBar active="home" />
  </div>
);

const HrAttend: React.FC = () => (
  <div dir="rtl" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
    <div style={{display: 'flex', alignItems: 'center', marginBottom: 24}}>
      <span style={{fontSize: 22, color: MUTED}}>‹</span>
      <div style={{flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 700, color: INK}}>
        تسجيل الحضور
      </div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20}}>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: '#4CAF50',
          color: '#fff',
          fontSize: 48,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✓
      </div>
      <div style={{marginTop: 14, fontSize: 24, fontWeight: 700, color: '#4CAF50'}}>
        تم تسجيل الحضور بنجاح
      </div>
    </div>
    <div
      style={{
        marginTop: 28,
        background: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          height: 90,
          background: 'linear-gradient(135deg, #e8f0e4, #d5e4ef)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '48%',
            top: '42%',
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#4CAF50',
            border: '3px solid #fff',
          }}
        />
      </div>
      <div style={{padding: '12px 16px'}}>
        <div style={{fontSize: 16, color: MUTED}}>الموقع</div>
        <div style={{fontSize: 22, fontWeight: 700, color: INK}}>الشارقة، الإمارات</div>
      </div>
    </div>
    <div
      style={{
        marginTop: 14,
        background: '#fff',
        borderRadius: 14,
        padding: '14px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{fontSize: 16, color: MUTED}}>الوقت</div>
      <div style={{fontSize: 28, fontWeight: 700, color: INK}}>10:02 ص</div>
      <div style={{fontSize: 18, color: MUTED}}>2026-09-10</div>
    </div>
    <div
      style={{
        marginTop: 'auto',
        padding: '16px 0',
        borderRadius: 14,
        background: GOLD,
        color: '#fff',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 700,
      }}
    >
      حسناً
    </div>
  </div>
);

const HrLeave: React.FC = () => (
  <div dir="rtl" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
    <div style={{display: 'flex', alignItems: 'center', marginBottom: 16}}>
      <span style={{fontSize: 22, color: MUTED}}>‹</span>
      <div style={{flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 700, color: INK}}>
        طلب مستند / إجازة
      </div>
    </div>
    <div style={{display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 18, fontSize: 20}}>
      <span style={{color: MUTED}}>إجازة</span>
      <span style={{color: INK, fontWeight: 700, borderBottom: `2px solid ${GOLD}`, paddingBottom: 4}}>
        مستند
      </span>
    </div>
    {[
      {l: 'نوع الطلب', v: 'إجازة سنوية'},
      {l: 'تاريخ البداية', v: '2026-09-15'},
      {l: 'تاريخ النهاية', v: '2026-09-18'},
    ].map((f) => (
      <div key={f.l} style={{marginBottom: 12}}>
        <div style={{fontSize: 16, color: MUTED, marginBottom: 4}}>{f.l}</div>
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: 10,
            padding: '12px 14px',
            fontSize: 20,
            color: INK,
          }}
        >
          {f.v}
        </div>
      </div>
    ))}
    <div style={{marginBottom: 14}}>
      <div style={{fontSize: 16, color: MUTED, marginBottom: 4}}>السبب (اختياري)</div>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: 10,
          padding: '14px',
          fontSize: 18,
          color: MUTED,
          minHeight: 64,
        }}
      >
        يمكنك إضافة سبب الطلب...
      </div>
    </div>
    <div
      style={{
        padding: '14px 0',
        borderRadius: 12,
        background: GOLD,
        color: '#fff',
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 700,
        marginBottom: 16,
      }}
    >
      إرسال الطلب
    </div>
    <div style={{fontSize: 18, fontWeight: 700, color: INK, marginBottom: 8}}>حالة الطلبات السابقة</div>
    {[
      {t: 'إجازة سنوية', d: '2026-08-20', s: 'قيد المراجعة'},
      {t: 'شهادة راتب', d: '2026-07-10', s: 'معتمد'},
    ].map((r) => (
      <div
        key={r.t}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid #eee',
        }}
      >
        <div>
          <div style={{fontSize: 18, fontWeight: 600, color: INK}}>{r.t}</div>
          <div style={{fontSize: 14, color: MUTED}}>{r.d}</div>
        </div>
        <span
          style={{
            fontSize: 14,
            padding: '4px 10px',
            borderRadius: 8,
            background: r.s === 'معتمد' ? '#E8F5E9' : '#FFF3E0',
            color: r.s === 'معتمد' ? '#2E7D32' : '#EF6C00',
            fontWeight: 700,
          }}
        >
          {r.s}
        </span>
      </div>
    ))}
  </div>
);

const HrEval: React.FC<{radar: number}> = ({radar}) => {
  const cx = 140;
  const cy = 110;
  const r = 70;
  const labels = ['الالتزام', 'التواصل', 'العمل الجماعي', 'الاحترافية', 'الإنجازات', 'المهارات'];
  const scores = [0.92, 0.78, 0.88, 0.9, 0.85, 0.8];
  const pts = scores
    .map((s, i) => {
      const a = (-90 + i * 60) * (Math.PI / 180);
      return `${cx + Math.cos(a) * r * s * radar},${cy + Math.sin(a) * r * s * radar}`;
    })
    .join(' ');

  return (
    <div dir="rtl" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', marginBottom: 8}}>
        <span style={{fontSize: 22, color: MUTED}}>‹</span>
        <div style={{flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 700, color: INK}}>
          التقييم السنوي
        </div>
      </div>
      <svg width="100%" height={220} viewBox="0 0 280 220">
        {[0.35, 0.65, 1].map((k) => (
          <polygon
            key={k}
            points={Array.from({length: 6}, (_, i) => {
              const a = (-90 + i * 60) * (Math.PI / 180);
              return `${cx + Math.cos(a) * r * k},${cy + Math.sin(a) * r * k}`;
            }).join(' ')}
            fill="none"
            stroke="#ddd"
            strokeWidth={1}
          />
        ))}
        <polygon points={pts} fill={`${GOLD}55`} stroke={GOLD} strokeWidth={2} />
        {labels.map((lb, i) => {
          const a = (-90 + i * 60) * (Math.PI / 180);
          const x = cx + Math.cos(a) * (r + 28);
          const y = cy + Math.sin(a) * (r + 28);
          return (
            <text
              key={lb}
              x={x}
              y={y}
              textAnchor="middle"
              fill={INK}
              fontSize={11}
              fontFamily={brand.fontFamily}
            >
              {lb}
            </text>
          );
        })}
      </svg>
      <div
        style={{
          background: '#FEF9F0',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{fontSize: 16, color: MUTED}}>التقييم العام</div>
          <div style={{fontSize: 32, fontWeight: 700, color: INK}}>4.6 / 5</div>
        </div>
        <div style={{fontSize: 36, color: GOLD}}>★</div>
      </div>
      <div style={{background: '#FEF9F0', borderRadius: 12, padding: '12px 16px', marginBottom: 12}}>
        <div style={{fontSize: 18, fontWeight: 700, color: INK, marginBottom: 6}}>تعليق المدير</div>
        <div style={{fontSize: 16, color: INK, lineHeight: 1.5}}>
          أداء متميز والتزام عالٍ بالمهام. مع تطوير أكبر في مهارات التواصل.
        </div>
      </div>
      <div style={{fontSize: 18, fontWeight: 700, color: INK, marginBottom: 6}}>الأهداف القادمة</div>
      {['تطوير مهارات القيادة', 'المساهمة في مشاريع جديدة'].map((g) => (
        <div key={g} style={{display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', fontSize: 17}}>
          <span style={{color: GOLD}}>✓</span>
          <span style={{color: INK}}>{g}</span>
        </div>
      ))}
    </div>
  );
};

/** S11 phone carousel — crisp HTML matching IMG_5069 / 5061 / 5066 / 5062. */
export const HrCarousel: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const radar = interpolate(frame, [8, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const i = Math.min(3, Math.max(0, index));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: CREAM,
        padding: '18px 18px 10px',
        boxSizing: 'border-box',
        fontFamily: brand.fontFamily,
        color: INK,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Status />
      {i === 0 ? <HrHome /> : null}
      {i === 1 ? <HrAttend /> : null}
      {i === 2 ? <HrLeave /> : null}
      {i === 3 ? <HrEval radar={radar} /> : null}
    </div>
  );
};
