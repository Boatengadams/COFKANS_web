/**
 * Small set of reusable UI primitives — the native equivalents of the web
 * app's Card / Button / Badge / KpiCard building blocks.
 */
import { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, font } from '../theme/tokens';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        isPrimary && styles.btnPrimary,
        isOutline && styles.btnOutline,
        variant === 'ghost' && styles.btnGhost,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.primaryText : colors.foreground} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={16}
              color={isPrimary ? colors.primaryText : colors.foreground}
            />
          )}
          <Text
            style={[
              styles.btnText,
              { color: isPrimary ? colors.primaryText : colors.foreground },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function Badge({
  label,
  tone = 'info',
  icon,
}: {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'info';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const map = {
    success: { bg: colors.successBg, fg: colors.success },
    warning: { bg: colors.warningBg, fg: colors.warning },
    danger: { bg: colors.dangerBg, fg: colors.danger },
    info: { bg: colors.infoBg, fg: colors.info },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      {icon && <Ionicons name={icon} size={12} color={map.fg} />}
      <Text style={[styles.badgeText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  icon,
  tone = 'info',
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
}) {
  const fg =
    tone === 'primary'
      ? colors.primary
      : { success: colors.success, warning: colors.warning, danger: colors.danger, info: colors.info }[
          tone
        ];
  return (
    <Card style={styles.kpi}>
      <View style={[styles.kpiIcon, { backgroundColor: `${fg}22` }]}>
        <Ionicons name={icon} size={18} color={fg} />
      </View>
      <Text style={styles.kpiLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </Card>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth * 3,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnOutline: { borderWidth: 1.5, borderColor: colors.border },
  btnGhost: { backgroundColor: 'transparent' },
  btnText: { fontSize: font.sm, fontWeight: '700' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: font.xs, fontWeight: '700' },
  kpi: { flex: 1, minWidth: 150, gap: 6 },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  kpiLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: colors.muted },
  kpiValue: { fontSize: font.xl, fontWeight: '800', color: colors.foreground },
  kpiSub: { fontSize: font.xs, color: colors.muted },
  sectionTitle: { fontSize: font.lg, fontWeight: '800', color: colors.foreground },
});
