import React from 'react';
import {AbsoluteFill} from 'remotion';
import {brand} from './brand';
import {ensureBrandFont} from './lib/loadFont';

/** Single-frame composition to verify Arabic shaping (tanween + shadda). */
export const FONT_CHECK_TEXT = 'نظامٌ واحد لتجارة الذهب كلّها';

export const FontCheck: React.FC = () => {
  ensureBrandFont();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.ivory,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 64,
      }}
    >
      <div
        dir="rtl"
        lang="ar"
        style={{
          fontFamily: brand.fontFamily,
          fontSize: 64,
          fontWeight: 600,
          color: brand.colors.ink,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        {FONT_CHECK_TEXT}
      </div>
    </AbsoluteFill>
  );
};
