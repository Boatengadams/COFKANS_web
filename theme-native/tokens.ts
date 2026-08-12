/**
 * Design tokens for the Cofkans mobile app.
 * Supporting dynamic dark/light mode tokens.
 */
import { useColorScheme } from 'react-native';

export const darkColors = {
  background: '#0B1220',
  card: '#111A2E',
  cardAlt: '#16213C',
  border: '#243049',
  primary: '#F5A524',
  primaryText: '#0B1220',
  foreground: '#F8FAFC',
  muted: '#94A3B8',
  success: '#22C55E',
  successBg: 'rgba(34,197,94,0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.12)',
  danger: '#EF4444',
  dangerBg: 'rgba(239,68,68,0.12)',
  info: '#3B82F6',
  infoBg: 'rgba(59,130,246,0.12)',
} as const;

export const lightColors = {
  background: '#F1F5F9',
  card: '#FFFFFF',
  cardAlt: '#F8FAFC',
  border: '#E2E8F0',
  primary: '#F5A524',
  primaryText: '#0B1220',
  foreground: '#0F172A',
  muted: '#64748B',
  success: '#16A34A',
  successBg: 'rgba(22,163,74,0.10)',
  warning: '#D97706',
  warningBg: 'rgba(217,119,6,0.10)',
  danger: '#DC2626',
  dangerBg: 'rgba(220,38,38,0.10)',
  info: '#2563EB',
  infoBg: 'rgba(37,99,235,0.10)',
} as const;

export const colors = darkColors; // Fallback static import

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === 'light' ? lightColors : darkColors;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const font = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;
