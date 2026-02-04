-- Check if ENS columns exist in deployed_objects table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'deployed_objects'
  AND column_name LIKE '%ens%'
ORDER BY column_name;
