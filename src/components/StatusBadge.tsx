import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type StatusBadgeTone = 'success' | 'warning' | 'danger' | 'info';

export interface StatusBadgeProps {
  tone: StatusBadgeTone;
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

// Expo resolves StatusBadge.web.tsx / StatusBadge.native.tsx before this fallback.
export { StatusBadge } from './StatusBadge.native';
