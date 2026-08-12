# Required Backend Setup

Demo accounts and the role switcher have been removed from the app. Complete these steps so the system runs on real Firebase, real staff accounts, and real payment webhooks.

## 1. Confirm The Firebase Projects

This repo is already linked to:

- Staging: `cofkans-staging`
- Production: `cofkanselectricals-app`

Check access:

```bash
firebase projects:list
firebase use cofkans-staging
```

## 2. Fill The Environment Files

Use staging values for local development:

```bash
cp .env.example .env.local
```

Required local values:

```bash
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=cofkans-staging.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=cofkans-staging
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=cofkans-staging.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY=
EXPO_PUBLIC_DEVELOPER_EMAIL=
EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=
```

Use production values in `.env.production.local`:

```bash
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_FIREBASE_PROJECT_ID=cofkanselectricals-app
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=cofkanselectricals-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=cofkanselectricals-app.firebasestorage.app
```

Get missing Firebase web config values with:

```bash
firebase apps:list --project=cofkans-staging
firebase apps:sdkconfig WEB <STAGING_WEB_APP_ID> --project=cofkans-staging
firebase apps:list --project=cofkanselectricals-app
firebase apps:sdkconfig WEB <PRODUCTION_WEB_APP_ID> --project=cofkanselectricals-app
```

## 3. Enable Firebase Auth Providers

In Firebase Console, enable these providers for staging and production:

- Email/Password
- Google
- Phone
- Apple, if you plan to use Apple login
- Microsoft, if you plan to use Microsoft login

Add authorized domains for every site domain you will use.

## 4. Create Real Staff Users

Create each staff member in Firebase Authentication. Do not use demo passwords.

For each staff user, create matching documents:

`users/{uid}`:

```json
{
  "uid": "<firebase-auth-uid>",
  "email": "staff@cofkanselectricals.com",
  "displayName": "Staff Name",
  "role": "manager",
  "isDeveloper": false,
  "emailVerified": false,
  "mustChangePassword": true,
  "createdAt": "<server timestamp>",
  "updatedAt": "<server timestamp>"
}
```

`staffAccounts/{uid}`:

```json
{
  "uid": "<firebase-auth-uid>",
  "email": "staff@cofkanselectricals.com",
  "displayName": "Staff Name",
  "role": "front_desk",
  "branchSlug": "kumasi-asuoyeboa",
  "active": true,
  "mustResetPassword": true,
  "createdAt": "<server timestamp>",
  "updatedAt": "<server timestamp>"
}
```

Supported staff roles:

- `manager`
- `developer`
- `branch_manager`
- `front_desk`
- `branch_desk`
- `rider`
- `driver`
- `technician`
- `warehouse`
- `accountant`
- `hr`
- `procurement`
- `marketing`
- `management_support`
- `support_agent`

Set Firebase custom claims for staff users:

```json
{
  "staff": true,
  "role": "<staff-role>",
  "branchSlug": "<branch-slug-if-needed>"
}
```

For the first developer account, also set:

```json
{
  "developer": true
}
```

## 5. Deploy Rules And Indexes

Validate locally:

```bash
firebase emulators:exec --only firestore,database,storage true
```

Deploy staging:

```bash
firebase deploy --only firestore:rules,firestore:indexes,database,storage --project=cofkans-staging
```

Deploy production:

```bash
firebase deploy --only firestore:rules,firestore:indexes,database,storage --project=cofkanselectricals-app
```

Note: production currently has no Realtime Database instance. Create one in Firebase Console before deploying database rules there, or remove Realtime Database from `firebase.json` if the app will not use it.

## 6. Configure Cloud Functions Secrets

The functions use Paystack for authoritative payment confirmation.

Set the secret in staging:

```bash
firebase functions:secrets:set PAYSTACK_SECRET_KEY --project=cofkans-staging
```

Set the secret in production:

```bash
firebase functions:secrets:set PAYSTACK_SECRET_KEY --project=cofkanselectricals-app
```

Use the Paystack secret key, not the public key.

## 7. Build And Deploy Cloud Functions

Build locally:

```bash
npm run functions:build
```

Deploy staging:

```bash
firebase deploy --only functions --project=cofkans-staging
```

Deploy production:

```bash
firebase deploy --only functions --project=cofkanselectricals-app
```

Functions expected after deploy:

- `paystackWebhook`
- `provisionStaffAccount`
- `setDeveloperClaim`
- `enrollTotp`
- `verifyTotp`
- `auditLog`
- `setFeatureFlag`
- `forceSignOut`

Check:

```bash
firebase functions:list --project=cofkans-staging
firebase functions:list --project=cofkanselectricals-app
```

## 8. Connect Paystack Webhook

After functions deploy, copy the HTTPS URL for:

```text
paystackWebhook
```

In Paystack Dashboard:

1. Go to Developers > Webhooks.
2. Add the function URL.
3. Enable transaction events, especially `charge.success`.
4. Test a payment and confirm the matching Firestore `orders` document changes to `paymentStatus: "paid"`.

## 9. Configure App Check

In Firebase Console:

1. Open App Check.
2. Register the web app.
3. Choose reCAPTCHA v3.
4. Add local/staging/production domains.
5. Copy the site key to `EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY`.
6. Add a debug token for local development if App Check blocks local requests.

## 10. Seed Real Business Data

Add these collections in Firestore before using the app fully:

- `users`
- `staffAccounts`
- `branches`
- `products`
- `orders`
- `deliveries`
- `serviceRequests`
- `supportTickets`
- `featureFlags`
- `auditLogs`
- `securityEvents`

The product seeder is in `src/lib/firestore-seeder.ts`. Run it only after an admin/developer account exists.

## 11. Verify The System

Run:

```bash
./verify-firebase-setup.sh
npm run functions:build
firebase emulators:exec --only firestore,database,storage true
firebase functions:list --project=cofkans-staging
firebase firestore:databases:list --project=cofkans-staging
firebase apps:list --project=cofkans-staging
```

Then test these flows:

- Staff email/password login
- Developer login and TOTP enrollment
- Staff account provisioning
- Product read/write permissions
- Checkout and Paystack webhook confirmation
- Order status updates
- Storage image upload
- Sign out from all devices

## 12. Current Known Gaps To Finish

- Cloud Functions are not currently deployed in staging or production.
- Production has no Realtime Database instance.
- Full app TypeScript check currently fails in unrelated UI/schema files.
- Real staff users and custom claims must be created before the portals can replace demo access.
