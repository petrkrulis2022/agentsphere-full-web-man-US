-- Clean Slate Solution - Keep all current component agent types
-- This matches exactly what DeployObject.tsx sends to the database

-- Step 1: Delete all existing records
DELETE FROM deployed_objects;

-- Step 2: Add constraint with ALL current component values (snake_case)
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_object_type 
CHECK (
  object_type IS NULL OR 
  object_type IN (
    'intelligent_assistant',
    'local_services',
    'payment_terminal', 
    'game_agent',
    '3d_world_builder',
    'home_security',
    'content_creator',
    'real_estate_broker',
    'bus_stop_agent',
    'trailing_payment_terminal',
    'my_ghost'
  )
);

-- Step 3: Verify the setup
SELECT 
  'Database cleaned and constraint added for all current agent types' as status,
  COUNT(*) as remaining_records 
FROM deployed_objects;

-- Step 4: Show what types are now allowed
SELECT unnest(ARRAY[
  'intelligent_assistant',
  'local_services', 
  'payment_terminal',
  'game_agent',
  '3d_world_builder', 
  'home_security',
  'content_creator',
  'real_estate_broker',
  'bus_stop_agent',
  'trailing_payment_terminal',
  'my_ghost'
]) as allowed_object_types;
