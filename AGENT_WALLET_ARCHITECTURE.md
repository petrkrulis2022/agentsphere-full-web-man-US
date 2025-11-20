# Agent Wallet Architecture - Hedera AI vs Traditional Agents

## Overview

AgentSphere now supports **two different wallet architectures** depending on agent type:

### 1. **Traditional Agents** (Existing Behavior)

- Agent wallet = Deployer's connected wallet
- All payments go directly to deployer
- No autonomous blockchain operations

### 2. **Hedera AI Agents** (New)

- Agent wallet = Unique Hedera account created for the agent
- Autonomous blockchain identity and payments
- Funded by treasury with 10 HBAR + 100 USDh

---

## Agent Wallet Assignment Logic

```typescript
// DeployObject.tsx - Line 1308
agent_wallet_address: hederaWalletData?.accountId ||
  solanaWallet?.publicKey?.toString() ||
  evmWallet ||
  address;

agent_wallet_type: hederaWalletData?.accountId
  ? "hedera_wallet" // For Hedera AI agents
  : solanaWallet?.publicKey
  ? "solana_wallet" // For Solana deployers
  : "evm_wallet"; // For EVM deployers (MetaMask/Thirdweb)
```

### Hedera AI Agent Types

These agents get their **own Hedera accounts**:

- 🚌 Bus Agent (Hedera AI) - `bus_agent`
- 🚆 Train Agent (Hedera AI) - `train_agent`
- 🏨 Hotel Agent (Hedera AI) - `hotel_agent`
- ✈️ Flight Agent (Hedera AI) - `flight_agent`
- 🍽️ Restaurant Agent (Hedera AI) - `restaurant_agent`
- 🌍 Travel Coordinator (Hedera AI) - `travel_agent`

### Traditional Agent Types

These agents use **deployer's wallet**:

- Intelligent Assistant
- Local Services
- Payment Terminal
- Game Agent
- 3D World Builder
- Home Security
- Content Creator
- Real Estate Broker
- Bus Stop Agent

---

## How to View Agent Wallet Addresses

### Method 1: Agent Interaction Modal

1. Open AR Viewer or Map View
2. Click on any deployed agent
3. Scroll to bottom of agent details
4. Look for **"Agent Wallet:"** field

**Example Output:**

- **Hedera Agent**: `0.0.7145123` ← Unique Hedera account
- **Traditional Agent**: `0xd7fa8219c8fa...b381b3727b1e` ← Your wallet

### Method 2: Database Query (Supabase)

```sql
SELECT
  name,
  object_type,
  agent_wallet_address,
  agent_wallet_type,
  hedera_account_id,
  deployer_address,
  owner_wallet
FROM deployed_objects
WHERE object_type IN ('bus_agent', 'train_agent', 'hotel_agent', 'flight_agent', 'restaurant_agent', 'travel_agent')
ORDER BY created_at DESC;
```

### Method 3: Browser Console (During Deployment)

When deploying Hedera AI agent, check console logs:

```
🔷 Creating Hedera wallet for bus_agent...
🔑 Generating new agent wallet...
✅ Agent account created: 0.0.7145123
💰 Funding agent wallet with 100 USDh...
✅ Agent funded with 100 USDh
🎫 Minting ERC-8004 identity NFT...
✅ Identity NFT minted: 0.0.7218999-12345
```

---

## Database Schema

```sql
-- Fields in deployed_objects table
agent_wallet_address TEXT  -- Hedera account OR deployer wallet
agent_wallet_type TEXT     -- "hedera_wallet" | "solana_wallet" | "evm_wallet"
hedera_account_id TEXT     -- Only populated for Hedera AI agents
hedera_private_key TEXT    -- Only populated for Hedera AI agents (encrypt in production!)
hedera_nft_id TEXT         -- ERC-8004 identity NFT ID
owner_wallet TEXT          -- Always deployer's wallet
deployer_address TEXT      -- Always deployer's wallet
```

### Key Distinctions:

- **`agent_wallet_address`** = Where the agent receives/sends payments
  - Hedera AI: `0.0.xxxxxx` (autonomous)
  - Traditional: Deployer's wallet (passive)
- **`owner_wallet`** = Who deployed the agent (always deployer)
- **`hedera_account_id`** = Only set for Hedera AI agents

---

## Migration Strategy for Existing Agents

### Problem:

Existing agents in database have `agent_wallet_address = deployer's wallet`

### Solution:

**No migration needed!** Existing agents should keep using deployer's wallet because:

1. They are not Hedera AI agents
2. They don't have autonomous capabilities
3. Changing their wallet would break existing payment flows

### If You Want to Upgrade Existing Agent to Hedera:

❌ **Cannot upgrade in place** - must redeploy as new agent type

**Why?**

- Hedera wallet creation happens during deployment
- ERC-8004 NFT minting is deployment-time operation
- A2A endpoint configuration requires fresh setup
- x402 capabilities require treasury funding

**Process:**

1. Note existing agent's location, settings, and content
2. Deploy new Hedera AI agent at same location
3. Delete old traditional agent
4. New agent gets fresh Hedera wallet automatically

---

## Payment Flow Differences

### Traditional Agent Payment Flow:

```
User → Pays interaction fee → Deployer's wallet
                               (agent_wallet_address = deployer)
```

### Hedera AI Agent Payment Flow:

```
User → Pays journey cost → Multi-transfer splits payment:
                           ├─ Bus agent wallet (0.0.7145123)
                           ├─ Train agent wallet (0.0.7145124)
                           └─ Hotel agent wallet (0.0.7145125)

Agent → Pays x402 API fee → External service
        (from agent's own USDh balance)

Agent → Receives A2A message → Coordinates with other agents
        (identified by hedera_account_id)
```

---

## Wallet Balance Management

### Traditional Agents:

- ❌ No wallet balance to manage
- ✅ All payments accumulate in deployer's wallet

### Hedera AI Agents:

- ✅ Initial funding: 10 HBAR + 100 USDh (from treasury)
- ✅ Can receive payments: Users pay for journeys
- ✅ Can send payments: x402 micropayments to APIs
- ⚠️ **Balance monitoring required**: Check USDh balance before operations

**Check Agent Balance:**

```typescript
import { hederaService } from "@/services/hederaService";

const balance = await hederaService.getUSDhBalance(agentAccountId);
console.log(`Agent has ${balance} USDh`);

// If balance low, fund from treasury:
if (balance < 10) {
  await hederaService.fundAgentWallet(agentAccountId, 100);
}
```

---

## Treasury Account Management

**Current Treasury:** `0.0.7145005` (300,000 USDh available)

### Treasury Responsibilities:

1. **Initial Agent Funding**: 100 USDh per agent at deployment
2. **Top-up Funding**: Refill agent wallets when balance low
3. **USDh Distribution**: Manage stablecoin supply for all agents

### Cost Calculation:

- **Per Agent**: 10 HBAR (~$1) + 100 USDh ($100) = ~$101
- **100 Agents**: ~$10,100 total funding needed
- **Current Capacity**: 300,000 USDh = 3,000 agents (USDh only)

**Monitor Treasury Balance:**

```typescript
const treasuryBalance = await hederaService.getUSDhBalance(
  import.meta.env.VITE_TREASURY_ACCOUNT_ID
);
console.log(`Treasury: ${treasuryBalance} USDh remaining`);
```

---

## Security Considerations

### ⚠️ Private Key Storage

**Current implementation stores private keys in plaintext!**

```sql
hedera_private_key TEXT  -- UNENCRYPTED IN DATABASE
```

### Production Requirements:

1. **Encrypt private keys** before storing in database
2. **Use environment variables** for treasury private key
3. **Implement key rotation** for compromised agents
4. **Separate key management service** (e.g., HashiCorp Vault)

### Recommended Encryption:

```typescript
import crypto from "crypto";

// Encrypt before storing
const encryptedKey = crypto
  .publicEncrypt(publicKey, Buffer.from(privateKey))
  .toString("base64");

// Decrypt when needed
const decryptedKey = crypto
  .privateDecrypt(privateKey, Buffer.from(encryptedKey, "base64"))
  .toString();
```

---

## Testing Wallet Assignment

### Test Case 1: Deploy Hedera AI Agent

```
1. Navigate to http://localhost:5174/
2. Connect MetaMask wallet (0xd7fa82...)
3. Select "🚌 Bus Agent (Hedera AI)"
4. Click "Deploy on Hedera Testnet"
5. Check console: "✅ Agent account created: 0.0.7145123"
6. Open agent modal → Agent Wallet: "0.0.7145123" ✅
```

### Test Case 2: Deploy Traditional Agent

```
1. Navigate to http://localhost:5174/
2. Connect MetaMask wallet (0xd7fa82...)
3. Select "Intelligent Assistant"
4. Click "Deploy"
5. Open agent modal → Agent Wallet: "0xd7fa82..." ✅
```

### Test Case 3: Query Database

```sql
-- Should show different wallet addresses for each type
SELECT
  name,
  object_type,
  agent_wallet_address,
  deployer_address,
  CASE
    WHEN agent_wallet_address = deployer_address THEN 'Traditional'
    ELSE 'Hedera AI'
  END as agent_category
FROM deployed_objects
ORDER BY created_at DESC
LIMIT 10;
```

---

## Summary

✅ **Fixed**: Hedera AI agents now get unique wallets (`0.0.xxxxxx`)  
✅ **Preserved**: Traditional agents still use deployer's wallet  
✅ **Visible**: Agent wallet displayed in interaction modal  
✅ **Database**: `agent_wallet_type` field tracks wallet origin  
⚠️ **Security**: Encrypt private keys before production deployment  
📊 **Monitoring**: Track treasury balance and agent USDh levels

**Next Steps:**

1. Test first Hedera agent deployment
2. Verify agent wallet appears correctly in UI
3. Apply database migration to add Hedera fields
4. Deploy ERC-8004 contract for identity NFTs
5. Implement private key encryption for production
