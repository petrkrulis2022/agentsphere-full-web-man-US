-- Test Supabase permissions for interaction_fee_amount and interaction_fee_token columns
-- Run this in Supabase SQL Editor

-- 1. Check if RLS is enabled and what policies exist
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'deployed_objects';

-- 2. Check existing RLS policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'deployed_objects';

-- 3. Test direct access to the specific columns we need
SELECT 
  id,
  name,
  interaction_fee_amount,
  interaction_fee_token,
  interaction_fee_usdfc
FROM deployed_objects 
WHERE name ILIKE '%cube%'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check if there are any column-level permissions
SELECT 
  table_name,
  column_name,
  privilege_type
FROM information_schema.column_privileges 
WHERE table_name = 'deployed_objects' 
AND column_name IN ('interaction_fee_amount', 'interaction_fee_token');

-- 5. Verify the exact data types and constraints
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length,
  numeric_precision,
  numeric_scale
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
AND column_name IN ('interaction_fee_amount', 'interaction_fee_token', 'interaction_fee_usdfc')
ORDER BY column_name;
