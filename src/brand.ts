export const brand = {
  colors: {
    gold: '#C9A227',
    ink: '#0E0E12',
    ivory: '#F7F3EB',
    accent: '#8B1E1E',
    goldGlow: 'rgba(201, 162, 39, 0.12)',
  },
  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
} as const;

export type BrandColors = typeof brand.colors;
