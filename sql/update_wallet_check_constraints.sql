-- Migration: Update CHECK constraints to support Solana wallet addresses
-- Date: 2025-01-29
-- Purpose: Allow both EVM (0x...) and Solana (base58) wallet address formats

-- ============================================================================
-- STEP 1: Drop old CHECK constraints
-- ============================================================================

ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_agent_wallet_format;

ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_deployer_wallet_format;

ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_agent_wallet_type;

-- ============================================================================
-- STEP 2: Create new CHECK constraints supporting both EVM and Solana
-- ============================================================================

-- Valid agent wallet format: EVM (0x + 40 hex) OR Solana (32-44 base58 chars)
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_agent_wallet_format CHECK (
  (agent_wallet_address IS NULL) 
  OR (agent_wallet_address::text ~ '^0x[a-fA-F0-9]{40}$')  -- EVM format
  OR (agent_wallet_address::text ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$')  -- Solana base58 format
);

-- Valid deployer wallet format: EVM (0x + 40 hex) OR Solana (32-44 base58 chars)
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_deployer_wallet_format CHECK (
  (deployer_wallet_address IS NULL) 
  OR (deployer_wallet_address::text ~ '^0x[a-fA-F0-9]{40}$')  -- EVM format
  OR (deployer_wallet_address::text ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$')  -- Solana base58 format
);

-- Valid agent wallet type: Add 'solana_wallet' to allowed values
ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_agent_wallet_type CHECK (
  (agent_wallet_type IS NULL) 
  OR (agent_wallet_type::text = ANY (ARRAY[
    'mynearwallet'::text, 
    'evm_wallet'::text, 
    'solana'::text,
    'solana_wallet'::text,  -- NEW: Added for Solana wallets
    'flow_wallet'::text
  ]))
);

-- ============================================================================
-- NOTES
-- ============================================================================
-- EVM wallet address regex: ^0x[a-fA-F0-9]{40}$
--   - Starts with "0x"
--   - Followed by exactly 40 hexadecimal characters
--   - Example: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
--
-- Solana wallet address regex: ^[1-9A-HJ-NP-Za-km-z]{32,44}$
--   - Base58 encoding (excludes 0, O, I, l to avoid confusion)
--   - Length between 32-44 characters (typically 44)
--   - Example: Dn382aRJfXJuyE12Yck3mLSXtGeMMjdcSJ7NR5wsQaJd5
