/*
  Payment Cube System - Database Schema Updates
  
  Add payment methods configuration to deployed_objects table
  for 6-faced cube payment system integration
*/

-- Add payment methods configuration columns
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{}';
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS payment_config JSONB DEFAULT '{}';

-- Add indexes for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_deployed_objects_payment_methods 
ON deployed_objects USING GIN (payment_methods) 
WHERE payment_methods IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_payment_config 
ON deployed_objects USING GIN (payment_config) 
WHERE payment_config IS NOT NULL;

-- Add comments for the new columns
COMMENT ON COLUMN deployed_objects.payment_methods IS 'JSON object containing enabled payment methods configuration for the 6-faced cube system';
COMMENT ON COLUMN deployed_objects.payment_config IS 'JSON object containing payment method specific configuration data (wallet addresses, bank details, etc.)';

-- Example of payment_methods structure:
-- {
--   "crypto_qr": {"enabled": true, "wallet_address": "0x..."},
--   "bank_virtual_card": {"enabled": false, "bank_details": {...}},
--   "bank_qr": {"enabled": false, "bank_details": {...}},
--   "voice_pay": {"enabled": true, "wallet_address": "0x..."},
--   "sound_pay": {"enabled": false, "wallet_address": "0x..."},
--   "onboard_crypto": {"enabled": true}
-- }

SELECT 'Payment Cube System schema updated successfully!' as status;
