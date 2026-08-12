# Firebase Setup — Step 1: Project Creation & Configuration

This document walks you through **manual** Firebase project setup. You'll need to access the 
[Firebase Console](https://console.firebase.google.com) and complete steps yourself (Copilot 
cannot automate GCP interactions).

**Goal:** Set up two Firebase projects (staging & production) with Auth, Firestore, and Cloud 
Functions ready to deploy.

---

## Overview: What You're About to Do

| Step | Where | What | Duration |
|------|-------|------|----------|
| 1    | Firebase Console | Create **staging** project | 5 min |
| 2    | Firebase Console | Create **production** project | 5 min |
| 3    | Firebase Console (both) | Enable Authentication (Email/Password + Google) | 10 min |
| 4    | Firebase Console (both) | Create Firestore Database (production mode) | 10 min |
| 5    | Firebase Console (both) | Enable Cloud Functions | 5 min |
| 6    | Firebase Console (both) | Generate service account keys | 10 min |
| 7    | Your terminal | Store keys securely (local machine, NOT in repo) | 5 min |
| 8    | Code review | Verify `.gitignore` protections | 2 min |

**Total time:** ~50 minutes

---

## Prerequisites

- A Google account with a billing-enabled Google Cloud project (or create a free trial)
- `firebase-tools` CLI installed locally: `npm i -g firebase-tools`
- Git configured locally to avoid committing secrets

---

## Step 1: Create Staging Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `cofkans-staging`
3. **Do NOT** enable Google Analytics for now (simplifies setup)
4. Click **Create project** and wait for provisioning (~2 minutes)
5. Note the **Project ID** (usually `cofkans-staging`). You'll need this.

**After creation, you'll land on the Firebase dashboard.**

---

## Step 2: Create Production Project

Use the existing production project `cofkanselectricals-app`.

**After this step you'll have two projects.** Don't close the browser; you'll switch between them 
for the next steps.

---

## Step 3: Enable Authentication (Both Projects)

**For each project (staging first, then production):**

1. In the Firebase Console sidebar, click **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in method**, click **Email/Password**
   - Toggle **Enable** ✓
   - Keep **Password authentication** selected
   - Do NOT enable **Email link** or **Anonymous**
   - Click **Save**
4. Click **Add new provider** → **Google**
   - Toggle **Enable** ✓
   - Keep **Project support email** set to your own email
   - Click **Save**
5. Optionally add **Phone** for later (not required for step 1)

**Status after this:** Both projects have Email/Password and Google OAuth ready.

---

## Step 4: Enable Firestore Database (Both Projects)

**For each project (staging first, then production):**

1. In the sidebar, click **Build → Firestore Database**
2. Click **Create database**
3. Choose **Production mode** (we'll deploy rules in step 2)
4. Select your region: **`us-central1`** (same as Cloud Functions)
5. Click **Create**
   - Provisioning takes ~2 minutes; you'll see a loading indicator

**Status after this:** Both projects have Firestore databases in production mode (empty, no data).

**⚠️ Important:** With production mode, all reads/writes are denied until you deploy the security 
rules. We'll do that after service account setup. Don't panic if you can't read/write yet.

---

## Step 5: Enable Cloud Functions (Both Projects)

**For each project (staging first, then production):**

1. In the sidebar, click **Build → Functions**
2. If prompted, click **Enable the Cloud Functions API** (might take 1–2 minutes)
3. You'll see an empty functions list; that's fine. We'll deploy functions in step 2.

**Status after this:** Both projects have Cloud Functions runtime ready.

---

## Step 6: Generate Service Account Keys (Both Projects)

A **service account key** is a JSON file that lets your CI/CD pipeline and local tools authenticate 
to Firebase without a browser login.

**For each project (staging first, then production):**

1. Click the **⚙️ gear icon** (Settings) in the top right
2. Click **Project settings**
3. Go to the **Service accounts** tab
4. Click **Generate new private key** (or **Create service account** if not visible)
   - A JSON file will download to your `~/Downloads` folder
   - Filename format: `cofkans-staging-xxxxx.json`, `cofkanselectricals-app-xxxxx.json`, or similar
5. **Do not commit this file.** You'll move it in Step 7.

**After downloading both keys, you should have:**
- `cofkans-staging-xxxxx.json` (or similar name)
- `cofkanselectricals-app-xxxxx.json` (or similar name)

---

## Step 7: Store Service Account Keys Securely (Local Machine Only)

**⚠️ CRITICAL:** Service account keys grant full API access to your Firebase project. **Never commit 
them to Git.** **Never paste them in Slack/Discord.** **Never email them.**

### Where to Store

Create a **local directory outside the repo** to hold these keys:

```bash
# Create a directory for Firebase credentials
mkdir -p ~/.config/cofkans-firebase-keys

# Move the downloaded keys there
mv ~/Downloads/cofkans-staging-*.json ~/.config/cofkans-firebase-keys/staging.json
mv ~/Downloads/cofkanselectricals-app-*.json ~/.config/cofkans-firebase-keys/production.json

# Restrict permissions so only you can read
chmod 600 ~/.config/cofkans-firebase-keys/*.json

# Verify
ls -la ~/.config/cofkans-firebase-keys/
```

**Output should show:**
```
-rw------- user group ... staging.json
-rw------- user group ... production.json
```

If permissions show `-rw-r--r--` (world-readable), fix it:
```bash
chmod 600 ~/.config/cofkans-firebase-keys/*.json
```

### Why Not in the Repo?

The repo's `.gitignore` already excludes `.env.local` (good), but service account keys are 
different—they're not env vars, they're entire JSON files. Storing them in `~/.config/` keeps 
them:
- **Out of version control** (no accidental commits)
- **Persistent across repo clones** (you won't lose them when pulling)
- **Shareable only via secure channel** (you can email a colleague the key securely if needed)

---

## Step 8: Verify `.gitignore` Protection

Check that `.gitignore` covers sensitive files:

```bash
cd /path/to/cofkans
cat .gitignore | grep -E "\.env|\.json|credentials|secrets"
```

**Current state of `.gitignore` in this repo:**
```
.env
.env.local
.env.*.local
```

✅ This covers `.env*` files. It does **not** explicitly mention `.json` (but we're storing 
service account keys outside the repo, so that's fine).

**To be extra safe, add a line to `.gitignore` just in case someone accidentally moves a key 
into the repo:**

```bash
echo "
# Firebase service account keys (NEVER commit these!)
*.firebase.json
*-firebase-*.json
*-serviceAccountKey.json
" >> .gitignore
```

---

## Step 9: Gather Your Project IDs & Config Values

Before you leave the Firebase Console, collect these values for **both projects**:

**Staging Project:**
```
Project ID: ___________________________
API Key: ___________________________
Auth Domain: ___________________________
Storage Bucket: ___________________________
Messaging Sender ID: ___________________________
App ID: ___________________________
Measurement ID (optional): ___________________________
```

**Production Project:**
```
Project ID: ___________________________
API Key: ___________________________
Auth Domain: ___________________________
Storage Bucket: ___________________________
Messaging Sender ID: ___________________________
App ID: ___________________________
Measurement ID (optional): ___________________________
```

**How to get these:**

1. In Firebase Console, go to **Project settings** (⚙️ gear icon)
2. Under **Your apps**, click on the **Web** app (or create one if needed)
3. Copy the config object:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

---

## What's Next (Step 2)

Once you have:
- ✅ Two Firebase projects created
- ✅ Auth, Firestore, Cloud Functions enabled
- ✅ Service account keys stored in `~/.config/cofkans-firebase-keys/`
- ✅ Project IDs and config values collected

You're ready for **Step 2: Environment Setup & Rules Deployment**, which will:
1. Update `.env.local` with your staging config values
2. Deploy Firestore security rules
3. Deploy Cloud Functions
4. Test authentication

---

## Troubleshooting

### "Enable the Cloud Functions API" button doesn't appear
- Wait 1–2 minutes and refresh the page
- If it still doesn't appear, go to **Cloud Console** → **APIs & Services** and search for 
  "Cloud Functions" and enable it manually

### I can't download the service account key
- Try incognito mode (Chrome) to avoid browser extensions interfering
- Check your browser's download settings to allow JSON files

### Project creation is stuck
- Firebase projects can take 2–5 minutes to provision. Don't close the tab; let it finish.
- If it times out, refresh and check https://console.firebase.google.com/u/0/ to see if it 
  created anyway.

### I lost my service account key
- Don't worry! Go back to **Project settings → Service accounts** and generate a new one.
- Rotate the old key by clicking the **⋯** menu next to it and selecting **Delete**.

---

## Checklist

Before moving to Step 2, confirm:

- [ ] Staging project created
- [ ] Production project created
- [ ] Authentication (Email/Password + Google) enabled on both
- [ ] Firestore Database created in production mode on both
- [ ] Cloud Functions enabled on both
- [ ] Service account keys downloaded and moved to `~/.config/cofkans-firebase-keys/`
- [ ] Service account key permissions set to `600` (owner read-only)
- [ ] `.gitignore` reviewed and covers sensitive files
- [ ] Project IDs, API keys, and config values collected

**When ready, ping back and we'll move to Step 2: Environment setup & rules deployment.**
