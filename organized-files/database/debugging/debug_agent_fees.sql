-- Debug Agent Interaction Fees
-- Check what fee data is actually stored in the database

-- 1. Check the most recent agents and their fee fields
SELECT 
    id,
    name,
    interaction_fee_amount,
    interaction_fee_usdfc, 
    interaction_fee_token,
    token_symbol,
    deployment_network_name,
    deployment_chain_id,
    created_at
FROM deployed_objects 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check if interaction_fee_amount column exists and has data
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
    AND column_name LIKE '%fee%'
ORDER BY column_name;

-- 3. Check for any NULL values in fee fields
SELECT 
    COUNT(*) as total_agents,
    COUNT(interaction_fee_amount) as has_fee_amount,
    COUNT(interaction_fee_usdfc) as has_fee_usdfc,
    COUNT(interaction_fee_token) as has_fee_token
FROM deployed_objects;

-- 4. Check the agent you just deployed (most recent)
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
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC 
LIMIT 1;
