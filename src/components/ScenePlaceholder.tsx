import React from 'react';
import {AbsoluteFill} from 'remotion';
import {brand} from '../brand';
import {ensureBrandFont} from '../lib/loadFont';

type ScenePlaceholderProps = {
  sceneNumber: number;
};

export const ScenePlaceholder: React.FC<ScenePlaceholderProps> = ({sceneNumber}) => {
  ensureBrandFont();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.ink,
        backgroundImage: `radial-gradient(ellipse at 30% 20%, ${brand.colors.gold}33 0%, transparent 55%),
          linear-gradient(160deg, ${brand.colors.ink} 0%, #0d0d0d 100%)`,
        color: brand.colors.ivory,
        fontFamily: brand.fontFamily,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        direction: 'rtl',
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 600,
          letterSpacing: '0.02em',
          color: brand.colors.gold,
        }}
      >
        {`المشهد ${sceneNumber}`}
      </div>
    </AbsoluteFill>
  );
};
