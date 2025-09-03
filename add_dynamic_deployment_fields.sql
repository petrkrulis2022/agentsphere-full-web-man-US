-- Migration: Add Dynamic Deployment Data Fields
-- Purpose: Store actual deployment network, chain ID, and interaction fees
-- Date: September 3, 2025

-- Add new columns for dynamic deployment data
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployment_network_name VARCHAR(100);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployment_network_id INTEGER;
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployment_chain_id INTEGER;
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS interaction_fee_amount DECIMAL(18,6);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS interaction_fee_token VARCHAR(10);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployer_address VARCHAR(42);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployment_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMP DEFAULT NOW();

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_deployed_objects_chain_id ON deployed_objects(deployment_chain_id);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_network_name ON deployed_objects(deployment_network_name);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_deployer ON deployed_objects(deployer_address);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_fee_token ON deployed_objects(interaction_fee_token);

-- Update existing records to have default values where needed
UPDATE deployed_objects 
SET 
    deployment_network_name = COALESCE(deployment_network_name, network),
    deployment_chain_id = COALESCE(deployment_chain_id, chain_id),
    deployment_network_id = COALESCE(deployment_network_id, chain_id),
    interaction_fee_amount = COALESCE(interaction_fee_amount, interaction_fee_usdfc),
    interaction_fee_token = COALESCE(interaction_fee_token, token_symbol, 'USDC'),
    deployer_address = COALESCE(deployer_address, owner_wallet, user_id),
    deployment_status = COALESCE(deployment_status, 'active'),
    deployed_at = COALESCE(deployed_at, created_at, NOW())
WHERE deployment_network_name IS NULL OR deployment_chain_id IS NULL;

-- Create a view for easy querying of dynamic deployment data
CREATE OR REPLACE VIEW agent_deployment_summary AS
SELECT 
    id,
    name,
    description,
    object_type as agent_type,
    
    -- Location data
    latitude,
    longitude,
    location_type,
    
    -- Dynamic deployment data
    deployment_network_name,
    deployment_chain_id,
    deployment_network_id,
    
    -- Dynamic payment data
    interaction_fee_amount,
    interaction_fee_token,
    
    -- Wallet information
    deployer_address,
    agent_wallet_address,
    owner_wallet,
    
    -- Status and metadata
    deployment_status,
    deployed_at,
    is_active,
    created_at,
    
    -- Payment configuration
    payment_config,
    payment_methods,
    
    -- Legacy fields for compatibility
    network,
    chain_id,
    interaction_fee_usdfc,
    token_symbol
    
FROM deployed_objects
WHERE is_active = true;

-- Example queries to verify the changes:

-- 1. Check agents deployed on specific networks
-- SELECT * FROM agent_deployment_summary WHERE deployment_network_name = 'Ethereum Sepolia';

-- 2. Check agents with specific interaction fees
-- SELECT name, interaction_fee_amount, interaction_fee_token, deployment_network_name 
-- FROM agent_deployment_summary WHERE interaction_fee_amount > 5;

-- 3. Check deployment distribution by network
-- SELECT deployment_network_name, deployment_chain_id, COUNT(*) as agent_count
-- FROM agent_deployment_summary 
-- GROUP BY deployment_network_name, deployment_chain_id
-- ORDER BY agent_count DESC;

-- 4. Check agents deployed by specific address
-- SELECT * FROM agent_deployment_summary WHERE deployer_address = '0x...';

COMMENT ON COLUMN deployed_objects.deployment_network_name IS 'Actual network name where agent was deployed (e.g., "Ethereum Sepolia")';
COMMENT ON COLUMN deployed_objects.deployment_chain_id IS 'Actual chain ID where agent was deployed (e.g., 11155111)';
COMMENT ON COLUMN deployed_objects.interaction_fee_amount IS 'Actual interaction fee amount set during deployment';
COMMENT ON COLUMN deployed_objects.interaction_fee_token IS 'Token symbol for interaction fee (e.g., "USDC")';
COMMENT ON COLUMN deployed_objects.deployer_address IS 'Wallet address that deployed the agent';
COMMENT ON COLUMN deployed_objects.deployment_status IS 'Status of deployment (active, inactive, paused)';
