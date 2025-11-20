-- ============================================================================
-- COMPLETE FIX: Update Existing Data + Add Custom Stablecoins
-- ============================================================================
-- This script:
-- 1. Temporarily drops the constraint
-- 2. Updates any invalid currency values
-- 3. Adds the new constraint with all 7 custom stablecoins
-- ============================================================================

-- Step 1: Drop the existing constraint (no validation)
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_currency_type;

-- Step 2: Fix any existing data with HBAR or USDd (convert to USDh)
UPDATE deployed_objects 
SET currency_type = 'USDh' 
WHERE currency_type IN ('HBAR', 'USDd');

-- Step 3: Fix interaction_fee_token for HBAR
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_interaction_fee_token;

UPDATE deployed_objects 
SET interaction_fee_token = 'USDh' 
WHERE interaction_fee_token IN ('HBAR', 'USDd');

-- Step 4: Add new constraint with all tokens (including 7 custom stablecoins)
ALTER TABLE deployed_objects ADD CONSTRAINT valid_currency_type 
CHECK (
  (currency_type IS NULL) OR 
  (currency_type = ANY (ARRAY[
    -- Legacy currencies
    'USDFC'::text, 'AURAS'::text, 'BDAG'::text,
    -- Native tokens
    'SOL'::text, 'ETH'::text, 'MATIC'::text, 'AVAX'::text,
    -- Standard Stablecoins
    'USDT'::text, 'USDC'::text, 'USDs'::text, 'DAI'::text,
    'USDBG+'::text, 'USDe'::text, 'PYUSD'::text, 'RLUSD'::text,
    'USDD'::text, 'GHO'::text, 'USDx'::text,
    -- Custom Stablecoins (ERC-20) ⭐ NEW
    'USDh'::text,   -- USD Hedera (replaces HBAR)
    'USDΔ'::text,   -- USD Delta
    'USDaix'::text, -- USD Aix
    'USDΔ+'::text,  -- USD Delta Plus
    'USDaix+'::text,-- USD Aix Plus
    'USDar'::text,  -- USD AR
    'USDair'::text  -- USD Air
  ]))
);

-- Step 5: Add interaction_fee_token constraint
ALTER TABLE deployed_objects ADD CONSTRAINT valid_interaction_fee_token 
CHECK (
  (interaction_fee_token IS NULL) OR 
  (interaction_fee_token = ANY (ARRAY[
    -- Native tokens
    'SOL'::text,
    -- Standard stablecoins
    'USDC'::text, 'USDT'::text, 'DAI'::text,
    -- Custom stablecoins ⭐ NEW
    'USDh'::text, 'USDΔ'::text, 'USDaix'::text, 
    'USDΔ+'::text, 'USDaix+'::text, 'USDar'::text, 'USDair'::text,
    -- Legacy
    'USDFC'::text, 'AURAS'::text, 'BDAG'::text
  ]))
);

-- Step 6: Ensure network constraint includes Hedera Testnet
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_network;

ALTER TABLE deployed_objects ADD CONSTRAINT valid_network 
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
SELECT '✅ Migration completed successfully!' as status;

-- Show updated currency types
SELECT 
  currency_type, 
  COUNT(*) as count
FROM deployed_objects
WHERE currency_type IS NOT NULL
GROUP BY currency_type
ORDER BY count DESC;

-- Show what got converted
SELECT 
  'Converted HBAR/USDd to USDh' as action,
  COUNT(*) as rows_affected
FROM deployed_objects
WHERE currency_type = 'USDh';
