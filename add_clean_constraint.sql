-- Add back a proper constraint now that deployment is working
-- This ensures data integrity while supporting all your component's agent types

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_object_type 
CHECK (
  object_type IS NULL OR 
  object_type IN (
    -- Current component values (exact match to DeployObject.tsx)
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
    'my_ghost',
    -- Legacy values for backward compatibility
    'ai_agent',
    'study_buddy', 
    'tutor',
    'landmark',
    'building'
  )
);

SELECT 'Clean constraint added successfully' as status;
