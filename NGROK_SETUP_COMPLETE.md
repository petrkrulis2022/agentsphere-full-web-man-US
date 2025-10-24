# 🌐 Ngrok Tunnel Setup Complete

## ✅ Status: READY FOR TESTING

### 🔗 URLs

| Service         | URL                                   | Status       |
| --------------- | ------------------------------------- | ------------ |
| Backend API     | `http://localhost:3001`               | ✅ Running   |
| Ngrok Tunnel    | `https://78e5bf8d9db0.ngrok-free.app` | ✅ Active    |
| Ngrok Dashboard | `http://127.0.0.1:4040`               | ✅ Available |
| Frontend        | `http://localhost:5174`               | ✅ Running   |

---

## 🎯 Next Steps for AR Viewer

### 1. Update AR Viewer Configuration

In your **AR Viewer codespace**, update the `.env.local` file:

```bash
# Old (won't work from different codespace)
VITE_AGENTSPHERE_API_URL=http://localhost:3001

# New (works from any codespace)
VITE_AGENTSPHERE_API_URL=https://78e5bf8d9db0.ngrok-free.app
```

### 2. Restart AR Viewer

```bash
# Stop AR Viewer (Ctrl+C)
npm run dev
```

### 3. Test the Connection

1. Open AR Viewer in browser
2. Scan AgentSphere QR code
3. Click **Bank QR** payment face
4. Should now successfully connect to AgentSphere backend via ngrok!

---

## 🔍 Verify Ngrok is Working

### Option 1: Check Ngrok Dashboard

Open in browser: http://127.0.0.1:4040

You'll see:

- All HTTP requests going through the tunnel
- Request/response details
- Status codes

### Option 2: Test Direct API Call

```bash
curl https://78e5bf8d9db0.ngrok-free.app/api/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "AgentSphere Backend API is running",
  "timestamp": "2025-01-15T..."
}
```

### Option 3: Test from AR Viewer Codespace

```bash
# From AR Viewer codespace terminal
curl https://78e5bf8d9db0.ngrok-free.app/api/health
```

---

## 🐛 Debugging

### If AR Viewer Still Can't Connect

1. **Check CORS Headers**:

   ```bash
   curl -i -X OPTIONS https://78e5bf8d9db0.ngrok-free.app/api/revolut/create-bank-order \
     -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST"
   ```

2. **Verify Backend Logs**:
   Backend terminal should show incoming requests from ngrok

3. **Check Ngrok Dashboard**:
   http://127.0.0.1:4040 shows all requests, even failed ones

### Common Issues

| Issue              | Solution                                             |
| ------------------ | ---------------------------------------------------- |
| CORS error         | Backend CORS already configured for AR Viewer origin |
| 502 Bad Gateway    | Backend server down - restart with `node server.js`  |
| Connection refused | Ngrok tunnel down - restart with `ngrok http 3001`   |
| Wrong API URL      | Update AR Viewer `.env.local` with correct ngrok URL |

---

## 🧪 Testing Sandbox Payment with Fixed URL

Now that everything is connected, test the full flow:

### 1. Create Payment Order

From AR Viewer:

1. Click **Bank QR** face
2. Backend creates Revolut order
3. **Backend will now log**:
   ```
   📦 Revolut API Response: {...}
   🔍 Order ID: 01HZXXX...
   🔍 Payment URL from API: https://revolut.me/... (production - IGNORED)
   🔍 Public ID: revolut_1760627374962_uet4qh4x3
   🧪 SANDBOX MODE: Using constructed sandbox URL
   ✅ Final Payment URL: https://sandbox-merchant.revolut.com/pay/revolut_1760627374962_uet4qh4x3
   ```

### 2. Scan QR Code

Should redirect to:

```
https://sandbox-merchant.revolut.com/pay/revolut_1760627374962_uet4qh4x3
```

**NOT** to:

```
https://revolut.me/pay/... ❌ (production URL)
```

### 3. Enter Test Card

Use Revolut sandbox test card:

```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
3D Secure: 0000
```

### 4. Complete Payment

Backend webhook should receive notification:

```
🔔 Webhook received: ORDER_COMPLETED
```

---

## 📊 What Changed

### Before (Broken):

- ❌ AR Viewer calls `http://localhost:3001` from different codespace → Connection refused
- ❌ Backend returns production `payment_url` from Revolut API
- ❌ QR code redirects to `revolut.me` (production)

### After (Fixed):

- ✅ AR Viewer calls `https://78e5bf8d9db0.ngrok-free.app` → Works across codespaces
- ✅ Backend constructs sandbox URL using `public_id`
- ✅ QR code redirects to `sandbox-merchant.revolut.com` (sandbox)

---

## 🔒 Security Notes

### Ngrok Free Tier

- ✅ HTTPS enabled by default
- ✅ Random subdomain (`78e5bf8d9db0.ngrok-free.app`)
- ⚠️ URL changes each time you restart ngrok
- ⚠️ Session timeout after inactivity

### For Production

- Use ngrok paid plan for static domain
- Or deploy to cloud with public IP:
  - AWS EC2
  - Google Cloud Run
  - Vercel/Netlify
  - Railway/Render

---

## 🚀 Ready for Testing!

Everything is now set up:

1. ✅ Backend API running on port 3001
2. ✅ Ngrok tunnel active: `https://78e5bf8d9db0.ngrok-free.app`
3. ✅ CORS configured for AR Viewer
4. ✅ Sandbox URL fix applied (uses `public_id`)
5. ✅ Extensive logging for debugging

**Go to AR Viewer and test the Bank QR payment!** 🎉

---

## 📝 Quick Reference

```bash
# Check what's running
lsof -i :3001  # Backend server
lsof -i :4040  # Ngrok dashboard

# Restart backend
pkill -f "node server.js" && node server.js

# Restart ngrok
pkill ngrok && ngrok http 3001

# View logs
tail -f server.log  # If you redirect output
# Or just watch the terminal where node server.js is running
```

---

**Need Help?** Check:

- Backend terminal for API logs
- Ngrok dashboard at http://127.0.0.1:4040
- AR Viewer browser console for errors
- `REVOLUT_SANDBOX_TESTING_GUIDE.md` for payment testing details
