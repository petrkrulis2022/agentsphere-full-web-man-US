-- Fix network constraint violation by normalizing existing data first
-- Update existing rows to use consistent network naming before adding constraint

-- Step 1: Check what network values currently exist (for debugging)
-- Run this separately to see what needs to be updated:
-- SELECT DISTINCT network FROM deployed_objects WHERE network IS NOT NULL;

-- Step 2: Normalize existing network values to consistent format
UPDATE deployed_objects 
SET network = 'morph-holesky-testnet' 
WHERE network IN ('Morph Holesky Testnet', 'Morph Holesky', 'morph-holesky', 'morph_holesky_testnet');

-- Step 3: Drop existing constraint
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_network;

-- Step 4: Add new constraint with consistent naming
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
  'morph-holesky-testnet'::text
])));
