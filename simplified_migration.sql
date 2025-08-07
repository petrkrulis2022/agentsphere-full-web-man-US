-- AgentSphere Missing Columns Migration
-- Execute this in Supabase SQL Editor

-- Add the 3 missing columns identified by the analysis
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS token_address VARCHAR(42);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS token_symbol VARCHAR(10);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS chain_id INTEGER;

-- Update existing records with default values
UPDATE deployed_objects 
SET 
  chain_id = 2810,  -- Morph Holesky default
  token_address = '0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98',  -- USDT on Morph Holesky
  token_symbol = 'USDT'
WHERE 
  chain_id IS NULL 
  OR token_address IS NULL
  OR token_symbol IS NULL;

-- Add enhanced stablecoin support to currency_type constraint
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_currency_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_currency_type 
CHECK ((currency_type IS NULL) OR (currency_type = ANY (ARRAY[
  'USDFC'::text, 
  'AURAS'::text,
  'BDAG'::text,
  'USDT'::text,
  'USDC'::text,
  'USDs'::text,
  'USDBG+'::text,
  'USDe'::text,
  'LSTD+'::text,
  'AIX'::text,
  'PYUSD'::text,
  'RLUSD'::text,
  'USDD'::text,
  'GHO'::text,
  'USDx'::text
])));

-- Add new agent types to object_type constraint
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_object_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_object_type 
CHECK ((object_type IS NULL) OR (object_type = ANY (ARRAY[
  'ai_agent'::text, 
  'study_buddy'::text, 
  'tutor'::text, 
  'landmark'::text, 
  'building'::text,
  'Intelligent Assistant'::text,
  'Content Creator'::text,
  'Local Services'::text,
  'Tutor/Teacher'::text,
  '3D World Modelling'::text,
  'Game Agent'::text,
  'Taxi driver'::text,
  'Travel Influencer'::text,
  'Payment Terminal'::text,
  'Trailing Payment Terminal'::text,
  'My Ghost'::text,
  '3D World Builder'::text,
  'Home Security'::text,
  'Real Estate Broker'::text,
  'Bus Stop Agent'::text
])));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_deployed_objects_token_symbol 
ON deployed_objects (token_symbol) 
WHERE token_symbol IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_chain_id 
ON deployed_objects (chain_id) 
WHERE chain_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_token_address 
ON deployed_objects (token_address) 
WHERE token_address IS NOT NULL;
