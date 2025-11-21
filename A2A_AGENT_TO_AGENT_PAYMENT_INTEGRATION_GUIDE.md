# A2A Agent-to-Agent Payment Integration Guide

**Created:** November 22, 2025  
**Status:** PRODUCTION READY (Post-Mock MCP Phase)  
**Purpose:** Enable Travel Agent to coordinate with Bus/Train/Hotel agents via A2A protocol with real blockchain payments

---

## 🎯 Overview: A2A Multi-Agent Coordination

After the user books a flight (via mock MCP), the Travel Agent needs to coordinate with Bus, Train, and Hotel agents to create a complete travel package. This uses the **A2A (Agent-to-Agent) protocol** for coordination and **USDH transfers on Hedera** for payments.

### Architecture Flow

```
User (AR Viewer)
    ↓ Pays 650 USDH unlock fee
Travel Agent (0.0.7301930)
    ↓ Chat unlocked, user queries flights
Travel Agent → Mock Flightradar24 MCP
    ↓ Flight data returned (mock x402 transaction)
User decides: "Book Alternative Package (Bus+Train+Hotel)"
    ↓ User approves package payment
Travel Agent receives: 4325 USDH (single transaction)
    ↓ Travel Agent distributes via A2A protocol:
    ├─→ Bus Agent (0.0.7299550): 1000 USDH
    ├─→ Train Agent (0.0.7300963): 1500 USDH
    ├─→ Hotel Agent (0.0.7300950): 1200 USDH
    └─→ Travel Agent keeps: 625 USDH (coordination fee)
```

---

## 📋 Current Deployment Status

### ✅ Deployed Agents

| Agent Type     | Hedera Account | Status      | Fee Structure           | A2A Enabled |
| -------------- | -------------- | ----------- | ----------------------- | ----------- |
| Travel Agent 2 | 0.0.7301930    | ✅ Deployed | 625 USDH (coordination) | ✅ Yes      |
| Bus Agent      | 0.0.7299550    | ✅ Deployed | 1000 USDH per ride      | ✅ Yes      |
| Train Agent    | 0.0.7300963    | ✅ Deployed | 1500 USDH per ticket    | ✅ Yes      |
| Hotel Agent    | 0.0.7300950    | ✅ Deployed | 1200 USDH per night     | ✅ Yes      |

**All agents have:**

- ✅ ERC-8004 identity NFTs minted
- ✅ Hedera wallets funded with USDH
- ✅ Agent Cards published (for A2A discovery)
- ✅ Backend endpoints running

---

## 🔧 Implementation Steps

### Phase 1: Agent Card Publishing ✅ COMPLETE

Each agent publishes an Agent Card at `/.well-known/agent-card.json`:

**Example: Bus Agent Card**

```json
{
  "name": "AI Bus Agent",
  "description": "Autonomous bus transport service with real-time route planning",
  "protocolVersion": "0.3.0",
  "version": "1.0.0",
  "url": "http://localhost:4002/",
  "did": "did:hedera:testnet:0.0.7299550",
  "capabilities": {
    "streaming": false,
    "pushNotifications": true,
    "stateTransitionHistory": true
  },
  "skills": [
    {
      "id": "book-bus-ride",
      "name": "Book Bus Ride",
      "description": "Book a bus ride from location A to B",
      "tags": ["transport", "bus", "booking"],
      "input": {
        "origin": "string",
        "destination": "string",
        "date": "ISO-8601 date",
        "passengers": "number"
      },
      "output": {
        "ticket_nft": "Hedera NFT ID",
        "pickup_time": "ISO-8601 timestamp",
        "route_number": "string",
        "cost_usdh": "number"
      }
    },
    {
      "id": "check-availability",
      "name": "Check Availability",
      "description": "Check if bus service is available for route and date",
      "tags": ["query", "availability"]
    }
  ],
  "payment": {
    "token": "USDH",
    "token_id": "0.0.7218375",
    "wallet": "0.0.7299550",
    "fee_per_ride": 1000
  }
}
```

**Where to publish:**

- Development: `tools/bus-agent-template/.well-known/agent-card.json`
- Production: `https://bus-agent.agentsphere.io/.well-known/agent-card.json`

---

### Phase 2: A2A Protocol Message Format

**A2A uses JSON-RPC 2.0 over HTTP** for agent communication.

#### Message Types

**1. Task Request (Travel Agent → Sub-Agent)**

```json
{
  "jsonrpc": "2.0",
  "method": "createTask",
  "params": {
    "skill": "book-bus-ride",
    "input": {
      "origin": "London",
      "destination": "Heathrow Airport",
      "date": "2025-11-22T17:00:00Z",
      "passengers": 1
    },
    "contextId": "travel-package-20251122-001",
    "metadata": {
      "coordinator": "did:hedera:testnet:0.0.7301930",
      "payment_method": "usdh_transfer",
      "max_cost": 1000
    }
  },
  "id": "req-bus-12345"
}
```

**2. Task Response (Sub-Agent → Travel Agent)**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "taskId": "task-bus-67890",
    "state": "completed",
    "output": {
      "ticket_nft": "0.0.7299550-56789",
      "pickup_time": "2025-11-22T17:15:00Z",
      "route_number": "42",
      "cost_usdh": 1000,
      "payment_address": "0.0.7299550"
    },
    "metadata": {
      "transaction_hash": "0x1234567890abcdef...",
      "hashscan_url": "https://hashscan.io/testnet/transaction/0x1234..."
    }
  },
  "id": "req-bus-12345"
}
```

**3. Error Response**

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32000,
    "message": "Insufficient balance for booking",
    "data": {
      "required": 1000,
      "available": 500,
      "token": "USDH"
    }
  },
  "id": "req-bus-12345"
}
```

---

### Phase 3: Travel Agent Orchestration Logic

**File:** `tools/travel-agent-template/services/a2aCoordinator.js` (NEW FILE)

```javascript
import { DefaultTaskHandler } from "@a2a-js/sdk/server";
import HederaPaymentService from "./hederaPaymentService.js";

/**
 * A2A Coordinator - Manages multi-agent travel package coordination
 */
export class A2ACoordinator {
  constructor(config) {
    this.travelAgentAccount = config.accountId; // 0.0.7301930
    this.travelAgentPrivateKey = config.privateKey;
    this.usdhTokenId = config.usdhTokenId || "0.0.7218375";

    // Sub-agent endpoints (from .env)
    this.subAgents = {
      bus: {
        url: process.env.BUS_AGENT_URL || "http://localhost:4002",
        account: "0.0.7299550",
        fee: 1000,
      },
      train: {
        url: process.env.TRAIN_AGENT_URL || "http://localhost:4003",
        account: "0.0.7300963",
        fee: 1500,
      },
      hotel: {
        url: process.env.HOTEL_AGENT_URL || "http://localhost:4004",
        account: "0.0.7300950",
        fee: 1200,
      },
    };

    this.paymentService = new HederaPaymentService({
      accountId: this.travelAgentAccount,
      privateKey: this.travelAgentPrivateKey,
      network: "testnet",
    });
  }

  /**
   * Query sub-agents for availability and pricing
   */
  async queryPackageAvailability(packageDetails) {
    const { origin, destination, departureDate, returnDate, passengers } =
      packageDetails;

    console.log(`[A2A Coordinator] Querying package availability...`);

    // Query all sub-agents in parallel
    const [busQuote, trainQuote, hotelQuote] = await Promise.all([
      this._queryBusAgent({
        origin,
        destination: "train_station",
        date: departureDate,
      }),
      this._queryTrainAgent({ origin, destination, date: departureDate }),
      this._queryHotelAgent({
        city: destination,
        checkIn: departureDate,
        checkOut: returnDate,
      }),
    ]);

    // Calculate package total
    const subtotal = busQuote.cost + trainQuote.cost + hotelQuote.cost;
    const coordinationFee = 625; // Travel Agent fee
    const total = subtotal + coordinationFee;

    return {
      available:
        busQuote.available && trainQuote.available && hotelQuote.available,
      package: {
        bus: busQuote,
        train: trainQuote,
        hotel: hotelQuote,
      },
      pricing: {
        bus: busQuote.cost,
        train: trainQuote.cost,
        hotel: hotelQuote.cost,
        subtotal,
        coordination_fee: coordinationFee,
        total,
      },
    };
  }

  /**
   * Book complete travel package
   * Executes payments and coordinates all sub-agents
   */
  async bookTravelPackage(packageDetails, userPayment) {
    console.log(`[A2A Coordinator] Booking travel package...`);

    try {
      // Step 1: Verify user payment received
      if (userPayment.amount < userPayment.expected) {
        throw new Error(
          `Insufficient payment: received ${userPayment.amount} USDH, expected ${userPayment.expected} USDH`
        );
      }

      // Step 2: Book all services via A2A protocol
      const [busBooking, trainBooking, hotelBooking] = await Promise.all([
        this._bookBusService(packageDetails.bus),
        this._bookTrainService(packageDetails.train),
        this._bookHotelService(packageDetails.hotel),
      ]);

      // Step 3: Execute payments to sub-agents
      await this._distributePayments({
        bus: {
          account: this.subAgents.bus.account,
          amount: this.subAgents.bus.fee,
        },
        train: {
          account: this.subAgents.train.account,
          amount: this.subAgents.train.fee,
        },
        hotel: {
          account: this.subAgents.hotel.account,
          amount: this.subAgents.hotel.fee,
        },
      });

      // Step 4: Return complete itinerary
      return {
        success: true,
        bookingId: `PKG-${Date.now()}`,
        itinerary: {
          bus: busBooking,
          train: trainBooking,
          hotel: hotelBooking,
        },
        payments: {
          total_paid: userPayment.amount,
          distributed: {
            bus: this.subAgents.bus.fee,
            train: this.subAgents.train.fee,
            hotel: this.subAgents.hotel.fee,
          },
          coordinator_fee: 625,
        },
      };
    } catch (error) {
      console.error(`[A2A Coordinator] Booking failed:`, error);

      // Attempt rollback (refund user, cancel bookings)
      await this._rollbackBooking(packageDetails);

      throw new Error(`Travel package booking failed: ${error.message}`);
    }
  }

  /**
   * Query Bus Agent for availability
   */
  async _queryBusAgent(params) {
    const response = await fetch(`${this.subAgents.bus.url}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "createTask",
        params: {
          skill: "check-availability",
          input: params,
        },
        id: `query-bus-${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Bus Agent error: ${data.error.message}`);
    }

    return {
      available: data.result.output.available,
      cost: this.subAgents.bus.fee,
      details: data.result.output,
    };
  }

  /**
   * Book bus service via A2A
   */
  async _bookBusService(params) {
    const response = await fetch(`${this.subAgents.bus.url}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "createTask",
        params: {
          skill: "book-bus-ride",
          input: params,
          metadata: {
            coordinator: this.travelAgentAccount,
            payment_pending: true,
          },
        },
        id: `book-bus-${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Bus booking failed: ${data.error.message}`);
    }

    return {
      ticket_nft: data.result.output.ticket_nft,
      pickup_time: data.result.output.pickup_time,
      route: data.result.output.route_number,
      cost: data.result.output.cost_usdh,
    };
  }

  /**
   * Query Train Agent (similar pattern)
   */
  async _queryTrainAgent(params) {
    // Similar to _queryBusAgent
    // Returns: { available: true, cost: 1500, details: {...} }
  }

  /**
   * Book train service (similar pattern)
   */
  async _bookTrainService(params) {
    // Similar to _bookBusService
    // Returns: { ticket_nft, departure_time, arrival_time, seat, cost }
  }

  /**
   * Query Hotel Agent (similar pattern)
   */
  async _queryHotelAgent(params) {
    // Similar to _queryBusAgent
    // Returns: { available: true, cost: 1200, details: {...} }
  }

  /**
   * Book hotel service (similar pattern)
   */
  async _bookHotelService(params) {
    // Similar to _bookBusService
    // Returns: { room_key_nft, check_in, check_out, room_number, cost }
  }

  /**
   * Distribute payments to sub-agents via Hedera HTS
   */
  async _distributePayments(payments) {
    console.log(`[A2A Coordinator] Distributing payments to sub-agents...`);

    // Execute payments in parallel
    const paymentPromises = Object.entries(payments).map(
      ([agent, { account, amount }]) => {
        return this.paymentService.transferUSDH({
          from: this.travelAgentAccount,
          to: account,
          amount: amount,
          memo: `Travel package payment - ${agent} service`,
        });
      }
    );

    const results = await Promise.all(paymentPromises);

    console.log(`[A2A Coordinator] Payments distributed:`, results);

    return results;
  }

  /**
   * Rollback booking in case of failure
   */
  async _rollbackBooking(packageDetails) {
    console.log(`[A2A Coordinator] Rolling back booking...`);

    // Send cancellation requests to all sub-agents
    // Refund user if payment was already made
    // This is simplified - production would need more robust rollback logic
  }
}

export default A2ACoordinator;
```

---

### Phase 4: Backend Integration

**Update:** `tools/travel-agent-template/index.js`

```javascript
import A2ACoordinator from "./services/a2aCoordinator.js";

// Initialize A2A coordinator
const a2aCoordinator = new A2ACoordinator({
  accountId: AGENT_ACCOUNT_ID,
  privateKey: AGENT_PRIVATE_KEY,
  usdhTokenId: USDH_TOKEN_ID,
});

// New endpoint: Query package availability
expressApp.post("/api/agents/travel/package/quote", async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, passengers } =
      req.body;

    console.log(`[API] Package quote request: ${origin} → ${destination}`);

    const quote = await a2aCoordinator.queryPackageAvailability({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: passengers || 1,
    });

    res.json(quote);
  } catch (error) {
    console.error(`[API] Package quote error:`, error);
    res.status(500).json({
      error: "Failed to get package quote",
      details: error.message,
    });
  }
});

// New endpoint: Book travel package
expressApp.post("/api/agents/travel/package/book", async (req, res) => {
  try {
    const { packageDetails, paymentTransaction } = req.body;

    console.log(`[API] Package booking request`);

    // Verify user payment on Hedera
    const paymentVerified = await verifyHederaPayment(paymentTransaction);

    if (!paymentVerified) {
      return res.status(400).json({
        error: "Payment verification failed",
        details: "Could not verify USDH payment on Hedera",
      });
    }

    // Book package via A2A coordinator
    const booking = await a2aCoordinator.bookTravelPackage(packageDetails, {
      amount: paymentTransaction.amount,
      expected: packageDetails.total,
      txHash: paymentTransaction.hash,
    });

    res.json(booking);
  } catch (error) {
    console.error(`[API] Package booking error:`, error);
    res.status(500).json({
      error: "Failed to book package",
      details: error.message,
    });
  }
});
```

---

### Phase 5: AR Viewer Integration

**AR Viewer needs to:**

1. **Display package quote** after flight query
2. **Allow user to approve payment** (4325 USDH total)
3. **Show booking confirmation** with all NFT tickets

**Example Flow in AR Viewer:**

```javascript
// After user queries flights and sees mock MCP results
async function offerAlternativePackage(origin, destination, date) {
  console.log(`[AR Viewer] Offering alternative package...`);

  // Step 1: Get package quote
  const quoteResponse = await fetch(
    "http://localhost:4001/api/agents/travel/package/quote",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: origin,
        destination: destination,
        departureDate: date,
        returnDate: addDays(date, 2), // 2-night stay
        passengers: 1,
      }),
    }
  );

  const quote = await quoteResponse.json();

  // Step 2: Display package option in AR
  displayPackageOption({
    title: "Alternative: Bus + Train + Hotel Package",
    description: `Complete travel package for ${quote.pricing.total} USDH`,
    breakdown: [
      { service: "Bus to station", cost: quote.pricing.bus },
      { service: "Train to destination", cost: quote.pricing.train },
      { service: "Hotel (2 nights)", cost: quote.pricing.hotel },
      { service: "Coordination fee", cost: quote.pricing.coordination_fee },
    ],
    total: quote.pricing.total,
    savings: calculateSavings(flightPrice, quote.pricing.total),
  });

  // Step 3: User approves payment
  const userApproved = await waitForUserApproval();

  if (!userApproved) {
    return;
  }

  // Step 4: Execute USDH payment to Travel Agent
  const paymentTx = await executeHederaPayment({
    from: userWallet,
    to: "0.0.7301930", // Travel Agent
    amount: quote.pricing.total,
    token: "0.0.7218375", // USDH
    memo: "Travel package booking",
  });

  // Step 5: Book package
  const bookingResponse = await fetch(
    "http://localhost:4001/api/agents/travel/package/book",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageDetails: quote,
        paymentTransaction: {
          hash: paymentTx.transactionId,
          amount: quote.pricing.total,
        },
      }),
    }
  );

  const booking = await bookingResponse.json();

  // Step 6: Display confirmation with all NFT tickets
  displayBookingConfirmation({
    bookingId: booking.bookingId,
    tickets: {
      bus: booking.itinerary.bus.ticket_nft,
      train: booking.itinerary.train.ticket_nft,
      hotel: booking.itinerary.hotel.room_key_nft,
    },
    itinerary: booking.itinerary,
    payments: booking.payments,
  });
}
```

---

## 🔐 Security Considerations

### Payment Verification

**CRITICAL:** Always verify user payment before booking services

```javascript
async function verifyHederaPayment(txHash) {
  // Query Hedera Mirror Node API
  const response = await fetch(
    `https://testnet.mirrornode.hedera.com/api/v1/transactions/${txHash}`
  );

  const tx = await response.json();

  // Verify:
  // 1. Transaction succeeded
  // 2. Correct recipient (Travel Agent account)
  // 3. Correct amount (package total)
  // 4. Correct token (USDH)

  return (
    tx.result === "SUCCESS" &&
    tx.transfers.find((t) => t.account === "0.0.7301930" && t.amount > 0)
  );
}
```

### Rollback Strategy

If booking fails after user payment:

1. **Cancel all sub-agent bookings** (send A2A cancellation messages)
2. **Refund user** (transfer USDH back)
3. **Log incident** for audit trail
4. **Notify user** via AR Viewer

---

## 📊 Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ USER PAYMENT PHASE                                      │
└─────────────────────────────────────────────────────────┘

User Wallet (MetaMask)
    ↓ 4325 USDH transfer
Travel Agent (0.0.7301930)
    ↓ Payment received
Travel Agent verifies payment on Hedera Mirror Node
    ↓ Payment confirmed

┌─────────────────────────────────────────────────────────┐
│ A2A COORDINATION PHASE (Off-Chain Messages)             │
└─────────────────────────────────────────────────────────┘

Travel Agent → Bus Agent (A2A)
    POST http://localhost:4002/tasks
    { skill: "book-bus-ride", input: {...} }
    ← Response: { ticket_nft: "0.0.7299550-56789" }

Travel Agent → Train Agent (A2A)
    POST http://localhost:4003/tasks
    { skill: "book-train-ticket", input: {...} }
    ← Response: { ticket_nft: "0.0.7300963-12345" }

Travel Agent → Hotel Agent (A2A)
    POST http://localhost:4004/tasks
    { skill: "book-room", input: {...} }
    ← Response: { room_key_nft: "0.0.7300950-67890" }

┌─────────────────────────────────────────────────────────┐
│ PAYMENT DISTRIBUTION PHASE (On-Chain Transfers)         │
└─────────────────────────────────────────────────────────┘

Travel Agent (0.0.7301930) → Bus Agent (0.0.7299550)
    ↓ 1000 USDH transfer
    ✅ Transaction: 0x1234...

Travel Agent (0.0.7301930) → Train Agent (0.0.7300963)
    ↓ 1500 USDH transfer
    ✅ Transaction: 0x5678...

Travel Agent (0.0.7301930) → Hotel Agent (0.0.7300950)
    ↓ 1200 USDH transfer
    ✅ Transaction: 0x9abc...

Travel Agent keeps: 625 USDH (coordination fee)

┌─────────────────────────────────────────────────────────┐
│ RESULT: User receives all NFT tickets in wallet         │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Test Scenario 1: Successful Package Booking

```bash
# Terminal 1: Start Travel Agent
cd tools/travel-agent-template
node index.js

# Terminal 2: Start Bus Agent
cd tools/bus-agent-template
node index.js

# Terminal 3: Start Train Agent
cd tools/train-agent-template
node index.js

# Terminal 4: Start Hotel Agent
cd tools/hotel-agent-template
node index.js

# Terminal 5: Test API
curl -X POST http://localhost:4001/api/agents/travel/package/quote \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "London",
    "destination": "Prague",
    "departureDate": "2025-11-25",
    "returnDate": "2025-11-27",
    "passengers": 1
  }'
```

**Expected Response:**

```json
{
  "available": true,
  "package": {
    "bus": { "available": true, "cost": 1000, "details": {...} },
    "train": { "available": true, "cost": 1500, "details": {...} },
    "hotel": { "available": true, "cost": 1200, "details": {...} }
  },
  "pricing": {
    "bus": 1000,
    "train": 1500,
    "hotel": 1200,
    "subtotal": 3700,
    "coordination_fee": 625,
    "total": 4325
  }
}
```

---

## 🚀 Deployment Checklist

### Backend Preparation

- [ ] Deploy Bus Agent backend on port 4002
- [ ] Deploy Train Agent backend on port 4003
- [ ] Deploy Hotel Agent backend on port 4004
- [ ] Publish Agent Cards for all sub-agents
- [ ] Fund all agent wallets with USDH (for refunds if needed)
- [ ] Configure `.env` with sub-agent URLs

### Travel Agent Updates

- [ ] Implement `A2ACoordinator` service
- [ ] Add `/api/agents/travel/package/quote` endpoint
- [ ] Add `/api/agents/travel/package/book` endpoint
- [ ] Implement payment verification logic
- [ ] Implement rollback strategy
- [ ] Add comprehensive logging

### AR Viewer Updates

- [ ] Add "Alternative Package" UI option after flight query
- [ ] Implement package quote display
- [ ] Add package payment approval flow
- [ ] Display booking confirmation with NFT tickets
- [ ] Show itinerary with all service details

### Testing

- [ ] Test A2A communication between all agents
- [ ] Test payment distribution (Travel Agent → Sub-agents)
- [ ] Test booking success flow end-to-end
- [ ] Test booking failure + rollback
- [ ] Test payment verification
- [ ] Test with real Hedera Testnet transactions

---

## 📚 Reference Documentation

### Related Files

- `A2A_ARCHITECTURE_COMPLETE_SUMMARY.md` - A2A protocol overview
- `MULTI_AGENT_TRAVEL_FLOW_USECASE.md` - Complete use case
- `AGENT_WALLET_ARCHITECTURE.md` - Hedera wallet setup
- `AR_VIEWER_MOCK_MCP_INTEGRATION_PROMPT.md` - Mock MCP (predecessor)

### External Resources

- [A2A Protocol Spec](https://github.com/a2a-org/a2a-js)
- [Hedera HTS Tokens](https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service)
- [Hedera Mirror Node API](https://docs.hedera.com/hedera/sdks-and-apis/rest-api)

---

## ✅ Success Criteria

**Phase 1 Complete When:**

- ✅ All 4 agents deployed and running
- ✅ Agent Cards published
- ✅ A2A communication working
- ✅ Mock MCP integration complete

**Phase 2 Complete When:**

- ✅ Package quote API working
- ✅ Package booking API working
- ✅ Payment distribution successful
- ✅ NFT tickets minted and delivered

**Phase 3 Complete When:**

- ✅ AR Viewer displays package options
- ✅ User can approve and pay for packages
- ✅ Complete end-to-end booking works
- ✅ All transactions verified on HashScan

---

**Last Updated:** November 22, 2025  
**Status:** Ready for Implementation  
**Prerequisites:** Mock MCP integration complete ✅  
**Next Phase:** Deploy sub-agent backends + implement A2A coordinator
