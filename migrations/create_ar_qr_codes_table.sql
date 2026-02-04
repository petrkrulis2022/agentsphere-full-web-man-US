-- Create AR QR Codes Table for ENS Payment Tracking
-- Date: February 4, 2026

CREATE TABLE IF NOT EXISTS ar_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES deployed_objects(id) ON DELETE CASCADE,
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('ens', 'wallet', 'token')),
  
  -- ENS specific fields
  ens_domain VARCHAR(255),
  ens_resolved_address VARCHAR(42),
  ens_resolver_network VARCHAR(20) CHECK (ens_resolver_network IN ('mainnet', 'sepolia')),
  
  -- Payment details
  amount DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(20) NOT NULL,
  recipient_address VARCHAR(42) NOT NULL,
  
  -- QR code data
  qr_code_data TEXT NOT NULL,
  qr_code_format VARCHAR(20) DEFAULT 'eip681',
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'generated' 
    CHECK (status IN ('generated', 'active', 'scanned', 'paid', 'expired', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiration_time TIMESTAMPTZ NOT NULL,
  scanned_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Transaction details
  transaction_hash VARCHAR(66),
  transaction_network VARCHAR(50),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_agent_id ON ar_qr_codes(agent_id);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_status ON ar_qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_expiration ON ar_qr_codes(expiration_time);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_ens_domain ON ar_qr_codes(ens_domain) WHERE ens_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_created_at ON ar_qr_codes(created_at DESC);

-- Function to auto-expire old QR codes
CREATE OR REPLACE FUNCTION expire_old_qr_codes()
RETURNS void AS $$
BEGIN
  UPDATE ar_qr_codes
  SET status = 'expired'
  WHERE expiration_time < NOW()
    AND status IN ('generated', 'active');
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE ar_qr_codes IS 'Stores generated QR codes for AR agent payments including ENS-based payments';
COMMENT ON COLUMN ar_qr_codes.payment_type IS 'Type of payment: ens (ENS domain), wallet (direct address), token (ERC-20)';
COMMENT ON COLUMN ar_qr_codes.ens_domain IS 'ENS domain used for payment (e.g., cube-pay.eth)';
COMMENT ON COLUMN ar_qr_codes.qr_code_format IS 'Format of QR code data (eip681 for Ethereum payments)';
COMMENT ON COLUMN ar_qr_codes.status IS 'Payment status: generated, active, scanned, paid, expired, cancelled';

-- Enable Row Level Security (optional but recommended)
ALTER TABLE ar_qr_codes ENABLE ROW LEVEL SECURITY;

-- Policy to allow read access to all authenticated users
CREATE POLICY "Allow read access to ar_qr_codes" ON ar_qr_codes
  FOR SELECT
  USING (true);

-- Policy to allow insert for authenticated users
CREATE POLICY "Allow insert to ar_qr_codes" ON ar_qr_codes
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow update for authenticated users
CREATE POLICY "Allow update to ar_qr_codes" ON ar_qr_codes
  FOR UPDATE
  USING (true);
