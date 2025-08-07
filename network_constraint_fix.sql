-- Network Constraint Fix for AgentSphere
-- Execute this in Supabase SQL Editor to fix the network constraint violation

-- Update network constraint to include new blockchain networks
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_network;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_network 
CHECK ((network IS NULL) OR (network = ANY (ARRAY[
  -- Existing networks
  'avalanche-fuji'::text,
  'avalanche-mainnet'::text,
  'ethereum'::text,
  'polygon'::text,
  'algorand-testnet'::text,
  'algorand-mainnet'::text,
  'near-testnet'::text,
  'near-mainnet'::text,
  'blockdag-testnet'::text,
  -- New blockchain networks for enhanced stablecoin support
  'ethereum-mainnet'::text,
  'polygon-mainnet'::text,
  'morph-holesky'::text,
  'morph-mainnet'::text,
  'base'::text,
  'base-sepolia'::text,
  'arbitrum'::text,
  'arbitrum-sepolia'::text,
  'optimism'::text,
  'optimism-sepolia'::text
])));
