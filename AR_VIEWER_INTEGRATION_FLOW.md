# AR Viewer Integration Flow - Mock MCP → A2A Coordination

**Created:** November 22, 2025  
**Status:** IMPLEMENTATION GUIDE  
**Backend:** Travel Agent on `http://localhost:4001`

---

## 🎯 Complete User Flow

### **Step 1: Initial Flight Query (Mock MCP)**

**User Action:** Search for flights (BUD → BCN)

**AR Viewer Request:**

```javascript
POST http://localhost:4001/api/agents/travel/query
{
  "origin": "BUD",
  "destination": "BCN",
  "date": "2025-11-22"
  // ⚠️ NO include_package parameter
}
```

**Backend Response:**

```json
{
  "flights": [
    {
      "airline": "Wizz Air",
      "flightNumber": "WI5432",
      "departure": { ... },
      "arrival": { ... },
      "price": 89
    }
  ],
  "payment": {
    "cost_usdh": "0.00022",
    "mock": true,
    "transaction_id": "0.0.749655@..."
  }
  // ⚠️ NO a2a_package field
}
```

**AR Viewer UI:**

```
┌─────────────────────────────────────────────┐
│ 🔧 DEVELOPMENT MODE - MOCK FLIGHT DATA      │
└─────────────────────────────────────────────┘

Flight Results:
- Wizz Air WI5432: €89
- Lufthansa LU4336: €201

Agent Message:
"Would you like me to check alternative travel
packages combining bus, train, and hotel? I can
coordinate with other agents for you."

[YES] [NO]
```

---

### **Step 2: User Clicks "YES" → A2A Coordination Starts**

**User Action:** Click "YES" button

**AR Viewer Request:**

```javascript
POST http://localhost:4001/api/agents/travel/query
{
  "origin": "BUD",
  "destination": "BCN",
  "date": "2025-11-22",
  "include_package": true  // ⚠️ THIS TRIGGERS A2A!
}
```

**Backend Response:**

```json
{
  "flights": [
    // ... same flights as before
  ],
  "payment": {
    "cost_usdh": "0.00022",
    "mock": true,
    "transaction_id": "0.0.749655@..."
  },

  // ⚠️ NEW: A2A Package field appears!
  "a2a_package": {
    "coordinator": {
      "agent_id": "0.0.7301930",
      "agent_type": "travel",
      "coordination_fee": 625,
      "total_agents": 3
    },
    "agents": [
      {
        "agent_id": "0.0.8901234", // Real agent discovered via HCS
        "agent_type": "bus",
        "service": "Airport Bus Transfer",
        "route": "BCN Airport → City Center",
        "fee": 1000,
        "status": "confirmed",
        "discovery_method": "hcs_topic"
      },
      {
        "agent_id": "0.0.8905678",
        "agent_type": "train",
        "service": "Renfe High-Speed Train",
        "route": "Budapest → Barcelona",
        "fee": 1500,
        "status": "confirmed",
        "discovery_method": "hcs_topic"
      },
      {
        "agent_id": "0.0.8909012",
        "agent_type": "hotel",
        "service": "Hotel Barcelona Center",
        "location": "Gothic Quarter",
        "fee": 1200,
        "status": "confirmed",
        "discovery_method": "hcs_topic"
      }
    ],
    "payment_summary": {
      "total_package_cost": 4325,
      "breakdown": {
        "travel_agent_coordination": 625,
        "bus_agent": 1000,
        "train_agent": 1500,
        "hotel_agent": 1200
      },
      "payment_distribution": [
        {
          "from": "0.0.7301930",
          "to": "0.0.8901234",
          "amount": 1000,
          "tx_id": "0.0.7301930@1763770001000.987654321"
        }
        // ... more transactions
      ]
    },
    "coordination_metadata": {
      "discovery_time_ms": 450,
      "coordination_time_ms": 1200,
      "total_a2a_time_ms": 1650,
      "agents_discovered": 12,
      "agents_selected": 3,
      "hcs_messages_sent": 15,
      "hcs_messages_received": 8
    }
  }
}
```

**AR Viewer UI:**

```
┌─────────────────────────────────────────────┐
│ 🤝 AGENT-TO-AGENT COORDINATION              │
│ Coordinator: 0.0.7301930                    │
│ 3 Agents Coordinated via HCS                │
│ Discovery: 450ms | Coordination: 1200ms     │
└─────────────────────────────────────────────┘

Flight Options:
- Wizz Air WI5432: €89
- Lufthansa LU4336: €201

Coordinated Package:
┌─────────────────────────────────────────────┐
│ 🚌 BUS AGENT (0.0.8901234)                  │
│ Airport Transfer: BCN Airport → City Center │
│ Fee: 1000 USDH | ✅ Confirmed               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🚆 TRAIN AGENT (0.0.8905678)                │
│ Renfe High-Speed: Budapest → Barcelona      │
│ Fee: 1500 USDH | ✅ Confirmed               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🏨 HOTEL AGENT (0.0.8909012)                │
│ Hotel Barcelona Center - Gothic Quarter     │
│ Fee: 1200 USDH | ✅ Confirmed               │
└─────────────────────────────────────────────┘

Total Package Cost: 4325 USDH
[VIEW PAYMENT BREAKDOWN] [BOOK PACKAGE]
```

---

## 🔧 AR Viewer Code Changes

### Update Request Handler

```javascript
// BEFORE (Mock MCP only)
async function searchFlights(origin, destination, date) {
  const response = await fetch(
    "http://localhost:4001/api/agents/travel/query",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, date }),
    }
  );

  const data = await response.json();
  displayFlights(data.flights);
  displayPayment(data.payment);
}

// AFTER (Add A2A support)
async function searchFlights(
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
        include_package: includePackage, // ⚠️ NEW PARAMETER
      }),
    }
  );

  const data = await response.json();
  displayFlights(data.flights);
  displayPayment(data.payment);

  // ⚠️ NEW: Check for A2A package
  if (data.a2a_package) {
    displayA2APackage(data.a2a_package);
  }
}
```

### Handle "YES" Button Click

```javascript
// When user clicks "YES" to coordinate package
function onUserClicksYes() {
  const { origin, destination, date } = currentSearchParams;

  // Show loading state
  showA2ALoadingIndicator("Discovering agents via HCS...");

  // Re-query with A2A coordination enabled
  searchFlights(origin, destination, date, true) // ⚠️ includePackage = true
    .then(() => {
      hideA2ALoadingIndicator();
    });
}
```

### Display A2A Package

```javascript
function displayA2APackage(a2aPackage) {
  const { coordinator, agents, payment_summary, coordination_metadata } =
    a2aPackage;

  // Show coordination header
  showA2AHeader({
    coordinator: coordinator.agent_id,
    totalAgents: coordinator.total_agents,
    discoveryTime: coordination_metadata.discovery_time_ms,
    coordinationTime: coordination_metadata.coordination_time_ms,
  });

  // Display each agent
  agents.forEach((agent) => {
    createAgentCard({
      type: agent.agent_type,
      agentId: agent.agent_id,
      service: agent.service,
      route: agent.route || agent.location,
      fee: agent.fee,
      status: agent.status,
      discoveryMethod: agent.discovery_method,
    });
  });

  // Show payment distribution
  displayPaymentBreakdown(payment_summary);
}
```

---

## 📊 Flow Diagram

```
User searches for flights (BUD → BCN)
           ↓
AR Viewer: POST /query { origin, destination, date }
           ↓
Backend: Mock MCP query (returns flights)
           ↓
AR Viewer: Display flights + "Want package?" button
           ↓
User clicks "YES"
           ↓
AR Viewer: POST /query { ..., include_package: true }
           ↓
Backend: Detects include_package = true
           ↓
Backend: Starts HCS-based agent discovery
    ├→ Subscribe to HCS Topic
    ├→ Send discovery request
    ├→ Receive 12 agent responses
    └→ Select best 3 agents (bus, train, hotel)
           ↓
Backend: Coordinate with selected agents
    ├→ Bus Agent: Confirm service (1000 USDH)
    ├→ Train Agent: Confirm service (1500 USDH)
    └→ Hotel Agent: Confirm service (1200 USDH)
           ↓
Backend: Distribute payments via USDH
    ├→ Travel Agent → Bus Agent (1000 USDH)
    ├→ Travel Agent → Train Agent (1500 USDH)
    └→ Travel Agent → Hotel Agent (1200 USDH)
           ↓
Backend: Return complete package in response
           ↓
AR Viewer: Display coordinated package with agents
           ↓
User: [BOOK PACKAGE] or [CANCEL]
```

---

## ✅ Implementation Checklist

### AR Viewer Team

- [ ] Add `includePackage` parameter to `searchFlights()` function
- [ ] Update "YES" button handler to call `searchFlights(..., true)`
- [ ] Add `displayA2APackage()` function to render coordinated agents
- [ ] Create agent card components (bus, train, hotel)
- [ ] Display payment distribution breakdown
- [ ] Show coordination metadata (discovery time, agents found)
- [ ] Test end-to-end flow: Search → YES → A2A Package

### AgentSphere Team (Backend)

- [x] Add `include_package` parameter detection in `/api/agents/travel/query`
- [x] Add placeholder `a2a_package` structure in response
- [ ] Implement real HCS-based agent discovery
- [ ] Deploy Bus/Train/Hotel agents with HCS integration
- [ ] Implement payment distribution logic
- [ ] Test with real USDH payments on testnet

---

## 🚨 Current Status

### ✅ What's Working NOW

- Mock MCP flight query
- `include_package` parameter detection
- Placeholder `a2a_package` response structure

### ⏳ What's Next

- Real HCS-based agent discovery
- Bus/Train/Hotel agent deployment
- Payment distribution implementation
- Full A2A coordination workflow

### 🧪 Testing

```bash
# Test Mock MCP (no A2A)
curl -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d '{"origin":"BUD","destination":"BCN","date":"2025-11-22"}'

# Test A2A Package Request
curl -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d '{"origin":"BUD","destination":"BCN","date":"2025-11-22","include_package":true}'
```

---

**Last Updated:** November 22, 2025  
**Backend:** Port 4001 (Running)  
**A2A Status:** Placeholder (HCS implementation pending)
