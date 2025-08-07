/*
  # Wallet Integration Fixes
  
  This migration ensures proper wallet address capture and storage for AgentSphere deployment system.
  
  1. Add deployer_wallet_address column for actual deployer's wallet
  2. Add payment_recipient_address column for payment routing
  3. Update constraints to ensure real wallet addresses are captured
  4. Clean up any existing mock addresses
*/

-- Add deployer_wallet_address column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'deployer_wallet_address'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN deployer_wallet_address VARCHAR(42);
  END IF;
END $$;

-- Add payment_recipient_address column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'payment_recipient_address'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN payment_recipient_address VARCHAR(42);
  END IF;
END $$;

-- Add constraints for proper Ethereum address format
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_deployer_wallet_format;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_deployer_wallet_format 
CHECK (
  (deployer_wallet_address IS NULL) OR 
  (deployer_wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_payment_recipient_format;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_payment_recipient_format 
CHECK (
  (payment_recipient_address IS NULL) OR 
  (payment_recipient_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Ensure agent_wallet_address follows proper format
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_agent_wallet_format;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_agent_wallet_format 
CHECK (
  (agent_wallet_address IS NULL) OR 
  (agent_wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Clean up any existing mock addresses
UPDATE deployed_objects 
SET 
  agent_wallet_address = NULL,
  deployer_wallet_address = NULL,
  payment_recipient_address = NULL
WHERE 
  agent_wallet_address = '0x...' 
  OR agent_wallet_address = '0xD7CAB219...'
  OR agent_wallet_address LIKE '%mock%'
  OR deployer_wallet_address = '0x...'
  OR deployer_wallet_address LIKE '%mock%'
  OR payment_recipient_address = '0x...'
  OR payment_recipient_address LIKE '%mock%';

-- Add indexes for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_deployed_objects_deployer_wallet 
ON deployed_objects (deployer_wallet_address) 
WHERE deployer_wallet_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_payment_recipient 
ON deployed_objects (payment_recipient_address) 
WHERE payment_recipient_address IS NOT NULL;

-- Add comments for new columns
COMMENT ON COLUMN deployed_objects.deployer_wallet_address IS 'Ethereum wallet address of the user who deployed this agent';
COMMENT ON COLUMN deployed_objects.payment_recipient_address IS 'Ethereum wallet address that will receive payments for agent interactions';

-- Ensure owner_wallet is properly indexed
CREATE INDEX IF NOT EXISTS idx_deployed_objects_owner_wallet 
ON deployed_objects (owner_wallet) 
WHERE owner_wallet IS NOT NULL;

-- Add constraint to prevent null wallet addresses for new deployments
-- Note: This ensures deployer and payment recipient are always captured
ALTER TABLE deployed_objects 
ADD CONSTRAINT require_wallet_addresses_for_new_agents 
CHECK (
  (created_at < '2025-08-02T12:00:00Z') OR  -- Allow existing agents
  (
    deployer_wallet_address IS NOT NULL AND 
    payment_recipient_address IS NOT NULL AND
    agent_wallet_address IS NOT NULL
  )
);
