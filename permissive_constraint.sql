-- Permissive constraint - includes more potential values
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_object_type 
CHECK (
  object_type IS NULL OR 
  object_type IN (
    -- Component values
    'intelligent_assistant', 'local_services', 'payment_terminal',
    'game_agent', '3d_world_builder', 'home_security',
    'content_creator', 'real_estate_broker', 'bus_stop_agent',
    'trailing_payment_terminal', 'my_ghost',
    -- Legacy values  
    'ai_agent', 'study_buddy', 'tutor', 'landmark', 'building',
    -- Possible additional values that might exist
    'Intelligent Assistant', 'Local Services', 'Payment Terminal',
    'Game Agent', '3D World Builder', 'Home Security', 
    'Content Creator', 'Real Estate Broker', 'Bus Stop Agent',
    'Trailing Payment Terminal', 'My Ghost'
  )
);

SELECT 'Permissive constraint added successfully' as status;
