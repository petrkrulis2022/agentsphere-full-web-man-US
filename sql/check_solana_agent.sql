-- Check the deployed Solana agent data
SELECT 
  name,
  deployment_network_name,
  network,
  chain_id,
  deployment_chain_id,
  agent_wallet_type,
  agent_wallet_address,
  deployer_address,
  owner_wallet,
  user_id,
  token_address,
  payment_config
FROM deployed_objects
WHERE agent_wallet_type = 'solana_wallet'
ORDER BY deployed_at DESC
LIMIT 1;
