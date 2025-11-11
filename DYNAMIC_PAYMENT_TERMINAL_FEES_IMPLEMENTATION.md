# Dynamic Payment Terminal Fees - Implementation Documentation

## Overview

This implementation adds support for dynamic (variable) payment amounts for Payment Terminal and Trailing Payment Terminal agents in AgentSphere. Merchants can now choose between fixed fees or dynamic fees that are set per transaction by e-shops, on-ramps, and other payment sources.

## Implementation Summary

### Changes Made

#### 1. **Frontend - DeployObject.tsx**

**New State Variable:**

```typescript
const [feeType, setFeeType] = useState<"fixed" | "dynamic">("fixed");
```

**UI Changes (lines ~2400-2480):**

- Added radio button selector for "Fixed Fee" vs "Dynamic Fee"
- Shows dynamic fee info box when "Dynamic Fee" is selected
- Shows fee input field when "Fixed Fee" is selected
- Updated placeholder text for better clarity

**Key UI Features:**

- Radio buttons appear only for `payment_terminal` and `trailing_payment_terminal` agent types
- Dynamic fee option shows helpful explanation:
  > "This terminal will accept variable amounts from merchants. The fee will be set per transaction by e-shops, on-ramps, or other payment sources. No fixed amount is required."
- Fixed fee option shows standard input with validation

**Deployment Logic (lines ~1180-1190):**

```typescript
fee_type: (agentType === "payment_terminal" || agentType === "trailing_payment_terminal")
  ? feeType
  : "fixed", // Add fee_type field
interaction_fee_amount: feeType === "dynamic"
  ? null
  : parseFloat(interactionFee.toString()), // null for dynamic, amount for fixed
interaction_fee_token: selectedToken,
interaction_fee_usdfc: feeType === "dynamic"
  ? null
  : interactionFee, // Legacy field, null for dynamic
```

**Form State Preservation:**

- Added `feeType` to `navigateToARPlacement()` function
- Added `feeType` restoration in useEffect (line ~1570)
- Ensures fee type persists when using AR Camera placement

#### 2. **Database Migration**

**File: `add_fee_type_migration.sql`**

- Adds `fee_type` column (VARCHAR(10), default: 'fixed')
- Adds constraint: only 'fixed' or 'dynamic' values allowed
- Updates existing payment terminal agents based on current fee values:
  - `fee_type = 'dynamic'` if `interaction_fee_amount` is NULL or 0
  - `fee_type = 'fixed'` if `interaction_fee_amount` has a value
- Includes verification query to check migration results

**File: `apply_fee_type_migration.js`**

- Node.js script to apply the migration via Supabase
- Reads SQL file and executes statements
- Verifies migration by counting agents by fee type
- Provides helpful next steps after completion

#### 3. **Database Schema Changes**

**New Column in `deployed_objects` table:**

```sql
fee_type VARCHAR(10) DEFAULT 'fixed' CHECK (fee_type IN ('fixed', 'dynamic'))
```

**Modified Columns:**

- `interaction_fee_amount`: Can now be NULL for dynamic fees
- `interaction_fee_usdfc`: Can now be NULL for dynamic fees (legacy field)

## User Workflow

### Option 1: Fixed Fee Terminal

1. Select "Payment Terminal" or "Trailing Payment Terminal" as agent type
2. Select "Fixed Fee" radio button
3. Enter specific amount (e.g., 10 USDC)
4. Deploy agent
5. **Result:** Agent shows fixed fee in AR Viewer, only accepts that exact amount

### Option 2: Dynamic Fee Terminal

1. Select "Payment Terminal" or "Trailing Payment Terminal" as agent type
2. Select "Dynamic Fee" radio button
3. Blue info box appears explaining dynamic fees
4. Deploy agent
5. **Result:** Agent stored with `fee_type='dynamic'` and `interaction_fee_amount=null`

## Database Records

### Fixed Fee Agent Example:

```json
{
  "object_type": "payment_terminal",
  "fee_type": "fixed",
  "interaction_fee_amount": 10.0,
  "interaction_fee_token": "USDC",
  "interaction_fee_usdfc": 10.0
}
```

### Dynamic Fee Agent Example:

```json
{
  "object_type": "payment_terminal",
  "fee_type": "dynamic",
  "interaction_fee_amount": null,
  "interaction_fee_token": "USDC",
  "interaction_fee_usdfc": null
}
```

## AR Viewer Integration

### Expected Behavior

**Fixed Fee Agents:**

- Display specific amount in agent card UI
- Accept only the fixed amount
- Show error if user tries to pay different amount

**Dynamic Fee Agents:**

- Display "Dynamic Amount" or "Variable Fee" in agent card
- Accept amount from URL parameter: `?amount=25.50`
- Accept amount from merchant API/e-shop
- No amount validation (merchant sets the price)

### Integration Points

The AR Viewer should check `fee_type`:

```typescript
if (agent.fee_type === "dynamic") {
  // Get amount from URL parameter or merchant
  const amount = new URLSearchParams(window.location.search).get("amount");
  // Use dynamic amount for payment
} else {
  // Use fixed interaction_fee_amount
  const amount = agent.interaction_fee_amount;
}
```

## Testing Checklist

### Frontend Testing

- ✅ Deploy Payment Terminal with "Fixed Fee" (e.g., 15 USDC)
- ✅ Deploy Payment Terminal with "Dynamic Fee"
- ✅ Verify radio buttons work correctly
- ✅ Verify info box displays for dynamic fee
- ✅ Verify fee input disabled when dynamic selected
- ✅ Test form state preservation with AR Camera navigation

### Database Testing

- ✅ Run migration: `node apply_fee_type_migration.js`
- ✅ Verify `fee_type` column exists
- ✅ Check constraint only allows 'fixed' or 'dynamic'
- ✅ Verify existing agents updated correctly
- ✅ Deploy new agent and verify `fee_type` field saved

### Backend/AR Viewer Testing (TO BE DONE)

- ⏳ Verify AR Viewer reads `fee_type` field
- ⏳ Test dynamic fee with URL parameter: `/agent/123?amount=50`
- ⏳ Test e-shop integration with variable amounts
- ⏳ Verify payment processing works for both types
- ⏳ Test Revolut/Hedera/Solana payments with dynamic amounts

## Migration Instructions

### Step 1: Apply Database Migration

```bash
# Ensure you have Supabase credentials in .env
node apply_fee_type_migration.js
```

### Step 2: Verify Migration

```sql
-- Run in Supabase SQL Editor
SELECT
  object_type,
  fee_type,
  interaction_fee_amount,
  COUNT(*) as count
FROM deployed_objects
WHERE object_type IN ('payment_terminal', 'trailing_payment_terminal')
GROUP BY object_type, fee_type, interaction_fee_amount;
```

### Step 3: Test Deployment

1. Open AgentSphere at http://localhost:5174/deploy
2. Select "Payment Terminal" type
3. Test both "Fixed Fee" and "Dynamic Fee" options
4. Deploy and verify in database

## Files Modified

### New Files Created:

1. `add_fee_type_migration.sql` - SQL migration script
2. `apply_fee_type_migration.js` - Migration runner script
3. `DYNAMIC_PAYMENT_TERMINAL_FEES_IMPLEMENTATION.md` - This documentation

### Files Modified:

1. `src/components/DeployObject.tsx`:
   - Added `feeType` state variable (line ~125)
   - Updated fee UI section (lines ~2400-2480)
   - Modified deployment data object (lines ~1180-1190)
   - Updated AR navigation state (line ~1069)
   - Updated form restoration useEffect (line ~1570)

## Next Steps for AR Viewer

The AR Viewer implementation should:

1. **Read `fee_type` field** from agent data
2. **For Dynamic Fees:**
   - Accept `amount` parameter from URL
   - Display "Variable Amount" in UI
   - Show amount when provided by merchant
   - Support e-shop checkout flow
3. **For Fixed Fees:**
   - Display specific amount from `interaction_fee_amount`
   - Validate payment matches fixed amount
   - Reject payments with wrong amount

### Example AR Viewer Code:

```typescript
// In AR Viewer component
const displayAmount =
  agent.fee_type === "dynamic"
    ? getAmountFromMerchant() // From URL or API
    : agent.interaction_fee_amount;

const feeLabel =
  agent.fee_type === "dynamic"
    ? "Variable Amount"
    : `${agent.interaction_fee_amount} ${agent.interaction_fee_token}`;
```

## Merchant Integration Example

E-shop checkout flow:

```typescript
// E-shop backend generates payment link
const agentId = "abc123";
const orderAmount = 99.99;
const checkoutUrl = `https://agentsphere.ar/agent/${agentId}?amount=${orderAmount}&order=ORDER_123`;

// Customer scans QR code or clicks link
// AR Viewer shows: "Pay 99.99 USDC"
// After payment: Redirect to e-shop with confirmation
```

## Compatibility Notes

- ✅ Backward compatible: Existing agents default to `fee_type='fixed'`
- ✅ Non-payment terminals always use `fee_type='fixed'`
- ✅ Migration safely updates existing payment terminals
- ✅ No breaking changes to existing deployments

## Support

For issues or questions:

1. Check TypeScript errors: `npm run build`
2. Verify database migration: Run verification query
3. Test with console logs: Check browser DevTools
4. Review Supabase logs: Check for database errors

## Version History

- **v1.0** (2025-11-11): Initial implementation
  - Added fee type selector UI
  - Created database migration
  - Updated deployment logic
  - Added form state preservation
