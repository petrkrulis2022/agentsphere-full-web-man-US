-- Quick fix for both network constraints - copy and paste this into Supabase SQL editor

ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_network_clean;
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_deployment_network_clean;

ALTER TABLE deployed_objects ADD CONSTRAINT valid_network_clean CHECK (network IS NULL OR network IN ('Hedera Testnet', 'Hedera Mainnet', 'BlockDAG Testnet', 'BlockDAG Mainnet', 'Polygon Testnet', 'Polygon Mainnet', 'Ethereum Testnet', 'Ethereum Mainnet', 'Ethereum', 'Arbitrum One', 'Base', 'Optimism', 'Avalanche', 'BSC Testnet', 'BSC Mainnet', 'Fantom Testnet', 'Fantom Mainnet', 'Ethereum Sepolia', 'Arbitrum Sepolia', 'Base Sepolia', 'OP Sepolia', 'Avalanche Fuji', 'Polygon Amoy', 'Solana Devnet', 'Hedera Testnet', 'XRP Ledger Testnet', 'Tron Shasta Testnet', 'Starknet Sepolia'));

ALTER TABLE deployed_objects ADD CONSTRAINT valid_deployment_network_clean CHECK (deployment_network_name IS NULL OR deployment_network_name IN ('Hedera Testnet', 'Hedera Mainnet', 'BlockDAG Testnet', 'BlockDAG Mainnet', 'Polygon Testnet', 'Polygon Mainnet', 'Ethereum Testnet', 'Ethereum Mainnet', 'Ethereum', 'Arbitrum One', 'Base', 'Optimism', 'Avalanche', 'BSC Testnet', 'BSC Mainnet', 'Fantom Testnet', 'Fantom Mainnet', 'Ethereum Sepolia', 'Arbitrum Sepolia', 'Base Sepolia', 'OP Sepolia', 'Avalanche Fuji', 'Polygon Amoy', 'Solana Devnet', 'Hedera Testnet', 'XRP Ledger Testnet', 'Tron Shasta Testnet', 'Starknet Sepolia'));

SELECT 'Both constraints fixed - Polygon Amoy deployments should work now!' as status;