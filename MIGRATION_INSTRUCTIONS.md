# 🔧 Database Migration Instructions - Add 7 Custom Stablecoins

## ⚠️ Error You're Seeing

```
new row for relation "deployed_objects" violates check constraint "valid_currency_type"
```

This happens because **USDh** (and the other 6 custom stablecoins) are not yet added to the database constraints.

---

## 🎯 Solution: Run SQL Migration

### Step 1: Open Supabase SQL Editor

Click here: **[Supabase SQL Editor](https://supabase.com/dashboard/project/ncjbwzibnqrbrvicdmec/sql)**

### Step 2: Copy & Paste the SQL

Open the file: `add_custom_stablecoins_migration.sql`

Or copy this SQL:

```sql
-- ============================================================================
-- ADD 7 CUSTOM STABLECOINS TO DEPLOYED_OBJECTS TABLE
-- ============================================================================

-- Step 1: Drop existing currency type constraint
ALTER TABLE deployed_objects
DROP CONSTRAINT IF EXISTS valid_currency_type;

-- Step 2: Add updated constraint with 7 new custom stablecoins
ALTER TABLE deployed_objects
ADD CONSTRAINT valid_currency_type
CHECK (
  (currency_type IS NULL) OR
  (currency_type = ANY (ARRAY[
    -- Legacy currencies
    'USDFC'::text,
    'AURAS'::text,
    'BDAG'::text,
    -- Native tokens
    'SOL'::text,    -- Solana native token
    'ETH'::text,    -- Ethereum native token
    'MATIC'::text,  -- Polygon native token
    'AVAX'::text,   -- Avalanche native token
    -- Standard Stablecoins
    'USDT'::text,   -- Tether USD
    'USDC'::text,   -- USD Coin
    'USDs'::text,   -- Stablecoin by Stably
    'DAI'::text,    -- DAI Stablecoin
    'USDBG+'::text, -- USD Bancor Governance Plus
    'USDe'::text,   -- Ethena USD
    'PYUSD'::text,  -- PayPal USD
    'RLUSD'::text,  -- Ripple USD
    'USDD'::text,   -- USDD Stablecoin
    'GHO'::text,    -- GHO Stablecoin
    'USDx'::text,   -- USDx Stablecoin
    -- Custom Stablecoins (ERC-20) ⭐ NEW
    'USDh'::text,   -- USD Hedera - Primary stablecoin
    'USDΔ'::text,   -- USD Delta
    'USDaix'::text, -- USD Aix
    'USDΔ+'::text,  -- USD Delta Plus
    'USDaix+'::text,-- USD Aix Plus
    'USDar'::text,  -- USD AR
    'USDair'::text  -- USD Air
  ]))
);

-- Step 3: Update interaction_fee_token constraint with 7 new stablecoins
ALTER TABLE deployed_objects
DROP CONSTRAINT IF EXISTS valid_interaction_fee_token;

ALTER TABLE deployed_objects
ADD CONSTRAINT valid_interaction_fee_token
CHECK (
  (interaction_fee_token IS NULL) OR
  (interaction_fee_token = ANY (ARRAY[
    -- Native tokens
    'SOL'::text,    -- Solana
    -- Standard stablecoins
    'USDC'::text,   -- USD Coin
    'USDT'::text,   -- Tether
    'DAI'::text,    -- DAI
    -- Custom stablecoins ⭐ NEW
    'USDh'::text,   -- USD Hedera
    'USDΔ'::text,   -- USD Delta
    'USDaix'::text, -- USD Aix
    'USDΔ+'::text,  -- USD Delta Plus
    'USDaix+'::text,-- USD Aix Plus
    'USDar'::text,  -- USD AR
    'USDair'::text, -- USD Air
    -- Legacy
    'USDFC'::text,
    'AURAS'::text,
    'BDAG'::text
  ]))
);

-- Step 4: Ensure network constraint includes Hedera Testnet
ALTER TABLE deployed_objects
DROP CONSTRAINT IF EXISTS valid_network;

ALTER TABLE deployed_objects
ADD CONSTRAINT valid_network
CHECK (
  (network IS NULL) OR
  (network = ANY (ARRAY[
    -- EVM Networks
    'Ethereum Sepolia'::text,
    'Arbitrum Sepolia'::text,
    'Base Sepolia'::text,
    'OP Sepolia'::text,
    'Avalanche Fuji'::text,
    'Polygon Amoy'::text,
    'Hedera Testnet'::text,
    -- Non-EVM Networks
    'Solana Devnet'::text,
    -- Legacy formats
    'avalanche-fuji'::text,
    'ethereum'::text,
    'polygon'::text,
    'hedera-testnet'::text
  ]))
);

-- Verification
SELECT 'Migration completed successfully! Added 7 custom stablecoins.' as status;
```

### Step 3: Click "RUN"

Click the green "RUN" button in Supabase SQL Editor.

### Step 4: Verify Success

You should see:

```
✅ Migration completed successfully! Added 7 custom stablecoins.
```

---

## 📋 What This Migration Does

### ✅ Adds 7 New Stablecoins to Database

1. **USDh** - USD Hedera (Primary) - Already deployed at `0x00000000000000000000000000000000006e24c7`
2. **USDΔ** - USD Delta (Placeholder)
3. **USDaix** - USD Aix (Placeholder)
4. **USDΔ+** - USD Delta Plus (Placeholder)
5. **USDaix+** - USD Aix Plus (Placeholder)
6. **USDar** - USD AR (Placeholder)
7. **USDair** - USD Air (Placeholder)

### ✅ Updates Two Database Constraints

1. **`valid_currency_type`** - Allows these tokens as payment currencies
2. **`valid_interaction_fee_token`** - Allows these tokens as interaction fee tokens

### ✅ Removes HBAR

- Native HBAR token removed (replaced by ERC-20 USDh)

---

## 🎯 After Migration

You will be able to:

- ✅ Deploy agents on Hedera Testnet with USDh as payment token
- ✅ Set interaction fees in USDh (or other custom stablecoins)
- ✅ Generate QR codes for USDh payments
- ✅ Accept USDh payments through AR Viewer

---

## 🔍 Troubleshooting

### If migration fails with "constraint already exists":

That's OK! It means constraints are already updated. Just verify by running:

```sql
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'valid_currency_type'
  AND constraint_schema = 'public';
```

Check if `USDh` is in the list.

### If you still get the error after migration:

1. Clear your browser cache
2. Refresh the deployment page
3. Try deploying again

---

## 📚 Related Files

- `add_custom_stablecoins_migration.sql` - Full SQL migration
- `SESSION_SUMMARY_USDH_INTEGRATION.md` - Summary of USDh integration
- `src/components/DeployObject.tsx` - Frontend payment token config
- `src/services/hederaWalletService.ts` - USDh balance fetching

---

## ✅ Success Criteria

After running this migration, you should be able to:

1. Select "USDh" from payment token dropdown on Hedera Testnet
2. Deploy agent without database constraint errors
3. See USDh balance in wallet display
4. Generate QR codes for USDh payments

---

**Need help?** Check the session summary: `SESSION_SUMMARY_USDH_INTEGRATION.md`
