# Dynamic Payment System - Complete Documentation

**Branch:** `revolut-pay-sim`  
**Implementation Date:** October 23, 2025  
**Status:** ✅ Complete and Tested

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Agent Types](#agent-types)
4. [API Endpoints](#api-endpoints)
5. [Payment Flow](#payment-flow)
6. [Integration Guide](#integration-guide)
7. [Testing](#testing)
8. [Examples](#examples)

---

## 🎯 Overview

The Dynamic Payment System enables **Payment Terminal** and **Trailing Payment Terminal** agents to accept variable payment amounts from third-party merchants (e-shops, on-ramps, etc.) while regular agents continue using fixed interaction fees.

### Key Features

- ✅ **Dual Payment Models**: Fixed fees for regular agents, dynamic amounts for terminals
- ✅ **Revenue Sharing**: 70/30 split for regular agents, 100/0 for terminals
- ✅ **Payment Sessions**: Secure, time-limited payment requests (15-minute expiry)
- ✅ **Multi-Method Support**: Crypto (USDC/USDT/DAI) + Revolut (QR/Virtual Card)
- ✅ **Merchant Integration**: Simple API for e-shops and on-ramps
- ✅ **Session Management**: Create, retrieve, complete, or cancel payments
- ✅ **Webhook Notifications**: Real-time merchant updates

---

## 🏗️ System Architecture

```
┌──────────────┐
│   Merchant   │ (E-shop, On-ramp)
│   Website    │
└──────┬───────┘
       │
       │ 1. Create Session
       ▼
┌─────────────────┐
│  AgentSphere    │
│  Backend API    │
└─────────┬───────┘
          │
          │ 2. Payment Session
          │    (15 min expiry)
          ▼
┌─────────────────┐
│   AR Viewer     │
│ Virtual Terminal│
└─────────┬───────┘
          │
          │ 3. User Confirms
          │    Payment
          ▼
┌─────────────────┐
│  Payment        │
│  Processing     │ (Crypto / Revolut)
└─────────┬───────┘
          │
          │ 4. Payment Complete
          ▼
┌─────────────────┐
│   Merchant      │
│   Webhook       │ (Success notification)
└─────────────────┘
```

---

## 🤖 Agent Types

### Regular Agents

**Types:** `text_chat`, `voice_chat`, `video_chat`, `defi_features`

```json
{
  "economics": {
    "interactionFee": {
      "amount": 10, // Fixed amount (e.g., 10 USDC)
      "isDynamic": false // Static fee
    },
    "revenueSharing": {
      "userPercentage": 70, // 70% to agent owner
      "platformPercentage": 30 // 30% to platform
    }
  }
}
```

**Use Case:** AI interactions with consistent pricing

### Terminal Agents

**Types:** `payment_terminal`, `trailing_payment_terminal`

```json
{
  "economics": {
    "interactionFee": {
      "amount": 0, // No fixed fee
      "isDynamic": true // Amount from merchant
    },
    "paymentMethods": {
      "crypto": {
        "enabled": true,
        "tokens": ["USDC", "USDT", "DAI"]
      },
      "revolut": {
        "qr": true,
        "virtualCard": true
      }
    },
    "revenueSharing": {
      "userPercentage": 100, // 100% to terminal owner
      "platformPercentage": 0 // 0% to platform
    }
  }
}
```

**Use Case:** Online payments, checkout processes

---

## 📡 API Endpoints

### Agent Deployment

#### POST `/api/agents/deploy`

Deploy a new agent (regular or terminal).

**Request Body:**

```json
{
  "agentType": "payment_terminal",
  "name": "My Virtual Terminal",
  "description": "Payment terminal for e-shop",
  "paymentToken": "USDC",
  "interactionFee": 0, // Required for regular agents only
  "paymentMethods": {
    "crypto": {
      "enabled": true,
      "tokens": ["USDC", "USDT", "DAI"]
    },
    "revolut": {
      "qr": true,
      "virtualCard": true
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "agent": {
    "id": "agent_1761241470082_d9334ad6",
    "agentType": "payment_terminal",
    "name": "My Virtual Terminal",
    "walletAddress": "0xd17081ce480c4cddd2955f44f90e5745af628101",
    "economics": {
      "paymentToken": "USDC",
      "interactionFee": {
        "amount": 0,
        "isDynamic": true
      },
      "paymentMethods": {
        "crypto": {
          "enabled": true,
          "tokens": ["USDC", "USDT", "DAI"]
        },
        "revolut": {
          "qr": true,
          "virtualCard": true
        }
      },
      "revenueSharing": {
        "userPercentage": 100,
        "platformPercentage": 0
      }
    },
    "isDynamicPayment": true,
    "status": "active",
    "deployedAt": "2025-10-23T17:44:30.083Z"
  }
}
```

#### GET `/api/agents/:agentId`

Get agent details by ID.

**Response:**

```json
{
  "success": true,
  "agent": {
    "id": "agent_1761241470082_d9334ad6",
    "agentType": "payment_terminal",
    "name": "My Virtual Terminal",
    "economics": { ... },
    "status": "active"
  }
}
```

#### GET `/api/agents`

List all agents. Supports filtering:

- `?type=payment_terminal` - Filter by agent type
- `?status=active` - Filter by status

---

### Payment Sessions

#### POST `/api/payments/terminal/create-session`

Create a new payment session for a terminal agent.

**Request Body:**

```json
{
  "terminalAgentId": "agent_1761241470082_d9334ad6",
  "merchantId": "eshop_12345",
  "merchantName": "My E-Shop",
  "amount": 99.5,
  "currency": "USD",
  "paymentMethod": "revolut_card", // or "crypto", "revolut_qr"
  "token": "USDC", // For crypto payments
  "cartData": {
    "items": [
      { "name": "Product A", "quantity": 2, "price": 29.99 },
      { "name": "Product B", "quantity": 1, "price": 39.52 }
    ],
    "total": 99.5
  },
  "redirectUrl": "https://myeshop.com/order/success",
  "metadata": {
    "orderId": "ORDER-2025-001",
    "webhookUrl": "https://myeshop.com/webhook/payment"
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
    "terminalOwner": "0xd17081ce480c4cddd2955f44f90e5745af628101",
    "merchantName": "My E-Shop",
    "amount": 99.5,
    "currency": "USD",
    "paymentMethod": "revolut_card",
    "token": "USDC",
    "expiresAt": "2025-10-23T17:59:30.216Z",
    "paymentUrl": "http://localhost:5173/virtual-terminal?session=ps_1761241470216_f7c49e2658b3"
  }
}
```

#### GET `/api/payments/terminal/session/:sessionId`

Retrieve payment session details.

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
    "cartData": { ... },
    "status": "pending",
    "createdAt": "2025-10-23T17:44:30.216Z",
    "expiresAt": "2025-10-23T17:59:30.216Z"
  }
}
```

#### POST `/api/payments/terminal/complete`

Complete a payment session.

**Request Body:**

```json
{
  "sessionId": "ps_1761241470216_f7c49e2658b3",
  "transactionHash": "0xabc123...", // For crypto payments
  "revolutPaymentId": "revolut_pay_12345", // For Revolut payments
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
    "revolutPaymentId": "revolut_pay_12345",
    "redirectUrl": "https://myeshop.com/order/success",
    "completedAt": "2025-10-23T17:44:30.806Z"
  }
}
```

#### POST `/api/payments/terminal/cancel/:sessionId`

Cancel a pending payment session.

**Request Body:**

```json
{
  "reason": "User abandoned cart"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment session cancelled",
  "sessionId": "ps_1761241470216_f7c49e2658b3"
}
```

---

## 🔄 Payment Flow

### Complete Flow Diagram

```
E-Shop Customer Checkout
          │
          ▼
    Calculate Cart Total
          │
          ▼
┌─────────────────────────┐
│ POST /api/payments/     │
│   terminal/create-      │
│   session               │
│                         │
│ Input:                  │
│ - terminalAgentId       │
│ - merchantId            │
│ - amount                │
│ - paymentMethod         │
│ - cartData              │
│ - redirectUrl           │
└────────┬────────────────┘
         │
         ▼
   Session Created
   (15 min expiry)
         │
         ▼
┌─────────────────────────┐
│ Redirect to:            │
│ paymentUrl              │
│ (AR Viewer Virtual      │
│  Terminal)              │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ AR Viewer:              │
│ GET /api/payments/      │
│   terminal/session/     │
│   {sessionId}           │
│                         │
│ Display:                │
│ - Merchant name         │
│ - Cart items            │
│ - Total amount          │
│ - Payment method        │
└────────┬────────────────┘
         │
         ▼
   User Confirms Payment
         │
         ▼
┌─────────────────────────┐
│ Process Payment:        │
│ - Crypto transaction    │
│   OR                    │
│ - Revolut QR/Card       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ POST /api/payments/     │
│   terminal/complete     │
│                         │
│ Input:                  │
│ - sessionId             │
│ - transactionHash /     │
│   revolutPaymentId      │
│ - paymentProof          │
└────────┬────────────────┘
         │
         ▼
   Payment Verified
         │
         ├──────────────┐
         ▼              ▼
  Session Updated   Webhook Sent
  (completed)       to Merchant
         │              │
         ▼              ▼
  Redirect User    Merchant Updates
  to Success Page  Order Status
```

---

## 🔧 Integration Guide

### For E-Shop Developers

#### Step 1: Deploy Terminal Agent

```javascript
// Deploy your payment terminal (one-time setup)
const deployResponse = await fetch("http://localhost:3001/api/agents/deploy", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    agentType: "payment_terminal",
    name: "My E-Shop Terminal",
    description: "Payment terminal for my online store",
    paymentToken: "USDC",
    paymentMethods: {
      crypto: {
        enabled: true,
        tokens: ["USDC", "USDT", "DAI"],
      },
      revolut: {
        qr: true,
        virtualCard: true,
      },
    },
  }),
});

const { agent } = await deployResponse.json();
const TERMINAL_AGENT_ID = agent.id; // Save this!
```

#### Step 2: Create Payment Session on Checkout

```javascript
// When user proceeds to checkout
async function createPaymentSession(cartTotal, cartItems) {
  const response = await fetch(
    "http://localhost:3001/api/payments/terminal/create-session",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        terminalAgentId: TERMINAL_AGENT_ID,
        merchantId: "your_eshop_id",
        merchantName: "Your E-Shop Name",
        amount: cartTotal,
        currency: "USD",
        paymentMethod: "revolut_card", // or 'crypto', 'revolut_qr'
        cartData: {
          items: cartItems,
          total: cartTotal,
        },
        redirectUrl: "https://yourshop.com/order/success",
        metadata: {
          orderId: generateOrderId(),
          webhookUrl: "https://yourshop.com/webhook/payment",
        },
      }),
    }
  );

  const { session } = await response.json();

  // Redirect user to AR Viewer for payment
  window.location.href = session.paymentUrl;
}
```

#### Step 3: Handle Webhook Notification

```javascript
// Webhook endpoint to receive payment confirmation
app.post("/webhook/payment", (req, res) => {
  const {
    sessionId,
    status,
    amount,
    currency,
    transactionHash,
    revolutPaymentId,
    completedAt,
  } = req.body;

  if (status === "completed") {
    // Update order status in your database
    const orderId = req.body.metadata?.orderId;
    updateOrderStatus(orderId, "paid");

    // Send confirmation email
    sendOrderConfirmation(orderId);

    console.log(`✅ Payment received: ${amount} ${currency}`);
  }

  res.status(200).json({ received: true });
});
```

#### Step 4: Handle Success Redirect

```javascript
// Success page (where user returns after payment)
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get("session");

if (sessionId) {
  // Optionally verify payment status
  const response = await fetch(
    `http://localhost:3001/api/payments/terminal/session/${sessionId}`
  );
  const { session } = await response.json();

  if (session.status === "completed") {
    // Show success message
    displayOrderConfirmation(session);
  }
}
```

---

### For On-Ramp Developers

Similar integration with a few differences:

```javascript
// On-ramp specific example
async function createOnRampSession(fiatAmount, cryptoAmount, userWallet) {
  const response = await fetch(
    "http://localhost:3001/api/payments/terminal/create-session",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        terminalAgentId: ON_RAMP_TERMINAL_ID,
        merchantId: "onramp_service",
        merchantName: "Crypto On-Ramp",
        amount: fiatAmount,
        currency: "USD",
        paymentMethod: "revolut_qr", // Quick QR code payment
        token: "USDC",
        cartData: {
          cryptoAmount,
          cryptoCurrency: "USDC",
          destinationWallet: userWallet,
          exchangeRate: fiatAmount / cryptoAmount,
        },
        redirectUrl: "https://onramp.com/purchase/success",
        metadata: {
          purchaseId: generatePurchaseId(),
          userWallet,
          webhookUrl: "https://onramp.com/webhook/purchase",
        },
      }),
    }
  );

  const { session } = await response.json();

  // Show QR code or redirect
  return session;
}
```

---

## 🧪 Testing

### Run Test Suite

```bash
chmod +x test-dynamic-payments.sh
./test-dynamic-payments.sh
```

### Manual Testing with cURL

#### Deploy Terminal Agent

```bash
curl -X POST http://localhost:3001/api/agents/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "payment_terminal",
    "name": "Test Terminal",
    "paymentToken": "USDC",
    "paymentMethods": {
      "crypto": {"enabled": true, "tokens": ["USDC"]},
      "revolut": {"qr": true, "virtualCard": true}
    }
  }'
```

#### Create Payment Session

```bash
curl -X POST http://localhost:3001/api/payments/terminal/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "terminalAgentId": "AGENT_ID_HERE",
    "merchantId": "test_merchant",
    "merchantName": "Test Shop",
    "amount": 50.00,
    "currency": "USD",
    "paymentMethod": "revolut_card"
  }'
```

#### Complete Payment

```bash
curl -X POST http://localhost:3001/api/payments/terminal/complete \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID_HERE",
    "revolutPaymentId": "simulated_payment_123",
    "userWallet": "0x1234...",
    "paymentProof": "proof_data"
  }'
```

---

## 📊 Examples

### Example 1: E-Shop Product Purchase

**Scenario:** Customer buys 3 items totaling $127.48

```json
{
  "terminalAgentId": "agent_abc123",
  "merchantId": "cool_shop_2025",
  "merchantName": "Cool Shop",
  "amount": 127.48,
  "currency": "USD",
  "paymentMethod": "revolut_card",
  "cartData": {
    "items": [
      { "name": "Wireless Headphones", "quantity": 1, "price": 79.99 },
      { "name": "Phone Case", "quantity": 2, "price": 19.99 },
      { "name": "USB Cable", "quantity": 1, "price": 7.51 }
    ],
    "subtotal": 127.48,
    "tax": 0,
    "shipping": 0,
    "total": 127.48
  },
  "redirectUrl": "https://coolshop.com/order/12345/success",
  "metadata": {
    "orderId": "ORDER-12345",
    "customerEmail": "customer@example.com",
    "webhookUrl": "https://coolshop.com/api/payment-webhook"
  }
}
```

### Example 2: Crypto On-Ramp

**Scenario:** User buys 100 USDC for $102

```json
{
  "terminalAgentId": "agent_onramp_xyz",
  "merchantId": "crypto_onramp",
  "merchantName": "FastRamp Exchange",
  "amount": 102.0,
  "currency": "USD",
  "paymentMethod": "revolut_qr",
  "token": "USDC",
  "cartData": {
    "cryptoAmount": 100,
    "cryptoCurrency": "USDC",
    "exchangeRate": 1.02,
    "destinationWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "networkFee": 2.0
  },
  "redirectUrl": "https://fastramp.com/purchase/complete",
  "metadata": {
    "purchaseId": "PURCHASE-67890",
    "userId": "user_abc",
    "webhookUrl": "https://fastramp.com/api/webhook"
  }
}
```

### Example 3: Subscription Payment

**Scenario:** Monthly subscription renewal

```json
{
  "terminalAgentId": "agent_subscription",
  "merchantId": "saas_company",
  "merchantName": "SaaS Premium",
  "amount": 29.99,
  "currency": "USD",
  "paymentMethod": "crypto",
  "token": "USDC",
  "cartData": {
    "plan": "Premium Monthly",
    "billingPeriod": "2025-10-23 to 2025-11-23",
    "nextBillingDate": "2025-11-23"
  },
  "redirectUrl": "https://saasapp.com/account/billing/success",
  "metadata": {
    "subscriptionId": "SUB-999",
    "userId": "user_456",
    "webhookUrl": "https://saasapp.com/api/billing-webhook"
  }
}
```

---

## 📋 Summary

### What Was Implemented

- ✅ Terminal agent deployment with dynamic payment support
- ✅ Payment session creation with 15-minute expiry
- ✅ Session retrieval for AR Viewer integration
- ✅ Payment completion with verification
- ✅ Payment session cancellation
- ✅ Agent listing and filtering
- ✅ Revenue sharing configuration (100% for terminals)
- ✅ Multi-method payment support (crypto + Revolut)
- ✅ Webhook notifications to merchants
- ✅ Comprehensive test suite

### Tested Scenarios

- ✅ Deploy payment terminal agent
- ✅ Deploy regular text chat agent (comparison)
- ✅ Create payment session for e-shop
- ✅ Retrieve payment session details
- ✅ Complete payment (simulated)
- ✅ Cancel payment session
- ✅ List all agents
- ✅ Filter agents by type

### Next Steps

1. **Frontend Integration**: Update AgentSphere frontend to support terminal deployment
2. **AR Viewer Updates**: Implement virtual terminal UI to process dynamic payments
3. **E-Shop Plugin**: Create WooCommerce/Shopify plugins for easy integration
4. **Production Deployment**: Move from simulation to real Revolut Sandbox API
5. **Analytics Dashboard**: Track payment sessions and terminal performance

---

**Documentation Version:** 1.0  
**Last Updated:** October 23, 2025  
**Branch:** `revolut-pay-sim`  
**Status:** ✅ Production Ready (Simulation Mode)
