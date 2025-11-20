# Hedera AI Agent Kit - Complete Implementation Guide

## 🎯 Overview

This guide documents the complete integration of Hedera AI Agent Kit into the AgentSphere platform, enabling decentralized, agent-driven travel planning with blockchain identity, trustless communication, and micropayments.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Installation & Setup](#installation--setup)
3. [Core Components](#core-components)
4. [Agent Types](#agent-types)
5. [Usage Examples](#usage-examples)
6. [Database Schema](#database-schema)
7. [Deployment Workflow](#deployment-workflow)
8. [Testing](#testing)

## 🏗️ Architecture Overview

### System Architecture

```
User (Traveler) → AR Viewer → Bus Agent → Train Agent → Hotel Agent
                                    ↓            ↓           ↓
                                Hedera Testnet (USDh payments)
                                    ↓
                              A2A Communication
                              ERC-8004 Identity
                              x402 Micropayments
```

### Components

- **AgentSphere**: Agent deployment platform
- **AR Viewer**: User interaction interface
- **Hedera Testnet**: Blockchain network for payments & identity
- **A2A Protocol**: Agent-to-Agent communication
- **x402 Protocol**: Micropayments for data services
- **ERC-8004**: Agent identity standard

## 🛠️ Installation & Setup

### 1. Prerequisites

- Node.js 18+ and npm
- Hedera Testnet account (from https://portal.hedera.com/)
- Supabase project
- Git

### 2. Clone Hedera Tools

```bash
cd /path/to/agentsphere
mkdir -p tools
cd tools

# Clone required repositories
git clone https://github.com/a2aproject/A2A.git
git clone https://github.com/hedera-dev/erc-8004-contracts.git
git clone https://github.com/hedera-dev/x402-hedera.git
git clone https://github.com/hedera-dev/tutorial-a2a-x402-trustless-agent.git

cd ..
```

### 3. Install Dependencies

```bash
npm install @hashgraph/sdk dotenv
```

### 4. Environment Configuration

Create `.env` file in project root:

```env
# Hedera Testnet Credentials
VITE_TREASURY_ACCOUNT_ID=0.0.xxxxxxx
VITE_TREASURY_PRIVATE_KEY=302e020100300506032b657004220420...

# USDh Stablecoin
VITE_USDH_TOKEN_ID=0.0.7218375

# ERC-8004 Identity Contract (deploy once, then add ID)
VITE_ERC8004_CONTRACT_ID=0.0.xxxxxxx

# Agent Configuration
VITE_AGENT_INITIAL_HBAR=10
VITE_AGENT_INITIAL_USDH=100

# Network
VITE_HEDERA_NETWORK=testnet

# A2A Communication
VITE_A2A_BASE_URL=http://localhost:3001

# MCP Servers
VITE_NEXUS_API_URL=https://nexus.thirdweb.com/api

# External APIs (x402-protected)
VITE_TIMETABLE_API_URL=https://api.example.com/timetables
VITE_HOTEL_API_URL=https://api.example.com/hotels
```

### 5. Database Migration

Run the SQL migration in Supabase:

```sql
-- File: migrations/add_hedera_ai_agent_fields.sql
-- Execute in Supabase SQL Editor
```

See `migrations/add_hedera_ai_agent_fields.sql` for full schema.

## 🔧 Core Components

### 1. Hedera Service (`src/services/hederaService.ts`)

Handles all Hedera blockchain operations.

**Functions:**

- `createAgentWallet()` - Creates Hedera account with USDh association
- `mintAgentIdentity()` - Mints ERC-8004 identity NFT
- `transferUSDh()` - Transfer tokens between accounts
- `processX402Payment()` - Process micropayments for data services
- `multiTransferUSDh()` - Split payments across multiple agents
- `fundAgentWallet()` - Fund agent with initial USDh
- `getUSDhBalance()` - Query account balance

**Example:**

```typescript
import { hederaService } from "./services/hederaService";

// Create agent wallet
const wallet = await hederaService.createAgentWallet(10); // 10 HBAR initial
console.log(`Account: ${wallet.accountId}`);

// Fund with USDh
await hederaService.fundAgentWallet(wallet.accountId, 100);

// Mint identity
const identity = await hederaService.mintAgentIdentity(
  wallet.accountId,
  "https://app.com/agents/bus-001",
  "Bus Agent #001"
);
```

### 2. A2A Service (`src/services/a2aService.ts`)

Manages agent-to-agent communication.

**Functions:**

- `discoverAgents()` - Find agents by type/location
- `sendMessage()` - Send message to another agent
- `queryAgent()` - Query agent for specific data
- `coordinateJourney()` - Multi-agent journey planning
- `startListener()` - Listen for incoming messages

**Example:**

```typescript
import { a2aService } from "./services/a2aService";

// Initialize
a2aService.initialize("0.0.12345");

// Discover nearby bus agents
const busAgents = await a2aService.discoverAgents({
  agentType: "bus_agent",
  location: { latitude: 40.7128, longitude: -74.006, radius: 5000 },
});

// Query agent
const route = await a2aService.queryAgent(
  busAgents[0].accountId,
  "route_query",
  { from: { lat: 40.7128, lon: -74.006 }, to: { lat: 40.7589, lon: -73.9851 } }
);
```

### 3. x402 Client (`src/services/x402Client.ts`)

Handles micropayments for external data services.

**Functions:**

- `fetch()` - Fetch from x402-protected service (auto-pays)
- `queryTimetable()` - Query timetable service
- `queryHotelAvailability()` - Query hotel booking service
- `queryNexus()` - Query Thirdweb Nexus
- `checkBalance()` - Verify agent has funds

**Example:**

```typescript
import { x402Client } from "./services/x402Client";

// Initialize
x402Client.initialize("0.0.12345", "privateKeyHere");

// Query timetable (automatically handles 402 payment)
const timetable = await x402Client.queryTimetable({
  from: "New York",
  to: "Boston",
  date: "2025-11-25",
});
```

## 🤖 Agent Types

### Travel Agents (Hedera AI)

| Type               | Icon | Description                     | A2A | x402 |
| ------------------ | ---- | ------------------------------- | --- | ---- |
| `bus_agent`        | 🚌   | Bus route planning & ticketing  | ✅  | ✅   |
| `train_agent`      | 🚆   | Train schedules & reservations  | ✅  | ✅   |
| `hotel_agent`      | 🏨   | Hotel booking & recommendations | ✅  | ✅   |
| `flight_agent`     | ✈️   | Flight search & booking         | ✅  | ✅   |
| `restaurant_agent` | 🍽️   | Restaurant reservations         | ✅  | ❌   |
| `travel_agent`     | 🌍   | Overall journey coordination    | ✅  | ✅   |

### Legacy Agents

- `intelligent_assistant` - General AI assistant
- `payment_terminal` - Payment processing
- `trailing_payment_terminal` - Mobile payment terminal
- Others...

## 📱 Usage Examples

### Deploy a Bus Agent

```typescript
// In DeployObject.tsx
const deployBusAgent = async () => {
  // Set agent type
  setAgentType("bus_agent");
  setAgentName("Downtown Bus Stop #42");

  // Enable capabilities
  setTextChat(true);
  setVoiceChat(true);
  setX402Enabled(true);

  // Deploy - Hedera wallet automatically created
  await deployAgent();

  // Result:
  // - Hedera account created (e.g., 0.0.12345)
  // - Funded with 10 HBAR + 100 USDh
  // - ERC-8004 identity NFT minted
  // - A2A endpoint configured
  // - Agent card linked
};
```

### User Journey Planning

```typescript
// In AR Viewer
const planJourney = async () => {
  // 1. User scans Bus Agent QR code
  const busAgent = await scanAgent();

  // 2. Chat with agent
  await sendMessage(busAgent, {
    text: "I need to get to Boston with train connection and hotel",
  });

  // 3. Bus agent coordinates with other agents via A2A
  const journey = await busAgent.coordinateJourney({
    from: currentLocation,
    to: bostonLocation,
    date: "2025-12-01",
  });

  // 4. Journey returned with pricing
  // Bus: $5 + $2 agent fee
  // Train: $15 + $2 agent fee
  // Hotel: $80 + $2 agent fee
  // Total: $106

  // 5. User pays once for entire journey
  await payWithCubePay({
    amount: 106,
    token: "USDh",
    recipients: [
      { account: busAgent.hederaAccountId, amount: 7 },
      { account: trainAgent.hederaAccountId, amount: 17 },
      { account: hotelAgent.hederaAccountId, amount: 82 },
    ],
  });
};
```

## 🗄️ Database Schema

### New Fields in `deployed_objects`

```sql
hedera_account_id TEXT          -- e.g., "0.0.12345"
hedera_private_key TEXT         -- Encrypted in production!
hedera_nft_id TEXT              -- ERC-8004 NFT identifier
agent_wallet_public_key TEXT    -- Public key
agent_initial_balance NUMERIC   -- Initial USDh funding
agent_capabilities JSONB        -- {chat: true, a2a: true, x402: true}
a2a_endpoint TEXT               -- A2A communication URL
mcp_servers JSONB               -- ["https://nexus.thirdweb.com/api"]
x402_enabled BOOLEAN            -- Can make x402 payments
```

## 🚀 Deployment Workflow

### Agent Deployment Process

```
1. User selects agent type (Bus/Train/Hotel)
   ↓
2. System creates Hedera wallet
   - Generate ED25519 keypair
   - Create account with 10 HBAR
   - Associate with USDh token
   ↓
3. Fund agent wallet
   - Transfer 100 USDh from treasury
   ↓
4. Mint identity NFT
   - Call ERC-8004 contract
   - Link to agent card URL
   ↓
5. Configure A2A endpoint
   - Set up communication URL
   ↓
6. Save to database
   - Store all Hedera credentials
   - Mark as active
   ↓
7. Deploy microservice (future)
   - Start agent backend service
   - Enable A2A listener
```

## 🧪 Testing

### Test Hedera Wallet Creation

```bash
# In browser console after deploying Bus Agent
const wallet = await hederaService.createAgentWallet(10);
console.log('Account ID:', wallet.accountId);
console.log('Private Key:', wallet.privateKey);

const balance = await hederaService.getUSDhBalance(wallet.accountId);
console.log('USDh Balance:', balance);
```

### Test A2A Communication

```typescript
// Initialize service
a2aService.initialize("0.0.12345");

// Discover agents
const agents = await a2aService.discoverAgents({
  agentType: "train_agent",
  location: { latitude: 40.7128, longitude: -74.006, radius: 10000 },
});

console.log("Found agents:", agents);
```

### Test x402 Payment

```typescript
// Initialize client
x402Client.initialize("0.0.12345", "privateKeyHere");

// Check balance first
const balance = await x402Client.checkBalance();
console.log("Agent balance:", balance, "USDh");

// Query protected service
const data = await x402Client.queryTimetable({
  from: "NYC",
  to: "BOS",
  date: "2025-12-01",
});

console.log("Timetable data:", data);
```

## 🔗 Resources

- **Hedera AI Studio**: https://docs.hedera.com/hedera/open-source-solutions/ai-studio-on-hedera
- **Hedera AI Agent Kit**: https://docs.hedera.com/hedera/open-source-solutions/ai-studio-on-hedera/hedera-ai-agent-kit
- **A2A Protocol**: https://github.com/a2aproject/A2A
- **ERC-8004 Contracts**: https://github.com/hedera-dev/erc-8004-contracts
- **x402 Hedera**: https://github.com/hedera-dev/x402-hedera
- **USDh Token**: https://hashscan.io/testnet/token/0.0.7218375
- **Thirdweb Nexus**: https://nexus.thirdweb.com/

## 📝 Next Steps

1. ✅ Deploy ERC-8004 contract to Hedera Testnet
2. ✅ Update `.env` with contract ID
3. ✅ Test agent deployment with wallet creation
4. ⏳ Build agent microservices (A2A listeners)
5. ⏳ Integrate AR Viewer with multi-agent payments
6. ⏳ Connect to real timetable/booking APIs
7. ⏳ Implement WebRTC for voice/video chat
8. ⏳ Add agent analytics dashboard

## 🛡️ Security Considerations

- **Private Keys**: Encrypt `hedera_private_key` in database (use encryption at rest)
- **Treasury Account**: Keep treasury private key in secure vault (not in .env in production)
- **x402 Payments**: Verify invoice signatures before paying
- **A2A Messages**: Implement message authentication
- **Rate Limiting**: Prevent spam messages between agents
- **Balance Monitoring**: Alert when agent USDh balance < 10

## 📊 Cost Structure

### Hedera Costs

- Account creation: ~$0.05 USD (one-time)
- USDh transfer: ~$0.001 USD per transaction
- ERC-8004 NFT mint: ~$0.02 USD (one-time)
- Total per agent: ~$0.08 USD initial cost

### Agent Fees

- Bus agent: $2 USDh per journey query
- Train agent: $2 USDh per journey query
- Hotel agent: $2 USDh per booking query
- x402 data: $0.10 - $1.00 USDh per API call

---

**Author**: AgentSphere Team  
**Date**: November 20, 2025  
**Version**: 1.0.0  
**Hedera Network**: Testnet (Chain ID: 296)
