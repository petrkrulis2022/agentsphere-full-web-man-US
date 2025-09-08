-- Test query to verify migration and column access
-- Run this in Supabase SQL Editor

-- 1. Check if columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
AND column_name IN ('interaction_fee_amount', 'interaction_fee_token', 'interaction_fee_usdfc')
ORDER BY column_name;

-- 2. Check current data in these columns
SELECT 
  id,
  name,
  interaction_fee_amount,
  interaction_fee_token,
  interaction_fee_usdfc,
  created_at::date as created_date
FROM deployed_objects 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if any records have the new dynamic fields populated
SELECT 
  COUNT(*) as total_records,
  COUNT(interaction_fee_amount) as records_with_fee_amount,
  COUNT(interaction_fee_token) as records_with_fee_token,
  COUNT(CASE WHEN interaction_fee_amount IS NOT NULL AND interaction_fee_amount > 0 THEN 1 END) as records_with_positive_fee
FROM deployed_objects;

-- 4. Show specific records that should have the dynamic fees
SELECT 
  id,
  name,
  interaction_fee_amount,
  interaction_fee_token,
  interaction_fee_usdfc,
  CASE 
    WHEN interaction_fee_amount IS NOT NULL THEN 'NEW DYNAMIC'
    WHEN interaction_fee_usdfc IS NOT NULL THEN 'LEGACY'
    ELSE 'NO DATA'
  END as fee_data_source
FROM deployed_objects 
WHERE name ILIKE '%cube%sepolia%'
ORDER BY created_at DESC;
