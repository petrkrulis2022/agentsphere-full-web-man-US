-- Clear Database and Start Fresh - AgentSphere
-- Purpose: Remove all existing data and recreate clean schema for dynamic deployment
-- Date: September 3, 2025

-- Step 1: Clear all existing data
DELETE FROM deployed_objects;

-- Step 2: Reset the sequence for auto-incrementing IDs (if using serial/auto-increment)
ALTER SEQUENCE IF EXISTS deployed_objects_id_seq RESTART WITH 1;

-- Step 3: Drop all existing constraints
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_network;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS deployed_objects_network_check;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS check_valid_network;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_network_comprehensive;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_deployment_network;

-- Step 4: Ensure we have all the dynamic deployment columns (from our previous migration)
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployment_network_name VARCHAR(100);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployment_network_id INTEGER;
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployment_chain_id INTEGER;
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS interaction_fee_amount DECIMAL(18,6);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS interaction_fee_token VARCHAR(10);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployer_address VARCHAR(42);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployment_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMP DEFAULT NOW();

-- Step 5: Create clean, comprehensive network constraint
ALTER TABLE deployed_objects ADD CONSTRAINT valid_network_clean CHECK (
  network IN (
    -- Original supported networks
    'Hedera Testnet',
    'Hedera Mainnet', 
    'BlockDAG Testnet',
    'BlockDAG Mainnet',
    'Polygon Testnet',
    'Polygon Mainnet',
    'Ethereum Testnet',
    'Ethereum Mainnet',
    
    -- EVM Testnets (the networks we actually use)
    'Ethereum Sepolia',
    'Arbitrum Sepolia', 
    'Base Sepolia',
    'OP Sepolia',
    'Avalanche Fuji',
    
    -- EVM Mainnets
    'Ethereum',
    'Arbitrum One',
    'Base',
    'Optimism',
    'Avalanche'
  )
);

-- Step 6: Create constraint for deployment_network_name
ALTER TABLE deployed_objects ADD CONSTRAINT valid_deployment_network_clean CHECK (
  deployment_network_name IS NULL OR deployment_network_name IN (
    -- Original supported networks
    'Hedera Testnet',
    'Hedera Mainnet', 
    'BlockDAG Testnet',
    'BlockDAG Mainnet',
    'Polygon Testnet',
    'Polygon Mainnet',
    'Ethereum Testnet',
    'Ethereum Mainnet',
    
    -- EVM Testnets (the networks we actually use)
    'Ethereum Sepolia',
    'Arbitrum Sepolia', 
    'Base Sepolia',
    'OP Sepolia',
    'Avalanche Fuji',
    
    -- EVM Mainnets
    'Ethereum',
    'Arbitrum One',
    'Base',
    'Optimism',
    'Avalanche'
  )
);

-- Step 7: Recreate indexes for efficient querying
DROP INDEX IF EXISTS idx_deployed_objects_chain_id;
DROP INDEX IF EXISTS idx_deployed_objects_network_name;
DROP INDEX IF EXISTS idx_deployed_objects_deployer;
DROP INDEX IF EXISTS idx_deployed_objects_fee_token;

CREATE INDEX idx_deployed_objects_chain_id ON deployed_objects(deployment_chain_id);
CREATE INDEX idx_deployed_objects_network_name ON deployed_objects(deployment_network_name);
CREATE INDEX idx_deployed_objects_deployer ON deployed_objects(deployer_address);
CREATE INDEX idx_deployed_objects_fee_token ON deployed_objects(interaction_fee_token);

-- Step 8: Recreate the view for dynamic deployment data
DROP VIEW IF EXISTS agent_deployment_summary;
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

-- Step 9: Verify everything is clean
SELECT 'Database cleared successfully. Ready for fresh deployments!' as status;

-- Step 10: Show current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
ORDER BY ordinal_position;

-- Step 11: Show constraints
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%valid%';

COMMENT ON TABLE deployed_objects IS 'Fresh start - cleared for dynamic deployment testing';
COMMENT ON CONSTRAINT valid_network_clean ON deployed_objects IS 'Clean network constraint supporting all EVM networks';
COMMENT ON CONSTRAINT valid_deployment_network_clean ON deployed_objects IS 'Clean deployment network constraint';
