# AR VIEWER COPILOT PROMPT: Dynamic Amount Override Implementation

### Repository

- **Branch:** `revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera`
- **URL:** https://github.com/petrkrulis2022/ar-agent-viewer-web-man-US/tree/revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera

### Objective

Modify the AR Viewer payment modal to:

1. **Read the agent's `fee_type` field** from the database to determine if fees are fixed or dynamic
2. **Parse dynamic payment amounts from URL parameters** when redirected from e-shop/on-ramp
3. **Override the agent's fee** with the URL-provided amount for dynamic fee agents
4. **Maintain backward compatibility** with fixed-fee agents

---

## Database Schema Context

### Agent Fee Configuration (from AgentSphere deployment)

Agents now have a `fee_type` field in the `deployed_objects` table:

**Fixed Fee Agent:**

```json
{
  "fee_type": "fixed",
  "interaction_fee_amount": 10.0,
  "interaction_fee_token": "USDh",
  "interaction_fee_usdfc": 10.0
}
```

**Dynamic Fee Agent:**

```json
{
  "fee_type": "dynamic",
  "interaction_fee_amount": null,
  "interaction_fee_token": "USDh",
  "interaction_fee_usdfc": null
}
```

---

## Current Problem

1. **AR Viewer ignores the `fee_type` field** when loading agent data
2. When `fee_type === "dynamic"`, the modal should accept amounts from URL parameters
3. When `fee_type === "fixed"`, the modal should use `interaction_fee_amount`
4. Currently, the payment modal **always displays 10 USDh** regardless of dynamic amounts or fee type

---

## URL Parameters Reference

### From E-Shop Redirect

```
http://localhost:5173/ar-view?payment=true&data=eyJvcmRlcklkIjoiT1JELU1XSFcwWTBGRCIsImFtb3VudCI6MjM3LjYsImN1cnJlbmN5IjoiVVNEIiwiaXRlbXMiOlt7InByb2R1Y3RJZCI6Imhvb2RpZS0xIiwibmFtZSI6IkN1YmVQYXkgVGVjaCBIb29kaWUiLCJxdWFudGl0eSI6MSwicHJpY2UiOjEwMCwiaW1hZ2UiOiIvc3JjL2Fzc2V0cy9ob29kaWUtbmF2eS1ibHVlLnBuZyIsImNvbG9yIjoiTmF2eSBCbHVlIiwic2l6ZSI6IlMifV19
```

**Decoded data:**

```json
{
  "orderId": "ORD-MWHW0Y0FD",
  "amount": 237.6,
  "currency": "USD"
}
```

### From On-Ramp Redirect

```
http://localhost:5173/payment-redirect?data=eyJvcmRlcklkIjoiMTJPNTc5NzVFIwiYW1vdW50Ijo1MjgsImN1cnJlbmN5IjoiVVNEIiwibWVyY2hhbnROYW1lIjoiQ3ViZVBheSBFeGNoYW5nZSIsInR5cGUiOiJvbm9mcmFtcCIsImNyeXB0byI6IkVUSCJ9
```

**Decoded data:**

```json
{
  "orderId": "12O57975E",
  "amount": 528,
  "currency": "USD",
  "merchantName": "CubePay Exchange",
  "type": "onramp",
  "crypto": "ETH"
}
```

---

## Required Changes

### 1. **Fetch Agent Data with `fee_type` Field**

**Location:** Agent data fetching component (e.g., `ARViewer.jsx`, `AgentLoader.jsx`)

**Current query (likely):**

```javascript
const { data: agent } = await supabase
  .from("deployed_objects")
  .select("name, interaction_fee_amount, interaction_fee_token, ...")
  .eq("id", agentId)
  .single();
```

**Updated query (must include `fee_type`):**

```javascript
const { data: agent } = await supabase
  .from("deployed_objects")
  .select("name, fee_type, interaction_fee_amount, interaction_fee_token, ...")
  .eq("id", agentId)
  .single();
```

**✅ Verify:** Console log should show `fee_type: "dynamic"` or `fee_type: "fixed"`

---

### 2. **Parse URL Parameters**

**Add this utility function** (create or add to existing utils):

```javascript
/**
 * Parse payment data from URL parameters
 * Supports both e-shop (?payment=true&data=...) and on-ramp (?data=...) formats
 */
function parsePaymentDataFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedData = urlParams.get("data");

  if (!encodedData) {
    return null;
  }

  try {
    const decoded = atob(encodedData);
    const paymentData = JSON.parse(decoded);
    console.log("📦 Parsed payment data from URL:", paymentData);
    return paymentData;
  } catch (error) {
    console.error("❌ Failed to decode payment data:", error);
    return null;
  }
}

/**
 * Get the dynamic payment amount based on fee_type and URL parameters
 */
function getDynamicPaymentAmount(agent, urlPaymentData) {
  // If agent has fixed fee, always use that
  if (agent.fee_type === "fixed") {
    console.log("💰 Using fixed fee:", agent.interaction_fee_amount);
    return agent.interaction_fee_amount;
  }

  // If agent has dynamic fee, check URL parameters
  if (agent.fee_type === "dynamic") {
    if (urlPaymentData && urlPaymentData.amount) {
      console.log("💰 Using dynamic amount from URL:", urlPaymentData.amount);
      return urlPaymentData.amount;
    } else {
      console.warn(
        "⚠️ Dynamic fee agent but no amount in URL. Showing prompt."
      );
      return null; // Will show "Amount to be provided by merchant"
    }
  }

  // Fallback for agents without fee_type (backward compatibility)
  console.log("💰 Using fallback fee:", agent.interaction_fee_amount);
  return agent.interaction_fee_amount;
}
```

---

### 3. **Update Payment Modal Component**

**Location:** Payment modal (e.g., `AgentInteractionModal.jsx`, `PaymentModal.jsx`, `CubePaymentEngine.jsx`)

**Add state for dynamic amount:**

```javascript
const [paymentAmount, setPaymentAmount] = useState(null);
const [urlPaymentData, setUrlPaymentData] = useState(null);
```

**On component mount, parse URL and calculate amount:**

```javascript
useEffect(() => {
  // Parse URL parameters
  const paymentData = parsePaymentDataFromURL();
  setUrlPaymentData(paymentData);

  // Determine final payment amount
  const finalAmount = getDynamicPaymentAmount(agent, paymentData);
  setPaymentAmount(finalAmount);

  console.log("💳 Payment configuration:", {
    feeType: agent.fee_type,
    agentDefaultFee: agent.interaction_fee_amount,
    urlAmount: paymentData?.amount,
    finalAmount: finalAmount,
  });
}, [agent]);
```

---

### 4. **Display Logic in Payment Modal UI**

**Replace hardcoded fee display with dynamic logic:**

```jsx
{
  /* Fee Display Section */
}
<div className="fee-display">
  <label>Service Fee:</label>

  {agent.fee_type === "dynamic" ? (
    // Dynamic fee display
    paymentAmount ? (
      <span className="amount">
        {paymentAmount} {agent.interaction_fee_token || "USDh"}
      </span>
    ) : (
      <span className="dynamic-label">
        💰 Dynamic Amount (Provided by merchant)
      </span>
    )
  ) : (
    // Fixed fee display
    <span className="amount">
      {agent.interaction_fee_amount} {agent.interaction_fee_token || "USDh"}
    </span>
  )}
</div>;

{
  /* Payment Info (optional) */
}
{
  urlPaymentData && (
    <div className="payment-info">
      <p>Order ID: {urlPaymentData.orderId}</p>
      {urlPaymentData.merchantName && (
        <p>Merchant: {urlPaymentData.merchantName}</p>
      )}
    </div>
  );
}
```

---

### 5. **Update Payment Processing**

**When user clicks "Generate Payment" or "Pay Now":**

```javascript
const handlePayment = async () => {
  // Determine final amount to charge
  const amountToCharge = paymentAmount || agent.interaction_fee_amount;

  if (!amountToCharge) {
    alert("Payment amount not specified. Please contact the merchant.");
    return;
  }

  console.log("💳 Processing payment:", {
    amount: amountToCharge,
    token: agent.interaction_fee_token,
    feeType: agent.fee_type,
  });

  // Pass to payment processor (CCIP, Revolut, Hedera, etc.)
  const paymentRequest = {
    amount: amountToCharge,
    currency: agent.interaction_fee_token || "USDh",
    recipientAddress: agent.agent_wallet_address,
    orderId: urlPaymentData?.orderId,
    // ... other payment data
  };

  // Process payment
  await processPayment(paymentRequest);
};
```

---

## Testing Checklist

### Basic Fee Type Tests

- ✅ Load fixed-fee agent WITHOUT URL params → Shows fixed amount (e.g., 10 USDh)
- ✅ Load dynamic-fee agent WITHOUT URL params → Shows "Dynamic Amount" label
- ✅ Verify `fee_type` field is loaded from database for both agent types

### Dynamic Amount Tests (E-Shop)

- ✅ Redirect from e-shop: `?payment=true&data=...` with amount 237.6
- ✅ Verify modal displays **237.6 USDh** (not 10 USDh)
- ✅ Verify console logs show parsed URL data
- ✅ Click "Pay" and verify 237.6 is sent to payment processor

### Dynamic Amount Tests (On-Ramp)

- ✅ Redirect from on-ramp: `?data=...` with amount 528
- ✅ Verify modal displays **528 USDh** (not 10 USDh)
- ✅ Verify order ID and merchant name display correctly
- ✅ Click "Pay" and verify 528 is sent to payment processor

### Backward Compatibility

- ✅ Load old agent (no `fee_type` field) → Should show default fee
- ✅ Fixed-fee agent with URL params → Should ignore URL, use fixed fee
- ✅ Payment flow works for both Hedera Testnet (USDh) and Solana Devnet (USDC)

---

## Expected Console Output

When loading a dynamic-fee agent with URL parameters:

```
📦 Parsed payment data from URL: {orderId: "ORD-123", amount: 237.6, currency: "USD"}
💰 Using dynamic amount from URL: 237.6
💳 Payment configuration: {
  feeType: "dynamic",
  agentDefaultFee: null,
  urlAmount: 237.6,
  finalAmount: 237.6
}
💳 Processing payment: {amount: 237.6, token: "USDh", feeType: "dynamic"}
```

---

## Database Verification

After deploying agents in AgentSphere, verify in Supabase:

```sql
SELECT
  name,
  object_type,
  fee_type,
  interaction_fee_amount,
  interaction_fee_token
FROM deployed_objects
WHERE object_type IN ('payment_terminal', 'trailing_payment_terminal')
ORDER BY created_at DESC
LIMIT 5;
```

**Expected results:**

- Payment terminals with `fee_type = 'fixed'` have specific `interaction_fee_amount`
- Payment terminals with `fee_type = 'dynamic'` have `interaction_fee_amount = null`

---

## Files to Modify

Based on typical AR Viewer structure, check these files:

1. **`src/components/AgentInteractionModal.jsx`** - Main payment modal
2. **`src/components/PaymentModal.jsx`** - Alternative payment component
3. **`src/services/agentService.js`** - Agent data fetching
4. **`src/utils/paymentUtils.js`** - Payment utility functions (create if needed)
5. **`src/App.jsx`** - Route handling for `/payment-redirect`

---

## Estimated Time

- **45-60 minutes** (including testing)

---

## Deliverables

- ✅ Modified AR Viewer to read `fee_type` field from database
- ✅ URL parameter parsing for e-shop and on-ramp redirects
- ✅ Payment modal displays correct amount based on fee type and URL data
- ✅ Payment processing uses dynamic amount when provided
- ✅ End-to-end test results for both fixed and dynamic fees
- ✅ Console logs confirming correct payment amounts

---

## Success Criteria

**The implementation is complete when:**

1. A **fixed-fee agent** always shows its `interaction_fee_amount` (ignores URL)
2. A **dynamic-fee agent** shows URL amount when present, or "Dynamic Amount" label when absent
3. E-shop redirect with `?payment=true&data=...` correctly displays and processes the amount
4. On-ramp redirect with `?data=...` correctly displays and processes the amount
5. Payment processor receives the correct amount in all scenarios
6. Backward compatibility maintained for agents without `fee_type` field

---

## Notes

- **Currency Conversion:** If URL provides USD and agent uses USDh, assume 1:1 conversion (or implement actual conversion)
- **Error Handling:** Show user-friendly error if URL data is malformed
- **Security:** Validate amount is positive and reasonable (prevent negative/huge amounts)
- **Logging:** Keep console logs for debugging until tested in production
