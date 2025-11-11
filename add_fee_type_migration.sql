-- Migration: Add fee_type column to deployed_objects table
-- Purpose: Support dynamic vs fixed fees for Payment Terminal agents
-- Date: 2025-11-11

-- Step 1: Add fee_type column with default value
ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS fee_type VARCHAR(10) DEFAULT 'fixed';

-- Step 2: Add constraint to ensure only valid fee types
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_fee_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_fee_type 
CHECK (fee_type IN ('fixed', 'dynamic'));

-- Step 3: Update existing Payment Terminal and Trailing Payment Terminal agents
-- Set fee_type to 'dynamic' for agents that currently have no fee or fee is NULL
-- Set fee_type to 'fixed' for agents with a specific fee amount

UPDATE deployed_objects 
SET fee_type = CASE
  WHEN (object_type = 'payment_terminal' OR object_type = 'trailing_payment_terminal') 
       AND (interaction_fee_amount IS NULL OR interaction_fee_amount = 0) THEN 'dynamic'
  ELSE 'fixed'
END
WHERE object_type IN ('payment_terminal', 'trailing_payment_terminal');

-- Step 4: Verify the migration
SELECT 
  object_type,
  fee_type,
  interaction_fee_amount,
  COUNT(*) as count
FROM deployed_objects
WHERE object_type IN ('payment_terminal', 'trailing_payment_terminal')
GROUP BY object_type, fee_type, interaction_fee_amount
ORDER BY object_type, fee_type;

-- Expected results:
-- - Agents with fee_type = 'fixed' should have a non-null interaction_fee_amount
-- - Agents with fee_type = 'dynamic' should have NULL or 0 interaction_fee_amount
