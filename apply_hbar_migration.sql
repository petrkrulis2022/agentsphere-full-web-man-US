-- ============================================================================
-- ADD HBAR SUPPORT TO DEPLOYED_OBJECTS TABLE
-- ============================================================================
-- This migration adds HBAR (Hedera native token) to the valid currency types
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- ============================================================================

-- Step 1: Drop existing currency type constraint
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_currency_type;

-- Step 2: Add updated constraint with HBAR support
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
    'HBAR'::text,   -- Hedera native token ⭐ NEW
    'SOL'::text,    -- Solana native token
    'ETH'::text,    -- Ethereum native token
    'MATIC'::text,  -- Polygon native token
    'AVAX'::text,   -- Avalanche native token
    -- Stablecoins
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
    'USDx'::text    -- USDx Stablecoin
  ]))
);

-- Step 3: Update interaction_fee_token constraint (if exists)
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_interaction_fee_token;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_interaction_fee_token 
CHECK (
  (interaction_fee_token IS NULL) OR 
  (interaction_fee_token = ANY (ARRAY[
    'HBAR'::text,   -- Hedera ⭐ NEW
    'SOL'::text,    -- Solana
    'USDC'::text,   -- USD Coin
    'USDT'::text,   -- Tether
    'DAI'::text,    -- DAI
    'USDFC'::text,  -- Legacy
    'AURAS'::text,  -- Legacy
    'BDAG'::text    -- Legacy
  ]))
);

-- Step 4: Update network constraint to include Hedera Testnet
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
    -- Non-EVM Networks
    'Solana Devnet'::text,
    'Hedera Testnet'::text,  -- ⭐ NEW
    -- Legacy formats
    'avalanche-fuji'::text,
    'ethereum'::text,
    'polygon'::text,
    'hedera-testnet'::text
  ]))
);

-- Verification queries
SELECT 'Migration completed successfully!' as status;

-- Show current constraints
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name IN ('valid_currency_type', 'valid_interaction_fee_token', 'valid_network')
  AND constraint_schema = 'public';
