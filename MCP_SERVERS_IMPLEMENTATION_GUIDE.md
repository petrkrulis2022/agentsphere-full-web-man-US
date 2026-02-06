# Financial MCP Servers - Implementation Guide

## Building Crypto, Banking & Payment Integration Servers

**Date:** February 5, 2026  
**Status:** Development Guide  
**Audience:** Backend Engineers, DevOps

---

## Quick Start - Solana MCP Server

### 1. Project Setup

```bash
mkdir -p mcp-servers/solana-mcp
cd mcp-servers/solana-mcp
npm init -y

npm install \
  @solana/web3.js \
  @solana/spl-token \
  dotenv \
  express \
  axios \
  winston

npm install --save-dev typescript ts-node @types/node @types/express
```

### 2. TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Core Implementation

**File: `src/index.ts`**

```typescript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import express, { Express, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

// Logger setup
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Types
interface SolanaConfig {
  network: "mainnet" | "devnet" | "testnet";
  rpcEndpoint?: string;
}

interface TokenMetadata {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  supply: string;
}

interface Transaction {
  signature: string;
  timestamp: number;
  source: string;
  destination: string;
  amount: number;
  fee: number;
  status: "success" | "failed";
}

// Solana MCP Server Class
class SolanaMCPServer {
  private connection: Connection;
  private rpcEndpoint: string;
  private network: "mainnet" | "devnet" | "testnet";

  constructor(config: SolanaConfig) {
    this.network = config.network;

    // Default RPC endpoints
    const defaultEndpoints = {
      mainnet: "https://api.mainnet-beta.solana.com",
      devnet: "https://api.devnet.solana.com",
      testnet: "https://api.testnet.solana.com",
    };

    this.rpcEndpoint = config.rpcEndpoint || defaultEndpoints[config.network];
    this.connection = new Connection(this.rpcEndpoint, "confirmed");

    logger.info(`Solana MCP Server initialized on ${config.network}`);
  }

  // Get account balance in SOL
  async getBalance(publicKeyString: string): Promise<number> {
    try {
      const publicKey = new PublicKey(publicKeyString);
      const lamports = await this.connection.getBalance(publicKey);
      const sol = lamports / LAMPORTS_PER_SOL;

      logger.info(`Balance for ${publicKeyString}: ${sol} SOL`);
      return sol;
    } catch (error) {
      logger.error(`Failed to get balance: ${error}`);
      throw new Error(`Failed to get balance for ${publicKeyString}`);
    }
  }

  // Get token balance (SPL)
  async getTokenBalance(
    publicKeyString: string,
    mintString: string,
  ): Promise<number> {
    try {
      const publicKey = new PublicKey(publicKeyString);
      const mint = new PublicKey(mintString);

      const ata = await getAssociatedTokenAddress(mint, publicKey);
      const tokenAccount = await this.connection.getTokenAccountBalance(ata);

      logger.info(
        `Token balance for ${publicKeyString}: ${tokenAccount.value.uiAmount}`,
      );
      return tokenAccount.value.uiAmount || 0;
    } catch (error) {
      logger.error(`Failed to get token balance: ${error}`);
      throw new Error(`Failed to get token balance`);
    }
  }

  // Get token metadata
  async getTokenMetadata(mintString: string): Promise<TokenMetadata> {
    try {
      const mint = new PublicKey(mintString);
      const mintData = await getMint(this.connection, mint);

      // Try to get symbol/name from metadata account
      const metadata = await this.getTokenMetadataFromAccount(mint);

      const tokenMetadata: TokenMetadata = {
        mint: mintString,
        symbol: metadata.symbol || "UNKNOWN",
        name: metadata.name || "Unknown Token",
        decimals: mintData.decimals,
        supply: mintData.supply.toString(),
      };

      logger.info(`Token metadata for ${mintString}:`, tokenMetadata);
      return tokenMetadata;
    } catch (error) {
      logger.error(`Failed to get token metadata: ${error}`);
      throw new Error(`Failed to get token metadata for ${mintString}`);
    }
  }

  // Get transaction details
  async getTransaction(signature: string): Promise<Transaction | null> {
    try {
      const tx = await this.connection.getTransaction(signature);

      if (!tx) {
        return null;
      }

      const transaction: Transaction = {
        signature,
        timestamp: tx.blockTime || 0,
        source: tx.transaction.message.accountKeys[0].toBase58(),
        destination: tx.transaction.message.accountKeys[1]?.toBase58() || "",
        amount: 0,
        fee: tx.meta?.fee || 0,
        status: tx.meta?.err ? "failed" : "success",
      };

      logger.info(`Transaction details for ${signature}:`, transaction);
      return transaction;
    } catch (error) {
      logger.error(`Failed to get transaction: ${error}`);
      throw new Error(`Failed to get transaction ${signature}`);
    }
  }

  // Get recent transactions
  async getTransactionHistory(
    publicKeyString: string,
    limit: number = 10,
  ): Promise<string[]> {
    try {
      const publicKey = new PublicKey(publicKeyString);
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit },
      );

      logger.info(
        `Got ${signatures.length} transactions for ${publicKeyString}`,
      );
      return signatures.map((sig) => sig.signature);
    } catch (error) {
      logger.error(`Failed to get transaction history: ${error}`);
      throw new Error(`Failed to get transaction history`);
    }
  }

  // Watch account for changes
  async watchAccount(publicKeyString: string): Promise<number> {
    try {
      const publicKey = new PublicKey(publicKeyString);

      const subscriptionId = this.connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          logger.info(
            `Account ${publicKeyString} changed: ${accountInfo.lamports} lamports`,
          );
        },
      );

      logger.info(
        `Watching account ${publicKeyString}, subscription ID: ${subscriptionId}`,
      );
      return subscriptionId;
    } catch (error) {
      logger.error(`Failed to watch account: ${error}`);
      throw new Error(`Failed to watch account ${publicKeyString}`);
    }
  }

  // Helper: Get token metadata from account
  private async getTokenMetadataFromAccount(
    mint: PublicKey,
  ): Promise<{ symbol: string; name: string }> {
    try {
      // Query Metaplex token metadata (simplified)
      // In production, use @metaplex-foundation/js package
      return { symbol: "TOKEN", name: "Token" };
    } catch {
      return { symbol: "UNKNOWN", name: "Unknown" };
    }
  }
}

// Express API Server
class MCPServerAPI {
  private app: Express;
  private solanaMCP: SolanaMCPServer;
  private port: number;

  constructor(solanaMCP: SolanaMCPServer) {
    this.app = express();
    this.solanaMCP = solanaMCP;
    this.port = parseInt(process.env.PORT || "3002");

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });

    // Error handling
    this.app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        logger.error(`Error: ${err.message}`);
        res.status(500).json({ error: err.message });
      },
    );
  }

  private setupRoutes() {
    // Health check
    this.app.get("/health", (req: Request, res: Response) => {
      res.json({ status: "ok", service: "solana-mcp", timestamp: Date.now() });
    });

    // Get balance
    this.app.get("/balance/:address", async (req: Request, res: Response) => {
      try {
        const balance = await this.solanaMCP.getBalance(req.params.address);
        res.json({ address: req.params.address, balance, unit: "SOL" });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    // Get token balance
    this.app.get(
      "/token-balance/:address/:mint",
      async (req: Request, res: Response) => {
        try {
          const balance = await this.solanaMCP.getTokenBalance(
            req.params.address,
            req.params.mint,
          );
          res.json({
            address: req.params.address,
            mint: req.params.mint,
            balance,
          });
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      },
    );

    // Get token metadata
    this.app.get(
      "/token-metadata/:mint",
      async (req: Request, res: Response) => {
        try {
          const metadata = await this.solanaMCP.getTokenMetadata(
            req.params.mint,
          );
          res.json(metadata);
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      },
    );

    // Get transaction
    this.app.get(
      "/transaction/:signature",
      async (req: Request, res: Response) => {
        try {
          const tx = await this.solanaMCP.getTransaction(req.params.signature);
          res.json(tx);
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      },
    );

    // Get transaction history
    this.app.get(
      "/transactions/:address",
      async (req: Request, res: Response) => {
        try {
          const limit = parseInt(req.query.limit as string) || 10;
          const txs = await this.solanaMCP.getTransactionHistory(
            req.params.address,
            limit,
          );
          res.json({ address: req.params.address, transactions: txs });
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      },
    );

    // Watch account
    this.app.post("/watch/:address", async (req: Request, res: Response) => {
      try {
        const subscriptionId = await this.solanaMCP.watchAccount(
          req.params.address,
        );
        res.json({
          address: req.params.address,
          subscriptionId,
          status: "watching",
        });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  public start() {
    this.app.listen(this.port, () => {
      logger.info(`Solana MCP Server running on port ${this.port}`);
    });
  }
}

// Initialize and start server
const config: SolanaConfig = {
  network: (process.env.SOLANA_NETWORK as any) || "mainnet",
  rpcEndpoint: process.env.SOLANA_RPC_ENDPOINT,
};

const solanaMCP = new SolanaMCPServer(config);
const api = new MCPServerAPI(solanaMCP);

api.start();

export { SolanaMCPServer, MCPServerAPI };
```

### 4. Environment Configuration

**File: `.env`**

```bash
# Solana Network Configuration
SOLANA_NETWORK=mainnet
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Server Configuration
PORT=3002
LOG_LEVEL=info

# Optional: Custom RPC for better performance
# SOLANA_RPC_ENDPOINT=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### 5. Package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  }
}
```

### 6. Docker Deployment

**File: `Dockerfile`**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Remove source files
RUN rm -rf src

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

# Start server
CMD ["npm", "start"]
```

**File: `docker-compose.yml`**

```yaml
version: "3.8"

services:
  solana-mcp:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: solana-mcp-server
    ports:
      - "3002:3002"
    environment:
      SOLANA_NETWORK: mainnet
      SOLANA_RPC_ENDPOINT: https://api.mainnet-beta.solana.com
      LOG_LEVEL: info
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    networks:
      - agentsphere-network

networks:
  agentsphere-network:
    driver: bridge
```

---

## Stripe MCP Server Implementation

**File: `mcp-servers/stripe-mcp/src/index.ts`**

```typescript
import Stripe from "stripe";
import express from "express";
import dotenv from "dotenv";
import winston from "winston";
import crypto from "crypto";

dotenv.config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

interface StripeConfig {
  apiKey: string;
  apiVersion: string;
  webhookSecret: string;
}

class StripeMCPServer {
  private stripe: Stripe;
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: config.apiVersion as any,
    });
  }

  // Create payment intent
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
      });

      logger.info(`Payment intent created: ${intent.id}`);
      return {
        clientSecret: intent.client_secret!,
        paymentIntentId: intent.id,
      };
    } catch (error: any) {
      logger.error(`Failed to create payment intent: ${error.message}`);
      throw error;
    }
  }

  // Create customer
  async createCustomer(
    email: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        metadata,
      });

      logger.info(`Customer created: ${customer.id}`);
      return customer.id;
    } catch (error: any) {
      logger.error(`Failed to create customer: ${error.message}`);
      throw error;
    }
  }

  // Create charge
  async createCharge(
    amount: number,
    currency: string,
    paymentMethodId: string,
    customerId?: string,
  ): Promise<string> {
    try {
      const charge = await this.stripe.charges.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method: paymentMethodId,
        customer: customerId,
        confirm: true,
      });

      logger.info(`Charge created: ${charge.id}`);
      return charge.id;
    } catch (error: any) {
      logger.error(`Failed to create charge: ${error.message}`);
      throw error;
    }
  }

  // Refund payment
  async refundPayment(chargeId: string, amount?: number): Promise<string> {
    try {
      const refund = await this.stripe.refunds.create({
        charge: chargeId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      logger.info(`Refund created: ${refund.id}`);
      return refund.id;
    } catch (error: any) {
      logger.error(`Failed to refund payment: ${error.message}`);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentIntentId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    created: number;
  }> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        status: intent.status,
        amount: intent.amount / 100,
        currency: intent.currency,
        created: intent.created,
      };
    } catch (error: any) {
      logger.error(`Failed to get payment status: ${error.message}`);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(body: string, signature: string): Stripe.Event | null {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.config.webhookSecret,
      );
      return event;
    } catch (error: any) {
      logger.error(`Webhook signature verification failed: ${error.message}`);
      return null;
    }
  }
}

// Express API
class StripeMCPAPI {
  private app: express.Express;
  private stripeMCP: StripeMCPServer;
  private port: number;

  constructor(stripeMCP: StripeMCPServer) {
    this.app = express();
    this.stripeMCP = stripeMCP;
    this.port = parseInt(process.env.PORT || "3003");

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // Raw body for webhook signature verification
    this.app.post(
      "/webhooks",
      express.raw({ type: "application/json" }),
      this.handleWebhook.bind(this),
    );

    this.app.use(express.json());
  }

  private setupRoutes() {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({ status: "ok", service: "stripe-mcp" });
    });

    // Create payment intent
    this.app.post("/payment-intent", async (req, res) => {
      try {
        const { amount, currency, metadata } = req.body;
        const result = await this.stripeMCP.createPaymentIntent(
          amount,
          currency,
          metadata,
        );
        res.json(result);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    // Create customer
    this.app.post("/customer", async (req, res) => {
      try {
        const { email, metadata } = req.body;
        const customerId = await this.stripeMCP.createCustomer(email, metadata);
        res.json({ customerId });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    // Create charge
    this.app.post("/charge", async (req, res) => {
      try {
        const { amount, currency, paymentMethodId, customerId } = req.body;
        const chargeId = await this.stripeMCP.createCharge(
          amount,
          currency,
          paymentMethodId,
          customerId,
        );
        res.json({ chargeId });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    // Refund
    this.app.post("/refund", async (req, res) => {
      try {
        const { chargeId, amount } = req.body;
        const refundId = await this.stripeMCP.refundPayment(chargeId, amount);
        res.json({ refundId });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    // Get payment status
    this.app.get("/payment-status/:paymentIntentId", async (req, res) => {
      try {
        const status = await this.stripeMCP.getPaymentStatus(
          req.params.paymentIntentId,
        );
        res.json(status);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  private async handleWebhook(req: express.Request, res: express.Response) {
    const sig = req.headers["stripe-signature"];

    if (!sig || typeof sig !== "string") {
      res.status(400).json({ error: "No signature" });
      return;
    }

    const event = this.stripeMCP.verifyWebhookSignature(
      req.body.toString(),
      sig,
    );

    if (!event) {
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    // Handle event
    logger.info(`Webhook received: ${event.type}`);
    res.json({ received: true });
  }

  public start() {
    this.app.listen(this.port, () => {
      logger.info(`Stripe MCP Server running on port ${this.port}`);
    });
  }
}

// Initialize
const config: StripeConfig = {
  apiKey: process.env.STRIPE_API_KEY!,
  apiVersion: process.env.STRIPE_API_VERSION || "2024-02-01",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};

const stripeMCP = new StripeMCPServer(config);
const api = new StripeMCPAPI(stripeMCP);

api.start();

export { StripeMCPServer, StripeMCPAPI };
```

---

## Integration with AgentSphere

### 1. Update DeployObject.tsx

```tsx
import MCPServerIntegrations, {
  FINANCIAL_MCP_SERVERS,
} from "./MCPServerIntegrations";

// In form component
<MCPServerIntegrations
  selectedServers={mcpServers}
  onToggleServer={(serverId) => {
    setMcpServers(
      mcpServers.includes(serverId)
        ? mcpServers.filter((id) => id !== serverId)
        : [...mcpServers, serverId],
    );
  }}
  onConfigUpdate={(serverId, config) => {
    setMcpServersConfig({
      ...mcpServersConfig,
      [serverId]: config,
    });
  }}
/>;
```

### 2. Database Storage

```typescript
// In deploymentData object
{
  mcp_servers: {
    "solana-mcp": {
      enabled: true,
      config: mcpServersConfig["solana-mcp"],
    },
    "stripe-mcp": {
      enabled: true,
      config: mcpServersConfig["stripe-mcp"],
    },
    // ... other servers
  },
}
```

### 3. Environment Variables for Production

Create `.env.production`:

```bash
# Solana
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet

# Ethereum
ETHEREUM_RPC_ENDPOINT=https://eth-mainnet.alchemyapi.io/v2/YOUR-KEY
ETHEREUM_NETWORK=mainnet

# Stripe
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# DeFi
UNISWAP_ROUTER_ADDRESS=0x...

# Compliance
KYC_API_KEY=...
CHAINALYSIS_API_KEY=...

# Server
MCP_SERVER_ENCRYPTION_KEY=...
```

---

## Security Best Practices

1. **API Key Management**
   - Use AWS Secrets Manager or HashiCorp Vault
   - Rotate keys regularly
   - Never commit keys to git

2. **Rate Limiting**
   - Implement per-customer rate limits
   - Monitor for suspicious activity

3. **Audit Logging**
   - Log all financial transactions
   - Store in immutable audit trail

4. **Encryption**
   - TLS/SSL for all API calls
   - Encrypt sensitive data at rest

5. **Compliance**
   - PCI-DSS for payment processing
   - GDPR for customer data
   - AML/KYC requirements

---

## Testing

```typescript
// test/solana-mcp.test.ts
import { SolanaMCPServer } from "../src/index";

describe("Solana MCP Server", () => {
  let solanaMCP: SolanaMCPServer;

  beforeAll(() => {
    solanaMCP = new SolanaMCPServer({
      network: "devnet",
    });
  });

  test("should get balance", async () => {
    const balance = await solanaMCP.getBalance(
      "11111111111111111111111111111111",
    );
    expect(typeof balance).toBe("number");
  });

  test("should handle invalid address", async () => {
    await expect(solanaMCP.getBalance("invalid")).rejects.toThrow();
  });
});
```

---

## Deployment

### Using Docker Compose

```bash
cd mcp-servers
docker-compose up -d

# Check logs
docker-compose logs -f solana-mcp stripe-mcp
```

### Using Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: solana-mcp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: solana-mcp
  template:
    metadata:
      labels:
        app: solana-mcp
    spec:
      containers:
        - name: solana-mcp
          image: agentsphere/solana-mcp:latest
          ports:
            - containerPort: 3002
          env:
            - name: SOLANA_NETWORK
              valueFrom:
                configMapKeyRef:
                  name: solana-config
                  key: network
            - name: SOLANA_RPC_ENDPOINT
              valueFrom:
                secretKeyRef:
                  name: solana-secrets
                  key: rpc-endpoint
```

---

## Next Steps

1. ✅ Create Solana MCP Server (completed)
2. ⏳ Create Stripe MCP Server (in progress)
3. ⏳ Create Ethereum/EVM MCP Server
4. ⏳ Create Uniswap MCP Server
5. ⏳ Add authentication/authorization layer
6. ⏳ Implement rate limiting
7. ⏳ Add monitoring & alerts
8. ⏳ Create comprehensive test suite
