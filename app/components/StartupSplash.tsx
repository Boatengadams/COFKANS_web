import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';

import cofkansLogo from '../../src/app/pages/manager-figma/imports/cofkans-BFw8TZ-5.png';

void SplashScreen.preventAutoHideAsync().catch(() => {});

const EXIT_TIME = 280;
// Keep a polished transition without holding staff users behind an artificial
// five-second delay. Auth and first render readiness still gate the exit.
const MIN_SPLASH_TIME = 1200;
const SAFETY_HIDE_TIME = Platform.OS === 'web' ? 15000 : 12000;
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
  const [assetReady, setAssetReady] = useState(Platform.OS === 'web');
  const [contentLaidOut, setContentLaidOut] = useState(Platform.OS === 'web');
  const [webAuthReady, setWebAuthReady] = useState(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return true;
    // The web layout marks auth as pending before this component mounts. If a
    // provider has already finished, do not wait for an event that has fired.
    return window.__cofkansAuthBootPending !== true;
  });
  const [reduceMotion, setReduceMotion] = useState(false);
  const [webDark, setWebDark] = useState(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return false;
    try {
      const storedTheme = window.localStorage.getItem('theme');
      return document.documentElement.classList.contains('dark') ||
        (storedTheme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      return document.documentElement.classList.contains('dark');
    }
  });
  const systemColorScheme = useColorScheme();
  const isDark = Platform.OS === 'web' ? webDark : systemColorScheme === 'dark';
  const { width } = useWindowDimensions();
  const closing = useRef(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const exitTranslate = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.94)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const nativeSplashHidden = useRef(false);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    // Metro's web bundle can display the image directly; waiting for
    // expo-asset here only adds a network/decoding round trip to first paint.
    if (Platform.OS === 'web') return;
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
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // The app is already mounted underneath the splash. Use this intentional
    // startup window to warm the browser cache for the first images it has
    // rendered, without blocking the main thread or forcing large videos to
    // download before the user asks to play them.
    const warmMedia = () => {
      const images = Array.from(document.images)
        .map(image => image.currentSrc || image.src)
        .filter(Boolean)
        .slice(0, 12);

      images.forEach(src => {
        const preload = new window.Image();
        preload.decoding = 'async';
        preload.src = src;
      });

      document.querySelectorAll<HTMLVideoElement>('video[poster]').forEach(video => {
        const poster = video.poster;
        if (!poster) return;
        const preload = new window.Image();
        preload.decoding = 'async';
        preload.src = poster;
      });
    };

    const idle = 'requestIdleCallback' in window
      ? window.requestIdleCallback(warmMedia, { timeout: 800 })
      : globalThis.setTimeout(warmMedia, 120);

    return () => {
      if ('cancelIdleCallback' in window && typeof idle === 'number') {
        window.cancelIdleCallback(idle);
      } else {
        window.clearTimeout(idle as number);
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const syncTheme = () => {
      const storedTheme = window.localStorage.getItem('theme');
      setWebDark(
        document.documentElement.classList.contains('dark') ||
        (storedTheme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches),
      );
    };

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', syncTheme);
    syncTheme();

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', syncTheme);
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
    syncAuthReady();

    return () => window.removeEventListener(WEB_AUTH_READY_EVENT, syncAuthReady);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
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

    Animated.timing(progress, {
      toValue: 1,
      duration: MIN_SPLASH_TIME,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      progress.stopAnimation();
    };
  }, [contentOpacity, contentScale, progress, reduceMotion]);

  const closeSplash = useCallback(() => {
    if (closing.current) return;
    closing.current = true;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: reduceMotion ? 180 : EXIT_TIME,
        easing: easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(exitTranslate, {
        toValue: reduceMotion ? 0 : -Math.max(width, 360),
        duration: reduceMotion ? 180 : EXIT_TIME,
        easing: easeOut,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [exitTranslate, opacity, reduceMotion, width]);

  const hideNativeSplash = useCallback(() => {
    if (nativeSplashHidden.current || Platform.OS === 'web') return;
    nativeSplashHidden.current = true;
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (!ready || !assetReady || !contentLaidOut || !webAuthReady) return;

    const remaining = Math.max(0, MIN_SPLASH_TIME - (Date.now() - mountedAt.current));
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        closeTimer = setTimeout(() => {
          hideNativeSplash();
          closeSplash();
        }, remaining);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [assetReady, closeSplash, contentLaidOut, hideNativeSplash, ready, visible, webAuthReady]);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      hideNativeSplash();
      closeSplash();
    }, SAFETY_HIDE_TIME);

    return () => clearTimeout(safetyTimer);
  }, [closeSplash, hideNativeSplash]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
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
          style={[
            styles.splash,
            Platform.OS === 'web' ? styles.webSplash : null,
            isDark ? styles.splashDark : styles.splashLight,
            { opacity, transform: [{ translateX: exitTranslate }] },
          ]}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: reduceMotion ? 1 : contentOpacity,
                transform: [{ scale: reduceMotion ? 1 : contentScale }],
              },
            ]}
          >
            <View style={[styles.logoFrame, isDark ? styles.logoFrameDark : styles.logoFrameLight]}>
              <Image source={logoSource} resizeMode="contain" style={styles.logo} />
            </View>
            <View style={styles.progressTrack}>
              {!reduceMotion ? (
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: progressWidth },
                  ]}
                />
              ) : <View style={[styles.progressFill, { width: '100%' }]} />}
            </View>
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
  splashLight: ViewStyle;
  splashDark: ViewStyle;
  content: ViewStyle;
  logoFrame: ViewStyle;
  logoFrameLight: ViewStyle;
  logoFrameDark: ViewStyle;
  logo: ImageStyle;
  progressTrack: ViewStyle;
  progressFill: ViewStyle;
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
  },
  splashLight: {
    backgroundColor: '#FBF9FF',
  },
  splashDark: {
    backgroundColor: '#090C14',
  },
  webSplash: {
    position: 'fixed' as never,
    width: '100vw' as never,
    height: '100vh' as never,
  },
  content: {
    width: '80%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 24,
  },
  logoFrame: {
    width: '100%',
    maxWidth: 320,
    minHeight: 128,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 14,
    shadowColor: '#8B6B2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 5,
  },
  logoFrameLight: {
    backgroundColor: '#050914',
    borderWidth: 1,
    borderColor: '#C9A96E',
  },
  logoFrameDark: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logo: {
    width: '100%',
    maxWidth: 300,
    height: 104,
  },
  progressTrack: {
    width: 190,
    height: 4,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(201, 169, 110, 0.16)',
  },
  progressFill: {
    width: '0%',
    height: 4,
    borderRadius: 999,
    backgroundColor: '#C9A96E',
  },
});
