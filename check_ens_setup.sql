-- Check ENS Payment Setup
-- Run this in Supabase SQL Editor to verify ENS configuration

-- 1. Check if ENS columns exist
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'deployed_objects'
  AND column_name LIKE 'ens_%'
ORDER BY ordinal_position;

-- 2. Check if ENS indexes exist
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'deployed_objects'
  AND indexname LIKE '%ens%';

-- 3. Check if ENS constraints exist
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'deployed_objects'
  AND con.conname LIKE '%ens%';

-- 4. Check if ENS triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%ens%';

-- 5. Check current ENS data in deployed_objects
SELECT 
  id,
  name,
  agent_type,
  ens_payment_enabled,
  ens_domain,
  ens_resolved_address,
  ens_resolver_network,
  ens_verified,
  ens_last_resolved,
  created_at
FROM deployed_objects
WHERE ens_payment_enabled = true
   OR ens_domain IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 6. Summary count
SELECT 
  COUNT(*) as total_agents,
  COUNT(CASE WHEN ens_payment_enabled = true THEN 1 END) as ens_enabled_count,
  COUNT(CASE WHEN ens_domain IS NOT NULL THEN 1 END) as has_ens_domain_count,
  COUNT(CASE WHEN ens_verified = true THEN 1 END) as ens_verified_count
FROM deployed_objects;
