# ⚡ Revolut Integration - Quick Start Guide

## 🎯 15-Minute Connection Setup

**Status:** ✅ Both codespaces complete - Just connect them!

---

## 📊 Current Status

```
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (AgentSphere)        │  FRONTEND (AR Viewer)        │
│  ✅ Complete                   │  ✅ Complete                 │
├─────────────────────────────────────────────────────────────┤
│  • API endpoints working       │  • Services implemented      │
│  • Webhook verified            │  • Modal components ready    │
│  • Ngrok tunnel active         │  • Payment status hook done  │
│  • Documentation complete      │  • Cube integration done     │
│                                │  • Mock mode tested          │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    🔌 READY TO CONNECT!
```

---

## ⚡ 3 Steps to Production

### **Step 1: Update Environment Variable** (2 minutes)

**Location:** AR Viewer `.env.local`

```bash
# Add this line:
VITE_AGENTSPHERE_API_URL=https://8323ecb51478.ngrok-free.app
```

### **Step 2: Disable Mock Mode** (1 minute)

**Location:** AR Viewer `src/services/revolutBankService.js` (Line ~5)

```javascript
// Change this:
const USE_MOCK = true;

// To this:
const USE_MOCK = false;
```

### **Step 3: Restart Dev Server** (1 minute)

```bash
# In AR Viewer terminal:
npm run dev
```

---

## ✅ Test Connection (5 minutes)

### **1. Test Backend Reachability:**

```bash
# From AR Viewer codespace:
curl https://8323ecb51478.ngrok-free.app/api/revolut/create-bank-order

# Expected: {"error":"Method not allowed"} (HTTP 405)
# This means backend is reachable! ✅
```

### **2. Test Bank QR Payment:**

1. Open AR Viewer in browser
2. Deploy/view an agent
3. Click "Bank QR" face on payment cube
4. Should see "Generating QR Code..." message
5. QR code should display with real payment URL
6. Countdown timer should start (5 minutes)

**If you see the QR code → Connection successful!** 🎉

### **3. Test Virtual Card Payment:**

1. Click "Virtual Card" face on payment cube
2. Revolut checkout should initiate
3. Complete test payment
4. Should see success confirmation

---

## 📡 API Endpoints Now Available

| Endpoint                                    | Purpose                     |
| ------------------------------------------- | --------------------------- |
| `/api/revolut/create-bank-order`            | Create Bank QR payment      |
| `/api/revolut/process-virtual-card-payment` | Process Virtual Card        |
| `/api/revolut/order-status/:orderId`        | Check payment status        |
| `/api/revolut/cancel-order/:orderId`        | Cancel pending payment      |
| `/api/revolut/webhook`                      | Revolut webhook (automatic) |

**Base URL:** `https://8323ecb51478.ngrok-free.app`

---

## 🐛 Troubleshooting

### **Problem:** "Network Error" when clicking payment face

**Solutions:**

1. Check `VITE_AGENTSPHERE_API_URL` is set correctly
2. Verify ngrok tunnel is active: `curl https://8323ecb51478.ngrok-free.app`
3. Check AR Viewer console for error details
4. Restart AR Viewer dev server

### **Problem:** Still seeing mock data

**Solutions:**

1. Verify `USE_MOCK = false` in `revolutBankService.js`
2. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
3. Clear browser cache
4. Restart dev server

### **Problem:** QR code doesn't display

**Solutions:**

1. Check backend console logs for API errors
2. Verify Revolut credentials in backend `.env`
3. Test backend endpoint directly with curl
4. Check browser console for frontend errors

### **Problem:** Payment status doesn't update

**Solutions:**

1. Verify WebSocket connection in browser Network tab
2. Check polling fallback is working (3-second intervals)
3. Verify backend is processing webhook events
4. Check backend logs for webhook signature verification

---

## 📚 Documentation Reference

| Document                                     | Purpose                   | When to Read |
| -------------------------------------------- | ------------------------- | ------------ |
| `REVOLUT_INTEGRATION_FINAL_STATUS.md`        | Complete status report    | First read   |
| `AGENTSPHERE_BACKEND_CONNECTION_GUIDE.md`    | Connection setup details  | Setup phase  |
| `REVOLUT_INTEGRATION_COMPLETE_GUIDE.md`      | Full implementation guide | Deep dive    |
| `REVOLUT_QUICK_REFERENCE.md`                 | API quick reference       | During dev   |
| `REVOLUT_INTEGRATION_DOCUMENTATION_INDEX.md` | Navigation hub            | Anytime      |

---

## 🎯 Success Checklist

- [ ] **Step 1:** Updated `VITE_AGENTSPHERE_API_URL` in `.env.local`
- [ ] **Step 2:** Set `USE_MOCK = false` in `revolutBankService.js`
- [ ] **Step 3:** Restarted dev server
- [ ] **Test 1:** Backend connection verified with curl
- [ ] **Test 2:** Bank QR face displays real QR code
- [ ] **Test 3:** Virtual Card face initiates checkout
- [ ] **Test 4:** Payment status updates in real-time
- [ ] **Test 5:** Success modal shows after payment
- [ ] **Test 6:** Agent features unlock after payment

---

## 🎉 That's It!

**You're now live with Revolut payments!**

**Next Steps:**

- Test all payment flows thoroughly
- Report any issues
- Prepare for production deployment (replace sandbox credentials)

---

## 📞 Need Help?

**Connection Issues:** → `AGENTSPHERE_BACKEND_CONNECTION_GUIDE.md`  
**API Questions:** → `REVOLUT_INTEGRATION_COMPLETE_GUIDE.md`  
**Quick Reference:** → `REVOLUT_QUICK_REFERENCE.md`

---

**Version:** 1.0  
**Last Updated:** October 13, 2025  
**Status:** ✅ Ready to Connect  
**Estimated Time:** 15 minutes total

🚀 **Let's go!**
