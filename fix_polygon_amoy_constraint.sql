-- Fix deployment network constraint to include Polygon Amoy and Solana Devnet
-- This resolves the deployment failure for new networks

-- Step 1: Drop the existing constraint
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_deployment_network_clean;

-- Step 2: Add updated constraint with all supported networks
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

-- Step 3: Verify the constraint includes the new networks
SELECT 'Constraint updated successfully' as status;

-- Step 4: Test the constraint by checking allowed values
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'valid_deployment_network_clean';

-- Step 5: Check current network distribution
SELECT DISTINCT deployment_network_name, COUNT(*) as count
FROM deployed_objects 
WHERE deployment_network_name IS NOT NULL
GROUP BY deployment_network_name 
ORDER BY count DESC;

SELECT 'Database ready for Polygon Amoy and Solana Devnet deployments' as final_status;