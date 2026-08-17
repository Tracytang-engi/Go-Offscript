export const Colors = {
  cream: '#FAF5EE',
  orange: '#E8603A',
  orangeLight: '#FDE8E0',
  orangeMuted: '#F4A68A',
  amber: '#FFF3CD',
  dark: '#1A1A1A',
  muted: '#6B7280',
  white: '#FFFFFF',
  greenDot: '#22C55E',
  greenBadge: '#D1FAE5',
  salmon: '#FBBFAE',
  border: '#E5E7EB',
} as const;

export const DarkColors = {
  cream: '#1C1C1E',
  orange: '#E8603A',
  orangeLight: '#3D200F',
  orangeMuted: '#C44D29',
  amber: '#2C2400',
  dark: '#F2F2F7',
  muted: '#8E8E93',
  white: '#2C2C2E',
  greenDot: '#30D158',
  greenBadge: '#0A2E18',
  salmon: '#4A1A0A',
  border: '#38383A',
} as const;

export type ColorPalette = typeof Colors;
