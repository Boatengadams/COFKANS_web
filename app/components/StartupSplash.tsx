import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';

import cofkansLogo from '../../src/imports/cofkans.png';

void SplashScreen.preventAutoHideAsync().catch(() => {});

const EXIT_TIME = 420;
const SAFETY_HIDE_TIME = 12000;
const WEB_AUTH_READY_EVENT = 'cofkans:auth-ready';
const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const logoSource = cofkansLogo as ImageSourcePropType;

declare global {
  interface Window {
    __cofkansAuthBootPending?: boolean;
  }
}

export function StartupSplash({
  children,
  ready = true,
}: {
  children: ReactNode;
  ready?: boolean;
}) {
  const [visible, setVisible] = useState(true);
  const [assetReady, setAssetReady] = useState(false);
  const [contentLaidOut, setContentLaidOut] = useState(false);
  const [webAuthReady, setWebAuthReady] = useState(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return true;
    // Start as false; auth must explicitly signal ready via event.
    // This prevents incorrectly thinking auth is ready before FirebaseAuthProvider mounts.
    return false;
  });
  const [reduceMotion, setReduceMotion] = useState(false);
  const closing = useRef(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.94)).current;
  const glowOpacity = useRef(new Animated.Value(0.62)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const nativeSplashHidden = useRef(false);

  useEffect(() => {
    let mounted = true;

    Asset.loadAsync([cofkansLogo])
      .catch(() => {})
      .finally(() => {
        if (mounted) setAssetReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // On web, delay contentLaidOut until the next frame to ensure children have rendered
    if (Platform.OS === 'web') {
      const frameId = requestAnimationFrame(() => setContentLaidOut(true));
      return () => cancelAnimationFrame(frameId);
    }
    // On native, onLayout suffices
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Listen for auth-ready signal. Update state when the signal fires.
    const syncAuthReady = () => setWebAuthReady(!window.__cofkansAuthBootPending);
    window.addEventListener(WEB_AUTH_READY_EVENT, syncAuthReady);

    return () => window.removeEventListener(WEB_AUTH_READY_EVENT, syncAuthReady);
  }, []);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});

    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    return () => subscription?.remove?.();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      contentOpacity.setValue(1);
      contentScale.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 850,
        easing: easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: 1,
        duration: 850,
        easing: easeOut,
        useNativeDriver: true,
      }),
    ]).start();

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.62,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const progressLoop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1250,
        easing: easeOut,
        useNativeDriver: true,
      }),
    );

    glowLoop.start();
    progressLoop.start();

    return () => {
      glowLoop.stop();
      progressLoop.stop();
    };
  }, [contentOpacity, contentScale, glowOpacity, progress, reduceMotion]);

  const closeSplash = useCallback(() => {
    if (closing.current) return;
    closing.current = true;

    Animated.timing(opacity, {
      toValue: 0,
      duration: reduceMotion ? 180 : EXIT_TIME,
      easing: easeOut,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  }, [opacity, reduceMotion]);

  const hideNativeSplash = useCallback(() => {
    if (nativeSplashHidden.current || Platform.OS === 'web') return;
    nativeSplashHidden.current = true;
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (!ready || !assetReady || !contentLaidOut || !webAuthReady) return;

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        hideNativeSplash();
        closeSplash();
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [assetReady, closeSplash, contentLaidOut, hideNativeSplash, ready, visible, webAuthReady]);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      hideNativeSplash();
      closeSplash();
    }, SAFETY_HIDE_TIME);

    return () => clearTimeout(safetyTimer);
  }, [closeSplash, hideNativeSplash]);

  const progressTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 220],
  });

  return (
    <View style={styles.shell}>
      <View
        onLayout={Platform.OS !== 'web' ? () => setContentLaidOut(true) : undefined}
        style={styles.contentHost}
      >
        {children}
      </View>
      {visible ? (
        <Animated.View
          accessibilityLabel="Cofkans Electricals is preparing your experience"
          accessibilityRole="progressbar"
          pointerEvents="auto"
          style={[styles.splash, Platform.OS === 'web' ? styles.webSplash : null, { opacity }]}
        >
          <Animated.View style={[styles.glow, { opacity: reduceMotion ? 0.72 : glowOpacity }]} />
          <Animated.View
            style={[
              styles.content,
              {
                opacity: reduceMotion ? 1 : contentOpacity,
                transform: [{ scale: reduceMotion ? 1 : contentScale }],
              },
            ]}
          >
            <Image source={logoSource} resizeMode="contain" style={styles.logo} />
            <View style={styles.progressTrack}>
              {!reduceMotion ? (
                <Animated.View
                  style={[
                    styles.progressLight,
                    { transform: [{ translateX: progressTranslate }] },
                  ]}
                />
              ) : null}
            </View>
            <Text style={styles.caption}>Preparing your experience</Text>
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create<{
  shell: ViewStyle;
  contentHost: ViewStyle;
  splash: ViewStyle;
  webSplash: ViewStyle;
  glow: ViewStyle;
  content: ViewStyle;
  logo: ImageStyle;
  progressTrack: ViewStyle;
  progressLight: ViewStyle;
  caption: TextStyle;
}>({
  shell: {
    flex: 1,
    minHeight: '100%',
    position: 'relative',
  },
  contentHost: {
    flex: 1,
    minHeight: '100%',
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#fbf9ff',
  },
  webSplash: {
    position: 'fixed' as never,
    width: '100vw' as never,
    height: '100vh' as never,
  },
  glow: {
    position: 'absolute',
    width: 440,
    maxWidth: '78%',
    aspectRatio: 1,
    borderRadius: 220,
    backgroundColor: 'rgba(126, 87, 194, 0.14)',
    transform: [{ scale: 1.02 }],
  },
  content: {
    width: '76%',
    maxWidth: 304,
    alignItems: 'center',
    gap: 18,
  },
  logo: {
    width: '86%',
    maxWidth: 252,
    height: 104,
  },
  progressTrack: {
    width: 140,
    height: 2,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(103, 58, 183, 0.16)',
  },
  progressLight: {
    width: 68,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#6f42c1',
  },
  caption: {
    color: 'rgba(52, 34, 79, 0.54)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
});
