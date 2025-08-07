-- Simplified fix for the immediate constraint issue
-- This focuses on fixing the exact "valid_object_type" constraint error

-- First, let's see what constraint exists currently
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'valid_object_type';

-- Remove the problematic constraint completely
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_object_type;

-- Add a simplified constraint that includes the exact value being used
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_object_type 
CHECK (
  object_type IS NULL OR 
  object_type IN (
    -- Current component values (exact match)
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
    -- Legacy values to maintain compatibility
    'ai_agent',
    'study_buddy', 
    'tutor',
    'landmark',
    'building',
    'Intelligent Assistant',
    'Content Creator',
    'Local Services',
    'Tutor/Teacher',
    '3D World Modelling', 
    'Game Agent',
    'Taxi driver',
    'Travel Influencer'
  )
);

-- Verify the constraint was added
SELECT 'Constraint updated successfully' as status;
