-- Fix agent types constraint to match the values used in the component
-- This updates the valid_object_type constraint to include all agent types from DeployObject.tsx

ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_object_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_object_type 
CHECK ((object_type IS NULL) OR (object_type = ANY (ARRAY[
  -- Original types
  'ai_agent'::text, 
  'study_buddy'::text, 
  'tutor'::text, 
  'landmark'::text, 
  'building'::text,
  -- Existing properly cased types
  'Intelligent Assistant'::text,
  'Content Creator'::text,
  'Local Services'::text,
  'Tutor/Teacher'::text,
  '3D World Modelling'::text,
  'Game Agent'::text,
  'Taxi driver'::text,
  'Travel Influencer'::text,
  -- New types from component (snake_case values)
  'intelligent_assistant'::text,
  'local_services'::text,
  'payment_terminal'::text,
  'game_agent'::text,
  '3d_world_builder'::text,
  'home_security'::text,
  'content_creator'::text,
  'real_estate_broker'::text,
  'bus_stop_agent'::text,
  'trailing_payment_terminal'::text,
  'my_ghost'::text
])));

-- Update location types to include Property and better support for trailing agents
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
  'Property'::character varying,
  'Car'::character varying
])::text[]));

-- Update currency/token constraint to include all supported stablecoins
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_currency_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_currency_type 
CHECK ((currency_type IS NULL) OR (currency_type = ANY (ARRAY[
  'USDFC'::text, 
  'AURAS'::text,
  'BDAG'::text,
  -- Stablecoins from component
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

-- Update token_symbol constraint as well
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_token_symbol;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_token_symbol 
CHECK ((token_symbol IS NULL) OR (token_symbol = ANY (ARRAY[
  'USDFC'::text, 
  'AURAS'::text,
  'BDAG'::text,
  -- Stablecoins from component
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

-- Update network constraint to include blockdag-testnet (matching component)
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
  'blockdag-testnet'::text
])));

-- Success message
SELECT 'Agent types constraint updated successfully! All component values are now supported.' as status;
