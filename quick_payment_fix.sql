-- Quick fix: Add payment columns to deployed_objects table
-- This should be executed in your Supabase SQL editor

ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS payment_config JSONB DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deployed_objects_payment_methods 
ON deployed_objects USING GIN (payment_methods);

CREATE INDEX IF NOT EXISTS idx_deployed_objects_payment_config 
ON deployed_objects USING GIN (payment_config);

-- Add comments
COMMENT ON COLUMN deployed_objects.payment_methods IS 'Configuration for the 6 payment methods: crypto_qr, bank_virtual_card, bank_qr, voice_pay, sound_pay, onboard_crypto';
COMMENT ON COLUMN deployed_objects.payment_config IS 'Additional configuration data for payment methods including bank details, wallet addresses, etc';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
AND column_name IN ('payment_methods', 'payment_config');
