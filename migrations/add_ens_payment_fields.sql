-- ENS Payment Integration - Database Migration
-- Date: February 3, 2026
-- Purpose: Add ENS payment configuration fields to deployed_objects table

-- Add ENS payment columns
ALTER TABLE deployed_objects
  ADD COLUMN IF NOT EXISTS ens_payment_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ens_domain VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ens_resolved_address VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ens_resolver_network VARCHAR(50) DEFAULT 'mainnet',
  ADD COLUMN IF NOT EXISTS ens_last_resolved TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ens_avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS ens_verified BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN deployed_objects.ens_payment_enabled IS 'Whether ENS payment method is enabled for this agent';
COMMENT ON COLUMN deployed_objects.ens_domain IS 'ENS domain name (e.g., alice.eth)';
COMMENT ON COLUMN deployed_objects.ens_resolved_address IS 'Ethereum address resolved from ENS domain';
COMMENT ON COLUMN deployed_objects.ens_resolver_network IS 'Network used for ENS resolution (mainnet or sepolia)';
COMMENT ON COLUMN deployed_objects.ens_last_resolved IS 'Timestamp of last successful ENS resolution';
COMMENT ON COLUMN deployed_objects.ens_avatar_url IS 'Avatar URL from ENS metadata';
COMMENT ON COLUMN deployed_objects.ens_verified IS 'Whether ENS domain ownership is verified';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deployed_objects_ens_domain 
  ON deployed_objects(ens_domain) 
  WHERE ens_payment_enabled = true;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_ens_resolved 
  ON deployed_objects(ens_resolved_address) 
  WHERE ens_payment_enabled = true;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_ens_network 
  ON deployed_objects(ens_resolver_network) 
  WHERE ens_payment_enabled = true;

-- Create function to auto-update ens_last_resolved timestamp
CREATE OR REPLACE FUNCTION update_ens_last_resolved()
RETURNS TRIGGER AS $$
BEGIN
  -- Update timestamp when resolved address changes
  IF NEW.ens_resolved_address IS DISTINCT FROM OLD.ens_resolved_address THEN
    NEW.ens_last_resolved = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS trigger_update_ens_last_resolved ON deployed_objects;
CREATE TRIGGER trigger_update_ens_last_resolved
  BEFORE UPDATE ON deployed_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_ens_last_resolved();

-- Add constraint to ensure ENS domain format
ALTER TABLE deployed_objects
  ADD CONSTRAINT check_ens_domain_format 
  CHECK (
    ens_domain IS NULL OR 
    (
      ens_domain ~ '^[a-z0-9-]+\.eth$' AND
      LENGTH(ens_domain) >= 7 AND
      LENGTH(ens_domain) <= 255
    )
  );

-- Add constraint to ensure resolved address format
ALTER TABLE deployed_objects
  ADD CONSTRAINT check_ens_resolved_address_format 
  CHECK (
    ens_resolved_address IS NULL OR 
    ens_resolved_address ~ '^0x[a-fA-F0-9]{40}$'
  );

-- Add constraint to ensure network is valid
ALTER TABLE deployed_objects
  ADD CONSTRAINT check_ens_resolver_network 
  CHECK (
    ens_resolver_network IN ('mainnet', 'sepolia')
  );

-- Migration verification query
-- Run this to verify the migration was successful
DO $$
DECLARE
  column_count INTEGER;
  index_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Check columns exist
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'deployed_objects'
    AND column_name IN (
      'ens_payment_enabled',
      'ens_domain',
      'ens_resolved_address',
      'ens_resolver_network',
      'ens_last_resolved',
      'ens_avatar_url',
      'ens_verified'
    );
  
  -- Check indexes exist
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename = 'deployed_objects'
    AND indexname LIKE 'idx_deployed_objects_ens%';
  
  -- Check trigger exists
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_name = 'trigger_update_ens_last_resolved';
  
  RAISE NOTICE 'Migration Verification:';
  RAISE NOTICE '  Columns added: %/7', column_count;
  RAISE NOTICE '  Indexes created: %/3', index_count;
  RAISE NOTICE '  Triggers created: %/1', trigger_count;
  
  IF column_count = 7 AND index_count = 3 AND trigger_count = 1 THEN
    RAISE NOTICE '  ✅ Migration completed successfully!';
  ELSE
    RAISE WARNING '  ⚠️  Migration incomplete. Please review.';
  END IF;
END $$;
