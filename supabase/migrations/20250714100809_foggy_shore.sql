/*
  # Add trailing agent and interaction fields

  1. New Columns
    - `trailing_agent` (boolean) - Whether the agent follows the user's location
    - `interaction_range` (numeric) - Range in meters for user interactions
    - `ar_notifications` (boolean) - Whether AR notifications are enabled

  2. Updates
    - Add new agent types: 'Taxi driver', 'Travel Influencer'
    - Add new location type: 'Car'
    - Update constraints to include new values
*/

-- Add new columns for trailing agent functionality
ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS trailing_agent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS interaction_range numeric(5,2) DEFAULT 15.0,
ADD COLUMN IF NOT EXISTS ar_notifications boolean DEFAULT true;

-- Update the valid_object_type constraint to include new agent types
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
  'Travel Influencer'::text
])));

-- Update the valid_location_type constraint to include 'Car'
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
  'Car'::character varying
])::text[]));

-- Add constraint for interaction_range
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_interaction_range 
CHECK ((interaction_range >= 1.0) AND (interaction_range <= 25.0));

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_deployed_objects_trailing_agent 
ON deployed_objects (trailing_agent) 
WHERE (trailing_agent = true);

CREATE INDEX IF NOT EXISTS idx_deployed_objects_interaction_range 
ON deployed_objects (interaction_range);

-- Update currency type constraint to include BDAG
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_currency_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_currency_type 
CHECK ((currency_type IS NULL) OR (currency_type = ANY (ARRAY[
  'USDFC'::text, 
  'AURAS'::text,
  'BDAG'::text
])));

-- Update network constraint to include BlockDAG testnet
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