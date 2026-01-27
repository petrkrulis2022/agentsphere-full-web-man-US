-- Update Agent Types Labels Migration
-- This migration updates the agent_type constraint to include new label names
-- and all Hedera AI agent types

-- Drop the existing constraint
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_agent_type;

-- Add updated constraint with new labels
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_agent_type 
CHECK ((agent_type IS NULL) OR (agent_type = ANY (ARRAY[
  -- Legacy types (maintain compatibility)
  'ai_agent'::text, 
  'study_buddy'::text, 
  'tutor'::text, 
  'landmark'::text, 
  'building'::text,
  -- Enhanced agent categories (updated labels)
  'My Payment Terminal'::text,
  'Payment Terminal - POS'::text,
  'Virtual ATM'::text,
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
  'Travel Influencer'::text,
  -- Hedera AI Travel Agents
  '🚌 Bus Agent (Hedera AI)'::text,
  '🚆 Train Agent (Hedera AI)'::text,
  '🏨 Hotel Agent (Hedera AI)'::text,
  '✈️ Flight Agent (Hedera AI)'::text,
  '🍽️ Restaurant Agent (Hedera AI)'::text,
  '🌍 Travel Coordinator (Hedera AI)'::text
])));

COMMENT ON CONSTRAINT valid_agent_type ON deployed_objects IS 
'Updated agent type constraint with new payment terminal labels and Hedera AI types';
