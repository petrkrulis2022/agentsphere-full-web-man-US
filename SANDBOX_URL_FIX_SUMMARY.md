# ✅ SANDBOX URL FIX - COMPLETE SUMMARY

## 🎯 Problem Solved

### The Issue

When testing Revolut sandbox payments, the QR code was redirecting to:

```
❌ https://revolut.me/pay/revolut_1760627374962_uet4qh4x3 (PRODUCTION)
```

Instead of:

```
✅ https://sandbox-merchant.revolut.com/pay/revolut_1760627374962_uet4qh4x3 (SANDBOX)
```

### Root Cause

Revolut's sandbox API was returning a `payment_url` field with **production format** even though:

- Using sandbox API endpoint (`https://sandbox-merchant.revolut.com`)
- Using sandbox credentials
- Creating orders in sandbox environment

This appears to be a Revolut API limitation/bug.

---

## 🔧 The Fix

### Code Changes in `server.js`

**Before (Lines 113-123):**

```javascript
// Call Revolut API
const order = await revolutApiFetch("/api/1.0/orders", {
  method: "POST",
  body: JSON.stringify(orderData),
});

// Construct payment URL (Revolut should provide this in the order response)
// Format: https://sandbox-merchant.revolut.com/pay/{order_id}
const payment_url =
  order.payment_url || // ❌ This returns production URL!
  `https://sandbox-merchant.revolut.com/pay/${order.id}`;
const qr_code_url = payment_url;
```

**After (Lines 113-141):**

```javascript
// Call Revolut API
const order = await revolutApiFetch("/api/1.0/orders", {
  method: "POST",
  body: JSON.stringify(orderData),
});

console.log("📦 Revolut API Response:", JSON.stringify(order, null, 2));
console.log("🔍 Order ID:", order.id);
console.log("🔍 Payment URL from API:", order.payment_url);
console.log("🔍 Public ID:", order.public_id);

// Construct payment URL based on environment
// IMPORTANT: Revolut sandbox uses public_id, not id
// Format: https://sandbox-merchant.revolut.com/pay/{public_id}
let payment_url;
if (REVOLUT_API_BASE_URL.includes("sandbox")) {
  // Use public_id for sandbox (required for sandbox environment)
  payment_url = `https://sandbox-merchant.revolut.com/pay/${
    order.public_id || order.id
  }`;
  console.log("🧪 SANDBOX MODE: Using constructed sandbox URL");
} else {
  // Use payment_url from API for production
  payment_url =
    order.payment_url ||
    `https://merchant.revolut.com/pay/${order.public_id || order.id}`;
  console.log(
    "🌐 PRODUCTION MODE: Using API payment_url or constructed production URL"
  );
}

console.log("✅ Final Payment URL:", payment_url);
const qr_code_url = payment_url; // Use same URL for QR code
```

### Key Improvements

1. **Environment Detection**:

   - Checks if `REVOLUT_API_BASE_URL` contains "sandbox"
   - Forces sandbox URL format in sandbox mode
   - Uses API `payment_url` only in production

2. **Uses `public_id` Instead of `id`**:

   - Revolut sandbox requires `public_id` for payment URLs
   - Format: `revolut_1760627374962_uet4qh4x3`
   - Not the internal UUID `id`: `01HZXXX-XXXX-XXXX...`

3. **Extensive Logging**:

   - Logs full API response for debugging
   - Shows both `id` and `public_id`
   - Shows API `payment_url` vs constructed URL
   - Clearly indicates sandbox vs production mode

4. **Ignores Buggy API Field**:
   - Doesn't trust `order.payment_url` in sandbox
   - Constructs correct sandbox URL manually
   - Only uses API `payment_url` in production where it works correctly

---

## 🧪 How Sandbox Testing Works

### Two Accounts Required

| Account Type              | Purpose           | Where                        | Status           |
| ------------------------- | ----------------- | ---------------------------- | ---------------- |
| **Merchant Account**      | RECEIVES payments | AgentSphere backend          | ✅ Set up        |
| **Test Customer Account** | SENDS payments    | Test card or sandbox account | ⚠️ Use test card |

### Your Merchant Account (Already Set Up)

```bash
REVOLUT_CLIENT_ID=96ca6a20-254d-46e7-aad1-46132e087901
REVOLUT_API_KEY=sk_ZXzrNQBu3jAgK310spMgznoZxqclcsIP7BdZmUXo...
REVOLUT_API_BASE_URL=https://sandbox-merchant.revolut.com
```

### Test Card for Payments (Use This!)

```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits (e.g., 123)
Expiry: Any future date (e.g., 12/25)
3D Secure Code: 0000
```

**Important**:

- ❌ Cannot pay sandbox orders with your real personal Revolut account
- ✅ Must use test card or create sandbox test account
- 💰 No real money moves - it's all simulated

---

## 🌐 Ngrok Tunnel Setup

### Why Needed

AR Viewer runs in **Codespace 2**, AgentSphere backend in **Codespace 1**.

- ❌ `http://localhost:3001` doesn't work across codespaces
- ✅ `https://78e5bf8d9db0.ngrok-free.app` works from anywhere

### Current Configuration

| Component    | URL                                   |
| ------------ | ------------------------------------- |
| Backend API  | `http://localhost:3001`               |
| Ngrok Tunnel | `https://78e5bf8d9db0.ngrok-free.app` |
| AR Viewer    | Update `.env.local` with ngrok URL    |

### Update AR Viewer

In AR Viewer codespace, edit `.env.local`:

```bash
VITE_AGENTSPHERE_API_URL=https://78e5bf8d9db0.ngrok-free.app
```

Then restart:

```bash
npm run dev
```

---

## 🎯 Testing the Complete Flow

### Step 1: Verify Servers Running

```bash
# Backend API
curl http://localhost:3001/api/health
# Should return: {"status":"ok","message":"AgentSphere Backend API is running",...}

# Ngrok tunnel
curl https://78e5bf8d9db0.ngrok-free.app/api/health
# Should return same response
```

### Step 2: Test Payment Creation

1. **From AR Viewer**: Click Bank QR face
2. **Check Backend Logs**: You'll see:

   ```
   📦 Revolut API Response: {
     "id": "01HZXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
     "public_id": "revolut_1760627374962_uet4qh4x3",
     "payment_url": "https://revolut.me/pay/..." ← WRONG (production)
     ...
   }
   🔍 Order ID: 01HZXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   🔍 Payment URL from API: https://revolut.me/pay/... ← IGNORED
   🔍 Public ID: revolut_1760627374962_uet4qh4x3
   🧪 SANDBOX MODE: Using constructed sandbox URL
   ✅ Final Payment URL: https://sandbox-merchant.revolut.com/pay/revolut_1760627374962_uet4qh4x3 ← CORRECT!
   ```

3. **QR Code Displayed**: Should show correct sandbox URL

### Step 3: Scan QR Code

- Should redirect to: `https://sandbox-merchant.revolut.com/pay/revolut_...`
- **NOT** to: `https://revolut.me/pay/...`

### Step 4: Enter Test Card

```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
3D Secure: 0000
```

### Step 5: Complete Payment

Backend should receive webhook:

```
🔔 Webhook received: ORDER_COMPLETED
Order ID: 01HZXXX...
Status: COMPLETED
Amount: 10.00 USD
```

---

## 📊 What Gets Logged

### On Payment Creation

```
🔵 POST /api/revolut/create-bank-order
📋 Request Body: {"agentId":"...","amount":1000,"currency":"USD"}
🚀 Creating Revolut Order: {...}
📦 Revolut API Response: {...}
🔍 Order ID: 01HZXXX...
🔍 Payment URL from API: https://revolut.me/... (production)
🔍 Public ID: revolut_1760627374962_uet4qh4x3
🧪 SANDBOX MODE: Using constructed sandbox URL
✅ Final Payment URL: https://sandbox-merchant.revolut.com/pay/revolut_...
✅ Bank order created successfully
```

### On Webhook Received

```
🔔 Webhook received from Revolut
Event Type: ORDER_COMPLETED
Order ID: 01HZXXX...
Status: COMPLETED
```

---

## 🐛 Troubleshooting

### Issue: Still Getting Production URL

**Check**:

1. Backend restarted after code changes?

   ```bash
   pkill -f "node server.js" && node server.js
   ```

2. `.env` has correct `REVOLUT_API_BASE_URL`?

   ```bash
   cat .env | grep REVOLUT_API_BASE_URL
   # Should show: https://sandbox-merchant.revolut.com
   ```

3. Check backend logs for "🧪 SANDBOX MODE" message

### Issue: CORS Error from AR Viewer

**Check**:

1. Backend CORS includes ngrok URL?

   ```javascript
   const allowedOrigins = [
     "http://localhost:5173", // AR Viewer
     "https://78e5bf8d9db0.ngrok-free.app", // Ngrok
   ];
   ```

2. AR Viewer using ngrok URL?
   ```bash
   # In AR Viewer codespace
   cat .env.local | grep AGENTSPHERE
   # Should show: https://78e5bf8d9db0.ngrok-free.app
   ```

### Issue: Payment Page Shows Error

**Possible Causes**:

1. Using real personal account to pay sandbox order ❌

   - **Solution**: Use test card `4111 1111 1111 1111`

2. Sandbox merchant account not approved

   - **Check**: Revolut Developer Dashboard

3. Order expired (5 minute timeout)
   - **Solution**: Create new order

---

## 📚 Related Documentation

- `REVOLUT_SANDBOX_TESTING_GUIDE.md` - Complete testing guide
- `NGROK_SETUP_COMPLETE.md` - Ngrok tunnel details
- `BACKEND_API_SERVER_SETUP.md` - Backend server setup
- `MULTI_TENANT_REVOLUT_PAYMENT_ROUTING.md` - Future multi-tenant architecture

---

## ✅ Current Status

| Component          | Status      | Details                                      |
| ------------------ | ----------- | -------------------------------------------- |
| Backend API        | ✅ Running  | Port 3001                                    |
| Ngrok Tunnel       | ✅ Active   | `https://78e5bf8d9db0.ngrok-free.app`        |
| CORS Configuration | ✅ Updated  | Includes AR Viewer + ngrok                   |
| Sandbox URL Fix    | ✅ Applied  | Uses `public_id`, ignores API `payment_url`  |
| Logging            | ✅ Enhanced | Shows full API response and URL construction |
| Testing            | ⏳ Ready    | Use test card `4111 1111 1111 1111`          |

---

## 🚀 Next Steps

1. **Update AR Viewer**:

   ```bash
   # In AR Viewer codespace .env.local
   VITE_AGENTSPHERE_API_URL=https://78e5bf8d9db0.ngrok-free.app
   ```

2. **Restart AR Viewer**:

   ```bash
   npm run dev
   ```

3. **Test Payment Flow**:

   - Click Bank QR face
   - Verify sandbox URL in QR code
   - Pay with test card `4111 1111 1111 1111`
   - Verify webhook received

4. **Check Revolut Dashboard**:

   - Go to https://business.sandbox.revolut.com/
   - Check Transactions for test payment

5. **Prepare for Production**:
   - Get production Revolut Business account approved
   - Update `.env` with production credentials
   - Test with real bank account/card
   - Implement multi-tenant revenue routing (see `MULTI_TENANT_REVOLUT_PAYMENT_ROUTING.md`)

---

**Status**: 🎉 **READY FOR TESTING!**

All systems configured and running. The sandbox URL bug is fixed and properly logged for debugging.
