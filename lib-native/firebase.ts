import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadConfig } from './config';

let firebaseApp: any = null;
let firebaseAuth: any = null;

export async function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;

  const config = await loadConfig();
  if (config.mode === 'live' && config.firebaseApiKey) {
    const firebaseConfig = {
      apiKey: config.firebaseApiKey,
      authDomain: config.firebaseAuthDomain,
      projectId: config.firebaseProjectId,
      storageBucket: config.firebaseStorageBucket,
      messagingSenderId: config.firebaseMessagingSenderId,
      appId: config.firebaseAppId,
    };

    try {
      if (getApps().length === 0) {
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        firebaseApp = getApp();
      }
      return firebaseApp;
    } catch (e) {
      console.error('Failed to initialize Firebase App:', e);
    }
  }
  return null;
}

export async function getFirebaseAuth() {
  if (firebaseAuth) return firebaseAuth;

  const app = await getFirebaseApp();
  if (app) {
    try {
      const { getReactNativePersistence } = require('firebase/auth');
      firebaseAuth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
      return firebaseAuth;
    } catch (e) {
      console.error('Failed to initialize Firebase Auth:', e);
    }
  }
  return null;
}
