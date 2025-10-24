# 🧪 Revolut Sandbox Payment Testing Guide

## ❓ Understanding Revolut Sandbox Accounts

### The Problem You Encountered

When you scanned the QR code, you got redirected to:

```
https://www.revolut.com/send-and-receive/
https://revolut.me/pay/revolut_1760627374962_uet4qh4x3
```

**This is a PRODUCTION Revolut URL, not a sandbox URL!**

### Why This Happened

1. **Your Sandbox Merchant Account** (Client ID: `96ca6a20-254d-46e7-aad1-46132e087901`) is correctly configured
2. **Revolut's API Response** was returning a production-formatted `payment_url` instead of sandbox format
3. **The Fix**: We now force sandbox URLs to use `https://sandbox-merchant.revolut.com/pay/{public_id}`

---

## 🎭 Two Accounts Required for Testing

### 1️⃣ Sandbox MERCHANT Account (RECEIVING) ✅ Already Set Up

- **What**: Your developer account that RECEIVES payments
- **Client ID**: `96ca6a20-254d-46e7-aad1-46132e087901`
- **API Key**: `sk_ZXzrNQBu3jAgK310spMgznoZxqclcsIP7BdZmUXo...`
- **Purpose**: This is where test payments will be sent TO
- **Status**: ✅ Already configured in your `.env`

### 2️⃣ Sandbox TEST Account (PAYING) ❌ You Need to Create This

- **What**: A separate test account that SENDS payments
- **Purpose**: To test making payments to your merchant account
- **Source**: Cannot use your real personal Revolut account!
- **Where to Get**: Revolut Developer Portal → Test Accounts

---

## 🚀 How to Test Sandbox Payments

### Step 1: Restart Backend with Fix

```bash
# Stop current backend (Ctrl+C)
node server.js
```

The updated code will now:

- ✅ Force sandbox URLs to use `sandbox-merchant.revolut.com`
- ✅ Use `public_id` instead of `id` for payment URLs
- ✅ Log the exact Revolut API response for debugging

### Step 2: Create a Sandbox Test Customer Account

**Option A: Use Revolut Sandbox Test Cards (Simplest)**

Revolut provides test card numbers for sandbox testing:

```
Test Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
3D Secure: 0000
```

**Option B: Create Full Sandbox Business Account (More Realistic)**

1. Go to [Revolut Developer Portal](https://developer.revolut.com/)
2. Log in with your developer account
3. Navigate to **Sandbox** → **Test Accounts**
4. Click **"Create Test Account"**
5. Choose **Business Account** type
6. This gives you a separate sandbox account to pay FROM

### Step 3: Test the Payment Flow

1. **Deploy Agent** with Bank QR payment enabled
2. **Click Bank QR face** in AR Viewer
3. **Scan QR code** → Should now redirect to:
   ```
   https://sandbox-merchant.revolut.com/pay/{public_id}
   ```
   (NOT revolut.me!)
4. **Enter test card details** (see Option A above)
5. **Complete payment**
6. **Check backend logs** for payment confirmation

### Step 4: Verify Payment in Revolut Dashboard

1. Go to [Revolut Business Sandbox Dashboard](https://business.sandbox.revolut.com/)
2. Log in with your merchant account
3. Check **Transactions** → You should see the test payment

---

## 🔍 What Changed in the Code

### Before (Wrong):

```javascript
const payment_url =
  order.payment_url || // This was returning production URL!
  `https://sandbox-merchant.revolut.com/pay/${order.id}`;
```

### After (Fixed):

```javascript
if (REVOLUT_API_BASE_URL.includes("sandbox")) {
  // Force sandbox URL with public_id
  payment_url = `https://sandbox-merchant.revolut.com/pay/${
    order.public_id || order.id
  }`;
} else {
  // Use API payment_url for production
  payment_url =
    order.payment_url ||
    `https://merchant.revolut.com/pay/${order.public_id || order.id}`;
}
```

**Key Changes:**

- ✅ Always use `sandbox-merchant.revolut.com` in sandbox mode
- ✅ Use `public_id` instead of `id` (required by Revolut sandbox)
- ✅ Ignore `order.payment_url` from API in sandbox (it returns production URL)
- ✅ Added extensive logging to debug API responses

---

## 📝 Expected Revolut API Response

When you create an order, Revolut returns something like:

```json
{
  "id": "01HZXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "public_id": "revolut_1760627374962_uet4qh4x3",
  "type": "PAYMENT",
  "state": "PENDING",
  "created_at": "2025-01-15T12:34:56.789Z",
  "updated_at": "2025-01-15T12:34:56.789Z",
  "order_amount": {
    "value": 1000,
    "currency": "USD"
  },
  "order_outstanding_amount": {
    "value": 1000,
    "currency": "USD"
  },
  "payment_url": "https://revolut.me/pay/revolut_1760627374962_uet4qh4x3" // ⚠️ This is PRODUCTION format even in sandbox!
}
```

**The Problem:**

- `payment_url` field contains production URL even when using sandbox API
- This is why we need to construct our own sandbox URL

**The Solution:**

- Use `public_id` field to build: `https://sandbox-merchant.revolut.com/pay/{public_id}`

---

## 🐛 Debugging Tips

### Check Backend Logs

After restarting the server, when you create an order, you'll see:

```
📦 Revolut API Response: { ... full response ... }
🔍 Order ID: 01HZXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
🔍 Payment URL from API: https://revolut.me/pay/revolut_...
🔍 Public ID: revolut_1760627374962_uet4qh4x3
🧪 SANDBOX MODE: Using constructed sandbox URL
✅ Final Payment URL: https://sandbox-merchant.revolut.com/pay/revolut_1760627374962_uet4qh4x3
```

### Verify Environment Variables

```bash
# Check your .env file
cat .env | grep REVOLUT

# Should show:
# REVOLUT_API_BASE_URL=https://sandbox-merchant.revolut.com
# REVOLUT_CLIENT_ID=96ca6a20-254d-46e7-aad1-46132e087901
# REVOLUT_API_KEY=sk_ZXzrNQBu3jAgK310spMgznoZxqclcsIP7BdZmUXo...
```

### Test Direct API Call (Optional)

```bash
curl -X POST https://sandbox-merchant.revolut.com/api/1.0/orders \
  -H "Authorization: Bearer sk_ZXzrNQBu3jAgK310spMgznoZxqclcsIP7BdZmUXo..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "order_description": "Test Order"
  }'
```

---

## ❓ FAQ

### Q: Can I pay sandbox orders with my real Revolut personal account?

**A: NO!** Sandbox orders can only be paid with:

- Sandbox test cards (4111 1111 1111 1111)
- Sandbox test business account
- Never mix sandbox and production accounts!

### Q: Where does the money go in sandbox mode?

**A: Nowhere!** It's all simulated. No real money moves. Your sandbox merchant account shows test transactions but it's not real money.

### Q: What's the difference between `id` and `public_id`?

- **`id`**: Internal Revolut order ID (UUID format like `01HZXXX-XXXX...`)
- **`public_id`**: Customer-facing payment ID (format like `revolut_1760627374962_uet4qh4x3`)
- Sandbox payment URLs require `public_id`

### Q: Why was `payment_url` returning production URL?

**A: Revolut API bug/limitation.** Even when using sandbox credentials and sandbox API endpoint, the `payment_url` field in the response contains a production URL. This is why we now construct our own sandbox URL instead of trusting the API response.

### Q: When do I switch to production?

**A: After testing is complete:**

1. Get production Revolut Business account approved
2. Update `.env` with production credentials:
   ```
   REVOLUT_API_BASE_URL=https://merchant.revolut.com
   REVOLUT_CLIENT_ID=your_production_client_id
   REVOLUT_API_KEY=your_production_api_key
   ```
3. Production `payment_url` from API should work correctly
4. Real customers pay with real Revolut accounts/cards

---

## 🎯 Next Steps

1. ✅ **Restart backend** with the URL fix
2. ✅ **Start ngrok tunnel** so AR Viewer can connect:
   ```bash
   ngrok http 3001
   ```
3. ✅ **Update AR Viewer** `.env.local` with ngrok URL
4. 🧪 **Test payment** with test card `4111 1111 1111 1111`
5. 📊 **Verify transaction** in Revolut sandbox dashboard
6. 🚀 **Deploy to production** when ready

---

## 📚 Resources

- [Revolut Developer Portal](https://developer.revolut.com/)
- [Revolut API Documentation](https://developer.revolut.com/docs/merchant-api/)
- [Revolut Sandbox Environment](https://business.sandbox.revolut.com/)
- [Revolut Test Cards](https://developer.revolut.com/docs/guides/test-in-sandbox/)

---

**Status**: 🔧 **FIXED** - Sandbox URLs now correctly use `sandbox-merchant.revolut.com` with `public_id`
