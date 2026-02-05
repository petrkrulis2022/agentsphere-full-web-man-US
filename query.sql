SELECT 
    id, 
    agent_type, 
    screen_position_x, 
    screen_position_y, 
    positioning_mode, 
    latitude, 
    longitude,
    created_at
FROM deployed_objects 
ORDER BY created_at DESC 
LIMIT 1;
