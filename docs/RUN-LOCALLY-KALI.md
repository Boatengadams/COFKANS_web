# Run Cofkans ERP locally on Kali Linux (test, then push)

This guide gets the app running on your Kali machine, shows you how to reach the
**Developer Console** (separate login + subdomain), and then pushes to GitHub.

The app runs 100% in the browser (DEMO_MODE = mock data in localStorage). No
Firebase / Supabase / Paystack keys are required just to run and test it.

---

## 1. Prerequisites

```bash
# Node 20+ and pnpm
sudo apt update
sudo apt install -y nodejs npm git
sudo npm install -g pnpm     # or: corepack enable && corepack prepare pnpm@latest --activate
node -v && pnpm -v && git --version
```

## 2. Get the code

You already have this project folder (exported from Figma Make). Open a terminal
in the folder that contains `package.json` and `index.html`.

## 3. Install dependencies

```bash
pnpm install
```

## 4. (Optional) environment variables

The app runs without any env vars in demo mode. To wire real backends later:

```bash
cp .env.example .env.local
# then edit .env.local
```

## 5. Run the dev server

```bash
pnpm dev
```

Open the URL it prints (default **http://localhost:5173**).

- Storefront: `http://localhost:5173/`
- Staff portal login: `http://localhost:5173/staff/login`
- **Developer Console (separate login):** `http://localhost:5173/developer`

### Developer Console login (demo)

- Email: `dev@cofkanselectricals.com`
- Password: `developer123`

Only accounts with the **developer** role can enter the console. This is a
**separate** login from the staff portal and keeps its own session.

## 6. Test the subdomain behaviour (developer.cofkanselectricals.com)

In production the console is served from its own subdomain and the storefront is
never mounted there. You can reproduce that locally two ways:

**a) Quick query override (no config):**

```
http://localhost:5173/?console=developer     # forces console mode (persists)
http://localhost:5173/?console=off           # back to storefront
```

**b) Real subdomain via /etc/hosts (closest to production):**

```bash
echo "127.0.0.1  developer.localhost" | sudo tee -a /etc/hosts
```

Then visit **http://developer.localhost:5173/** — it boots straight into the
Developer Console and nothing else. Any first hostname label of `developer`,
`dev`, or `console` triggers this (configurable with `VITE_DEVELOPER_SUBDOMAIN`).

## 7. Production build (optional local check)

```bash
pnpm build       # outputs to dist/
pnpm preview     # serves the built app for a final look
```

## 8. Deploying the console as a real subdomain

Two clean options:

1. **Same build, DNS + host routing** — deploy the normal build to both
   `app.cofkanselectricals.com` and `developer.cofkanselectricals.com`. The app
   detects the `developer.` host and renders only the console. Lock the
   subdomain behind Cloudflare Access / WARP (see
   `docs/INTEGRATION-ARCHITECTURE.md`).
2. **Dedicated console build** — build with `VITE_FORCE_DEVELOPER_CONSOLE=true`
   and deploy that artifact only to the developer subdomain.

## 9. Push to GitHub

When you're happy, push to `COFKANS/cofkanselectricals-app` on `develop`:

```bash
bash scripts/publish-to-github.sh
```

(That script clones `develop`, stages this app as the repo root, lifts the
Firebase deploy files out of `ce/`, commits as *Boateng Adams*, and pushes
**without** force so it won't clobber teammates.)

> Note: the push must run from your machine — the Figma Make build environment
> blocks all writes to GitHub (HTTP 520 "Origin is disallowed").
