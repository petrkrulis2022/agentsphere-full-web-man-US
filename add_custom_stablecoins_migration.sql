-- ============================================================================
-- ADD 7 CUSTOM STABLECOINS TO DEPLOYED_OBJECTS TABLE
-- ============================================================================
-- This migration adds 7 custom ERC-20 stablecoins for Hedera and other networks
-- Stablecoins: USDh, USDΔ, USDaix, USDΔ+, USDaix+, USDar, USDair
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
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

-- Step 4: Ensure network constraint includes Hedera Testnet (keep existing)
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
    'Hedera Testnet'::text,  -- Custom stablecoins deployed here
    -- Non-EVM Networks
    'Solana Devnet'::text,
    -- Legacy formats
    'avalanche-fuji'::text,
    'ethereum'::text,
    'polygon'::text,
    'hedera-testnet'::text
  ]))
);

-- Verification queries
SELECT 'Migration completed successfully! Added 7 custom stablecoins.' as status;

-- Show current constraints
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name IN ('valid_currency_type', 'valid_interaction_fee_token', 'valid_network')
  AND constraint_schema = 'public';

-- Show count of each currency type in use
SELECT 
  currency_type, 
  COUNT(*) as count
FROM deployed_objects
WHERE currency_type IN ('USDh', 'USDΔ', 'USDaix', 'USDΔ+', 'USDaix+', 'USDar', 'USDair')
GROUP BY currency_type
ORDER BY count DESC;
