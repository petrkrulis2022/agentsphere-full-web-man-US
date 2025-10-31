# 🔧 Fix HBAR Currency Constraint in Supabase

## Problem

The database constraint `valid_currency_type` doesn't include "HBAR", preventing Hedera Testnet agent deployments.

## Error Message

```
new row for relation "deployed_objects" violates check constraint "valid_currency_type"
```

## Solution

### Option 1: Supabase SQL Editor (RECOMMENDED) ⭐

1. **Open Supabase Dashboard**

   - Go to: https://supabase.com/dashboard/project/ncjbwzibnqrbrvicdmec/sql

2. **Run the Migration**

   - Open the file: `apply_hbar_migration.sql`
   - Copy the entire SQL content
   - Paste into Supabase SQL Editor
   - Click "Run" or press Ctrl+Enter

3. **Verify Success**
   - You should see: "Migration completed successfully!"
   - Check the constraints list at the bottom of the output

### Option 2: Quick psql Command (if you have psql installed)

```bash
# From project root
psql "postgresql://postgres.ncjbwzibnqrbrvicdmec:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -f apply_hbar_migration.sql
```

### Option 3: Minimal Fix (Copy/Paste this into Supabase SQL Editor)

```sql
-- Just add HBAR to currency constraint
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_currency_type;
ALTER TABLE deployed_objects ADD CONSTRAINT valid_currency_type
CHECK ((currency_type IS NULL) OR (currency_type = ANY (ARRAY[
  'USDFC'::text, 'AURAS'::text, 'BDAG'::text,
  'HBAR'::text, 'SOL'::text, 'ETH'::text,
  'USDT'::text, 'USDC'::text, 'DAI'::text
])));
```

## After Applying Migration

1. **Refresh the deployment page** (http://localhost:5174)
2. **Try deploying again** with these settings:
   - Network: Hedera Testnet (Chain ID 296)
   - Payment Token: HBAR
   - Interaction Fee: 1 HBAR
   - Make sure MetaMask is connected

## Expected Result

✅ Agent deploys successfully to Hedera Testnet
✅ Database accepts "HBAR" as currency_type
✅ Agent appears in deployed_objects table with:

- network: "Hedera Testnet"
- chain_id: 296
- currency_type: "HBAR"
- interaction_fee_token: "HBAR"
- token_address: "native"

## Need Help?

If migration fails, check:

1. You have database admin permissions
2. You're using the correct Supabase project
3. The table `deployed_objects` exists

## Files Created

- `apply_hbar_migration.sql` - Full migration with all constraints
- `fix_hbar_currency_constraint.sql` - Original fix (already exists)
- `HBAR_MIGRATION_GUIDE.md` - This guide
