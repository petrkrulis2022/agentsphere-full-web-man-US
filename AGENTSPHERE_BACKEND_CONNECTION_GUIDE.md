# 🔗 Connecting AR Viewer to AgentSphere Backend

## 🎯 Overview

The **AR Viewer** (frontend) and **AgentSphere** (backend) are running in **separate codespaces** but need to communicate for Revolut payments. They are connected via **Ngrok tunnel**.

**Status**: ✅ **Backend Complete** | ✅ **Frontend Complete** | 🔄 **Ready to Connect**

---

## 📊 Implementation Status

### **Backend (AgentSphere - Codespace 1)** ✅

- ✅ All API endpoints implemented and tested
- ✅ Revolut API client working
- ✅ Webhook registered and verified
- ✅ Ngrok tunnel active: `https://8323ecb51478.ngrok-free.app`

### **Frontend (AR Viewer - Codespace 2)** ✅

- ✅ Bank QR service implemented (`revolutBankService.js`)
- ✅ Virtual Card service implemented (`revolutVirtualCardService.js`)
- ✅ Payment status tracking hook (`usePaymentStatus.js`)
- ✅ Bank QR modal component complete (`RevolutBankQRModal.jsx`)
- ✅ 3D cube integration complete (`CubePaymentEngine.jsx`)
- ✅ Mock mode tested and working
- 🔄 Ready for production: Set `USE_MOCK = false` + update ngrok URL

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CODESPACE 1                                  │
│              AgentSphere Backend                                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Local Server: http://localhost:5174                      │  │
│  │                                                            │  │
│  │  API Endpoints:                                           │  │
│  │  • /api/revolut/create-bank-order                        │  │
│  │  • /api/revolut/process-virtual-card-payment             │  │
│  │  • /api/revolut/webhook                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↕                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Ngrok Tunnel                                              │  │
│  │ Public URL: https://8323ecb51478.ngrok-free.app          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↕
                    (Internet)
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                     CODESPACE 2                                  │
│                AR Viewer Frontend                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ React/Vite App                                            │  │
│  │                                                            │  │
│  │ Makes API calls to:                                       │  │
│  │ https://8323ecb51478.ngrok-free.app/api/revolut/...      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration Steps for AR Viewer

### **Step 1: Set Environment Variable**

In your AR Viewer codespace, create or update `.env` file:

```bash
# AR Viewer .env

# AgentSphere Backend URL (via Ngrok)
VITE_AGENTSPHERE_API_URL=https://8323ecb51478.ngrok-free.app

# Revolut Client ID (for Virtual Card)
VITE_REVOLUT_CLIENT_ID=96ca6a20-254d-46e7-aad1-46132e087901

# Environment
VITE_REVOLUT_ENVIRONMENT=sandbox
```

### **Step 2: Update API Service**

In your `revolutBankService.js` or similar:

```javascript
// src/services/revolutBankService.js

const API_URL =
  import.meta.env.VITE_AGENTSPHERE_API_URL ||
  "https://8323ecb51478.ngrok-free.app";

export const createRevolutBankOrder = async (orderDetails) => {
  try {
    const response = await fetch(`${API_URL}/api/revolut/create-bank-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderDetails),
    });

    if (!response.ok) {
      throw new Error("Failed to create Revolut bank order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Revolut bank order:", error);
    throw error;
  }
};
```

---

## 🧪 Testing the Connection

### **Test 1: Verify Backend is Reachable**

From your AR Viewer terminal:

```bash
# Test if Ngrok tunnel is working
curl https://8323ecb51478.ngrok-free.app/api/revolut/create-bank-order

# Expected response:
# {"error":"Method not allowed"} or similar
# This means the backend is reachable!
```

### **Test 2: Test Bank QR Endpoint**

```bash
curl -X POST https://8323ecb51478.ngrok-free.app/api/revolut/create-bank-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.50,
    "currency": "GBP",
    "agentId": "test_agent_123"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "order": {
    "id": "01J824X...",
    "amount": 1050,
    "currency": "GBP",
    "state": "PENDING",
    "qr_code": "data:image/png;base64,..."
  }
}
```

### **Test 3: Test Virtual Card Endpoint**

```bash
curl -X POST https://8323ecb51478.ngrok-free.app/api/revolut/process-virtual-card-payment \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test_token",
    "amount": 10.50,
    "currency": "GBP",
    "agentId": "test_agent_123",
    "provider": "apple_pay"
  }'
```

---

## 🔍 Troubleshooting

### **Issue: "Failed to fetch" or CORS Error**

**Cause:** Ngrok tunnel might be down or CORS not configured

**Solution:**

1. Check if AgentSphere backend is running: `http://localhost:5174`
2. Verify Ngrok tunnel is active
3. Check backend logs for CORS errors

### **Issue: "Network request failed"**

**Cause:** Wrong API URL or network issue

**Solution:**

1. Verify `VITE_AGENTSPHERE_API_URL` in `.env`
2. Test with curl first
3. Check if both codespaces are running

### **Issue: "401 Unauthorized" or "403 Forbidden"**

**Cause:** Revolut credentials issue

**Solution:**

1. Verify Revolut Client ID is correct
2. Check backend `.env` has correct tokens
3. Ensure sandbox environment is set

---

## 📊 Connection Flow Diagram

### **Bank QR Payment Flow:**

```
┌──────────────┐                                          ┌─────────────┐
│  AR Viewer   │                                          │ AgentSphere │
│  (Frontend)  │                                          │  (Backend)  │
└──────┬───────┘                                          └──────┬──────┘
       │                                                          │
       │ 1. User taps "Bank QR" face                            │
       │                                                          │
       │ 2. POST /api/revolut/create-bank-order                │
       ├─────────────────────────────────────────────────────►│
       │    via: https://8323ecb51478.ngrok-free.app           │
       │                                                          │
       │                                          3. Backend creates
       │                                             Revolut order
       │                                                          │
       │ 4. Response with QR code                               │
       │◄─────────────────────────────────────────────────────┤
       │    { order: { qr_code: "..." } }                       │
       │                                                          │
       │ 5. Display QR to user                                  │
       │                                                          │
```

### **Virtual Card Payment Flow:**

```
┌──────────────┐                                          ┌─────────────┐
│  AR Viewer   │                                          │ AgentSphere │
│  (Frontend)  │                                          │  (Backend)  │
└──────┬───────┘                                          └──────┬──────┘
       │                                                          │
       │ 1. User taps "Virtual Card" face                        │
       │                                                          │
       │ 2. Initialize Apple Pay / Google Pay                    │
       │                                                          │
       │ 3. User authenticates (Face ID / Fingerprint)          │
       │                                                          │
       │ 4. Get payment token from Apple/Google                 │
       │                                                          │
       │ 5. POST /api/revolut/process-virtual-card-payment      │
       ├─────────────────────────────────────────────────────►│
       │    via: https://8323ecb51478.ngrok-free.app           │
       │    { token: "...", amount: 10.50 }                     │
       │                                                          │
       │                                          6. Backend processes
       │                                             payment with Revolut
       │                                                          │
       │ 7. Response with payment status                        │
       │◄─────────────────────────────────────────────────────┤
       │    { order: { state: "COMPLETED" } }                   │
       │                                                          │
       │ 8. Unlock agent features                               │
       │                                                          │
```

---

## 🚀 Quick Start Checklist

- [ ] **Step 1:** Copy `VITE_AGENTSPHERE_API_URL=https://8323ecb51478.ngrok-free.app` to AR Viewer `.env`
- [ ] **Step 2:** Verify AgentSphere backend is running (`http://localhost:5174`)
- [ ] **Step 3:** Test connection with curl
- [ ] **Step 4:** Update AR Viewer API service to use environment variable
- [ ] **Step 5:** Test Bank QR payment from AR Viewer
- [ ] **Step 6:** Test Virtual Card payment from AR Viewer
- [ ] **Step 7:** Verify webhook updates work correctly

---

## 🔐 Security Notes

### **Why Ngrok?**

- Allows Revolut webhook to reach your local backend
- Provides HTTPS for secure communication
- Enables testing without deploying to production

### **What's Secure:**

- ✅ All API calls use HTTPS (via Ngrok)
- ✅ Webhook has signature verification
- ✅ Revolut credentials stored in backend only
- ✅ Frontend never handles sensitive data directly

### **What AR Viewer Knows:**

- ✅ Public Ngrok URL (safe to share)
- ✅ Revolut Client ID (public, safe)
- ✅ API endpoints structure
- ❌ No access to Revolut Access Token (backend only)
- ❌ No access to webhook signing secret (backend only)

---

## 💡 Important Notes

### **1. Ngrok URL is Temporary**

If AgentSphere backend restarts Ngrok, the URL might change. Update your AR Viewer `.env` if needed.

### **2. Same Ngrok for Both**

The same Ngrok tunnel handles:

- AR Viewer → AgentSphere API calls
- Revolut → AgentSphere webhook calls

### **3. Backend Must Be Running**

AgentSphere backend (`localhost:5174`) must be running for AR Viewer to work.

### **4. Environment Variables**

Make sure to restart AR Viewer dev server after changing `.env` file.

---

## 📞 Support

If AR Viewer Copilot asks about backend connection:

1. **Share this document:** `AGENTSPHERE_BACKEND_CONNECTION_GUIDE.md`
2. **Key info to provide:**
   - Backend URL: `https://8323ecb51478.ngrok-free.app`
   - API endpoints: `/api/revolut/create-bank-order`, `/api/revolut/process-virtual-card-payment`
   - Client ID: `96ca6a20-254d-46e7-aad1-46132e087901`
3. **Testing:** Show curl examples above

---

## ✅ Success Indicators

You'll know the connection is working when:

- [x] **Backend**: Curl test returns valid JSON (not network error)
- [x] **Backend**: All API endpoints respond correctly
- [x] **Frontend**: Bank QR service implemented
- [x] **Frontend**: Virtual Card service implemented
- [x] **Frontend**: Payment status tracking working
- [x] **Frontend**: Mock mode fully functional
- [ ] **Integration**: AR Viewer connects to backend via ngrok
- [ ] **Integration**: QR codes display from real backend data
- [ ] **Integration**: Virtual Card payments process successfully
- [ ] **Integration**: Webhook updates arrive at backend
- [ ] **Integration**: Console logs show successful API calls

---

## 🚀 Next Steps for Full Connection

### **For AR Viewer Team:**

1. **Update Environment Variable:**

   ```bash
   # In AR Viewer .env.local
   VITE_AGENTSPHERE_API_URL=https://8323ecb51478.ngrok-free.app
   ```

2. **Enable Production Mode:**

   ```javascript
   // In revolutBankService.js (Line ~5)
   const USE_MOCK = false; // Change from true to false
   ```

3. **Restart Dev Server:**

   ```bash
   npm run dev
   ```

4. **Test Connection:**
   - Click "Bank QR" face on payment cube
   - Should make real API call to backend
   - Check console for API response
   - QR code should display real Revolut payment URL

### **For Backend Team:**

1. **Verify Ngrok is Running:**

   ```bash
   # Check if ngrok is active
   curl https://8323ecb51478.ngrok-free.app/api/revolut/create-bank-order

   # Should return: Method not allowed (405) - this is correct!
   ```

2. **Monitor Backend Logs:**

   ```bash
   # Watch for incoming requests from AR Viewer
   # You should see POST requests when AR Viewer creates orders
   ```

3. **Ready for Testing:** Backend is fully implemented and waiting for frontend connection

---

## 📚 Related Documentation

- **Complete Integration Guide:** `REVOLUT_INTEGRATION_COMPLETE_GUIDE.md`
- **Quick Reference:** `REVOLUT_QUICK_REFERENCE.md`
- **AR Viewer Prompt:** `AR_VIEWER_REVOLUT_INTEGRATION_PROMPT_UPDATED.md`
- **Frontend Status:** See "AR Viewer Frontend Implementation Details" section in `REVOLUT_INTEGRATION_COMPLETE_GUIDE.md`

---

**Last Updated:** October 13, 2025  
**Ngrok URL:** `https://8323ecb51478.ngrok-free.app`  
**Backend Port:** `5174`  
**Backend Status:** ✅ Active and Ready  
**Frontend Status:** ✅ Complete and Ready  
**Integration Status:** 🔄 Ready to Connect
