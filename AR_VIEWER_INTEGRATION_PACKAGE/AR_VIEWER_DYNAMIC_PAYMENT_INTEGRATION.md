# AR Viewer - Dynamic Payment Integration Guide

**Branch:** `revolut-pay-sim` (Backend) → AR Viewer branch TBD  
**Date:** October 23, 2025  
**Status:** Backend Complete ✅ | Frontend Pending ⏳

---

## 📋 Overview

This document guides the AR Viewer team on integrating with the new **Dynamic Payment System** for Payment Terminal and Trailing Payment Terminal agents. This system allows merchants (e-shops, on-ramps) to pass variable payment amounts to virtual terminals displayed in AR.

---

## 🎯 What's New in AgentSphere Backend

### New Agent Types

**Payment Terminal** (`payment_terminal`)

- **Purpose:** Virtual payment terminal for online merchants
- **Fee Model:** Dynamic (set by merchant per transaction)
- **Revenue:** 100% to terminal owner (no platform fee)
- **Use Cases:** E-shop checkouts, service payments

**Trailing Payment Terminal** (`trailing_payment_terminal`)

- **Purpose:** Same as Payment Terminal but follows user location
- **Behavior:** Terminal moves with user in AR space
- **Use Cases:** Personal payment terminal, mobile checkout

### New Backend Endpoints

#### 1. **Create Payment Session**

```
POST http://localhost:3001/api/payments/terminal/create-session
```

Creates a new payment request from a merchant.

**Request:**

```json
{
  "terminalAgentId": "agent_1761241470082_d9334ad6",
  "merchantId": "eshop_12345",
  "merchantName": "My E-Shop",
  "amount": 99.5,
  "currency": "USD",
  "paymentMethod": "revolut_card", // or "crypto", "revolut_qr"
  "token": "USDC",
  "cartData": {
    "items": [
      { "name": "Product A", "quantity": 2, "price": 29.99 },
      { "name": "Product B", "quantity": 1, "price": 39.52 }
    ],
    "total": 99.5
  },
  "redirectUrl": "https://myeshop.com/order/success",
  "metadata": {
    "orderId": "ORDER-2025-001"
  }
}
```

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "ps_1761241470216_f7c49e2658b3",
    "terminalAgentId": "agent_1761241470082_d9334ad6",
    "merchantName": "My E-Shop",
    "amount": 99.5,
    "currency": "USD",
    "paymentMethod": "revolut_card",
    "expiresAt": "2025-10-23T17:59:30.216Z",
    "paymentUrl": "http://localhost:5173/virtual-terminal?session=ps_xxx"
  }
}
```

#### 2. **Get Payment Session**

```
GET http://localhost:3001/api/payments/terminal/session/:sessionId
```

Retrieves session details for display in AR Viewer.

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "ps_1761241470216_f7c49e2658b3",
    "terminalAgentId": "agent_1761241470082_d9334ad6",
    "merchantName": "My E-Shop",
    "amount": 99.5,
    "currency": "USD",
    "paymentMethod": "revolut_card",
    "token": "USDC",
    "cartData": {
      "items": [
        { "name": "Product A", "quantity": 2, "price": 29.99 },
        { "name": "Product B", "quantity": 1, "price": 39.52 }
      ],
      "total": 99.5
    },
    "status": "pending",
    "createdAt": "2025-10-23T17:44:30.216Z",
    "expiresAt": "2025-10-23T17:59:30.216Z"
  }
}
```

#### 3. **Complete Payment**

```
POST http://localhost:3001/api/payments/terminal/complete
```

Marks payment as completed after user confirms.

**Request:**

```json
{
  "sessionId": "ps_1761241470216_f7c49e2658b3",
  "transactionHash": "0xabc123...", // For crypto
  "revolutPaymentId": "revolut_pay_12345", // For Revolut
  "userWallet": "0x1234567890abcdef",
  "paymentProof": "proof_data"
}
```

**Response:**

```json
{
  "success": true,
  "payment": {
    "sessionId": "ps_1761241470216_f7c49e2658b3",
    "status": "completed",
    "amount": 99.5,
    "currency": "USD",
    "transactionHash": "0xabc123...",
    "redirectUrl": "https://myeshop.com/order/success",
    "completedAt": "2025-10-23T17:44:30.806Z"
  }
}
```

#### 4. **Cancel Payment**

```
POST http://localhost:3001/api/payments/terminal/cancel/:sessionId
```

Cancels a pending payment session.

---

## 🔧 AR Viewer Integration Tasks

### Phase 1: Virtual Terminal Route (NEW)

Create a new route to handle payment terminal sessions.

**Route:** `/virtual-terminal?session=ps_xxx`

**Component:** `VirtualTerminal.jsx`

```jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const VirtualTerminal = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId]);

  const fetchSession = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/payments/terminal/session/${id}`
      );
      const data = await response.json();

      if (data.success) {
        setSession(data.session);
      } else {
        setError(data.error || "Session not found");
      }
    } catch (err) {
      setError("Failed to load payment session");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    // Show existing Revolut/Crypto payment modal
    // based on session.paymentMethod

    if (session.paymentMethod === "revolut_card") {
      // Show Revolut Virtual Card modal
      await processRevolutCardPayment();
    } else if (session.paymentMethod === "revolut_qr") {
      // Show Revolut QR modal
      await processRevolutQRPayment();
    } else if (session.paymentMethod === "crypto") {
      // Show crypto payment modal
      await processCryptoPayment();
    }
  };

  const processRevolutCardPayment = async () => {
    // Existing Revolut card payment logic
    // But instead of fixed amount, use session.amount

    const paymentResult = await makeRevolutCardPayment({
      amount: session.amount,
      currency: session.currency,
      cardId: userVirtualCardId,
    });

    if (paymentResult.success) {
      await completeSession(paymentResult.revolutPaymentId);
    }
  };

  const completeSession = async (paymentId) => {
    const response = await fetch(
      "http://localhost:3001/api/payments/terminal/complete",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          revolutPaymentId: paymentId,
          userWallet: userWalletAddress,
          paymentProof: "simulated_proof",
        }),
      }
    );

    const data = await response.json();

    if (data.success && data.payment.redirectUrl) {
      // Redirect user back to merchant
      window.location.href = data.payment.redirectUrl;
    }
  };

  if (loading) return <div>Loading payment session...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Session not found</div>;

  return (
    <div className="virtual-terminal">
      <h2>Payment Terminal</h2>

      <div className="merchant-info">
        <h3>{session.merchantName}</h3>
        <p>
          Amount: {session.amount} {session.currency}
        </p>
      </div>

      {session.cartData && (
        <div className="cart-details">
          <h4>Cart Items:</h4>
          <ul>
            {session.cartData.items.map((item, index) => (
              <li key={index}>
                {item.name} x {item.quantity} = ${item.price}
              </li>
            ))}
          </ul>
          <p>Total: ${session.cartData.total}</p>
        </div>
      )}

      <div className="payment-method">
        <p>Payment Method: {session.paymentMethod}</p>
      </div>

      <button onClick={handlePayment}>Pay ${session.amount}</button>

      <div className="session-expiry">
        <p>Session expires: {new Date(session.expiresAt).toLocaleString()}</p>
      </div>
    </div>
  );
};
```

### Phase 2: Update Agent Card Recognition

Terminal agents should be visually distinct in AR.

**File:** `ARViewer.jsx` or `AgentCard.jsx`

```jsx
// Check if agent is terminal type
const isTerminalAgent = (agent) => {
  return (
    agent.agentType === "payment_terminal" ||
    agent.agentType === "trailing_payment_terminal"
  );
};

// Different visual treatment
const getAgentIcon = (agent) => {
  if (agent.agentType === "payment_terminal") {
    return "💳"; // Credit card icon
  }
  if (agent.agentType === "trailing_payment_terminal") {
    return "📱"; // Mobile payment icon
  }
  // ... other agent types
};

// Different interaction
const handleAgentInteraction = (agent) => {
  if (isTerminalAgent(agent)) {
    // For terminals, check for pending sessions
    checkForPendingSessions(agent.id);
  } else {
    // Regular agent interaction
    processRegularInteraction(agent);
  }
};

const checkForPendingSessions = async (terminalAgentId) => {
  // Check if there are any pending payment sessions for this terminal
  // This could be done via URL params or backend query
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session");

  if (sessionId) {
    // Redirect to virtual terminal route
    window.location.href = `/virtual-terminal?session=${sessionId}`;
  } else {
    // Show "No pending payments" message
    alert("This is a payment terminal. No pending payments.");
  }
};
```

### Phase 3: Update Existing Payment Components

**Modify:** `RevolutVirtualCard.jsx`

Add support for dynamic amounts from payment sessions:

```jsx
const RevolutVirtualCard = ({
  agentId,
  agentName,
  initialAmount,
  currency,
  sessionId = null, // NEW: Optional session ID
  onSuccess,
  onError,
}) => {
  const [paymentAmount, setPaymentAmount] = useState(initialAmount);

  useEffect(() => {
    if (sessionId) {
      // If session ID provided, fetch session amount
      fetchSessionAmount(sessionId);
    }
  }, [sessionId]);

  const fetchSessionAmount = async (id) => {
    const response = await fetch(
      `http://localhost:3001/api/payments/terminal/session/${id}`
    );
    const data = await response.json();

    if (data.success) {
      setPaymentAmount(data.session.amount);
      setIsSessionPayment(true);
    }
  };

  const handleSimulatePayment = async () => {
    // Existing payment logic...

    // If this is a session payment, complete the session
    if (sessionId) {
      await completePaymentSession(sessionId, paymentResult);
    }
  };

  // ... rest of component
};
```

**Modify:** `RevolutBankQRModal.jsx`

Similar changes for QR payments:

```jsx
const RevolutBankQRModal = ({
  agentId,
  agentName,
  amount,
  currency,
  sessionId = null, // NEW: Optional session ID
  onClose,
}) => {
  const handlePayNow = async () => {
    // Existing QR payment logic...

    // If this is a session payment, complete the session
    if (sessionId) {
      await completePaymentSession(sessionId, qrPaymentResult);
    }
  };

  // ... rest of component
};
```

### Phase 4: Add Session Management Service

**New File:** `src/services/paymentSessionService.js`

```javascript
const API_BASE_URL = "http://localhost:3001";

export const paymentSessionService = {
  // Get payment session details
  getSession: async (sessionId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/payments/terminal/session/${sessionId}`
    );
    return response.json();
  },

  // Complete payment session
  completeSession: async (sessionId, paymentData) => {
    const response = await fetch(
      `${API_BASE_URL}/api/payments/terminal/complete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ...paymentData,
        }),
      }
    );
    return response.json();
  },

  // Cancel payment session
  cancelSession: async (sessionId, reason = "User cancelled") => {
    const response = await fetch(
      `${API_BASE_URL}/api/payments/terminal/cancel/${sessionId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }
    );
    return response.json();
  },

  // Check if session is expired
  isSessionExpired: (session) => {
    return new Date() > new Date(session.expiresAt);
  },
};
```

---

## 🎨 UI/UX Recommendations

### Terminal Agent Visual Design

```css
/* Different color for terminal agents */
.agent-card.payment-terminal {
  border: 3px solid #f59e0b; /* Amber - Payment/Financial */
  background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
}

.agent-card.payment-terminal::before {
  content: "💳";
  font-size: 48px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.2;
}

/* Badge indicator for terminal */
.terminal-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f59e0b;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}
```

### Virtual Terminal UI

**Layout:**

```
┌─────────────────────────────────┐
│  Payment Terminal               │
├─────────────────────────────────┤
│  From: My E-Shop                │
│  Amount: $99.50 USD             │
│                                 │
│  Cart Details:                  │
│  • Product A x2 = $59.98        │
│  • Product B x1 = $39.52        │
│  ─────────────────              │
│  Total: $99.50                  │
│                                 │
│  Payment Method:                │
│  [💳 Revolut Virtual Card]      │
│                                 │
│  ┌───────────────────┐          │
│  │  Pay $99.50       │          │
│  └───────────────────┘          │
│                                 │
│  Session expires in: 14:32      │
└─────────────────────────────────┘
```

### Loading States

```jsx
{
  loading && (
    <div className="terminal-loading">
      <div className="spinner"></div>
      <p>Loading payment session...</p>
    </div>
  );
}

{
  sessionExpired && (
    <div className="terminal-expired">
      <p>❌ Payment session has expired</p>
      <button onClick={returnToMerchant}>Return to Merchant</button>
    </div>
  );
}
```

---

## 🔄 Complete Payment Flow

```
User on E-Shop
    │
    ▼
Add items to cart
    │
    ▼
Proceed to checkout
    │
    ▼
E-Shop creates payment session
(POST /api/payments/terminal/create-session)
    │
    ▼
Redirect user to AR Viewer
(paymentUrl: /virtual-terminal?session=ps_xxx)
    │
    ▼
AR Viewer fetches session
(GET /api/payments/terminal/session/:sessionId)
    │
    ▼
Display merchant name, amount, cart items
    │
    ▼
User clicks "Pay"
    │
    ▼
Show appropriate payment modal:
 • Revolut Virtual Card (Desktop)
 • Revolut QR (Mobile)
 • Crypto Payment
    │
    ▼
User confirms payment
    │
    ▼
Complete session
(POST /api/payments/terminal/complete)
    │
    ▼
Redirect back to merchant
(redirectUrl from session)
    │
    ▼
Merchant webhook notified
E-Shop updates order status
```

---

## 📊 Testing Scenarios

### Test 1: E-Shop Checkout

1. Deploy a Payment Terminal agent
2. Create payment session with cart items
3. Open AR Viewer with session URL
4. Verify cart details display correctly
5. Complete payment with Revolut Virtual Card
6. Verify redirect to merchant success page

### Test 2: Crypto On-Ramp

1. Deploy a Trailing Payment Terminal
2. Create session for crypto purchase
3. Display in AR (following user)
4. Complete payment with USDC
5. Verify blockchain transaction
6. Confirm crypto transfer

### Test 3: Session Expiry

1. Create payment session
2. Wait 15 minutes
3. Try to fetch session
4. Verify "expired" status returned
5. Show appropriate error message

### Test 4: Session Cancellation

1. Create payment session
2. User abandons payment
3. Cancel session
4. Verify cannot complete cancelled session

---

## 🚨 Error Handling

```jsx
const handlePaymentError = (error) => {
  if (error.status === 404) {
    // Session not found
    alert("Payment session not found. It may have expired.");
    returnToMerchant();
  } else if (error.status === 410) {
    // Session expired
    alert("Payment session has expired. Please start checkout again.");
    returnToMerchant();
  } else if (error.status === 400) {
    // Session already processed
    alert("This payment has already been completed or cancelled.");
    returnToMerchant();
  } else {
    // General error
    alert("Payment failed. Please try again.");
  }
};
```

---

## 📝 Summary of Changes for AR Viewer

### New Files to Create

1. ✅ `src/pages/VirtualTerminal.jsx` - Main terminal payment page
2. ✅ `src/services/paymentSessionService.js` - API service
3. ✅ `src/components/PaymentSessionCard.jsx` - Session details display
4. ✅ `src/hooks/usePaymentSession.js` - Session management hook

### Files to Modify

1. ✅ `src/components/ARViewer.jsx` - Terminal agent recognition
2. ✅ `src/components/AgentCard.jsx` - Terminal visual treatment
3. ✅ `src/components/RevolutVirtualCard.jsx` - Dynamic amount support
4. ✅ `src/components/RevolutBankQRModal.jsx` - Session completion
5. ✅ `src/routes/index.jsx` - Add /virtual-terminal route
6. ✅ `src/App.jsx` - URL parameter handling

### CSS Updates

1. ✅ Terminal agent card styling (amber/gold theme)
2. ✅ Payment session UI components
3. ✅ Countdown timer for session expiry
4. ✅ Cart item display styling

---

## 🎯 Priority Implementation Order

### Phase 1 (Required for Basic Functionality)

1. Create VirtualTerminal component
2. Add paymentSessionService
3. Update ARViewer to detect terminal agents
4. Test basic payment session flow

### Phase 2 (Enhanced Experience)

1. Add cart item display
2. Implement session expiry countdown
3. Add error handling
4. Style terminal agent cards differently

### Phase 3 (Polish & Optimization)

1. Add loading skeletons
2. Implement session caching
3. Add payment history
4. Add analytics tracking

---

## 🔗 Related Backend Documentation

- **Full API Docs:** `DYNAMIC_PAYMENT_SYSTEM_DOCUMENTATION.md`
- **Test Suite:** `test-dynamic-payments.sh`
- **Backend Endpoints:** All in `server.js`

---

## ✅ Checklist for AR Viewer Team

- [ ] Create `/virtual-terminal` route
- [ ] Implement payment session fetching
- [ ] Update agent card visuals for terminals
- [ ] Modify Revolut payment components for dynamic amounts
- [ ] Add session completion logic
- [ ] Handle session expiry (15 min timeout)
- [ ] Implement error handling
- [ ] Add redirect back to merchant
- [ ] Test with e-shop integration
- [ ] Test with on-ramp integration
- [ ] Verify all 3 payment methods work (card, QR, crypto)

---

**Questions?** Contact backend team or check `DYNAMIC_PAYMENT_SYSTEM_DOCUMENTATION.md`

**Backend API:** `http://localhost:3001`  
**Test Script:** `./test-dynamic-payments.sh`  
**Branch:** `revolut-pay-sim`
