import React, {useEffect, useState} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {brand} from '../brand';
import {ensureBrandFont} from '../lib/loadFont';

export type CaptionCue = {
  text: string;
  startFrame: number;
  endFrame: number;
};

type TimestampsFile = {
  cues?: CaptionCue[];
  words?: Array<{text: string; start: number; end: number}>;
};

type CaptionProps = {
  /** Optional in-memory timestamps; otherwise loads assets/audio/vo.timestamps.json */
  timestamps?: TimestampsFile | null;
  fps?: number;
};

const normalizeCues = (timestamps: TimestampsFile | null, fps: number): CaptionCue[] => {
  if (!timestamps) {
    return [];
  }
  if (timestamps.cues?.length) {
    return timestamps.cues;
  }
  if (timestamps.words?.length) {
    return timestamps.words.map((w) => ({
      text: w.text,
      startFrame: Math.round(w.start * fps),
      endFrame: Math.round(w.end * fps),
    }));
  }
  return [];
};

/**
 * RTL caption overlay. Reads cues from assets/audio/vo.timestamps.json when available.
 */
export const Caption: React.FC<CaptionProps> = ({timestamps = null, fps = 30}) => {
  ensureBrandFont();
  const frame = useCurrentFrame();
  const [loaded, setLoaded] = useState<TimestampsFile | null>(timestamps);

  useEffect(() => {
    if (timestamps) {
      setLoaded(timestamps);
      return;
    }

    let cancelled = false;
    void fetch(staticFile('audio/vo.timestamps.json'))
      .then((res) => (res.ok ? res.json() : null))
      .then((data: TimestampsFile | null) => {
        if (!cancelled) {
          setLoaded(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [timestamps]);

  const cues = normalizeCues(loaded, fps);
  const active = cues.find((c) => frame >= c.startFrame && frame < c.endFrame);

  if (!active?.text) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 64,
        pointerEvents: 'none',
      }}
    >
      <div
        dir="rtl"
        lang="ar"
        style={{
          maxWidth: '80%',
          backgroundColor: 'rgba(26, 26, 26, 0.78)',
          color: brand.colors.ivory,
          fontFamily: brand.fontFamily,
          fontSize: 36,
          fontWeight: 500,
          lineHeight: 1.5,
          padding: '14px 28px',
          borderRadius: 8,
          borderBottom: `3px solid ${brand.colors.gold}`,
          textAlign: 'center',
        }}
      >
        {active.text}
      </div>
    </AbsoluteFill>
  );
};
