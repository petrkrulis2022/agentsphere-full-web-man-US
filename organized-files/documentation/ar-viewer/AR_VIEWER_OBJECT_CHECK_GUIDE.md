# 🎯 AR Viewer Object Checking Script for Copilots

## Quick Start

Run this command to check all objects and diagnose AR Viewer issues:

```bash
node ar-viewer-diagnostics.js
```

## What This Script Does

### ✅ **Complete Diagnostic Checks:**

1. **Environment Validation** - Verifies API keys are correct format
2. **Connection Test** - Tests Supabase database connection
3. **Object Count Analysis** - Shows total vs active objects
4. **Location Data Validation** - Ensures objects have coordinates
5. **Recent Objects Sample** - Shows latest 5 active objects
6. **AR Viewer Specific Checks** - Tests exact AR Viewer query
7. **Summary & Recommendations** - Lists any issues and solutions
8. **Quick Test Query** - Simulates AR Viewer data fetch

### 🔍 **Key Information Provided:**

- Total objects: **17**
- Active objects: **17** (100%)
- Location coverage: **17/17** objects have coordinates
- API key format: **✅ New sb\_ format**
- Expected objects in AR Viewer: **17**

## Expected Output (Healthy System)

```
✅ ALL CHECKS PASSED!
🎯 AR Viewer should display all objects correctly
📊 Expected objects in AR Viewer: 17
```

## Common Issues & Solutions

### ❌ **"Legacy API keys are disabled"**

**Problem:** Using old JWT format keys
**Solution:** Update .env with new keys:

```env
VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA
```

### ❌ **"No active objects"**

**Problem:** All objects marked as inactive
**Solution:** Check database - activate objects with `is_active=true`

### ❌ **"No location data"**

**Problem:** Objects missing coordinates
**Solution:** Add latitude/longitude to objects in database

### ❌ **"Connection Failed"**

**Problem:** API keys or URL incorrect
**Solution:** Verify Supabase credentials in .env file

## After Running Script

### If All Checks Pass ✅

- Restart development server: `npm run dev -- --port 5174`
- Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R`)
- Navigate to AR Viewer - all 17 objects should be visible

### If Issues Found ❌

- Follow specific recommendations in script output
- Fix .env file if API key issues
- Check database if object count issues
- Re-run script after fixes

## Project Context

- **Database:** ncjbwzibnqrbrvicdmec.supabase.co
- **Expected Objects:** 17 active objects
- **Location:** All objects around coordinates 50.6474, 13.8355
- **Networks:** Ethereum Sepolia, Polygon Amoy, Avalanche Fuji, OP Sepolia, Base Sepolia
- **Primary Token:** USDC

## Emergency Backup Test

If script fails, try manual connection test:

```bash
node test-supabase-connection.js
```

This comprehensive script will quickly identify any issues preventing objects from appearing in the AR Viewer!
