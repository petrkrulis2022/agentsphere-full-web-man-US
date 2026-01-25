# AR Viewer ↔ Backend Integration Handoff Status

**Last Updated:** November 22, 2025  
**Status:** Mock MCP Complete ✅ | A2A Pending ⏳  
**Git Commit:** b641e52  
**Branch:** revolut-pay-sim-solana-hedera-ai

---

## 🎯 Integration Summary

### What's Working NOW

✅ **Mock MCP Flight Query**

- Endpoint: `POST http://localhost:4001/api/agents/travel/query`
- Date parameter extraction working
- Mock flight data generation
- Fake x402 transaction IDs
- Response includes `payment.mock: true` flag

✅ **AR Viewer Implementation**

- Mock mode UI indicators
- Development banner and badges
- Payment modals protected (no changes)
- Ready to receive A2A packages

✅ **Backend Detection**

- Detects `include_package: true` parameter
- Returns placeholder `a2a_package` structure
- Logging A2A requests for monitoring

### 🚨 Critical Architecture Rule

**NO HTTP ENDPOINTS BETWEEN AGENTS!**

- ✅ AR Viewer → Travel Agent: **HTTP allowed** (`http://localhost:4001`)
- ❌ Travel Agent → Bus/Train/Hotel: **NO HTTP! Use HCS Topics only**
- ❌ NO `http://bus-agent.com/api`
- ❌ NO `http://train.com/coordinate`
- ❌ NO REST APIs between agents
- ✅ Agent discovery: **HCS Topics** (Hedera Consensus Service)
- ✅ Agent coordination: **HCS message passing**
- ✅ Payments: **Hedera USDH transfers**

---

## 📚 Documentation Files (Read Order)

### 1️⃣ AR_VIEWER_INTEGRATION_FLOW.md

**Purpose:** User journey from mock to A2A  
**Key Sections:**

- Step 1: Initial flight query (NO `include_package`)
- Step 2: User clicks YES → adds `include_package: true`
- Code examples for YES button handler
- Complete flow diagram

**AR Viewer Action:** Understand the two-phase flow

---

### 2️⃣ AR_VIEWER_MOCK_MCP_INTEGRATION_PROMPT.md (626 lines)

**Purpose:** Current mock implementation reference  
**Key Sections:**

- API endpoint documentation
- Request/response schemas
- Mock mode UI indicators
- JavaScript integration examples
- Testing instructions

**AR Viewer Action:** Already implemented ✅

---

### 3️⃣ AR_VIEWER_A2A_REAL_INTEGRATION_GUIDE.md (744 lines)

**Purpose:** Future A2A production architecture  
**Key Sections:**

- Decentralized HCS-based agent discovery
- Agent-to-agent payment distribution
- Response structure with `a2a_package`
- Performance expectations
- Security notes

**AR Viewer Action:** Read for future implementation

---

## 🔄 Integration Phases

### Phase 1: Mock MCP (COMPLETE ✅)

**Backend:**

- ✅ Mock flight data generator (mcpService.js lines 153-248)
- ✅ Mock x402 transaction IDs
- ✅ `payment.mock: true` flag in response
- ✅ CORS enabled for AR Viewer

**AR Viewer:**

- ✅ Flight query with date parameter
- ✅ Mock mode UI indicators
- ✅ Development banner
- ✅ Payment modals protected

**Testing:**

```bash
curl -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d '{"origin": "BUD", "destination": "BCN", "date": "2025-06-15"}'
```

**Result:** ✅ Working - returns 2 fake flights

---

### Phase 2: A2A Coordination (PENDING ⏳)

#### Backend Tasks (AgentSphere Team)

**HCS Agent Discovery:**

- [ ] Create HCS Discovery Topic (0.0.DISCOVERY_TOPIC)
- [ ] Implement Travel Agent HCS subscription
- [ ] Deploy Bus Agent (0.0.XXXXX) with HCS integration
- [ ] Deploy Train Agent (0.0.XXXXX) with HCS integration
- [ ] Deploy Hotel Agent (0.0.XXXXX) with HCS integration

**Travel Agent Coordinator:**

- [ ] Implement `include_package: true` detection (placeholder exists)
- [ ] Query HCS Discovery Topic for available agents
- [ ] Select best agents (bus, train, hotel)
- [ ] Coordinate services via HCS messages
- [ ] Distribute USDH payments to agents
- [ ] Return `a2a_package` with real agent data

**Expected Response Structure:**

```json
{
  "flights": [...],
  "payment": {
    "mock": false,
    "transaction_id": "0.0.7301930@..."
  },
  "a2a_package": {
    "coordinator": {
      "agent_id": "0.0.7301930",
      "coordination_fee": 625
    },
    "agents": [
      {
        "agent_id": "0.0.8901234",
        "agent_type": "bus",
        "service": "Airport Bus",
        "fee": 1000,
        "status": "confirmed"
      },
      {...}, {...}
    ],
    "payment_summary": {
      "total_package_cost": 4325,
      "payment_distribution": [...]
    }
  }
}
```

**Performance Targets:**

- Agent discovery: < 500ms
- A2A coordination: < 1500ms
- Payment distribution: < 2000ms

---

#### AR Viewer Tasks (AR Viewer Team)

**Code Changes (WHEN BACKEND READY):**

1. **Update Request Flow**

```javascript
// In AgentInteractionModal.jsx (YES button handler)
async function handleUserAcceptance() {
  setShowPackageQuery(true);

  // ⚠️ ADD THIS: Resend query with include_package flag
  const packageData = await queryTravelPackage(
    origin,
    destination,
    date,
    true // include_package parameter
  );

  displayA2APackage(packageData.a2a_package);
}
```

2. **Update API Function**

```javascript
// In travelAgentAPI.js
async function queryTravelPackage(
  origin,
  destination,
  date,
  includePackage = false
) {
  const response = await fetch(
    "http://localhost:4001/api/agents/travel/query",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin,
        destination,
        date,
        include_package: includePackage, // ⚠️ ADD THIS
      }),
    }
  );
  // ... rest of code
}
```

3. **Create A2A Display Component**

```javascript
// New file: components/A2APackageDisplay.jsx
function A2APackageDisplay({ a2aPackage }) {
  const { agents, payment_summary, coordination_metadata } = a2aPackage;

  return (
    <div className="a2a-package">
      <A2AHeader metadata={coordination_metadata} />
      {agents.map((agent) => (
        <A2AAgentCard key={agent.agent_id} agent={agent} />
      ))}
      <PaymentDistribution summary={payment_summary} />
    </div>
  );
}
```

4. **Update TravelAgentFlow.jsx**

```javascript
// Parse a2a_package from response
if (responseData.a2a_package) {
  setA2APackage(responseData.a2a_package);
  setShowA2APackage(true);
}
```

**Files to Modify:**

- ✅ `src/services/travelAgentAPI.js` - Add `include_package` parameter
- ✅ `src/components/AgentInteractionModal.jsx` - YES button handler
- ✅ `src/components/TravelAgentFlow.jsx` - Display A2A package
- 🆕 `src/components/A2APackageDisplay.jsx` - New component

**Files to PROTECT (DO NOT TOUCH):**

- ❌ `CubePaymentEngine.jsx` - Working payment modal
- ❌ `ModernAgentCard.jsx` - Payment flow
- ❌ `QRCodeDisplay.jsx` - QR generation
- ❌ `HederaWalletConnect.jsx` - Wallet integration

---

## 🚦 Current Status

### Backend Status

```
🟢 Mock MCP:               WORKING
🟢 CORS Configuration:     ENABLED
🟢 Date Parameter:         WORKING
🟢 include_package Flag:   DETECTED (placeholder response)
🟡 HCS Discovery:          NOT IMPLEMENTED
🟡 Agent Deployment:       PENDING
🟡 Payment Distribution:   NOT IMPLEMENTED
🔴 Real A2A:               NOT READY
```

### AR Viewer Status

```
🟢 Mock Flight Query:      IMPLEMENTED
🟢 Mock Mode UI:           IMPLEMENTED
🟢 Payment Modals:         PROTECTED
🟡 YES Button Flow:        PENDING (waiting for backend)
🟡 A2A Package Display:    PENDING (waiting for backend)
🟡 Payment Distribution:   PENDING (waiting for backend)
```

---

## 🧪 Testing Scenarios

### Test 1: Mock MCP (Working NOW)

```bash
# Backend must be running on port 4001
cd tools/travel-agent-template
node index.js

# Test mock query
curl -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d '{"origin": "BUD", "destination": "BCN", "date": "2025-06-15"}'
```

**Expected:**

- ✅ 2 fake flights returned
- ✅ `payment.mock: true`
- ✅ Fake x402 transaction ID
- ⚠️ HashScan link won't work (404)

---

### Test 2: A2A Trigger Detection (Placeholder)

```bash
curl -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BUD",
    "destination": "BCN",
    "date": "2025-06-15",
    "include_package": true
  }'
```

**Expected:**

- ✅ Flights array
- ✅ `a2a_package` field present
- ⚠️ Agents in "discovering" status (placeholder)
- ⚠️ TODO comment in backend logs

---

### Test 3: Real A2A (NOT READY)

```bash
# Same as Test 2, but when HCS is implemented
curl -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BUD",
    "destination": "BCN",
    "date": "2025-06-15",
    "include_package": true
  }'
```

**Expected (when ready):**

- ✅ Real flights from Flightradar24 MCP
- ✅ `payment.mock: false`
- ✅ 3+ confirmed agents (bus, train, hotel)
- ✅ Real payment distribution
- ✅ All HashScan links work
- ✅ `status: "confirmed"` for all agents

---

## 📊 Backend Implementation Checklist

### HCS Infrastructure

- [ ] Create HCS Discovery Topic

  - Topic ID: `0.0.DISCOVERY_TOPIC`
  - Purpose: Agent advertisement and discovery
  - Access: Public subscribe, agents publish capabilities

- [ ] Create Agent Response Topics
  - Travel Agent: `0.0.TRAVEL_RESPONSE_TOPIC`
  - Bus Agent: `0.0.BUS_RESPONSE_TOPIC`
  - Train Agent: `0.0.TRAIN_RESPONSE_TOPIC`
  - Hotel Agent: `0.0.HOTEL_RESPONSE_TOPIC`

### Agent Deployment

- [ ] **Bus Agent** (0.0.XXXXX)

  - HCS integration
  - Service: Airport transfers
  - Fee: 1000 USDH
  - Routes: Major airports

- [ ] **Train Agent** (0.0.XXXXX)

  - HCS integration
  - Service: Rail transport
  - Fee: 1500 USDH
  - Routes: Europe

- [ ] **Hotel Agent** (0.0.XXXXX)
  - HCS integration
  - Service: Accommodation
  - Fee: 1200 USDH per night
  - Locations: Major cities

### Travel Agent Coordinator

- [ ] HCS subscription setup
- [ ] Agent discovery logic
- [ ] Service coordination protocol
- [ ] Payment distribution implementation
- [ ] Error handling and refunds
- [ ] Response assembly with `a2a_package`

### Testing & Monitoring

- [ ] HCS message monitoring
- [ ] Payment confirmation tracking
- [ ] Performance metrics collection
- [ ] Error logging and alerts
- [ ] Agent reputation tracking

---

## 📝 AR Viewer Implementation Checklist

### Code Changes (When Backend Ready)

- [ ] Update `travelAgentAPI.js`

  - Add `includePackage` parameter to query function
  - Pass `include_package: true` in request body

- [ ] Update `AgentInteractionModal.jsx`

  - Add YES button click handler
  - Trigger second query with `include_package: true`
  - Display loading state during A2A coordination

- [ ] Create `A2APackageDisplay.jsx`

  - Parse `a2a_package` from response
  - Display coordinated agents (bus, train, hotel)
  - Show payment distribution breakdown
  - Add A2A coordination header

- [ ] Update `TravelAgentFlow.jsx`
  - Check for `a2a_package` field in response
  - Render `A2APackageDisplay` component
  - Handle transition from mock to A2A

### UI Components

- [ ] A2A coordination header

  - Coordinator info (0.0.7301930)
  - Agent count (3+)
  - Discovery/coordination time

- [ ] Agent cards

  - Bus agent card (🚌)
  - Train agent card (🚆)
  - Hotel agent card (🏨)
  - Status badges (confirmed/pending)

- [ ] Payment distribution panel
  - Total package cost
  - Breakdown by agent
  - Transaction links (HashScan)
  - All payments confirmed indicator

### Testing

- [ ] Mock mode still works (existing flow)
- [ ] YES button triggers A2A query
- [ ] A2A package displays correctly
- [ ] Payment distribution shows all agents
- [ ] HashScan links clickable
- [ ] Existing payment modals untouched

---

## 🔐 Critical Reminders

### DO NOT MODIFY (Protected Code)

```
❌ CubePaymentEngine.jsx
❌ ModernAgentCard.jsx
❌ QRCodeDisplay.jsx
❌ HederaWalletConnect.jsx
❌ PaymentPreviewModal.jsx
```

### SAFE TO MODIFY (When Ready)

```
✅ travelAgentAPI.js - Add include_package parameter
✅ AgentInteractionModal.jsx - YES button handler
✅ TravelAgentFlow.jsx - A2A package display
✅ A2APackageDisplay.jsx - New component
```

---

## 🚀 Next Steps

### AgentSphere Backend Team

1. **Week 1-2:** Implement HCS Discovery Topic
2. **Week 2-3:** Deploy Bus/Train/Hotel agents with HCS
3. **Week 3-4:** Implement Travel Agent coordinator logic
4. **Week 4:** Test payment distribution with small USDH amounts
5. **Week 5:** Signal AR Viewer team: "A2A Ready"

### AR Viewer Team

1. **NOW:** Read all three integration guides
2. **WAIT:** Backend signals "A2A Ready"
3. **Week 5:** Implement YES button flow
4. **Week 5:** Create A2A package display
5. **Week 6:** End-to-end testing with real A2A

---

## 📞 Communication Protocol

### Backend Signals AR Viewer

**Message:** "A2A coordination is ready for testing"  
**Required Info:**

- HCS Discovery Topic ID
- Deployed agent IDs (bus, train, hotel)
- Test USDH amounts
- Expected response times

### AR Viewer Tests with Backend

**Test Cases:**

1. Mock query still works (NO `include_package`)
2. A2A query returns `a2a_package` (WITH `include_package: true`)
3. All agents show "confirmed" status
4. Payment distribution shows real transaction IDs
5. HashScan links work for all payments

### Feedback Loop

- Backend monitors HCS performance
- AR Viewer reports UI/UX issues
- Joint debugging sessions as needed

---

## 📚 Related Files

### Documentation

- `AR_VIEWER_INTEGRATION_FLOW.md` - User journey
- `AR_VIEWER_MOCK_MCP_INTEGRATION_PROMPT.md` - Mock implementation
- `AR_VIEWER_A2A_REAL_INTEGRATION_GUIDE.md` - A2A architecture
- `A2A_AGENT_TO_AGENT_PAYMENT_INTEGRATION_GUIDE.md` - Backend guide

### Backend Code

- `tools/travel-agent-template/index.js` - Main backend server
- `tools/travel-agent-template/services/mcpService.js` - MCP wrapper (mock/real)
- `tools/travel-agent-template/services/x402Service.js` - Payment service

### Migration Files

- `add_custom_stablecoins_migration.sql` - USDH token setup
- `AGENT_WALLET_ARCHITECTURE.md` - Hedera payment system

---

## ✅ Final Status

**Current State:**

- ✅ Mock MCP working and tested
- ✅ Backend detects A2A requests (placeholder)
- ✅ AR Viewer ready and waiting
- ✅ All documentation complete
- ✅ Git commit b641e52 pushed

**Waiting For:**

- ⏳ Backend implements HCS agent discovery
- ⏳ Backend deploys Bus/Train/Hotel agents
- ⏳ Backend signals "A2A Ready"

**Ready To Go:**

- 🚀 AR Viewer can implement YES button flow immediately when backend ready
- 🚀 All integration guides available on GitHub
- 🚀 No breaking changes to existing payment modals

---

**Last Sync:** November 22, 2025  
**Next Review:** When backend signals "A2A Ready"  
**Status:** 🟢 Mock Complete | 🟡 A2A Pending | 🔒 Payment Modals Protected
