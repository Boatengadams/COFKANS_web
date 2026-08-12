import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppConfig {
  mode: 'live';
  supabaseUrl: string;
  supabaseAnonKey: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
}

const DEFAULT_CONFIG: AppConfig = {
  mode: 'live',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-key',
  firebaseApiKey: 'your-firebase-api-key',
  firebaseAuthDomain: 'your-project.firebaseapp.com',
  firebaseProjectId: 'your-project-id',
  firebaseStorageBucket: 'your-project.appspot.com',
  firebaseMessagingSenderId: '1234567890',
  firebaseAppId: '1:1234:web:abcd',
};

const CONFIG_KEY = 'cofkans:app-config';

export async function loadConfig(): Promise<AppConfig> {
  try {
    const raw = await AsyncStorage.getItem(CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore error and fallback
  }
  return DEFAULT_CONFIG;
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
