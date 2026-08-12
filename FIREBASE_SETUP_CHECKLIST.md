# Firebase Setup Phase 1 — Manual Checklist

Use this checklist while following FIREBASE_SETUP_STEP1.md

---

## Pre-Setup

- [ ] Read FIREBASE_SETUP_STEP1.md completely (don't skip sections)
- [ ] Have Google Cloud Console access ready
- [ ] Have a text editor open to collect values
- [ ] Firefox/Chrome dev console ready (for debugging if needed)

---

## Staging Project Setup

### Step 1: Create Staging Project
- [ ] Go to https://console.firebase.google.com
- [ ] Click "Add project"
- [ ] Name: `cofkans-staging`
- [ ] Disable Google Analytics
- [ ] Click "Create project"
- [ ] Wait for provisioning (~2 min)
- [ ] Note Project ID: ___________________________

### Step 2: Enable Authentication (Staging)
- [ ] Click Build → Authentication
- [ ] Click "Get started"
- [ ] Enable Email/Password
  - [ ] Toggle switch ON
  - [ ] Keep "Password authentication" selected
  - [ ] Click "Save"
- [ ] Add Google provider
  - [ ] Click "Add new provider" → "Google"
  - [ ] Toggle switch ON
  - [ ] Set support email to your email
  - [ ] Click "Save"

### Step 3: Enable Firestore (Staging)
- [ ] Click Build → Firestore Database
- [ ] Click "Create database"
- [ ] Select "Production mode"
- [ ] Region: `us-central1`
- [ ] Click "Create"
- [ ] Wait for provisioning (~2 min)

### Step 4: Enable Cloud Functions (Staging)
- [ ] Click Build → Functions
- [ ] If prompted, click "Enable the Cloud Functions API"
- [ ] Wait for API enablement (~1-2 min)
- [ ] Confirm you see "Functions" section (empty is OK)

### Step 5: Collect Staging Config Values
- [ ] Click ⚙️ Settings → Project settings
- [ ] Go to "Your apps" section
- [ ] Click on Web app (or create one if needed)
- [ ] Copy these values:

```
STAGING_PROJECT_ID = ___________________________
STAGING_FIREBASE_API_KEY = ___________________________
STAGING_FIREBASE_AUTH_DOMAIN = ___________________________
STAGING_FIREBASE_STORAGE_BUCKET = ___________________________
STAGING_FIREBASE_MESSAGING_SENDER_ID = ___________________________
STAGING_FIREBASE_APP_ID = ___________________________
STAGING_FIREBASE_MEASUREMENT_ID = ___________________________
```

### Step 6: Generate Staging Service Account Key
- [ ] Still in Project settings
- [ ] Go to "Service accounts" tab
- [ ] Click "Generate new private key" (or "Create service account")
- [ ] JSON file downloads to ~/Downloads/
- [ ] Note filename: ___________________________

---

## Production Project Setup

### Step 1: Create Production Project
- [ ] Go to https://console.firebase.google.com (if not already there)
- [ ] Click "Add project"
- [ ] Use existing production project: `cofkanselectricals-app`
- [ ] Disable Google Analytics
- [ ] Click "Create project"
- [ ] Wait for provisioning (~2 min)
- [ ] Note Project ID: ___________________________

### Step 2: Enable Authentication (Production)
- [ ] Click Build → Authentication
- [ ] Click "Get started"
- [ ] Enable Email/Password
  - [ ] Toggle switch ON
  - [ ] Keep "Password authentication" selected
  - [ ] Click "Save"
- [ ] Add Google provider
  - [ ] Click "Add new provider" → "Google"
  - [ ] Toggle switch ON
  - [ ] Set support email to your email
  - [ ] Click "Save"

### Step 3: Enable Firestore (Production)
- [ ] Click Build → Firestore Database
- [ ] Click "Create database"
- [ ] Select "Production mode"
- [ ] Region: `us-central1`
- [ ] Click "Create"
- [ ] Wait for provisioning (~2 min)

### Step 4: Enable Cloud Functions (Production)
- [ ] Click Build → Functions
- [ ] If prompted, click "Enable the Cloud Functions API"
- [ ] Wait for API enablement (~1-2 min)
- [ ] Confirm you see "Functions" section (empty is OK)

### Step 5: Collect Production Config Values
- [ ] Click ⚙️ Settings → Project settings
- [ ] Go to "Your apps" section
- [ ] Click on Web app (or create one if needed)
- [ ] Copy these values:

```
PRODUCTION_PROJECT_ID = ___________________________
PRODUCTION_FIREBASE_API_KEY = ___________________________
PRODUCTION_FIREBASE_AUTH_DOMAIN = ___________________________
PRODUCTION_FIREBASE_STORAGE_BUCKET = ___________________________
PRODUCTION_FIREBASE_MESSAGING_SENDER_ID = ___________________________
PRODUCTION_FIREBASE_APP_ID = ___________________________
PRODUCTION_FIREBASE_MEASUREMENT_ID = ___________________________
```

### Step 6: Generate Production Service Account Key
- [ ] Still in Project settings
- [ ] Go to "Service accounts" tab
- [ ] Click "Generate new private key" (or "Create service account")
- [ ] JSON file downloads to ~/Downloads/
- [ ] Note filename: ___________________________

---

## Secure Service Account Keys

### On Your Local Machine (Terminal)

```bash
# Create secure directory
mkdir -p ~/.config/cofkans-firebase-keys
chmod 700 ~/.config/cofkans-firebase-keys

# Move keys (check ~/Downloads for actual filenames)
mv ~/Downloads/cofkans-staging-*.json ~/.config/cofkans-firebase-keys/staging.json
mv ~/Downloads/cofkanselectricals-app-*.json ~/.config/cofkans-firebase-keys/production.json

# Secure permissions
chmod 600 ~/.config/cofkans-firebase-keys/staging.json
chmod 600 ~/.config/cofkans-firebase-keys/production.json

# Verify (should show -rw-------)
ls -la ~/.config/cofkans-firebase-keys/
```

**Checklist:**
- [ ] Directory created: `~/.config/cofkans-firebase-keys/`
- [ ] Directory permissions: `700` (drwx------)
- [ ] `staging.json` moved and permissions: `600` (-rw-------)
- [ ] `production.json` moved and permissions: `600` (-rw-------)
- [ ] Original files in `~/Downloads/` deleted or moved elsewhere
- [ ] Confirmed: Files NOT in repo (they're in `~/.config/`)

---

## Fill in Your Config Template

- [ ] Open: `.firebase-config.local` (in repo root)
- [ ] Fill in all the values you collected above
- [ ] Save the file
- [ ] Verify it's excluded from Git: `git status` shows no changes to .firebase-config.local

---

## Final Verification

```bash
# Run the verification script
cd /path/to/cofkans
./verify-firebase-setup.sh
```

- [ ] Script runs without errors
- [ ] Confirms `.gitignore` protections
- [ ] Confirms config template exists
- [ ] Confirms service account keys have `600` permissions
- [ ] Confirms documentation files exist

---

## Done! Next Steps

- [ ] All items above checked
- [ ] No errors in `./verify-firebase-setup.sh`
- [ ] Notified me that Phase 1 manual setup is complete

**Next:** We'll move to Phase 2 (Environment setup & rules deployment)
