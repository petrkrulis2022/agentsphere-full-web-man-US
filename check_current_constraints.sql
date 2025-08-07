-- Check current constraints on deployed_objects table
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%object_type%'
   OR constraint_name LIKE '%location_type%'
   OR constraint_name LIKE '%currency_type%'
   OR constraint_name LIKE '%network%';

-- Also check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
  AND column_name IN ('object_type', 'location_type', 'currency_type', 'token_symbol', 'network')
ORDER BY column_name;
