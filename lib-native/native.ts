import * as Camera from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

/**
 * Configure Notifications handler behaviour
 */
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Request camera permissions for barcode scanning
 */
export async function requestCameraPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  try {
    const { status } = await Camera.Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    if (__DEV__) console.warn('Camera permission request failed:', e);
    return false;
  }
}

/**
 * Request location permissions and get current GPS coordinates
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
  if (Platform.OS === 'web') {
    return { latitude: 6.6745, longitude: -1.6198, accuracy: 10 }; // Kumasi defaults
  }
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      if (__DEV__) console.warn('Location permission denied');
      return null;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  } catch (e) {
    if (__DEV__) console.warn('Failed to get location:', e);
    return null;
  }
}

/**
 * Register device for Expo Push Notifications
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return 'mock-web-token';
  try {
    const permissions: any = await Notifications.getPermissionsAsync();
    let finalStatus = permissions.status;
    
    if (permissions.status !== 'granted') {
      const request: any = await Notifications.requestPermissionsAsync();
      finalStatus = request.status;
    }
    
    if (finalStatus !== 'granted') {
      if (__DEV__) console.warn('Push notification permission denied');
      return null;
    }
    
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch (e) {
    if (__DEV__) console.warn('Failed to get push token:', e);
    return null;
  }
}

/**
 * Send local notification (triggered on stock alerts/transfers)
 */
export async function sendLocalNotification(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // deliver immediately
    });
  } catch (e) {
    if (__DEV__) console.warn('Failed to schedule local notification:', e);
  }
}
