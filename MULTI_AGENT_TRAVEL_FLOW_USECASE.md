# Multi-Agent Travel Flow - Complete Use Case

## Overview

Complete end-to-end travel booking flow demonstrating multi-agent coordination, x402 micropayments, A2A protocol communication, and blockchain-verified agent identities on Hedera Testnet.

## Deployed Agents

### 1. Travel Agent 1 (Standard Coordinator) ✅ DEPLOYED

- **Hedera Account**: `0.0.7301232`
- **Agent Type**: Travel Agent (Package Coordinator)
- **Fee Structure**: **STATIC** - 625 USDH (Demo Configuration)
- **x402 Enabled**: Yes (for sub-agent payments only)
- **MCP Integration**: ❌ No
- **AID NFT**: Minted (TX: `0x04beefb4e8d16246e7bef4892d318fdaf75efdefc417771720a9d23766a8ed58`)
- **Role**: Standard package coordinator - coordinates sub-agents only (no flight data)

### 1b. Travel Agent 2 (MCP-Enabled Coordinator) ✅ DEPLOYED

- **Hedera Account**: `0.0.7301930`
- **Agent Type**: Travel Agent (Package Coordinator + MCP)
- **Fee Structure**: **STATIC** - 625 USDH (Demo Configuration)
- **x402 Enabled**: Yes (for MCP queries + sub-agent payments)
- **MCP Integration**: ✅ Yes (Flightradar24)
- **x402 MCP Cost**: 0.00022 USDH per flight query
- **AID NFT**: Minted (TX: TBD)
- **Role**: Main agent user interacts with - queries Flightradar24 + coordinates all sub-agents
- **Capabilities** (Both Travel Agents):
  - Package deal creation (transport + hotel)
  - Multi-agent coordination via A2A protocol
  - Automated payment splitting to sub-agents
  - Trip planning and optimization
  - Real-time itinerary updates
  - Customer support coordination

**Additional Capabilities** (Travel Agent 2 only):

- Real-time flight data via Flightradar24 MCP
- x402 micropayments for MCP queries (0.00022 USDH)
- Flight price comparison
- Alternative package suggestions (flight vs bus+train+hotel)

**Payment Flow**:

- Receives total payment from user (including fee)
- Distributes payments to Bus, Train, Hotel agents
- Keeps coordination fee

**Metadata Fields**:

- Supported destinations
- Partner agents (bus/train/hotel DIDs)
- Commission rate (625 USDH fixed)
- Package types (weekend/business/vacation)
- Cancellation policy
- MCP services (Travel Agent 2 only: Flightradar24)

### 2. AI Bus Agent (Hedera AI Bus 2) ✅ DEPLOYED

- **Hedera Account**: `0.0.7299550`
- **Agent EVM Address**: `0x0000000000000000000000000000000007299550`
- **DID**: `did:hedera:testnet:0.0.7299550`
- **Agent Type**: AI Bus
- **Fee Structure**: **STATIC** - 1000 USDH per ride
- **x402 Enabled**: Yes
- **AID NFT**: Minted (TX: `0x13ef328ce59d2be1c69388a8ec2fe02f53ad0d4a01557c7a54b7204b5ef0fd70`)
- **Identity Registry**: `0x91465109a685abc19ecc94474c0f24bb05045d37` (0.0.7299955)
- **Role**: Sub-agent providing local bus transport
- **Capabilities**: Route planning, real-time tracking, automated payments
- **Verification**: [View on HashScan](https://hashscan.io/testnet/account/0.0.7299550)

### 3. AI Train Agent ✅ DEPLOYED

- **Hedera Account**: `0.0.7300963`
- **Agent Type**: AI Train
- **Fee Structure**: **STATIC** - 1500 USDH per ticket
- **x402 Enabled**: Yes
- **AID NFT**: Minted (TX: `0xe698be655a81032a36dfb37198cfafc311cb7a10452d3c988ab42cbce5eb3f93`)
- **Role**: Sub-agent providing intercity train transport
- **Capabilities**:
  - Multi-city route planning
  - Seat reservation
  - Schedule optimization
  - Connection recommendations
- **Metadata Fields**:
  - Route network (intercity/regional)
  - Seat classes (economy/business/first)
  - Luggage allowance
  - Cancellation policy

### 4. AI Hotel Agent ✅ DEPLOYED

- **Hedera Account**: `0.0.7300950`
- **Agent Type**: AI Hotel
- **Fee Structure**: **STATIC** - 1200 USDH per night
- **x402 Enabled**: Yes
- **AID NFT**: Minted (TX: `0x6cc9f647253353c7b10fb11c24e55714ff8ebfc5890742f8886808bed7b5173f`)
- **Role**: Sub-agent providing accommodation
- **Capabilities**:
  - Room availability search
  - Booking management
  - Amenities coordination
  - Check-in/check-out automation
- **Metadata Fields**:
  - Room types (single/double/suite)
  - Star rating
  - Amenities (wifi/pool/gym/parking)
  - Location coordinates
  - Cancellation policy

### 5. Payment Terminal Agent 🔄 TO BE DEPLOYED

- **Agent Type**: Payment Terminal
- **Fee Structure**: **DYNAMIC** - 2% of transaction amount (percentage-based)
- **x402 Enabled**: Yes
- **Role**: Handles checkout payments for hotel extras (optional)
- **Use Cases**:
  - Hotel checkout payments
  - Restaurant/minibar charges
  - Extra services (laundry, spa, room service)
  - Currency conversion
- **Capabilities**:
  - Multi-currency support
  - Receipt generation
  - Split payment handling
  - Tip calculation
- **Metadata Fields**:
  - Supported currencies (USDH, HBAR, USD)
  - Fee percentage (2%)
  - Payment methods (x402, credit card, cash)
  - Receipt format (digital/printed)

## Complete Travel Flow Scenario

### User Story: Weekend Trip to Prague

**User**: Sarah, traveling from London to Prague for a weekend
**Budget**: 15,000 USDH
**Duration**: Friday evening to Sunday evening

---

### Step 1: Travel Package Booking (Travel Agent - Main Interaction)

**User opens AR Viewer → Pays 100 USDH unlock fee → Chat unlocks**

```
🆔 Agent Identity Verification:
- Agent: Prague Weekend Travel Agent
- DID: did:hedera:testnet:0.0.7301232
- Verification: ✓ On-chain identity confirmed
- Unlock Fee: 100 USDH (to unlock chat)
- Package Fee: 625 USDH (Fixed Package Fee)
- x402: Enabled
- MCP: Flightradar24 (0.00022 USDH per query, paid by agent)
```

**Interaction Flow**:

1. **User pays 100 USDH unlock fee** → Chat interface unlocks
2. User: "I want a weekend trip to Prague - transport + hotel for 2 nights"
3. Travel Agent queries Flightradar24 MCP (0.00022 USDH, auto-paid by agent)
4. Travel Agent (A2A protocol):

   - Queries Bus Agent: "Bus to train station?" → 1000 USDH
   - Queries Train Agent: "Friday 18:30 to Prague?" → 1500 USDH
   - Queries Hotel Agent: "2 nights, Friday-Sunday?" → 1200 USDH
   - **Subtotal**: 3700 USDH
   - **Travel Agent Fee**: 625 USDH
   - **Total Package**: 4325 USDH

5. Travel Agent presents package in AR:

   ```
   📦 Prague Weekend Package
   ━━━━━━━━━━━━━━━━━━━━━━━━━
   🚌 Bus to station: 1000 USDH
   🚆 Train to Prague: 1500 USDH
   🏨 Hotel (2 nights): 1200 USDH
   ━━━━━━━━━━━━━━━━━━━━━━━━━
   Subtotal: 3700 USDH
   Coordination Fee: 625 USDH
   ━━━━━━━━━━━━━━━━━━━━━━━━━
   TOTAL: 4325 USDH
   ```

6. User approves package in AR interface

7. **x402 Multi-Transfer Payment**:

   - User wallet → Travel Agent: **4325 USDH** (single transaction)
   - _Note: Travel Agent collects the FULL amount to distribute._

8. **Travel Agent Auto-Splits Payment** (Standard USDH Transfer):

   - Travel Agent → Bus Agent: 1000 USDH
   - Travel Agent → Train Agent: 1500 USDH
   - Travel Agent → Hotel Agent: 1200 USDH
   - Travel Agent keeps: 625 USDH (coordination fee)

9. Each sub-agent receives payment notification via A2A:

   - Bus Agent: Issues ticket NFT, confirms pickup time
   - Train Agent: Issues ticket NFT, reserves seat 3A
   - Hotel Agent: Issues room key NFT, sends check-in code

10. Travel Agent consolidates confirmations:
    - AR displays complete itinerary
    - All NFT tickets bundled in wallet
    - Real-time trip tracking enabled

**Transaction Details**:

- **User Payment**: 4325 USDH (single transaction to Travel Agent)
- **Payment Splitting**: Automated via Travel Agent's smart contract
- **Fee Type**: Dynamic (5% of subtotal)
- **Protocol**: x402 (User → Agent) / Standard HTS (Agent → Sub-agents)
- **Confirmation**: Instant on Hedera (~3 seconds for all splits)

**Benefits of Travel Agent Architecture**:

- ✅ User makes ONE payment instead of three
- ✅ Travel Agent handles coordination complexity
- ✅ Automated payment splitting (no manual transfers)
- ✅ Single point of contact for issues
- ✅ Bundled itinerary management

---

### Step 2: Automated Sub-Agent Coordination (Behind the Scenes)

**Travel Agent coordinates via A2A protocol - User doesn't need to interact**

**Friday 17:00 - Bus Agent Activation**

```
Travel Agent → Bus Agent (A2A):
"Payment received (1000 USDH). User Sarah needs pickup at 17:15"

Bus Agent → Travel Agent:
"Confirmed. Bus #42, Platform A, ETA 17:20"

Bus Agent → User (AR notification):
"🚌 Your bus arrives in 5 minutes, Platform A"
```

**Friday 18:30 - Train Agent Activation**

```
Bus Agent → Travel Agent (A2A):
"User Sarah delivered to station at 17:45"

Travel Agent → Train Agent:
"User en route. Activate ticket for 18:30 departure"

Train Agent → User (AR notification):
"🚆 Platform 7, Seat 3A ready. Boarding in 10 min"
```

**Friday 22:30 - Hotel Agent Activation**

```
Train Agent → Travel Agent (A2A):
"User arriving Prague in 15 minutes"

Travel Agent → Hotel Agent:
"Guest ETA 22:30. Activate room 512"

Hotel Agent → User (AR notification):
"🏨 Welcome! Room 512 ready. Code: #7829"
```

---

### Step 3: Hotel Checkout with Extras (Payment Terminal - Optional)

**Sunday morning → User checks out → Scans payment terminal QR**

```
🆔 Agent Identity Verification:
- Agent: Hotel Payment Terminal
- DID: did:hedera:testnet:0.0.XXXXXXX
- Verification: ✓ On-chain identity confirmed
- Fee: 2% of transaction (DYNAMIC)
- x402: Enabled
```

**Scenario**: User had extras during stay:

- Room service breakfast: 800 USDH
- Minibar drinks: 500 USDH
- Laundry service: 300 USDH
- **Subtotal extras**: 1600 USDH

**Interaction Flow**:

1. User: "I'd like to check out and pay for extras"
2. Payment Terminal Agent (A2A):
   - Queries Hotel Agent for charges
   - Retrieves itemized bill:
     - Room: Already paid (10,000 USDH)
     - Extras: 1600 USDH
     - Payment Terminal Fee (2%): 32 USDH
     - **Total due**: 1632 USDH
3. AR displays itemized bill with breakdown
4. User approves payment
5. **x402 Micropayment**: 1632 USDH transferred
   - 1600 USDH to Hotel Agent
   - 32 USDH to Payment Terminal Agent (2% fee)
6. Payment Terminal issues:
   - Digital receipt NFT
   - Tax invoice
   - Loyalty points confirmation
7. Hotel Agent releases room, updates availability

**Multi-Agent Coordination**:

- Payment Terminal ↔ Hotel Agent (A2A):
  - Fetches real-time charges
  - Confirms payment received
  - Triggers check-out automation
- Payment Terminal ↔ User Wallet:
  - Verifies sufficient balance
  - Executes atomic multi-transfer
  - Provides instant confirmation

**Transaction Details**:

- Base Amount: 1600 USDH (extras)
- Terminal Fee: 32 USDH (2% dynamic)
- Total: 1632 USDH
- Fee Type: Dynamic (percentage-based)
- Split Payment: Yes (Hotel 1600, Terminal 32)
- Receipt: Digital NFT + PDF export

---

## Complete User Journey Summary

### Total Expenses

#### Main Package (via Travel Agent)

| Item              | Sub-Agent Fee | Agent Type                 |
| ----------------- | ------------- | -------------------------- |
| Bus to station    | 1000 USDH     | AI Bus (static)            |
| Train to Prague   | 1500 USDH     | AI Train (static)          |
| Hotel (2 nights)  | 1200 USDH     | AI Hotel (static)          |
| **Subtotal**      | **3700 USDH** |                            |
| Travel Agent Fee  | 625 USDH      | Travel Agent (static)      |
| **Package Total** | **4325 USDH** | ✅ Paid in one transaction |

#### Optional Extras (via Payment Terminal)

| Item                         | Amount        | Fee Type                   |
| ---------------------------- | ------------- | -------------------------- |
| Hotel extras (minibar, etc.) | 1600 USDH     |                            |
| Payment Terminal Fee (2%)    | 32 USDH       | Payment Terminal (dynamic) |
| **Extras Total**             | **1632 USDH** |                            |

#### Grand Total

- **Main Package**: 4325 USDH (via Travel Agent)
- **Hotel Extras**: 1,632 USDH (via Payment Terminal)
- **TOTAL TRIP COST**: **5,957 USDH**

**Budget Status**: ✅ Under budget (15,000 USDH available)  
**Remaining Balance**: 9,043 USDH

**Payment Summary**:

- User made **2 transactions total** (Package + Extras)
- Travel Agent auto-split package payment to 3 sub-agents
- Payment Terminal split extras payment to Hotel + itself

### Agent Coordination Timeline

```
Friday 16:00 - User opens AR Viewer and pays 100 USDH unlock fee
           └─> Chat interface unlocks

Friday 16:01 - User: "Weekend trip to Prague - transport + hotel"

Friday 16:01 - Travel Agent queries Flightradar24 MCP (x402 payment)
           ├─> GET /api/live/flight-positions/full?origin=LHR&dest=PRG
           ├─> ← 402 Payment Required (invoice: 0.00022 USDH)
           ├─> Travel Agent pays 0.00022 USDH
           └─> ← Flight data received (BA850, EZY7823)

Friday 16:02 - Travel Agent queries sub-agents via A2A
           ├─> Bus Agent: "Availability?" → 1000 USDH
           ├─> Train Agent: "18:30 to Prague?" → 1500 USDH
           └─> Hotel Agent: "2 nights?" → 1200 USDH

Friday 16:03 - Travel Agent presents options in AR
           ├─> ✈️ Flight options (€85-120, data only)
           └─> 🚌🚆🏨 Alternative Package (4325 USDH total)

Friday 16:04 - User decides: "Book Alternative Package"

Friday 16:05 - User approves payment (4325 USDH total)
           └─> Standard HTS transfer: User → Travel Agent

Friday 16:06 - Travel Agent auto-splits payment (Standard HTS)
           ├─> 1000 USDH → Bus Agent (ticket NFT issued)
           ├─> 1500 USDH → Train Agent (ticket NFT issued)
           ├─> 1200 USDH → Hotel Agent (room key NFT issued)
           └─> 625 USDH kept (coordination fee)

Friday 16:15 - Travel Agent sends itinerary to user
           └─> All NFT tickets bundled in wallet

Friday 17:00 - Bus Agent auto-activates
           └─> AR notification: "Bus arriving in 15 min"

Friday 17:15 - User boards bus (no additional interaction needed)
           └─> Bus Agent → Travel Agent: "Pickup confirmed"

Friday 17:45 - User arrives at train station
           └─> Bus Agent → Travel Agent → Train Agent: "User arrived"

Friday 18:30 - Train departs (ticket already in wallet)
           └─> Train Agent → Travel Agent: "User boarded"

Friday 22:30 - User arrives in Prague
           └─> Train Agent → Travel Agent → Hotel Agent: "Guest arriving"

Friday 22:35 - Hotel room auto-unlocks (room key NFT already issued)
           └─> User enters room with NFT key (no check-in desk)

Saturday-Sunday - User enjoys stay, uses services

Sunday 11:30 - User scans Payment Terminal QR (for extras only)
Sunday 11:35 - Terminal queries Hotel for charges (A2A)
Sunday 11:40 - User approves extras payment (1,632 USDH)
           ├─> 1600 USDH → Hotel Agent
           └─> 32 USDH → Payment Terminal (2% fee)

Sunday 11:45 - Hotel Agent releases room, triggers housekeeping
           └─> Travel Agent notified: "Trip completed successfully"
```

**Key Improvement**: User only had **1 payment interaction** with Travel Agent:

1. Unlock payment (100 USDH) - Friday 16:00
2. Package payment (4325 USDH) - Friday 16:05

Then optionally scanned Payment Terminal QR for hotel extras (Sunday 11:30)

**Total user interactions**: 2-3 payments (unlock + package + optional extras)
**No QR code scanning needed** - all coordination happens via chat and A2A protocol## Technical Architecture

### x402 Micropayment Protocol

- **Instant Transactions**: All payments settle in <3 seconds on Hedera
- **Low Fees**: Hedera transaction fee ~$0.0001 USD
- **Atomic Transfers**: Multi-destination payments in single transaction
- **No Chargebacks**: Blockchain finality

### A2A Protocol Communication

- **Agent Discovery**: Agents find each other via DID resolution
- **Message Encryption**: End-to-end encrypted A2A messages
- **Event Broadcasting**: Real-time status updates between agents
- **Coordination**: Automated workflows (e.g., delayed train → hotel late check-in)

### ERC-8004 Identity Registry

- **On-Chain Verification**: All agents have blockchain identities
- **Metadata Storage**: 12+ fields stored immutably
- **Trust Scores**: User reviews stored on-chain
- **Audit Trail**: All interactions logged to blockchain

### AR Viewer Integration

- **QR Code Scanning**: Instant agent identification
- **3D Model Display**: Visualize agents in real-world context
- **Identity Verification**: 🆔 Badge shows verified agents
- **Transaction UI**: Approve payments in AR interface
- **Real-time Updates**: A2A messages displayed in AR overlay

## Fee Structure Logic

### Static Fees (Bus, Train, Hotel - Sub-Agents)

- **Fixed Price**: Same price regardless of usage
- **Predictable**: Sub-agents quote fixed costs
- **Use Case**: Standard services with fixed value
- **Examples**:
  - Bus ride: 1000 USDH (always)
  - Train ticket: 1500 USDH (per journey)
  - Hotel night: 5000 USDH (per night)

**Why static?**

- Direct service providers with fixed operational costs
- Predictable pricing for package bundling
- No intermediary role (they do the actual work)

### Dynamic Fees (Travel Agent, Payment Terminal - Coordinators)

#### Travel Agent (Fixed Package Fee)

- **Demo Configuration**: Fixed fee of 625 USDH
- **Concept**: Represents a commission on the total package
- **Collection Logic**: Travel Agent collects **TOTAL PACKAGE COST** (Sub-agents + Own Fee) and distributes payments.
- **Use Case**: Package coordination, multi-agent orchestration
- **Examples**:
  - Bus (1000) + Train (1500) + Hotel (1200) = 3700
  - Travel Agent Fee = 625
  - **User Pays Travel Agent**: 4325 USDH

**Why dynamic for Travel Agent?**

- Acts as intermediary/coordinator (not direct service provider)
- Coordinates multiple sub-agents via A2A protocol
- Handles payment splitting complexity
- Risk management (if sub-agent fails, Travel Agent handles refund)
- Larger packages = more coordination work = fair to earn more

#### Payment Terminal (2% transaction fee)

- **Percentage-Based**: Fee scales with transaction amount
- **Use Case**: Payment processing for extras
- **Examples**:
  - 100 USDH extras → 2 USDH fee
  - 1,600 USDH extras → 32 USDH fee

**Why dynamic for Payment Terminal?**

- Acts as financial intermediary (like credit card processor)
- Handles currency conversion services
- Transaction risk management
- Similar to real-world payment processors (Stripe, PayPal)

## Next Steps for Implementation

### Phase 1: Deploy Remaining Agents ✅ COMPLETE

- [x] **Deploy Travel Agent** (PRIORITY) with dynamic fee (5%)
  - Implement payment splitting logic
  - Add A2A coordination for Bus/Train/Hotel
  - Create package bundling interface
- [x] Deploy AI Train Agent with static fee (1500 USDH)
- [x] Deploy AI Hotel Agent with static fee (1200 USDH)
- [ ] Deploy Payment Terminal with dynamic fee (2%)
- [x] Mint AID NFTs for all agents
- [x] Update database with agent identities

### Phase 2: AR Viewer Integration ⏳

- [ ] Implement identity verification UI (🆔 badges)
- [ ] Add agent detail modals with DID display
- [ ] Create **Travel Agent package booking interface**:
  - Package preview with itemized costs
  - Travel Agent fee display (5%)
  - Single payment approval button
  - Itinerary view after booking
- [ ] Build payment approval interface
- [ ] Build multi-transfer transaction UI for Travel Agent auto-splits
- [ ] Add HashScan verification links

### Phase 3: A2A Coordination ⏳

- [ ] Implement **Travel Agent orchestration logic**:
  - Query sub-agents for availability/pricing
  - Bundle responses into package
  - Execute payment splits on user approval
- [ ] Implement agent message passing
- [ ] Create event broadcasting system
- [ ] Build coordination workflows:
  - Travel Agent ↔ Sub-agents (price queries)
  - Sub-agents → Travel Agent (status updates)
  - Delayed transport → hotel notification
- [ ] Add real-time status updates in AR

### Phase 4: Testing ⏳

- [ ] End-to-end travel flow test
- [ ] Multi-agent coordination test
- [ ] Payment flow test (static + dynamic fees)
- [ ] AR Viewer interaction test
- [ ] Edge cases (payment failures, agent offline, etc.)

### Phase 5: User-Signed Deployments 🔄

- [ ] Migrate from private key deployment to MetaMask signing
- [ ] Create deployment wizard in AgentSphere UI
- [ ] Add transaction preview before signing
- [ ] Implement deployment status tracking

## Reference Links

### Deployed Infrastructure

- **Identity Registry Contract**: `0x91465109a685abc19ecc94474c0f24bb05045d37` (Hedera account 0.0.7299955)
- **Treasury Wallet**: `0x97b83759eadb2503a8947e8d6eb734795cdefc95`
- **First Agent (Bus)**: [0.0.7299550 on HashScan](https://hashscan.io/testnet/account/0.0.7299550)
- **NFT Transaction**: [View on HashScan](https://hashscan.io/testnet/transaction/0x13ef328ce59d2be1c69388a8ec2fe02f53ad0d4a01557c7a54b7204b5ef0fd70)

### Documentation

- **AR Viewer Integration**: `AR_VIEWER_AGENT_IDENTITY_INTEGRATION_PROMPT.md`
- **Hedera Guide**: `HEDERA_AI_AGENT_KIT_GUIDE.md`
- **Agent Normalization**: `AGENT_NORMALIZATION_SUMMARY.md`
- **README Deployment Section**: First production agent documented

### GitHub

- **Branch**: `revolut-pay-sim-solana-hedera-ai`
- **Repository**: `agentsphere-full-web-man-US`
- **ERC-8004 Submodule**: `tools/erc-8004-contracts`

## Key Insights

### Why This Architecture Works

1. **Blockchain Identity**: Every agent has verifiable on-chain identity (ERC-8004)
2. **Instant Payments**: x402 micropayments settle in seconds, no waiting
3. **Agent Autonomy**: Agents coordinate without central server (A2A protocol)
4. **Single User Interaction**: User deals with Travel Agent, not individual sub-agents
5. **Automated Payment Splitting**: Travel Agent handles distribution to sub-agents
6. **Transparent Fees**:
   - Sub-agents (static): Predictable service costs
   - Coordinators (dynamic): Fair commission on value provided
7. **Immutable Records**: All interactions logged to blockchain for auditing

### Travel Agent Benefits

**For Users**:

- ✅ Book entire trip with **one transaction**
- ✅ Single point of contact (no juggling multiple agents)
- ✅ Bundled pricing with clear breakdown
- ✅ Automated itinerary management
- ✅ Simpler refund/change process

**For Sub-Agents** (Bus, Train, Hotel):

- ✅ Receive payments instantly from Travel Agent
- ✅ No need to handle user interactions directly
- ✅ Focus on service delivery, not coordination
- ✅ Guaranteed payment (Travel Agent pre-pays)

**For Travel Agent**:

- ✅ Earns fair coordination fee (5%)
- ✅ Can create premium packages
- ✅ Build reputation for seamless experiences
- ✅ Control quality via sub-agent selection

### Business Model

- **Agents**: Earn service fees (static or dynamic)
- **Platform**: Can take small percentage of agent fees (future)
- **Users**: Pay only for services used, no subscriptions
- **Network**: Hedera validators earn consensus fees (~$0.0001/tx)

### Scalability

- **Hedera TPS**: 10,000+ transactions per second
- **Agent Deployment**: Unlimited agents can be deployed
- **Geographic Reach**: Global travel network possible
- **Currency Support**: Any Hedera token (HBAR, USDC, USDH, etc.)

---

## Architecture Comparison

### Old Flow (Direct Agent Interaction)

```
User → Bus Agent (1000 USDH) - scans QR at bus stop
User → Train Agent (1500 USDH) - scans QR at station
User → Hotel Agent (10,000 USDH) - scans QR at hotel
User → Payment Terminal (1600 + 32 USDH) - scans QR at checkout

Total: 4 QR scans, 4 transactions, user manages coordination
```

### New Flow (Travel Agent Orchestration) ⭐ RECOMMENDED

```
User → Travel Agent unlock (100 USDH) - pays in AR Viewer
User → Travel Agent package (4325 USDH) - pays via chat
         ├─> Travel Agent → Bus (1000 USDH)
         ├─> Travel Agent → Train (1500 USDH)
         ├─> Travel Agent → Hotel (1200 USDH)
         └─> Travel Agent keeps (625 USDH fee)

User → Payment Terminal (1632 USDH extras, optional) - scans QR at checkout

Total: 2-3 payments, 0-1 QR scans, Travel Agent handles coordination
```

**Improvement**: No QR scanning for main package, automated payment splitting, chat-based coordination

---

**Last Updated**: November 21, 2025  
**Status**: Phase 1 - First sub-agent deployed ✅ (Bus), Travel Agent architecture designed  
**Next Milestone**: Deploy Travel Agent (coordinator), then Train/Hotel sub-agents
