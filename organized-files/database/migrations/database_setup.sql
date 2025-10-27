/*
  Manual Database Setup for AgentSphere
  
  Run this SQL in your Supabase SQL Editor to create the deployed_objects table
  if the migrations haven't been applied automatically.
*/

-- Create deployed_objects table with all necessary fields
CREATE TABLE IF NOT EXISTS deployed_objects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    name text,
    description text,
    object_type text,
    agent_type text,
    location_type text DEFAULT 'Street',
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    altitude double precision DEFAULT 0.0,
    preciselatitude double precision,
    preciselongitude double precision,
    precisealtitude double precision,
    accuracy double precision DEFAULT 10.0,
    correctionapplied boolean DEFAULT false,
    range_meters integer DEFAULT 25,
    interaction_range integer DEFAULT 15,
    trailing_agent boolean DEFAULT false,
    ar_notifications boolean DEFAULT true,
    
    -- Payment and Token Fields
    interaction_fee decimal(10,6) DEFAULT 1.0,
    interaction_fee_usdfc decimal(10,6) DEFAULT 1.0,
    currency_type varchar(10) DEFAULT 'USDT',
    token varchar(10) DEFAULT 'USDT',
    token_symbol varchar(10) DEFAULT 'USDT',
    token_address text,
    chain_id integer DEFAULT 2810,
    network text DEFAULT 'morph-holesky-testnet',
    
    -- Wallet Configuration
    owner_wallet text,
    deployer_wallet_address text,
    payment_recipient_address text,
    agent_wallet_address text,
    agent_wallet_type text DEFAULT 'evm_wallet',
    
    -- Interaction Capabilities
    chat_enabled boolean DEFAULT true,
    voice_enabled boolean DEFAULT false,
    defi_enabled boolean DEFAULT false,
    text_chat boolean DEFAULT true,
    voice_chat boolean DEFAULT false,
    video_chat boolean DEFAULT false,
    interaction_types text[],
    
    -- MCP Services
    mcp_services jsonb,
    mcp_integrations text[],
    
    -- Features and Status
    features text[],
    rtk_enhanced boolean DEFAULT false,
    rtk_provider text DEFAULT 'GeoNet',
    is_active boolean DEFAULT true,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE deployed_objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read deployed objects" ON deployed_objects;
DROP POLICY IF EXISTS "Users can insert objects" ON deployed_objects;
DROP POLICY IF EXISTS "Users can update their own objects" ON deployed_objects;
DROP POLICY IF EXISTS "Users can delete their own objects" ON deployed_objects;

-- Create policies for public access (required for the app to work)
CREATE POLICY "Anyone can read deployed objects"
  ON deployed_objects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert objects"
  ON deployed_objects
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own objects"
  ON deployed_objects
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own objects"
  ON deployed_objects
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deployed_objects_location 
ON deployed_objects (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_deployed_objects_user_id 
ON deployed_objects (user_id);

CREATE INDEX IF NOT EXISTS idx_deployed_objects_active 
ON deployed_objects (is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_mcp_services 
ON deployed_objects USING GIN (mcp_services) 
WHERE mcp_services IS NOT NULL;

-- Add constraint for agent types
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_agent_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_agent_type 
CHECK ((agent_type IS NULL) OR (agent_type = ANY (ARRAY[
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
  'ai_agent'::text, 
  'study_buddy'::text, 
  'tutor'::text, 
  'landmark'::text, 
  'building'::text
])));

-- Create RPC function for table creation (optional)
CREATE OR REPLACE FUNCTION create_deployed_objects_table()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is just a placeholder since the table is created above
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deployed_objects') THEN
    RETURN 'Table deployed_objects already exists';
  ELSE
    RETURN 'Table deployed_objects would be created';
  END IF;
END;
$$;

-- Add comment to the table
COMMENT ON TABLE deployed_objects IS 'Stores deployed AR agents with their location, configuration, and interaction capabilities';

-- Success message
SELECT 'AgentSphere database setup completed successfully!' as status;
