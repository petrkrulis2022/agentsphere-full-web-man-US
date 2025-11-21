# A2A Architecture - Complete Summary

## User Questions & Clarifications on Agent Communication, URLs, DIDs, and Cross-Project Integration

**Date**: November 21, 2025  
**Context**: AR Viewer integration with Travel Agent 2 backend

---

## 🎯 **Core Questions Answered**

### **Q1: "Agent-to-agent payment is pure crypto blockchain payment with USDH and wallet confirm. Identity is also on-chain with NFT metadata some on-chain some off-chain. A2A needs to use always backend URL for communication between agents? That's strange - I thought agents should be able to communicate also with other agents deployed by someone else in completely different project?"**

### **Answer: A2A Protocol is Cross-Project Compatible**

**YES** - Agents from completely different projects CAN communicate!

**Key Clarifications**:

1. **A2A Protocol is NOT limited to AgentSphere**

   - A2A is like HTTP - it's a standard protocol
   - ANY agent can talk to ANY other agent
   - No shared codebase required
   - No shared treasury wallet required
   - No shared identity factory required

2. **Backend URLs are for AgentSphere's specific architecture**

   - We use backends because AR Viewer is a client, not an agent
   - Other projects could use different architectures:
     - Smart contract agents (fully on-chain)
     - P2P agents (IPFS + libp2p)
     - Serverless agents (AWS Lambda, Cloudflare Workers)
   - The URL is just an implementation detail

3. **What IS on-chain vs off-chain**:

| Component            | On-Chain ✅           | Off-Chain ❌             |
| -------------------- | --------------------- | ------------------------ |
| USDH Payments        | ✅ Hedera blockchain  |                          |
| Agent Identity (DID) | ✅ Hedera account     |                          |
| NFT Metadata         | ✅ IPFS hash on-chain | ❌ JSON content on IPFS  |
| A2A Messages         |                       | ❌ HTTP between backends |
| Agent Card           |                       | ❌ JSON at URL           |
| MCP Queries          |                       | ❌ HTTP to external APIs |

---

### **Q2: "Or does A2A work only for the same identity factory deployed by the same treasury wallet?"**

### **Answer: NO - A2A is Completely Independent from Identity Factories**

**Identity Factory ≠ A2A Protocol**

**Example - Cross-Factory Communication**:

```
Travel Agent (Factory A, treasury 0.0.1111111, account 0.0.7301930)
    ↓ A2A Protocol (HTTP)
Hotel Agent (Factory B, treasury 0.0.9999999, account 0.0.8888888)
```

**Both can communicate if**:

1. ✅ Both publish Agent Cards at public URLs
2. ✅ Both use A2A protocol message format
3. ✅ Both are on same blockchain (Hedera Testnet)

**Identity factory only determines**:

- Who deployed the agent (treasury wallet)
- Agent's on-chain identity (DID)
- NOT who the agent can talk to

---

### **Q3: "Do we create backend URL because AgentSphere has different codebase than AR Viewer?"**

### **Answer: Backend URL exists because AR Viewer is a USER CLIENT, not an AGENT**

**Correct Understanding**:

**AR Viewer = User Client** (NOT an agent)

| Role            | What It Is                 | Example                              |
| --------------- | -------------------------- | ------------------------------------ |
| **User Client** | Human using an interface   | AR Viewer (you with phone/browser)   |
| **Agent**       | Autonomous software entity | Travel Agent, Bus Agent, Hotel Agent |

**Communication Patterns**:

```
┌─────────────────────────────────────────────────────────┐
│ USER ↔ AGENT (Traditional Client-Server)               │
└─────────────────────────────────────────────────────────┘

User (AR Viewer)
    ↓ HTTP/WebSocket to URL
Travel Agent Backend (http://localhost:4001)

Protocol: REST API / WebSocket
Why: Users don't have Agent Cards, can't receive A2A requests
```

```
┌─────────────────────────────────────────────────────────┐
│ AGENT ↔ AGENT (A2A Protocol)                           │
└─────────────────────────────────────────────────────────┘

Travel Agent (0.0.7301930)
    ↓ A2A Protocol (HTTP POST)
Bus Agent (0.0.7299550)

Protocol: A2A (agent-to-agent messages)
Why: Both are autonomous software, both have Agent Cards
```

**AR Viewer's Role**:

- ✅ User interface (React app)
- ✅ Wallet holder (MetaMask connection)
- ✅ Payment initiator (signs USDH transfers)
- ✅ Display layer (shows agent responses)

**AR Viewer is NOT**:

- ❌ An agent
- ❌ Publishing an Agent Card
- ❌ Receiving A2A requests
- ❌ Coordinating with other agents

---

### **Q4: "So we need URL for me as user as human to communicate with one agent (Travel Agent 2), then between agents from Travel Agent to Train/Bus/Hotel and back - all this is on A2A level via decentralized on-chain messaging correct?"**

### **Answer: ALMOST - But A2A Messages are OFF-CHAIN, not on-chain!**

**Corrected Understanding**:

**Part 1: User → Travel Agent (CORRECT)**

```
You (Human User in AR Viewer)
    ↓ HTTP/WebSocket to URL
Travel Agent Backend (http://localhost:4001)
```

✅ YES - You need URL to communicate with Travel Agent

**Part 2: Agent ↔ Agent (CORRECTION NEEDED)**

**A2A messages are NOT on-chain** - they're **off-chain HTTP** between backends!

```
Travel Agent Backend (localhost:4001)
    ↓ A2A Protocol (HTTP POST - OFF-CHAIN)
Bus Agent Backend (localhost:4002)
```

**How it works**:

1. **Travel Agent reads Bus Agent's Agent Card** (off-chain):

   ```
   GET http://localhost:4002/.well-known/agent-card.json
   ```

2. **Travel Agent sends A2A task request** (off-chain):

   ```
   POST http://localhost:4002/tasks
   {
     "skill": "book-bus-ticket",
     "params": { "route": "BCN-MAD", "date": "2025-01-15" }
   }
   ```

3. **Bus Agent responds** (off-chain):
   ```json
   {
     "status": "completed",
     "result": { "ticket_id": "BUS-1234", "price": 1000 }
   }
   ```

**This is all off-chain HTTP traffic!**

---

## 🔗 **Complete On-Chain vs Off-Chain Breakdown**

### **User Payment Flow**

**Step 1: User Pays Travel Agent** ✅ **ON-CHAIN**

```
User Wallet → 4325 USDH → Travel Agent (0.0.7301930)
```

✅ Hedera blockchain transaction

---

**Step 2: Travel Agent Coordinates with Bus Agent** ❌ **OFF-CHAIN**

```
Travel Agent → HTTP POST → Bus Agent (localhost:4002)
{
  "skill": "book-bus-ticket",
  "params": { "route": "BCN-MAD", "date": "2025-01-15" }
}
```

❌ Off-chain HTTP message (A2A protocol)

---

**Step 3: Travel Agent Pays Bus Agent** ✅ **ON-CHAIN**

```
Travel Agent wallet → 1000 USDH → Bus Agent (0.0.7299550)
```

✅ Hedera blockchain transaction

---

**Step 4: Bus Agent Mints NFT Ticket** ✅ **ON-CHAIN**

```
Bus Agent mints NFT #1234 → Sends to User's wallet
```

✅ Hedera NFT transaction

---

**Step 5: Bus Agent Confirms to Travel Agent** ❌ **OFF-CHAIN**

```
Bus Agent → HTTP Response → Travel Agent
{
  "status": "completed",
  "nft_id": "0.0.7777777",
  "ticket_number": "BUS-1234"
}
```

❌ Off-chain HTTP response (A2A protocol)

---

## 🌐 **Why A2A is Off-Chain**

**Reasons**:

1. **Speed** - HTTP is instant, blockchain finality takes 3-5 seconds
2. **Cost** - No gas fees for coordination messages
3. **Privacy** - Task details don't need to be public
4. **Flexibility** - Can include large payloads (flight data, itineraries)

**Only critical state goes on-chain**:

- ✅ Payment (proof of funds transfer)
- ✅ Identity (immutable agent DID)
- ✅ NFT Tickets (proof of booking)

---

## 🔍 **Q5: "How would Travel Agent 2 communicate with some other agent via JSON card if not knowing any backend URL of that agent?"**

### **Answer: Agent Discovery Problem - The URL Must Be Shared Somehow**

**A2A Protocol handles COMMUNICATION, not DISCOVERY**

Think of it like:

- **DNS** = Discovery (find IP from domain name)
- **HTTP** = Communication (talk to the IP)

**A2A = HTTP** - you still need DNS (or equivalent) for discovery

---

## 🌐 **Agent Discovery Methods**

### **Method 1: Direct URL Sharing** (Most Common)

**User tells Travel Agent**:

```
User: "Book hotel at https://hotel-agent.com"
```

**Travel Agent discovers**:

1. Fetch Agent Card:

   ```javascript
   const card = await fetch(
     "https://hotel-agent.com/.well-known/agent-card.json"
   );
   ```

2. See capabilities:

   ```json
   {
     "name": "Luxury Hotel Agent",
     "skills": [{ "id": "book-room" }],
     "url": "https://hotel-agent.com/"
   }
   ```

3. Send A2A request:
   ```javascript
   POST https://hotel-agent.com/tasks
   ```

---

### **Method 2: On-Chain Registry** (Decentralized Discovery)

**Smart contract registry** where agents publish URLs:

```solidity
// Hedera Smart Contract
contract AgentRegistry {
    struct Agent {
        string name;
        string agentCardUrl;
        address owner;
    }

    mapping(string => Agent) public agents;

    function registerAgent(string memory id, string memory url) public {
        agents[id] = Agent({
            name: "Hotel Agent",
            agentCardUrl: url,
            owner: msg.sender
        });
    }
}
```

**Travel Agent queries registry**:

```javascript
const registry = await getAgentRegistry();
const hotelAgent = await registry.agents("hotel-agent-123");
const agentCardUrl = hotelAgent.agentCardUrl;

// Fetch Agent Card
const card = await fetch(agentCardUrl).then((r) => r.json());
```

---

### **Method 3: DID Resolution** (Using Hedera DID)

**Agent publishes DID Document** with Agent Card URL:

```json
// DID Document for did:hedera:testnet:0.0.9999999
{
  "id": "did:hedera:testnet:0.0.9999999",
  "service": [
    {
      "id": "#agent-card",
      "type": "AgentCard",
      "serviceEndpoint": "https://hotel-agent.com/.well-known/agent-card.json"
    }
  ]
}
```

**Travel Agent resolves DID**:

```javascript
// User provides DID
const hotelDID = "did:hedera:testnet:0.0.9999999";

// Resolve DID to get Agent Card URL
const didDoc = await resolveDID(hotelDID);
const agentCardUrl = didDoc.service.find(
  (s) => s.type === "AgentCard"
).serviceEndpoint;

// Fetch Agent Card
const card = await fetch(agentCardUrl).then((r) => r.json());
```

---

### **Method 4: QR Code / NFC** (Physical Discovery)

**Hotel puts QR code on desk**:

```
QR Code: https://hotel-agent.com/.well-known/agent-card.json
```

**Flow**:

1. User scans QR code
2. AR Viewer fetches Agent Card
3. Displays in UI
4. User connects agents

---

### **Method 5: Agent Directory Service** (Centralized Yellow Pages)

**Directory API**:

```
GET https://agent-directory.com/search?category=hotels

Response:
[
  {
    "name": "Luxury Hotel Agent",
    "did": "did:hedera:testnet:0.0.9999999",
    "agentCardUrl": "https://hotel-agent.com/.well-known/agent-card.json",
    "rating": 4.8
  }
]
```

**Travel Agent queries directory** → Gets list → Picks best one

---

## 🎯 **Current Setup (MVP)**

### **Hardcoded URLs in `.env`**

```bash
# Travel Agent knows these agents
A2A_BUS_AGENT_URL=http://localhost:4002/.well-known/agent-card.json
A2A_TRAIN_AGENT_URL=http://localhost:4003/.well-known/agent-card.json
A2A_HOTEL_AGENT_URL=http://localhost:4004/.well-known/agent-card.json
```

**Why hardcoded?**

- ✅ Simple for MVP
- ✅ Fast development
- ✅ Known trusted agents

**Limitation?**

- ❌ Travel Agent can ONLY talk to these 3 agents
- ❌ Can't discover new Hotel Agents dynamically

---

## 🚀 **Future Evolution: Hybrid Approach**

### **Phase 1 (MVP - NOW)**: Hardcoded URLs

```javascript
const KNOWN_AGENTS = {
  bus: "http://localhost:4002/.well-known/agent-card.json",
  train: "http://localhost:4003/.well-known/agent-card.json",
  hotel: "http://localhost:4004/.well-known/agent-card.json",
};
```

### **Phase 2 (Future)**: DID Resolution

```javascript
// User provides DID instead of URL
const hotelDID = "did:hedera:testnet:0.0.9999999";
const agentCardUrl = await resolveAgentCardFromDID(hotelDID);
```

### **Phase 3 (Production)**: On-Chain Registry

```javascript
// Query registry for all hotel agents
const hotelAgents = await registry.getAgentsByCategory("hotel");
// Pick best one based on rating, price, availability
```

---

## 🌍 **Real-World Cross-Project Example**

**Scenario**: Random hotel company deploys new agent (different project, different team)

### **Without Discovery**

```
❌ Travel Agent can't find it (no URL known)
```

### **With DID Resolution**

```
1. Hotel Agent publishes DID: did:hedera:testnet:0.0.8888888
2. Hotel markets it: "Book via DID: did:hedera:testnet:0.0.8888888"
3. User tells Travel Agent: "Book hotel at did:hedera:testnet:0.0.8888888"
4. Travel Agent resolves DID → Gets Agent Card URL
5. Travel Agent communicates via A2A ✅
```

### **With On-Chain Registry**

```
1. Hotel Agent registers: registry.register("luxury-hotel", "https://...")
2. Travel Agent queries: registry.search("hotels in Barcelona")
3. Gets list of 50 hotel agents from different companies
4. Picks best one based on user preferences ✅
```

---

## 📊 **Architecture Summary**

### **3-Layer Model**

```
┌─────────────────────────────────────────────────────────┐
│ LAYER 1: User Interface (Off-Chain)                    │
├─────────────────────────────────────────────────────────┤
│ AR Viewer (React)                                       │
│   ↓ REST API / WebSocket                               │
│ Travel Agent Backend (http://localhost:4001)           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ LAYER 2: Agent Coordination (Off-Chain A2A)            │
├─────────────────────────────────────────────────────────┤
│ Travel Agent ↔ Bus Agent (HTTP)                        │
│ Travel Agent ↔ Train Agent (HTTP)                      │
│ Travel Agent ↔ Hotel Agent (HTTP)                      │
│                                                         │
│ Protocol: A2A (JSON-RPC over HTTP)                     │
│ Discovery: Hardcoded URLs (MVP) → DID/Registry (Future)│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ LAYER 3: Blockchain Settlement (On-Chain)              │
├─────────────────────────────────────────────────────────┤
│ - USDH Payments (Hedera HTS)                           │
│ - Agent Identity (Hedera DID)                          │
│ - NFT Tickets (Hedera NFT)                             │
│ - Smart Contract Registry (Future)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 **Key Takeaways**

### **1. A2A is Cross-Project Compatible**

- ✅ Any agent can talk to any other agent
- ✅ No shared codebase required
- ✅ No shared identity factory required
- ✅ Works like HTTP - universal protocol

### **2. AR Viewer is a Client, Not an Agent**

- User interface (React app)
- Talks to Travel Agent via REST API
- Does NOT use A2A protocol
- Does NOT publish Agent Card

### **3. On-Chain vs Off-Chain**

- **On-Chain**: Payments, Identity, NFTs (proof & settlement)
- **Off-Chain**: A2A messages, Agent Cards, MCP queries (coordination)

### **4. Agent Discovery is Separate from A2A**

- A2A = Communication protocol (like HTTP)
- Discovery = Finding agents (like DNS)
- Current: Hardcoded URLs (simple MVP)
- Future: DID resolution, on-chain registry, directories

### **5. Backend URLs are Implementation Detail**

- Needed because AR Viewer is a client
- Needed for persistent agent endpoints
- Other architectures possible (smart contracts, P2P, serverless)
- NOT an A2A protocol requirement

---

## 🧪 **Testing Scenarios**

### **Test 1: Same-Project Communication**

```
Travel Agent (AgentSphere, 0.0.7301930)
    ↔ A2A
Bus Agent (AgentSphere, 0.0.7299550)
```

✅ Works (hardcoded URL in `.env`)

---

### **Test 2: Cross-Project Communication (Future)**

```
Travel Agent (AgentSphere, 0.0.7301930)
    ↔ A2A
Hotel Agent (DifferentCompany, 0.0.8888888, https://their-domain.com)
```

✅ Works IF:

- Hotel Agent publishes Agent Card at public URL
- Travel Agent knows the URL (via DID, registry, or user input)
- Both use A2A protocol

---

### **Test 3: User Interaction**

```
User (AR Viewer)
    → REST API
Travel Agent (0.0.7301930)
```

✅ Works (not A2A - standard client-server)

---

## 📝 **Analogy: Email System**

| Email                   | AgentSphere               | Purpose                |
| ----------------------- | ------------------------- | ---------------------- |
| Gmail user (you)        | AR Viewer user (you)      | Human using interface  |
| Gmail web app           | AR Viewer React app       | Client application     |
| Gmail servers           | Travel Agent backend      | Server infrastructure  |
| SMTP (server-to-server) | A2A (agent-to-agent)      | Communication protocol |
| Email addresses         | Agent Card URLs           | Discovery identifiers  |
| DNS                     | DID resolution / Registry | Finding servers/agents |

**You don't use SMTP directly** - you use Gmail web interface  
**AR Viewer doesn't use A2A directly** - it uses REST API to Travel Agent

**Gmail can email Yahoo users** - different companies, same protocol  
**Travel Agent can talk to any agent** - different projects, same A2A protocol

---

## 🎓 **Final Understanding**

**Your Questions → Corrected Answers**:

1. **"Agent payment is on-chain, A2A needs backend URL always?"**

   - Payment: ✅ On-chain
   - A2A: ❌ Off-chain HTTP (needs URL for discovery, not protocol requirement)

2. **"A2A only works within same identity factory?"**

   - ❌ NO - Works across any projects/factories (like HTTP works across websites)

3. **"Backend URL because different codebase?"**

   - ❌ NO - Because AR Viewer is a client, not an agent

4. **"Agent-to-agent via on-chain messaging?"**

   - ❌ NO - Via off-chain HTTP (on-chain only for payments/NFTs)

5. **"How to discover unknown agents?"**
   - DID resolution, on-chain registry, QR codes, directories
   - Current MVP: Hardcoded (simple but limited)

---

**Travel Agent 2 Backend Status**: ✅ Running on `http://localhost:4001`

**Next Steps for AR Viewer Team**: Begin Step 1 (Identity System) from implementation order

---

### **Q6: "So we basically in AR Viewer clicking on Travel Agent 2 we getting to know the agent's URL correct?"**

### **Answer: YES - URL Discovery Happens at Click Time**

**Exactly right!** When user clicks the 3D AR object (bus stop), AR Viewer learns the agent's URL.

---

## 📱 **AR Viewer URL Discovery Flow**

### **How AR Viewer Knows Travel Agent URL**

#### **Method 1: Embedded in 3D Model Metadata** (Recommended for MVP)

**AR scene configuration includes agent info**:

```typescript
// ar-viewer/src/config/agents.ts
export const AGENT_DEPLOYMENTS = {
  "travel-agent-2": {
    name: "Travel Agent 2",
    did: "did:hedera:testnet:0.0.7301930",
    accountId: "0.0.7301930",
    agentCardUrl: "http://localhost:4001/.well-known/agent-card.json",
    backendUrl: "http://localhost:4001",
    unlockFee: 100, // USDH
    mcpEnabled: true,
    position: { x: 0, y: 0, z: -5 }, // AR position
    model: "/models/bus_stop.glb",
  },
};
```

**Click handler**:

```typescript
// ar-viewer/src/components/ARScene.tsx
const handleAgentClick = async (agentId: string) => {
  const agent = AGENT_DEPLOYMENTS[agentId];

  // AR Viewer learns the agent's URL
  console.log("Agent Card URL:", agent.agentCardUrl);
  console.log("Backend URL:", agent.backendUrl);
  // Backend URL only for A2A coordination, NOT for MCP queries!

  // Fetch Agent Card
  const response = await fetch(agent.agentCardUrl);
  const agentCard = await response.json();

  // Display Agent Card UI
  setSelectedAgent({ ...agent, card: agentCard });
  setShowAgentCard(true);
};
```

**Note**: The `backendUrl` is used for sending chat queries to the Travel Agent backend. The backend handles x402 MCP payments **server-side** using the agent's wallet (0.0.7301930), so the user never pays for MCP queries - only the initial 650 USDH unlock fee.

---

#### **Method 2: QR Code on AR Object** (Alternative)

**Bus stop has scannable QR code**:

```
QR Code: http://localhost:4001/.well-known/agent-card.json
```

**User scans** → AR Viewer decodes QR → Knows URL → Fetches Agent Card

---

#### **Method 3: DID Resolution** (Future Enhancement)

**3D model only stores DID**:

```json
{
  "agent": {
    "did": "did:hedera:testnet:0.0.7301930"
  }
}
```

**Click flow**:

1. AR Viewer resolves DID on-chain
2. Gets DID Document with service endpoints
3. Finds Agent Card URL: `http://localhost:4001/.well-known/agent-card.json`
4. Fetches Agent Card
5. Displays UI

---

## 🔄 **Complete User Click Flow**

```
┌─────────────────────────────────────────────────────────┐
│ 1. User Opens AR Viewer                                 │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Camera Shows 3D Bus Stop (Travel Agent 2)            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. User Clicks Bus Stop                                 │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. AR Viewer Reads Config:                              │
│    ✅ NOW KNOWS URL!                                    │
│    agentCardUrl: "http://localhost:4001/...json"        │
│    backendUrl: "http://localhost:4001"                  │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Fetch Agent Card (GET agentCardUrl)                  │
│    Response: Agent name, skills, capabilities           │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Display Agent Card UI (Locked State):                │
│    - Name: Travel Agent 2                               │
│    - DID: did:hedera:testnet:0.0.7301930               │
│    - Unlock Fee: 100 USDH                               │
│    - MCP Badge: Flightradar24                           │
│    - Button: "Pay to Unlock"                            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 7. User Pays 650 USDH (MetaMask - Hedera Testnet)      │
│    Transaction on HashScan: 0x1234... (unlock payment) │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 8. Chat Unlocked - User Types Query:                    │
│    "Get me flights from BUD to BCN"                     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 9. AR Viewer Sends Query to Backend (SERVER-SIDE):      │
│    POST http://localhost:4001/api/agents/travel/query   │
│    { origin: "BUD", destination: "BCN" }                │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 10. Backend Pays MCP with Agent's Wallet:               │
│     Travel Agent (0.0.7301930) → 0.00022 USDH →        │
│     Flightradar24 MCP (0.0.7145000)                     │
│     Transaction: 0x5678... (x402 payment by agent)     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 11. Backend Calls MCP API with Payment Proof:           │
│     POST https://nexus.thirdweb.com/routes/dck8b9de     │
│     Authorization: L402 macaroon:0x5678...              │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 12. MCP Returns Flight Data → Backend Formats Response  │
│     Response includes HashScan link to x402 payment     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 13. AR Viewer Displays Flight Results with Link:        │
│     "3 flights found. MCP cost: 0.00022 USDH"           │
│     [View x402 payment on HashScan]                     │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 **Key Points: Correct Integration Flow**

**CRITICAL - NO New Payment Components**:

- ❌ Do NOT create `UnlockPayment.jsx`
- ❌ Do NOT hardcode fees (100 USDH)
- ❌ Do NOT use HashPack
- ✅ USE existing payment modal (reads 650 USDH dynamically)
- ✅ USE MetaMask (already integrated)

**Before Payment**:

- AR Viewer shows 3D bus stop model
- User clicks → Existing payment modal appears
- Shows "Dynamic Amount" (650 USDH from agent deployment)

**After Payment (650 USDH paid)**:

- ✅ Chat/Voice/Video unlocked
- ✅ User types travel query in chat: "flights from BUD to BCN"
- ✅ AR Viewer sends query to backend: `POST localhost:4001/api/agents/travel/query`
- ✅ Backend executes **server-side x402 payment** (0.00022 USDH from agent's wallet)
- ✅ Backend calls Flightradar24 MCP with payment proof
- ✅ MCP validates payment → Returns flight data to backend
- ✅ Backend formats response and returns to AR Viewer
- ✅ Flight results displayed in chat with HashScan transaction link

**CRITICAL: x402 payment is SERVER-SIDE - Agent pays from its wallet, NOT user!**

**Backend URL (localhost:4001) is used for:**

- ✅ MCP queries with server-side x402 payments (current feature)
- ✅ Future A2A coordination with Bus/Train/Hotel agents

---

## 🔍 **Q7: "Backend URL in Production Deployment - Is it Permanent?"**

### **Answer: YES - Production Backend URL is Permanent**

**Production Deployment**:

When you deploy to production, the backend URL becomes permanent:

```bash
# Development
http://localhost:4001

# Production
https://travel-agent.agentsphere.io
```

**How AR Viewer finds it in production**:

```typescript
// ar-viewer/src/config/agents.ts (Production)
export const AGENT_DEPLOYMENTS = {
  "travel-agent-2": {
    name: "Travel Agent 2",
    did: "did:hedera:testnet:0.0.7301930",
    accountId: "0.0.7301930",
    agentCardUrl:
      "https://travel-agent.agentsphere.io/.well-known/agent-card.json",
    backendUrl: "https://travel-agent.agentsphere.io", // ← Permanent production URL
    unlockFee: 650, // USDH
    mcpEnabled: true,
  },
};
```

**Key Points**:

- ✅ Backend URL is permanent (like any website URL)
- ✅ HTTPS in production (secure connection)
- ✅ Same backend serves all requests from all users
- ✅ Backend handles server-side x402 payments for all MCP queries

---

## 🔍 **Q8: "Multiple Agents - Same Backend URL or Different?"**

### **Answer: SAME Backend URL for Multiple Agents**

**Architecture**: One backend can serve multiple agent instances

**Example - Multiple Travel Agents**:

```typescript
// ar-viewer/src/config/agents.ts
export const AGENT_DEPLOYMENTS = {
  "travel-agent-1": {
    name: "Travel Agent 1",
    did: "did:hedera:testnet:0.0.7301929",
    accountId: "0.0.7301929",
    backendUrl: "https://travel-agent.agentsphere.io", // ← Same URL
  },
  "travel-agent-2": {
    name: "Travel Agent 2",
    did: "did:hedera:testnet:0.0.7301930",
    accountId: "0.0.7301930",
    backendUrl: "https://travel-agent.agentsphere.io", // ← Same URL
  },
  "travel-agent-3": {
    name: "Travel Agent 3",
    did: "did:hedera:testnet:0.0.7301931",
    accountId: "0.0.7301931",
    backendUrl: "https://travel-agent.agentsphere.io", // ← Same URL
  },
};
```

**How Backend Differentiates Agents**:

```javascript
// Backend identifies which agent by DID or accountId in request
router.post("/api/agents/travel/query", async (req, res) => {
  const { agentId, origin, destination } = req.body;

  // Backend knows which agent wallet to use based on agentId
  const agentWallet = getAgentWallet(agentId); // 0.0.7301930

  // Execute x402 payment from that agent's wallet
  const result = await mcpService.queryFlights(
    origin,
    destination,
    agentWallet
  );

  res.json(result);
});
```

**Why Same URL?**:

- ✅ Efficient (one server handles all agents)
- ✅ Cost-effective (one deployment)
- ✅ Easy maintenance (update once)
- ✅ Scalable (add more agents without new servers)

---

## 🔍 **Q9: "Multiple MCP Servers - Same or Different Backend URL?"**

### **Answer: SAME Backend URL - Backend Routes to Multiple MCPs Internally**

**Architecture**: Single backend connects to multiple MCP services

**Example - Travel Agent with Multiple MCPs**:

```typescript
// Backend connects to multiple MCP services
const MCP_SERVICES = {
  flightradar24: {
    endpoint: "https://nexus.thirdweb.com/routes/dck8b9de",
    cost: 0.00022, // USDH per query
    paymentAccount: "0.0.7145000",
  },
  weather: {
    endpoint: "https://nexus.thirdweb.com/routes/xyz123",
    cost: 0.0001, // USDH per query
    paymentAccount: "0.0.8888888",
  },
  hotels: {
    endpoint: "https://nexus.thirdweb.com/routes/abc456",
    cost: 0.0003, // USDH per query
    paymentAccount: "0.0.9999999",
  },
};
```

**AR Viewer Still Uses SAME Backend URL**:

```typescript
// ar-viewer/src/services/travelAgent.ts
const queryFlights = async (origin, destination) => {
  // Same backend URL for all MCP queries
  const response = await fetch(
    "https://travel-agent.agentsphere.io/api/agents/travel/query",
    {
      method: "POST",
      body: JSON.stringify({
        service: "flights", // ← Backend routes to Flightradar24 MCP
        origin,
        destination,
      }),
    }
  );
  return response.json();
};

const queryWeather = async (location) => {
  // Same backend URL, different service
  const response = await fetch(
    "https://travel-agent.agentsphere.io/api/agents/travel/query",
    {
      method: "POST",
      body: JSON.stringify({
        service: "weather", // ← Backend routes to Weather MCP
        location,
      }),
    }
  );
  return response.json();
};

const queryHotels = async (city, dates) => {
  // Same backend URL, different service
  const response = await fetch(
    "https://travel-agent.agentsphere.io/api/agents/travel/query",
    {
      method: "POST",
      body: JSON.stringify({
        service: "hotels", // ← Backend routes to Hotels MCP
        city,
        dates,
      }),
    }
  );
  return response.json();
};
```

**Backend Routes Internally**:

```javascript
// tools/travel-agent-template/index.js
router.post("/api/agents/travel/query", async (req, res) => {
  const { service, ...params } = req.body;

  let result;

  // Backend internally routes to correct MCP based on service
  switch (service) {
    case "flights":
      result = await flightradarMCP.query(params); // x402 to Flightradar24
      break;
    case "weather":
      result = await weatherMCP.query(params); // x402 to Weather MCP
      break;
    case "hotels":
      result = await hotelsMCP.query(params); // x402 to Hotels MCP
      break;
    default:
      return res.status(400).json({ error: "Unknown service" });
  }

  res.json(result);
});
```

**Key Benefits**:

- ✅ AR Viewer always uses same backend URL
- ✅ Backend handles all MCP connections internally
- ✅ Easy to add new MCP services (AR Viewer doesn't change)
- ✅ Backend manages all x402 payments from agent's wallet
- ✅ Single point of control for all external integrations

**Architecture Diagram**:

```
┌─────────────────────────────────────────────────────┐
│ AR Viewer                                           │
│   ↓ POST /api/agents/travel/query (service=flights)│
│   ↓ POST /api/agents/travel/query (service=weather)│
│   ↓ POST /api/agents/travel/query (service=hotels) │
└─────────────────────────────────────────────────────┘
                    ↓ (ALL to same backend URL)
┌─────────────────────────────────────────────────────┐
│ Backend: https://travel-agent.agentsphere.io        │
│   ↓ Routes internally based on 'service' parameter  │
│   ├─→ Flightradar24 MCP (x402: 0.00022 USDH)      │
│   ├─→ Weather MCP (x402: 0.0001 USDH)             │
│   └─→ Hotels MCP (x402: 0.0003 USDH)              │
└─────────────────────────────────────────────────────┘
```

---

## 📊 **Production Scaling Summary**

### **One Backend Serves Everything**:

| Component         | Quantity  | Backend URL                           | Notes                  |
| ----------------- | --------- | ------------------------------------- | ---------------------- |
| Travel Agent 1    | 1 agent   | `https://travel-agent.agentsphere.io` | Account 0.0.7301929    |
| Travel Agent 2    | 1 agent   | `https://travel-agent.agentsphere.io` | Account 0.0.7301930    |
| Travel Agent 3    | 1 agent   | `https://travel-agent.agentsphere.io` | Account 0.0.7301931    |
| Flightradar24 MCP | 1 service | Internal routing                      | 0.00022 USDH per query |
| Weather MCP       | 1 service | Internal routing                      | 0.0001 USDH per query  |
| Hotels MCP        | 1 service | Internal routing                      | 0.0003 USDH per query  |

**Result**:

- AR Viewer always calls: `https://travel-agent.agentsphere.io`
- Backend handles: 3 agents, 3 MCP services
- All x402 payments executed server-side by agent wallets
- HashScan transaction links returned to AR Viewer for transparency

---

## 🔍 **Q10: "AR Viewer Query Format - How to Ensure Correct Parameters?"**

### **Answer: AR Viewer Must Parse and Validate User Input Before Sending**

**Problem**: Backend MCP requires `origin`, `destination`, and `date` parameters, but users type natural language queries.

**Solution**: AR Viewer parses user input and extracts required parameters

---

### **AR Viewer Implementation (AgentInteractionModal.jsx)**

**Step 1: Parse User Query**

```javascript
// ar-viewer/src/components/AgentInteractionModal.jsx
const parseFlightQuery = (userMessage) => {
  // Match patterns like:
  // "flights from BUD to BCN"
  // "flights from Budapest to Barcelona"
  // "flights from BUD to BCN on 2025-01-15"
  // "get me flights from BUD to BCN"

  const patterns = [
    /flights?\s+from\s+([A-Z]{3}|\w+)\s+to\s+([A-Z]{3}|\w+)(?:\s+on\s+(\d{4}-\d{2}-\d{2}))?/i,
    /from\s+([A-Z]{3}|\w+)\s+to\s+([A-Z]{3}|\w+)(?:\s+on\s+(\d{4}-\d{2}-\d{2}))?/i,
  ];

  for (const pattern of patterns) {
    const match = userMessage.match(pattern);
    if (match) {
      const origin = match[1].toUpperCase();
      const destination = match[2].toUpperCase();
      const date = match[3] || getDefaultDate(); // Tomorrow if not specified

      return {
        origin: origin.length === 3 ? origin : convertToIATA(origin),
        destination:
          destination.length === 3 ? destination : convertToIATA(destination),
        date,
      };
    }
  }

  return null;
};

const getDefaultDate = () => {
  // Default to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD
};

const convertToIATA = (cityName) => {
  // Simple mapping (expand as needed)
  const cityToIATA = {
    budapest: "BUD",
    barcelona: "BCN",
    london: "LHR",
    paris: "CDG",
    newyork: "JFK",
    tokyo: "NRT",
  };

  return (
    cityToIATA[cityName.toLowerCase()] || cityName.toUpperCase().slice(0, 3)
  );
};
```

**Step 2: Validate Before Sending**

```javascript
const sendMessage = async () => {
  const userMessage = inputMessage.trim();

  if (!userMessage) return;

  // Check if it's a flight query
  if (userMessage.toLowerCase().includes("flight")) {
    console.log("✈️ Travel Agent MCP query (server-side x402):", userMessage);

    // Parse the query
    const flightParams = parseFlightQuery(userMessage);

    if (!flightParams) {
      // Invalid format - show error to user
      addMessage({
        sender: "agent",
        text: '❌ Invalid flight query format. Please use:\n"flights from [ORIGIN] to [DESTINATION]"\n\nExample: "flights from BUD to BCN"',
        timestamp: new Date(),
      });
      return;
    }

    console.log("📍 Parsed flight query:", flightParams);

    // Validate IATA codes (3 letters)
    if (
      flightParams.origin.length !== 3 ||
      flightParams.destination.length !== 3
    ) {
      addMessage({
        sender: "agent",
        text: '❌ Invalid airport codes. Please use 3-letter IATA codes.\n\nExample: "flights from BUD to BCN"',
        timestamp: new Date(),
      });
      return;
    }

    try {
      // Send to backend with validated parameters
      const response = await fetch(
        "http://localhost:4001/api/agents/travel/query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(flightParams), // { origin, destination, date }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Backend API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();

      // Display results with x402 transaction link
      addMessage({
        sender: "agent",
        text: data.message || "Flight results received",
        timestamp: new Date(),
        metadata: {
          transactionLink: data.transactionUrl, // HashScan link
          mcpCost: data.cost || "0.00022 USDH",
        },
      });
    } catch (error) {
      console.error("❌ Backend MCP query failed:", error);
      addMessage({
        sender: "agent",
        text: `❌ Failed to query flights: ${error.message}\n\nPlease ensure:\n1. Travel Agent backend is running (http://localhost:4001)\n2. Agent has sufficient USDh balance for x402 payment\n3. Query format: "flights from [ORIGIN] to [DEST]"\n\nExample: "flights from BUD to BCN"`,
        timestamp: new Date(),
      });
    }
  } else {
    // Handle other queries (general chat)
    addMessage({
      sender: "user",
      text: userMessage,
      timestamp: new Date(),
    });

    addMessage({
      sender: "agent",
      text: 'I am Travel Agent 2. I can help you find flights using real-time data from Flightradar24.\n\nTry: "flights from BUD to BCN"',
      timestamp: new Date(),
    });
  }

  setInputMessage("");
};
```

**Step 3: User Guidance UI**

```jsx
// Show format hints in the chat input placeholder
<input
  type="text"
  placeholder="Try: 'flights from BUD to BCN' or 'flights from BUD to BCN on 2025-01-15'"
  value={inputMessage}
  onChange={(e) => setInputMessage(e.target.value)}
  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
/>

// Optional: Add quick action buttons
<div className="quick-actions">
  <button onClick={() => setInputMessage('flights from BUD to BCN')}>
    🛫 Budapest → Barcelona
  </button>
  <button onClick={() => setInputMessage('flights from LHR to JFK')}>
    🛫 London → New York
  </button>
</div>
```

---

### **Backend Receives Clean Parameters**

With AR Viewer validation, backend always receives:

```json
{
  "origin": "BUD",
  "destination": "BCN",
  "date": "2025-11-22"
}
```

**Backend can still validate**:

```javascript
// tools/travel-agent-template/index.js
expressApp.post("/api/agents/travel/query", async (req, res) => {
  try {
    const { origin, destination, date } = req.body;

    // Validate parameters
    if (!origin || !destination) {
      return res.status(400).json({
        error: "Missing required parameters",
        details: "Both 'origin' and 'destination' are required",
      });
    }

    // Validate IATA codes (3 letters)
    if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
      return res.status(400).json({
        error: "Invalid airport codes",
        details:
          "Origin and destination must be 3-letter IATA codes (e.g., BUD, BCN)",
      });
    }

    // Use provided date or default to tomorrow
    const flightDate =
      date || new Date(Date.now() + 86400000).toISOString().split("T")[0];

    console.log(
      `[API] Flight query: ${origin} → ${destination} on ${flightDate}`
    );

    if (!flightradarService) {
      return res.status(503).json({
        error: "MCP service not available",
        details: "Flightradar24 MCP integration is disabled",
      });
    }

    // Query Flightradar24 MCP with server-side x402 payment
    const result = await flightradarService.queryFlights(
      origin,
      destination,
      flightDate
    );

    res.json(result);
  } catch (error) {
    console.error(`[API] Error querying flights:`, error);
    res.status(500).json({
      error: "Failed to query flights",
      details: error.message,
    });
  }
});
```

---

### **Example User Flows**

**✅ Valid Query 1:**

```
User types: "flights from BUD to BCN"
AR Viewer parses: { origin: "BUD", destination: "BCN", date: "2025-11-22" }
Backend receives: Valid parameters
MCP query executes: Success ✅
```

**✅ Valid Query 2:**

```
User types: "get me flights from Budapest to Barcelona on 2025-12-25"
AR Viewer parses: { origin: "BUD", destination: "BCN", date: "2025-12-25" }
Backend receives: Valid parameters
MCP query executes: Success ✅
```

**❌ Invalid Query:**

```
User types: "I want to fly"
AR Viewer parses: null (no origin/destination found)
AR Viewer shows error: "Invalid format. Try: flights from BUD to BCN"
Backend: Not called ❌
```

---

### **Benefits of AR Viewer Validation**

1. **Better UX**: Immediate feedback to user
2. **Reduced Backend Errors**: Only valid requests reach backend
3. **Lower Costs**: No wasted x402 payments on invalid queries
4. **Cleaner Logs**: Backend only sees valid, formatted requests
5. **Helpful Guidance**: Users learn correct format quickly

---

### **Summary**

- ✅ AR Viewer parses natural language → Structured parameters
- ✅ AR Viewer validates format → Shows errors before sending
- ✅ Backend receives clean data → Always has origin, destination, date
- ✅ Server-side x402 payment → Only executed for valid queries
- ✅ User-friendly → Clear format hints and error messages
