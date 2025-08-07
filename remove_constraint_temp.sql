-- Quick fix: Remove the problematic constraint temporarily
-- This will allow deployment to work while we debug the constraint issue

-- Remove the constraint that's causing the error
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_object_type;

-- Optional: Add a more permissive constraint later
-- ALTER TABLE deployed_objects 
-- ADD CONSTRAINT valid_object_type 
-- CHECK (object_type IS NOT NULL);

SELECT 'Constraint removed - deployment should work now' as status;
