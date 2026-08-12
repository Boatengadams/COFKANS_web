/**
 * Root layout (Native) — wraps the React Native portals in the native auth
 * provider and a stack navigator. Expo Router turns files in /app into routes.
 *
 * Web uses the sibling `_layout.web.tsx`, which delegates to the full web SPA
 * in `src/app/App.tsx` (that file provides its own Firebase auth + providers),
 * so this native layout must NOT import the web-only `FirebaseAuthContext`.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { AuthProvider, useAuth } from '../lib-native/auth';
import { colors } from '../theme-native/tokens';
import { StartupSplash } from './components/StartupSplash';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NativeStartupGate>
          <PortalStack />
        </NativeStartupGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function NativeStartupGate({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  return <StartupSplash ready={!loading}>{children}</StartupSplash>;
}

function PortalStack() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerShown: Platform.OS !== 'web', // Hide header on web by default as web app has its own nav
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Staff Portal', headerShown: false }} />
        <Stack.Screen name="manager/index" options={{ title: 'Manager Portal' }} />
        <Stack.Screen name="driver/index" options={{ title: 'Driver — Transfers' }} />
        <Stack.Screen name="frontdesk/index" options={{ title: 'Front Desk Portal' }} />
        <Stack.Screen name="technician/index" options={{ title: 'Technician Portal' }} />
        <Stack.Screen name="developer/index" options={{ title: 'Developer Portal' }} />
        <Stack.Screen name="branchdesk" options={{ title: 'Branch Desk Portal' }} />
        <Stack.Screen name="warehouse" options={{ title: 'Warehouse Portal' }} />
        <Stack.Screen name="accountant" options={{ title: 'Accountant Portal' }} />
        <Stack.Screen name="hr" options={{ title: 'HR Portal' }} />
        <Stack.Screen name="procurement" options={{ title: 'Procurement Portal' }} />
        <Stack.Screen name="marketing" options={{ title: 'Marketing Portal' }} />
      </Stack>
    </>
  );
}
