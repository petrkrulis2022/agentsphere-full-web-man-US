-- Payment Sessions with Arc proof fields
-- Replaces in-memory paymentSessions Map in server.js
-- Supports terminal sessions, Bridge Kit / CCTP routing, and hackathon Arc proof

CREATE TABLE IF NOT EXISTS public.payment_sessions (
  -- Session core
  id              TEXT PRIMARY KEY,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'completed', 'cancelled', 'expired', 'failed')),
  amount          NUMERIC NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  token           TEXT DEFAULT 'USDC',
  merchant_id     TEXT NOT NULL,
  merchant_name   TEXT,
  terminal_agent_id TEXT NOT NULL,
  terminal_owner  TEXT,          -- wallet address of terminal agent
  payment_method  TEXT,          -- crypto | revolut_qr | revolut_card
  redirect_url    TEXT,
  cart_data       JSONB,
  metadata        JSONB DEFAULT '{}'::jsonb,

  -- Payment completion fields
  transaction_hash    TEXT,      -- source chain tx hash (crypto)
  revolut_payment_id  TEXT,      -- Revolut payment id (fiat)
  user_wallet         TEXT,
  payment_proof       TEXT,
  completed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancel_reason       TEXT,

  -- Rail selector
  rail            TEXT CHECK (rail IN ('ccip', 'bridgekit', 'gateway')),

  -- Arc proof fields (hackathon requirement)
  arc_enabled               BOOLEAN DEFAULT FALSE,
  arc_source_chain_id       INTEGER,
  arc_destination_chain_id  INTEGER,
  arc_intermediate_chain_id INTEGER,   -- 5042002 when routing through Arc
  arc_usdc_address          TEXT,      -- 0x3600000000000000000000000000000000000000

  -- CCTP / Bridge Kit metadata
  cctp_source_domain        INTEGER,
  cctp_destination_domain   INTEGER,
  cctp_intermediate_domain  INTEGER,   -- 26 for Arc Testnet
  bridge_transfer_id        TEXT,
  attestation_status        TEXT,

  -- Tx pointers (multi-hop)
  source_tx_hash      TEXT,
  arc_tx_hash         TEXT,
  destination_tx_hash TEXT,

  -- Raw payload store (hackathon proof / debugging)
  arc_metadata        JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON public.payment_sessions (status);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_terminal ON public.payment_sessions (terminal_agent_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_merchant ON public.payment_sessions (merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_arc ON public.payment_sessions (arc_enabled) WHERE arc_enabled = TRUE;

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.update_payment_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_sessions_updated_at
  BEFORE UPDATE ON public.payment_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_sessions_updated_at();

-- Enable RLS (rows are server-managed, so default deny is fine for now)
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (backend uses service role key)
CREATE POLICY "service_role_full_access" ON public.payment_sessions
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);
