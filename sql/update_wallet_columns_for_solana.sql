-- Migration: Update wallet address columns to support Solana addresses
-- Date: 2025-01-29
-- Purpose: Expand wallet address columns from varchar(42) to varchar(88)
--          to support both EVM addresses (42 chars) and Solana addresses (44 chars)
-- 
-- Affected columns in deployed_objects table:
-- - owner_wallet: stores the deployer's wallet address
-- - agent_wallet_address: stores the agent's payment receiver address
-- - deployer_address: stores the deployment wallet address
--
-- BLOCKER: agent_deployment_summary view must be dropped and recreated
-- SAFE: This migration only expands column length, no data loss will occur

-- ============================================================================
-- STEP 1: Drop the blocking view
-- ============================================================================

DROP VIEW IF EXISTS agent_deployment_summary CASCADE;

-- ============================================================================
-- STEP 2: Update ALL wallet/address columns to support Solana addresses
-- ============================================================================

-- Original 3 columns (already updated)
ALTER TABLE deployed_objects 
ALTER COLUMN owner_wallet TYPE varchar(88);

ALTER TABLE deployed_objects 
ALTER COLUMN agent_wallet_address TYPE varchar(88);

ALTER TABLE deployed_objects 
ALTER COLUMN deployer_address TYPE varchar(88);

-- Additional 4 columns found with varchar(42) limit
ALTER TABLE deployed_objects 
ALTER COLUMN contract_address TYPE varchar(88);

ALTER TABLE deployed_objects 
ALTER COLUMN token_address TYPE varchar(88);

ALTER TABLE deployed_objects 
ALTER COLUMN deployer_wallet_address TYPE varchar(88);

ALTER TABLE deployed_objects 
ALTER COLUMN payment_recipient_address TYPE varchar(88);

-- ============================================================================
-- STEP 3: Recreate the view with updated column types
-- ============================================================================

CREATE VIEW agent_deployment_summary AS
SELECT 
  deployed_objects.deployer_address,
  deployed_objects.agent_wallet_address,
  deployed_objects.owner_wallet
FROM deployed_objects;

CREATE VIEW agent_deployment_summary AS
SELECT 
  deployed_objects.deployer_address,
  deployed_objects.agent_wallet_address,
  deployed_objects.owner_wallet
FROM deployed_objects;

-- ============================================================================
-- STEP 4: Verify the migration was successful
-- ============================================================================

-- Verify column types were updated
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
AND column_name IN ('owner_wallet', 'agent_wallet_address', 'deployer_address');

-- Verify view was recreated
SELECT * FROM agent_deployment_summary LIMIT 1;

-- ============================================================================
-- ROLLBACK (if needed - ONLY USE IF YOU NEED TO REVERT)
-- ============================================================================
/*
DROP VIEW IF EXISTS agent_deployment_summary CASCADE;

ALTER TABLE deployed_objects ALTER COLUMN owner_wallet TYPE varchar(42);
ALTER TABLE deployed_objects ALTER COLUMN agent_wallet_address TYPE varchar(42);
ALTER TABLE deployed_objects ALTER COLUMN deployer_address TYPE varchar(42);

CREATE VIEW agent_deployment_summary AS
SELECT 
  deployed_objects.deployer_address,
  deployed_objects.agent_wallet_address,
  deployed_objects.owner_wallet
FROM deployed_objects;
*/

-- ============================================================================
-- NOTES
-- ============================================================================
-- EVM wallet address format: 0x + 40 hex chars = 42 characters total
-- Example: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
--
-- Solana wallet address format: Base58 encoded = 32-44 characters (typically 44)
-- Example: Dn382aRJfXJuyE12Yck3mLSXtGeMMjdcSJ7NR5wsQaJd5 (44 chars)
--
-- varchar(88) supports both formats with room for future blockchain addresses
