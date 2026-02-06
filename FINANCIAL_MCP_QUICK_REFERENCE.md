# Financial MCP Servers - Quick Reference Guide

**Date:** February 5, 2026  
**Purpose:** Visual quick reference for all available MCP servers

---

## MCP Servers at a Glance

### 🟣 BLOCKCHAIN NETWORKS (4 Servers)

| Server           | Icon | Network                | Primary Use                                  |
| ---------------- | ---- | ---------------------- | -------------------------------------------- |
| **Solana MCP**   | 🟣   | Solana                 | Fast, low-cost SPL token transfers & queries |
| **Ethereum/EVM** | ⟠    | ETH, Polygon, Arbitrum | Smart contracts, DeFi, gas optimization      |
| **Bitcoin**      | 🟠   | Bitcoin                | UTXO management, on-chain transfers          |
| **Hedera**       | 🔷   | Hedera                 | HTS tokens, Hedera service integration       |

**Common Operations:** `getBalance()`, `sendTransaction()`, `getTokenMetadata()`

---

### 🏦 BANKING & TRANSFERS (3 Servers)

| Server          | Icon | Standard    | Primary Use                              |
| --------------- | ---- | ----------- | ---------------------------------------- |
| **SWIFT**       | 🏦   | ISO 20022   | International wire transfers, AML checks |
| **ACH**         | 🏧   | US Standard | Domestic bank-to-bank transfers          |
| **Revolut API** | 💙   | REST API    | Multi-currency wallets, card management  |

**Common Operations:** `initiateTransfer()`, `verifyAccount()`, `getBalance()`

---

### 💳 PAYMENT PROCESSORS (2 Servers)

| Server     | Icon | Platform       | Primary Use                           |
| ---------- | ---- | -------------- | ------------------------------------- |
| **Stripe** | 🟦   | SaaS Payment   | Card payments, subscriptions, payouts |
| **PayPal** | 📘   | Global Payment | Orders, disputes, seller protection   |

**Common Operations:** `createPaymentIntent()`, `refundPayment()`, `getStatus()`

---

### 🦄 DEFI PROTOCOLS (3 Servers)

| Server      | Icon | Protocol       | Primary Use                                |
| ----------- | ---- | -------------- | ------------------------------------------ |
| **Uniswap** | 🦄   | DEX (EVM)      | Token swaps, liquidity pools, price quotes |
| **Aave**    | 👻   | Lending        | Deposits, borrows, variable/fixed rates    |
| **Curve**   | 📈   | Stablecoin DEX | Stablecoin swaps, efficient trading        |

**Common Operations:** `executeSwap()`, `deposit()`, `borrow()`, `getRate()`

---

### 📊 MARKET DATA & ORACLES (3 Servers)

| Server        | Icon | Data             | Primary Use                          |
| ------------- | ---- | ---------------- | ------------------------------------ |
| **CoinGecko** | 📊   | Crypto Data      | Real-time prices, market cap, trends |
| **Chainlink** | 🔗   | Oracle Network   | Price feeds, randomness, automation  |
| **TheGraph**  | 📈   | Blockchain Index | Custom queries, historical data      |

**Common Operations:** `getPrice()`, `getMarketData()`, `querySubgraph()`

---

### ✅ COMPLIANCE & VERIFICATION (2 Servers)

| Server  | Icon | Service               | Primary Use                              |
| ------- | ---- | --------------------- | ---------------------------------------- |
| **KYC** | ✅   | Identity Verification | Document checks, liveness, AML screening |
| **AML** | 🛡️   | Sanctions Screening   | Wallet risk, sanctions lists, monitoring |

**Common Operations:** `startVerification()`, `assessRisk()`, `checkSanctions()`

---

## Quick Lookup by Use Case

### I want to accept payments...

**Card/Bank Payments:**

```
Stripe ✅ (credit/debit cards)
PayPal ✅ (PayPal wallets)
Revolut API ✅ (EU bank transfers)
SWIFT/ACH ✅ (international transfers)
```

**Cryptocurrency Payments:**

```
Solana MCP ✅ (USDC, SOL)
Ethereum MCP ✅ (USDT, USDC, DAI)
Bitcoin MCP ✅ (BTC only)
```

### I want cryptocurrency price/market data...

```
CoinGecko MCP ✅ (best for prices)
Chainlink MCP ✅ (on-chain prices)
TheGraph MCP ✅ (historical data)
Uniswap MCP ✅ (current DEX prices)
```

### I want to swap/trade tokens...

```
Uniswap MCP ✅ (most liquid)
Curve MCP ✅ (stablecoin pairs)
Aave MCP ✅ (with yield)
CoinGecko MCP ✅ (price research first)
```

### I need to verify users (KYC/AML)...

```
KYC MCP ✅ (document verification)
AML MCP ✅ (sanctions screening)
Chainlink MCP ✅ (oracle-based verification)
```

### I want to offer multi-currency settlement...

```
Solana MCP ✅ (USDC)
Ethereum MCP ✅ (USDT, USDC, DAI)
Revolut MCP ✅ (EUR, GBP, USD, etc)
SWIFT/ACH ✅ (fiat settlement)
```

---

## Configuration Quick Reference

### Minimal Config (Just Enable Server)

```json
{
  "solana-mcp": {
    "enabled": true,
    "network": "mainnet"
  },
  "coingecko-mcp": {
    "enabled": true,
    "api_tier": "free"
  }
}
```

### Full Config (All Required Fields)

```json
{
  "solana-mcp": {
    "enabled": true,
    "network": "mainnet",
    "rpc_endpoint": "https://api.mainnet-beta.solana.com"
  },
  "stripe-mcp": {
    "enabled": true,
    "api_key": "sk_live_...",
    "api_version": "2024-02-01",
    "webhook_secret": "whsec_..."
  },
  "kyc-mcp": {
    "enabled": true,
    "api_key": "kyc_...",
    "webhook_secret": "wh_..."
  }
}
```

---

## Feature Comparison Matrix

| Feature                  | Solana | Ethereum | Stripe | Uniswap | Revolut | SWIFT | KYC |
| ------------------------ | ------ | -------- | ------ | ------- | ------- | ----- | --- |
| **Balance Queries**      | ✅     | ✅       | ✅     | ❌      | ✅      | ✅    | ❌  |
| **Send Money**           | ✅     | ✅       | ✅     | ❌      | ✅      | ✅    | ❌  |
| **Smart Contracts**      | ✅     | ✅       | ❌     | ✅      | ❌      | ❌    | ❌  |
| **Price Data**           | ❌     | ❌       | ❌     | ✅      | ❌      | ❌    | ❌  |
| **Multi-Currency**       | ❌     | ❌       | ✅     | ❌      | ✅      | ✅    | ❌  |
| **Compliance**           | ❌     | ❌       | ✅     | ❌      | ✅      | ✅    | ✅  |
| **Subscription Support** | ❌     | ❌       | ✅     | ❌      | ❌      | ❌    | ❌  |
| **Webhook Support**      | ❌     | ❌       | ✅     | ❌      | ✅      | ✅    | ✅  |

---

## Transaction Flow Diagrams

### Flow 1: Cryptocurrency Payment (Solana)

```
Agent A (Merchant)                Agent B (Customer)
       │                                  │
       │                                  │
       ├─────────── Request Price ────────┤
       │ (via CoinGecko MCP)              │
       │                                  │
       ├─── Show: "100 EUR = 108 USDC ───┤
       │                                  │
       │ ◄───── Select USDC Payment ──────┤
       │                                  │
       │ ◄─ Trigger KYC Check (AML MCP) ──┤
       │                                  │
       │ ◄─────── Send USDC via Solana ──┤
       │ (using Solana MCP)               │
       │                                  │
       ├─── Confirm tx: 5k...9w ─────────┤
       │                                  │
       ✅ Payment Settled                ✅ Payment Sent
```

### Flow 2: Traditional Payment (Stripe + Bank)

```
Agent A (Merchant)                Agent B (Customer)
       │                                  │
       │                                  │
       ├─ Create Payment Intent ─────────┤
       │ (via Stripe MCP)                │
       │                                  │
       │ ◄─── Open Stripe Payment UI ────┤
       │                                  │
       │ ◄─── Enter Card Details ────────┤
       │                                  │
       │ ◄─ Confirm Payment ─────────────┤
       │ (Stripe MCP: createCharge)      │
       │                                  │
       ├─── Fund Transfer Start ────────┤
       │ (Stripe MCP: settlement)        │
       │                                  │
       ✅ Funds Received                ✅ Charged
```

### Flow 3: DeFi Trading (Uniswap + Oracle)

```
Agent A (Trader)
       │
       ├─ Check USDC/DAI Price (Chainlink)
       │
       ├─ Get Better Quote (Uniswap MCP)
       │
       ├─ Execute Swap (Uniswap MCP)
       │    └─ Check slippage
       │    └─ Route through liquidity pools
       │
       ├─ Confirm: 100 USDC → 101.5 DAI
       │
       └─ Log in CoinGecko (market data)
```

---

## Cost Reference (Approximate)

| Server          | Free Tier            | Pro Tier        | Rate Limits |
| --------------- | -------------------- | --------------- | ----------- |
| **Solana**      | $0                   | $0 (RPC varies) | 600 req/min |
| **Ethereum**    | Limited              | $50-200/mo      | 300 req/min |
| **Stripe**      | $0 + 2.9% + $0.30/tx | $0 + 2.9%       | Unlimited   |
| **CoinGecko**   | ✅                   | $10/mo          | 50 req/min  |
| **Uniswap**     | ✅                   | ✅              | Unlimited   |
| **Revolut API** | Varies               | Varies          | 100 req/min |

---

## API Endpoint Examples

### Solana MCP

```
GET /balance/:address
GET /token-balance/:address/:mint
POST /send-transaction
GET /transaction-history/:address
```

### Stripe MCP

```
POST /payment-intent
POST /customer
POST /charge
POST /refund
GET /payment-status/:id
```

### CoinGecko MCP

```
GET /price/:ids?currencies=usd,eur
GET /market-data/:id
GET /trending
GET /exchanges/:id/tickers
```

### Ethereum MCP

```
POST /call-contract
POST /send-transaction
GET /balance/:address
GET /gas-price
GET /resolve-ens/:name
```

---

## Troubleshooting Quick Guide

### "API Key Invalid"

```
✅ Check key isn't expired
✅ Verify key has correct permissions
✅ Ensure key is for correct environment (test/live)
✅ Check no extra spaces in key
```

### "Rate Limited"

```
✅ Implement exponential backoff
✅ Queue requests if burst too high
✅ Upgrade to higher tier if sustained load
✅ Check for cache to reduce calls
```

### "Transaction Failed"

```
✅ For blockchain: check gas price, balance
✅ For payments: verify CVV, correct amount
✅ For DeFi: check slippage, liquidity
✅ Check AML/KYC status cleared
```

### "Webhook Not Triggering"

```
✅ Verify webhook URL is publicly accessible
✅ Check webhook secret matches
✅ Ensure endpoint returns 200 OK
✅ Check firewall allows webhook IPs
```

---

## Best Practices

### Security

```
🔒 Never hardcode API keys
🔒 Use secrets manager (AWS, Vault)
🔒 Rotate keys every 90 days
🔒 Enable IP whitelisting
🔒 Verify webhook signatures
🔒 Log all transactions (immutable trail)
```

### Reliability

```
⚡ Implement retry logic with exponential backoff
⚡ Use circuit breaker pattern for failures
⚡ Cache market data (stale ok for 60s)
⚡ Queue transactions for peak times
⚡ Monitor response times & error rates
```

### Compliance

```
📋 Always run KYC/AML checks before payment
📋 Store audit logs immutably
📋 Implement transaction limits
📋 Get explicit user consent for recurring charges
📋 Support refunds & disputes
```

---

## Integration Timeline

| Week           | Task                 | MCP Servers            |
| -------------- | -------------------- | ---------------------- |
| **Week 1**     | Setup & Architecture | All 24 defined         |
| **Week 2**     | Solana + Stripe      | 2 servers              |
| **Week 3**     | Ethereum + CoinGecko | 2 servers              |
| **Week 4**     | Uniswap + KYC        | 2 servers              |
| **Week 5-6**   | Remaining Phase 1    | Revolut, AML, PayPal   |
| **Week 7-8**   | DeFi Complete        | Aave, Curve, Chainlink |
| **Week 9-10**  | Banking Complete     | SWIFT, ACH, Bitcoin    |
| **Week 11-12** | Polish & Test        | All 24 servers         |

---

## Support & Documentation

**Documentation Files:**

- `FINANCIAL_MCP_SERVERS_ARCHITECTURE.md` - Full spec (600 lines)
- `MCP_SERVERS_IMPLEMENTATION_GUIDE.md` - Code templates (400 lines)
- `INTEGRATE_MCP_SERVERS_GUIDE.md` - Integration steps
- `FINANCIAL_MCP_SERVERS_SUMMARY.md` - Overview & roadmap

**Code Files:**

- `src/components/MCPServerIntegrations.tsx` - UI component (500 lines)

**Getting Help:**

1. Check architecture doc for server specs
2. Check implementation guide for code samples
3. Check integration guide for DeployObject updates
4. Review this quick reference for quick lookup

---

## Sample Configurations

### Virtual ATM (Complete)

```json
{
  "solana-mcp": { "network": "mainnet" },
  "stripe-mcp": { "api_key": "sk_live_..." },
  "revolut-mcp": { "api_key": "..." },
  "coingecko-mcp": { "api_tier": "pro" },
  "kyc-mcp": { "api_key": "..." },
  "aml-mcp": { "api_key": "..." }
}
```

### Crypto Trading Bot

```json
{
  "ethereum-mcp": { "network": "mainnet" },
  "uniswap-mcp": { "slippage": 0.5 },
  "aave-mcp": { "network": "ethereum" },
  "chainlink-mcp": { "network": "ethereum" },
  "coingecko-mcp": { "api_tier": "pro" }
}
```

### Payment Processor

```json
{
  "stripe-mcp": { "api_version": "2024-02-01" },
  "paypal-mcp": { "mode": "live" },
  "kyc-mcp": { "api_key": "..." },
  "solana-mcp": { "network": "mainnet" }
}
```

---

## Next Steps

1. ✅ Review this quick reference
2. ⏳ Choose primary servers for your use case
3. ⏳ Read detailed architecture doc
4. ⏳ Follow integration guide
5. ⏳ Implement Phase 1 servers
6. ⏳ Test with sample transactions

**Ready to start?** Begin with the Implementation Guide → Solana or Stripe MCP Server!
