# Cofkans Electricals

E-commerce platform for electrical supplies, lighting, and smart-home products in Ghana.

A **single, unified Expo project** that runs the same app on iOS, Android, and Web
from one root directory. Web and native codebases are consolidated into one
"Universal" structure: Expo Router file-based routes live in `app/`, with
`.web.tsx` for the desktop version and `.tsx` for the native (React Native) version
of any screen that diverges.

---

## Stack

- React 19.1 + TypeScript 5 (Expo SDK 54)
- Expo Router (file-based navigation) for iOS / Android / Web
- Metro bundler for all platforms (web uses `expo export:web`)
- Tailwind CSS v4 (tokens in `src/styles/theme.css`)
- Zustand with `persist` middleware for client state
- Firebase Authentication (Email/Password, Google, Phone OTP) + Cloud Firestore
- Supabase (optional live backend) for the native app
- Recharts for analytics dashboards
- Motion (formerly Framer Motion) for animation

---

## Project layout (unified)

```
app/                         Expo Router routes — the single entry point for all platforms
  _layout.tsx                Root stack + AuthProvider (native) + FirebaseAuthProvider (web)
  index.web.tsx              Web storefront  → renders src/app/App.tsx
  index.tsx                  Native storefront / login landing
  login.tsx / login.web.tsx  Native / web staff login
  manager/ driver/ ...       One folder per staff portal; index.tsx = native, index.web.tsx = web
  accountant.tsx hr.tsx ...  Portals that share logic via lib-native (web uses .web.tsx twins)
app.json                     Expo config (ios/android/web, expo-router plugin)
lib-native/                  Shared native auth + data + device logic (Supabase/Firebase/AsyncStorage)
lib/  components/  theme/     Thin shims re-exporting lib-native / components-native / theme-native
src/                         The complete web app (storefront, portals, lib, stores, styles)
  app/                       Web components, contexts, pages, modules
  lib/  stores/  styles/     Web services, Zustand stores, Tailwind/styles
metro.config.js              Bundler config; resolves the `@/*` → `src/*` alias
firestore-security.rules     Firestore + Storage security rules
firebase.json                Backend deploy config for rules, indexes, storage, and functions
functions/                   Cloud Functions source and package manifest
```

---

## Current backend mode

Demo accounts and the role switcher have been removed. The app should run with
`EXPO_PUBLIC_APP_ENV=development` for staging/local backend work or
`EXPO_PUBLIC_APP_ENV=production` for production builds.

To finish the real backend setup, follow **[`ReaquireBackendSetUp.md`](./ReaquireBackendSetUp.md)**.

---

## Prerequisites

| Tool     | Version         | Notes                                             |
|----------|-----------------|---------------------------------------------------|
| Node.js  | 20.x (LTS)      | Cloud Functions run on `nodejs20`; match locally  |
| pnpm     | 9.x or newer    | `npm install -g pnpm` if you don't have it        |
| Git      | any recent      | to clone the repo                                  |
| Firebase CLI | latest      | only needed when connecting the real backend (`npm i -g firebase-tools`) |

---

## Local development

```bash
# 1. Clone and enter the project
git clone <your-repo-url> cofkans
cd cofkans

# 2. Install all dependencies (see full list below)
pnpm install

# 3. Start the app
pnpm start          # opens Expo; press w for web, i for iOS, a for Android
pnpm web            # web only
pnpm ios            # iOS simulator (macOS)
pnpm android        # Android emulator
```

The web bundle is served by the Metro bundler (no separate Vite build). Staff
portal access now requires real Firebase Auth users, Firestore staff records,
and custom claims.

### Environment variables

For the real backend, copy the template and fill it in:

```bash
cp .env.example .env.local       # fill in Firebase keys
```

All `EXPO_PUBLIC_FIREBASE_*` values are public client identifiers and safe to
ship in the bundle. Keep `EXPO_PUBLIC_DEVELOPER_EMAIL` limited to the intended
developer account. Full variable reference is in [`ReaquireBackendSetUp.md`](./ReaquireBackendSetUp.md).

---

## Dependencies

Install everything at once with `pnpm install`. The full manifest is in
`package.json`; the grouped reference below explains what each package is for.

### Runtime dependencies

**Core framework**
- `react` 18.3.1, `react-dom` 18.3.1 — UI runtime (peer deps)
- `react-router` / `react-router-dom` 7.13.0 — client-side routing

**Backend & data**
- `firebase` ^12.16.0 — Auth, Firestore, Storage, Functions, App Check, Analytics
- `crypto-js` ^4.2.0 — client-side hashing for the developer passcode/auth service
- `zustand` ^5.0.14 — global client state (with `persist`)
- `zod` ^4.4.3 — schema validation
- `date-fns` 3.6.0 — date utilities

**UI primitives (Radix)**
- `@radix-ui/react-*` — accordion, alert-dialog, aspect-ratio, avatar, checkbox,
  collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar,
  navigation-menu, popover, progress, radio-group, scroll-area, select, separator,
  slider, slot, switch, tabs, toggle, toggle-group, tooltip

**Design system / styling helpers**
- `class-variance-authority` 0.7.1, `clsx` 2.1.1, `tailwind-merge` 3.2.0 — class composition
- `tw-animate-css` 1.3.8 — animation utilities
- `next-themes` 0.4.6 — theme handling
- `lucide-react` 0.487.0 — icon set
- `@mui/material` + `@mui/icons-material` 7.3.5 with `@emotion/react` / `@emotion/styled` — MUI components
- `@popperjs/core` 2.11.8, `react-popper` 2.3.0 — positioning/popovers

**Interaction & widgets**
- `motion` 12.23.24 — animation (import from `motion/react`)
- `recharts` 2.15.2 — charts/analytics
- `react-hook-form` 7.55.0 — forms
- `react-dnd` + `react-dnd-html5-backend` 16.0.1 — drag & drop
- `react-slick` 0.31.0 — carousels
- `react-responsive-masonry` 2.7.1 — masonry grids
- `embla-carousel-react` 8.6.0 — carousel engine
- `react-day-picker` 8.10.1 — date picker
- `react-resizable-panels` 2.1.7 — resizable panels
- `input-otp` 1.4.2 — OTP inputs
- `cmdk` 1.1.1 — command palette
- `vaul` 1.1.2 — drawers
- `sonner` 2.0.3 + `react-hot-toast` ^2.6.0 — toasts/notifications
- `canvas-confetti` 1.9.4 — confetti effects

### Dev dependencies
- `tailwindcss` 4.1.12 — Tailwind v4 (no config file)
- `@types/crypto-js` ^4.2.2 — types

### Cloud Functions dependencies
The backend Cloud Functions have their **own** manifest at `functions/package.json`
and are installed separately (`npm --prefix functions install`). See
[`BACKEND_SETUP.md`](./BACKEND_SETUP.md).

---

## Local web build

```bash
pnpm build:web        # expo export:web → dist/
```

Output goes to `dist/` for local inspection or handoff to a non-Firebase
frontend host. Firebase is backend-only for this project.

---

## Backend deployment

Firebase is used only for backend services: Authentication, Firestore,
Realtime Database, Storage, Cloud Functions, App Check, and security rules.
Do not publish a frontend through Firebase.

Manual backend deploy examples:

```bash
firebase deploy --only firestore:rules,firestore:indexes,database,storage,functions
```

---

## Authentication

Three sign-in methods are exposed in `EnhancedAuthModal`:

- Google (`signInWithPopup`, with redirect fallback for blocked popups).
- Email / password (staff only; gated by `@cofkanselectricals.com` domain).
- Phone OTP (Firebase Phone Auth with invisible reCAPTCHA; Ghana numbers
  are normalised to `+233...`).

Staff role assignment is derived from email domain in
`src/lib/admin-service.ts`. The super-admin account is provisioned the first
time the configured email signs in.

---

## Data model

User-facing collections in Firestore:

| Collection        | Purpose                                              |
|-------------------|------------------------------------------------------|
| `users`           | Profile, role, account status                        |
| `products`        | Catalogue (auto-seeded from `csvProducts` on first admin sign-in) |
| `carts`           | Per-user persistent cart                             |
| `orders`          | Placed orders with line items and totals             |
| `reviews`         | Product reviews (moderated)                          |
| `deliveries`      | Driver assignment and live status                    |
| `serviceRequests` | Technician work orders                               |
| `notifications`   | In-app notifications                                 |
| `analytics`       | Aggregated metrics (admin-only)                      |
| `securityEvents`, `auditLogs` | Append-only audit trails                |

All access is governed by `firestore-security.rules`. Highlights:

- Role and account-status checks gate every write.
- Price, quantity, and string-length validation prevents tampering.
- Failed-login lockout, progressive delay, and rate limits are implemented
  client-side in `src/lib/security-service.ts`, with audit writes to
  `securityEvents`.

---

## Privacy and consent

`src/app/components/privacy/CookieConsent.tsx` implements a versioned
consent banner with a full preference centre (overview, per-category controls,
vendor registry, user rights, decision log). Categories: `essential`,
`analytics`, `personalization`, `marketing`, `sms`.

Google Analytics initialises only after the user grants the `analytics`
category (see `initAnalytics()` in `src/lib/firebase.ts`). The Global Privacy
Control signal and Do-Not-Track header are respected automatically.

---

## Payments

Checkout integrates Flutterwave for card and mobile-money payments. Saved
payment methods (MTN Mobile Money, Telecel Cash, Google Pay, Apple Pay) are
stored locally in `src/stores/payment-methods-store.ts`.

---

## SMS campaigns

Admins can compose and send SMS campaigns via Hubtel from the Admin SMS tab.
Sender-ID validation, GSM-7 segment counting, and per-recipient delivery logs
are included.

---

## Scripts

```bash
pnpm start             # Expo dev server (pick platform in the prompt)
pnpm web               # web dev server (Metro)
pnpm ios               # iOS simulator
pnpm android           # Android emulator
pnpm build:web         # production web build → dist/ (expo export:web)
pnpm export            # export for native (expo export)
pnpm typecheck         # tsc --noEmit
```

---

## License

Proprietary. All rights reserved.
