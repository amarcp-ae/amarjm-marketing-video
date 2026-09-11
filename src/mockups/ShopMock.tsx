import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {ASSETS} from '../lib/assets';

const GOLD = '#C19A5B';
const DARK = '#111111';
const CREAM = '#F7F5F0';
const INK = '#1A1A1A';
const GREEN = '#2E7D32';
const RED = '#C62828';

const PRODUCTS = [
  {name: 'أسورة ذهبية', karat: '22K', price: '4,250', img: ASSETS.items.goldBangle22k},
  {name: 'قلادة ذهبية', karat: '21K', price: '2,980', img: ASSETS.items.goldPendantNecklace21k},
  {name: 'خاتم ذهب', karat: '18K', price: '3,600', img: ASSETS.items.goldRubyRing18k},
  {name: 'أقراط ذهبية', karat: '21K', price: '2,340', img: ASSETS.items.goldDropEarrings18k},
  {name: 'أسورة سلسلة', karat: '21K', price: '1,870', img: ASSETS.items.goldCurbBracelet21k},
  {name: 'قلادة ذهبية', karat: '18K', price: '3,150', img: ASSETS.items.goldCoinPendant22k},
];

const Sidebar: React.FC<{active: string}> = ({active}) => {
  const items = [
    {id: 'home', label: 'الرئيسية', icon: '⌂'},
    {id: 'jewelry', label: 'المجوهرات', icon: '◇'},
    {id: 'products', label: 'المنتجات', icon: '▦'},
    {id: 'wallet', label: 'محفظتي', icon: '▣'},
    {id: 'account', label: 'حسابي', icon: '◉'},
  ];
  return (
    <div
      style={{
        width: 160,
        background: DARK,
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        color: '#fff',
        boxSizing: 'border-box',
      }}
    >
      {items.map((it) => {
        const on = it.id === active;
        return (
          <div
            key={it.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 10px',
              borderRadius: 10,
              background: on ? `${GOLD}33` : 'transparent',
              border: on ? `1px solid ${GOLD}` : '1px solid transparent',
              color: on ? GOLD : 'rgba(255,255,255,0.75)',
              fontSize: 18,
              fontWeight: on ? 700 : 500,
            }}
          >
            <span>{it.icon}</span>
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const GoldBar: React.FC<{prices: Array<{k: string; v: string}>}> = ({prices}) => (
  <div
    style={{
      background: DARK,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 18px',
      gap: 16,
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'}}>
      <span style={{color: GOLD, fontWeight: 700, fontSize: 16}}>سعر الذهب الآن</span>
      {prices.map((p) => (
        <span key={p.k} style={{fontSize: 15}}>
          {p.k}: <strong style={{color: '#fff'}}>{p.v}</strong>{' '}
          <span style={{color: GREEN}}>↑</span>
        </span>
      ))}
    </div>
    <div style={{display: 'flex', gap: 8}}>
      <div
        style={{
          background: GOLD,
          color: '#fff',
          padding: '8px 18px',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        اشترِ
      </div>
      <div
        style={{
          border: `1px solid ${GOLD}`,
          color: GOLD,
          padding: '8px 18px',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        بيع
      </div>
    </div>
  </div>
);

const ProductsDesktop: React.FC<{sold?: boolean; soldOpacity?: number; stamp?: number}> = ({
  sold,
  soldOpacity = 1,
  stamp = 0,
}) => (
  <div
    dir="rtl"
    lang="ar"
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      background: CREAM,
      fontFamily: brand.fontFamily,
      color: INK,
      overflow: 'hidden',
    }}
  >
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0}}>
      <GoldBar
        prices={[
          {k: 'عيار 18', v: '301.90'},
          {k: 'عيار 21', v: '352.20'},
          {k: 'عيار 24', v: '403.50'},
        ]}
      />
      <div style={{padding: '16px 20px', flex: 1, boxSizing: 'border-box'}}>
        <div style={{fontSize: 26, fontWeight: 700, marginBottom: 14}}>أحدث المنتجات</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {PRODUCTS.map((p, i) => {
            const isSold = sold && i === 1;
            return (
              <div
                key={`${p.name}-${i}`}
                style={{
                  position: 'relative',
                  background: '#fff',
                  borderRadius: 10,
                  padding: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  opacity: isSold ? soldOpacity : 1,
                }}
              >
                <Img
                  src={staticFile(p.img)}
                  style={{width: '100%', height: 110, objectFit: 'contain'}}
                />
                <div style={{fontSize: 18, fontWeight: 700, marginTop: 6}}>{p.name}</div>
                <div style={{fontSize: 14, color: '#777'}}>{p.karat}</div>
                <div style={{fontSize: 18, fontWeight: 700, color: GOLD, marginTop: 2}}>
                  {p.price} د.إ
                </div>
                {isSold ? (
                  <div
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
                        background: 'rgba(247,243,235,0.92)',
                      }}
                    >
                      مُباعة
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    <Sidebar active="products" />
  </div>
);

const WalletDesktop: React.FC = () => (
  <div
    dir="rtl"
    lang="ar"
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      background: CREAM,
      fontFamily: brand.fontFamily,
      color: INK,
      overflow: 'hidden',
    }}
  >
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0}}>
      <GoldBar
        prices={[
          {k: 'عيار 24', v: '403.50'},
          {k: 'عيار 21', v: '352.20'},
          {k: 'عيار 18', v: '301.90'},
        ]}
      />
      <div style={{padding: '16px 20px', flex: 1, boxSizing: 'border-box'}}>
        <div style={{fontSize: 26, fontWeight: 700, marginBottom: 12}}>محفظتي</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18}}>
          {[
            {t: 'نقاط الولاء', v: '1,240', icon: '★', c: GOLD},
            {t: 'محفظة النقد', v: '8,500 د.إ', icon: '≡', c: GREEN},
            {t: 'محفظة الذهب', v: '3.4 غرام', icon: '◈', c: GOLD},
          ].map((c) => (
            <div
              key={c.t}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '16px 14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{fontSize: 16, color: '#777', marginBottom: 6}}>
                <span style={{color: c.c, marginLeft: 6}}>{c.icon}</span>
                {c.t}
              </div>
              <div style={{fontSize: 28, fontWeight: 700}}>{c.v}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize: 20, fontWeight: 700, marginBottom: 10}}>شراء وبيع الذهب</div>
        <div style={{display: 'flex', gap: 12, marginBottom: 18}}>
          <div
            style={{
              flex: 1,
              background: GOLD,
              color: '#fff',
              borderRadius: 12,
              padding: '18px 0',
              textAlign: 'center',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            شراء الذهب
          </div>
          <div
            style={{
              flex: 1,
              background: DARK,
              color: '#fff',
              borderRadius: 12,
              padding: '18px 0',
              textAlign: 'center',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            بيع الذهب
          </div>
        </div>
        <div style={{fontSize: 20, fontWeight: 700, marginBottom: 8}}>معاملات حديثة</div>
        {[
          {d: '2026-09-08', t: 'شراء ذهب', v: '+5.2 غرام', pos: true},
          {d: '2026-09-05', t: 'بيع ذهب', v: '-2.0 غرام', pos: false},
          {d: '2026-09-02', t: 'إيداع نقدي', v: '+3,000 د.إ', pos: true},
        ].map((r) => (
          <div
            key={r.d + r.t}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #e8e8e8',
              fontSize: 18,
            }}
          >
            <span style={{color: '#666'}}>
              {r.d} · {r.t}
            </span>
            <span style={{fontWeight: 700, color: r.pos ? GREEN : RED}}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
    <Sidebar active="wallet" />
  </div>
);

const WalletPhone: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 8) * 0.04;
  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        width: '100%',
        height: '100%',
        background: CREAM,
        padding: '16px 16px 8px',
        boxSizing: 'border-box',
        fontFamily: brand.fontFamily,
        color: INK,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#888', marginBottom: 8}}>
        <span>9:41</span>
        <span>▮▮▮</span>
      </div>
      <div style={{display: 'flex', alignItems: 'center', marginBottom: 14}}>
        <span style={{fontSize: 20, color: '#888'}}>‹</span>
        <div style={{flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 700}}>محفظتي</div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16}}>
        {[
          {t: 'محفظة الذهب', v: '24.3 غرام', c: GOLD},
          {t: 'محفظة النقد', v: '8,500 د.إ', c: '#1A6B6B'},
          {t: 'نقاط الولاء', v: '1,240', c: GOLD},
        ].map((c) => (
          <div
            key={c.t}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '12px 8px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{fontSize: 13, color: '#777', marginBottom: 4}}>{c.t}</div>
            <div style={{fontSize: 18, fontWeight: 700, color: c.c}}>{c.v}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize: 18, fontWeight: 700, marginBottom: 8}}>شراء وبيع الذهب</div>
      <div style={{display: 'flex', gap: 10, marginBottom: 16}}>
        {['شراء الذهب', 'بيع الذهب'].map((label, i) => (
          <div
            key={label}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '14px 0',
              borderRadius: 12,
              background: i === 0 ? GOLD : DARK,
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              transform: `scale(${pulse})`,
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div style={{fontSize: 18, fontWeight: 700, marginBottom: 8}}>تاريخ المعاملات</div>
      {[
        {t: 'شراء - 09-09-2026', v: '+5.2 غرام', pos: true},
        {t: 'بيع ذهب', v: '-2.0 غرام', pos: false},
        {t: 'إيداع نقدي', v: '+3,000 د.إ', pos: true},
        {t: 'سحب نقدي', v: '-1,000 د.إ', pos: false},
      ].map((r) => (
        <div
          key={r.t}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #ececec',
            fontSize: 16,
          }}
        >
          <span>{r.t}</span>
          <span style={{fontWeight: 700, color: r.pos ? GREEN : RED}}>{r.v}</span>
        </div>
      ))}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-around',
          paddingTop: 10,
          borderTop: '1px solid #eee',
          fontSize: 13,
        }}
      >
        {[
          {l: 'الرئيسية', on: false},
          {l: 'الطلبات', on: false},
          {l: 'المحفظة', on: true},
          {l: 'المزيد', on: false},
        ].map((n) => (
          <div key={n.l} style={{color: n.on ? GOLD : '#888', fontWeight: n.on ? 700 : 500, textAlign: 'center'}}>
            {n.l}
          </div>
        ))}
      </div>
    </div>
  );
};

type ShopMockProps = {
  variant: 'shop-01' | 'shop-02' | 'shop-03';
};

/** Crisp HTML shop mocks matching IMG_5065 / 5064 / 5067 — never upscale PNG crops. */
export const ShopMock: React.FC<ShopMockProps> = ({variant}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  if (variant === 'shop-03') {
    return <WalletPhone />;
  }

  if (variant === 'shop-02') {
    return <WalletDesktop />;
  }

  const soldOpacity = interpolate(frame, [Math.round(2.2 * fps), Math.round(2.6 * fps)], [1, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const stamp = spring({
    frame: frame - Math.round(2.4 * fps),
    fps,
    config: {damping: 10, stiffness: 160},
  });

  return <ProductsDesktop sold soldOpacity={soldOpacity} stamp={stamp} />;
};
