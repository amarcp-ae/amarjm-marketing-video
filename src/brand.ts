export const brand = {
  colors: {
    gold: '#C9A227',
    ink: '#1A1A1A',
    ivory: '#F7F3EB',
    accent: '#8B1E1E',
  },
  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
} as const;

export type BrandColors = typeof brand.colors;
