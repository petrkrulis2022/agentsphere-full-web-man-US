-- ============================================
-- SUPABASE RPC FUNCTIONS FOR DEPLOYED AGENTS
-- These are stored procedures that can be called from your app
-- ============================================

-- 1. Function: Search agents with fuzzy matching
CREATE OR REPLACE FUNCTION search_agents(
    search_text TEXT,
    network_filter TEXT DEFAULT NULL,
    limit_count INT DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    deployment_network_name TEXT,
    agent_identity_wallet TEXT,
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.name,
        d.description,
        d.deployment_network_name,
        d.agent_identity_wallet,
        SIMILARITY(d.name || ' ' || d.description, search_text) as similarity_score
    FROM deployed_objects d
    WHERE d.is_active = true
        AND (network_filter IS NULL OR d.deployment_network_name = network_filter)
        AND (d.name ILIKE '%' || search_text || '%' 
             OR d.description ILIKE '%' || search_text || '%')
    ORDER BY similarity_score DESC, d.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('search_agents', { 
--   search_text: 'AI assistant', 
--   network_filter: 'Polygon Amoy' 
-- });


-- 2. Function: Get agents near location with distance
CREATE OR REPLACE FUNCTION get_agents_near_location(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    deployment_network_name TEXT,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.name,
        d.description,
        d.latitude,
        d.longitude,
        d.address,
        d.deployment_network_name,
        (
            6371 * acos(
                cos(radians(lat)) * cos(radians(d.latitude)) * 
                cos(radians(d.longitude) - radians(lng)) + 
                sin(radians(lat)) * sin(radians(d.latitude))
            )
        ) as distance_km
    FROM deployed_objects d
    WHERE d.is_active = true
        AND d.latitude IS NOT NULL
        AND d.longitude IS NOT NULL
    HAVING distance_km <= radius_km
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('get_agents_near_location', { 
--   lat: 40.7128, 
--   lng: -74.0060, 
--   radius_km: 5 
-- });


-- 3. Function: Get network statistics
CREATE OR REPLACE FUNCTION get_network_statistics()
RETURNS TABLE (
    network_name TEXT,
    total_agents BIGINT,
    active_agents BIGINT,
    unique_owners BIGINT,
    avg_fee NUMERIC,
    most_recent_deployment TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.deployment_network_name as network_name,
        COUNT(*) as total_agents,
        COUNT(*) FILTER (WHERE d.is_active = true) as active_agents,
        COUNT(DISTINCT d.agent_identity_wallet) as unique_owners,
        AVG(d.interaction_fee_amount::NUMERIC) as avg_fee,
        MAX(d.created_at) as most_recent_deployment
    FROM deployed_objects d
    GROUP BY d.deployment_network_name
    ORDER BY total_agents DESC;
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('get_network_statistics');


-- 4. Function: Get agent deployment trends
CREATE OR REPLACE FUNCTION get_deployment_trends(
    days_back INT DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    deployments BIGINT,
    networks TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(d.created_at) as date,
        COUNT(*) as deployments,
        ARRAY_AGG(DISTINCT d.deployment_network_name) as networks
    FROM deployed_objects d
    WHERE d.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY DATE(d.created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('get_deployment_trends', { days_back: 7 });


-- 5. Function: Get owner statistics
CREATE OR REPLACE FUNCTION get_owner_statistics(
    wallet_address TEXT
)
RETURNS TABLE (
    total_agents BIGINT,
    active_agents BIGINT,
    networks_used TEXT[],
    total_fees_collected NUMERIC,
    first_deployment TIMESTAMP WITH TIME ZONE,
    latest_deployment TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_agents,
        COUNT(*) FILTER (WHERE is_active = true) as active_agents,
        ARRAY_AGG(DISTINCT deployment_network_name) as networks_used,
        SUM(interaction_fee_amount::NUMERIC) as total_fees_collected,
        MIN(created_at) as first_deployment,
        MAX(created_at) as latest_deployment
    FROM deployed_objects
    WHERE agent_identity_wallet = wallet_address;
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('get_owner_statistics', { 
--   wallet_address: '0x...' 
-- });


-- 6. Function: Get agents in bounding box (for map viewport)
CREATE OR REPLACE FUNCTION get_agents_in_bounds(
    min_lat DOUBLE PRECISION,
    max_lat DOUBLE PRECISION,
    min_lng DOUBLE PRECISION,
    max_lng DOUBLE PRECISION,
    network_filter TEXT DEFAULT NULL
)
RETURNS SETOF deployed_objects AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM deployed_objects d
    WHERE d.is_active = true
        AND d.latitude BETWEEN min_lat AND max_lat
        AND d.longitude BETWEEN min_lng AND max_lng
        AND (network_filter IS NULL OR d.deployment_network_name = network_filter)
    ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('get_agents_in_bounds', { 
--   min_lat: 40.0, max_lat: 41.0, 
--   min_lng: -75.0, max_lng: -73.0 
-- });


-- 7. Function: Get popular agents (by interaction count or other metrics)
-- Note: Requires an interactions table or similar tracking
CREATE OR REPLACE FUNCTION get_popular_agents(
    limit_count INT DEFAULT 10,
    network_filter TEXT DEFAULT NULL
)
RETURNS SETOF deployed_objects AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM deployed_objects d
    WHERE d.is_active = true
        AND (network_filter IS NULL OR d.deployment_network_name = network_filter)
    ORDER BY d.created_at DESC  -- Replace with interaction count when available
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('get_popular_agents', { limit_count: 5 });


-- 8. Function: Get agents by multiple owners
CREATE OR REPLACE FUNCTION get_agents_by_owners(
    wallet_addresses TEXT[]
)
RETURNS SETOF deployed_objects AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM deployed_objects d
    WHERE d.is_active = true
        AND d.agent_identity_wallet = ANY(wallet_addresses)
    ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('get_agents_by_owners', { 
--   wallet_addresses: ['0x...', '0x...'] 
-- });


-- 9. Function: Advanced search with multiple filters
CREATE OR REPLACE FUNCTION search_agents_advanced(
    search_text TEXT DEFAULT NULL,
    network_filter TEXT DEFAULT NULL,
    object_type_filter TEXT DEFAULT NULL,
    min_fee NUMERIC DEFAULT NULL,
    max_fee NUMERIC DEFAULT NULL,
    created_after TIMESTAMP DEFAULT NULL,
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    object_type TEXT,
    deployment_network_name TEXT,
    interaction_fee_amount TEXT,
    agent_identity_wallet TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_agents AS (
        SELECT 
            d.*,
            COUNT(*) OVER() as total_count
        FROM deployed_objects d
        WHERE d.is_active = true
            AND (search_text IS NULL OR 
                 d.name ILIKE '%' || search_text || '%' OR 
                 d.description ILIKE '%' || search_text || '%')
            AND (network_filter IS NULL OR d.deployment_network_name = network_filter)
            AND (object_type_filter IS NULL OR d.object_type = object_type_filter)
            AND (min_fee IS NULL OR d.interaction_fee_amount::NUMERIC >= min_fee)
            AND (max_fee IS NULL OR d.interaction_fee_amount::NUMERIC <= max_fee)
            AND (created_after IS NULL OR d.created_at >= created_after)
        ORDER BY d.created_at DESC
        LIMIT limit_count OFFSET offset_count
    )
    SELECT 
        fa.id,
        fa.name,
        fa.description,
        fa.object_type,
        fa.deployment_network_name,
        fa.interaction_fee_amount,
        fa.agent_identity_wallet,
        fa.latitude,
        fa.longitude,
        fa.created_at,
        fa.total_count
    FROM filtered_agents fa;
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('search_agents_advanced', { 
--   search_text: 'AI', 
--   network_filter: 'Polygon Amoy',
--   min_fee: 0.5,
--   max_fee: 10.0,
--   limit_count: 20 
-- });


-- 10. Function: Get recommendations (agents near other agents)
CREATE OR REPLACE FUNCTION get_similar_agents(
    agent_id UUID,
    limit_count INT DEFAULT 5
)
RETURNS SETOF deployed_objects AS $$
DECLARE
    target_agent RECORD;
BEGIN
    -- Get the target agent details
    SELECT * INTO target_agent
    FROM deployed_objects
    WHERE id = agent_id;
    
    -- Return similar agents (same network, close location, similar type)
    RETURN QUERY
    SELECT *
    FROM deployed_objects d
    WHERE d.is_active = true
        AND d.id != agent_id
        AND d.deployment_network_name = target_agent.deployment_network_name
    ORDER BY 
        (d.object_type = target_agent.object_type)::INT DESC,
        ABS(d.latitude - target_agent.latitude) + ABS(d.longitude - target_agent.longitude) ASC,
        d.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('get_similar_agents', { 
--   agent_id: 'uuid-here', 
--   limit_count: 3 
-- });


-- ============================================
-- ADMIN FUNCTIONS
-- ============================================

-- 11. Function: Bulk update agent status
CREATE OR REPLACE FUNCTION bulk_update_agent_status(
    agent_ids UUID[],
    new_status TEXT,
    new_is_active BOOLEAN DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
    update_count INT;
BEGIN
    WITH updated AS (
        UPDATE deployed_objects
        SET 
            deployment_status = new_status,
            is_active = COALESCE(new_is_active, is_active),
            updated_at = NOW()
        WHERE id = ANY(agent_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO update_count FROM updated;
    
    RETURN update_count;
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('bulk_update_agent_status', { 
--   agent_ids: ['uuid1', 'uuid2'], 
--   new_status: 'inactive' 
-- });


-- 12. Function: Get data quality report
CREATE OR REPLACE FUNCTION get_data_quality_report()
RETURNS TABLE (
    metric TEXT,
    count BIGINT,
    percentage NUMERIC
) AS $$
DECLARE
    total_agents BIGINT;
BEGIN
    SELECT COUNT(*) INTO total_agents FROM deployed_objects;
    
    RETURN QUERY
    SELECT 
        'Total Agents'::TEXT,
        total_agents,
        100.0::NUMERIC
    UNION ALL
    SELECT 
        'Missing Agent Wallet',
        COUNT(*),
        (COUNT(*) * 100.0 / NULLIF(total_agents, 0))::NUMERIC(5,2)
    FROM deployed_objects WHERE agent_identity_wallet IS NULL
    UNION ALL
    SELECT 
        'Missing Network',
        COUNT(*),
        (COUNT(*) * 100.0 / NULLIF(total_agents, 0))::NUMERIC(5,2)
    FROM deployed_objects WHERE deployment_network_name IS NULL
    UNION ALL
    SELECT 
        'Missing Location',
        COUNT(*),
        (COUNT(*) * 100.0 / NULLIF(total_agents, 0))::NUMERIC(5,2)
    FROM deployed_objects WHERE latitude IS NULL OR longitude IS NULL
    UNION ALL
    SELECT 
        'Missing Description',
        COUNT(*),
        (COUNT(*) * 100.0 / NULLIF(total_agents, 0))::NUMERIC(5,2)
    FROM deployed_objects WHERE description IS NULL OR description = '';
END;
$$ LANGUAGE plpgsql;

-- Call from app:
-- const { data } = await supabase.rpc('get_data_quality_report');


-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View: Active agents summary
CREATE OR REPLACE VIEW active_agents_summary AS
SELECT 
    id,
    name,
    agent_identity_wallet as owner,
    deployment_network_name as network,
    deployment_status as status,
    interaction_fee_amount as fee,
    interaction_fee_token as token,
    latitude,
    longitude,
    created_at
FROM deployed_objects
WHERE is_active = true
ORDER BY created_at DESC;

-- View: Network overview
CREATE OR REPLACE VIEW network_overview AS
SELECT 
    deployment_network_name as network,
    COUNT(*) as total_agents,
    COUNT(*) FILTER (WHERE is_active = true) as active_agents,
    COUNT(DISTINCT agent_identity_wallet) as unique_owners,
    AVG(interaction_fee_amount::NUMERIC) as avg_fee,
    MAX(created_at) as latest_deployment
FROM deployed_objects
GROUP BY deployment_network_name
ORDER BY total_agents DESC;

-- ============================================
-- USAGE NOTES
-- ============================================

-- To create these functions, run them in the Supabase SQL Editor
-- or through your migration system.

-- To call from JavaScript:
-- const { data, error } = await supabase.rpc('function_name', { 
--   param1: value1, 
--   param2: value2 
-- });

-- To list all custom functions:
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- To drop a function:
-- DROP FUNCTION IF EXISTS function_name;
