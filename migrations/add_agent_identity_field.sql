-- Add agent_identity field to store verifiable identity information
-- This field will store ERC-8004 NFT ID or generated identity for existing agents

-- Add the identity column
ALTER TABLE deployed_objects
ADD COLUMN IF NOT EXISTS agent_identity TEXT;

-- Add index for identity lookups
CREATE INDEX IF NOT EXISTS idx_agent_identity ON deployed_objects(agent_identity);

-- Add comment
COMMENT ON COLUMN deployed_objects.agent_identity IS 'Agent verifiable identity: ERC-8004 NFT ID (format: 0.0.xxxxx/tokenId) or generated DID (format: did:hedera:testnet:xxxxx)';

-- Generate dummy identities for existing non-Hedera agents
-- Format: did:agent:testnet:{agent_id} for backward compatibility
UPDATE deployed_objects
SET agent_identity = CONCAT('did:agent:testnet:', SUBSTRING(id::text, 1, 8))
WHERE agent_identity IS NULL 
  AND hedera_nft_id IS NULL
  AND object_type NOT IN ('bus_agent', 'train_agent', 'hotel_agent', 'flight_agent', 'restaurant_agent', 'travel_agent');

-- For Hedera agents with NFT IDs, use the NFT as identity
UPDATE deployed_objects
SET agent_identity = hedera_nft_id
WHERE agent_identity IS NULL 
  AND hedera_nft_id IS NOT NULL;

-- For Hedera agents without NFT (but with account), create identity from account
UPDATE deployed_objects
SET agent_identity = CONCAT('did:hedera:testnet:', hedera_account_id)
WHERE agent_identity IS NULL 
  AND hedera_account_id IS NOT NULL;

-- Verify the update
-- SELECT id, name, object_type, agent_identity, hedera_nft_id, hedera_account_id 
-- FROM deployed_objects 
-- ORDER BY created_at DESC 
-- LIMIT 20;
