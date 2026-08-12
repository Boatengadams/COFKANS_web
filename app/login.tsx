/**
 * Staff login screen. Native port of the web StaffLoginPage.
 * On success, routes to the role's landing portal.
 */
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../components/ui';
import { landingFor, useAuth } from '../lib/auth';
import { colors, font, radius, spacing } from '../theme/tokens';

export default function LoginScreen() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setError(null);
  }, [email, password]);

  if (loading) return null;
  if (user) return <Redirect href={landingFor(user.role) as any} />;

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      const res = await signIn(email, password);
      if (!res.ok) {
        setError(res.error ?? 'Sign in failed.');
        return;
      }
    } catch (err: any) {
      setError(err.message ?? 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Ionicons name="flash" size={28} color={colors.primaryText} />
              </View>
              <Text style={styles.title}>Cofkans Electricals</Text>
              <Text style={styles.subtitle}>Staff Portal</Text>
            </View>

            <Card style={{ gap: spacing.md }}>
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@cofkanselectricals.com"
                keyboardType="email-address"
                icon="mail-outline"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                icon="lock-closed-outline"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button label="Sign in" icon="log-in-outline" loading={submitting} onPress={handleLogin} />
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  icon,
  ...props
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color={colors.muted} />
        <TextInput
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          style={styles.input}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  container: { padding: spacing.xl, gap: spacing.xl },
  brand: { alignItems: 'center', gap: 6 },
  logo: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.foreground },
  subtitle: { fontSize: font.sm, color: colors.muted },
  fieldLabel: { fontSize: font.xs, fontWeight: '700', color: colors.muted },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, color: colors.foreground, paddingVertical: spacing.md, fontSize: font.md },
  error: { color: colors.danger, fontSize: font.sm },
  quickLabel: { fontSize: font.xs, fontWeight: '700', color: colors.muted, textAlign: 'center' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  chip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    minWidth: 90,
  },
  chipName: { color: colors.foreground, fontWeight: '700', fontSize: font.sm },
  chipRole: { color: colors.muted, fontSize: 10, textTransform: 'capitalize', marginTop: 2 },
  hint: { color: colors.muted, fontSize: font.xs, textAlign: 'center' },
});
