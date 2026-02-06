/*
  Fix Agent Type Normalization
  
  - Fixes string "null" values in agent_type column
  - Converts home_security to virtual_terminal
  - Updates constraint to remove home_security
  
  Date: February 5, 2026
  Status: Critical Fix
*/

-- Step 1: Fix agents with string "null" in agent_type
-- Set actual NULL instead of string "null"
UPDATE deployed_objects 
SET agent_type = NULL
WHERE agent_type = 'null';

-- Step 2: Convert all home_security to virtual_terminal
UPDATE deployed_objects 
SET object_type = 'virtual_terminal',
    agent_type = 'virtual_terminal'
WHERE object_type = 'home_security';

-- Step 3: Update valid_agent_type constraint
-- Remove home_security, ensure virtual_terminal is included
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_agent_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_agent_type 
CHECK ((agent_type IS NULL) OR (agent_type = ANY (ARRAY[
  'Intelligent Assistant'::text,
  'Local Services'::text, 
  'Payment Terminal'::text,
  'Trailing Payment Terminal'::text,
  'My Ghost'::text,
  'Game Agent'::text,
  '3D World Builder'::text,
  'Virtual Terminal'::text,
  'Content Creator'::text,
  'Real Estate Broker'::text,
  'Bus Stop Agent'::text,
  'ai_agent'::text, 
  'study_buddy'::text, 
  'tutor'::text, 
  'landmark'::text, 
  'building'::text
])));

-- Step 4: Update valid_object_type constraint if it exists
-- Remove home_security, ensure virtual_terminal is included
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_object_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_object_type 
CHECK ((object_type IS NULL) OR (object_type = ANY (ARRAY[
  'Intelligent Assistant'::text,
  'Local Services'::text, 
  'Payment Terminal'::text,
  'Trailing Payment Terminal'::text,
  'My Ghost'::text,
  'Game Agent'::text,
  '3D World Builder'::text,
  'Virtual Terminal'::text,
  'Content Creator'::text,
  'Real Estate Broker'::text,
  'Bus Stop Agent'::text,
  'ai_agent'::text, 
  'study_buddy'::text, 
  'tutor'::text, 
  'landmark'::text, 
  'building'::text
])));

-- Success message
SELECT 'Agent Type Normalization Complete!' as status;
