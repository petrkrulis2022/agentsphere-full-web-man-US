-- ============================================
-- URGENT: Add fee_type column to deployed_objects
-- Copy and paste this entire script into Supabase SQL Editor
-- ============================================

-- Step 1: Add fee_type column with default value
ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS fee_type VARCHAR(10) DEFAULT 'fixed';

-- Step 2: Add constraint to ensure only valid fee types
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_fee_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_fee_type 
CHECK (fee_type IN ('fixed', 'dynamic'));

-- Step 3: Update existing Payment Terminal agents
-- Set fee_type based on current fee configuration
UPDATE deployed_objects 
SET fee_type = CASE
  WHEN (object_type = 'payment_terminal' OR object_type = 'trailing_payment_terminal') 
       AND (interaction_fee_amount IS NULL OR interaction_fee_amount = 0) 
  THEN 'dynamic'
  ELSE 'fixed'
END
WHERE object_type IN ('payment_terminal', 'trailing_payment_terminal');

-- Step 4: Set default for all other existing agents
UPDATE deployed_objects 
SET fee_type = 'fixed'
WHERE fee_type IS NULL;

-- Step 5: Verify the migration
SELECT 
  'Migration Complete!' as status,
  COUNT(*) as total_agents,
  COUNT(CASE WHEN fee_type = 'fixed' THEN 1 END) as fixed_fee_agents,
  COUNT(CASE WHEN fee_type = 'dynamic' THEN 1 END) as dynamic_fee_agents
FROM deployed_objects;

-- Step 6: Check Payment Terminal agents specifically
SELECT 
  object_type,
  fee_type,
  COUNT(*) as count
FROM deployed_objects
WHERE object_type IN ('payment_terminal', 'trailing_payment_terminal')
GROUP BY object_type, fee_type
ORDER BY object_type, fee_type;

-- ============================================
-- DONE! The fee_type column is now ready.
-- You can now deploy Payment Terminal agents with dynamic fees!
-- ============================================
