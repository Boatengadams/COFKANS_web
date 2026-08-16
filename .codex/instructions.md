# Codex Project Instructions

## Project Shape

This repository is a unified Cofkans Electricals Expo application.

- Root app: Expo SDK 54, Expo Router, React 19, React Native 0.81, React Native Web, TypeScript.
- Web storefront and portals live mostly under `src/` and are mounted by Expo Router routes in `app/`.
- Styling uses Tailwind CSS v4, custom CSS tokens, Radix/shadcn-style components, MUI, Motion, and lucide icons.
- Backend is Firebase: Auth, Firestore, Realtime Database rules, Firebase Functions v2, Firebase Storage, App Check, Analytics.
- Payments use Paystack through server-authoritative Firebase Functions and a client popup helper.
- Supabase is used for public media/storage helpers.
- Root package workflow uses `pnpm`; `functions/` deliberately keeps its separate `npm` + `package-lock.json` workflow.
- `ce/` is a separate Vite React surface. Treat it as separate unless the task explicitly targets it.

## Working Rules

- Inspect relevant files before modifying them.
- Preserve the existing Expo/Firebase architecture unless there is a clear technical reason to change it.
- Do not add services, frameworks, or packages unless they are directly justified by the task.
- Do not touch secrets or print values from `.env*`, service-account files, Firebase tokens, API keys, payment keys, or credentials.
- Never fabricate credentials. For credential-dependent flows, document the required setup or use emulators/mocks.
- Keep TypeScript strict and prefer typed, testable helpers for business logic.
- Reuse existing components, tokens, hooks, and service boundaries before adding abstractions.
- Keep functions/components maintainable; avoid broad rewrites and unrelated formatting churn.

## Security

- Treat Firebase rules as production security boundaries. Inspect all app reads/writes before changing Firestore, Storage, or Realtime Database rules.
- Privileged access should rely on Firebase Auth custom claims and server-side Functions. Do not introduce client-only authorization.
- Do not hardcode privileged emails, API keys, secrets, tokens, or passwords.
- Keep Paystack amounts and payment verification server-authoritative. Clients may hold public keys only.
- Validate and sanitize all user-controlled inputs with zod or existing validators before writes.
- Avoid `innerHTML`, dynamic script injection, unsafe redirects, broad CORS, unbounded uploads, and unrestricted database paths.
- Use Firebase Functions v2 callable/request handlers for privileged mutations.

## UI And Accessibility

- Do not redesign the app unless explicitly asked.
- Match the existing visual system: Tailwind v4 tokens, Radix/shadcn-style primitives, MUI where already used, lucide icons for controls.
- For meaningful UI changes, handle loading, error, and empty states.
- Check responsive layouts on desktop and mobile viewports.
- Preserve keyboard navigation, focus states, semantic controls, and screen-reader labels.
- Respect reduced-motion behavior where animations are introduced or changed.

## Testing

- Add focused tests for meaningful logic and security-sensitive changes.
- Use Vitest for unit tests in root app code.
- Use Playwright for browser smoke/regression checks when UI behavior changes.
- Do not require production credentials for automated tests. Prefer mocks, emulators, or entry-point checks.
- Before finishing code changes, run the relevant subset of:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `npm --prefix functions run build`
  - `pnpm build:web`
  - `pnpm test:e2e`

## Firebase Functions

- Functions target Node 20. Use Node 20 for local validation.
- Keep `functions/package.json` and `functions/package-lock.json` managed by npm.
- Do not move secrets into frontend code. Use Firebase Functions secrets/config for secret values.
- Keep payment, staff provisioning, developer claims, TOTP, audit logging, and fulfillment mutations server-side.

## Deployment And CI

- Do not deploy unless explicitly requested.
- GitHub Actions should validate but not deploy unless an existing deployment workflow already does so and the task is to maintain it.
- Do not create remotes, credentials, service accounts, or production infrastructure from Codex unless explicitly approved.
