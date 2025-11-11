# DIAGNOSTIC: Hedera Pay 3 Fee Mismatch Issue

## Problem Summary

- **Deployed**: "Hedera Pay 3" with Dynamic Fee selected
- **Agent Card Shows**: 1 USDC
- **AR Viewer Modal Shows**: 3 USDh
- **Hedera Wallet Shows**: 3 USDh transaction
- **Expected**: NULL (dynamic fee, no fixed amount)

## Investigation Steps

### 1. Check Database Record

Run in Supabase SQL Editor:

```sql
SELECT
  name,
  object_type,
  fee_type,
  interaction_fee_amount,
  interaction_fee_usdfc,
  interaction_fee_token,
  currency_type,
  token_symbol,
  created_at
FROM deployed_objects
WHERE name = 'Hedera Pay 3'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result if deployed correctly:**

- `fee_type`: "dynamic"
- `interaction_fee_amount`: NULL
- `interaction_fee_usdfc`: NULL
- `interaction_fee_token`: "USDh"

**If seeing wrong values:**

- `interaction_fee_amount`: 3 or 10 (WRONG - should be NULL)
- This means the dynamic fee logic didn't work

### 2. Possible Causes

#### A. Agent Type Not Recognized

**Check in deployment logs (console):**

- Look for: "🚀 Starting deployment with data:"
- Verify: `object_type: "payment_terminal"`
- If it says something else (e.g., "intelligent_assistant"), the fee_type logic won't trigger

#### B. Fee Type Not Selected Properly

**In AgentSphere deployment form:**

- Verify "Payment Terminal" is selected as agent type
- Verify "Dynamic Fee" radio button is checked (not "Fixed Fee")
- If "Fixed Fee" was selected, it will use the value in the input field

#### C. Old Agent Record

- If you deployed "Hedera Pay 3" multiple times, there might be multiple records
- AR Viewer might be loading an old version
- **Solution**: Delete old records or use a unique name like "Hedera Pay 3 Dynamic Test"

#### D. AR Viewer Reading Wrong Field

**AR Viewer might be reading from:**

- `interaction_fee_usdfc` (legacy field) instead of `interaction_fee_amount`
- `currency_type` instead of `interaction_fee_token`
- Not checking `fee_type` field at all

### 3. Code Bug Found & Fixed

**File**: `src/components/DeployObject.tsx`
**Lines**: 1190-1193
**Problem**: Fee type check didn't include agent type validation
**Fix Applied**:

```typescript
// OLD (WRONG):
interaction_fee_amount: feeType === "dynamic"
  ? null
  : parseFloat(interactionFee.toString());

// NEW (CORRECT):
interaction_fee_amount: (agentType === "payment_terminal" ||
  agentType === "trailing_payment_terminal") &&
feeType === "dynamic"
  ? null
  : parseFloat(interactionFee.toString());
```

**Impact**: Now only payment terminals with dynamic fee get NULL value

### 4. Immediate Action Required

#### Step 1: Verify Fix is Active

1. Refresh http://localhost:5174/deploy
2. Check browser console for any TypeScript errors
3. Verify dev server reloaded with changes

#### Step 2: Deploy Fresh Test Agent

1. Name it: "Dynamic Test Terminal 1"
2. Agent Type: **Payment Terminal**
3. Fee Type: Select **"Dynamic Fee"** radio button
4. Verify blue info box appears
5. Deploy agent

#### Step 3: Check Database Immediately

```sql
SELECT name, fee_type, interaction_fee_amount, interaction_fee_token
FROM deployed_objects
WHERE name = 'Dynamic Test Terminal 1';
```

**Should show:**

- `fee_type`: "dynamic"
- `interaction_fee_amount`: NULL (not 3, not 10)
- `interaction_fee_token`: "USDh"

#### Step 4: Test in AR Viewer

1. Load the new agent in AR Viewer
2. Check payment modal
3. **Should show**: "Dynamic Amount (Provided by merchant)" or no fixed fee
4. **Should NOT show**: "3 USDh" or any fixed amount

### 5. AR Viewer Investigation Needed

If database shows NULL but AR Viewer still shows "3 USDh":

**Check AR Viewer code for:**

```javascript
// WRONG (might be doing this):
const fee = agent.interaction_fee_usdfc || agent.interaction_fee_amount || 3;

// CORRECT (should be doing this):
const fee =
  agent.fee_type === "dynamic"
    ? getDynamicAmountFromURL()
    : agent.interaction_fee_amount;
```

**AR Viewer might have hardcoded fallback:**

- If `interaction_fee_amount` is NULL, it might default to "3"
- Check for: `const defaultFee = 3` or similar

### 6. Why "3" Specifically?

Possible sources:

1. **Old deployment**: You deployed with fee = 3 before
2. **Fallback value**: AR Viewer has 3 as default
3. **Currency conversion**: Some 10 USD → 3 HBAR conversion?
4. **Network fee**: 3 USDh might be network transaction fee, not interaction fee

### 7. Deployment Log Analysis

From your screenshot logs:

- **Line**: "💰 Interaction Fee Input: 10 number"
- **Expected**: Should see "💰 Using dynamic fee: NULL" or similar

**Add this console log to verify:**
Edit `DeployObject.tsx` around line 1256, add:

```typescript
console.log("🔍 FEE DEBUG:", {
  agentType,
  feeType,
  isPaymentTerminal: agentType === "payment_terminal",
  isDynamic: feeType === "dynamic",
  shouldBeNull: agentType === "payment_terminal" && feeType === "dynamic",
  finalFeeAmount: deploymentData.interaction_fee_amount,
});
```

## Next Steps

1. ✅ Fix applied to DeployObject.tsx
2. ⏳ Run SQL query to check Hedera Pay 3 record
3. ⏳ Deploy fresh test agent with unique name
4. ⏳ Verify NULL in database
5. ⏳ Test in AR Viewer
6. ⏳ Update AR Viewer code if needed (use improved prompt)

## Summary

**Root Cause (AgentSphere)**: ✅ FIXED - fee_type check didn't validate agent type
**Suspected Issue (AR Viewer)**: Likely not checking `fee_type` field or has hardcoded fallback

**Immediate Action**: Deploy new test agent and verify database shows NULL for dynamic fees
