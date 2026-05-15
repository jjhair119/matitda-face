export const colors = {
  bg: '#0f1117',
  surface: '#181c26',
  surface2: '#1f2436',
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.13)',
  text: '#eef0f6',
  sub: '#7a8099',
  accent: '#b8ff4e',
  accent2: '#ff6b4a',
  accent3: '#4ec9ff',
  amber: '#fbbf24',
  teal: '#34d399',
} as const;

export const typography = {
  fontFamily: {
    sans: 'System',
  },
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 36,
  },
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
} as const;

export const theme = { colors, typography, spacing, radius } as const;
export type Theme = typeof theme;
