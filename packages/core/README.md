# `@cofkans/core`

Shared contract for the customer and staff apps. This package is the future
home of Firebase initialization, Firestore schemas, backend service functions,
auth/session helpers, and shared validation. Both apps use the same Firebase
project and the collection ownership is documented in `src/collections.ts`.

The first migration keeps legacy imports working inside each app while the
backend modules are extracted incrementally. New cross-app code should be
added here rather than copied into `apps/customer` or the canonical `COFKANS_Staff ` app.
