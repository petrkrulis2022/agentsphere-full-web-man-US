-- Fix ALL network constraints to support Polygon Amoy and Solana Devnet
-- This addresses both 'valid_network_clean' and 'valid_deployment_network_clean' constraints

-- Step 1: Drop both existing network constraints
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_network_clean;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_deployment_network_clean;

-- Step 2: Add updated 'valid_network_clean' constraint (for 'network' column)
ALTER TABLE deployed_objects ADD CONSTRAINT valid_network_clean CHECK (
  network IS NULL OR network IN (
    -- Legacy network names
    'Hedera Testnet', 'Hedera Mainnet', 
    'BlockDAG Testnet', 'BlockDAG Mainnet',
    'Polygon Testnet', 'Polygon Mainnet',
    'Ethereum Testnet', 'Ethereum Mainnet',
    'Ethereum', 'Arbitrum One', 'Base', 'Optimism', 'Avalanche',
    'BSC Testnet', 'BSC Mainnet', 'Fantom Testnet', 'Fantom Mainnet',
    
    -- Current supported EVM testnets (exact names from multiChainNetworks.ts)
    'Ethereum Sepolia', 
    'Arbitrum Sepolia', 
    'Base Sepolia', 
    'OP Sepolia', 
    'Avalanche Fuji',
    'Polygon Amoy',  -- NEW: Polygon Amoy support
    
    -- Non-EVM networks (future support)
    'Solana Devnet',  -- NEW: Solana Devnet support
    'Hedera Testnet',
    'XRP Ledger Testnet',
    'Tron Shasta Testnet',
    'Starknet Sepolia'
  )
);

-- Step 3: Add updated 'valid_deployment_network_clean' constraint (for 'deployment_network_name' column)
ALTER TABLE deployed_objects ADD CONSTRAINT valid_deployment_network_clean CHECK (
  deployment_network_name IS NULL OR deployment_network_name IN (
    -- Legacy network names
    'Hedera Testnet', 'Hedera Mainnet', 
    'BlockDAG Testnet', 'BlockDAG Mainnet',
    'Polygon Testnet', 'Polygon Mainnet',
    'Ethereum Testnet', 'Ethereum Mainnet',
    'Ethereum', 'Arbitrum One', 'Base', 'Optimism', 'Avalanche',
    'BSC Testnet', 'BSC Mainnet', 'Fantom Testnet', 'Fantom Mainnet',
    
    -- Current supported EVM testnets (exact names from multiChainNetworks.ts)
    'Ethereum Sepolia', 
    'Arbitrum Sepolia', 
    'Base Sepolia', 
    'OP Sepolia', 
    'Avalanche Fuji',
    'Polygon Amoy',  -- NEW: Polygon Amoy support
    
    -- Non-EVM networks (future support)
    'Solana Devnet',  -- NEW: Solana Devnet support
    'Hedera Testnet',
    'XRP Ledger Testnet',
    'Tron Shasta Testnet',
    'Starknet Sepolia'
  )
);

-- Step 4: Verify both constraints are updated
SELECT 'Both network constraints updated successfully' as status;

-- Step 5: Check constraint definitions
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name IN ('valid_network_clean', 'valid_deployment_network_clean')
ORDER BY constraint_name;

-- Step 6: Test the constraints by checking current data
SELECT DISTINCT network, COUNT(*) as count
FROM deployed_objects 
WHERE network IS NOT NULL
GROUP BY network 
ORDER BY count DESC;

SELECT DISTINCT deployment_network_name, COUNT(*) as count
FROM deployed_objects 
WHERE deployment_network_name IS NOT NULL
GROUP BY deployment_network_name 
ORDER BY count DESC;

SELECT 'Database ready for Polygon Amoy deployments on ALL network fields' as final_status;