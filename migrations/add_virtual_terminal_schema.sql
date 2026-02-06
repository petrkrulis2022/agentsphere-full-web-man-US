/*
  ARTM Virtual Terminal Schema Migration
  
  Adds support for Augmented Reality Teller Machines (ARTM) to deployed_objects table.
  Includes bank integrations, exchange integrations, and terminal display configuration.
  
  Date: February 5, 2026
  Status: MVP Implementation
*/

-- Step 1: Add 'Virtual Terminal' to valid_agent_type constraint
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS valid_agent_type;

ALTER TABLE deployed_objects 
ADD CONSTRAINT valid_agent_type 
CHECK ((agent_type IS NULL) OR (agent_type = ANY (ARRAY[
  'Intelligent Assistant'::text,
  'Local Services'::text, 
  'Payment Terminal'::text,
  'Trailing Payment Terminal'::text,
  'My Ghost'::text,
  'Game Agent'::text,
  '3D World Builder'::text,
  'Home Security'::text,
  'Content Creator'::text,
  'Real Estate Broker'::text,
  'Bus Stop Agent'::text,
  'Virtual Terminal'::text,
  'ai_agent'::text, 
  'study_buddy'::text, 
  'tutor'::text, 
  'landmark'::text, 
  'building'::text
])));

-- Step 2: Add bank_integrations column (text array)
-- Stores enabled banks: ['Revolut', 'HSBC', 'Deutsche Bank', 'Santander', 'ING', 'BNP Paribas', 'Bank of America', 'Chase']
ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS bank_integrations text[] DEFAULT ARRAY['Revolut']::text[];

-- Step 3: Add exchange_integrations column (text array)
-- Stores enabled crypto exchanges: ['Binance', 'Coinbase', 'Kraken', 'Bybit', 'OKX']
ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS exchange_integrations text[] DEFAULT ARRAY[]::text[];

-- Step 4: Add terminal_display_config column (JSONB)
-- Stores configuration for Virtual Terminal UI display
-- Structure:
-- {
--   "mock_balance_eur": 2450.67,
--   "mock_wallet_usdc": 1250.00,
--   "dispenser_id": "ATM_CZ_001",
--   "ui_theme": "revolut"
-- }
ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS terminal_display_config jsonb DEFAULT jsonb_build_object(
  'mock_balance_eur'::text, 2450.67::numeric,
  'mock_wallet_usdc'::text, 1250.00::numeric,
  'dispenser_id'::text, 'ATM_CZ_001'::text,
  'ui_theme'::text, 'revolut'::text
);

-- Step 4a: Add card_payments_enabled column (boolean)
-- Stores whether card payment interactions are enabled
ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS card_payments_enabled boolean DEFAULT false;

-- Step 4b: Add wallet_management_enabled column (boolean)
-- Stores whether wallet management interactions are enabled
ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS wallet_management_enabled boolean DEFAULT false;

-- Step 5: Create indexes for Virtual Terminal queries
CREATE INDEX IF NOT EXISTS idx_virtual_terminal_agents 
ON deployed_objects (agent_type) 
WHERE agent_type = 'Virtual Terminal';

CREATE INDEX IF NOT EXISTS idx_bank_integrations 
ON deployed_objects USING GIN (bank_integrations) 
WHERE agent_type = 'Virtual Terminal';

CREATE INDEX IF NOT EXISTS idx_exchange_integrations 
ON deployed_objects USING GIN (exchange_integrations) 
WHERE agent_type = 'Virtual Terminal';

CREATE INDEX IF NOT EXISTS idx_terminal_config 
ON deployed_objects USING GIN (terminal_display_config) 
WHERE agent_type = 'Virtual Terminal';

-- Step 6: Add constraint to ensure Virtual Terminal has required fields
ALTER TABLE deployed_objects 
DROP CONSTRAINT IF EXISTS virtual_terminal_config_required;

ALTER TABLE deployed_objects 
ADD CONSTRAINT virtual_terminal_config_required 
CHECK (
  (agent_type != 'Virtual Terminal') OR 
  (bank_integrations IS NOT NULL AND array_length(bank_integrations, 1) > 0)
);

-- Step 7: Add comment to new columns
COMMENT ON COLUMN deployed_objects.bank_integrations IS 'Array of enabled bank integrations for ARTM (e.g., [''Revolut'', ''ČSOB''])';
COMMENT ON COLUMN deployed_objects.exchange_integrations IS 'Array of enabled crypto exchange integrations for ARTM (e.g., [''Binance'', ''Coinbase''])';
COMMENT ON COLUMN deployed_objects.terminal_display_config IS 'JSONB configuration for Virtual Terminal UI: mock_balance_eur, mock_wallet_usdc, dispenser_id, ui_theme';
COMMENT ON COLUMN deployed_objects.card_payments_enabled IS 'Boolean flag for Card Payments interaction method';
COMMENT ON COLUMN deployed_objects.wallet_management_enabled IS 'Boolean flag for Wallet Management interaction method';

-- Step 8: Create function to validate Virtual Terminal configuration
CREATE OR REPLACE FUNCTION validate_virtual_terminal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If this is a Virtual Terminal, ensure required fields are set
  IF NEW.agent_type = 'Virtual Terminal' THEN
    -- Ensure at least one bank is selected
    IF NEW.bank_integrations IS NULL OR array_length(NEW.bank_integrations, 1) = 0 THEN
      RAISE EXCEPTION 'Virtual Terminal must have at least one bank integration enabled';
    END IF;
    
    -- Ensure terminal_display_config exists
    IF NEW.terminal_display_config IS NULL THEN
      NEW.terminal_display_config := jsonb_build_object(
        'mock_balance_eur'::text, 2450.67::numeric,
        'mock_wallet_usdc'::text, 1250.00::numeric,
        'dispenser_id'::text, 'ATM_CZ_001'::text,
        'ui_theme'::text, 'revolut'::text
      );
    END IF;
    
    -- Ensure payment_methods is null for Virtual Terminals
    NEW.payment_methods := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 9: Create trigger for Virtual Terminal validation
DROP TRIGGER IF EXISTS validate_virtual_terminal_trigger ON deployed_objects;

CREATE TRIGGER validate_virtual_terminal_trigger
BEFORE INSERT OR UPDATE ON deployed_objects
FOR EACH ROW
EXECUTE FUNCTION validate_virtual_terminal();

-- Success message
SELECT 'ARTM Virtual Terminal schema migration completed successfully!' as status;
