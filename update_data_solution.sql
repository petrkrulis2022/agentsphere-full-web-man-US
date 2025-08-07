-- Option 2: Update existing data to match current component types

-- Update old Title Case to snake_case
UPDATE deployed_objects 
SET object_type = CASE 
    WHEN object_type = 'Intelligent Assistant' THEN 'intelligent_assistant'
    WHEN object_type = 'Bus Stop Agent' THEN 'bus_stop_agent'  
    WHEN object_type = 'Content Creator' THEN 'content_creator'
    WHEN object_type = 'ai_agent' THEN 'intelligent_assistant'  -- Convert old ai_agent to new format
    WHEN object_type = 'study_buddy' THEN 'intelligent_assistant'  -- Convert study_buddy to new format
    WHEN object_type = 'tutor' THEN 'intelligent_assistant'  -- Convert tutor to new format
    ELSE object_type
END;

-- Add constraint after updating data
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

SELECT 'Data updated and constraint added successfully' as status;
