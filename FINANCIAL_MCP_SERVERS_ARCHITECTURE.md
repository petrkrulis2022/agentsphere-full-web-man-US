# Financial MCP Servers Architecture

## Crypto, Banking & Payment API Integration

**Date:** February 5, 2026  
**Status:** MVP Architecture Definition  
**Scope:** AgentSphere Financial Services Integration

---

## 1. Overview

Transform AgentSphere MCP servers into a comprehensive financial ecosystem supporting:

- **Cryptocurrency Networks** (Bitcoin, Ethereum, Solana, Hedera)
- **Banking APIs** (Payment Rails, Wire Transfers, Account Verification)
- **DeFi Protocols** (Swap, Lending, Liquidity Pools)
- **Payment Processing** (Stripe, Square, PayPal)
- **Compliance & KYC** (Verification, AML Screening)

---

## 2. MCP Server Categories

### A. Cryptocurrency Networks (Blockchain)

#### **Solana MCP Server**

```
Name: solana-mcp
Purpose: Native Solana blockchain interaction
Supported Operations:
  - Account balance queries
  - Transaction history
  - Token transfers (SPL tokens)
  - Program deployment (limited)
  - RPC calls to Solana mainnet/devnet
Key Endpoints:
  - getBalance(publicKey) → BN
  - sendTransaction(tx) → txSignature
  - getTokenMetadata(mint) → TokenMetadata
  - getParsedTokenAccountsByOwner(owner) → TokenAccount[]
```

#### **Ethereum/Polygon MCP Server**

```
Name: ethereum-mcp
Purpose: EVM-compatible chain interaction
Supported Operations:
  - Smart contract calls (read/write)
  - ETH/token transfers
  - Gas price queries
  - Block exploration
  - ENS resolution
Key Endpoints:
  - getBalance(address) → BigNumber
  - sendTransaction(tx) → txHash
  - callSmartContract(address, abi, method, args) → any
  - getGasPrice() → BigNumber
  - resolveENS(name) → address
Networks:
  - Ethereum Mainnet
  - Polygon Mainnet
  - Arbitrum
  - Optimism
  - Sepolia Testnet
```

#### **Bitcoin MCP Server**

```
Name: bitcoin-mcp
Purpose: Bitcoin network interaction
Supported Operations:
  - UTXO management
  - Transaction creation & broadcasting
  - Address monitoring
  - Fee estimation
Key Endpoints:
  - getUTXOs(address) → UTXO[]
  - estimateFee(txSize) → satoshi/byte
  - broadcastTx(tx) → txid
  - getTransaction(txid) → Transaction
  - monitorAddress(address) → WebSocket
```

#### **Hedera MCP Server**

```
Name: hedera-mcp
Purpose: Hedera Hashgraph network
Supported Operations:
  - HBAR transfers
  - Token operations (HTS)
  - Smart contract calls
  - Consensus service
Key Endpoints:
  - transferHBAR(to, amount) → txHash
  - createToken(metadata) → tokenId
  - mintToken(tokenId, amount) → txHash
  - executeSmartContract(contractId, method) → result
```

---

### B. Banking & Payment Rails

#### **SWIFT MCP Server**

```
Name: swift-mcp
Purpose: International wire transfers
Supported Operations:
  - Wire transfer initiation
  - Payment verification
  - Bank code lookup
  - Compliance checks
Key Endpoints:
  - initiateWire(recipient, amount, currency) → wireId
  - getWireStatus(wireId) → status
  - verifyCFI(bic) → bankInfo
  - checkAMLScreening(beneficiary) → amlResult
```

#### **ACH/Bank Transfer MCP Server**

```
Name: ach-mcp
Purpose: US domestic bank transfers (ACH)
Supported Operations:
  - Direct deposit
  - Batch payments
  - Account verification
  - Return management
Key Endpoints:
  - initiateACH(fromAccount, toAccount, amount) → achId
  - verifyAccount(accountNumber, routingNumber) → verification
  - getACHStatus(achId) → status
  - getAccountBalance(accountId) → balance
```

#### **Revolut API MCP Server**

```
Name: revolut-mcp
Purpose: Revolut banking service
Supported Operations:
  - Multi-currency transfers
  - Card management
  - IBAN management
  - Transaction history
Key Endpoints:
  - transfer(recipient, amount, currency) → txId
  - getCards() → Card[]
  - createIBAN(currency) → IBAN
  - getTransactions(filter) → Transaction[]
  - getBalance(currency) → balance
```

#### **Stripe MCP Server**

```
Name: stripe-mcp
Purpose: Stripe payment processing
Supported Operations:
  - Create payment intents
  - Manage customers
  - Process refunds
  - Card tokenization
Key Endpoints:
  - createPaymentIntent(amount, currency, metadata) → clientSecret
  - createCustomer(email, metadata) → customerId
  - createCharge(amount, paymentMethod) → chargeId
  - refundPayment(chargeId, amount) → refundId
  - getPaymentStatus(paymentIntentId) → status
```

#### **PayPal MCP Server**

```
Name: paypal-mcp
Purpose: PayPal payment processing
Supported Operations:
  - Create orders
  - Capture payments
  - Manage subscriptions
  - Dispute handling
Key Endpoints:
  - createOrder(amount, currency) → orderId
  - capturePayment(orderId) → captureId
  - createSubscription(plan) → subscriptionId
  - getPaymentDetails(orderId) → paymentInfo
```

---

### C. DeFi & Trading

#### **Uniswap MCP Server**

```
Name: uniswap-mcp
Purpose: Decentralized exchange interaction
Supported Operations:
  - Token swaps
  - Liquidity pool management
  - Price quotes
  - Slippage calculation
Key Endpoints:
  - quoteSwap(tokenIn, tokenOut, amount) → quote
  - executeSwap(tokenIn, tokenOut, amount, slippage) → txHash
  - addLiquidity(token0, token1, amount0, amount1) → liquidityTokens
  - removeLiquidity(lpToken, amount) → amounts
  - getPairPrice(token0, token1) → price
```

#### **Aave MCP Server**

```
Name: aave-mcp
Purpose: Lending protocol
Supported Operations:
  - Deposit assets
  - Borrow assets
  - Repay loans
  - Get lending rates
Key Endpoints:
  - deposit(asset, amount) → aTokens
  - borrow(asset, amount, rateMode) → borrowId
  - repay(asset, amount) → repayId
  - getUserAccountData(user) → accountData
  - getReserveData(asset) → rates
```

#### **Curve MCP Server**

```
Name: curve-mcp
Purpose: Stablecoin DEX
Supported Operations:
  - Stablecoin swaps
  - Liquidity provision
  - Yield farming
Key Endpoints:
  - exchangeTokens(tokenIn, tokenOut, amount) → amountOut
  - addLiquidity(amounts) → lpTokens
  - removeLiquidity(lpTokens) → amounts
```

---

### D. Crypto Data & Market Intelligence

#### **CoinGecko MCP Server**

```
Name: coingecko-mcp
Purpose: Cryptocurrency market data
Supported Operations:
  - Price queries (real-time)
  - Market data (24h, 7d, 30d changes)
  - Historical data
  - Exchange data
Key Endpoints:
  - getCryptoPrice(ids) → priceData
  - getMarketData(id) → marketCap, volume, change
  - getHistoricalPrice(id, date) → price
  - getTrendingTokens() → trendingData
```

#### **Chainlink MCP Server**

```
Name: chainlink-mcp
Purpose: Decentralized oracle services
Supported Operations:
  - Get price feeds
  - Request random numbers
  - Trigger upkeep
Key Endpoints:
  - getPriceFeed(base, quote) → price
  - getLatestPrice(priceFeedAddress) → price
  - requestRandomness(keyHash) → requestId
```

#### **TheGraph MCP Server**

```
Name: thegraph-mcp
Purpose: Blockchain data indexing/queries
Supported Operations:
  - GraphQL queries on subgraphs
  - Historical data queries
  - Aggregated metrics
Key Endpoints:
  - querySubgraph(endpoint, query) → data
  - getTokenTransfers(tokenAddress) → transfers
  - getLiquidityData(poolId) → liquidity
```

---

### E. Compliance & Identity

#### **Veriff/IDology MCP Server**

```
Name: kyc-mcp
Purpose: Know Your Customer (KYC) verification
Supported Operations:
  - Document verification
  - Liveness checks
  - Data validation
Key Endpoints:
  - startVerification(user) → verificationId
  - submitDocument(id, documentType, image) → status
  - getVerificationStatus(id) → result
  - getComplianceScore(user) → score
```

#### **Chainalysis MCP Server**

```
Name: aml-mcp
Purpose: AML/sanctions screening
Supported Operations:
  - Wallet risk assessment
  - Sanctions list checking
  - Transaction monitoring
Key Endpoints:
  - assessWalletRisk(walletAddress) → riskScore
  - checkSanctionsList(address) → isBlocked
  - getAddressRiskDetails(address) → riskData
  - reportTransaction(txHash) → reportId
```

---

## 3. Database Schema Updates

```sql
-- Add MCP server metadata column
ALTER TABLE deployed_objects
ADD COLUMN IF NOT EXISTS mcp_servers jsonb DEFAULT jsonb_build_object();

-- Example structure:
-- {
--   "solana-mcp": {
--     "enabled": true,
--     "network": "mainnet",
--     "rpc_endpoint": "https://api.mainnet-beta.solana.com",
--     "wallet": "vault_address"
--   },
--   "stripe-mcp": {
--     "enabled": true,
--     "api_version": "2024-02-01",
--     "webhook_enabled": true
--   },
--   "uniswap-mcp": {
--     "enabled": true,
--     "network": "ethereum",
--     "slippage": "0.5"
--   }
-- }

-- Add MCP server audit log
CREATE TABLE IF NOT EXISTS mcp_server_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  deployed_object_id UUID REFERENCES deployed_objects(id),
  mcp_server_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  request_params JSONB,
  response_data JSONB,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INTEGER
);

CREATE INDEX idx_mcp_activity_deployed_object
ON mcp_server_activity_logs(deployed_object_id);

CREATE INDEX idx_mcp_activity_server
ON mcp_server_activity_logs(mcp_server_name);

-- Add MCP server configuration table
CREATE TABLE IF NOT EXISTS mcp_server_config (
  id BIGSERIAL PRIMARY KEY,
  server_name TEXT UNIQUE NOT NULL,
  server_type TEXT NOT NULL,
  description TEXT,
  required_fields JSONB,
  optional_fields JSONB,
  rate_limits JSONB,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mcp_server_config (server_name, server_type, description, required_fields) VALUES
  ('solana-mcp', 'blockchain', 'Solana network interaction', jsonb_build_object('rpc_endpoint', 'string', 'network', 'string')),
  ('ethereum-mcp', 'blockchain', 'EVM-compatible chains', jsonb_build_object('rpc_endpoint', 'string', 'network', 'string')),
  ('stripe-mcp', 'payment', 'Stripe payment processing', jsonb_build_object('api_key', 'string', 'api_version', 'string')),
  ('uniswap-mcp', 'defi', 'Decentralized exchange', jsonb_build_object('network', 'string', 'slippage', 'number')),
  ('kyc-mcp', 'compliance', 'KYC verification', jsonb_build_object('api_key', 'string', 'webhook_secret', 'string'))
ON CONFLICT (server_name) DO NOTHING;
```

---

## 4. DeployObject.tsx Integration

### New State Variables

```tsx
const [mcpServersConfig, setMcpServersConfig] = useState<Record<string, any>>(
  {},
);
const [selectedMcpServers, setSelectedMcpServers] = useState<string[]>([]);
```

### Financial MCP Server Options

```tsx
const FINANCIAL_MCP_SERVERS = {
  BLOCKCHAIN: [
    {
      id: "solana-mcp",
      name: "Solana Network",
      category: "blockchain",
      icon: "🟣",
    },
    {
      id: "ethereum-mcp",
      name: "Ethereum/EVM",
      category: "blockchain",
      icon: "⟠",
    },
    {
      id: "bitcoin-mcp",
      name: "Bitcoin Network",
      category: "blockchain",
      icon: "🟠",
    },
    {
      id: "hedera-mcp",
      name: "Hedera Network",
      category: "blockchain",
      icon: "🔷",
    },
  ],
  BANKING: [
    {
      id: "swift-mcp",
      name: "SWIFT Wire Transfers",
      category: "banking",
      icon: "🏦",
    },
    {
      id: "ach-mcp",
      name: "ACH Bank Transfers",
      category: "banking",
      icon: "🏧",
    },
    {
      id: "revolut-mcp",
      name: "Revolut Banking API",
      category: "banking",
      icon: "💙",
    },
  ],
  PAYMENT: [
    {
      id: "stripe-mcp",
      name: "Stripe Payments",
      category: "payment",
      icon: "🟦",
    },
    {
      id: "paypal-mcp",
      name: "PayPal Payments",
      category: "payment",
      icon: "📘",
    },
  ],
  DEFI: [
    { id: "uniswap-mcp", name: "Uniswap DEX", category: "defi", icon: "🦄" },
    { id: "aave-mcp", name: "Aave Lending", category: "defi", icon: "👻" },
    {
      id: "curve-mcp",
      name: "Curve Stablecoins",
      category: "defi",
      icon: "📈",
    },
  ],
  DATA: [
    {
      id: "coingecko-mcp",
      name: "CoinGecko Data",
      category: "data",
      icon: "📊",
    },
    {
      id: "chainlink-mcp",
      name: "Chainlink Oracles",
      category: "data",
      icon: "🔗",
    },
    {
      id: "thegraph-mcp",
      name: "TheGraph Queries",
      category: "data",
      icon: "📈",
    },
  ],
  COMPLIANCE: [
    {
      id: "kyc-mcp",
      name: "KYC Verification",
      category: "compliance",
      icon: "✅",
    },
    {
      id: "aml-mcp",
      name: "AML Screening",
      category: "compliance",
      icon: "🛡️",
    },
  ],
};
```

### Configuration UI Component

```tsx
<MCPServerIntegrations
  selectedServers={selectedMcpServers}
  onSelectServer={(serverId) => {
    setSelectedMcpServers([...selectedMcpServers, serverId]);
  }}
  onDeselectServer={(serverId) => {
    setSelectedMcpServers(selectedMcpServers.filter((id) => id !== serverId));
  }}
  onConfigUpdate={(serverId, config) => {
    setMcpServersConfig({
      ...mcpServersConfig,
      [serverId]: config,
    });
  }}
/>
```

---

## 5. MCP Server Implementation Templates

### Example: Solana MCP Server (Node.js)

```typescript
// File: mcp-servers/solana-mcp/index.ts
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface SolanaConfig {
  network: "mainnet" | "devnet" | "testnet";
  rpcEndpoint: string;
}

export class SolanaMCPServer {
  private connection: Connection;
  private config: SolanaConfig;

  constructor(config: SolanaConfig) {
    this.config = config;
    this.connection = new Connection(config.rpcEndpoint);
  }

  async getBalance(publicKeyString: string): Promise<number> {
    try {
      const publicKey = new PublicKey(publicKeyString);
      const lamports = await this.connection.getBalance(publicKey);
      return lamports / LAMPORTS_PER_SOL;
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`);
    }
  }

  async getTokenMetadata(mint: string): Promise<any> {
    // Query token metadata
  }

  async sendTransaction(transactionBase64: string): Promise<string> {
    // Deserialize, sign, and send transaction
  }

  async monitorAccount(publicKeyString: string): Promise<any> {
    // WebSocket subscription for account changes
  }
}
```

### Example: Stripe MCP Server (Node.js)

```typescript
// File: mcp-servers/stripe-mcp/index.ts
import Stripe from "stripe";

interface StripeConfig {
  apiKey: string;
  apiVersion: string;
  webhookSecret: string;
}

export class StripeMCPServer {
  private stripe: Stripe;
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: config.apiVersion as any,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<string> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
    });
    return intent.client_secret!;
  }

  async createCustomer(email: string, name?: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
    });
    return customer.id;
  }

  async refundPayment(chargeId: string, amount?: number): Promise<string> {
    const refund = await this.stripe.refunds.create({
      charge: chargeId,
      amount,
    });
    return refund.id;
  }

  async getPaymentStatus(paymentIntentId: string): Promise<any> {
    const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: intent.status,
      amount: intent.amount / 100,
      currency: intent.currency,
      created: intent.created,
    };
  }
}
```

### Example: Uniswap MCP Server (Node.js)

```typescript
// File: mcp-servers/uniswap-mcp/index.ts
import { ethers } from "ethers";
import { UniswapV3 } from "@uniswap/sdk-core";

interface UniswapConfig {
  network: string;
  rpcEndpoint: string;
  slippage: number;
}

export class UniswapMCPServer {
  private provider: ethers.Provider;
  private config: UniswapConfig;

  constructor(config: UniswapConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcEndpoint);
  }

  async quoteSwap(
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: string,
  ): Promise<any> {
    // Query Uniswap pools and calculate quote
    // Return: amountOut, priceImpact, route
  }

  async executeSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    walletPrivateKey: string,
  ): Promise<string> {
    // Build swap transaction, sign, and submit
    // Return: txHash
  }

  async getPairPrice(token0: string, token1: string): Promise<number> {
    // Get current pair price from pools
  }

  async addLiquidity(
    token0: string,
    token1: string,
    amount0: string,
    amount1: string,
  ): Promise<string> {
    // Create liquidity position on Uniswap V3
    // Return: txHash
  }
}
```

---

## 6. Deployment & Security

### Environment Variables Required

```bash
# Blockchain
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
ETHEREUM_RPC_ENDPOINT=https://eth-mainnet.alchemyapi.io/v2/YOUR-API-KEY
BITCOIN_NETWORK=mainnet

# Banking/Payment
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
REVOLUT_API_KEY=...

# DeFi
UNISWAP_ROUTER_ADDRESS=0x...
AAVE_POOL_ADDRESS=0x...

# Compliance
KYC_API_KEY=...
CHAINALYSIS_API_KEY=...

# MCP Server
MCP_SERVER_PORT=3002
MCP_SERVER_ENCRYPTION_KEY=...
```

### API Rate Limits

```json
{
  "solana-mcp": {
    "requests_per_minute": 600,
    "requests_per_second": 10
  },
  "ethereum-mcp": {
    "requests_per_minute": 300,
    "requests_per_second": 5
  },
  "stripe-mcp": {
    "requests_per_minute": 100,
    "requests_per_second": 2
  },
  "uniswap-mcp": {
    "requests_per_minute": 300,
    "requests_per_second": 5
  }
}
```

### Security Checklist

- [ ] API keys stored in secure vault (AWS Secrets Manager, HashiCorp Vault)
- [ ] Rate limiting implemented per MCP server
- [ ] Request/response encryption for sensitive data
- [ ] Audit logging for all financial transactions
- [ ] IP whitelisting for banking/compliance servers
- [ ] Webhook signature verification
- [ ] Regular security audits
- [ ] PCI-DSS compliance for payment servers
- [ ] SOC 2 compliance for critical services

---

## 7. Usage Examples

### Agent Deployment with Financial MCP Servers

```json
{
  "agent_name": "CubePay Virtual Terminal",
  "agent_type": "home_security",
  "mcp_servers": {
    "solana-mcp": {
      "enabled": true,
      "network": "mainnet",
      "rpc_endpoint": "https://api.mainnet-beta.solana.com",
      "operations": ["getBalance", "sendTransaction"]
    },
    "stripe-mcp": {
      "enabled": true,
      "api_version": "2024-02-01",
      "operations": ["createPaymentIntent", "refundPayment"]
    },
    "coingecko-mcp": {
      "enabled": true,
      "operations": ["getCryptoPrice", "getMarketData"]
    },
    "kyc-mcp": {
      "enabled": true,
      "operations": ["startVerification", "getVerificationStatus"]
    }
  }
}
```

### Agent Agent Payment Scenario

```
Agent A (Merchant):
- Enabled: stripe-mcp, solana-mcp, coingecko-mcp
- Accepts: USD (Stripe), USDC (Solana), EUR (Revolut)

Agent B (Customer):
- Enabled: solana-mcp, ethereum-mcp, revolut-mcp
- Can pay with: USDC, USDT, HBAR, bank transfer

Payment Flow:
1. Agent A quotes price in multiple currencies (coingecko-mcp)
2. Agent B selects payment method
3. Execute payment via appropriate MCP server
4. KYC/AML check (kyc-mcp, aml-mcp)
5. Settle on blockchain or banking rail
```

---

## 8. Implementation Roadmap

**Phase 1 (MVP):**

- ✅ Solana MCP Server
- ✅ Ethereum MCP Server
- ✅ Stripe MCP Server
- ✅ CoinGecko MCP Server

**Phase 2 (v1.1):**

- Revolut API MCP Server
- Uniswap MCP Server
- KYC MCP Server

**Phase 3 (v1.2):**

- SWIFT MCP Server
- Aave MCP Server
- Chainalysis MCP Server

**Phase 4 (v1.3):**

- Bitcoin MCP Server
- ACH MCP Server
- Curve MCP Server

**Phase 5 (v2.0):**

- Hedera MCP Server
- PayPal MCP Server
- TheGraph MCP Server
- Chainlink MCP Server

---

## 9. Next Steps

1. **Create MCP Server Component** - `MCPServerIntegrations.tsx` with category tabs
2. **Implement First MCP Server** - Start with Solana MCP
3. **Add Configuration UI** - Dynamic config forms per server type
4. **Database Migration** - Execute schema updates
5. **Testing Framework** - Unit tests for each MCP server
6. **Documentation** - API docs for each server
