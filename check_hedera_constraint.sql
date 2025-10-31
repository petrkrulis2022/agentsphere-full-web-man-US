-- Check if Hedera Testnet is in the current database constraints
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name IN ('valid_network_clean', 'valid_deployment_network_clean')
  AND constraint_schema = 'public'
ORDER BY constraint_name;

-- Also check what networks are currently deployed
SELECT DISTINCT network, COUNT(*) as count
FROM deployed_objects 
WHERE network IS NOT NULL
GROUP BY network 
ORDER BY count DESC;
