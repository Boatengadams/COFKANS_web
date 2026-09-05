/**
 * Catalogue of every cookie / browser-storage key we set, grouped by purpose.
 * Surfaces in the consent center for GDPR Article 13/14 transparency.
 */

export type ConsentCategory = 'essential' | 'analytics' | 'personalization' | 'marketing' | 'sms';

export interface CookieDescriptor {
  key: string;
  type: 'cookie' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  vendor: string;
  purpose: string;
  retention: string;
}

export interface Vendor {
  name: string;
  url: string;
  policyUrl: string;
  purpose: string;
  region: string;
}

export const COOKIE_CATEGORIES: Record<ConsentCategory, {
  title: string;
  short: string;
  long: string;
  required: boolean;
  cookies: CookieDescriptor[];
}> = {
  essential: {
    title: 'Strictly necessary',
    short: 'Sign-in, cart and checkout. Always on.',
    long: 'These are required for the site to function: keeping you signed in, remembering your basket, processing payments and protecting against fraud. They cannot be disabled.',
    required: true,
    cookies: [
      { key: 'cofkans:auth', type: 'localStorage', vendor: 'Cofkans', purpose: 'Session', retention: 'Until sign-out' },
      { key: 'cofkans:cart', type: 'localStorage', vendor: 'Cofkans', purpose: 'Shopping basket', retention: '30 days' },
      { key: 'cofkans:csrf', type: 'cookie',       vendor: 'Cofkans', purpose: 'Anti-CSRF token', retention: 'Session' },
      { key: 'cofkans:payment-methods', type: 'localStorage', vendor: 'Cofkans', purpose: 'Saved payment shortcuts', retention: 'Until removed' },
    ],
  },
  analytics: {
    title: 'Analytics',
    short: 'Aggregate, anonymous traffic + performance data.',
    long: 'Helps us understand which pages are popular, where users encounter errors, and how the site performs. No data is sold; identifiers are pseudonymised.',
    required: false,
    cookies: [
      { key: 'cofkans:personalization', type: 'localStorage', vendor: 'Cofkans', purpose: 'Aggregate event log', retention: '90 days rolling' },
      { key: '_fb_*', type: 'localStorage', vendor: 'Firebase Analytics', purpose: 'Page-view & event counts', retention: '14 months' },
    ],
  },
  personalization: {
    title: 'Personalisation',
    short: 'Surfaces products you\'re likely to want.',
    long: 'Powers the "For You" rail, search ranking and product recommendations using your views, dwell time, wishlist and purchase history on this device.',
    required: false,
    cookies: [
      { key: 'cofkans:personalization', type: 'localStorage', vendor: 'Cofkans', purpose: 'Behaviour + scored categories', retention: '90 days rolling' },
      { key: 'cofkans:recent-searches', type: 'localStorage', vendor: 'Cofkans', purpose: 'Quick-fill of past queries', retention: 'Until cleared' },
    ],
  },
  marketing: {
    title: 'Marketing',
    short: 'Tailored banners & in-app promos.',
    long: 'Lets us decide which promotional banner to show and which deals to highlight on your home page, based on the categories you browse most.',
    required: false,
    cookies: [
      { key: 'cofkans:promo-seen', type: 'localStorage', vendor: 'Cofkans', purpose: 'De-duplicates promos so you don\'t see the same one twice', retention: '30 days' },
    ],
  },
  sms: {
    title: 'SMS marketing',
    short: 'Promotional SMS sent via Hubtel.',
    long: 'Allows Cofkans to text you about offers and new arrivals. You can opt-out at any time from your account settings, or reply STOP to any message.',
    required: false,
    cookies: [
      { key: 'cofkans:sms-optin', type: 'localStorage', vendor: 'Hubtel', purpose: 'Records your SMS opt-in for compliance', retention: 'Until opted out' },
    ],
  },
};

export const VENDORS: Vendor[] = [
  { name: 'Cofkans',           url: 'https://cofkanselectricals.com',  policyUrl: '#privacy', purpose: 'First-party site, account & cart',  region: 'Ghana' },
  { name: 'Firebase (Google)', url: 'https://firebase.google.com',     policyUrl: 'https://policies.google.com/privacy', purpose: 'Auth + storage backend', region: 'Global' },
  { name: 'Hubtel',            url: 'https://hubtel.com',              policyUrl: 'https://hubtel.com/privacy',          purpose: 'SMS delivery',           region: 'Ghana' },
  { name: 'MTN MoMo',          url: 'https://mtn.com.gh',              policyUrl: 'https://mtn.com.gh/privacy-policy',   purpose: 'Mobile money processing', region: 'Ghana' },
  { name: 'Telecel Cash',      url: 'https://telecel.com.gh',          policyUrl: 'https://telecel.com.gh/privacy',      purpose: 'Mobile money processing', region: 'Ghana' },
  { name: 'Google Pay',        url: 'https://pay.google.com',          policyUrl: 'https://policies.google.com/privacy', purpose: 'Wallet checkout',         region: 'Global' },
  { name: 'Apple Pay',         url: 'https://apple.com/apple-pay',     policyUrl: 'https://apple.com/legal/privacy',     purpose: 'Wallet checkout',         region: 'Global' },
  { name: 'Unsplash',          url: 'https://unsplash.com',            policyUrl: 'https://unsplash.com/privacy',        purpose: 'Product image fallbacks', region: 'Global' },
];
