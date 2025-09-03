-- Fix Network Constraint - Step by Step Approach
-- Purpose: Clean existing data and update constraint safely
-- Date: September 3, 2025

-- Step 1: First let's see what network values currently exist
SELECT DISTINCT network, COUNT(*) as count
FROM deployed_objects 
GROUP BY network 
ORDER BY count DESC;

-- Step 2: Also check deployment_network_name values
SELECT DISTINCT deployment_network_name, COUNT(*) as count
FROM deployed_objects 
WHERE deployment_network_name IS NOT NULL
GROUP BY deployment_network_name 
ORDER BY count DESC;

-- Step 3: Drop existing constraints first
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_network;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS deployed_objects_network_check;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS check_valid_network;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_network_comprehensive;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_deployment_network;

-- Step 4: Update any invalid network names to valid ones
UPDATE deployed_objects 
SET network = CASE 
    WHEN network LIKE '%Ethereum%' AND network NOT IN ('Ethereum Sepolia', 'Ethereum Mainnet') THEN 'Ethereum Sepolia'
    WHEN network LIKE '%BlockDAG%' THEN 'BlockDAG Testnet'
    WHEN network LIKE '%Hedera%' THEN 'Hedera Testnet'
    WHEN network LIKE '%Polygon%' THEN 'Polygon Testnet'
    WHEN network LIKE '%Arbitrum%' THEN 'Arbitrum Sepolia'
    WHEN network LIKE '%Base%' THEN 'Base Sepolia'
    WHEN network LIKE '%Optimism%' OR network LIKE '%OP%' THEN 'OP Sepolia'
    WHEN network LIKE '%Avalanche%' THEN 'Avalanche Fuji'
    ELSE network
END
WHERE network NOT IN (
    'Hedera Testnet', 'Hedera Mainnet', 
    'BlockDAG Testnet', 'BlockDAG Mainnet',
    'Polygon Testnet', 'Polygon Mainnet',
    'Ethereum Testnet', 'Ethereum Mainnet',
    'Ethereum Sepolia', 'Arbitrum Sepolia', 
    'Base Sepolia', 'OP Sepolia', 'Avalanche Fuji',
    'Ethereum', 'Arbitrum One', 'Base', 'Optimism', 'Avalanche'
);

-- Step 5: Update deployment_network_name similarly
UPDATE deployed_objects 
SET deployment_network_name = CASE 
    WHEN deployment_network_name LIKE '%Ethereum%' AND deployment_network_name NOT IN ('Ethereum Sepolia', 'Ethereum Mainnet') THEN 'Ethereum Sepolia'
    WHEN deployment_network_name LIKE '%BlockDAG%' THEN 'BlockDAG Testnet'
    WHEN deployment_network_name LIKE '%Hedera%' THEN 'Hedera Testnet'
    WHEN deployment_network_name LIKE '%Polygon%' THEN 'Polygon Testnet'
    WHEN deployment_network_name LIKE '%Arbitrum%' THEN 'Arbitrum Sepolia'
    WHEN deployment_network_name LIKE '%Base%' THEN 'Base Sepolia'
    WHEN deployment_network_name LIKE '%Optimism%' OR deployment_network_name LIKE '%OP%' THEN 'OP Sepolia'
    WHEN deployment_network_name LIKE '%Avalanche%' THEN 'Avalanche Fuji'
    ELSE deployment_network_name
END
WHERE deployment_network_name IS NOT NULL 
AND deployment_network_name NOT IN (
    'Hedera Testnet', 'Hedera Mainnet', 
    'BlockDAG Testnet', 'BlockDAG Mainnet',
    'Polygon Testnet', 'Polygon Mainnet',
    'Ethereum Testnet', 'Ethereum Mainnet',
    'Ethereum Sepolia', 'Arbitrum Sepolia', 
    'Base Sepolia', 'OP Sepolia', 'Avalanche Fuji',
    'Ethereum', 'Arbitrum One', 'Base', 'Optimism', 'Avalanche'
);

-- Step 6: Now add the constraints (they should work since we cleaned the data)
ALTER TABLE deployed_objects ADD CONSTRAINT valid_network_clean CHECK (
  network IN (
    'Hedera Testnet', 'Hedera Mainnet', 
    'BlockDAG Testnet', 'BlockDAG Mainnet',
    'Polygon Testnet', 'Polygon Mainnet',
    'Ethereum Testnet', 'Ethereum Mainnet',
    'Ethereum Sepolia', 'Arbitrum Sepolia', 
    'Base Sepolia', 'OP Sepolia', 'Avalanche Fuji',
    'Ethereum', 'Arbitrum One', 'Base', 'Optimism', 'Avalanche',
    'BSC Testnet', 'BSC Mainnet', 'Fantom Testnet', 'Fantom Mainnet'
  )
);

ALTER TABLE deployed_objects ADD CONSTRAINT valid_deployment_network_clean CHECK (
  deployment_network_name IS NULL OR deployment_network_name IN (
    'Hedera Testnet', 'Hedera Mainnet', 
    'BlockDAG Testnet', 'BlockDAG Mainnet',
    'Polygon Testnet', 'Polygon Mainnet',
    'Ethereum Testnet', 'Ethereum Mainnet',
    'Ethereum Sepolia', 'Arbitrum Sepolia', 
    'Base Sepolia', 'OP Sepolia', 'Avalanche Fuji',
    'Ethereum', 'Arbitrum One', 'Base', 'Optimism', 'Avalanche',
    'BSC Testnet', 'BSC Mainnet', 'Fantom Testnet', 'Fantom Mainnet'
  )
);

-- Step 7: Verify the fix worked
SELECT DISTINCT network, COUNT(*) as count
FROM deployed_objects 
GROUP BY network 
ORDER BY count DESC;

SELECT DISTINCT deployment_network_name, COUNT(*) as count
FROM deployed_objects 
WHERE deployment_network_name IS NOT NULL
GROUP BY deployment_network_name 
ORDER BY count DESC;

-- Step 8: Verify constraints are working
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name IN ('valid_network_clean', 'valid_deployment_network_clean');
