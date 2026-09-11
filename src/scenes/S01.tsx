import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {LogoWordmark} from '../components/LogoWordmark';
import {SceneShell} from '../components/SceneShell';
import {ensureBrandFont} from '../lib/loadFont';
import {getSceneDurationInFrames, type SceneId} from '../lib/audioManifest';
import {findWordOnsetFrame} from '../lib/wordTiming';

const SCENE_ID: SceneId = 'S01';
export const durationInFrames = getSceneDurationInFrames(SCENE_ID);

const ROLES = [
  {key: 'المدير', label: 'المدير الماليّ'},
  {key: 'المحاسب', label: 'المحاسب'},
  {key: 'والمالك', label: 'المالك'},
  {key: 'البائع', label: 'البائع'},
  {key: 'الموز', label: 'الموزّع'},
  {key: 'الورشة', label: 'الورشة'},
] as const;

const MODULES = [
  {key: 'الحسابات', label: 'حسابات'},
  {key: 'والمخزون', label: 'مخزون'},
  {key: 'الموارد', label: 'HR'},
  {key: 'المبيعات', label: 'مبيعات'},
  {key: 'التسويق', label: 'تسويق'},
  {key: 'تناغم', label: 'إدارة'},
] as const;

const cardStyle = (opacity: number, scale: number): React.CSSProperties => ({
  opacity,
  transform: `scale(${scale})`,
  background: 'rgba(14,14,18,0.72)',
  border: `1.5px solid ${brand.colors.gold}88`,
  borderRadius: 18,
  padding: '28px 48px',
  color: brand.colors.ivory,
  textAlign: 'center',
  boxShadow: `0 18px 48px rgba(0,0,0,0.45)`,
});

const RoleIcon: React.FC<{lit: boolean; label: string}> = ({lit, label}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      opacity: lit ? 1 : 0.28,
      transform: `scale(${lit ? 1 : 0.92})`,
    }}
  >
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        border: `2px solid ${lit ? brand.colors.gold : '#555'}`,
        background: lit ? `${brand.colors.gold}33` : 'rgba(255,255,255,0.04)',
        boxShadow: lit ? `0 0 22px ${brand.colors.gold}66` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: lit ? brand.colors.gold : '#666',
        }}
      />
    </div>
    <div dir="rtl" style={{fontSize: 22, fontWeight: 600, color: brand.colors.ivory, whiteSpace: 'nowrap'}}>
      {label}
    </div>
  </div>
);

/** Safe phase opacity — never feeds a non-monotonic interpolate range. */
const phaseOpacity = (frame: number, start: number, end: number, fade = 18): number => {
  const hold = Math.max(10, end - start - fade);
  const local = frame - start;
  return interpolate(local, [0, 8, hold, hold + fade], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const S01: React.FC = () => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const onset = (needle: string, occurrence = 0) =>
    findWordOnsetFrame(SCENE_ID, needle, fps, occurrence) ?? 0;

  const fEval = onset('تقييم');
  const fReal = onset('الحقيقي');
  const fFake = onset('الوهمي');
  const fShop = onset('المحل');
  const fBranches = onset('الفروع');
  const fCountry = onset('دولة');
  const fErrors = onset('أخطاء');
  const fFix = onset('التثبيت');
  const fModulesStart = onset('الحسابات');
  const fHarmony = onset('تناغم');
  const fLogo = onset('أمارسوفت', 0);

  // Prefer exact-ish logo word — avoid short "ما" false positive via sequential search from end
  const fLogoSafe = (() => {
    const a = findWordOnsetFrame(SCENE_ID, 'أمارسوفت', fps, 0);
    const b = findWordOnsetFrame(SCENE_ID, 'أمارسوفت', fps, 1);
    // If first hit is too early (< 30s), use second occurrence
    if (a !== null && a < 30 * fps && b !== null) return b;
    return a ?? Math.round(39.16 * fps);
  })();

  const roleOnsets = ROLES.map((r) => onset(r.key));
  const moduleOnsets = MODULES.map((m) =>
    onset(m.key, 'occurrence' in m ? (m.occurrence as number) : 0),
  );

  const years = spring({
    frame: frame - Math.round(0.4 * fps),
    fps,
    config: {damping: 14, stiffness: 120},
  });

  const pop = (start: number) =>
    spring({frame: frame - start, fps, config: {damping: 12, stiffness: 160}});

  const evalOp = phaseOpacity(frame, fEval, fReal);
  const profitOp = phaseOpacity(frame, fReal, roleOnsets[0]!);
  const rolesOp = phaseOpacity(frame, roleOnsets[0]!, fShop);
  const mapOp = phaseOpacity(frame, fShop, fErrors);
  const fixOp = phaseOpacity(frame, fErrors, fModulesStart);
  const modsOp = phaseOpacity(frame, fModulesStart, fLogoSafe);
  const logoOp = interpolate(frame, [fLogoSafe - 6, fLogoSafe + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const mapStep =
    frame >= fCountry ? 2 : frame >= fBranches ? 1 : frame >= fShop ? 0 : -1;
  const fixProgress = interpolate(frame, [fFix, fFix + 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringProgress = interpolate(frame, [fHarmony, fHarmony + 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleOp =
    fCountry > 0
      ? interpolate(frame, [fCountry, fCountry + 10, Math.max(fCountry + 20, fErrors - 8), fErrors], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;

  return (
    <SceneShell sceneId={SCENE_ID} isFirst showHairline={false}>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: brand.fontFamily,
          overflow: 'hidden',
        }}
      >
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 40%, ${brand.colors.gold}18 0%, transparent 55%)`,
            pointerEvents: 'none',
          }}
        />

        <div
          dir="rtl"
          lang="ar"
          style={{
            position: 'absolute',
            top: '10%',
            transform: `scale(${years})`,
            opacity: years * (1 - logoOp * 0.85),
            color: brand.colors.ivory,
            fontSize: 36,
            fontWeight: 700,
            borderBottom: `2px solid ${brand.colors.gold}`,
            paddingBottom: 8,
          }}
        >
          ثلاثة عشر عامًا
        </div>

        {evalOp > 0.01 ? (
          <div dir="rtl" style={{...cardStyle(evalOp, pop(fEval)), position: 'absolute', top: '28%'}}>
            <div style={{fontSize: 56, fontWeight: 700, color: brand.colors.gold}}>تقييم المخزون</div>
          </div>
        ) : null}

        {profitOp > 0.01 ? (
          <div
            dir="rtl"
            style={{position: 'absolute', top: '30%', display: 'flex', gap: 28, opacity: profitOp}}
          >
            <div style={{...cardStyle(1, pop(fReal)), padding: '22px 36px'}}>
              <div style={{fontSize: 22, opacity: 0.7, marginBottom: 6}}>ربح</div>
              <div style={{fontSize: 48, fontWeight: 700, color: '#5FBF6A'}}>حقيقيّ</div>
            </div>
            <div style={{...cardStyle(frame >= fFake ? 1 : 0.35, pop(fFake)), padding: '22px 36px'}}>
              <div style={{fontSize: 22, opacity: 0.7, marginBottom: 6}}>ربح</div>
              <div style={{fontSize: 48, fontWeight: 700, color: brand.colors.accent}}>وهميّ</div>
            </div>
          </div>
        ) : null}

        {rolesOp > 0.01 ? (
          <div
            dir="rtl"
            style={{position: 'absolute', top: '34%', display: 'flex', gap: 36, opacity: rolesOp}}
          >
            {ROLES.map((r, i) => (
              <RoleIcon key={r.key} lit={frame >= roleOnsets[i]!} label={r.label} />
            ))}
          </div>
        ) : null}

        {mapOp > 0.01 ? (
          <div
            style={{
              position: 'absolute',
              top: '26%',
              opacity: mapOp,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 28,
            }}
          >
            <svg width={720} height={320} viewBox="0 0 720 320">
              <circle
                cx={160}
                cy={160}
                r={mapStep >= 0 ? 28 : 10}
                fill={brand.colors.gold}
                opacity={mapStep >= 0 ? 1 : 0.2}
              />
              {[0, 1, 2, 3].map((i) => {
                const a = (-40 + i * 28) * (Math.PI / 180);
                const x = 360 + Math.cos(a) * 90;
                const y = 160 + Math.sin(a) * 70;
                return (
                  <g key={i} opacity={mapStep >= 1 ? 1 : 0.15}>
                    <line
                      x1={160}
                      y1={160}
                      x2={x}
                      y2={y}
                      stroke={brand.colors.gold}
                      strokeWidth={2}
                    />
                    <circle cx={x} cy={y} r={16} fill={`${brand.colors.gold}cc`} />
                  </g>
                );
              })}
              {[
                {x: 560, y: 80, label: 'UAE'},
                {x: 620, y: 160, label: 'KSA'},
                {x: 560, y: 240, label: 'OMN'},
              ].map((n) => (
                <g key={n.label} opacity={mapStep >= 2 ? 1 : 0.12}>
                  <line
                    x1={360}
                    y1={160}
                    x2={n.x}
                    y2={n.y}
                    stroke={brand.colors.gold}
                    strokeWidth={2}
                  />
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={22}
                    fill={brand.colors.ink}
                    stroke={brand.colors.gold}
                    strokeWidth={2}
                  />
                  <text
                    x={n.x}
                    y={n.y + 5}
                    textAnchor="middle"
                    fill={brand.colors.gold}
                    fontSize={14}
                    fontFamily={brand.fontFamily}
                  >
                    {n.label}
                  </text>
                </g>
              ))}
            </svg>
            <div
              dir="rtl"
              style={{
                display: 'flex',
                gap: 18,
                alignItems: 'center',
                fontSize: 32,
                fontWeight: 700,
                color: brand.colors.ivory,
              }}
            >
              <span
                style={{
                  opacity: mapStep >= 0 ? 1 : 0.35,
                  color: mapStep === 0 ? brand.colors.gold : brand.colors.ivory,
                }}
              >
                محلّ واحد
              </span>
              <span style={{opacity: 0.5}}>→</span>
              <span
                style={{
                  opacity: mapStep >= 1 ? 1 : 0.35,
                  color: mapStep === 1 ? brand.colors.gold : brand.colors.ivory,
                }}
              >
                فروع
              </span>
              <span style={{opacity: 0.5}}>→</span>
              <span
                style={{
                  opacity: mapStep >= 2 ? 1 : 0.35,
                  color: mapStep === 2 ? brand.colors.gold : brand.colors.ivory,
                }}
              >
                أكثر من دولة
              </span>
            </div>
            <div
              dir="rtl"
              style={{
                opacity: subtitleOp,
                fontSize: 28,
                fontWeight: 600,
                color: brand.colors.gold,
              }}
            >
              عدّة دول، تقريرٌ واحد
            </div>
          </div>
        ) : null}

        {fixOp > 0.01 ? (
          <div
            dir="rtl"
            style={{
              position: 'absolute',
              top: '32%',
              opacity: fixOp,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 22,
            }}
          >
            <div style={{fontSize: 48, fontWeight: 700, color: brand.colors.ivory}}>أخطاء التثبيت</div>
            <div
              style={{
                width: 420,
                height: 18,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${fixProgress * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${brand.colors.accent}, #5FBF6A)`,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: fixProgress > 0.85 ? '#5FBF6A' : brand.colors.accent,
              }}
            >
              {fixProgress > 0.85 ? 'تمّ الإصلاح' : 'جاري الإصلاح…'}
            </div>
          </div>
        ) : null}

        {modsOp > 0.01 ? (
          <div style={{position: 'absolute', top: '24%', width: 720, height: 480, opacity: modsOp}}>
            <svg width={720} height={480} viewBox="0 0 720 480" style={{position: 'absolute', inset: 0}}>
              <circle
                cx={360}
                cy={240}
                r={150}
                fill="none"
                stroke={brand.colors.gold}
                strokeWidth={3}
                strokeDasharray={`${ringProgress * 943} 943`}
                opacity={0.85}
              />
            </svg>
            {MODULES.map((m, i) => {
              const lit = frame >= moduleOnsets[i]!;
              const angle = (-90 + i * 60) * (Math.PI / 180);
              const radius = interpolate(frame, [fHarmony, fHarmony + 24], [210, 150], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const x = 360 + Math.cos(angle) * radius;
              const y = 240 + Math.sin(angle) * radius;
              const s = lit ? pop(moduleOnsets[i]!) : 0.6;
              return (
                <div
                  key={m.label}
                  dir="rtl"
                  style={{
                    position: 'absolute',
                    left: x - 70,
                    top: y - 28,
                    width: 140,
                    height: 56,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: lit ? `${brand.colors.gold}22` : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${lit ? brand.colors.gold : '#555'}`,
                    color: lit ? brand.colors.gold : '#888',
                    fontSize: 26,
                    fontWeight: 700,
                    opacity: lit ? 1 : 0.35,
                    transform: `scale(${s})`,
                  }}
                >
                  {m.label}
                </div>
              );
            })}
            <div
              dir="rtl"
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 28,
                fontWeight: 700,
                color: brand.colors.ivory,
                opacity: ringProgress,
              }}
            >
              تناغمٌ واحد
            </div>
          </div>
        ) : null}

        <div
          style={{
            position: 'absolute',
            top: '38%',
            opacity: logoOp,
            transform: `scale(${interpolate(logoOp, [0, 1], [0.86, 1])})`,
          }}
        >
          <LogoWordmark size={128} markWidth={320} sweepAt={fLogoSafe + 4} />
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

export default S01;
