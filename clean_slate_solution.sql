-- Option 1: Clean slate - Remove all existing agents
-- This gives you a fresh start with the current component structure

-- Check how many agents will be deleted
SELECT COUNT(*) as total_agents_to_delete FROM deployed_objects;

-- Delete all existing agents (uncomment to execute)
-- DELETE FROM deployed_objects;

-- Add the clean constraint for current component types only
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

SELECT 'Clean database ready for current component types' as status;
