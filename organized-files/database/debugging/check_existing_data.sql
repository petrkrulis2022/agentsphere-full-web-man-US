-- Step 1: Check what object_type values currently exist in the table
SELECT DISTINCT object_type, COUNT(*) as count
FROM deployed_objects 
WHERE object_type IS NOT NULL
GROUP BY object_type
ORDER BY count DESC;

-- Step 2: Check if there are any NULL object_type values
SELECT COUNT(*) as null_count
FROM deployed_objects 
WHERE object_type IS NULL;
