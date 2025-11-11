# AR VIEWER - Fix Dynamic Fee Display Issue

## Problem

Agent "Hedera Pay 3" has `fee_type='dynamic'` and `interaction_fee_amount=NULL` in database, but AR Viewer displays "3 USDh" instead of recognizing it as a dynamic fee terminal.

## Database Verification

```sql
-- Hedera Pay 3 is correctly stored:
name: 'Hedera Pay 3'
object_type: 'payment_terminal'
fee_type: 'dynamic'
interaction_fee_amount: NULL
interaction_fee_token: 'USDh'
```

## Required Fix

### 1. Fetch `fee_type` Field

Update agent data query to include the new field:

```javascript
const { data: agent } = await supabase
  .from("deployed_objects")
  .select("*, fee_type") // ← ADD THIS FIELD
  .eq("id", agentId)
  .single();
```

### 2. Update Payment Modal Display Logic

**Find** the section that displays the service fee (currently showing "3 USDh") and **replace** with:

```javascript
// Check if this is a dynamic fee agent
const isDynamicFee = agent.fee_type === "dynamic";

// Display logic
if (isDynamicFee) {
  // Show dynamic fee label (no fixed amount)
  displayText = "💰 Dynamic Amount (Set by merchant)";
  showAmountInput = false; // Hide or disable fixed amount
} else {
  // Show fixed fee
  displayText = `${agent.interaction_fee_amount} ${agent.interaction_fee_token}`;
  finalAmount = agent.interaction_fee_amount;
}
```

### 3. Remove Hardcoded Fallback

**Search for** any hardcoded fee fallback and remove it:

```javascript
// FIND AND REMOVE:
const fee = agent.interaction_fee_amount || 3; // ❌ BAD - removes this
const defaultFee = 3; // ❌ BAD - removes this

// REPLACE WITH:
const fee =
  agent.fee_type === "dynamic"
    ? null // Dynamic - no fixed fee
    : agent.interaction_fee_amount; // ✅ GOOD
```

### 4. Handle Payment Generation

When user clicks "Generate Payment":

```javascript
const handleGeneratePayment = () => {
  if (agent.fee_type === "dynamic") {
    // For dynamic fees, check URL for amount or prompt merchant
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get("data");

    if (dataParam) {
      // Parse base64 encoded data
      const paymentData = JSON.parse(atob(dataParam));
      finalAmount = paymentData.amount; // Use merchant's amount
    } else {
      alert("Dynamic fee agent requires amount from merchant redirect");
      return;
    }
  } else {
    // Fixed fee - use agent's amount
    finalAmount = agent.interaction_fee_amount;
  }

  // Proceed with payment using finalAmount
  processPayment(finalAmount, agent.interaction_fee_token);
};
```

## Expected Result

**After Fix:**

- Load "Hedera Pay 3" → Shows "Dynamic Amount (Set by merchant)"
- No "3 USDh" displayed
- Payment button disabled OR shows "Awaiting merchant amount"
- When redirected with `?data=...` → Shows correct amount from URL

## Test Cases

1. **Dynamic fee agent without URL**: Show "Dynamic Amount"
2. **Dynamic fee agent with URL `?data=eyJhbW91bnQiOjEwMH0=`**: Show "100 USDh"
3. **Fixed fee agent**: Show normal fee (e.g., "10 USDh")

## Files to Check

Search these files for the "3 USDh" hardcoded value:

- `AgentInteractionModal.jsx`
- `PaymentModal.jsx`
- `CubePaymentEngine.jsx`
- Any file with payment/fee display logic

**Search for:** `3` or `defaultFee` or `|| 3` in payment-related files
