/*
  Fix ARTM Object Type Constraint
  
  Adds 'home_security' to valid_object_type constraint if it exists
  and is causing issues with ARTM agent deployment.
  
  Date: February 5, 2026
*/

-- Step 1: Drop existing valid_object_type constraint if it exists
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_object_type;

-- Step 2: Create new valid_object_type constraint that includes home_security
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
  'Home Security'::text,
  'home_security'::text,
  'Content Creator'::text,
  'Real Estate Broker'::text,
  'Bus Stop Agent'::text,
  'Virtual Terminal'::text,
  'ai_agent'::text, 
  'study_buddy'::text, 
  'tutor'::text, 
  'landmark'::text, 
  'building'::text
])));

SELECT 'ARTM object_type constraint fixed!' as status;
