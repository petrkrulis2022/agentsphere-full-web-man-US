-- ============================================
-- DEPLOYED AGENTS QUERY COLLECTION
-- ============================================

-- 1. GET ALL ACTIVE AGENTS
-- Returns all active deployed agents ordered by creation date
SELECT *
FROM deployed_objects
WHERE is_active = true
ORDER BY created_at DESC;

-- 2. GET AGENTS WITH BASIC INFO
-- Returns essential agent information only
SELECT 
    id,
    name,
    description,
    object_type,
    agent_identity_wallet,
    agent_identity_type,
    deployment_network_name,
    deployment_chain_id,
    deployment_status,
    latitude,
    longitude,
    address,
    is_active,
    created_at
FROM deployed_objects
WHERE is_active = true
ORDER BY created_at DESC;

-- 3. GET AGENT BY ID
-- Replace 'AGENT_ID_HERE' with actual agent ID
SELECT *
FROM deployed_objects
WHERE id = 'AGENT_ID_HERE';

-- 4. GET AGENTS BY NETWORK
-- Replace 'NETWORK_NAME' with actual network (e.g., 'Polygon Amoy', 'Hedera Testnet')
SELECT *
FROM deployed_objects
WHERE deployment_network_name = 'NETWORK_NAME'
  AND is_active = true
ORDER BY created_at DESC;

-- 5. GET AGENTS BY OWNER WALLET
-- Replace 'WALLET_ADDRESS' with actual wallet address
SELECT *
FROM deployed_objects
WHERE agent_identity_wallet = 'WALLET_ADDRESS'
  AND is_active = true
ORDER BY created_at DESC;

-- 6. SEARCH AGENTS BY NAME
-- Replace 'search_term' with actual search text
SELECT *
FROM deployed_objects
WHERE name ILIKE '%search_term%'
  AND is_active = true
ORDER BY created_at DESC;

-- 7. SEARCH AGENTS BY NAME OR DESCRIPTION
SELECT *
FROM deployed_objects
WHERE (name ILIKE '%search_term%' OR description ILIKE '%search_term%')
  AND is_active = true
ORDER BY created_at DESC;

-- 8. GET AGENTS WITH PAGINATION
-- Returns 10 agents per page, adjust LIMIT and OFFSET as needed
SELECT *
FROM deployed_objects
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;  -- Page 1: OFFSET 0, Page 2: OFFSET 10, Page 3: OFFSET 20, etc.

-- 9. GET AGENTS BY OBJECT TYPE
-- Replace 'object_type_value' with actual type (e.g., 'ai_agent', 'nft', etc.)
SELECT *
FROM deployed_objects
WHERE object_type = 'object_type_value'
  AND is_active = true
ORDER BY created_at DESC;

-- 10. GET AGENTS WITH FEE INFORMATION
SELECT 
    id,
    name,
    agent_identity_wallet,
    deployment_network_name,
    interaction_fee_amount,
    interaction_fee_token,
    payment_methods,
    is_active
FROM deployed_objects
WHERE is_active = true
ORDER BY interaction_fee_amount::numeric DESC;

-- 11. GET AGENTS NEAR A LOCATION (requires PostGIS or manual distance calculation)
-- Replace lat/lng values with your target location
-- This uses a simple bounding box (not exact distance)
SELECT *,
    (
        6371 * acos(
            cos(radians(YOUR_LATITUDE)) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(YOUR_LONGITUDE)) + 
            sin(radians(YOUR_LATITUDE)) * 
            sin(radians(latitude))
        )
    ) AS distance_km
FROM deployed_objects
WHERE is_active = true
  AND latitude BETWEEN (YOUR_LATITUDE - 0.1) AND (YOUR_LATITUDE + 0.1)
  AND longitude BETWEEN (YOUR_LONGITUDE - 0.1) AND (YOUR_LONGITUDE + 0.1)
ORDER BY distance_km
LIMIT 50;

-- 12. COUNT AGENTS BY NETWORK
SELECT 
    deployment_network_name,
    COUNT(*) as agent_count
FROM deployed_objects
WHERE is_active = true
GROUP BY deployment_network_name
ORDER BY agent_count DESC;

-- 13. COUNT AGENTS BY STATUS
SELECT 
    deployment_status,
    COUNT(*) as count
FROM deployed_objects
GROUP BY deployment_status
ORDER BY count DESC;

-- 14. GET AGENT STATISTICS
SELECT 
    COUNT(*) as total_agents,
    COUNT(*) FILTER (WHERE is_active = true) as active_agents,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_agents,
    COUNT(DISTINCT deployment_network_name) as unique_networks,
    COUNT(DISTINCT agent_identity_wallet) as unique_owners
FROM deployed_objects;

-- 15. GET RECENTLY CREATED AGENTS (Last 24 hours)
SELECT *
FROM deployed_objects
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND is_active = true
ORDER BY created_at DESC;

-- 16. GET RECENTLY UPDATED AGENTS
SELECT *
FROM deployed_objects
WHERE updated_at > NOW() - INTERVAL '7 days'
  AND is_active = true
ORDER BY updated_at DESC;

-- 17. GET AGENTS BY MULTIPLE NETWORKS
SELECT *
FROM deployed_objects
WHERE deployment_network_name IN ('Polygon Amoy', 'Hedera Testnet', 'Solana Devnet')
  AND is_active = true
ORDER BY deployment_network_name, created_at DESC;

-- 18. GET AGENTS WITH SPECIFIC PAYMENT METHOD
-- Queries JSONB payment_methods field
SELECT *
FROM deployed_objects
WHERE is_active = true
  AND payment_methods IS NOT NULL
  AND (
    payment_methods->>'revolut' IS NOT NULL OR
    payment_methods->>'crypto' IS NOT NULL
  )
ORDER BY created_at DESC;

-- 19. GET AGENTS IN A SPECIFIC LOCATION AREA
-- Bounding box query for map view
SELECT *
FROM deployed_objects
WHERE is_active = true
  AND latitude BETWEEN 40.0 AND 41.0    -- Min and max latitude
  AND longitude BETWEEN -74.0 AND -73.0  -- Min and max longitude
ORDER BY created_at DESC;

-- 20. GET DETAILED AGENT INFO WITH ALL FIELDS
SELECT 
    id,
    name,
    description,
    object_type,
    agent_identity_wallet,
    agent_identity_type,
    deployment_network_name,
    deployment_chain_id,
    deployment_status,
    interaction_fee_amount,
    interaction_fee_token,
    payment_methods,
    latitude,
    longitude,
    address,
    is_active,
    created_at,
    updated_at,
    -- Add any custom fields you have
    model_url,
    qr_code_id,
    metadata
FROM deployed_objects
WHERE is_active = true
ORDER BY created_at DESC;

-- 21. GET AGENTS WITH COUNT
SELECT 
    *,
    COUNT(*) OVER() as total_count
FROM deployed_objects
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- 22. GET AGENTS BY CHAIN ID
SELECT *
FROM deployed_objects
WHERE deployment_chain_id = '80002'  -- Polygon Amoy
  AND is_active = true
ORDER BY created_at DESC;

-- 23. GET TOP AGENTS BY NETWORK
-- Gets the 5 most recent agents per network
SELECT *
FROM (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY deployment_network_name 
               ORDER BY created_at DESC
           ) as rn
    FROM deployed_objects
    WHERE is_active = true
) t
WHERE rn <= 5
ORDER BY deployment_network_name, created_at DESC;

-- 24. FULL TEXT SEARCH (if you have GIN index on name/description)
SELECT *
FROM deployed_objects
WHERE is_active = true
  AND (
    to_tsvector('english', name || ' ' || description) @@ 
    plainto_tsquery('english', 'search terms here')
  )
ORDER BY created_at DESC;

-- 25. GET AGENTS WITH NULL/MISSING DATA
-- Useful for data quality checks
SELECT *
FROM deployed_objects
WHERE is_active = true
  AND (
    agent_identity_wallet IS NULL OR
    deployment_network_name IS NULL OR
    latitude IS NULL OR
    longitude IS NULL
  )
ORDER BY created_at DESC;

-- 26. GET AGENT DEPLOYMENT TIMELINE
-- Groups agents by date
SELECT 
    DATE(created_at) as deployment_date,
    COUNT(*) as agents_deployed,
    array_agg(name) as agent_names
FROM deployed_objects
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY deployment_date DESC;

-- 27. GET AGENTS WITH INTERACTION FEES IN RANGE
SELECT *
FROM deployed_objects
WHERE is_active = true
  AND interaction_fee_amount::numeric BETWEEN 0.1 AND 10.0
ORDER BY interaction_fee_amount::numeric ASC;

-- 28. GET UNIQUE NETWORKS LIST
SELECT DISTINCT deployment_network_name
FROM deployed_objects
WHERE is_active = true
ORDER BY deployment_network_name;

-- 29. GET AGENT COUNT BY OWNER
SELECT 
    agent_identity_wallet,
    COUNT(*) as agent_count,
    array_agg(name) as agent_names
FROM deployed_objects
WHERE is_active = true
GROUP BY agent_identity_wallet
ORDER BY agent_count DESC;

-- 30. ADVANCED SEARCH WITH MULTIPLE FILTERS
-- Adjust filters as needed
SELECT *
FROM deployed_objects
WHERE is_active = true
  AND deployment_network_name = 'Polygon Amoy'
  AND object_type = 'ai_agent'
  AND agent_identity_wallet LIKE '0x%'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 20;
