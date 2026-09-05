import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, font } from '../../theme/tokens';
import type { StatusBadgeProps } from './StatusBadge';

const toneStyles = {
  success: { backgroundColor: colors.successBg, color: colors.success },
  warning: { backgroundColor: colors.warningBg, color: colors.warning },
  danger: { backgroundColor: colors.dangerBg, color: colors.danger },
  info: { backgroundColor: colors.infoBg, color: colors.info },
} as const;

export function StatusBadge({ tone, children, style }: StatusBadgeProps) {
  const palette = toneStyles[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.backgroundColor }, style]}>
      <Text style={[styles.label, { color: palette.color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, alignSelf: 'flex-start' },
  label: { fontSize: font.xs, fontWeight: '600', lineHeight: font.xs },
});
