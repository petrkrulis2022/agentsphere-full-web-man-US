-- ============================================================================
-- FIX EXISTING DATA BEFORE ADDING CUSTOM STABLECOINS
-- ============================================================================
-- This script checks for invalid currency_type values and fixes them
-- Run this BEFORE the main migration
-- ============================================================================

-- Step 1: Check what currency_type values currently exist
SELECT 
  currency_type, 
  COUNT(*) as count,
  STRING_AGG(DISTINCT id::text, ', ') as sample_ids
FROM deployed_objects
WHERE currency_type IS NOT NULL
GROUP BY currency_type
ORDER BY count DESC;

-- Step 2: Check for any currency_type values that would violate the new constraint
SELECT 
  id,
  name,
  currency_type,
  interaction_fee_token,
  network,
  created_at
FROM deployed_objects
WHERE currency_type IS NOT NULL
  AND currency_type NOT IN (
    'USDFC', 'AURAS', 'BDAG',
    'SOL', 'ETH', 'MATIC', 'AVAX',
    'USDT', 'USDC', 'USDs', 'DAI',
    'USDBG+', 'USDe', 'PYUSD', 'RLUSD',
    'USDD', 'GHO', 'USDx',
    'USDh', 'USDΔ', 'USDaix', 
    'USDΔ+', 'USDaix+', 'USDar', 'USDair'
  )
ORDER BY created_at DESC;

-- Step 3: If you see invalid values above, uncomment and run ONE of these fixes:

-- Option A: Update HBAR to USDh (if you have HBAR entries)
-- UPDATE deployed_objects 
-- SET currency_type = 'USDh' 
-- WHERE currency_type = 'HBAR';

-- Option B: Update USDd to USDh (if you have old USDd entries)
-- UPDATE deployed_objects 
-- SET currency_type = 'USDh' 
-- WHERE currency_type = 'USDd';

-- Option C: Delete test/invalid entries (if they're not important)
-- DELETE FROM deployed_objects 
-- WHERE currency_type NOT IN (
--   'USDFC', 'AURAS', 'BDAG', 'SOL', 'ETH', 'MATIC', 'AVAX',
--   'USDT', 'USDC', 'USDs', 'DAI', 'USDBG+', 'USDe', 'PYUSD', 
--   'RLUSD', 'USDD', 'GHO', 'USDx', 'USDh', 'USDΔ', 'USDaix', 
--   'USDΔ+', 'USDaix+', 'USDar', 'USDair'
-- );

-- Step 4: After fixing data, run the constraint update
-- (This will be in the next script)
