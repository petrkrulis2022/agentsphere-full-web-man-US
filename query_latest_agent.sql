-- Get the latest deployed agent with ENS payment
SELECT 
  id,
  name,
  agent_type,
  latitude,
  longitude,
  polygon_chain_id,
  solana_network,
  hedera_network,
  ens_payment_enabled,
  ens_domain,
  ens_resolved_address,
  ens_resolver_network,
  ens_verified,
  created_at
FROM deployed_objects
ORDER BY created_at DESC
LIMIT 1;
