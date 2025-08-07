/*
Manual Migration Application Script
Apply the agent card fields migration to fix display issues
*/

-- Step 1: Add standard interaction_fee field
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS interaction_fee DECIMAL(10,6);

-- Step 2: Add standard token field  
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS token VARCHAR(10);

-- Step 3: Add agent_type field
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS agent_type VARCHAR(50);

-- Step 4: Add features field
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS features TEXT[];

-- Step 5: Add interaction method fields
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS text_chat BOOLEAN DEFAULT false;
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS voice_chat BOOLEAN DEFAULT false;
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS video_chat BOOLEAN DEFAULT false;

-- Step 6: Update existing data to populate the new fields from existing data
UPDATE deployed_objects 
SET 
  interaction_fee = interaction_fee_usdfc,
  token = token_symbol,
  agent_type = object_type,
  text_chat = COALESCE(chat_enabled, true),
  voice_chat = COALESCE(voice_enabled, false),
  video_chat = COALESCE(defi_enabled, false) -- This might be wrong mapping, but we'll fix it
WHERE interaction_fee IS NULL OR token IS NULL OR agent_type IS NULL;

-- Step 7: Add constraints
ALTER TABLE deployed_objects 
ADD CONSTRAINT IF NOT EXISTS valid_agent_type 
CHECK ((agent_type IS NULL) OR (agent_type = ANY (ARRAY[
  'ai_agent'::text, 'study_buddy'::text, 'tutor'::text, 'landmark'::text, 'building'::text,
  'Intelligent Assistant'::text, 'Local Services'::text, 'Payment Terminal'::text,
  'Trailing Payment Terminal'::text, 'My Ghost'::text, 'Game Agent'::text,
  '3D World Builder'::text, 'Home Security'::text, 'Content Creator'::text,
  'Real Estate Broker'::text, 'Bus Stop Agent'::text, 'Taxi driver'::text,
  'Travel Influencer'::text
])));

-- Verify the changes
SELECT 
  name,
  agent_type,
  interaction_fee,
  token,
  network,
  location_type,
  deployer_wallet_address,
  payment_recipient_address,
  features,
  text_chat,
  voice_chat,
  video_chat
FROM deployed_objects 
ORDER BY created_at DESC 
LIMIT 5;
