/** Web implementation of native device helpers.
 *
 * Keep expo-notifications out of the web module entirely. Expo Router may
 * evaluate imported modules while constructing the web route tree, and the
 * notifications package warns when its native token APIs are registered on web.
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export async function requestCameraPermissions(): Promise<boolean> {
  return true;
}

export async function getCurrentLocation(): Promise<LocationData> {
  return { latitude: 6.6745, longitude: -1.6198, accuracy: 10 };
}

export async function registerForPushNotifications(): Promise<string | null> {
  return null;
}

export async function sendLocalNotification(_title: string, _body: string): Promise<void> {
  // Push/local notifications are intentionally native-only.
}
