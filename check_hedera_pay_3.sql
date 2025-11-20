-- Check the actual database record for Hedera Pay 3
SELECT 
  name,
  object_type,
  fee_type,
  interaction_fee_amount,
  interaction_fee_usdfc,
  interaction_fee_token,
  currency_type,
  created_at
FROM deployed_objects
WHERE name = 'Hedera Pay 3'
ORDER BY created_at DESC
LIMIT 1;
