# Cofkans Electricals — Integration & Security Architecture

_Decided with the product owner. This is the source-of-truth plan for external services,
backends, data model, payments, geospatial, and security. Status: **planning / pre-build**._

---

## 1. Decisions (locked)

| Area | Decision |
|------|----------|
| **Primary ledger** | **Supabase (Postgres)** — inventory, orders, business logic, audit, geospatial |
| **Realtime / media** | **Firebase** — Firestore (order tracking, chat), Storage (media assets) |
| **Identity authority** | **Firebase Auth** — single sign-on; Supabase **verifies Firebase JWTs** and drives RLS from verified claims |
| **Payments** | **Paystack** — Card + Mobile Money **collections only** (no payouts, no refunds in v1) |
| **Geospatial** | **PostGIS on Supabase** — KNN nearest-branch at checkout + DBSCAN/KMeans demand heatmaps; render with **MapLibre + OSM** (no key) |
| **Network perimeter** | **Cloudflare** — WARP virtual-IP locking for staff portal, Turnstile on login/checkout, WAF, rate limiting |
| **Compliance** | Card data **100% in Paystack** (no PANs ever touch us); **Ghana Data Protection Act 2012** built in |
| **Security deliverables** | Threat model + secret-management plan; OWASP 2021 + 2025 mapping (below) |
| **v2/v3 (planned, not v1)** | Arkesel SMS/OTP, AI (reorder forecasting/chatbot/search), live driver GPS, Twilio/WhatsApp |

### Defaults I assumed for unanswered sub-questions (correct me if wrong)
- **Staff MFA:** TOTP authenticator app required for `manager` + `developer`; optional for others.
- **Transactional email:** Resend (simple, generous free tier) — deferred to v2 with SMS.
- **AI provider (v2):** Anthropic Claude.
- **GitHub:** add a `staging` environment + branch protection + secret scanning on top of the existing Actions→Firebase deploy.

---

## 2. Architecture overview

```
                    ┌───────────────────────────────────────────────┐
                    │                 Cloudflare                    │
                    │  DNS · CDN · WAF · Rate-limit · Turnstile     │
                    │  WARP (virtual-IP allowlist → staff portal)   │
                    └───────────────┬───────────────────────────────┘
                                    │ (all traffic)
        ┌───────────────────────────┴───────────────────────────┐
        │                     React app (Make)                   │
        │   Customer storefront  ·  Staff ERP portal             │
        └───────┬───────────────────────┬───────────────┬────────┘
                │ Firebase SDK           │ supabase-js   │ Paystack Inline
                ▼                        ▼               ▼
   ┌────────────────────┐   ┌────────────────────────┐  ┌──────────────────┐
   │   FIREBASE         │   │   SUPABASE (Postgres)  │  │   PAYSTACK       │
   │  Auth (authority)  │   │  Ledger + business     │  │  Card + MoMo     │
   │  Firestore (RT)    │   │  logic + RLS           │  │  collections     │
   │  Storage (media)   │   │  PostGIS (KNN/heatmap) │  │                  │
   └─────────┬──────────┘   │  Edge Functions        │  └────────┬─────────┘
             │ mints JWT    └──────────┬─────────────┘           │ webhook
             │ (uid, role)             ▲                          │ (verify)
             └── client sends Firebase │ verifies Firebase JWT    ▼
                 ID token to Supabase ─┘ via JWKS → RLS      Supabase Edge Fn
                                                              writes to ledger
```

**One login, two backends.** The user authenticates once with Firebase Auth. The Firebase
ID token (JWT) is sent to Supabase; Supabase is configured to trust Firebase's JWKS, so
RLS policies read `auth.jwt()` claims (`sub` = Firebase uid, plus a custom `role` claim)
without a second login. Firestore security rules and Postgres RLS then authorize **the same
identity**.

---

## 3. Identity & auth flow (Firebase → Supabase RLS)

1. User signs in with Firebase Auth (email/password now; add Google/phone OTP later).
2. A **Firebase custom claim** `role` (manager, front_desk, driver, developer, …) is set via
   a trusted admin path (Cloud Function or your developer portal calling the Admin SDK).
3. Client gets the Firebase **ID token** and passes it to `supabase-js` as the auth token.
4. Supabase project is configured with a **third-party auth / JWT** trust for the Firebase
   project (issuer `https://securetoken.google.com/<project-id>`, JWKS auto-verified).
5. RLS policies use the verified claims, e.g.:

```sql
-- Only staff of a branch (or managers) can read that branch's inventory.
create policy "branch_scoped_inventory_read"
on inventory for select
using (
  (auth.jwt() ->> 'role') = 'manager'
  or branch_id = (auth.jwt() ->> 'branch_id')::uuid
);
```

> Migration note: your current codebase credential store (`dp:staff`, DEMO_MODE) becomes the
> **seed/fallback** only. Real accounts move to Firebase Auth; the store keeps role/branch
> metadata mirrored into Firebase custom claims + a Supabase `staff` table.

---

## 4. Accounts to create & where every secret lives

**Golden rule:** nothing secret in client code. Only *publishable* keys ship to the browser.

| Provider | Create | Client-safe (in app) | Secret (server-only) | Secret home |
|----------|--------|----------------------|----------------------|-------------|
| **Firebase** | Project, Auth, Firestore, Storage | `apiKey`, `authDomain`, `projectId`, etc. (Firebase web config is publishable) | Admin SDK service-account JSON | GitHub Actions secret + Supabase Edge Fn secret |
| **Supabase** | Project, DB, Edge Functions | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | `SERVICE_ROLE_KEY`, DB password | Supabase Edge Fn env + GitHub secret |
| **Paystack** | Business account, get API keys | `PAYSTACK_PUBLIC_KEY` | `PAYSTACK_SECRET_KEY`, webhook signing | Supabase Edge Fn secret |
| **Cloudflare** | Zone, WARP/Zero-Trust, Turnstile | Turnstile **site key** | Turnstile **secret key**, API token | Supabase Edge Fn / GitHub secret |
| **GitHub** | Repo (exists) | — | All of the above as **Actions secrets** | Repo → Settings → Secrets |

Secret-management rules:
- Client bundle contains only: Firebase web config, `SUPABASE_ANON_KEY`, `PAYSTACK_PUBLIC_KEY`,
  Turnstile site key. **These are safe by design** (RLS + webhook signing enforce security).
- All privileged operations (Paystack verify, setting Firebase custom claims, service-role DB
  writes) run in **Supabase Edge Functions** or Cloud Functions — never in the browser.
- Rotate keys on staff offboarding; never commit `.env`. (`.env.example` documents names only.)

---

## 5. Data model

### Supabase (system of record)
- `staff` (mirror of Firebase users: uid, role, branch_id, status) — RLS: self + manager.
- `branches` (id, name, `location geography(Point,4326)`, …) — GiST index on `location`.
- `products`, `inventory` (branch_id, product_id, qty, reorder_level, price) — RLS branch-scoped.
- `orders` (id, customer_uid, branch_id, total, status, `checkout_point geography(Point,4326)`).
- `order_items`, `purchase_orders`, `campaigns`, `promotions`, `price_audit`, `stock_transfers`.
- Everything append-only-audited via a `audit_log` table + Postgres triggers.

### PostGIS queries
```sql
-- KNN: nearest branch to a customer's checkout point (uses GiST index, very fast)
select id, name, location <-> st_setsrid(st_makepoint($lng,$lat),4326)::geography as metres
from branches
order by location <-> st_setsrid(st_makepoint($lng,$lat),4326)::geography
limit 1;

-- Demand heatmap: cluster historical order coordinates for expansion planning
select st_clusterdbscan(checkout_point::geometry, eps := 0.02, minpoints := 5) over () as cluster_id,
       count(*) as orders, st_centroid(st_collect(checkout_point::geometry)) as centre
from orders
where checkout_point is not null
group by cluster_id;
```

### Firebase (realtime & media)
- Firestore: `liveOrders/{orderId}` (status stream), `chats/{threadId}/messages`, driver
  presence — all mirrored *from* Supabase (Supabase is truth; Firestore is the fast read fan-out).
- Storage: product images, receipts, campaign banners. Security rules gate by Firebase uid/role.

---

## 6. Paystack flow (Card + MoMo collections)

```
Browser (Paystack Inline, PUBLIC key)
   → customer pays (card or MoMo; Paystack handles PAN/OTP — we never see card data)
   → Paystack returns reference
Paystack  → webhook →  Supabase Edge Function
   1. verify x-paystack-signature (HMAC-SHA512 with SECRET key)   [reject if invalid]
   2. re-verify txn via Paystack /transaction/verify/:ref         [never trust client]
   3. idempotency: skip if reference already recorded
   4. write order → paid in Supabase ledger (RLS bypassed via service role, server-side)
   5. push status to Firestore liveOrders for realtime customer view
```
No payouts ⇒ no Transfers KYC, no outbound-money controls. Refunds handled manually in the
Paystack dashboard for v1.

---

## 7. Cloudflare lockdown

- **WARP + Zero Trust Access:** staff ERP routes (`/staff/*`, `/branches/*`, `/developer`)
  sit behind a Cloudflare Access application that requires the corporate WARP client →
  gives each device a **virtual IP** on your allowlist, solving the dynamic-IP problem for
  remote staff. Customers/storefront are **not** behind Access.
- **Turnstile:** on staff login and customer checkout (bot/credential-stuffing defence).
- **WAF:** managed OWASP core ruleset + custom rules (block SQLi/XSS signatures, geo-fence
  admin routes to Ghana + known staff regions).
- **Rate limiting:** login (e.g. 5/min/IP), Paystack webhook path, KNN endpoint.

---

## 8. Compliance

### PCI-DSS — confirmed out of scope for you
Paystack Inline collects and tokenises all card data on Paystack's PCI-DSS Level 1
infrastructure. **No PAN, CVV, or full card number ever touches your frontend, Supabase,
or Firebase.** You store only Paystack references + last4/brand metadata → **SAQ-A** (lightest).

### Ghana Data Protection Act, 2012 (Act 843)
- **Register** as a data controller with the Data Protection Commission.
- **Consent:** explicit opt-in for storing location (`checkout_point` is personal data) and
  for marketing SMS/email; granular, revocable, logged with timestamp.
- **Data-subject rights (DSR):** self-serve export + deletion (a `dsr_requests` table + an
  Edge Function that redacts/erases across Supabase **and** Firebase).
- **Data minimisation & retention:** don't keep raw coordinates longer than needed for
  analytics — aggregate to cluster/heatmap and drop precise points on a retention schedule.
- **Breach handling:** documented process, notify the Commission + affected users promptly.
- **Cross-border:** note Firebase/Supabase host outside Ghana — disclose in the privacy policy.

---

## 9. Threat model (STRIDE-lite) & top mitigations

| Threat | Vector | Mitigation |
|--------|--------|-----------|
| Spoofing | Stolen staff creds | Firebase Auth + TOTP MFA for manager/developer; Cloudflare Access/WARP |
| Tampering | Client fakes "paid" | Server-side Paystack verify + webhook signature + idempotency |
| Repudiation | "I didn't change that price" | Append-only `audit_log` + `price_audit` with actor + timestamp |
| Info disclosure | Cross-branch data leak | Supabase RLS on verified JWT claims; Firestore rules mirror roles |
| DoS | Login/webhook flooding | Cloudflare rate limiting + WAF + Turnstile |
| Elevation | Role escalation | Custom claims set only server-side (Admin SDK); never client-writable |

---

## 10. OWASP Top 10 mapping (2021 + 2025)

> The 2025 list finalises the 2021 categories with a sharper focus on supply-chain and
> misconfiguration. Mapping to this stack:

| # | OWASP 2021 | OWASP 2025 (as updated) | How we address it |
|---|-----------|-------------------------|-------------------|
| A01 | Broken Access Control | Broken Access Control | Supabase RLS from verified Firebase claims; Firestore rules; Cloudflare Access on staff routes |
| A02 | Cryptographic Failures | Security Misconfiguration *(rises)* | TLS everywhere (Cloudflare); secrets in server env only; no PANs stored |
| A03 | Injection | Software Supply Chain Failures *(new emphasis)* | Parameterised queries/`supabase-js`; Dependabot + secret scanning + pinned actions |
| A04 | Insecure Design | Insecure Design | This threat model; least-privilege; server-side money verification |
| A05 | Security Misconfiguration | Injection | WAF managed rules; locked Firestore/Storage rules; least-priv service accounts |
| A06 | Vulnerable/Outdated Components | Vulnerable & Outdated Components | Dependabot (already on), renovate cadence, SBOM |
| A07 | ID & Auth Failures | Authentication Failures | Firebase Auth + MFA; Turnstile; rate-limited login; forced password change (built) |
| A08 | Software & Data Integrity | Software & Data Integrity Failures | Signed CI (GitHub Actions), webhook signature verification, idempotency |
| A09 | Logging & Monitoring Failures | Logging & Monitoring Failures | `audit_log`, Cloudflare + Supabase logs, alerting on auth anomalies |
| A10 | SSRF | Mishandling of Exceptional Conditions / SSRF | No server-side URL fetch from user input; strict egress in Edge Functions |

_(2025 category names/order reflect the updated release; I'll finalise wording against the
published list when we implement.)_

---

## 11. Phased rollout

**v1 (launch)**
1. Supabase schema + RLS + PostGIS (branches/inventory/orders/geo).
2. Firebase Auth as authority → custom claims → Supabase JWT trust.
3. Firestore realtime order tracking + chat; Storage media.
4. Paystack Card + MoMo collections via Edge Function verify/webhook.
5. Cloudflare WARP/Access lockdown + Turnstile + WAF + rate limits.
6. Ghana DPA consent + DSR + audit logging.

**v2**
- Arkesel SMS/OTP (order + delivery alerts, low-stock to procurement, OTP), Resend email.
- AI: reorder/demand forecasting (feeds procurement), support chatbot, product search.

**v3**
- Live driver GPS (Firestore presence + PostGIS), delivery ETA, WhatsApp via Twilio,
  MapLibre heatmap dashboard for expansion planning.

---

## 12. Open items to confirm before build
- Staff MFA scope (assumed manager+developer TOTP).
- Email provider (assumed Resend, v2).
- AI provider/budget (assumed Claude, v2).
- GitHub staging environment + branch protection (assumed yes).
- Map render layer: MapLibre+OSM (free) vs Mapbox (assumed MapLibre).
