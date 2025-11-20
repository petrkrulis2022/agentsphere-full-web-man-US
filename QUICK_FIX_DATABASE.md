# Quick Fix: USDh Database Error

## The Problem

```
❌ new row for relation "deployed_objects" violates check constraint "valid_currency_type"
```

## The Solution (2 minutes)

### Option 1: Manual SQL (Recommended)

1. **Open**: https://supabase.com/dashboard/project/ncjbwzibnqrbrvicdmec/sql

2. **Paste this SQL**:

```sql
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_currency_type;

ALTER TABLE deployed_objects ADD CONSTRAINT valid_currency_type
CHECK (
  (currency_type IS NULL) OR
  (currency_type = ANY (ARRAY[
    'USDFC'::text, 'AURAS'::text, 'BDAG'::text,
    'SOL'::text, 'ETH'::text, 'MATIC'::text, 'AVAX'::text,
    'USDT'::text, 'USDC'::text, 'USDs'::text, 'DAI'::text,
    'USDBG+'::text, 'USDe'::text, 'PYUSD'::text, 'RLUSD'::text,
    'USDD'::text, 'GHO'::text, 'USDx'::text,
    'USDh'::text, 'USDΔ'::text, 'USDaix'::text,
    'USDΔ+'::text, 'USDaix+'::text, 'USDar'::text, 'USDair'::text
  ]))
);

ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_interaction_fee_token;

ALTER TABLE deployed_objects ADD CONSTRAINT valid_interaction_fee_token
CHECK (
  (interaction_fee_token IS NULL) OR
  (interaction_fee_token = ANY (ARRAY[
    'SOL'::text, 'USDC'::text, 'USDT'::text, 'DAI'::text,
    'USDh'::text, 'USDΔ'::text, 'USDaix'::text,
    'USDΔ+'::text, 'USDaix+'::text, 'USDar'::text, 'USDair'::text,
    'USDFC'::text, 'AURAS'::text, 'BDAG'::text
  ]))
);
```

3. **Click "RUN"**

4. **Done!** Try deploying again.

---

## What This Does

Adds 7 custom stablecoins to your database:

- ✅ **USDh** (Primary - already deployed)
- ✅ **USDΔ, USDaix, USDΔ+, USDaix+, USDar, USDair** (Placeholders)

---

## Files Created

- ✅ `add_custom_stablecoins_migration.sql` - Complete SQL migration
- ✅ `MIGRATION_INSTRUCTIONS.md` - Detailed instructions
- ✅ `run_stablecoin_migration.mjs` - Automated script (requires DB function)

---

## After Migration

You can now:

- Deploy agents with USDh on Hedera Testnet ✅
- Generate QR codes for USDh payments ✅
- See USDh balance in wallet ✅

---

**See full details**: `MIGRATION_INSTRUCTIONS.md`
