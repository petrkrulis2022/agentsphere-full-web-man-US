-- Find ALL varchar(42) columns in deployed_objects table
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
AND data_type = 'character varying'
AND character_maximum_length = 42
ORDER BY ordinal_position;
