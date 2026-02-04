-- Query for POS 4 agent details
SELECT 
  id,
  name,
  agent_type,
  latitude,
  longitude,
  evm_chain_id,
  evm_chain_name,
  solana_network,
  hedera_network,
  ens_payment_enabled,
  ens_domain,
  ens_resolved_address,
  ens_resolver_network,
  ens_verified,
  interaction_fee,
  selected_token,
  wallet_address,
  created_at,
  updated_at
FROM deployed_objects
WHERE name ILIKE '%pos%4%' 
   OR name ILIKE '%pos 4%'
   OR name ILIKE '%terminal%4%'
   OR id = 4
ORDER BY created_at DESC
LIMIT 5;
