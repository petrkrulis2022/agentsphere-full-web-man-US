/*
  Fix Agent Card Display Issues - Add Missing Standard Fields
  
  Issues to fix:
  1. interaction_fee field missing (card expects this, not interaction_fee_usdfc)
  2. token field missing (card expects this for token display)
  3. agent_type field missing (card expects this, not just object_type)
  4. features field missing (for capabilities display)
  
  This migration adds the missing fields for proper agent card display
*/

-- Add standard interaction_fee field (what agent card expects)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'interaction_fee'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN interaction_fee DECIMAL(10,6);
    COMMENT ON COLUMN deployed_objects.interaction_fee IS 'Standard interaction fee field for agent card display';
  END IF;
END $$;

-- Add standard token field (what agent card expects for token display)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'token'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN token VARCHAR(10);
    COMMENT ON COLUMN deployed_objects.token IS 'Standard token field for agent card display';
  END IF;
END $$;

-- Add agent_type field (what agent card expects)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'agent_type'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN agent_type VARCHAR(50);
    COMMENT ON COLUMN deployed_objects.agent_type IS 'Standard agent type field for agent card display';
  END IF;
END $$;

-- Add features field (for capabilities display)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'features'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN features TEXT[];
    COMMENT ON COLUMN deployed_objects.features IS 'Array of agent features for capabilities display';
  END IF;
END $$;

-- Add text_chat, voice_chat, video_chat fields for interaction methods display
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'text_chat'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN text_chat BOOLEAN DEFAULT false;
    COMMENT ON COLUMN deployed_objects.text_chat IS 'Text chat capability for interaction methods display';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'voice_chat'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN voice_chat BOOLEAN DEFAULT false;
    COMMENT ON COLUMN deployed_objects.voice_chat IS 'Voice chat capability for interaction methods display';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'video_chat'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN video_chat BOOLEAN DEFAULT false;
    COMMENT ON COLUMN deployed_objects.video_chat IS 'Video chat capability for interaction methods display';
  END IF;
END $$;

-- Update agent_type constraint to include the new field
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_agent_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_agent_type 
CHECK ((agent_type IS NULL) OR (agent_type = ANY (ARRAY[
  -- Legacy types (maintain compatibility)
  'ai_agent'::text, 
  'study_buddy'::text, 
  'tutor'::text, 
  'landmark'::text, 
  'building'::text,
  -- Enhanced agent categories
  'Intelligent Assistant'::text,
  'Local Services'::text, 
  'Payment Terminal'::text,
  'Trailing Payment Terminal'::text,
  'My Ghost'::text,
  'Game Agent'::text,
  '3D World Builder'::text,
  'Home Security'::text,
  'Content Creator'::text,
  'Real Estate Broker'::text,
  'Bus Stop Agent'::text,
  -- Previous enhanced types
  'Taxi driver'::text,
  'Travel Influencer'::text
])));

COMMENT ON TABLE deployed_objects IS 'Enhanced deployed objects table with agent card display compatibility fields';
