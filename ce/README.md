# Cofkans Electricals

E-commerce platform for electrical supplies, lighting, and smart-home products in Ghana.

Built with React 18, TypeScript, Tailwind CSS v4, Zustand, and Firebase backend services.

---

## Stack

- React 18.3 + TypeScript 5
- Vite for the dev server and production build
- Tailwind CSS v4 (no config file; tokens in `src/styles/theme.css`)
- Zustand with `persist` middleware for client state
- Firebase Authentication (Email/Password, Google, Phone OTP)
- Cloud Firestore for products, users, orders, carts, reviews, deliveries
- Firebase Authentication, Cloud Firestore, Storage, Cloud Functions, and App Check
- Recharts for analytics dashboards
- Motion (formerly Framer Motion) for animation

---

## Project layout

```
src/
  app/
    App.tsx                  Application root
    components/              Feature components and shared UI
    contexts/                React contexts (auth)
    pages/                   Page-level components
    data/                    Static catalogue (csvProducts)
  lib/                       Firebase, security, error handling, privacy
  stores/                    Zustand stores
  styles/                    theme.css, fonts.css, tailwind.css
firestore-security.rules     Firestore + Storage security rules
firestore.indexes.json       Composite index definitions
firebase.json                Backend deploy config for rules, indexes, storage, and functions
```

---

## Local development

```bash
pnpm install
cp .env.example .env.local       # fill in Firebase keys
pnpm dev
```

The dev server runs at `http://localhost:5173` by default.

### Required environment variables

See `.env.example`. All Firebase web-config values are public client identifiers
and are safe to ship in the bundle. The super-admin email controls the
bootstrap admin account.

---

## Local build

```bash
pnpm exec vite build
```

Output goes to `dist/` for local inspection or handoff to a non-Firebase
frontend host. Firebase is backend-only for this project.

---

## Backend deployment

Firebase is used only for backend services. Do not publish frontend assets
through Firebase.

Manual backend deploy example:

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
pnpm dev                # local dev server
pnpm exec vite build    # production build
pnpm exec vite preview  # preview built bundle
```

---

## License

Proprietary. All rights reserved.
