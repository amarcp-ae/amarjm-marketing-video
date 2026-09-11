import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {ensureBrandFont} from '../lib/loadFont';
import {tokenOnsetFrames, currentSpokenWord} from '../lib/wordTiming';

export type HeadlineToken = {
  text: string;
  gold?: boolean;
};

type KineticHeadlineProps = {
  tokens: HeadlineToken[];
  sceneId?: string;
  debug?: boolean;
};

/**
 * Top-band RTL kinetic headline (max 20% frame height).
 * Word onsets from ElevenLabs alignment → word map.
 */
export const KineticHeadline: React.FC<KineticHeadlineProps> = ({
  tokens,
  sceneId,
  debug = false,
}) => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const bandH = Math.round(height * 0.2);

  const onsets = useMemo(
    () =>
      sceneId
        ? tokenOnsetFrames(
            sceneId,
            tokens.map((t) => t.text),
            fps,
          )
        : tokens.map((_, i) => i * 5),
    [sceneId, tokens, fps],
  );

  const spoken = sceneId ? currentSpokenWord(sceneId, frame / fps) : null;

  return (
    <>
      <div
        dir="rtl"
        lang="ar"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: bandH,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingInline: 64,
          boxSizing: 'border-box',
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(14,14,18,0.88) 0%, rgba(14,14,18,0.45) 70%, transparent 100%)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            fontFamily: brand.fontFamily,
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.15,
            color: brand.colors.ivory,
            textShadow: '0 6px 24px rgba(0,0,0,0.55)',
            maxWidth: '96%',
          }}
        >
          {tokens.map((token, i) => {
            // Fade in on VO onset of first token (or this token), then HOLD for whole scene.
            const firstOnset = onsets[0] ?? 0;
            const voStart = Math.min(onsets[i] ?? firstOnset, firstOnset);
            const appear = interpolate(frame, [Math.max(0, firstOnset), Math.max(0, firstOnset) + 6], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const y = interpolate(frame, [Math.max(0, firstOnset), Math.max(0, firstOnset) + 8], [14, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            // Per-word gold pop when that token's onset hits; stay visible after band fade-in.
            const wordHit = interpolate(
              frame,
              [onsets[i] ?? firstOnset, (onsets[i] ?? firstOnset) + 4],
              [0.85, 1],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
            );
            return (
              <span
                key={`${token.text}-${i}`}
                style={{
                  display: 'inline-block',
                  marginInline: 10,
                  opacity: appear,
                  transform: `translateY(${y}px) scale(${wordHit})`,
                  color: token.gold ? brand.colors.gold : brand.colors.ivory,
                }}
              >
                {token.text}
              </span>
            );
          })}
        </div>
      </div>
      {debug && spoken ? (
        <AbsoluteFill style={{pointerEvents: 'none', zIndex: 90}}>
          <div
            style={{
              position: 'absolute',
              left: 140,
              bottom: 24,
              background: 'rgba(0,0,0,0.75)',
              color: '#7CFF7C',
              fontFamily: 'monospace',
              fontSize: 18,
              padding: '8px 14px',
              borderRadius: 6,
            }}
          >
            {spoken.word} @ {spoken.startSec.toFixed(3)}s
          </div>
        </AbsoluteFill>
      ) : null}
    </>
  );
};
