# Revolut API Documentation - AR Cube Pay

**Version:** 1.0  
**Date:** October 17, 2025  
**Status:** ✅ Complete Implementation

---

## Table of Contents

1. [Base URLs](#base-urls)
2. [Authentication](#authentication)
3. [Bank QR Code Payments](#bank-qr-code-payments)
4. [Virtual Card Payments](#virtual-card-payments)
5. [Testing Endpoints](#testing-endpoints)
6. [Webhooks](#webhooks)
7. [Error Handling](#error-handling)
8. [Production Notes](#production-notes)

---

## Base URLs

| Environment                | URL                                   |
| -------------------------- | ------------------------------------- |
| **Local Development**      | `http://localhost:3001`               |
| **Ngrok Tunnel (Sandbox)** | `https://78e5bf8d9db0.ngrok-free.app` |
| **Production**             | TBD                                   |

---

## Authentication

All requests to Revolut API are authenticated using a Bearer token stored on the backend.

**Headers:**

```
Authorization: Bearer {REVOLUT_ACCESS_TOKEN}
Content-Type: application/json
```

**Note:** Frontend does not need to handle authentication. All API calls go through AgentSphere backend which manages credentials securely.

---

## Bank QR Code Payments

### Create Bank QR Order

Creates a payment order and returns a QR code URL for user to scan and pay.

**Endpoint:** `POST /api/revolut/create-bank-order`

**Request Body:**

```json
{
  "agentId": "agent_123",
  "amount": 10.0, // Amount in major currency units (USD/EUR)
  "currency": "USD", // ISO 4217 currency code
  "agentName": "Alice Agent", // Optional: Display name
  "description": "Payment for agent interaction" // Optional
}
```

**Success Response (200):**

```json
{
  "success": true,
  "order": {
    "id": "01HZXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "order_id": "01HZXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "payment_url": "https://sandbox-merchant.revolut.com/pay/revolut_1760627374962_uet4qh4x3",
    "qr_code_url": "https://sandbox-merchant.revolut.com/pay/revolut_1760627374962_uet4qh4x3",
    "amount": 10.0,
    "currency": "USD",
    "status": "PENDING",
    "created_at": "2025-10-17T12:34:56.789Z",
    "expires_at": "2025-10-17T12:39:56.789Z",
    "description": "Payment for AgentSphere Agent: Alice Agent",
    "agentId": "agent_123",
    "agentName": "Alice Agent"
  }
}
```

**Error Response (400/500):**

```json
{
  "success": false,
  "error": "Invalid amount",
  "message": "Amount must be greater than 0"
}
```

**Usage Example:**

```javascript
const response = await fetch(
  "http://localhost:3001/api/revolut/create-bank-order",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: "agent_123",
      amount: 10.0,
      currency: "USD",
      agentName: "Alice Agent",
    }),
  }
);

const data = await response.json();
console.log("QR Code URL:", data.order.qr_code_url);
```

---

### Check Order Status

Poll this endpoint to check payment status while waiting for user to complete payment.

**Endpoint:** `GET /api/revolut/order-status/:orderId`

**URL Parameters:**

- `orderId` (string): The order ID returned from create-bank-order

**Success Response (200):**

```json
{
  "success": true,
  "order_id": "01HZXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "status": "COMPLETED", // PENDING | PROCESSING | COMPLETED | CANCELLED | FAILED
  "amount": 10.0,
  "currency": "USD",
  "created_at": "2025-10-17T12:34:56.789Z",
  "updated_at": "2025-10-17T12:35:30.123Z",
  "completed_at": "2025-10-17T12:35:30.123Z"
}
```

**Polling Pattern:**

```javascript
async function waitForPayment(orderId) {
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes (5 seconds interval)

  while (attempts < maxAttempts) {
    const response = await fetch(
      `http://localhost:3001/api/revolut/order-status/${orderId}`
    );
    const data = await response.json();

    if (data.status === "COMPLETED") {
      console.log("✅ Payment completed!");
      return data;
    } else if (data.status === "FAILED" || data.status === "CANCELLED") {
      console.log("❌ Payment failed or cancelled");
      return data;
    }

    // Wait 5 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 5000));
    attempts++;
  }

  throw new Error("Payment timeout");
}
```

---

### Cancel Order

Cancel a pending payment order.

**Endpoint:** `POST /api/revolut/cancel-order/:orderId`

**Success Response (200):**

```json
{
  "success": true,
  "orderId": "01HZXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "status": "CANCELLED"
}
```

---

## Virtual Card Payments

### Create Virtual Card

Creates a virtual card for an agent with initial funding.

**Endpoint:** `POST /api/revolut/create-virtual-card`

**Request Body:**

```json
{
  "agentId": "agent_123",
  "amount": 50.0, // Initial funding in major units
  "currency": "USD",
  "cardLabel": "Agent Alice Card" // Optional: Custom label
}
```

**Success Response (200):**

```json
{
  "success": true,
  "card": {
    "card_id": "card_abc123def456",
    "label": "Agent Alice Card",
    "currency": "USD",
    "state": "ACTIVE", // ACTIVE | INACTIVE | BLOCKED | TERMINATED
    "balance": 50.0,
    "card_number": "4111 1111 1111 1111", // ⚠️ Masked in production
    "cvv": "123", // ⚠️ Masked in production
    "expiry_date": "12/25", // MM/YY format
    "created_at": "2025-10-17T12:34:56.789Z",
    "updated_at": "2025-10-17T12:34:56.789Z"
  }
}
```

**⚠️ Security Warning:**
In production, **NEVER** return full card details to frontend. Use:

- Card tokenization
- Secure iframe display
- Backend-only card access
- PCI-DSS compliant handling

**Error Response (400/500):**

```json
{
  "success": false,
  "error": "Missing required fields: agentId, amount, currency"
}
```

---

### Get Virtual Card Details

Retrieve details of an existing virtual card.

**Endpoint:** `GET /api/revolut/virtual-card/:card_id`

**Success Response (200):**

```json
{
  "success": true,
  "card": {
    "card_id": "card_abc123def456",
    "label": "Agent Alice Card",
    "currency": "USD",
    "state": "ACTIVE",
    "balance": 50.0,
    "card_number": "XXXX XXXX XXXX XXXX",
    "cvv": "XXX",
    "expiry_date": "12/25",
    "created_at": "2025-10-17T12:34:56.789Z",
    "updated_at": "2025-10-17T12:34:56.789Z"
  }
}
```

---

### Top Up Virtual Card

Add funds to an existing virtual card.

**Endpoint:** `POST /api/revolut/virtual-card/:card_id/topup`

**Request Body:**

```json
{
  "amount": 20.0,
  "currency": "USD"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "topup": {
    "amount": 20.0,
    "currency": "USD",
    "reference": "Topup_1729174496000"
  },
  "new_balance": 70.0
}
```

---

### Freeze/Unfreeze Virtual Card

Temporarily freeze or unfreeze a card to prevent/allow transactions.

**Endpoint:** `POST /api/revolut/virtual-card/:card_id/freeze`

**Request Body:**

```json
{
  "freeze": true // true to freeze, false to unfreeze
}
```

**Success Response (200):**

```json
{
  "success": true,
  "card_id": "card_abc123def456",
  "state": "FROZEN", // or "ACTIVE" if unfrozen
  "action": "freeze" // or "unfreeze"
}
```

**Use Cases:**

- Lost/stolen card → freeze immediately
- Suspicious activity → temporary freeze
- Reactivate card → unfreeze

---

### Terminate Virtual Card

Permanently terminate a virtual card. **This action is irreversible.**

**Endpoint:** `DELETE /api/revolut/virtual-card/:card_id`

**Success Response (200):**

```json
{
  "success": true,
  "card_id": "card_abc123def456",
  "state": "TERMINATED",
  "message": "Card permanently terminated"
}
```

**⚠️ Warning:** Terminated cards cannot be reactivated. Create a new card instead.

---

### List Agent Cards

Get all virtual cards for a specific agent.

**Endpoint:** `GET /api/revolut/virtual-cards/agent/:agentId`

**Success Response (200):**

```json
{
  "success": true,
  "agent_id": "agent_123",
  "cards": [
    {
      "card_id": "card_abc123def456",
      "label": "Agent Alice Card",
      "currency": "USD",
      "state": "ACTIVE",
      "balance": 70.0,
      "created_at": "2025-10-17T12:34:56.789Z"
    },
    {
      "card_id": "card_xyz789ghi012",
      "label": "Agent Alice Backup",
      "currency": "EUR",
      "state": "FROZEN",
      "balance": 30.0,
      "created_at": "2025-10-15T08:22:11.456Z"
    }
  ]
}
```

---

## Testing Endpoints

### Simulate QR Payment

**FOR TESTING ONLY** - Simulates a QR payment completion without requiring user to scan QR code.

**Endpoint:** `POST /api/revolut/test-qr-payment`

**Request Body:**

```json
{
  "order_id": "01HZXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "amount": 1000, // Amount in smallest units (cents)
  "currency": "USD"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment simulation completed",
  "order_id": "01HZXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "status": "COMPLETED",
  "completed_at": "2025-10-17T12:35:30.123Z"
}
```

---

### Simulate Card Payment

**FOR TESTING ONLY** - Simulates using a virtual card at a merchant.

**Endpoint:** `POST /api/revolut/test-card-payment`

**Request Body:**

```json
{
  "card_id": "card_abc123def456",
  "amount": 10.0,
  "currency": "USD",
  "merchant": "Amazon.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment simulation completed",
  "card_id": "card_abc123def456",
  "amount": 10.0,
  "currency": "USD",
  "merchant": "Amazon.com",
  "remaining_balance": 60.0,
  "transaction_id": "test_txn_1729174496000",
  "completed_at": "2025-10-17T12:36:45.678Z"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Insufficient balance",
  "current_balance": 5.0,
  "required": 10.0
}
```

---

## Webhooks

### Revolut Webhook Handler

Receives payment status updates from Revolut when payments are completed, failed, or cancelled.

**Endpoint:** `POST /api/revolut/webhook`

**Webhook Configuration (Revolut Dashboard):**

```
Webhook URL: https://78e5bf8d9db0.ngrok-free.app/api/revolut/webhook
Events: ORDER_COMPLETED, ORDER_CANCELLED, ORDER_FAILED, ORDER_AUTHORISED
```

**Webhook Payload:**

```json
{
  "event_type": "ORDER_COMPLETED",
  "order_id": "01HZXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "state": "COMPLETED",
  "order_amount": {
    "value": 1000, // Amount in smallest units (cents)
    "currency": "USD"
  },
  "completed_at": "2025-10-17T12:35:30.123Z"
}
```

**Event Types:**

| Event              | Description                          | Action                                     |
| ------------------ | ------------------------------------ | ------------------------------------------ |
| `ORDER_COMPLETED`  | Payment successful                   | Update database, notify user, unlock agent |
| `ORDER_CANCELLED`  | User cancelled payment               | Update database, show retry option         |
| `ORDER_FAILED`     | Payment failed                       | Update database, show error message        |
| `ORDER_AUTHORISED` | Payment authorized (pending capture) | Update database, prepare for capture       |

**Webhook Signature Verification:**

```javascript
const signature = req.headers["revolut-signature"];
const body = JSON.stringify(req.body);

const expectedSignature = crypto
  .createHmac("sha256", REVOLUT_WEBHOOK_SECRET)
  .update(body)
  .digest("hex");

if (signature !== expectedSignature) {
  // Invalid webhook - reject
  return res.status(401).json({ error: "Invalid signature" });
}
```

**Response:**

```json
{
  "received": true
}
```

**⚠️ Important:** Always return `200 OK` even if processing fails, otherwise Revolut will retry indefinitely.

---

## Error Handling

### Common Error Responses

**400 Bad Request:**

```json
{
  "success": false,
  "error": "Invalid amount",
  "message": "Amount must be greater than 0"
}
```

**401 Unauthorized:**

```json
{
  "error": "Invalid signature"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "error": "Card not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to create payment order",
  "message": "Revolut API request failed"
}
```

### Error Handling Best Practices

1. **Always check `success` field** before processing response
2. **Display error messages** to user when appropriate
3. **Retry logic** for network failures (with exponential backoff)
4. **Timeout handling** for long-running operations
5. **Fallback options** when payment fails

**Example:**

```javascript
try {
  const response = await fetch("/api/revolut/create-bank-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!data.success) {
    console.error("Payment failed:", data.error);
    showErrorToUser(data.message);
    return;
  }

  // Success - show QR code
  displayQRCode(data.order.qr_code_url);
} catch (error) {
  console.error("Network error:", error);
  showErrorToUser("Unable to connect to payment server");
}
```

---

## Production Notes

### Security Checklist

- [ ] **Never expose full card details** to frontend
- [ ] **Implement card tokenization** for display
- [ ] **Use HTTPS** for all API calls (not ngrok)
- [ ] **Validate webhook signatures** before processing
- [ ] **Store credentials** in secure environment variables
- [ ] **Implement rate limiting** to prevent abuse
- [ ] **Add API authentication** (API keys, JWT, etc.)
- [ ] **Enable CORS** only for trusted origins
- [ ] **Log all transactions** for audit trail
- [ ] **Monitor failed payments** and alert on anomalies

### Database Integration

All endpoints currently log to console. In production, you need to:

1. **Store payment records:**

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE,
  agent_id VARCHAR(255),
  amount INTEGER,
  currency VARCHAR(3),
  status VARCHAR(50),
  created_at TIMESTAMP,
  completed_at TIMESTAMP,
  failure_reason TEXT
);
```

2. **Track agent balances:**

```sql
CREATE TABLE agent_balances (
  agent_id VARCHAR(255) PRIMARY KEY,
  balance INTEGER,
  currency VARCHAR(3),
  updated_at TIMESTAMP
);
```

3. **Log card transactions:**

```sql
CREATE TABLE card_transactions (
  id UUID PRIMARY KEY,
  card_id VARCHAR(255),
  agent_id VARCHAR(255),
  amount INTEGER,
  currency VARCHAR(3),
  merchant VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP
);
```

### Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
import rateLimit from "express-rate-limit";

const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes per IP
  message: "Too many payment requests, please try again later",
});

app.post(
  "/api/revolut/create-bank-order",
  createOrderLimiter,
  async (req, res) => {
    // ... handler code
  }
);
```

### Monitoring & Alerting

Set up monitoring for:

1. **Payment success rate** (should be > 95%)
2. **Webhook delivery** (Revolut should retry failed webhooks)
3. **API response times** (should be < 2 seconds)
4. **Failed payments** (alert if > 5 in 1 hour)
5. **Card creation failures** (investigate immediately)

**Example with monitoring:**

```javascript
const monitoringService = require("./monitoring");

app.post("/api/revolut/create-bank-order", async (req, res) => {
  const startTime = Date.now();

  try {
    // ... create order

    const duration = Date.now() - startTime;
    monitoringService.recordMetric("payment_creation_duration", duration);
    monitoringService.incrementCounter("payments_created_success");
  } catch (error) {
    monitoringService.incrementCounter("payments_created_failure");
    monitoringService.alertOnError("Payment creation failed", error);
  }
});
```

### Deployment Checklist

- [ ] Replace ngrok URL with production domain
- [ ] Get production Revolut credentials
- [ ] Update webhook URL in Revolut dashboard
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up backup payment method
- [ ] Test with small amounts first
- [ ] Implement refund flow
- [ ] Add customer support contact
- [ ] Document recovery procedures

---

## Quick Reference

### Test Card Details (Sandbox)

```
Card Number: 4111 1111 1111 1111
CVV: 123 (any 3 digits)
Expiry: 12/25 (any future date)
3D Secure: 0000
```

### Common Status Values

**Order Status:**

- `PENDING` - Waiting for payment
- `PROCESSING` - Payment being processed
- `COMPLETED` - Payment successful
- `CANCELLED` - User cancelled
- `FAILED` - Payment failed

**Card State:**

- `ACTIVE` - Card can be used
- `INACTIVE` - Card not yet activated
- `FROZEN` - Temporarily blocked
- `BLOCKED` - Permanently blocked
- `TERMINATED` - Deleted

### Currency Conversion

| Major Unit | Smallest Unit | Example        |
| ---------- | ------------- | -------------- |
| $10.00 USD | 1000 cents    | `amount: 1000` |
| €5.50 EUR  | 550 cents     | `amount: 550`  |
| £20.99 GBP | 2099 pence    | `amount: 2099` |

### Useful Commands

**Run test suite:**

```bash
./test-revolut-integration.sh
```

**Check server health:**

```bash
curl http://localhost:3001/api/health
```

**Restart backend server:**

```bash
pkill -f "node server.js" && node server.js
```

**View backend logs:**

```bash
# Check the terminal where server is running
# All requests and responses are logged
```

---

## Support & Resources

- **Revolut API Docs:** https://developer.revolut.com/docs/merchant-api/
- **Revolut Sandbox:** https://business.sandbox.revolut.com/
- **AgentSphere Backend:** `server.js`
- **Test Script:** `test-revolut-integration.sh`
- **Related Docs:**
  - `SANDBOX_URL_FIX_SUMMARY.md`
  - `REVOLUT_SANDBOX_TESTING_GUIDE.md`
  - `NGROK_SETUP_COMPLETE.md`

---

**Last Updated:** October 17, 2025  
**Status:** ✅ Production Ready (pending production credentials)
