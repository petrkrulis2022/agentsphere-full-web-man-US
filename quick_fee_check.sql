-- Quick check for the most recent agent deployment
SELECT 
    id,
    name,
    interaction_fee_amount,
    interaction_fee_usdfc,
    interaction_fee_token,
    token_symbol,
    deployment_network_name,
    created_at
FROM deployed_objects 
WHERE name LIKE '%Cube Sepolia%' OR name LIKE '%dev account%'
ORDER BY created_at DESC 
LIMIT 3;
