-- ============================================================
-- LIST ALL DEPLOYED OBJECTS / AGENTS
-- Run against your Supabase (PostgreSQL) database
-- ============================================================

-- -------------------------------------------------------
-- 1. QUICK LIST – all deployed objects (active + inactive)
-- -------------------------------------------------------
SELECT
    id,
    name,
    description,
    object_type,
    agent_type,
    location_type,
    -- Location
    latitude,
    longitude,
    altitude,
    range_meters,
    interaction_range,
    -- Network / Chain
    network                    AS deployment_network,
    chain_id                   AS deployment_chain_id,
    -- Wallets
    owner_wallet,
    deployer_wallet_address,
    payment_recipient_address,
    agent_wallet_address,
    agent_wallet_type,
    -- Fees / Payment
    interaction_fee,
    interaction_fee_usdfc,
    currency_type,
    token,
    token_symbol,
    token_address,
    -- Interaction capabilities
    chat_enabled,
    voice_enabled,
    defi_enabled,
    text_chat,
    voice_chat,
    video_chat,
    interaction_types,
    -- MCP
    mcp_services,
    mcp_integrations,
    -- Features / flags
    features,
    trailing_agent,
    ar_notifications,
    rtk_enhanced,
    rtk_provider,
    -- Status
    is_active,
    created_at,
    updated_at
FROM deployed_objects
ORDER BY created_at DESC;


-- -------------------------------------------------------
-- 2. ACTIVE AGENTS ONLY – compact summary view
-- -------------------------------------------------------
SELECT
    id,
    name,
    object_type,
    agent_type,
    network            AS deployment_network,
    chain_id           AS deployment_chain_id,
    owner_wallet,
    interaction_fee,
    token_symbol       AS fee_token,
    latitude,
    longitude,
    is_active,
    created_at
FROM deployed_objects
WHERE is_active = true
ORDER BY created_at DESC;


-- -------------------------------------------------------
-- 3. FULL DETAIL – all columns, all rows (wildcard)
-- -------------------------------------------------------
SELECT *
FROM deployed_objects
ORDER BY created_at DESC;


-- -------------------------------------------------------
-- 4. COUNTS & STATS – overview dashboard
-- -------------------------------------------------------
SELECT
    COUNT(*)                                              AS total_objects,
    COUNT(*) FILTER (WHERE is_active = true)              AS active,
    COUNT(*) FILTER (WHERE is_active = false)             AS inactive,
    COUNT(DISTINCT object_type)                           AS distinct_object_types,
    COUNT(DISTINCT agent_type)                            AS distinct_agent_types,
    COUNT(DISTINCT network)                               AS distinct_networks,
    COUNT(DISTINCT owner_wallet)                          AS distinct_owners,
    MIN(created_at)                                       AS earliest_deploy,
    MAX(created_at)                                       AS latest_deploy
FROM deployed_objects;


-- -------------------------------------------------------
-- 5. BREAKDOWN BY OBJECT TYPE
-- -------------------------------------------------------
SELECT
    object_type,
    COUNT(*)                                   AS total,
    COUNT(*) FILTER (WHERE is_active = true)   AS active,
    COUNT(*) FILTER (WHERE is_active = false)  AS inactive
FROM deployed_objects
GROUP BY object_type
ORDER BY total DESC;


-- -------------------------------------------------------
-- 6. BREAKDOWN BY NETWORK / CHAIN
-- -------------------------------------------------------
SELECT
    network        AS deployment_network,
    chain_id       AS deployment_chain_id,
    COUNT(*)                                   AS total,
    COUNT(*) FILTER (WHERE is_active = true)   AS active
FROM deployed_objects
GROUP BY network, chain_id
ORDER BY total DESC;


-- -------------------------------------------------------
-- 7. BREAKDOWN BY OWNER WALLET
-- -------------------------------------------------------
SELECT
    owner_wallet,
    COUNT(*)          AS agents_deployed,
    array_agg(name)   AS agent_names
FROM deployed_objects
WHERE is_active = true
GROUP BY owner_wallet
ORDER BY agents_deployed DESC;


-- -------------------------------------------------------
-- 8. RECENTLY DEPLOYED (last 7 days)
-- -------------------------------------------------------
SELECT
    id,
    name,
    object_type,
    agent_type,
    network       AS deployment_network,
    owner_wallet,
    is_active,
    created_at
FROM deployed_objects
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;


-- -------------------------------------------------------
-- 9. AGENTS WITH PAYMENT / FEE CONFIGURED
-- -------------------------------------------------------
SELECT
    id,
    name,
    object_type,
    interaction_fee,
    interaction_fee_usdfc,
    currency_type,
    token_symbol,
    token_address,
    payment_recipient_address,
    network       AS deployment_network
FROM deployed_objects
WHERE is_active = true
  AND interaction_fee IS NOT NULL
  AND interaction_fee > 0
ORDER BY interaction_fee DESC;


-- -------------------------------------------------------
-- 10. AGENTS WITH MCP INTEGRATIONS
-- -------------------------------------------------------
SELECT
    id,
    name,
    object_type,
    mcp_services,
    mcp_integrations,
    network       AS deployment_network
FROM deployed_objects
WHERE is_active = true
  AND (mcp_services IS NOT NULL OR mcp_integrations IS NOT NULL)
ORDER BY created_at DESC;
