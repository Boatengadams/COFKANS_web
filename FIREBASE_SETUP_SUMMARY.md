# Firebase Backend Setup — Summary & Next Steps

**Date Started:** 2026-07-24  
**Status:** ✅ Step 1 Prep Complete — Ready for Manual Firebase Setup

---

## What I've Prepared for You

I've created documentation and templates to guide you through Firebase project setup. Since 
I cannot directly access the Firebase Console, you'll complete these steps manually. Here's 
what's ready:

### 1. **Comprehensive Setup Guide**
📄 **File:** `FIREBASE_SETUP_STEP1.md`

This walks you through:
- Creating two Firebase projects (staging & production)
- Enabling Authentication (Email/Password + Google)
- Enabling Firestore Database (production mode)
- Enabling Cloud Functions
- Generating service account keys
- **Securely storing keys** outside the repo (`~/.config/cofkans-firebase-keys/`)

**Read time:** ~10 minutes  
**Hands-on time:** ~50 minutes

### 2. **Configuration Template**
📋 **File:** `.firebase-config.local` (new)

This is a local-only template where you'll fill in:
- Staging project ID, API key, auth domain, etc.
- Production project ID, API key, auth domain, etc.
- Developer email (gates the developer portal)
- Service account key paths

**Status:** `.gitignore` already excludes this file (never committed).

### 3. **Enhanced `.gitignore`**
✅ **Updated:** `.gitignore`

Added explicit rules to prevent accidental commits of Firebase keys:
```
*.firebase.json
*-firebase-*.json
*-serviceAccountKey.json
.firebase-config.local
```

**Why:** Belt-and-suspenders. Even if someone puts a key file in the repo root by accident, 
Git will reject it.

### 4. **Security Best Practice**
🔒 **Key Storage Location:** `~/.config/cofkans-firebase-keys/`

- **staging.json** — Staging project service account key (permissions: `600` read-only)
- **production.json** — Production project service account key (permissions: `600` read-only)

These keys are **NOT** in the repo and never will be. They're safe on your machine.

---

## Your Immediate Next Steps

### ⏭️ Phase 1: Manual Firebase Setup (~50 minutes)

1. **Open** `FIREBASE_SETUP_STEP1.md` and follow it step-by-step
2. **Create** two Firebase projects (staging & production)
3. **Enable** Auth, Firestore, and Cloud Functions on both
4. **Generate** service account keys and store them in `~/.config/cofkans-firebase-keys/`
5. **Collect** project IDs and config values
6. **Fill in** `.firebase-config.local` with the values you collected

**Deliverable:** Two Firebase projects set up with service account keys safely stored locally.

### ⏭️ Phase 2: Environment Setup (What's Next After This)

Once Phase 1 is complete, we'll:

1. Update `.env.local` with staging values (for local development)
2. Deploy Firestore security rules (`firestore-security.rules`)
3. Deploy Cloud Functions (`functions/`)
4. Test authentication (Email/Password and Google)
5. Create GitHub Actions secrets for production CI/CD

---

## Important Security Reminders

### ✅ DO

- ✅ Store service account keys in `~/.config/cofkans-firebase-keys/` (local machine only)
- ✅ Set file permissions to `600` (owner read-only)
- ✅ Use `.firebase-config.local` to track your config values locally
- ✅ Never share service account keys via email, Slack, or Discord
- ✅ Verify `.gitignore` protections before committing any code
- ✅ Rotate keys if they're accidentally exposed

### ❌ DON'T

- ❌ Commit `.env.local` to Git (already in `.gitignore`)
- ❌ Commit service account JSON files to Git
- ❌ Paste service account keys into code or comments
- ❌ Store keys in your Downloads folder long-term
- ❌ Make keys world-readable (`chmod 644`)
- ❌ Check credentials into version control "just temporarily"

---

## File Checklist

After completing FIREBASE_SETUP_STEP1.md, you should have:

```
On Your Machine:
  ~/.config/cofkans-firebase-keys/
    ├── staging.json          (permissions: -rw-------)
    └── production.json       (permissions: -rw-------)

In the Repo (NOT committed):
  /path/to/cofkans/
    ├── FIREBASE_SETUP_STEP1.md   ✅ NEW (step-by-step guide)
    ├── .firebase-config.local    ✅ NEW (local template, excluded by .gitignore)
    ├── .gitignore                ✅ UPDATED (enhanced key exclusions)
    ├── .env.local                ⏳ (to fill in phase 2)
    └── BACKEND_SETUP.md          (existing reference docs)
```

---

## Success Criteria

✅ Step 1 complete when:

1. Two Firebase projects exist (staging & production)
2. Both projects have Auth (Email/Password + Google) enabled
3. Both projects have Firestore (production mode) enabled
4. Both projects have Cloud Functions enabled
5. Service account keys are stored in `~/.config/cofkans-firebase-keys/` with `600` permissions
6. You've collected project IDs and config values
7. `.firebase-config.local` is filled in with your values
8. `.gitignore` has been verified/updated

---

## Command Reference

For your reference, here are commands you'll use in later phases:

```bash
# Test your setup (Phase 2)
firebase --project=cofkans-staging auth:list-users

# Deploy Firestore rules (Phase 2)
firebase deploy --only firestore:rules --project=cofkans-staging

# Deploy Cloud Functions (Phase 2)
firebase deploy --only functions --project=cofkans-staging

# Deploy everything together (Phase 2)
firebase deploy --only firestore:rules,firestore:indexes,database,storage,functions --project=cofkans-staging
```

---

## Questions?

If you get stuck during FIREBASE_SETUP_STEP1.md:

1. Check the **Troubleshooting** section at the end of FIREBASE_SETUP_STEP1.md
2. Common issues: project creation timeout, API enablement delays, permission errors
3. If all else fails, you can always delete and recreate a project (safe to do)

---

## Timeline

- **Now:** Read FIREBASE_SETUP_STEP1.md and understand the steps
- **Next 50 minutes:** Complete manual Firebase setup
- **After that:** We'll move to Phase 2 (environment setup & rules deployment)

**Let me know when you've completed Step 1, and we'll move forward!**
