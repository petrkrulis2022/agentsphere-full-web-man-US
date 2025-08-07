-- Wallet Integration Fixes - Manual Application
-- Apply these SQL statements in Supabase Dashboard -> SQL Editor

-- STEP 1: First, let's check what invalid wallet addresses exist
-- (Run this first to see what we're dealing with)
SELECT id, name, agent_wallet_address, owner_wallet 
FROM deployed_objects 
WHERE agent_wallet_address IS NOT NULL 
  AND NOT (agent_wallet_address ~ '^0x[a-fA-F0-9]{40}$');

-- STEP 2: Clean up any existing invalid/mock addresses BEFORE adding constraints
UPDATE deployed_objects 
SET agent_wallet_address = NULL
WHERE agent_wallet_address IS NOT NULL 
  AND NOT (agent_wallet_address ~ '^0x[a-fA-F0-9]{40}$');

-- STEP 3: Also clean up specific known mock addresses
UPDATE deployed_objects 
SET agent_wallet_address = NULL
WHERE agent_wallet_address IN ('0x...', '0xD7CAB219...') 
   OR agent_wallet_address LIKE '%mock%'
   OR agent_wallet_address = '';

-- STEP 4: Add new columns
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployer_wallet_address VARCHAR(42);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS payment_recipient_address VARCHAR(42);

-- STEP 5: Now add constraints (after data is cleaned)
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_agent_wallet_format;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_agent_wallet_format 
CHECK (
  (agent_wallet_address IS NULL) OR 
  (agent_wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- STEP 6: Add constraints for new columns
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

-- STEP 7: Add indexes for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_deployed_objects_deployer_wallet 
ON deployed_objects (deployer_wallet_address) 
WHERE deployer_wallet_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_payment_recipient 
ON deployed_objects (payment_recipient_address) 
WHERE payment_recipient_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_owner_wallet 
ON deployed_objects (owner_wallet) 
WHERE owner_wallet IS NOT NULL;
