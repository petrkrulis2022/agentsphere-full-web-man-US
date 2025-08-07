-- Fix approach: Update existing data first, then add constraint

-- Step 1: First, let's see what data we have
SELECT DISTINCT object_type, COUNT(*) as count
FROM deployed_objects 
GROUP BY object_type
ORDER BY count DESC;

-- Step 2: Update any problematic existing data to valid values
-- (Only run this if you see invalid values in Step 1 results)
-- UPDATE deployed_objects 
-- SET object_type = 'intelligent_assistant' 
-- WHERE object_type NOT IN (
--     'intelligent_assistant', 'local_services', 'payment_terminal', 
--     'game_agent', '3d_world_builder', 'home_security', 
--     'content_creator', 'real_estate_broker', 'bus_stop_agent',
--     'trailing_payment_terminal', 'my_ghost', 'ai_agent', 
--     'study_buddy', 'tutor', 'landmark', 'building'
-- ) AND object_type IS NOT NULL;

-- Step 3: Then add the constraint
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_object_type 
CHECK (
  object_type IS NULL OR 
  object_type IN (
    'intelligent_assistant', 'local_services', 'payment_terminal',
    'game_agent', '3d_world_builder', 'home_security',
    'content_creator', 'real_estate_broker', 'bus_stop_agent',
    'trailing_payment_terminal', 'my_ghost', 'ai_agent',
    'study_buddy', 'tutor', 'landmark', 'building'
  )
);

SELECT 'Constraint added successfully' as status;
