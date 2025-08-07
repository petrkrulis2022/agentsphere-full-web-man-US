/*
  # AgentSphere Enhancement: New Agent Types, Stablecoins & Multi-Blockchain Support

  1. Agent Type Updates
    - Add new agent categories for comprehensive marketplace
    - Support conditional types based on trailing agent setting
    - Enhanced business and utility agent options

  2. Location Type Updates
    - Add 'Property' for real estate and property-based agents
    - Expand deployment environment options

  3. Stablecoin Support
    - Add comprehensive stablecoin options
    - Support for multiple token standards
    - Cross-chain compatibility preparation

  4. Token Address Management
    - Add token contract address storage
    - Add token symbol for easy reference
    - Add chain ID for multi-blockchain support
*/

-- Update object_type constraint with new agent categories
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_object_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_object_type 
CHECK ((object_type IS NULL) OR (object_type = ANY (ARRAY[
  -- Legacy types (maintain compatibility)
  'ai_agent'::text, 
  'study_buddy'::text, 
  'tutor'::text, 
  'landmark'::text, 
  'building'::text,
  -- Enhanced agent categories
  'Intelligent Assistant'::text,
  'Local Services'::text, 
  'Payment Terminal'::text,
  'Trailing Payment Terminal'::text,
  'My Ghost'::text,
  'Game Agent'::text,
  '3D World Builder'::text,
  'Home Security'::text,
  'Content Creator'::text,
  'Real Estate Broker'::text,
  'Bus Stop Agent'::text,
  -- Previous enhanced types
  'Taxi driver'::text,
  'Travel Influencer'::text
])));

-- Update location_type constraint to include 'Property'
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_location_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_location_type 
CHECK ((location_type)::text = ANY ((ARRAY[
  'Home'::character varying, 
  'Street'::character varying, 
  'Countryside'::character varying, 
  'Classroom'::character varying, 
  'Office'::character varying,
  'Car'::character varying,
  'Property'::character varying
])::text[]));

-- Add token management columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'token_address'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN token_address VARCHAR(42);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'token_symbol'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN token_symbol VARCHAR(10);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'chain_id'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN chain_id INTEGER;
  END IF;
END $$;

-- Add altitude column for RTK Enhanced Location with Altitude
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'altitude'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN altitude DECIMAL(10,6);
  END IF;
END $$;

-- Update currency_type constraint with comprehensive stablecoin support
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_currency_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_currency_type 
CHECK ((currency_type IS NULL) OR (currency_type = ANY (ARRAY[
  -- Legacy currencies
  'USDFC'::text, 
  'AURAS'::text,
  'BDAG'::text,
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

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_deployed_objects_token_symbol 
ON deployed_objects (token_symbol) 
WHERE token_symbol IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_chain_id 
ON deployed_objects (chain_id) 
WHERE chain_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_token_address 
ON deployed_objects (token_address) 
WHERE token_address IS NOT NULL;

-- Add comments for new columns
COMMENT ON COLUMN deployed_objects.token_address IS 'Smart contract address for the selected stablecoin token';
COMMENT ON COLUMN deployed_objects.token_symbol IS 'Symbol of the selected stablecoin (e.g., USDT, USDC)';
COMMENT ON COLUMN deployed_objects.chain_id IS 'Blockchain network chain ID for multi-chain support';

-- Backfill existing agents with default values
UPDATE deployed_objects 
SET 
  altitude = 0.0,
  chain_id = 2810,  -- Morph Holesky
  token_address = '0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98',  -- USDT on Morph Holesky
  token_symbol = 'USDT',
  currency_type = 'USDT'
WHERE 
  altitude IS NULL 
  OR chain_id IS NULL 
  OR token_address IS NULL
  OR token_symbol IS NULL
  OR currency_type = 'BDAG';  -- Migrate from BDAG to USDT

-- Add constraint for valid token address format (Ethereum-compatible)
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_token_address_format 
CHECK (
  (token_address IS NULL) OR 
  (token_address ~ '^0x[a-fA-F0-9]{40}$')
);
