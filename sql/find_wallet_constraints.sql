-- Find the check constraint that's blocking Solana addresses
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'deployed_objects'::regclass
AND contype = 'c'  -- 'c' = CHECK constraint
AND conname LIKE '%wallet%';
