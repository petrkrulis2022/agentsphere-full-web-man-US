# Backend HCS A2A Implementation Guide

**Created:** November 22, 2025  
**Status:** IMPLEMENTATION READY  
**Architecture:** Decentralized HCS-based Agent-to-Agent Coordination  
**Critical Rule:** NO HTTP ENDPOINTS BETWEEN AGENTS - HCS TOPICS ONLY!

---

## 🚨 Architecture Rules

### ✅ ALLOWED

- AR Viewer → Travel Agent: **HTTP** (`http://localhost:4001/api/agents/travel/query`)
- Travel Agent → Bus/Train/Hotel Agents: **HCS TOPICS ONLY**
- Agent Advertisement: **HCS TOPICS**
- Agent Coordination: **HCS MESSAGE PASSING**
- Payments: **Hedera USDH transfers**

### ❌ FORBIDDEN

- ❌ NO `http://bus-agent.com/api/book`
- ❌ NO `http://train-agent.com/coordinate`
- ❌ NO REST APIs between agents
- ❌ NO centralized backend coordinating agents
- ❌ NO agent URLs in discovery messages
- ❌ NO HTTP polling for agent status

---

## 🏗️ HCS Topic Architecture

### Topic Structure

```javascript
// 1. DISCOVERY TOPIC (Public)
Topic ID: 0.0.DISCOVERY_TOPIC
Purpose: Agents advertise capabilities
Access: Public subscribe, agents publish
Retention: Last 1000 messages

// 2. TRAVEL AGENT RESPONSE TOPIC (Private)
Topic ID: 0.0.TRAVEL_RESPONSE_TOPIC
Purpose: Agents respond to Travel Agent coordination requests
Access: Travel Agent subscribes, other agents publish
Retention: Last 500 messages

// 3. BUS AGENT RESPONSE TOPIC (Private)
Topic ID: 0.0.BUS_RESPONSE_TOPIC
Purpose: Travel Agent sends coordination to Bus Agent
Access: Bus Agent subscribes, Travel Agent publishes
Retention: Last 100 messages

// 4. TRAIN AGENT RESPONSE TOPIC (Private)
Topic ID: 0.0.TRAIN_RESPONSE_TOPIC
Topic ID: 0.0.TRAIN_RESPONSE_TOPIC
Purpose: Travel Agent sends coordination to Train Agent
Access: Train Agent subscribes, Travel Agent publishes
Retention: Last 100 messages

// 5. HOTEL AGENT RESPONSE TOPIC (Private)
Topic ID: 0.0.HOTEL_RESPONSE_TOPIC
Purpose: Travel Agent sends coordination to Hotel Agent
Access: Hotel Agent subscribes, Travel Agent publishes
Retention: Last 100 messages
```

---

## 📋 Implementation Steps

### Step 1: Create HCS Topics (Hedera Testnet)

```bash
cd tools/travel-agent-template

# Create discovery topic
node scripts/create-hcs-topics.js
```

**Expected Output:**

```
✅ Discovery Topic Created: 0.0.DISCOVERY_TOPIC
✅ Travel Response Topic Created: 0.0.TRAVEL_RESPONSE_TOPIC
✅ Bus Response Topic Created: 0.0.BUS_RESPONSE_TOPIC
✅ Train Response Topic Created: 0.0.TRAIN_RESPONSE_TOPIC
✅ Hotel Response Topic Created: 0.0.HOTEL_RESPONSE_TOPIC
```

**Update `.env`:**

```bash
# HCS Topic IDs
HCS_DISCOVERY_TOPIC_ID=0.0.XXXXX
HCS_TRAVEL_RESPONSE_TOPIC_ID=0.0.XXXXX
HCS_BUS_RESPONSE_TOPIC_ID=0.0.XXXXX
HCS_TRAIN_RESPONSE_TOPIC_ID=0.0.XXXXX
HCS_HOTEL_RESPONSE_TOPIC_ID=0.0.XXXXX
```

---

### Step 2: Implement Bus Agent (HCS-based)

**File:** `tools/bus-agent/index.js`

```javascript
const {
  Client,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
} = require("@hashgraph/sdk");
const express = require("express");

// ⚠️ NO HTTP ENDPOINTS FOR COORDINATION!
// Only internal health check endpoint (optional)

const app = express();
const AGENT_ID = process.env.HEDERA_ACCOUNT_ID; // 0.0.XXXXX
const DISCOVERY_TOPIC = process.env.HCS_DISCOVERY_TOPIC_ID;
const BUS_RESPONSE_TOPIC = process.env.HCS_BUS_RESPONSE_TOPIC_ID;
const TRAVEL_RESPONSE_TOPIC = process.env.HCS_TRAVEL_RESPONSE_TOPIC_ID;

// Hedera client setup
const client = Client.forTestnet();
client.setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  process.env.HEDERA_PRIVATE_KEY
);

// 1. Advertise on Discovery Topic
async function advertiseBusAgent() {
  const advertisement = {
    agent_id: AGENT_ID,
    agent_type: "bus",
    capabilities: ["airport_transfer", "city_routes"],
    status: "active",
    location: "BCN", // Barcelona
    fee_range: [800, 1200],
    hcs_response_topic: BUS_RESPONSE_TOPIC,
    timestamp: new Date().toISOString(),
  };

  const submitTx = await new TopicMessageSubmitTransaction()
    .setTopicId(DISCOVERY_TOPIC)
    .setMessage(JSON.stringify(advertisement))
    .execute(client);

  const receipt = await submitTx.getReceipt(client);
  console.log(`[Bus Agent] Advertised on HCS: ${receipt.status.toString()}`);
}

// 2. Subscribe to Bus Response Topic (for coordination requests)
new TopicMessageQuery()
  .setTopicId(BUS_RESPONSE_TOPIC)
  .setStartTime(0)
  .subscribe(client, null, (message) => {
    const messageStr = Buffer.from(message.contents).toString();

    try {
      const request = JSON.parse(messageStr);

      if (request.type === "coordination_request") {
        console.log(`[Bus Agent] Coordination request from ${request.from}`);
        handleCoordinationRequest(request);
      }
    } catch (error) {
      console.error("[Bus Agent] Message parse error:", error);
    }
  });

// 3. Handle Coordination Request
async function handleCoordinationRequest(request) {
  const { from, service_details, payment_promise, correlation_id } = request;

  // Validate request
  const available = checkAvailability(service_details);

  if (available) {
    // Send confirmation to Travel Agent's response topic
    const confirmation = {
      type: "coordination_confirm",
      agent_id: AGENT_ID,
      agent_type: "bus",
      status: "confirmed",
      correlation_id: correlation_id,
      service: {
        route: "BCN Airport → City Center",
        departure: service_details.flight_arrival,
        arrival: addMinutes(service_details.flight_arrival, 30),
        duration: "30m",
        fee: 1000,
      },
      timestamp: new Date().toISOString(),
    };

    await new TopicMessageSubmitTransaction()
      .setTopicId(TRAVEL_RESPONSE_TOPIC)
      .setMessage(JSON.stringify(confirmation))
      .execute(client);

    console.log(`[Bus Agent] Confirmed coordination ${correlation_id}`);
  } else {
    // Send rejection
    const rejection = {
      type: "coordination_reject",
      agent_id: AGENT_ID,
      correlation_id: correlation_id,
      reason: "No availability",
      timestamp: new Date().toISOString(),
    };

    await new TopicMessageSubmitTransaction()
      .setTopicId(TRAVEL_RESPONSE_TOPIC)
      .setMessage(JSON.stringify(rejection))
      .execute(client);
  }
}

function checkAvailability(serviceDetails) {
  // Business logic to check bus availability
  return true; // Mock implementation
}

function addMinutes(dateStr, minutes) {
  const date = new Date(dateStr);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

// Advertise every 5 minutes
setInterval(advertiseBusAgent, 5 * 60 * 1000);
advertiseBusAgent(); // Initial advertisement

console.log(`[Bus Agent] Started - ID: ${AGENT_ID}`);
console.log(`[Bus Agent] Discovery Topic: ${DISCOVERY_TOPIC}`);
console.log(`[Bus Agent] Response Topic: ${BUS_RESPONSE_TOPIC}`);
console.log(`[Bus Agent] Listening for coordination requests via HCS...`);

// Optional: Health check endpoint (NOT for coordination!)
app.get("/health", (req, res) => {
  res.json({ status: "active", agent_id: AGENT_ID });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`[Bus Agent] Health check on port ${PORT}`);
});
```

---

### Step 3: Update Travel Agent (Add HCS Coordinator)

**File:** `tools/travel-agent-template/services/hcsCoordinator.js`

```javascript
const {
  Client,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");
const crypto = require("crypto");

class HCSCoordinator {
  constructor() {
    this.client = Client.forTestnet();
    this.client.setOperator(
      process.env.HEDERA_ACCOUNT_ID,
      process.env.HEDERA_PRIVATE_KEY
    );

    this.discoveryTopic = process.env.HCS_DISCOVERY_TOPIC_ID;
    this.travelResponseTopic = process.env.HCS_TRAVEL_RESPONSE_TOPIC_ID;

    this.activeAgents = new Map(); // Cache of discovered agents
    this.pendingRequests = new Map(); // Coordination requests awaiting response

    this.startDiscoveryListener();
    this.startResponseListener();
  }

  // 1. Subscribe to Discovery Topic
  startDiscoveryListener() {
    new TopicMessageQuery()
      .setTopicId(this.discoveryTopic)
      .setStartTime(0)
      .subscribe(this.client, null, (message) => {
        const messageStr = Buffer.from(message.contents).toString();

        try {
          const agent = JSON.parse(messageStr);

          if (agent.status === "active") {
            this.activeAgents.set(agent.agent_id, {
              ...agent,
              last_seen: new Date(),
            });

            console.log(
              `[HCS Coordinator] Discovered ${agent.agent_type} agent: ${agent.agent_id}`
            );
          }
        } catch (error) {
          console.error("[HCS Coordinator] Discovery parse error:", error);
        }
      });

    console.log(
      `[HCS Coordinator] Listening to discovery topic: ${this.discoveryTopic}`
    );
  }

  // 2. Subscribe to Travel Response Topic
  startResponseListener() {
    new TopicMessageQuery()
      .setTopicId(this.travelResponseTopic)
      .setStartTime(0)
      .subscribe(this.client, null, (message) => {
        const messageStr = Buffer.from(message.contents).toString();

        try {
          const response = JSON.parse(messageStr);

          if (
            response.correlation_id &&
            this.pendingRequests.has(response.correlation_id)
          ) {
            const request = this.pendingRequests.get(response.correlation_id);
            request.resolve(response);
            this.pendingRequests.delete(response.correlation_id);
          }
        } catch (error) {
          console.error("[HCS Coordinator] Response parse error:", error);
        }
      });

    console.log(
      `[HCS Coordinator] Listening to response topic: ${this.travelResponseTopic}`
    );
  }

  // 3. Discover Agents by Type
  async discoverAgents(agentType, location) {
    const discovered = [];

    for (const [agentId, agent] of this.activeAgents.entries()) {
      if (agent.agent_type === agentType && agent.location === location) {
        // Check if agent is still active (last seen < 10 minutes)
        const minutesSinceLastSeen = (new Date() - agent.last_seen) / 1000 / 60;

        if (minutesSinceLastSeen < 10) {
          discovered.push(agent);
        }
      }
    }

    console.log(
      `[HCS Coordinator] Found ${discovered.length} ${agentType} agents in ${location}`
    );
    return discovered;
  }

  // 4. Coordinate with Agent
  async coordinateWithAgent(agent, serviceDetails) {
    const correlationId = crypto.randomUUID();

    const coordinationRequest = {
      type: "coordination_request",
      from: process.env.HEDERA_ACCOUNT_ID,
      to: agent.agent_id,
      correlation_id: correlationId,
      service_details: serviceDetails,
      payment_promise: agent.fee_range[1], // Max fee
      timestamp: new Date().toISOString(),
    };

    // Send request to agent's response topic
    await new TopicMessageSubmitTransaction()
      .setTopicId(agent.hcs_response_topic)
      .setMessage(JSON.stringify(coordinationRequest))
      .execute(this.client);

    console.log(
      `[HCS Coordinator] Sent coordination to ${agent.agent_id} (${correlationId})`
    );

    // Wait for response with timeout
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(correlationId, { resolve, reject });

      setTimeout(() => {
        if (this.pendingRequests.has(correlationId)) {
          this.pendingRequests.delete(correlationId);
          reject(new Error("Coordination timeout"));
        }
      }, 10000); // 10 second timeout
    });
  }

  // 5. Coordinate Full Package
  async coordinatePackage(destination, flightArrival) {
    const startTime = Date.now();

    // Discover agents
    const busAgents = await this.discoverAgents("bus", destination);
    const trainAgents = await this.discoverAgents("train", destination);
    const hotelAgents = await this.discoverAgents("hotel", destination);

    const discoveryTime = Date.now() - startTime;

    if (
      busAgents.length === 0 ||
      trainAgents.length === 0 ||
      hotelAgents.length === 0
    ) {
      throw new Error("Insufficient agents available");
    }

    // Select best agents (simple: first one)
    const selectedBus = busAgents[0];
    const selectedTrain = trainAgents[0];
    const selectedHotel = hotelAgents[0];

    // Coordinate with each agent
    const coordinationStart = Date.now();

    const [busConfirm, trainConfirm, hotelConfirm] = await Promise.all([
      this.coordinateWithAgent(selectedBus, { flight_arrival: flightArrival }),
      this.coordinateWithAgent(selectedTrain, { destination }),
      this.coordinateWithAgent(selectedHotel, {
        destination,
        checkin: flightArrival,
      }),
    ]);

    const coordinationTime = Date.now() - coordinationStart;

    // Return package structure
    return {
      agents: [
        {
          agent_id: selectedBus.agent_id,
          agent_type: "bus",
          ...busConfirm.service,
          payment_tx: null, // Will be filled after payment
          status: "confirmed",
          discovery_method: "hcs_topic",
          discovery_topic: this.discoveryTopic,
        },
        {
          agent_id: selectedTrain.agent_id,
          agent_type: "train",
          ...trainConfirm.service,
          payment_tx: null,
          status: "confirmed",
          discovery_method: "hcs_topic",
          discovery_topic: this.discoveryTopic,
        },
        {
          agent_id: selectedHotel.agent_id,
          agent_type: "hotel",
          ...hotelConfirm.service,
          payment_tx: null,
          status: "confirmed",
          discovery_method: "hcs_topic",
          discovery_topic: this.discoveryTopic,
        },
      ],
      coordination_metadata: {
        discovery_time_ms: discoveryTime,
        coordination_time_ms: coordinationTime,
        total_a2a_time_ms: Date.now() - startTime,
        agents_discovered:
          busAgents.length + trainAgents.length + hotelAgents.length,
        agents_selected: 3,
        hcs_messages_sent: 3,
        hcs_messages_received: 3,
      },
    };
  }
}

module.exports = HCSCoordinator;
```

---

### Step 4: Update Travel Agent Backend (index.js)

**File:** `tools/travel-agent-template/index.js`

```javascript
const express = require("express");
const cors = require("cors");
const mcpService = require("./services/mcpService");
const x402Service = require("./services/x402Service");
const HCSCoordinator = require("./services/hcsCoordinator");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize HCS Coordinator
const hcsCoordinator = new HCSCoordinator();

// Query endpoint (AR Viewer calls this)
app.post("/api/agents/travel/query", async (req, res) => {
  try {
    const { origin, destination, date, include_package } = req.body;

    console.log(
      `[Travel Agent] Flight query: ${origin} → ${destination} (${date})`
    );

    if (include_package) {
      console.log(
        "[Travel Agent] A2A package requested - using HCS coordination"
      );
    }

    // Get flights from MCP (mock or real)
    const flights = await mcpService.queryFlights(origin, destination, date);
    const payment = await x402Service.recordPayment(
      "flightradar24_mcp",
      0.00022
    );

    // If A2A package requested, coordinate with agents via HCS
    let a2aPackage = null;

    if (include_package && flights.length > 0) {
      try {
        const flightArrival = flights[0].arrival.time;

        // ⚠️ HCS-BASED COORDINATION (NO HTTP!)
        const packageData = await hcsCoordinator.coordinatePackage(
          destination,
          flightArrival
        );

        // Distribute payments to agents
        const paymentDistribution = await distributePayments(
          packageData.agents
        );

        a2aPackage = {
          coordinator: {
            agent_id: process.env.HEDERA_ACCOUNT_ID,
            agent_type: "travel",
            coordination_fee: 625,
            total_agents: packageData.agents.length,
          },
          agents: packageData.agents.map((agent, index) => ({
            ...agent,
            payment_tx: paymentDistribution[index].tx_id,
          })),
          payment_summary: {
            total_package_cost:
              625 + packageData.agents.reduce((sum, a) => sum + a.fee, 0),
            breakdown: {
              travel_agent_coordination: 625,
              bus_agent: packageData.agents[0].fee,
              train_agent: packageData.agents[1].fee,
              hotel_agent: packageData.agents[2].fee,
            },
            payment_distribution: paymentDistribution,
            currency: "USDH",
            total_transactions: paymentDistribution.length,
            all_confirmed: true,
          },
          coordination_metadata: packageData.coordination_metadata,
        };

        console.log(
          `[Travel Agent] A2A package coordinated via HCS: ${packageData.agents.length} agents`
        );
      } catch (error) {
        console.error("[Travel Agent] A2A coordination error:", error);
        // Return flights without package if coordination fails
      }
    }

    const response = {
      flights,
      query: { origin, destination, date },
      payment,
    };

    if (a2aPackage) {
      response.a2a_package = a2aPackage;
    }

    res.json(response);
  } catch (error) {
    console.error("[Travel Agent] Query error:", error);
    res.status(500).json({ error: "Query failed", details: error.message });
  }
});

async function distributePayments(agents) {
  const distribution = [];

  for (const agent of agents) {
    // Send USDH payment to agent
    const txId = await x402Service.sendUSDH(agent.agent_id, agent.fee);

    distribution.push({
      from: process.env.HEDERA_ACCOUNT_ID,
      to: agent.agent_id,
      amount: agent.fee,
      tx_id: txId,
    });
  }

  return distribution;
}

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`[Travel Agent] Listening on port ${PORT}`);
  console.log("[Travel Agent] HCS Coordinator initialized");
});
```

---

## 🧪 Testing HCS Coordination

### Test 1: Verify Topics Created

```bash
# Check HCS topics exist
node tools/travel-agent-template/scripts/verify-topics.js
```

**Expected Output:**

```
✅ Discovery Topic (0.0.XXXXX) exists
✅ Travel Response Topic (0.0.XXXXX) exists
✅ Bus Response Topic (0.0.XXXXX) exists
✅ Train Response Topic (0.0.XXXXX) exists
✅ Hotel Response Topic (0.0.XXXXX) exists
```

---

### Test 2: Start Agents

```bash
# Terminal 1: Bus Agent
cd tools/bus-agent
node index.js

# Terminal 2: Train Agent
cd tools/train-agent
node index.js

# Terminal 3: Hotel Agent
cd tools/hotel-agent
node index.js

# Terminal 4: Travel Agent
cd tools/travel-agent-template
node index.js
```

**Expected Logs:**

```
[Bus Agent] Advertised on HCS: SUCCESS
[Bus Agent] Listening for coordination requests via HCS...

[Travel Agent] Listening on port 4001
[Travel Agent] HCS Coordinator initialized
[HCS Coordinator] Listening to discovery topic: 0.0.XXXXX
[HCS Coordinator] Discovered bus agent: 0.0.XXXXX
[HCS Coordinator] Discovered train agent: 0.0.XXXXX
[HCS Coordinator] Discovered hotel agent: 0.0.XXXXX
```

---

### Test 3: A2A Package Query

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

**Expected Response:**

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
      "total_agents": 3
    },
    "agents": [
      {
        "agent_id": "0.0.8901234",
        "agent_type": "bus",
        "status": "confirmed",
        "discovery_method": "hcs_topic",
        "payment_tx": "0.0.7301930@..."
      },
      {...}, {...}
    ],
    "payment_summary": {
      "total_package_cost": 4325,
      "all_confirmed": true
    },
    "coordination_metadata": {
      "discovery_time_ms": 450,
      "coordination_time_ms": 1200,
      "agents_discovered": 12
    }
  }
}
```

---

## 📊 Implementation Checklist

### HCS Infrastructure

- [ ] Create HCS Discovery Topic (0.0.DISCOVERY_TOPIC)
- [ ] Create Travel Response Topic (0.0.TRAVEL_RESPONSE_TOPIC)
- [ ] Create Bus Response Topic (0.0.BUS_RESPONSE_TOPIC)
- [ ] Create Train Response Topic (0.0.TRAIN_RESPONSE_TOPIC)
- [ ] Create Hotel Response Topic (0.0.HOTEL_RESPONSE_TOPIC)
- [ ] Update `.env` with topic IDs

### Bus Agent

- [ ] Create `tools/bus-agent/` directory
- [ ] Implement HCS advertisement logic
- [ ] Implement HCS coordination listener
- [ ] Test discovery and coordination
- [ ] Deploy to Hedera Testnet

### Train Agent

- [ ] Create `tools/train-agent/` directory
- [ ] Implement HCS advertisement logic
- [ ] Implement HCS coordination listener
- [ ] Test discovery and coordination
- [ ] Deploy to Hedera Testnet

### Hotel Agent

- [ ] Create `tools/hotel-agent/` directory
- [ ] Implement HCS advertisement logic
- [ ] Implement HCS coordination listener
- [ ] Test discovery and coordination
- [ ] Deploy to Hedera Testnet

### Travel Agent Updates

- [ ] Create `services/hcsCoordinator.js`
- [ ] Implement discovery listener
- [ ] Implement response listener
- [ ] Implement coordination logic
- [ ] Implement payment distribution
- [ ] Update `index.js` to use HCS coordinator
- [ ] Test end-to-end A2A flow

### Testing

- [ ] All agents advertise on HCS successfully
- [ ] Travel Agent discovers all 3 agent types
- [ ] Coordination messages sent via HCS
- [ ] Agents respond via HCS
- [ ] USDH payments distributed on-chain
- [ ] Complete package returned to AR Viewer
- [ ] All HashScan links work

---

## 🚨 Critical Reminders

### ✅ DO

- Use HCS Topics for ALL agent communication
- Advertise agents every 5 minutes
- Cache discovered agents for 10 minutes
- Use correlation IDs for request tracking
- Send USDH payments on-chain
- Return package with real transaction IDs

### ❌ DON'T

- Create HTTP endpoints for agent coordination
- Use URLs in discovery messages
- Poll agents via HTTP
- Use centralized backend for coordination
- Hardcode agent IDs
- Mock HCS messages

---

## 📚 Related Files

- `AR_VIEWER_A2A_REAL_INTEGRATION_GUIDE.md` - AR Viewer integration
- `AGENT_WALLET_ARCHITECTURE.md` - Hedera payment system
- `.env.example` - Environment variables template

---

**Last Updated:** November 22, 2025  
**Status:** Ready for Implementation  
**Architecture:** 100% Decentralized HCS-based A2A
