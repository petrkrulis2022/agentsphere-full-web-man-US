-- ============================================================================
-- DIAGNOSTIC QUERIES: Find views blocking the column type change
-- ============================================================================

-- QUERY 1: Find ALL views that depend on deployed_objects table
SELECT
  n.nspname AS schema,
  c.relname AS object_name,
  c.relkind AS kind -- 'v' = view, 'm' = matview, 'r' = table
FROM pg_depend d
JOIN pg_class c ON d.refobjid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE d.objid = (
  SELECT oid FROM pg_class WHERE relname = 'deployed_objects' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
)
AND d.deptype IN ('n','a','i','e');

-- ============================================================================

-- QUERY 2: Find views that specifically reference owner_wallet, agent_wallet_address, or deployer_address
SELECT 
  n.nspname AS schema, 
  c.relname AS view_name, 
  pg_get_viewdef(c.oid) AS view_def
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relkind IN ('v','m') -- view or matview
AND (
  pg_get_viewdef(c.oid) ILIKE '%owner_wallet%'
  OR pg_get_viewdef(c.oid) ILIKE '%agent_wallet_address%'
  OR pg_get_viewdef(c.oid) ILIKE '%deployer_address%'
);

-- ============================================================================

-- QUERY 3: Check for rules on deployed_objects table
SELECT * FROM pg_rules WHERE schemaname = 'public' AND tablename = 'deployed_objects';

-- ============================================================================

-- QUERY 4: List ALL views in the database (to see what exists)
SELECT 
  schemaname,
  viewname,
  viewowner
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;
