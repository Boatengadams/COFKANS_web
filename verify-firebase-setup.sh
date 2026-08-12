#!/bin/bash
# Verification script for Firebase Step 1 setup
# Run this after manually completing FIREBASE_SETUP_STEP1.md to confirm everything is ready

set -e

echo "=========================================="
echo "Firebase Setup — Step 1 Verification"
echo "=========================================="
echo ""

# Check 1: gitignore protections
echo "✓ Checking .gitignore protections..."
if grep -q "\.firebase\.json\|firebase-config\.local" .gitignore; then
    echo "  ✅ .gitignore includes Firebase key exclusions"
else
    echo "  ❌ .gitignore missing Firebase exclusions. Please run: git diff .gitignore"
    exit 1
fi

# Check 2: .firebase-config.local exists
echo "✓ Checking config template..."
if [ -f .firebase-config.local ]; then
    echo "  ✅ .firebase-config.local exists (template for your values)"
    if grep -q "STAGING_PROJECT_ID=" .firebase-config.local; then
        echo "  ✅ Template has correct format"
    fi
else
    echo "  ❌ .firebase-config.local not found"
    exit 1
fi

# Check 3: Service account keys on local machine
echo "✓ Checking service account key storage..."
if [ -d ~/.config/cofkans-firebase-keys ]; then
    echo "  ✅ ~/.config/cofkans-firebase-keys directory exists"
    
    if [ -f ~/.config/cofkans-firebase-keys/staging.json ]; then
        perms=$(ls -lh ~/.config/cofkans-firebase-keys/staging.json | awk '{print $1}')
        echo "  ✅ staging.json found (permissions: $perms)"
        if [[ $perms == "-rw-------"* ]]; then
            echo "     ✅ Permissions are secure (600)"
        else
            echo "     ⚠️  Warning: Permissions should be 600. Run: chmod 600 ~/.config/cofkans-firebase-keys/*.json"
        fi
    else
        echo "  ⏳ staging.json not yet downloaded (download after Firebase setup)"
    fi
    
    if [ -f ~/.config/cofkans-firebase-keys/production.json ]; then
        perms=$(ls -lh ~/.config/cofkans-firebase-keys/production.json | awk '{print $1}')
        echo "  ✅ production.json found (permissions: $perms)"
        if [[ $perms == "-rw-------"* ]]; then
            echo "     ✅ Permissions are secure (600)"
        else
            echo "     ⚠️  Warning: Permissions should be 600. Run: chmod 600 ~/.config/cofkans-firebase-keys/*.json"
        fi
    else
        echo "  ⏳ production.json not yet downloaded (download after Firebase setup)"
    fi
else
    echo "  ℹ️  ~/.config/cofkans-firebase-keys not created yet (you'll create this during setup)"
fi

# Check 4: Documentation exists
echo "✓ Checking documentation..."
if [ -f FIREBASE_SETUP_STEP1.md ]; then
    echo "  ✅ FIREBASE_SETUP_STEP1.md exists"
else
    echo "  ❌ FIREBASE_SETUP_STEP1.md not found"
    exit 1
fi

if [ -f FIREBASE_SETUP_SUMMARY.md ]; then
    echo "  ✅ FIREBASE_SETUP_SUMMARY.md exists"
else
    echo "  ❌ FIREBASE_SETUP_SUMMARY.md not found"
    exit 1
fi

# Check 5: .env.local status
echo "✓ Checking environment files..."
if [ -f .env.local ]; then
    project_id=$(grep "^EXPO_PUBLIC_FIREBASE_PROJECT_ID=" .env.local | cut -d= -f2- || true)
    if [ -n "$project_id" ]; then
        echo "  ✅ .env.local has Firebase values (Phase 2 complete)"
    else
        echo "  ⏳ .env.local exists but is empty (to fill in Phase 2)"
    fi
else
    echo "  ℹ️  .env.local not created yet (you'll create this in Phase 2)"
fi

echo ""
echo "=========================================="
echo "Verification complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Read: FIREBASE_SETUP_STEP1.md"
echo "  2. Complete: Manual Firebase setup (50 minutes)"
echo "  3. Store: Service account keys in ~/.config/cofkans-firebase-keys/"
echo "  4. Fill in: .firebase-config.local with your project values"
echo "  5. Run: ./verify-firebase-setup.sh again"
echo ""
