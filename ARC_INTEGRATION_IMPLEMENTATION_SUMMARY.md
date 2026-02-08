# Arc Integration — Implementation Summary

**Branch:** `arc-integration` (off `revolut-pay-sim-solana-hedera-ai`)  
**Date:** February 8, 2026  
**Status:** All deliverables complete, zero TypeScript errors

---

## What Was Delivered

### 1. Arc Testnet Added to Network Registry
**File:** `src/config/multiChainNetworks.ts`

- Added `circleDomainId?: number` to `NetworkConfig` interface
- Added `ARC_TESTNET` entry to `EVM_NETWORKS`:
  - Chain ID: `5042002`
  - RPC: `https://rpc.testnet.arc.network`
  - Explorer: `https://testnet.arcscan.app`
  - Native gas token: USDC (18 decimals)
  - USDC proxy address: `0x3600000000000000000000000000000000000000`
  - Circle CCTP domain: `26`
- Populated `circleDomainId` on existing networks:
  - Ethereum Sepolia → `0`
  - Base Sepolia → `6`
  - Avalanche Fuji → `1`

---

### 2. Supabase `payment_sessions` Migration
**File:** `supabase/migrations/20260208120000_create_payment_sessions.sql`

Full schema created with:
- **Session core:** id (UUID PK), status, amount, currency, merchant_id, terminal_agent_id, customer_wallet_address
- **Rail selector:** `rail` column (`ccip | bridgekit | gateway`)
- **Arc proof fields:** arc_enabled, arc_source_chain_id, arc_destination_chain_id, arc_intermediate_chain_id, arc_usdc_address
- **CCTP/Bridge Kit metadata:** cctp_source_domain, cctp_destination_domain, cctp_intermediate_domain, bridge_transfer_id, attestation_status
- **Transaction pointers:** source_tx_hash, arc_tx_hash, destination_tx_hash
- **JSONB extension:** arc_metadata for arbitrary extra data
- **Infrastructure:** indexes, updated_at trigger, RLS with service_role bypass policy

---

### 3. In-Memory Sessions → Supabase CRUD
**File:** `server.js`

- Added `@supabase/supabase-js` import + client initialization (falls back to in-memory if env vars missing)
- Replaced synchronous `storePaymentSession` / `getPaymentSession` / `updatePaymentSession` with async Supabase-backed versions
- Added `mapDbToSession()` / `mapSessionToDb()` helpers (camelCase ↔ snake_case translation)
- All 4 existing terminal endpoints (`POST /create`, `GET /:sessionId`, `POST /:sessionId/pay`, `POST /:sessionId/cancel`) now `await` their session calls
- **Backwards-compatible:** no changes to request/response shapes for existing endpoints

---

### 4. Bridge Kit Endpoints
**File:** `server.js`

#### `POST /api/payments/terminal/:sessionId/bridgekit/start`
- Sets `rail = bridgekit`, `arc_enabled = true`
- Pre-fills Arc routing fields (source/intermediate/destination chain IDs and CCTP domains)
- Returns a `routePlan` object with:
  - Source chain + CCTP domain
  - Intermediate (Arc) chain + CCTP domain
  - Destination chain + CCTP domain
  - Estimated fee and time
  - List of `requiredFields` the AR Viewer must send back

#### `POST /api/payments/terminal/:sessionId/bridgekit/update`
- Accepts: `bridge_transfer_id`, `attestation_status`, `source_tx_hash`, `arc_tx_hash`, `destination_tx_hash`, `step`, `outcome`, `metadata`
- Persists all fields to the session
- Auto-updates session status to `completed` on final step

---

### 5. Cross-Chain Payment Service — Bridge Kit Rail
**File:** `src/services/crossChainPaymentService.ts`

#### New Types & Constants
- `PaymentRail` type: `"ccip" | "bridgekit" | "gateway"`
- `BridgeKitRoutePlan` interface (source/intermediate/destination legs with chain IDs and CCTP domains)
- Arc constants: `ARC_CHAIN_ID = 5042002`, `ARC_CCTP_DOMAIN = 26`, `ARC_USDC_ADDRESS`
- `CIRCLE_DOMAIN_MAP`: chainId → CCTP domain lookup

#### New Methods
| Method | Purpose |
|--------|---------|
| `detectRail(source, destination)` | Auto-selects `bridgekit` if either end is Arc, otherwise `ccip` |
| `canRouteViaBridgeKit(srcChainId, dstChainId)` | Returns true if both chains have known CCTP domains |
| `buildBridgeKitRoutePlan(srcChainId, dstChainId, amount)` | Constructs the full 3-leg route plan with fee estimate |
| `processBridgeKitPayment(request)` | Returns `clientMustExecute: true` + `routePlan` (AR Viewer calls Bridge Kit SDK) |

#### Updated Methods
- **`estimatePayment()`** — Checks Bridge Kit availability first; returns lower fees (~0.1% + $0.50) and faster time (`<30 seconds`) with Arc as intermediate hop. Falls through to CCIP if Bridge Kit unavailable.
- **`processPayment()`** — Detects rail via `request.rail || detectRail()`. Routes to `processBridgeKitPayment()` for Bridge Kit rail, otherwise keeps existing CCIP path intact.

---

### 6. Environment Configuration
**File:** `.env.example`

Added:
- `VITE_SUPABASE_SERVICE_ROLE_KEY` (required for server-side session persistence)
- `API_PORT`, Revolut sandbox vars, `USE_MOCK_CARDS`
- Arc Testnet reference constants (chain ID, RPC, explorer, USDC address, CCTP domain, faucet)

---

## Architecture Flow

```
Customer Wallet (MetaMask)
    │
    ▼
AR Viewer Frontend
    │
    ├─ POST /terminal/create          → Creates session in Supabase
    ├─ POST /terminal/:id/bridgekit/start → Gets route plan (source → Arc → dest)
    │
    │  (Frontend calls Bridge Kit SDK with route plan)
    │
    ├─ POST /terminal/:id/bridgekit/update → Reports progress (step/tx hashes)
    └─ GET  /terminal/:id              → Polls session status
```

## Key Design Decisions

1. **Additive, not destructive** — CCIP paths untouched; Bridge Kit is a new rail alongside
2. **Client-side execution** — Backend provides the route plan, AR Viewer frontend calls Bridge Kit SDK with wallet signer
3. **Arc as settlement hub** — All Bridge Kit cross-chain transfers route through Arc Testnet (CCTP domain 26)
4. **Graceful fallback** — If Supabase env vars are missing, server falls back to in-memory Map (dev mode)
5. **Backwards-compatible** — Existing terminal endpoint request/response shapes unchanged

## Pending / Next Steps

- [ ] Run Supabase migration against project DB
- [ ] Install `@supabase/supabase-js` if not already in server dependencies
- [ ] AR Viewer team: integrate Bridge Kit SDK (`@circle-fin/bridge-kit` + `viem`) on frontend
- [ ] Add `@circle-fin/bridge-kit` to frontend package.json
- [ ] End-to-end test: Sepolia → Arc → Base Sepolia USDC transfer
- [ ] Optional: Circle Gateway feature-flagged endpoint (secondary priority)
