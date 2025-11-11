# Quick Testing Guide - Dynamic Payment Terminal Fees

## Prerequisites

- Dev server running at http://localhost:5174
- Wallet connected (MetaMask, Phantom, or other)
- Supabase database accessible

## Test Scenario 1: Deploy Fixed Fee Payment Terminal

### Steps:

1. Navigate to http://localhost:5174/deploy
2. Connect your wallet
3. Fill in agent details:
   - **Agent Name**: "Test Fixed Fee Terminal"
   - **Agent Type**: Select "Payment Terminal"
   - **Fee Type**: Select **"Fixed Fee"** radio button
   - **Interaction Fee**: Enter "25" (USDC)
4. Get current location or use AR Camera
5. Click "Deploy Agent"
6. Wait for deployment confirmation

### Expected Results:

✅ Fee input field should be visible and enabled
✅ Value "25" should be accepted
✅ Agent deploys successfully
✅ Database record shows:

```json
{
  "fee_type": "fixed",
  "interaction_fee_amount": 25.0,
  "interaction_fee_usdfc": 25.0
}
```

## Test Scenario 2: Deploy Dynamic Fee Payment Terminal

### Steps:

1. Navigate to http://localhost:5174/deploy
2. Connect your wallet (if not already connected)
3. Fill in agent details:
   - **Agent Name**: "Test Dynamic Fee Terminal"
   - **Agent Type**: Select "Payment Terminal"
   - **Fee Type**: Select **"Dynamic Fee"** radio button
4. Observe the blue info box appears
5. Get current location or use AR Camera
6. Click "Deploy Agent"
7. Wait for deployment confirmation

### Expected Results:

✅ Fee input field should be hidden/disabled
✅ Blue info box should display:

> "This terminal will accept variable amounts from merchants. The fee will be set per transaction by e-shops, on-ramps, or other payment sources. No fixed amount is required."
> ✅ Agent deploys successfully
> ✅ Database record shows:

```json
{
  "fee_type": "dynamic",
  "interaction_fee_amount": null,
  "interaction_fee_usdfc": null
}
```

## Test Scenario 3: Trailing Payment Terminal (Dynamic)

### Steps:

1. Navigate to http://localhost:5174/deploy
2. Fill in agent details:
   - **Agent Name**: "Test Trailing Dynamic Terminal"
   - **Agent Type**: Select "Trailing Payment Terminal" (under PROJECTS dropdown)
   - **Fee Type**: Select **"Dynamic Fee"** radio button
   - **Trailing Agent**: Check the trailing agent checkbox
3. Get current location
4. Click "Deploy Agent"

### Expected Results:

✅ Same behavior as Payment Terminal
✅ `object_type: "trailing_payment_terminal"`
✅ `fee_type: "dynamic"`
✅ `interaction_fee_amount: null`

## Test Scenario 4: Form State Preservation with AR Camera

### Steps:

1. Navigate to http://localhost:5174/deploy
2. Fill in details:
   - **Agent Name**: "AR Camera Test"
   - **Agent Type**: "Payment Terminal"
   - **Fee Type**: Select "Dynamic Fee"
3. Click **"Deploy with AR Camera"** button
4. On AR Camera page, click "Cancel" or "Back"
5. Return to deployment form

### Expected Results:

✅ Agent name "AR Camera Test" is preserved
✅ Agent type "Payment Terminal" is selected
✅ Fee type "Dynamic Fee" is still selected
✅ Blue info box is displayed
✅ All other form fields preserved

## Test Scenario 5: Non-Payment Terminal Agents

### Steps:

1. Navigate to http://localhost:5174/deploy
2. Select agent type: **"Intelligent Assistant"** (not a payment terminal)
3. Observe fee configuration section

### Expected Results:

✅ Fee type radio buttons should NOT appear
✅ Only standard fee input field is shown
✅ No blue info box displayed
✅ Normal deployment flow works
✅ Database shows `fee_type: "fixed"` (default)

## Database Verification

### After deploying test agents, run this query in Supabase SQL Editor:

```sql
SELECT
  name,
  object_type,
  fee_type,
  interaction_fee_amount,
  interaction_fee_token,
  interaction_fee_usdfc,
  created_at
FROM deployed_objects
WHERE name LIKE 'Test%'
ORDER BY created_at DESC
LIMIT 10;
```

### Expected Output:

```
| name                          | object_type              | fee_type | interaction_fee_amount | interaction_fee_token |
|-------------------------------|--------------------------|----------|------------------------|-----------------------|
| Test Dynamic Fee Terminal     | payment_terminal         | dynamic  | null                   | USDC                  |
| Test Fixed Fee Terminal       | payment_terminal         | fixed    | 25.0                   | USDC                  |
| Test Trailing Dynamic Terminal| trailing_payment_terminal| dynamic  | null                   | USDC                  |
```

## Running the Migration

If you need to add the `fee_type` column to your database:

```bash
# Install dependencies if needed
npm install @supabase/supabase-js dotenv

# Run migration
node apply_fee_type_migration.js
```

### Expected Migration Output:

```
🚀 Starting fee_type migration...
📝 Found X SQL statements to execute
▶️  Executing statement 1/X...
✅ Statement 1 executed successfully
...
✅ Migration completed successfully!
```

## Troubleshooting

### Issue: Radio buttons not showing

**Solution**: Make sure you selected "Payment Terminal" or "Trailing Payment Terminal" as agent type.

### Issue: Fee field not disabled for dynamic

**Solution**: Clear browser cache and refresh. Check React DevTools for state.

### Issue: Database shows wrong fee_type

**Solution**:

1. Check deployment console logs
2. Verify `fee_type` is in deploymentData object
3. Run migration script to add column if missing

### Issue: Form state not preserved from AR Camera

**Solution**:

1. Check browser console for navigation errors
2. Verify `feeType` is in navigation state
3. Check useEffect is restoring `savedData.feeType`

## Success Criteria

All tests pass when:

- ✅ Fixed fee terminals accept specific amounts
- ✅ Dynamic fee terminals save with `null` interaction_fee_amount
- ✅ UI toggles correctly between fixed/dynamic modes
- ✅ Form state preserved with AR Camera navigation
- ✅ Non-payment terminals work normally
- ✅ Database records match expected schema

## Next Steps After Testing

1. **Verify in Dashboard**: Check agent cards display correct fee info
2. **Test AR Viewer**: Ensure AR Viewer reads `fee_type` field
3. **Merchant Integration**: Test dynamic amount from URL parameter
4. **Payment Processing**: Verify Revolut/Hedera/Solana handle dynamic amounts
5. **E-shop Integration**: Test checkout flow with variable amounts

## Support

If tests fail:

1. Check browser console for errors
2. Verify Supabase connection
3. Run `npm run build` to check TypeScript errors
4. Review `DYNAMIC_PAYMENT_TERMINAL_FEES_IMPLEMENTATION.md`
5. Check git changes: `git diff src/components/DeployObject.tsx`
