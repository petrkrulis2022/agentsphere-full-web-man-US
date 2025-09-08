-- Verify the migration was applied by checking column structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
AND column_name IN ('interaction_fee_amount', 'interaction_fee_token')
ORDER BY column_name;

-- Also check if we have any data in these new columns
SELECT 
  id,
  name,
  interaction_fee_amount,
  interaction_fee_token,
  interaction_fee_usdfc,
  created_at
FROM deployed_objects 
WHERE interaction_fee_amount IS NOT NULL OR interaction_fee_token IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
