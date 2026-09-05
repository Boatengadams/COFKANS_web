/**
 * PWA runtime setup.
 *
 * The Figma preview auto-generates the HTML entrypoint, so we can't ship a
 * static `index.html` with a <link rel="manifest"> or meta tags. Instead we
 * inject everything at runtime, once, from the app root:
 *
 *   • a Web App Manifest (as a blob URL) so the app is installable
 *   • theme-color + apple-mobile-web-app meta so the OS chrome matches
 *   • `viewport-fit=cover` so CSS `env(safe-area-inset-*)` actually resolves
 *     on notched devices (iPhone, Android cutouts)
 *   • capture of the `beforeinstallprompt` event so a portal can offer an
 *     "Install app" button on demand
 *
 * All of it is idempotent — safe to call on every mount.
 */

import { Platform } from 'react-native';

const THEME_COLOR = '#0F5132'; // enterprise green (matches .erp-theme)
const BG_COLOR = '#0B1F17';

let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Event fired on window when installability changes (custom). */
export const PWA_INSTALLABLE_EVENT = 'cofkans:pwa-installable';

function upsertMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function ensureViewport() {
  // Widen the existing viewport meta to cover the safe area, preserving anything
  // already set. Create it if absent.
  let el = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!el) {
    el = document.createElement('meta');
    el.name = 'viewport';
    el.content = 'width=device-width, initial-scale=1';
    document.head.appendChild(el);
  }
  if (!/viewport-fit/.test(el.content)) {
    el.content = `${el.content}, viewport-fit=cover`;
  }
}

/**
 * Install the manifest + meta tags. `iconUrl` should be the imported logo asset
 * (a hashed URL Vite emits), so the installed icon is the real brand mark.
 */
type MetroAsset = string | { uri?: string; width?: number; height?: number };

function resolveAssetUrl(asset: MetroAsset): string {
  const uri = typeof asset === 'string' ? asset : asset.uri;
  if (!uri) return '/favicon.png';

  // Manifest `src` must be a string URL. Metro may provide an asset module
  // object on web, so resolve its URI against the current origin first.
  try {
    return new URL(uri, window.location.origin).href;
  } catch {
    return uri;
  }
}

export function setupPwa(iconAsset: MetroAsset) {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || typeof window === 'undefined') return;

  const iconUrl = resolveAssetUrl(iconAsset);
  const appOrigin = window.location.origin;

  ensureViewport();
  upsertMeta('theme-color', THEME_COLOR);
  upsertMeta('mobile-web-app-capable', 'yes');
  upsertMeta('apple-mobile-web-app-capable', 'yes');
  upsertMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  upsertMeta('apple-mobile-web-app-title', 'Cofkans Electricals');
  upsertMeta('application-name', 'Cofkans Electricals');

  // Apple touch icon (iOS home-screen icon).
  let apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  if (!apple) {
    apple = document.createElement('link');
    apple.rel = 'apple-touch-icon';
    document.head.appendChild(apple);
  }
  apple.href = iconUrl;
  apple.sizes.value = '512x512';
  apple.type = 'image/png';

  // Build the manifest as a blob so we don't need a static file.
  const manifest = {
    name: 'Cofkans Electricals',
    short_name: 'Cofkans',
    description: 'Lighting and electrical products for homes and businesses in Ghana.',
    // The manifest is served from a blob URL. Absolute origin URLs are
    // required here because `/` cannot be resolved relative to `blob:`.
    start_url: `${appOrigin}/`,
    scope: `${appOrigin}/`,
    display: 'standalone',
    orientation: 'any',
    background_color: BG_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: iconUrl, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
  const url = URL.createObjectURL(blob);
  let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    document.head.appendChild(link);
  } else if (link.href.startsWith('blob:')) {
    URL.revokeObjectURL(link.href);
  }
  link.href = url;
}

/** Wire up install-prompt capture. Returns a cleanup function. */
export function watchInstallPrompt(): () => void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return () => {};
  const onBefore = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent(PWA_INSTALLABLE_EVENT, { detail: { installable: true } }));
  };
  const onInstalled = () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent(PWA_INSTALLABLE_EVENT, { detail: { installable: false } }));
  };
  window.addEventListener('beforeinstallprompt', onBefore);
  window.addEventListener('appinstalled', onInstalled);
  return () => {
    window.removeEventListener('beforeinstallprompt', onBefore);
    window.removeEventListener('appinstalled', onInstalled);
  };
}

export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/** Trigger the native install prompt. Resolves true if the user accepted. */
export async function promptInstall(): Promise<boolean> {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !deferredPrompt) return false;
  const prompt = deferredPrompt;
  // Clear first so repeated desktop clicks cannot invoke the one-shot browser
  // prompt twice while the user-choice promise is pending.
  deferredPrompt = null;
  try {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    return outcome === 'accepted';
  } finally {
    window.dispatchEvent(new CustomEvent(PWA_INSTALLABLE_EVENT, { detail: { installable: false } }));
  }
}
