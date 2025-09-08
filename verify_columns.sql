-- Verify column existence and data for "Cube Sepolia 4 dev account"
SELECT 
    name,
    interaction_fee_amount,
    interaction_fee_token,
    interaction_fee_usdfc,
    token_symbol
FROM deployed_objects 
WHERE name = 'Cube Sepolia 4 dev account'
LIMIT 1;

-- Check if columns exist in table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
    AND column_name LIKE '%interaction_fee%'
ORDER BY column_name;
