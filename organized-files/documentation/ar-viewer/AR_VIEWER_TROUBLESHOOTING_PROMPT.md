# 🔍 AR Viewer Agent Visibility Troubleshooting Guide

## Problem Statement

AR Viewer showing no agents/objects despite successful database connection in test environment. Agents are visible in test AR viewer but not in the main AR viewer component.

## Root Cause Analysis: Supabase API Key Format Issue

### **CRITICAL: Legacy API Keys Disabled**

Supabase has disabled legacy JWT-format API keys. The application needs to use the new `sb_` prefixed API key format.

## Current Working Configuration

### **✅ Working API Keys (New Format):**

```env
VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA
VITE_SUPABASE_SERVICE_ROLE_KEY=sb_secret_s3sWA4HPYMpD-_I-GEzsIw_g92UJm9S
```

### **❌ Problematic Keys (Legacy Format - DISABLED):**

```env
# These JWT format keys are now disabled by Supabase
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Diagnostic Steps

### **1. Check API Key Format**

```bash
# Check current .env file
cat .env | grep VITE_SUPABASE

# Look for:
# ✅ Keys starting with "sb_publishable_" and "sb_secret_"
# ❌ Keys starting with "eyJhbGciOiJIUzI1NiI" (JWT format)
```

### **2. Test Supabase Connection**

Create and run this test file:

```javascript
// test-supabase-connection.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Testing Supabase connection...");
console.log("URL:", supabaseUrl);
console.log("Anon Key format:", supabaseAnonKey?.substring(0, 15) + "...");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("id, name, created_at")
      .eq("is_active", true)
      .limit(5);

    if (error) {
      console.error("❌ Supabase Error:", error);
      if (error.message.includes("Legacy API keys are disabled")) {
        console.log("🔧 SOLUTION: Update to new API key format (sb_ prefix)");
      }
      return;
    }

    console.log("✅ Connection successful!");
    console.log("📊 Found objects:", data?.length || 0);
    console.log("📋 Sample data:", data);
  } catch (err) {
    console.error("💥 Connection failed:", err);
  }
}

testConnection();
```

**Run test:**

```bash
node test-supabase-connection.js
```

### **3. Expected Error Patterns**

Look for these specific errors:

**❌ 401 Unauthorized:**

```
Failed to load resource: the server responded with a status of 401
```

**❌ Legacy Keys Disabled:**

```
Legacy API keys are disabled
Your legacy API keys (anon, service_role) were disabled on 2025-10-26...
```

**❌ ARViewer Console Errors:**

```
❌ Error fetching objects: Object
❌ Error loading objects: Object
```

### **4. Check ARViewer Component**

Verify the ARViewer component is receiving the correct Supabase client:

```typescript
// In ARViewer.tsx, check the loadObjects function:
const loadObjects = async () => {
  if (!supabase) {
    setError("Database connection not available");
    return;
  }

  try {
    const { data, error: fetchError } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("❌ Error fetching objects:", fetchError);
      // Check if this shows the legacy key error
    }
  } catch (error) {
    console.error("❌ Error loading objects:", error);
  }
};
```

## Fix Implementation

### **Step 1: Update Environment Variables**

Replace the legacy JWT keys with new format:

```env
# Replace in .env file
VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA
VITE_SUPABASE_SERVICE_ROLE_KEY=sb_secret_s3sWA4HPYMpD-_I-GEzsIw_g92UJm9S
```

### **Step 2: Restart Development Server**

```bash
# Stop current server
pkill -f "vite"

# Restart to pick up new environment variables
npm run dev -- --port 5174
```

### **Step 3: Clear Browser Cache**

- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Clear browser cache completely
- Try incognito/private window

### **Step 4: Verify Fix**

1. **Test connection:** `node test-supabase-connection.js`
2. **Check browser console:** Should see successful data fetching
3. **Check ARViewer:** Objects should now be visible

## Troubleshooting Checklist

- [ ] **API Key Format**: Using `sb_` prefix keys (not JWT)
- [ ] **Environment Variables**: Updated in `.env` file
- [ ] **Server Restart**: Development server restarted after .env changes
- [ ] **Browser Cache**: Cleared completely
- [ ] **Test Connection**: `test-supabase-connection.js` returns success
- [ ] **Console Errors**: No 401 or legacy key errors
- [ ] **Database Query**: Returns objects with `is_active: true`
- [ ] **ARViewer State**: `objects` array populated with data

## Common Issues & Solutions

### **Issue 1: "Legacy API keys are disabled"**

**Solution:** Update to new `sb_` format keys

### **Issue 2: 401 Unauthorized errors**

**Solution:** Check API key permissions in Supabase dashboard

### **Issue 3: Empty objects array**

**Solution:** Verify database has records with `is_active: true`

### **Issue 4: Environment variables not loaded**

**Solution:** Restart development server after .env changes

### **Issue 5: Cached old keys**

**Solution:** Hard refresh browser and clear cache

## Success Indicators

**✅ Working State:**

- Test connection script shows: `✅ Connection successful!`
- Browser console shows: `✅ Loaded GeoAgents: [array of objects]`
- ARViewer displays agents on the map/AR view
- No 401 or authentication errors

**✅ Expected Console Output:**

```
🔍 Loading GeoAgents from database...
✅ Loaded GeoAgents: [{id: "...", name: "...", ...}, ...]
🎯 AR Viewer ready with X active GeoAgents
```

## API Key Migration Reference

### **Legacy Format (DISABLED):**

- Start with: `eyJhbGciOiJIUzI1NiI...`
- Format: JWT tokens
- Status: Disabled by Supabase

### **New Format (ACTIVE):**

- Anon/Publishable: `sb_publishable_...`
- Service/Secret: `sb_secret_...`
- Format: Base64 encoded
- Status: Active and working

## Project Context

- **Repository:** agentsphere-full-web-man-US
- **Branch:** revolut-pay-sim (or main)
- **Database:** ncjbwzibnqrbrvicdmec.supabase.co
- **Port:** 5174
- **Component:** src/components/ARViewer.tsx

## Emergency Contacts

If issues persist:

1. **Verify Supabase dashboard**: API keys section
2. **Check RLS policies**: Database → Policies
3. **Validate permissions**: Table access permissions
4. **Test direct API calls**: Using curl or Postman

This issue was **CRITICAL** and required immediate API key format migration from legacy JWT to new `sb_` prefixed keys.
