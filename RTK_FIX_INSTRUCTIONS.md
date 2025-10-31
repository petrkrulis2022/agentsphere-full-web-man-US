# RTK Fix Instructions - Complete Setup Guide

## Problem

RTK (Real-Time Kinematic) precision GPS service is failing with errors:

- `401 Unauthorized` - Wrong key format
- `404 Not Found` with `undefined` in URL - Missing `VITE_SUPABASE_URL`

## Root Cause

### Issue 1: Missing Environment Variables

If you see: `POST http://localhost:5178/undefined/functions/v1/get-precise-location 404 (Not Found)`

This means **`VITE_SUPABASE_URL` is not defined** in your `.env` file.

### Issue 2: Wrong Key Format

Supabase has two different key formats:

- **sb\_ format** (sb*publishable*/sb*secret*) - Used for database REST API operations
- **JWT format** (eyJ...) - Required for Edge Functions including RTK service

RTK uses the Edge Function `get-precise-location` which MUST use JWT tokens.

## Solution - Step by Step

### 1. Update .env File

Replace your entire `.env` file with this exact configuration:

```properties
VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA
VITE_SUPABASE_SERVICE_ROLE_KEY=sb_secret_s3sWA4HPYMpD-_I-GEzsIw_g92UJm9S
# Legacy JWT tokens for Edge Functions
VITE_SUPABASE_ANON_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110
VITE_SUPABASE_SERVICE_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3MzMwMCwiZXhwIjoyMDc3MDQ5MzAwfQ.5LiZQFdXgyMnM_HDVW5ZLTGuhF_9xOAbXEJ6yeJ_yTk
VITE_THIRDWEB_CLIENT_ID=299516306b51bd6356fd8995ed628950
VITE_THIRDWEB_SECRET_KEY=X2Td-JQsUBzfE7f-go2OjauaMsfN3ygzPzBvpz4eHn00ip5mMZQbWaf7UO4yvELtiNpcNQZknD30aoPh656qyA
ASSEMBLY_AI_API_KEY=b482b41e8e87465bbed26a492de2d63d

# Revolut Configuration
REVOLUT_CLIENT_ID=96ca6a20-254d-46e7-aad1-46132e087901
REVOLUT_MERCHANT_API_SECRET=sk_ZXzrNQBu3jAgK310spMgznoZxqclcsIP7BdZmUXo-UYMAfAfbX_ANT0mZokp12st
REVOLUT_MERCHANT_API_PUBLIC=pk_HdaK7P8tRmWac57H9deKv1BgnzvrTATOUsUvCjfbtdLr8AVy
REVOLUT_ENVIRONMENT=sandbox
REVOLUT_API_KEY=sk_ZXzrNQBu3jAgK310spMgznoZxqclcsIP7BdZmUXo-UYMAfAfbX_ANT0mZokp12st
REVOLUT_ACCESS_TOKEN=sand_vfUxRQdLU8kVlztOYCLYNcXrBh0wXoKqGj0C7uIVxCc
REVOLUT_API_BASE_URL=https://sandbox-merchant.revolut.com
REVOLUT_WEBHOOK_SECRET=wsk_fRlH03El2veJJEIMalmaTMQ06cKP9sSb

# Currency Configuration
PRIMARY_CURRENCY=USD
FALLBACK_CURRENCY=EUR
SUPPORTED_REGIONS=EU,UK,US

# Cross-service Configuration
API_PORT=3001
AGENTSPHERE_API_URL=http://localhost:3001
AR_VIEWER_URL=http://localhost:5173
AGENTSPHERE_FRONTEND_URL=http://localhost:5174
```

### 2. Critical Keys for RTK

**MUST HAVE BOTH:**

- `VITE_SUPABASE_ANON_KEY` = `sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA` (for database)
- `VITE_SUPABASE_ANON_JWT` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110` (for RTK)

### 3. Code Implementation (DeployObject.tsx)

The RTK function should look like this:

```typescript
const getRTKLocation = async (latitude: number, longitude: number) => {
  try {
    const token =
      import.meta.env.VITE_SUPABASE_ANON_JWT ||
      import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-precise-location`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude, longitude }),
      }
    );

    if (!response.ok) {
      throw new Error(`RTK service failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("RTK location error:", error);
    throw error;
  }
};
```

**IMPORTANT:**

- ✅ DO use `Authorization: Bearer ${token}` header
- ❌ DO NOT use `apikey` header (causes CORS preflight failure)
- ✅ DO use JWT token format (eyJ...)
- ❌ DO NOT use sb\_ format for Edge Functions

### 4. Testing RTK

Test from terminal:

```bash
curl -s -X POST "https://ncjbwzibnqrbrvicdmec.supabase.co/functions/v1/get-precise-location" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110" \
  -H "Content-Type: application/json" \
  -d '{"latitude":50.0755,"longitude":14.4378}'
```

**Expected Response:**

```json
{
  "preciseLatitude": 50.075499790057926,
  "preciseLongitude": 14.437798525447622,
  "preciseAltitude": 100.05378559791328,
  "accuracy": 0.02,
  "correctionApplied": true,
  "fixType": "RTK_FIXED",
  "satellites": 13
}
```

### 5. Restart Development Server

After updating .env:

```bash
npm run dev
```

## Key Differences Between Key Types

| Feature        | sb\_ Format          | JWT Format              |
| -------------- | -------------------- | ----------------------- |
| Used For       | Database REST API    | Edge Functions          |
| Example        | `sb_publishable_...` | `eyJhbGciOiJIUzI1N...`  |
| RTK Compatible | ❌ NO                | ✅ YES                  |
| Header Name    | `apikey`             | `Authorization: Bearer` |
| Expires        | Never                | 2077 (55 years)         |

## Troubleshooting

### Error: 401 Unauthorized

- Check that `VITE_SUPABASE_ANON_JWT` is set in .env
- Verify JWT token starts with `eyJ`
- Ensure using October 2025 JWT (iat: 1761473300), not January 2025

### Error: 404 Not Found with `undefined` in URL

**This is the most common error!**

If you see: `POST http://localhost:5178/undefined/functions/v1/get-precise-location 404`

**Solution:** Your `.env` file is missing `VITE_SUPABASE_URL`. You MUST have:

```properties
VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
```

**Why this happens:**

- Vite only loads environment variables that exist when the dev server starts
- If you add `VITE_SUPABASE_URL` after starting the server, it won't be loaded
- You MUST restart the dev server after adding environment variables

**Steps to fix:**

1. Check your `.env` file has `VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co`
2. Kill the dev server completely (Ctrl+C or `pkill -f vite`)
3. Restart: `npm run dev`

### Error: CORS Preflight

- Remove any `apikey` header from fetch request
- Only use `Authorization: Bearer` header
- Ensure `Content-Type: application/json` is set

### Error: RTK not applying corrections

- Check browser console for errors
- Verify Edge Function `get-precise-location` exists in Supabase
- Confirm GEODNET service is active

## Summary

1. Copy the complete `.env` file above
2. Ensure both `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_ANON_JWT` are present
3. Use only `Authorization: Bearer` header (no `apikey`)
4. Restart dev server
5. Test with curl command

RTK provides ~2cm accuracy (RTK_FIXED) compared to ~5-10m standard GPS.
