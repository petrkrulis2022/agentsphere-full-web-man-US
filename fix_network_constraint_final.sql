-- Fix Network Constraint for Dynamic Deployment
-- Purpose: Update the valid_network constraint to support all EVM networks
-- Date: September 3, 2025

-- First, let's check what constraint exists
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%network%' OR constraint_name LIKE '%valid%';

-- Check current constraint on deployed_objects table
SELECT tc.constraint_name, cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'deployed_objects' 
  AND tc.constraint_type = 'CHECK';

-- Drop the existing network constraint if it exists
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_network;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS deployed_objects_network_check;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS check_valid_network;

-- Create a new comprehensive network constraint that supports all EVM networks
ALTER TABLE deployed_objects ADD CONSTRAINT valid_network_comprehensive CHECK (
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
    
    -- EVM Testnets
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
    'Avalanche',
    
    -- Additional networks for future expansion
    'BSC Testnet',
    'BSC Mainnet',
    'Fantom Testnet',
    'Fantom Mainnet'
  )
);

-- Also update deployment_network_name constraint if it exists
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_deployment_network;
ALTER TABLE deployed_objects ADD CONSTRAINT valid_deployment_network CHECK (
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
    
    -- EVM Testnets
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
    'Avalanche',
    
    -- Additional networks for future expansion
    'BSC Testnet',
    'BSC Mainnet',
    'Fantom Testnet',
    'Fantom Mainnet'
  )
);

-- Verify the constraints are working
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name IN ('valid_network_comprehensive', 'valid_deployment_network');

-- Test insertion with Ethereum Sepolia (should work now)
-- INSERT INTO deployed_objects (name, network, deployment_network_name) 
-- VALUES ('Test Agent', 'Ethereum Sepolia', 'Ethereum Sepolia');

COMMENT ON CONSTRAINT valid_network_comprehensive ON deployed_objects IS 'Allows all supported blockchain networks including EVM testnets and mainnets';
COMMENT ON CONSTRAINT valid_deployment_network ON deployed_objects IS 'Allows all supported networks for deployment_network_name field';
