import React from 'react';
import {brand} from '../brand';

const IVORY = brand.colors.ivory;
const GOLD = brand.colors.gold;
const INK = brand.colors.ink;

type FormKind = 'invoice' | 'payment' | 'journal';

const TITLES: Record<FormKind, string> = {
  invoice: 'فاتورة مبيعات',
  payment: 'سند قبض',
  journal: 'قيد يومية',
};

const Field: React.FC<{label: string; value: string; wide?: boolean}> = ({
  label,
  value,
  wide,
}) => (
  <div style={{marginBottom: 10, gridColumn: wide ? '1 / -1' : undefined}}>
    <div style={{fontSize: 11, color: '#7a7268', marginBottom: 3, fontWeight: 600}}>{label}</div>
    <div
      style={{
        background: '#fff',
        border: '1px solid #e4ddd2',
        borderRadius: 8,
        padding: '8px 10px',
        fontSize: 13,
        fontWeight: 600,
        color: INK,
      }}
    >
      {value}
    </div>
  </div>
);

/** Crisp HTML mobile desk forms for S03 — ivory + gold, Arabic labels. */
export const MobileDeskForm: React.FC<{kind: FormKind}> = ({kind}) => {
  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        width: '100%',
        height: '100%',
        background: IVORY,
        fontFamily: brand.fontFamily,
        color: INK,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: INK,
          color: '#fff',
          padding: '14px 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{fontSize: 12, opacity: 0.7}}>‹ رجوع</div>
        <div style={{fontSize: 16, fontWeight: 700, color: GOLD}}>{TITLES[kind]}</div>
        <div style={{fontSize: 12, color: GOLD}}>جديد</div>
      </div>

      <div style={{padding: '14px 14px 8px', flex: 1, overflow: 'hidden'}}>
        {kind === 'invoice' ? (
          <>
            <Field label="العميل" value="مؤسسة النور للتجارة" wide />
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
              <Field label="التاريخ" value="١١-٠٩-٢٠٢٦" />
              <Field label="المخزن" value="دبي — الصفا" />
            </div>
            <div
              style={{
                background: '#fff',
                borderRadius: 10,
                border: '1px solid #e4ddd2',
                padding: 10,
                marginBottom: 10,
              }}
            >
              <div style={{fontSize: 12, fontWeight: 700, marginBottom: 8, color: GOLD}}>
                الأصناف
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13}}>
                <span>سوار ذهب ٢٢K · ٣٢٫٤٠ غ</span>
                <span style={{fontWeight: 700}}>٤٬٢٥٠ د.إ</span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 18,
                fontWeight: 700,
                padding: '8px 4px',
              }}
            >
              <span>الإجمالي</span>
              <span style={{color: GOLD}}>٤٬٢٥٠ د.إ</span>
            </div>
          </>
        ) : null}

        {kind === 'payment' ? (
          <>
            <Field label="النوع" value="استلام" />
            <Field label="الطرف" value="مؤسسة النور للتجارة" wide />
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
              <Field label="المبلغ" value="٤٬٢٥٠ د.إ" />
              <Field label="طريقة الدفع" value="نقداً" />
            </div>
            <Field label="الحساب" value="صندوق الفرع — دبي" wide />
            <div
              style={{
                marginTop: 8,
                background: `${GOLD}22`,
                border: `1px solid ${GOLD}`,
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: 15,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              سند قبض · ٤٬٢٥٠ د.إ
            </div>
          </>
        ) : null}

        {kind === 'journal' ? (
          <>
            <Field label="البيان" value="تسوية صندوق · فرع دبي" wide />
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
              <Field label="التاريخ" value="١١-٠٩-٢٠٢٦" />
              <Field label="المرجع" value="JV-2026-088" />
            </div>
            <div
              style={{
                background: '#fff',
                borderRadius: 10,
                border: '1px solid #e4ddd2',
                padding: 10,
              }}
            >
              <div style={{fontSize: 12, fontWeight: 700, marginBottom: 8, color: GOLD}}>
                سطر القيد
              </div>
              <div style={{fontSize: 13, marginBottom: 6}}>من حـ/ الصندوق · ٤٬٢٥٠ د.إ</div>
              <div style={{fontSize: 13}}>إلى حـ/ المبيعات · ٤٬٢٥٠ د.إ</div>
            </div>
          </>
        ) : null}
      </div>

      <div style={{padding: '10px 14px 18px'}}>
        <div
          style={{
            background: GOLD,
            color: '#fff',
            textAlign: 'center',
            padding: '12px 0',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 16,
            boxShadow: `0 8px 20px ${GOLD}55`,
          }}
        >
          حفظ
        </div>
      </div>
    </div>
  );
};
