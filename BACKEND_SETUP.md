# Backend Setup — connecting Cofkans from head to toe

This guide explains how to wire the app to a **real Firebase backend**: Auth,
Firestore, Storage, Cloud Functions, App Check, Analytics, and every login flow.

> **Backend mode is environment-driven.** Use `EXPO_PUBLIC_APP_ENV=development`
> for staging/local backend work and `EXPO_PUBLIC_APP_ENV=production` for
> production builds. Supplying Firebase keys and staff records turns the live
> backend code paths on.

---

## 0. The one switch that turns the backend on

| File | Change | Effect |
|------|--------|--------|
| `.env.local` | `EXPO_PUBLIC_APP_ENV=development` | Enables Firebase Auth, Firestore, Functions, App Check, Analytics and payments for local web. |
| Production env | `EXPO_PUBLIC_APP_ENV=production` | Enables the same live backend path for production exports/deployments. |

Everything else in this document is about giving that live mode real
credentials and infrastructure to talk to.

---

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> → **Add project**.
2. Note your **Project ID** (the current fallback in code is `cofkanselectricals-1`).
3. **Build → Authentication → Get started.** Enable these providers:
   - **Email/Password** (staff sign-in)
   - **Google** (customer + staff social login)
   - **Phone** (customer OTP; add test numbers while developing)
   - Optionally **Apple** and **Microsoft** (the code already wires
     `appleProvider` / `microsoftProvider` in `src/lib/firebase.ts`)
4. **Build → Firestore Database → Create database** (start in production mode).
5. **Build → Storage → Get started** (product media lives here).
6. **Project settings → General → Your apps → Web app** → copy the config values.

---

## 2. Environment variables

Copy the template and fill in the values from the Firebase console:

```bash
cp .env.example .env.local
```

| Variable | Where to get it | Notes |
|----------|-----------------|-------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Project settings → Web app config | Public client key (safe to ship) |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` | |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Project settings | |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `<project-id>.appspot.com` | |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging tab | |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Web app config | |
| `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics (optional) | GA4 stream id |
| `EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` | App Check → reCAPTCHA v3 site key | Required in prod |
| `EXPO_PUBLIC_DEVELOPER_EMAIL` | Your own email | Gates the developer hub |
| `EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | Flutterwave dashboard | Use `FLWPUBK_TEST-...` while testing |
| `EXPO_PUBLIC_APP_ENV` | `development` / `production` | Controls staging vs production backend |

> `src/lib/firebase.ts` also accepts legacy `VITE_*` names, but the root Expo
> app should use `EXPO_PUBLIC_*`. If any Firebase var is missing, it falls back
> to the hardcoded `cofkanselectricals-1` config so preview keeps working. For
> your own backend, set them all explicitly.

---

## 3. App Check (reCAPTCHA v3)

`src/lib/firebase.ts` attaches an App Check token to every Firebase request so
the public web API key can't be reused outside a real browser session.

1. Firebase console → **App Check → Apps → your web app → reCAPTCHA v3.**
2. Register your domains, copy the **site key** into `EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY`.
3. **Local dev:** the code sets `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` in dev
   mode. Run the app once, copy the debug token printed in the browser console,
   and paste it into **App Check → Manage debug tokens** so your dev session is allowed.

---

## 4. Firestore security rules & indexes

Rules and composite indexes live at the Expo project root:

- `firestore-security.rules` — all read/write authorization + Storage rules
- `firestore.indexes.json` — composite index definitions
- `firebase.json` — backend deploy config for Firestore, Realtime Database, Storage, and Functions

Deploy them:

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,firestore:indexes,storage
```

> **Deploy policy:** in the primary app, deployment is done via
> `git push origin main` and GitHub Actions runs the Firebase deploy — do **not**
> run `firebase deploy` locally there. The manual command above is only for
> standing up your **own** backend project for the first time.

### Role helpers in the rules
Authorization keys off custom claims / the `users` doc role. Relevant helpers:
`isSignedIn()`, `isManager()`, `isDeveloper()`, `isAdmin()`, and
`canManageUsers()` (= manager OR developer OR admin) which gates
`users` deletes and all `staffAccounts` create/update/delete.

---

## 5. Cloud Functions (server-side backend)

The Cloud Functions have their own package at `functions`.

```bash
cd functions
npm install
npm run build          # compiles TypeScript in src/index.ts
cd ..
firebase deploy --only functions
```

Runtime is `nodejs20` (see `firebase.json`). Match Node 20 locally.

---

## 6. Auth flows — head to toe

All auth runs through `src/app/contexts/FirebaseAuthContext.tsx` and the helper
libs in `src/lib/`. When `EXPO_PUBLIC_APP_ENV` is `development` or `production`,
real Firebase calls fire on web.

### Customer sign-in
- **Google** — `signInWithPopup(googleProvider)` with redirect fallback for blocked popups.
- **Phone OTP** — Firebase Phone Auth + invisible reCAPTCHA; Ghana numbers
  normalised to `+233…`.
- **Email/password** — available; staff email/password is domain-gated.

### Staff sign-in (`/staff/login`)
- One form resolves the signed-in user's role, then auto-mounts the matching
  dashboard inside `src/app/pages/StaffPortal.tsx`.
- Role resolution order: `staffAccounts/{uid}` first, then `users.role`.
- `src/lib/staff-auth.ts` maps a resolved role → portal route.

### Developer hub
- Gated by `EXPO_PUBLIC_DEVELOPER_EMAIL` + a passcode.
- Uses `crypto-js` in `src/lib/developer-auth-service.ts` / `src/lib/dev-passcode.ts`.

### Real user provisioning
Create each staff member as a real **Firebase Auth user** and add Firestore
records so the role resolves. Two collections drive roles:

- `users/{uid}` — `{ role, displayName, email, status }` (customer, manager, technician, driver, admin)
- `staffAccounts/{uid}` — `{ staffRole, branchSlug, ... }` for portal-specific staff
  (`branch_manager`, `rider`, `front_desk`, `developer`)

Demo identities and shared demo passwords have been removed. Follow
[`ReaquireBackendSetUp.md`](./ReaquireBackendSetUp.md) to create real users,
staff records, custom claims, secrets, and deployed functions.

---

## 7. Firestore data model

| Collection | Purpose |
|------------|---------|
| `users` | Profile, role, account status |
| `staffAccounts` | Staff role + branch assignment (drives staff portals) |
| `products` | Catalogue (auto-seeded from `csvProducts` on first admin sign-in) |
| `carts` | Per-user persistent cart |
| `orders` | Placed orders with line items and totals |
| `reviews` | Product reviews (moderated) |
| `deliveries` | Driver assignment and live status |
| `serviceRequests` | Technician work orders |
| `notifications` | In-app notifications |
| `analytics` | Aggregated metrics (admin-only) |
| `securityEvents`, `auditLogs` | Append-only audit trails |

Seeding: `src/lib/firestore-seeder.ts` seeds the catalogue from
`src/app/data/csvProducts` the first time an admin signs in with the live backend.

---

## 8. Payments (Flutterwave)

- Set `EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` (test key `FLWPUBK_TEST-...` while developing).
- Checkout is in `src/app/pages/CheckoutPage.tsx`.
- Card + mobile-money (MTN MoMo, Telecel Cash, Google/Apple Pay) supported.

---

## 9. Go-live checklist

1. `EXPO_PUBLIC_APP_ENV=production` in the production environment.
2. `.env.local` or the frontend runtime env filled with real `EXPO_PUBLIC_FIREBASE_*` + App Check + developer email.
3. Auth providers enabled (Email/Password, Google, Phone, optionally Apple/Microsoft).
4. App Check reCAPTCHA v3 site key set; production domains registered.
5. `firebase deploy --only firestore:rules,firestore:indexes,storage,functions`.
6. Real Auth users + `users`/`staffAccounts` docs created for each staff member.
7. Flutterwave live key set for production.
8. `pnpm dev` → sign in as each role and confirm the correct portal loads.
9. Test the frontend locally or ship it through a non-Firebase frontend pipeline.

---

## Quick reference — files that make up the backend

| Concern | File |
|---------|------|
| Demo/live switch | `src/lib/demo-mode.ts` |
| Firebase init (Auth/DB/Storage/Functions/AppCheck/Analytics) | `src/lib/firebase.ts` |
| Auth context / session | `src/app/contexts/FirebaseAuthContext.tsx` |
| Staff role resolution | `src/lib/staff-auth.ts`, `src/lib/staff.ts` |
| Developer auth | `src/lib/developer-auth-service.ts`, `src/lib/dev-passcode.ts` |
| Firestore data access | `src/lib/firestore-service.ts`, `src/lib/firestore-schema.ts` |
| Seeding | `src/lib/firestore-seeder.ts` |
| Security/lockout | `src/lib/security-service.ts`, `src/lib/auth-hardening.ts` |
| Security rules + indexes | `firestore-security.rules`, `firestore.indexes.json` |
| Deploy config | `firebase.json` |
| Cloud Functions | `functions/src/index.ts` |
