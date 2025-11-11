-- Check the actual database record for Hedera Pay 3
SELECT 
  name,
  object_type,
  fee_type,
  interaction_fee_amount,
  interaction_fee_usdfc,
  interaction_fee_token,
  currency_type,
  token_symbol,
  created_at
FROM deployed_objects
WHERE name LIKE '%Hedera Pay%'
ORDER BY created_at DESC
LIMIT 5;

-- Also check what fee_type values exist
SELECT 
  fee_type,
  COUNT(*) as count
FROM deployed_objects
GROUP BY fee_type;
