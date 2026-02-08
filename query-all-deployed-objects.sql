-- Query all deployed objects
SELECT 
  id,
  name,
  object_type,
  latitude,
  longitude,
  interaction_fee_amount,
  interaction_fee_usdfc,
  interaction_fee_token,
  fee_type,
  bank_integrations,
  exchange_integrations,
  created_at,
  updated_at
FROM deployed_objects
ORDER BY created_at DESC;
