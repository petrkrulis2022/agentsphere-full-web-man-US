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

-- Enable RLS
ALTER TABLE deployed_objects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Anyone can read deployed objects"
  ON deployed_objects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert objects"
  ON deployed_objects
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update their own objects"
  ON deployed_objects
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can delete their own objects"
  ON deployed_objects
  FOR DELETE
  TO public
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deployed_objects_location 
ON deployed_objects (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_deployed_objects_user_id 
ON deployed_objects (user_id);

CREATE INDEX IF NOT EXISTS idx_deployed_objects_active 
ON deployed_objects (is_active) 
WHERE is_active = true;
