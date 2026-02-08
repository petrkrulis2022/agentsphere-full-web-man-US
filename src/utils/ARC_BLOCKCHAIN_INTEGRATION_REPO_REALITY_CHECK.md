# Arc / CCTP / Gateway — Repo Reality Check & Migration Plan

**Date:** 2026-02-08
**Scope:** This document is a _repo-grounded_ companion to `ARC_BLOCKCHAIN_INTEGRATION_SUMMARY.md`.

The existing Arc summary describes an Arc Gateway + CCTP implementation with specific “Core Files” (e.g. `packages/wallet-connector/...`, `apps/deploy-cube/...`). **Those paths do not exist in this workspace**, so that summary currently reads as an _intended architecture_ rather than what is actually implemented.

---

## 1) What’s Actually Implemented Today (in this repo)

### Wallet / UX

- **MetaMask / EVM wallet support exists** via the multi-chain wallet flow.

### Cross-chain payments (CCIP)

- **Chainlink CCIP is present as configuration + service wiring**, but **cross-chain execution is currently simulated/mocked** in the payment processing path.

### Persistence / sessions

- Backend uses **in-memory payment sessions** (a `Map`) rather than a persisted `payment_sessions` database table.
- Payment tracking service is **in-memory** and explicitly notes production should use DB.

### Key repo locations (verified)

- `src/services/crossChainPaymentService.ts` — CCIP-oriented estimation + mocked cross-chain execution.
- `src/services/multiChainWalletService.ts` — wallet connect + calls payment processing.
- `src/services/paymentTrackingService.ts` — in-memory tracking (contains CCIP-specific fields).
- `src/config/multiChainNetworks.ts` — network definitions and MetaMask switching helpers.
- `src/config/ccipNetworkConfig.ts` — CCIP routers, selectors, lanes, fee tokens, etc.
- `server.js` — in-memory session map.

---

## 2) What’s Not Implemented (despite being described in Arc summary)

These are **not present in this workspace** (as file paths):

- `packages/wallet-connector/src/circleGateway.ts`
- `packages/wallet-connector/src/connector.ts`
- `apps/deploy-cube/src/components/ARCGatewayConfig.tsx`

Also not present yet (as working integration):

- A real **Circle Gateway / CCTP client** used by the runtime payment flow.
- A DB-backed `payment_sessions` schema that can store “Arc proof” metadata.

---

## 3) Address / Network Notes (Arc summary vs repo)

- The repo’s EVM network configuration heavily targets **testnets**.
- USDC testnet addresses used in CCIP configs match common published Circle testnet USDC addresses for:
  - Sepolia, Base Sepolia, Arbitrum Sepolia, OP Sepolia, Avalanche Fuji.
- The Arc summary lists **Polygon mainnet (137)**; the repo appears to use **Polygon Amoy** in multi-chain contexts. These are different networks with different chain IDs and USDC addresses.

---

## 4) Migration Goal

Replace the current CCIP-oriented (and partially mocked) cross-chain payment flow with a **Circle Gateway / CCTP-based** flow that:

- Works with MetaMask for approvals and sending.
- Supports **USDC cross-chain transfers** using CCTP semantics.
- Can record “proof of Arc usage” in the database.

---

## 5) Minimal, Safe Migration Plan (CCIP → Arc/CCTP)

### Phase A — Add Arc path (no breaking changes)

1. Introduce an `arcEnabled` flag (config + per-deployment/per-cube option).
2. Implement a new payment processor path:
   - Same-chain: normal ERC-20 transfer / existing flow.
   - Cross-chain: **Gateway/CCTP transfer** (real implementation), returning a real `transferId` / `txHash` / attestation reference.
3. Keep CCIP path available for rollback while Arc path is tested.

### Phase B — Persist sessions (required for “proof”)

4. Add a DB table `payment_sessions` (or extend existing payment cube tables) to persist session state and metadata.
5. Update server-side session handling (`server.js`) to write through to DB.

### Phase C — Deprecate & remove CCIP

6. Remove CCIP-only fields in tracking/UI, or keep them as legacy fields for history.
7. Remove CCIP configs and lanes when Arc path is stable.

---

## 6) “Proof We Use Arc” — Suggested DB Fields

If hackathon judging or internal auditing requires proof, store these fields per payment session:

### Required

- `arc_enabled` (boolean)
- `arc_provider` (text) — e.g. `circle_gateway`
- `arc_source_chain_id` (int)
- `arc_destination_chain_id` (int)
- `arc_token` (text) — `USDC`
- `arc_amount` (numeric / text)

### Strongly recommended

- `arc_transfer_id` (text) — gateway transfer identifier
- `arc_attestation_id` (text, nullable)
- `arc_status` (text) — `initiated|pending_attestation|minted|completed|failed`
- `arc_fee_amount` (numeric/text)
- `arc_metadata` (jsonb) — raw provider payload for debugging/judging

### Legacy (if keeping CCIP history)

- `ccip_message_id`, `ccip_fee_amount` (nullable)

---

## 7) Product Flow Mapping (POS / MyTerminal / ARTM)

All three flows can share the same abstraction:

- Create `payment_session` (amount, token, sourceChain, destinationChain, destinationAddress).
- Execute payment (same-chain or cross-chain).
- Track status updates.

Differences are primarily **UI/entry-point**:

- **POS:** cashier-triggered, QR or tap-to-pay style.
- **MyTerminal:** online checkout + status page.
- **ARTM:** “withdrawal-like” user flow, but still a payment session under the hood.

---

## 8) What to Update in the Existing Arc Summary

Recommended: keep `ARC_BLOCKCHAIN_INTEGRATION_SUMMARY.md` as the _architecture/intended design_, and add a short section at the top linking to this file for implementation reality and TODOs.
