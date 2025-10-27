# 🎯 Revolut Integration - Quick Reference

## 📚 Main Documents

### For AR Viewer Copilot: Start Here! 👇

1. **`AR_VIEWER_REVOLUT_INTEGRATION_PROMPT_UPDATED.md`**

   - Complete step-by-step integration guide
   - UI component templates
   - Phase 1: Bank QR payments
   - Phase 2: Virtual Card (Apple Pay/Google Pay)
   - **THIS IS YOUR MAIN GUIDE!**

2. **`AR_VIEWER_ENV_CONFIG.env`**

   - All credentials and API keys
   - Copy these to your .env file

3. **`REVOLUT_INTEGRATION_COMPLETE_GUIDE.md`**
   - Backend implementation details
   - API endpoint documentation
   - Payment flow diagrams
   - Testing procedures

---

## 🔌 Backend API Endpoints

### 1. Create Bank QR Payment

```javascript
POST /api/revolut/create-bank-order

Request:
{
  "amount": 10.50,
  "currency": "GBP",
  "agentId": "agent_12345"
}

Response:
{
  "success": true,
  "order": {
    "id": "01J824X...",
    "qr_code": "data:image/png;base64,...",
    "state": "PENDING"
  }
}
```

### 2. Process Virtual Card Payment

```javascript
POST /api/revolut/process-virtual-card-payment

Request:
{
  "token": "apple_pay_token_...",
  "amount": 10.50,
  "currency": "GBP",
  "agentId": "agent_12345",
  "provider": "apple_pay"
}

Response:
{
  "success": true,
  "order": {
    "id": "01J824X...",
    "state": "COMPLETED"
  }
}
```

### 3. Webhook (Automatic)

```javascript
POST / api / revolut / webhook;

// Revolut calls this automatically
// Events: ORDER_COMPLETED, ORDER_FAILED, ORDER_AUTHORISED
```

---

## 🔐 Credentials (Sandbox)

```bash
Client ID: 96ca6a20-254d-46e7-aad1-46132e087901
Access Token: sand_vfUxRQdLU8kVlztOYCLYNcXrBh0wXoKqGj0C7uIVxCc
API Base URL: https://sandbox-merchant.revolut.com
Webhook Secret: wsk_fRlH03El2veJJEIMalmaTMQ06cKP9sSb
Webhook URL: https://8323ecb51478.ngrok-free.app/api/revolut/webhook
Webhook ID: ddc3b9a5-c521-4c84-8a03-6a7a6370c079
```

---

## 🎨 UI Components to Implement

### Bank QR Modal

```jsx
import RevolutBankQRModal from "./RevolutBankQRModal";

<RevolutBankQRModal
  isOpen={showBankQR}
  onClose={() => setShowBankQR(false)}
  amount={agent.interaction_fee_amount}
  currency="GBP"
  agentId={agent.id}
  onPaymentComplete={handlePaymentSuccess}
/>;
```

### Virtual Card Modal

```jsx
import RevolutVirtualCardModal from "./RevolutVirtualCardModal";

<RevolutVirtualCardModal
  isOpen={showVirtualCard}
  onClose={() => setShowVirtualCard(false)}
  amount={agent.interaction_fee_amount}
  currency="GBP"
  agentId={agent.id}
  onPaymentComplete={handlePaymentSuccess}
/>;
```

---

## 🚀 Quick Start Steps

1. **Read:** `AR_VIEWER_REVOLUT_INTEGRATION_PROMPT_UPDATED.md`
2. **Copy:** `AR_VIEWER_ENV_CONFIG.env` → your `.env` file
3. **Implement:** RevolutBankQRModal component (Phase 1)
4. **Test:** Bank QR payment flow
5. **Implement:** RevolutVirtualCardModal component (Phase 2)
6. **Test:** Apple Pay/Google Pay flow

---

## 📂 Backend Files

```
src/
├── services/
│   └── revolutApiClient.js          ← API client
└── pages/
    └── api/
        └── revolut/
            ├── create-bank-order.js          ← Bank QR endpoint
            ├── process-virtual-card-payment.js ← Virtual Card endpoint
            └── webhook.js                    ← Webhook handler
```

---

## 🧪 Testing

### Test Bank QR:

```bash
curl -X POST http://localhost:5174/api/revolut/create-bank-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.50, "currency": "GBP", "agentId": "test_123"}'
```

### Test Virtual Card:

```bash
curl -X POST http://localhost:5174/api/revolut/process-virtual-card-payment \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test_token",
    "amount": 10.50,
    "currency": "GBP",
    "agentId": "test_123",
    "provider": "apple_pay"
  }'
```

---

## ✅ Implementation Checklist

- [x] Backend API endpoints created
- [x] Revolut API client implemented
- [x] Webhook handler with signature verification
- [x] Webhook registered with Revolut
- [x] Environment variables configured
- [x] Testing infrastructure (Ngrok)
- [x] Documentation completed
- [ ] AR Viewer frontend components
- [ ] Payment cube face integration
- [ ] End-to-end testing

---

## 💡 Key Points

1. **Two Payment Methods:**

   - Bank QR (users scan QR with banking app)
   - Virtual Card (Apple Pay / Google Pay)

2. **Backend is Ready:**

   - All endpoints working
   - Webhook configured
   - Security implemented

3. **AR Viewer Needs:**
   - Read integration guide
   - Implement UI components
   - Connect to backend endpoints
   - Test payment flows

---

## 🆘 Need Help?

- **Integration Guide:** `AR_VIEWER_REVOLUT_INTEGRATION_PROMPT_UPDATED.md`
- **Backend Details:** `REVOLUT_INTEGRATION_COMPLETE_GUIDE.md`
- **Environment Setup:** `AR_VIEWER_ENV_CONFIG.env`
- **API Testing:** Use curl commands above

---

**Version:** 1.0  
**Last Updated:** October 13, 2025  
**Status:** Backend Complete ✅ | Frontend Pending ⏳
