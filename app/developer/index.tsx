import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button, KpiCard, Badge } from '../../components/ui';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../lib/auth';
import { loadConfig, saveConfig, AppConfig } from '../../lib/config';
import { colors, font, spacing, radius } from '../../theme/tokens';
import {
  requestCameraPermissions,
  getCurrentLocation,
  registerForPushNotifications,
  sendLocalNotification,
} from '../../lib/native';

export default function DeveloperScreen() {
  const { user, refreshMode } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // App Config states
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [mode, setMode] = useState<'live'>('live');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [firebaseApiKey, setFirebaseApiKey] = useState('');
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState('');
  const [firebaseProjectId, setFirebaseProjectId] = useState('');
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useState('');
  const [firebaseMessagingSenderId, setFirebaseMessagingSenderId] = useState('');
  const [firebaseAppId, setFirebaseAppId] = useState('');

  // Native testing states
  const [gpsData, setGpsData] = useState<any>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [cameraAccess, setCameraAccess] = useState<boolean | null>(null);

  // System Logs
  const [logs, setLogs] = useState<string[]>([
    'System init: local development sandbox loaded.',
    'Expo router ready.',
    'Local SQLite simulation interface active.',
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await loadConfig();
        setMode(config.mode);
        setSupabaseUrl(config.supabaseUrl);
        setSupabaseAnonKey(config.supabaseAnonKey);
        setFirebaseApiKey(config.firebaseApiKey);
        setFirebaseAuthDomain(config.firebaseAuthDomain);
        setFirebaseProjectId(config.firebaseProjectId);
        setFirebaseStorageBucket(config.firebaseStorageBucket);
        setFirebaseMessagingSenderId(config.firebaseMessagingSenderId);
        setFirebaseAppId(config.firebaseAppId);
        addLog(`Loaded configuration in ${config.mode.toUpperCase()} mode.`);
      } catch (err) {
        addLog('Error loading connection configuration.');
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  if (!user) return <Redirect href="/" />;

  const handleSaveConfig = async () => {
    const newConfig: AppConfig = {
      mode,
      supabaseUrl,
      supabaseAnonKey,
      firebaseApiKey,
      firebaseAuthDomain,
      firebaseProjectId,
      firebaseStorageBucket,
      firebaseMessagingSenderId,
      firebaseAppId,
    };
    try {
      await saveConfig(newConfig);
      await refreshMode();
      addLog(`Saved app configuration. Mode: ${mode.toUpperCase()}.`);
      Alert.alert('Configuration Saved', 'Settings updated successfully. If mode was changed, app state has refreshed.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save configuration.');
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Reset Local Data',
      'This will clear all local settings, keys, and mock storage. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            addLog('Cleared local app cache and storage.');
            Alert.alert('Wiped', 'App cache cleared. Restart the app to reseed data.');
          },
        },
      ]
    );
  };

  const handleTestGPS = async () => {
    setGpsLoading(true);
    addLog('Requesting location permissions and polling GPS...');
    const data = await getCurrentLocation();
    setGpsLoading(false);
    if (data) {
      setGpsData(data);
      addLog(`GPS Success: Lat ${data.latitude}, Lng ${data.longitude}`);
    } else {
      addLog('GPS Failed or permission denied.');
    }
  };

  const handleTestPush = async () => {
    setPushLoading(true);
    addLog('Registering device for push notifications...');
    const token = await registerForPushNotifications();
    setPushLoading(false);
    if (token) {
      setPushToken(token);
      addLog(`Push Token generated: ${token.substring(0, 15)}...`);
      await sendLocalNotification(
        'Connection Test ⚡',
        'Push notifications system configured and active!'
      );
    } else {
      addLog('Notification registration failed.');
    }
  };

  const handleTestCamera = async () => {
    addLog('Requesting camera permissions...');
    const granted = await requestCameraPermissions();
    setCameraAccess(granted);
    addLog(`Camera status: ${granted ? 'GRANTED' : 'DENIED'}`);
    Alert.alert(
      'Camera Permission',
      granted ? 'Camera permissions successfully granted!' : 'Permission denied.'
    );
  };

  const tabs = [
    { id: 'overview', label: 'Console Overview', icon: 'bug-outline' as const },
    { id: 'settings', label: 'Connection Config', icon: 'settings-outline' as const },
    { id: 'native', label: 'Native Modules', icon: 'hardware-chip-outline' as const },
  ];

  return (
    <PortalLayout
      title="Developer Hub"
      subtitle="Settings panel & runtime telemetry console"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          <View style={styles.grid}>
            <KpiCard
              label="Active Mode"
              value={mode.toUpperCase()}
              sub="Connected to backends"
              icon="cloud-done-outline"
              tone="success"
            />
            <KpiCard
              label="System Health"
              value="Green"
              sub="0 crashes logged"
              icon="heart-outline"
              tone="success"
            />
          </View>

          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Runtime Operations</Text>
            <View style={{ gap: spacing.sm }}>
              <Button
                label="Wipe Local App Storage"
                variant="outline"
                icon="trash-outline"
                onPress={handleClearCache}
              />
              <Button
                label="Trigger Simulator Soft Reload"
                variant="ghost"
                icon="refresh-outline"
                onPress={() => addLog('Triggered system soft reload.')}
              />
            </View>
          </Card>

          <Card style={{ gap: spacing.sm, height: 250 }}>
            <Text style={styles.sectionTitle}>System Telemetry Output</Text>
            <ScrollView style={styles.consoleLog} nestedScrollEnabled>
              {logs.map((l, i) => (
                <Text key={i} style={styles.consoleText}>
                  {l}
                </Text>
              ))}
            </ScrollView>
          </Card>
        </View>
      )}

      {activeTab === 'settings' && (
        <ScrollView style={styles.tabContent} nestedScrollEnabled>
          {loadingConfig ? (
            <ActivityIndicator color={colors.primary} size="large" />
          ) : (
            <View style={{ gap: spacing.lg }}>
              <Card style={{ gap: spacing.md }}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.sectionTitle}>Live Integration Mode</Text>
                    <Text style={styles.hint}>Firebase / Supabase connections are required</Text>
                  </View>
                  <Switch
                    value
                    disabled
                    onValueChange={() => undefined}
                    thumbColor={colors.primary}
                    trackColor={{ false: colors.border, true: `${colors.primary}55` }}
                  />
                </View>
              </Card>

              <Card style={{ gap: spacing.md }}>
                <Text style={styles.sectionTitle}>Supabase Ledger Settings</Text>
                
                <Text style={styles.label}>Supabase Project URL</Text>
                <TextInput
                  value={supabaseUrl}
                  onChangeText={setSupabaseUrl}
                  placeholder="https://xxx.supabase.co"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Anon Public Key</Text>
                <TextInput
                  value={supabaseAnonKey}
                  onChangeText={setSupabaseAnonKey}
                  placeholder="eyJhbGciOi..."
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </Card>

              <Card style={{ gap: spacing.md }}>
                <Text style={styles.sectionTitle}>Firebase Identity Settings</Text>
                
                <Text style={styles.label}>API Key</Text>
                <TextInput
                  value={firebaseApiKey}
                  onChangeText={setFirebaseApiKey}
                  placeholder="AIzaSy..."
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Project ID</Text>
                <TextInput
                  value={firebaseProjectId}
                  onChangeText={setFirebaseProjectId}
                  placeholder="cofkans-electricals"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Auth Domain</Text>
                <TextInput
                  value={firebaseAuthDomain}
                  onChangeText={setFirebaseAuthDomain}
                  placeholder="cofkans-electricals.firebaseapp.com"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoCapitalize="none"
                />
              </Card>

              <Button
                label="Save & Sync Configuration"
                icon="cloud-upload-outline"
                onPress={handleSaveConfig}
              />
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'native' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Device Permissions & Sensors</Text>
            <Text style={styles.hint}>Verify hardware SDK integrations on tablet and mobile.</Text>
            
            <View style={styles.nativeItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nativeName}>Camera Permissions</Text>
                <Text style={styles.nativeDesc}>Required for POS barcode scanners</Text>
              </View>
              {cameraAccess !== null && (
                <Badge
                  tone={cameraAccess ? 'success' : 'danger'}
                  label={cameraAccess ? 'Granted' : 'Denied'}
                />
              )}
              <Button label="Test" variant="outline" onPress={handleTestCamera} />
            </View>

            <View style={styles.nativeItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nativeName}>Geospatial Services (Location)</Text>
                <Text style={styles.nativeDesc}>Required for driver real-time tracking</Text>
              </View>
              <Button
                label={gpsLoading ? 'Polling...' : 'Test GPS'}
                variant="outline"
                onPress={handleTestGPS}
                disabled={gpsLoading}
              />
            </View>

            {gpsData && (
              <View style={styles.resultBox}>
                <Text style={styles.resultText}>Latitude: {gpsData.latitude}</Text>
                <Text style={styles.resultText}>Longitude: {gpsData.longitude}</Text>
                <Text style={styles.resultText}>Accuracy: {gpsData.accuracy ?? 'unknown'}m</Text>
              </View>
            )}

            <View style={styles.nativeItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nativeName}>Push Notifications (APNS/FCM)</Text>
                <Text style={styles.nativeDesc}>Fires alerts on incoming transfers</Text>
              </View>
              <Button
                label={pushLoading ? 'Registering...' : 'Test Push'}
                variant="outline"
                onPress={handleTestPush}
                disabled={pushLoading}
              />
            </View>

            {pushToken && (
              <View style={styles.resultBox}>
                <Text style={styles.resultText} numberOfLines={2}>
                  Token: {pushToken}
                </Text>
              </View>
            )}
          </Card>
        </View>
      )}
    </PortalLayout>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    gap: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: font.md,
    fontWeight: '800',
    color: colors.foreground,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    fontSize: font.xs,
    color: colors.muted,
    marginTop: 2,
  },
  label: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.muted,
  },
  input: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.foreground,
    padding: spacing.md,
    fontSize: font.sm,
  },
  consoleLog: {
    backgroundColor: '#050914',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  consoleText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#38BDF8',
    marginBottom: 4,
  },
  nativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  nativeName: {
    color: colors.foreground,
    fontWeight: '700',
    fontSize: font.sm,
  },
  nativeDesc: {
    color: colors.muted,
    fontSize: font.xs,
    marginTop: 2,
  },
  resultBox: {
    backgroundColor: colors.cardAlt,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultText: {
    color: colors.success,
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 2,
  },
});
