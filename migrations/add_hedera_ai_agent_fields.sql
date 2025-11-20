-- Add Hedera AI Agent Kit fields to deployed_objects table
-- Run this migration in Supabase SQL Editor

-- Add new columns for Hedera integration
ALTER TABLE deployed_objects
ADD COLUMN IF NOT EXISTS hedera_account_id TEXT,
ADD COLUMN IF NOT EXISTS hedera_private_key TEXT, -- IMPORTANT: Encrypt this in production!
ADD COLUMN IF NOT EXISTS hedera_nft_id TEXT,
ADD COLUMN IF NOT EXISTS agent_wallet_public_key TEXT,
ADD COLUMN IF NOT EXISTS agent_initial_balance NUMERIC(20, 6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS agent_capabilities JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS a2a_endpoint TEXT,
ADD COLUMN IF NOT EXISTS mcp_servers JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS x402_enabled BOOLEAN DEFAULT FALSE;

-- Update agent_type to include new travel agent types
ALTER TABLE deployed_objects
DROP CONSTRAINT IF EXISTS deployed_objects_object_type_check;

ALTER TABLE deployed_objects
ADD CONSTRAINT deployed_objects_object_type_check
CHECK (object_type IN (
  'payment_terminal',
  'trailing_payment_terminal',
  'intelligent_assistant',
  'content_display',
  'bus_agent',
  'train_agent',
  'hotel_agent',
  'travel_agent',
  'flight_agent',
  'restaurant_agent'
));

-- Add index for Hedera account lookups
CREATE INDEX IF NOT EXISTS idx_hedera_account_id ON deployed_objects(hedera_account_id);
CREATE INDEX IF NOT EXISTS idx_hedera_nft_id ON deployed_objects(hedera_nft_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities ON deployed_objects USING GIN(agent_capabilities);

-- Add comments for documentation
COMMENT ON COLUMN deployed_objects.hedera_account_id IS 'Hedera account ID for the agent (e.g., 0.0.12345)';
COMMENT ON COLUMN deployed_objects.hedera_private_key IS 'Agent private key (MUST be encrypted in production!)';
COMMENT ON COLUMN deployed_objects.hedera_nft_id IS 'ERC-8004 identity NFT ID';
COMMENT ON COLUMN deployed_objects.agent_capabilities IS 'JSON object defining agent capabilities: {chat: true, voice: true, video: true, a2a: true, x402: true}';
COMMENT ON COLUMN deployed_objects.a2a_endpoint IS 'Agent-to-Agent communication endpoint URL';
COMMENT ON COLUMN deployed_objects.mcp_servers IS 'Array of MCP server configurations for data retrieval';
COMMENT ON COLUMN deployed_objects.x402_enabled IS 'Whether agent can make x402 payments for data services';

-- Example: Update existing payment terminals to have Hedera capabilities
-- UPDATE deployed_objects
-- SET agent_capabilities = '{"payment": true, "hedera": true}'::jsonb
-- WHERE object_type IN ('payment_terminal', 'trailing_payment_terminal');
