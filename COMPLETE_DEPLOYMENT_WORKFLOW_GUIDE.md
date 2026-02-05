# AgentSphere Complete Deployment Workflow Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Wallet Connection](#wallet-connection)
4. [Agent Types & Categories](#agent-types--categories)
5. [Deployment Process Step-by-Step](#deployment-process-step-by-step)
6. [Agent Attributes & Configuration](#agent-attributes--configuration)
7. [Network & Blockchain Selection](#network--blockchain-selection)
8. [Payment Fee Configuration](#payment-fee-configuration)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Troubleshooting](#troubleshooting)

---

## Overview

AgentSphere is a multi-chain platform for deploying autonomous AI agents with blockchain-enabled payment capabilities. Users can deploy agents on various blockchain networks including Ethereum, Solana, Hedera, Polygon, Arbitrum, Base, Optimism, and Avalanche testnets.

**Key Features:**

- Multi-chain deployment support
- Dynamic and fixed fee payment systems
- AR/QR code agent interaction
- Autonomous agent wallets (Hedera AI agents)
- Real-time geolocation-based agent placement

---

## Prerequisites

Before deploying an agent, ensure you have:

### Required

- ✅ **Web Browser** - Chrome, Firefox, or Brave (with WebGL support)
- ✅ **Crypto Wallet** - MetaMask, Phantom, Thirdweb, or compatible Web3 wallet
- ✅ **Testnet Tokens** - Sufficient tokens for gas fees and agent funding
- ✅ **Location Access** - GPS/location permissions enabled
- ✅ **Internet Connection** - Stable connection for blockchain transactions

### Optional

- 📱 **Mobile Device** - For AR Camera deployment mode
- 🗺️ **Map View Access** - For precise agent placement on map

---

## Wallet Connection

### Supported Wallets

#### EVM Networks (Ethereum, Polygon, Arbitrum, Base, OP, Avalanche)

- **MetaMask** - Most common EVM wallet
- **Thirdweb Smart Wallet** - Embedded wallet solution
- **Coinbase Wallet** - Coinbase's self-custody wallet
- **WalletConnect** - Multi-wallet protocol

#### Solana Network

- **Phantom Wallet** - Primary Solana wallet
- **Solflare** - Alternative Solana wallet
- **Backpack** - Multi-chain wallet with Solana support

#### Hedera Network

- **Hashpack** - Official Hedera wallet
- **Blade Wallet** - Hedera-compatible wallet
- **Hedera Wallet Connect** - WalletConnect for Hedera

### How to Connect Wallet

1. **Navigate to AgentSphere Platform**

   ```
   https://agentsphere.example.com (or http://localhost:5174 for dev)
   ```

2. **Click "Connect Wallet" Button**
   - Located in the top-right corner of the navigation bar
   - Shows current wallet status and network

3. **Select Your Wallet Provider**
   - Choose from the wallet options presented
   - Approve connection request in wallet extension

4. **Confirm Network Selection**
   - Platform will detect current network
   - Switch network if prompted (e.g., to Sepolia testnet)

5. **Verify Connection**
   - Your wallet address should appear in the header
   - Balance should display (e.g., "5.2 ETH | 100 USDC")

### Network Switching

The platform will automatically prompt you to switch networks if:

- Current network is not supported
- Deploying agent requires specific network
- Network doesn't match selected blockchain

**Supported Networks:**

- Ethereum Sepolia (Chain ID: 11155111)
- Arbitrum Sepolia (Chain ID: 421614)
- Base Sepolia (Chain ID: 84532)
- OP Sepolia (Chain ID: 11155420)
- Avalanche Fuji (Chain ID: 43113)
- Polygon Amoy (Chain ID: 80002)
- Solana Devnet
- Hedera Testnet

---

## Agent Types & Categories

AgentSphere supports multiple agent types, each with unique capabilities and blockchain integration.

### Traditional Agents (Use Deployer's Wallet)

#### 1. **Intelligent Assistant** (`intelligent_assistant`)

- **Purpose:** General-purpose AI assistant for information and tasks
- **Use Cases:** Customer support, information desk, virtual receptionist
- **Payment Model:** Fixed fee per interaction
- **3D Model:** Cube with holographic effects
- **Wallet:** Uses deployer's connected wallet

#### 2. **Local Services** (`local_services`)

- **Purpose:** Location-based service provider
- **Use Cases:** Local business directory, nearby services finder
- **Payment Model:** Fixed fee per query
- **3D Model:** Cylindrical tower structure
- **Wallet:** Uses deployer's connected wallet

#### 3. **Payment Terminal - POS** (`payment_terminal`)

- **Purpose:** Point-of-sale payment processing
- **Use Cases:** Retail checkout, merchant payments
- **Payment Model:** Fixed OR Dynamic fee
- **3D Model:** Terminal with display screen
- **Wallet:** Uses deployer's connected wallet
- **Special Features:**
  - Supports dynamic fee mode for variable amounts
  - QR code generation for payments
  - Real-time transaction logging

#### 4. **My Payment Terminal** (`content_creator`)

- **Purpose:** Personal payment terminal for creators
- **Use Cases:** Content monetization, tip jar, subscription payments
- **Payment Model:** Fixed fee
- **3D Model:** Crystalline structure
- **Wallet:** Uses deployer's connected wallet

#### 5. **Virtual ATM** (`home_security`)

- **Purpose:** Cryptocurrency ATM service
- **Use Cases:** Crypto-to-fiat conversion, withdrawals
- **Payment Model:** Fixed fee + conversion rate
- **3D Model:** Security box with scanner
- **Wallet:** Uses deployer's connected wallet

#### 6. **Game Agent** (`game_agent`)

- **Purpose:** Gaming and entertainment interactions
- **Use Cases:** AR games, treasure hunts, interactive experiences
- **Payment Model:** Fixed fee per game
- **3D Model:** Geometric gaming shape
- **Wallet:** Uses deployer's connected wallet

#### 7. **Tutor/Teacher** (`tutor_teacher`)

- **Purpose:** Educational assistance and tutoring
- **Use Cases:** Learning platforms, educational apps
- **Payment Model:** Fixed fee per session
- **3D Model:** Book-like structure
- **Wallet:** Uses deployer's connected wallet

#### 8. **Real Estate Broker** (`real_estate_broker`)

- **Purpose:** Property listings and real estate services
- **Use Cases:** Property search, virtual tours, listings
- **Payment Model:** Fixed fee per inquiry
- **3D Model:** Building/house structure
- **Wallet:** Uses deployer's connected wallet

#### 9. **3D World Builder** (`3d_world_builder`)

- **Purpose:** Metaverse and 3D environment creation
- **Use Cases:** Virtual worlds, AR environments
- **Payment Model:** Fixed fee per project
- **3D Model:** Complex geometric structure
- **Wallet:** Uses deployer's connected wallet

#### 10. **Bus Stop Agent** (`bus_stop_agent`)

- **Purpose:** Public transit information
- **Use Cases:** Bus schedules, route information
- **Payment Model:** Fixed fee per query
- **3D Model:** Bus stop shelter
- **Wallet:** Uses deployer's connected wallet

#### 11. **Trailing Payment Terminal** (`trailing_payment_terminal`)

- **Purpose:** Mobile payment terminal that follows user
- **Use Cases:** Mobile merchants, delivery services
- **Payment Model:** Fixed OR Dynamic fee
- **3D Model:** Floating payment interface
- **Wallet:** Uses deployer's connected wallet
- **Special Features:** GPS trailing capability

### Hedera AI Agents (Autonomous Wallets)

These agents receive **their own Hedera blockchain accounts** with autonomous payment capabilities.

#### 12. **🚌 Bus Agent (Hedera AI)** (`bus_agent`)

- **Purpose:** Autonomous bus service booking and payments
- **Use Cases:** Public transit ticketing, route planning
- **Payment Model:** Autonomous payments from agent wallet
- **3D Model:** Animated bus model
- **Wallet:** Unique Hedera account (e.g., 0.0.7145123)
- **Funding:** 10 HBAR + 100 USDh (stablecoin) from treasury

#### 13. **🚆 Train Agent (Hedera AI)** (`train_agent`)

- **Purpose:** Autonomous train ticket booking
- **Use Cases:** Railway ticketing, schedule management
- **Payment Model:** Autonomous payments from agent wallet
- **3D Model:** Train car model
- **Wallet:** Unique Hedera account
- **Funding:** 10 HBAR + 100 USDh from treasury

#### 14. **🏨 Hotel Agent (Hedera AI)** (`hotel_agent`)

- **Purpose:** Autonomous hotel booking and reservations
- **Use Cases:** Room reservations, hospitality services
- **Payment Model:** Autonomous payments from agent wallet
- **3D Model:** Hotel building model
- **Wallet:** Unique Hedera account
- **Funding:** 10 HBAR + 100 USDh from treasury

#### 15. **✈️ Flight Agent (Hedera AI)** (`flight_agent`)

- **Purpose:** Autonomous flight booking and travel
- **Use Cases:** Airline ticketing, flight tracking
- **Payment Model:** Autonomous payments from agent wallet
- **3D Model:** Airplane model
- **Wallet:** Unique Hedera account
- **Funding:** 10 HBAR + 100 USDh from treasury
- **Special Features:** Flightradar24 API integration for live flight data

#### 16. **🍽️ Restaurant Agent (Hedera AI)** (`restaurant_agent`)

- **Purpose:** Autonomous restaurant reservations
- **Use Cases:** Table booking, food ordering
- **Payment Model:** Autonomous payments from agent wallet
- **3D Model:** Restaurant/cafe model
- **Wallet:** Unique Hedera account
- **Funding:** 10 HBAR + 100 USDh from treasury

#### 17. **🌍 Travel Coordinator (Hedera AI)** (`travel_agent`)

- **Purpose:** Comprehensive travel planning and coordination
- **Use Cases:** Multi-service travel bookings, itinerary management
- **Payment Model:** Autonomous payments from agent wallet
- **3D Model:** Globe with travel icons
- **Wallet:** Unique Hedera account
- **Funding:** 10 HBAR + 100 USDh from treasury
- **Special Features:** Orchestrates other travel agents

---

## Deployment Process Step-by-Step

### Method 1: Standard Deployment (GPS-Based)

#### Step 1: Access Deployment Page

1. Navigate to deployment page:

   ```
   http://localhost:5174/deploy (dev)
   https://agentsphere.example.com/deploy (production)
   ```

2. Ensure wallet is connected (see [Wallet Connection](#wallet-connection))

#### Step 2: Fill Agent Details

**Agent Name** (Required)

- Enter a unique, descriptive name for your agent
- Examples: "Downtown Coffee Terminal", "Airport Travel Assistant"
- Character limit: 3-100 characters
- Must be unique within your deployment region

**Agent Type** (Required)

- Select from dropdown menu
- Categories:
  - **GENERAL** - Traditional agents
  - **TRAVEL (Hedera AI)** - Autonomous travel agents
  - **PAYMENTS** - Payment terminals
  - **SERVICES** - Local services

**Agent Description** (Optional)

- Provide details about agent's purpose and capabilities
- Maximum 500 characters
- Supports basic markdown formatting

**Agent Avatar URL** (Optional)

- Provide URL to custom avatar image
- Supported formats: PNG, JPG, GIF, WebP
- Recommended size: 512x512px
- Falls back to default agent type avatar if not provided

#### Step 3: Configure Location

**Option A: Use Current Location**

1. Click "Use Current Location" button
2. Allow browser location access when prompted
3. Your GPS coordinates will be captured automatically
4. Map will show your current position

**Option B: Select on Map**

1. Scroll down to the map view
2. Click anywhere on the map to set agent location
3. Drag marker to fine-tune position
4. Coordinates update in real-time

**Location Attributes Captured:**

- `latitude` - GPS latitude coordinate
- `longitude` - GPS longitude coordinate
- `altitude` - Elevation (if available)
- `location_name` - Geocoded address (if available)
- `deployment_timestamp` - Exact time of deployment

#### Step 4: Select Network & Token

**Network Selection**

- Choose blockchain network from dropdown
- Options appear based on connected wallet
- Platform validates network compatibility

**Token Selection**

- Choose payment token for interaction fees
- Available tokens depend on selected network:
  - **Ethereum Sepolia:** USDC, USDT, DAI
  - **Arbitrum Sepolia:** USDC, USDT
  - **Base Sepolia:** USDC
  - **Polygon Amoy:** USDC, USDT
  - **Solana Devnet:** USDC, SOL
  - **Hedera Testnet:** USDh (stablecoin), HBAR

#### Step 5: Configure Payment Fees

**For Non-Payment Terminal Agents:**

- Enter fixed interaction fee amount
- Example: "5.00" for 5 USDC per interaction

**For Payment Terminal & Trailing Payment Terminal:**

**Fixed Fee Mode**

- Select "Fixed Fee" radio button
- Enter specific amount (e.g., "25")
- This fee will be charged for every transaction

**Dynamic Fee Mode**

- Select "Dynamic Fee" radio button
- Fee input field will be disabled
- Blue info box appears:
  > "This terminal will accept variable amounts from merchants. The fee will be set per transaction by e-shops, on-ramps, or other payment sources. No fixed amount is required."
- Agent will accept variable amounts from payment sources
- Ideal for e-commerce integrations, on-ramps, merchant services

#### Step 6: Deploy Agent

1. Review all entered information
2. Click **"Deploy Agent"** button
3. Wait for blockchain confirmation

**Deployment Process:**

For **Traditional Agents:**

```
1. Validate form data
2. Prepare deployment transaction
3. Sign transaction with your wallet
4. Confirm on blockchain
5. Store agent data in Supabase database
6. Generate QR code
7. Return deployment confirmation
```

For **Hedera AI Agents:**

```
1. Validate form data
2. Create new Hedera account for agent
3. Fund agent account from treasury:
   - 10 HBAR for gas fees
   - 100 USDh stablecoin for payments
4. Associate agent account with deployer
5. Sign deployment transaction
6. Confirm on blockchain
7. Store agent data with Hedera account ID
8. Generate QR code with agent wallet info
9. Return deployment confirmation
```

#### Step 7: Deployment Confirmation

**Success Indicators:**

- ✅ Green success notification
- ✅ Transaction hash displayed
- ✅ Agent ID assigned
- ✅ QR code generated
- ✅ View on blockchain explorer link

**Information Provided:**

- Agent ID (database record)
- Transaction Hash
- Agent Wallet Address
- QR Code for AR interaction
- Blockchain explorer link

### Method 2: AR Camera Deployment

#### Step 1: Enable AR Camera Mode

1. Fill in basic agent details (name, type, description)
2. Configure payment settings
3. Click **"Deploy with AR Camera"** button

#### Step 2: AR Camera Interface

1. Platform will switch to AR Camera mode
2. Camera view opens with AR overlay
3. Place agent in real-world environment by:
   - Moving device to scan surfaces
   - Tapping screen to place agent marker
   - Adjusting position with drag controls

#### Step 3: Capture AR Placement

1. Position agent at desired location
2. AR system captures:
   - GPS coordinates
   - Compass heading
   - Surface elevation
   - AR anchor data
3. Click "Confirm Placement" button

#### Step 4: Finalize Deployment

1. Review placement preview
2. AR Camera returns you to deployment form
3. Form retains all previously entered data
4. Location fields auto-populated from AR placement
5. Click "Deploy Agent" to complete

**AR Camera Benefits:**

- Visual placement confirmation
- Accurate surface-level positioning
- Real-world context alignment
- Better agent discoverability

---

## Agent Attributes & Configuration

### Core Attributes (All Agents)

| Attribute                    | Description               | Required    | Example                                        |
| ---------------------------- | ------------------------- | ----------- | ---------------------------------------------- |
| `name`                       | Agent display name        | Yes         | "Downtown Payment Terminal"                    |
| `agent_type` / `object_type` | Agent category            | Yes         | `payment_terminal`                             |
| `latitude`                   | GPS latitude              | Yes         | 37.7749                                        |
| `longitude`                  | GPS longitude             | Yes         | -122.4194                                      |
| `altitude`                   | Elevation in meters       | No          | 52.3                                           |
| `deployer_address`           | Deployer's wallet address | Yes         | 0xd7fa8219c8fa...b381b3727b1e                  |
| `agent_wallet_address`       | Agent's payment wallet    | Yes         | 0.0.7145123 (Hedera) or deployer wallet        |
| `agent_wallet_type`          | Wallet blockchain type    | Yes         | `hedera_wallet`, `evm_wallet`, `solana_wallet` |
| `interaction_fee_amount`     | Fee per interaction       | Conditional | 10.0                                           |
| `interaction_fee_token`      | Payment token symbol      | Yes         | USDC                                           |
| `fee_type`                   | Fee structure type        | Yes         | `fixed` or `dynamic`                           |
| `deployment_network_name`    | Blockchain network        | Yes         | "Ethereum Sepolia"                             |
| `deployment_chain_id`        | Chain ID number           | Yes         | 11155111                                       |
| `deployment_status`          | Agent status              | Yes         | `active`, `inactive`, `paused`                 |
| `deployed_at`                | Deployment timestamp      | Yes         | 2026-02-03T14:30:00Z                           |

### Payment-Specific Attributes

| Attribute                  | Description                 | Payment Terminals Only | Example                            |
| -------------------------- | --------------------------- | ---------------------- | ---------------------------------- |
| `fee_type`                 | Payment fee structure       | Yes                    | `fixed` or `dynamic`               |
| `interaction_fee_amount`   | Fixed fee amount            | If `fee_type=fixed`    | 25.0                               |
| `interaction_fee_usdfc`    | Fee in USDC equivalent      | If `fee_type=fixed`    | 25.0                               |
| `accepts_dynamic_fees`     | Can accept variable amounts | If `fee_type=dynamic`  | true                               |
| `payment_integration_type` | Integration method          | Yes                    | `qr_code`, `wallet_connect`, `api` |

### Hedera AI Agent Attributes

| Attribute                       | Description              | Required | Example          |
| ------------------------------- | ------------------------ | -------- | ---------------- |
| `hedera_account_id`             | Unique Hedera account    | Yes      | 0.0.7145123      |
| `hedera_private_key_encrypted`  | Encrypted private key    | Yes      | (encrypted blob) |
| `initial_hbar_balance`          | Starting HBAR balance    | Yes      | 10.0             |
| `initial_usdh_balance`          | Starting USDh balance    | Yes      | 100.0            |
| `treasury_funded`               | Funded by treasury       | Yes      | true             |
| `autonomous_operations_enabled` | Can operate autonomously | Yes      | true             |

### Identity Attributes (Optional)

| Attribute            | Description                  | Example                    |
| -------------------- | ---------------------------- | -------------------------- |
| `agent_identity_did` | Decentralized Identifier     | did:hedera:testnet:z6Mk... |
| `verified_identity`  | Identity verification status | true                       |
| `kyc_status`         | KYC verification level       | `basic`, `full`, `none`    |
| `reputation_score`   | Agent reputation (0-100)     | 87                         |

### Metadata Attributes

| Attribute     | Description         | Example                            |
| ------------- | ------------------- | ---------------------------------- |
| `description` | Agent description   | "AI-powered travel booking agent"  |
| `avatar_url`  | Custom avatar image | https://cdn.example.com/avatar.png |
| `tags`        | Search tags         | ["travel", "booking", "AI"]        |
| `category`    | Primary category    | "Travel & Transportation"          |
| `version`     | Agent version       | "1.2.0"                            |

---

## Network & Blockchain Selection

### Network Comparison

| Network              | Chain ID | Native Token | Stablecoins     | Gas Fees | Speed  | Use Cases                 |
| -------------------- | -------- | ------------ | --------------- | -------- | ------ | ------------------------- |
| **Ethereum Sepolia** | 11155111 | ETH          | USDC, USDT, DAI | High     | 12-15s | General testing           |
| **Arbitrum Sepolia** | 421614   | ETH          | USDC, USDT      | Low      | 1-2s   | High-throughput apps      |
| **Base Sepolia**     | 84532    | ETH          | USDC            | Very Low | 2s     | Coinbase integrations     |
| **OP Sepolia**       | 11155420 | ETH          | USDC            | Low      | 2s     | Optimistic rollup testing |
| **Avalanche Fuji**   | 43113    | AVAX         | USDC            | Medium   | 2s     | Fast finality             |
| **Polygon Amoy**     | 80002    | MATIC        | USDC, USDT      | Very Low | 2s     | High-volume testing       |
| **Solana Devnet**    | -        | SOL          | USDC            | Very Low | <1s    | High-speed payments       |
| **Hedera Testnet**   | -        | HBAR         | USDh            | Very Low | 3-5s   | Enterprise applications   |

### Choosing the Right Network

**For High-Volume Payment Terminals:**

- ✅ Solana Devnet (fastest, cheapest)
- ✅ Polygon Amoy (low cost, EVM compatible)

**For Autonomous AI Agents:**

- ✅ Hedera Testnet (native account model, low fees)
- ✅ Base Sepolia (good Coinbase integration)

**For Complex Smart Contracts:**

- ✅ Ethereum Sepolia (most mature tooling)
- ✅ Arbitrum Sepolia (cost-effective L2)

**For E-Commerce Integrations:**

- ✅ Base Sepolia (Coinbase Commerce)
- ✅ Polygon Amoy (merchant-friendly)

### Token Selection by Network

**Ethereum Sepolia:**

- USDC (recommended for stablecoin payments)
- USDT (alternative stablecoin)
- DAI (decentralized stablecoin)

**Arbitrum Sepolia:**

- USDC (recommended)
- USDT

**Base Sepolia:**

- USDC (native)

**Polygon Amoy:**

- USDC (recommended)
- USDT

**Solana Devnet:**

- USDC (SPL token, recommended)
- SOL (native token)

**Hedera Testnet:**

- USDh (Hedera native stablecoin, recommended)
- HBAR (native token)

---

## Payment Fee Configuration

### Fixed Fee Model

**Best For:**

- Consistent service pricing
- Subscription-style interactions
- Predictable revenue streams

**Configuration:**

```
Fee Type: Fixed Fee
Interaction Fee: 10.00 USDC
```

**User Experience:**

- User sees exact fee before interaction
- Same fee charged every time
- Simple, predictable pricing

**Database Storage:**

```json
{
  "fee_type": "fixed",
  "interaction_fee_amount": 10.0,
  "interaction_fee_usdfc": 10.0,
  "interaction_fee_token": "USDC"
}
```

### Dynamic Fee Model

**Best For:**

- E-commerce checkout terminals
- Variable-amount payments (tips, donations)
- Merchant-defined pricing
- On-ramp/off-ramp services

**Configuration:**

```
Fee Type: Dynamic Fee
Interaction Fee: [Determined by payment source]
```

**User Experience:**

- Merchant/app passes fee amount to terminal
- User sees amount when interacting
- Flexible pricing based on context

**Database Storage:**

```json
{
  "fee_type": "dynamic",
  "interaction_fee_amount": null,
  "interaction_fee_usdfc": null,
  "interaction_fee_token": "USDC",
  "accepts_dynamic_fees": true
}
```

### Integration Example (Dynamic Fee)

**E-Commerce Integration:**

```javascript
// Merchant app redirects to payment terminal with amount
const paymentUrl = `agentsphere://pay?agent_id=123&amount=45.50&currency=USDC&order_id=ORD-789`;

// AR Viewer receives payment request
const paymentRequest = {
  agentId: 123,
  amount: 45.5,
  currency: "USDC",
  orderId: "ORD-789",
};

// User scans QR code with payment details encoded
// Terminal processes payment with dynamic amount
```

---

## Post-Deployment Verification

### Verify in Dashboard

1. Navigate to Multi-Chain Agent Dashboard:

   ```
   http://localhost:5174/dashboard
   ```

2. Check "My Agents" section for newly deployed agent

3. Verify agent details:
   - ✅ Agent name matches
   - ✅ Agent type correct
   - ✅ Location shows on map
   - ✅ Fee configuration accurate
   - ✅ Wallet address displayed

### Verify on Blockchain

**Ethereum/EVM Networks:**

```
1. Click on transaction hash from deployment confirmation
2. Opens Etherscan (or network-specific explorer)
3. Verify:
   - Transaction status: Success
   - From: Your wallet address
   - Contract interaction: Agent registry
   - Gas used: Reasonable amount
```

**Solana:**

```
1. Click on transaction signature
2. Opens Solana Explorer
3. Verify:
   - Transaction status: Success
   - Signer: Your wallet
   - Program: AgentSphere program
```

**Hedera:**

```
1. Click on transaction ID
2. Opens HashScan explorer
3. Verify:
   - Transaction type: Account creation (for AI agents)
   - Status: Success
   - New account ID: 0.0.XXXXXXX
   - Initial balance: 10 HBAR + 100 USDh
```

### Verify in Database (Supabase)

**Query your deployed agent:**

```sql
SELECT
  id,
  name,
  agent_type,
  agent_wallet_address,
  agent_wallet_type,
  deployment_network_name,
  deployment_chain_id,
  interaction_fee_amount,
  fee_type,
  deployment_status,
  deployed_at
FROM deployed_objects
WHERE deployer_address = 'YOUR_WALLET_ADDRESS'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
| Field | Value |
|-------|-------|
| name | "Downtown Payment Terminal" |
| agent_type | payment_terminal |
| agent_wallet_address | 0xd7fa... or 0.0.7145123 |
| deployment_network_name | Ethereum Sepolia |
| fee_type | fixed or dynamic |
| deployment_status | active |

### Test Agent Interaction

**Method 1: AR Viewer**

1. Open AR Viewer app
2. Navigate to agent location
3. Point camera at AR marker
4. Agent should appear in AR view
5. Tap agent to open interaction modal
6. Verify all details display correctly

**Method 2: Map View**

1. Open Map View in dashboard
2. Zoom to agent location
3. Agent marker should be visible
4. Click marker to view details
5. QR code should be scannable

**Method 3: QR Code Test**

1. Save generated QR code image
2. Scan with mobile device
3. Should open agent interaction page
4. All payment details should display
5. Test payment flow (on testnet)

---

## Troubleshooting

### Deployment Fails

**Problem:** Transaction reverts or fails
**Solutions:**

- ✅ Check wallet has sufficient balance for gas fees
- ✅ Verify network connection is stable
- ✅ Ensure correct network selected in wallet
- ✅ Try increasing gas limit manually
- ✅ Check blockchain network status (not congested)

**Problem:** "Invalid agent type" error
**Solutions:**

- ✅ Ensure agent type from approved list
- ✅ Check database constraint allows this type
- ✅ Run agent type migration if needed:
  ```bash
  node apply_agent_type_labels_migration.js
  ```

**Problem:** Location capture fails
**Solutions:**

- ✅ Enable location permissions in browser
- ✅ Use HTTPS (required for geolocation API)
- ✅ Try manual map selection instead
- ✅ Check GPS signal if using mobile device

### Hedera AI Agent Issues

**Problem:** Agent wallet creation fails
**Solutions:**

- ✅ Verify treasury account has sufficient HBAR
- ✅ Check Hedera network status
- ✅ Ensure private key encryption service running
- ✅ Verify database has `hedera_account_id` column

**Problem:** Agent not funded correctly
**Solutions:**

- ✅ Check treasury account balance
- ✅ Verify funding transaction completed
- ✅ Query Hedera account on HashScan
- ✅ Check funding logic in deployment code

### Payment Terminal Issues

**Problem:** Dynamic fee not working
**Solutions:**

- ✅ Verify `fee_type` field exists in database:
  ```bash
  node apply_fee_type_migration.js
  ```
- ✅ Ensure agent type is `payment_terminal` or `trailing_payment_terminal`
- ✅ Check radio button selection preserved
- ✅ Clear browser cache and retry

**Problem:** QR code doesn't encode payment info
**Solutions:**

- ✅ Verify deployment data includes all fields
- ✅ Check QR generation uses dynamic deployment data
- ✅ Test QR code with validator tool
- ✅ Regenerate QR code from dashboard

### Network/Wallet Issues

**Problem:** Wrong network detected
**Solutions:**

- ✅ Manually switch network in wallet
- ✅ Disconnect and reconnect wallet
- ✅ Clear wallet cache/reset connection
- ✅ Try different wallet provider

**Problem:** Token not appearing in list
**Solutions:**

- ✅ Verify token contract deployed on network
- ✅ Add token address to supported tokens list
- ✅ Check token balance > 0 (for display)
- ✅ Import token to wallet manually

### Database Issues

**Problem:** Agent not appearing in dashboard
**Solutions:**

- ✅ Check Supabase connection
- ✅ Verify row-level security policies allow read
- ✅ Query database directly to confirm record exists
- ✅ Check deployer_address matches wallet

**Problem:** Missing columns error
**Solutions:**

- ✅ Run all pending migrations:
  ```bash
  node apply_agent_type_labels_migration.js
  node apply_fee_type_migration.js
  node apply_wallet_migration_v2.js
  node apply_dynamic_deployment_fields.sql
  ```

---

## Additional Resources

### Documentation

- [Agent Type Compatibility Guide](./AGENT_TYPE_COMPATIBILITY_GUIDE.md)
- [Agent Wallet Architecture](./AGENT_WALLET_ARCHITECTURE.md)
- [Dynamic Fee Integration](./AR_VIEWER_DYNAMIC_PAYMENT_INTEGRATION.md)
- [Testing Guide](./TESTING_GUIDE_DYNAMIC_FEES.md)

### API Documentation

- [Polygon Amoy & Solana Devnet API](./API_DOCUMENTATION_POLYGON_AMOY_SOLANA_DEVNET.md)
- [A2A Payment Integration](./A2A_AGENT_TO_AGENT_PAYMENT_INTEGRATION_GUIDE.md)

### Migration Guides

- [Agent Type Migration](./AGENT_TYPE_MIGRATION_GUIDE.md)
- [Agent Identity System](./AGENT_IDENTITY_MIGRATION_GUIDE.md)
- [Dynamic Deployment Updates](./AR_VIEWER_DYNAMIC_DEPLOYMENT_UPDATE.md)

### Developer Tools

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Etherscan (Sepolia):** https://sepolia.etherscan.io
- **Solana Explorer:** https://explorer.solana.com?cluster=devnet
- **HashScan (Hedera):** https://hashscan.io/testnet
- **Polygon Scan (Amoy):** https://amoy.polygonscan.com

---

## Support & Feedback

For issues, questions, or feature requests:

1. **GitHub Issues:** [github.com/agentsphere/issues](https://github.com/agentsphere/issues)
2. **Discord Community:** [discord.gg/agentsphere](https://discord.gg/agentsphere)
3. **Documentation:** [docs.agentsphere.io](https://docs.agentsphere.io)
4. **Email Support:** support@agentsphere.io

---

**Document Version:** 1.0.0  
**Last Updated:** February 3, 2026  
**Maintained By:** AgentSphere Development Team
