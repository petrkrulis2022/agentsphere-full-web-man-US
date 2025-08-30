/*
  Fix currency constraint to include HBAR for Hedera Testnet deployments
  
  This adds HBAR as a valid currency type to the deployed_objects table constraint.
*/

-- Update currency type constraint to include HBAR
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_currency_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_currency_type 
CHECK ((currency_type IS NULL) OR (currency_type = ANY (ARRAY[
  -- Legacy currencies
  'USDFC'::text, 
  'AURAS'::text,
  'BDAG'::text,
  -- Hedera native token
  'HBAR'::text,   -- Hedera native token
  -- Comprehensive stablecoin support
  'USDT'::text,   -- Tether USD
  'USDC'::text,   -- USD Coin  
  'USDs'::text,   -- Stablecoin by Stably
  'USDBG+'::text, -- USD Bancor Governance Plus
  'USDe'::text,   -- Ethena USD
  'LSTD+'::text,  -- Liquid Staked Token Derivative Plus
  'AIX'::text,    -- Aigang Token
  'PYUSD'::text,  -- PayPal USD
  'RLUSD'::text,  -- Ripple USD
  'USDD'::text,   -- USDD Stablecoin
  'GHO'::text,    -- GHO Stablecoin
  'USDx'::text    -- USDx Stablecoin
])));

-- Also update network constraint to include hedera-testnet
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_network;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_network 
CHECK ((network IS NULL) OR (network = ANY (ARRAY[
  'avalanche-fuji'::text,
  'avalanche-mainnet'::text,
  'ethereum'::text,
  'polygon'::text,
  'algorand-testnet'::text,
  'algorand-mainnet'::text,
  'near-testnet'::text,
  'near-mainnet'::text,
  'blockdag-testnet'::text,
  'hedera-testnet'::text,
  'hedera-mainnet'::text,
  'morph-holesky-testnet'::text
])));

-- Success message
SELECT 'HBAR currency constraint updated successfully!' as status;
