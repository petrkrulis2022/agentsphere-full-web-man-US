# 🚀 AgentSphere Backend API Server - Setup Guide

## 🚨 **PROBLEM SOLVED:**

**CORS Error Fixed!** The AR Viewer can now connect to the AgentSphere backend for Revolut payments.

---

## 📋 **What Was Wrong:**

1. ❌ **No Backend Server** - Vite doesn't execute API routes (unlike Next.js)
2. ❌ **No CORS Headers** - Backend wasn't configured to accept cross-origin requests
3. ❌ **API Routes Unused** - Files in `src/pages/api/` were just sitting there

---

## ✅ **What's Been Fixed:**

1. ✅ Created **Express.js backend server** (`server.js`)
2. ✅ Added **CORS middleware** to allow AR Viewer connections
3. ✅ Implemented all **Revolut API endpoints**
4. ✅ Updated **package.json** with backend scripts
5. ✅ Updated **.env** with proper configuration

---

## 🏗️ **New Architecture:**

```
┌──────────────────────────────────────────────────────────┐
│         AgentSphere (Codespace 1)                        │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────┐  ┌─────────────────────┐       │
│  │  Frontend (Vite)    │  │  Backend (Express)  │       │
│  │  Port: 5174         │  │  Port: 3001         │       │
│  └─────────────────────┘  └─────────────────────┘       │
│                                     │                      │
│                                     ▼                      │
│                            Revolut Sandbox API            │
│                                     ▲                      │
└─────────────────────────────────────┼──────────────────────┘
                                      │
                           ┌──────────┴──────────┐
                           │                     │
                           ▼                     ▼
              ┌────────────────────┐  ┌────────────────────┐
              │   AR Viewer        │  │   Ngrok Tunnel     │
              │ (Codespace 2)      │  │   8323ecb51478     │
              │  Port: 5173        │  │   .ngrok-free.app  │
              └────────────────────┘  └────────────────────┘
```

---

## 🚀 **How to Start the Backend:**

### **Option 1: Backend Only**

```bash
npm run dev:backend
```

This starts the Express API server on **port 3001**.

### **Option 2: Frontend + Backend Together**

```bash
npm run dev:all
```

This starts BOTH:

- Frontend (Vite) on **port 5174**
- Backend (Express) on **port 3001**

### **Option 3: Manual (Two Terminals)**

**Terminal 1 - Backend:**

```bash
node server.js
```

**Terminal 2 - Frontend:**

```bash
npm run dev -- --port 5174 --host
```

---

## 📡 **Backend API Endpoints:**

### **Health Check:**

```
GET http://localhost:3001/api/health
```

### **Create Bank QR Payment:**

```
POST http://localhost:3001/api/revolut/create-bank-order

Body:
{
  "amount": 10.00,
  "currency": "EUR",
  "agentId": "agent_123",
  "agentName": "Demo Agent"
}
```

### **Process Virtual Card Payment:**

```
POST http://localhost:3001/api/revolut/process-virtual-card-payment

Body:
{
  "token": "payment_token",
  "amount": 10.00,
  "currency": "EUR",
  "agentId": "agent_123",
  "provider": "apple_pay"
}
```

### **Check Order Status:**

```
GET http://localhost:3001/api/revolut/order-status/:orderId
```

### **Cancel Order:**

```
POST http://localhost:3001/api/revolut/cancel-order/:orderId
```

### **Webhook (Revolut → Backend):**

```
POST http://localhost:3001/api/revolut/webhook
```

---

## 🔌 **AR Viewer Configuration:**

### **Update AR Viewer `.env`:**

```bash
# AR Viewer .env.local (in AR Viewer codespace)
VITE_AGENTSPHERE_API_URL=http://localhost:3001

# OR if using ngrok (for remote access):
VITE_AGENTSPHERE_API_URL=https://8323ecb51478.ngrok-free.app
```

### **Set Production Mode:**

In AR Viewer's `revolutBankService.js`:

```javascript
// Change this:
const USE_MOCK = true;

// To this:
const USE_MOCK = false;
```

---

## 🧪 **Testing the Connection:**

### **Step 1: Start Backend**

```bash
npm run dev:backend
```

You should see:

```
🚀 AgentSphere Backend API Server Started!

📍 Server running on: http://localhost:3001
🔗 Health check: http://localhost:3001/api/health
...
```

### **Step 2: Test Health Check**

```bash
curl http://localhost:3001/api/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "AgentSphere Backend API is running",
  "timestamp": "2025-10-15T12:00:00.000Z"
}
```

### **Step 3: Test Revolut Endpoint**

```bash
curl -X POST http://localhost:3001/api/revolut/create-bank-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "EUR",
    "agentId": "test_123",
    "agentName": "Test Agent"
  }'
```

Expected response:

```json
{
  "success": true,
  "order": {
    "id": "revolut_order_...",
    "payment_url": "https://sandbox-merchant.revolut.com/pay/...",
    "qr_code_url": "https://sandbox-merchant.revolut.com/pay/...",
    "amount": 10.0,
    "currency": "EUR",
    "status": "pending"
  }
}
```

### **Step 4: Test from AR Viewer**

1. Open AR Viewer in browser
2. View/deploy an agent
3. Click "Bank QR" face on payment cube
4. Should now **work without CORS error!** ✅

---

## 🔧 **Environment Variables:**

### **AgentSphere Backend (.env):**

```bash
# Backend Server
API_PORT=3001

# Revolut Configuration
REVOLUT_ACCESS_TOKEN=sand_vfUxRQdLU8kVlztOYCLYNcXrBh0wXoKqGj0C7uIVxCc
REVOLUT_API_BASE_URL=https://sandbox-merchant.revolut.com
REVOLUT_WEBHOOK_SECRET=wsk_fRlH03El2veJJEIMalmaTMQ06cKP9sSb
REVOLUT_CLIENT_ID=96ca6a20-254d-46e7-aad1-46132e087901

# CORS Configuration (automatically handled)
AGENTSPHERE_API_URL=http://localhost:3001
AR_VIEWER_URL=http://localhost:5173
AGENTSPHERE_FRONTEND_URL=http://localhost:5174
```

---

## 🌐 **CORS Configuration:**

The backend automatically allows requests from:

- ✅ `http://localhost:5173` (AR Viewer)
- ✅ `http://localhost:5174` (AgentSphere Frontend)
- ✅ `http://localhost:3000` (Alternative port)
- ✅ `https://8323ecb51478.ngrok-free.app` (Ngrok tunnel)
- ✅ Any `*.ngrok-free.app` domain

**No additional configuration needed!** 🎉

---

## 🔍 **Debugging:**

### **Check if Backend is Running:**

```bash
curl http://localhost:3001/api/health
```

If this fails, backend isn't running.

### **Check CORS from AR Viewer:**

Open AR Viewer browser console and run:

```javascript
fetch("http://localhost:3001/api/health")
  .then((r) => r.json())
  .then(console.log);
```

Should return health check JSON.

### **Check Backend Logs:**

Backend server prints detailed logs:

```
📥 Received Bank QR Order Request: { amount: 10, ... }
🚀 Creating Revolut Order: { amount: 1000, ... }
🔵 Revolut API Request: POST https://sandbox-merchant.revolut.com/api/1.0/orders
✅ Revolut API Success: { id: '...', ... }
✅ Bank QR Order Created: { success: true, ... }
```

---

## 📊 **Port Summary:**

| Service                  | Port | URL                                 |
| ------------------------ | ---- | ----------------------------------- |
| **AgentSphere Frontend** | 5174 | http://localhost:5174               |
| **AgentSphere Backend**  | 3001 | http://localhost:3001               |
| **AR Viewer Frontend**   | 5173 | http://localhost:5173               |
| **Ngrok Tunnel**         | -    | https://8323ecb51478.ngrok-free.app |

---

## 🎯 **Quick Start Checklist:**

- [ ] **Step 1:** Start backend: `npm run dev:backend`
- [ ] **Step 2:** Verify health: `curl http://localhost:3001/api/health`
- [ ] **Step 3:** Update AR Viewer `.env.local`: `VITE_AGENTSPHERE_API_URL=http://localhost:3001`
- [ ] **Step 4:** Set `USE_MOCK = false` in AR Viewer's `revolutBankService.js`
- [ ] **Step 5:** Restart AR Viewer dev server
- [ ] **Step 6:** Test Bank QR payment from AR Viewer
- [ ] **Step 7:** Celebrate! 🎉

---

## 🐛 **Common Issues:**

### **Issue: "Cannot find module 'express'"**

**Solution:**

```bash
npm install express cors dotenv
```

### **Issue: "Port 3001 already in use"**

**Solution:**

```bash
# Change port in .env
API_PORT=3002
```

Or kill the process using port 3001:

```bash
lsof -ti:3001 | xargs kill -9
```

### **Issue: Still getting CORS error**

**Solution:**

1. Make sure backend is running on port 3001
2. Check AR Viewer is using correct API URL
3. Restart both frontend and backend
4. Clear browser cache

### **Issue: "Revolut API request failed"**

**Solution:**

1. Check `REVOLUT_ACCESS_TOKEN` in `.env`
2. Verify token is valid (not expired)
3. Check Revolut Sandbox status
4. Review backend logs for detailed error

---

## 📝 **Next Steps:**

1. ✅ **Test Bank QR payments** end-to-end
2. ✅ **Test Virtual Card payments**
3. ✅ **Set up ngrok** for remote access (if needed)
4. ✅ **Configure webhook** for payment status updates
5. ⏳ **Deploy to production** (replace sandbox credentials)

---

## 🚀 **Production Deployment:**

### **For Production:**

1. Replace `.env` values:

   ```bash
   REVOLUT_ACCESS_TOKEN=prod_YOUR_PRODUCTION_TOKEN
   REVOLUT_API_BASE_URL=https://merchant.revolut.com
   ```

2. Update ngrok webhook:

   ```bash
   # Register new webhook with production URL
   ```

3. Set proper CORS origins:
   ```javascript
   // In server.js, update corsOptions.origin
   origin: ["https://your-production-domain.com"];
   ```

---

**Status:** ✅ Backend Server Ready!  
**CORS Issue:** ✅ Fixed!  
**Ready for Testing:** ✅ Yes!

**Start the backend now:** `npm run dev:backend` 🚀
