-- Delete old ARTM agents with home_security references
DELETE FROM deployed_objects 
WHERE name LIKE 'ARTM%' 
  AND (description LIKE '%home_security%' OR object_type = 'home_security');

-- Show remaining agents
SELECT name, agent_type, object_type, description 
FROM deployed_objects 
ORDER BY created_at DESC 
LIMIT 5;
