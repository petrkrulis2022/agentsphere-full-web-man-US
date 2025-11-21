# AR Viewer - Mock MCP Flight Query Integration Guide

**Created:** November 21, 2025  
**Status:** MOCK IMPLEMENTATION (Development Phase)  
**Backend:** Travel Agent Template (`http://localhost:4001`)  
**Purpose:** Enable AR Viewer to query flight data via MOCKED Flightradar24 MCP

---

## 🎯 Current Implementation: MOCK MODE

The Travel Agent backend is currently running in **MOCK MODE** - it returns fake flight data with simulated x402 transactions. **No real payments are made.** This allows AR Viewer development to proceed while we build a custom MCP server that accepts USDH on Hedera.

### Why Mock?

- **Real Flightradar24 MCP** requires USDC on Base mainnet (costs real money)
- We use **USDH on Hedera Testnet** for our payment architecture
- Custom MCP server will be built in a few days to accept USDH
- Mock allows AR Viewer integration work to continue immediately

---

## 📡 API Endpoint

**URL:** `http://localhost:4001/api/agents/travel/query`  
**Method:** `POST`  
**Content-Type:** `application/json`

### Request Format

```json
{
  "origin": "BUD", // IATA airport code (3 letters)
  "destination": "BCN", // IATA airport code (3 letters)
  "date": "2025-06-15" // ISO date format (YYYY-MM-DD)
}
```

### Response Format

```json
{
  "flights": [
    {
      "airline": "Wizz Air",
      "flightNumber": "WI5432",
      "departure": {
        "time": "2025-06-15T06:30:00.000Z", // ISO 8601 timestamp
        "airport": "BUD",
        "terminal": "2",
        "gate": "A12"
      },
      "arrival": {
        "time": "2025-06-15T09:45:00.000Z",
        "airport": "BCN",
        "terminal": "1",
        "gate": "C7"
      },
      "duration": "3h 15m",
      "aircraft": "Airbus A320",
      "price": 89, // Price in EUR
      "status": "On Time",
      "available_seats": 142
    }
    // ... more flights (2-5 total)
  ],
  "query": {
    "origin": "BUD",
    "destination": "BCN",
    "date": "2025-06-15"
  },
  "payment": {
    "cost_usdh": "0.00022", // Cost per query in USDH
    "amount": 0.00022,
    "currency": "USDH",
    "transaction_id": "0.0.549973@1763765461625.723486231", // FAKE Hedera transaction ID
    "hashscan_url": "https://hashscan.io/testnet/transaction/0.0.549973@1763765461625.723486231",
    "response_time_ms": 611,
    "timestamp": "2025-11-21T22:51:01.627Z",
    "protocol": "x402",
    "service": "Flightradar24 MCP (MOCKED)",
    "mock": true // ⚠️ Flag indicating this is mock data
  }
}
```

---

## 🔧 AR Viewer Integration Steps

### 1. Update API Query Function

Replace the old flight query logic with this:

```javascript
async function queryFlights(origin, destination, date) {
  try {
    console.log(`[AR Viewer] Querying flights: ${origin} → ${destination}`);

    const response = await fetch(
      "http://localhost:4001/api/agents/travel/query",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: origin.toUpperCase(), // Ensure uppercase IATA codes
          destination: destination.toUpperCase(),
          date: date || new Date().toISOString().split("T")[0], // Default to today
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || "Flight query failed");
    }

    const data = await response.json();

    // Check if mock mode
    if (data.payment && data.payment.mock) {
      console.warn("[AR Viewer] ⚠️ MOCK MODE - Flight data is simulated");
    }

    return data;
  } catch (error) {
    console.error("[AR Viewer] Flight query error:", error);
    throw error;
  }
}
```

### 2. Display Flight Results in AR

```javascript
function displayFlights(flightData) {
  const { flights, payment } = flightData;

  // Show mock warning if in development mode
  if (payment.mock) {
    showMockWarning(); // Display visual indicator in AR UI
  }

  flights.forEach((flight, index) => {
    // Create AR card/panel for each flight
    const flightCard = createARFlightCard({
      position: calculateCardPosition(index),
      flight: flight,
      mockMode: payment.mock,
    });

    // Add to AR scene
    arScene.add(flightCard);
  });

  // Display payment/transaction info
  displayTransactionInfo(payment);
}

function createARFlightCard(config) {
  const { flight, mockMode } = config;

  return {
    airline: flight.airline,
    flightNumber: flight.flightNumber,
    route: `${flight.departure.airport} → ${flight.arrival.airport}`,
    departureTime: formatTime(flight.departure.time),
    arrivalTime: formatTime(flight.arrival.time),
    gate: flight.departure.gate,
    terminal: flight.departure.terminal,
    duration: flight.duration,
    price: `€${flight.price}`,
    status: flight.status,
    seats: flight.available_seats,
    mockBadge: mockMode ? "🔧 MOCK" : null, // Visual indicator
  };
}
```

### 3. Show Transaction Link (HashScan)

```javascript
function displayTransactionInfo(payment) {
  const txInfo = {
    cost: `${payment.cost_usdh} USDH`,
    txId: payment.transaction_id,
    hashscanUrl: payment.hashscan_url,
    isMock: payment.mock,
  };

  // Create clickable link in AR UI
  const txLink = createARLink({
    text: txInfo.isMock ? "🔧 Mock Transaction" : "View on HashScan",
    url: txInfo.hashscanUrl,
    warning: txInfo.isMock
      ? "This is a fake transaction ID for development"
      : null,
  });

  // Display cost
  displayPaymentCost(txInfo.cost, txInfo.isMock);
}
```

### 4. Error Handling

```javascript
async function handleFlightQuery(origin, destination, date) {
  try {
    const flightData = await queryFlights(origin, destination, date);
    displayFlights(flightData);
  } catch (error) {
    // Handle common errors
    if (error.message.includes("Missing required parameters")) {
      showError("Please provide both origin and destination airports");
    } else if (error.message.includes("MCP service not available")) {
      showError("Flight search temporarily unavailable");
    } else if (error.message.includes("ECONNREFUSED")) {
      showError(
        "Backend server not running. Start with: cd tools/travel-agent-template && node index.js"
      );
    } else {
      showError(`Flight query failed: ${error.message}`);
    }
  }
}
```

---

## 🧪 Testing the Integration

### 1. Start Backend Server

```bash
cd /home/petrunix/agentsphere-full-web-man-US/agent-sphere-1-duplication-AR-QR-USECASE/tools/travel-agent-template
node index.js
```

Expected output:

```
🚀 Travel Agent started on http://localhost:4001
   Account ID: 0.0.7301930
   MCP Integration: Enabled
```

### 2. Test API Manually (from terminal)

```bash
curl -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BUD",
    "destination": "LON",
    "date": "2025-06-15"
  }'
```

Expected: JSON response with 2-5 mock flights

### 3. Test from AR Viewer

**Example Query:**

- Origin: `BUD` (Budapest)
- Destination: `BCN` (Barcelona)
- Date: `2025-06-15`

**Expected Result:**

- 2-5 flight options displayed in AR
- Each flight shows: airline, flight number, times, gate, price
- Mock warning indicator visible
- HashScan link clickable (will 404 since transaction is fake)

---

## 🎨 UI/UX Recommendations

### Visual Mock Indicators

Since this is mock data, make it clear to users:

1. **Mock Badge** on each flight card: `🔧 MOCK DATA`
2. **Development Banner** at top: `⚠️ Development Mode - Using Simulated Flight Data`
3. **Transaction Link** labeled as: `Mock Transaction (Development Only)`
4. **Color coding**: Use orange/yellow accents for mock elements

### Example AR Layout

```
┌─────────────────────────────────────────────┐
│ ⚠️ DEVELOPMENT MODE - MOCK FLIGHT DATA      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🔧 Wizz Air WI5432           🔧 MOCK        │
│ BUD → BCN                                   │
│ ✈️  06:30 → 09:45  (3h 15m)                 │
│ 🚪 Gate A12, Terminal 2                     │
│ 💶 €89  |  142 seats available              │
│ ✅ On Time                                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 💳 Payment: 0.00022 USDH (SIMULATED)        │
│ 🔗 Mock Transaction: 0.0.549973@...         │
└─────────────────────────────────────────────┘
```

---

## 📝 Sample Integration Code (Full Example)

```javascript
// ar-viewer-flight-query.js

const TRAVEL_AGENT_API = "http://localhost:4001/api/agents/travel/query";

class FlightQueryManager {
  constructor() {
    this.mockMode = false;
  }

  async queryFlights(origin, destination, date) {
    console.log(`[FlightQuery] ${origin} → ${destination} on ${date}`);

    try {
      const response = await fetch(TRAVEL_AGENT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          date: date || this._getTodayDate(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Query failed");
      }

      const data = await response.json();
      this.mockMode = data.payment.mock || false;

      if (this.mockMode) {
        console.warn("[FlightQuery] ⚠️ MOCK MODE ACTIVE");
      }

      return data;
    } catch (error) {
      console.error("[FlightQuery] Error:", error);
      throw error;
    }
  }

  renderFlightsInAR(flightData, arScene) {
    const { flights, payment } = flightData;

    // Clear previous results
    this._clearFlightCards(arScene);

    // Show mock warning banner if needed
    if (payment.mock) {
      this._showMockBanner(arScene);
    }

    // Render each flight as AR card
    flights.forEach((flight, idx) => {
      const card = this._createFlightCard(flight, idx, payment.mock);
      arScene.add(card);
    });

    // Show transaction footer
    this._showTransactionInfo(payment, arScene);
  }

  _createFlightCard(flight, index, isMock) {
    return {
      type: "flight-card",
      mock: isMock,
      position: this._calculatePosition(index),
      data: {
        header: `${flight.airline} ${flight.flightNumber}`,
        route: `${flight.departure.airport} → ${flight.arrival.airport}`,
        departure: this._formatTime(flight.departure.time),
        arrival: this._formatTime(flight.arrival.time),
        duration: flight.duration,
        gate: `Gate ${flight.departure.gate}, Terminal ${flight.departure.terminal}`,
        price: `€${flight.price}`,
        status: flight.status,
        seats: `${flight.available_seats} seats`,
        badge: isMock ? "🔧 MOCK" : null,
      },
    };
  }

  _showMockBanner(arScene) {
    arScene.add({
      type: "warning-banner",
      text: "⚠️ DEVELOPMENT MODE - MOCK FLIGHT DATA",
      color: "orange",
      position: "top",
    });
  }

  _showTransactionInfo(payment, arScene) {
    arScene.add({
      type: "transaction-footer",
      cost: `${payment.cost_usdh} USDH`,
      txId: payment.transaction_id,
      link: payment.hashscan_url,
      linkText: payment.mock ? "Mock Transaction" : "View on HashScan",
      warning: payment.mock ? "Simulated transaction (no real payment)" : null,
    });
  }

  _formatTime(isoString) {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  _getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  _calculatePosition(index) {
    // Position cards vertically in AR space
    return { x: 0, y: -index * 0.5, z: -2 };
  }

  _clearFlightCards(arScene) {
    arScene.removeByType("flight-card");
    arScene.removeByType("warning-banner");
    arScene.removeByType("transaction-footer");
  }
}

// Usage in AR Viewer
const flightQuery = new FlightQueryManager();

async function onUserSearchFlights(origin, destination, date) {
  try {
    const flightData = await flightQuery.queryFlights(
      origin,
      destination,
      date
    );
    flightQuery.renderFlightsInAR(flightData, arScene);
  } catch (error) {
    showARError(`Failed to load flights: ${error.message}`);
  }
}
```

---

## 🔄 Migration to Real MCP (Future)

### When Will This Change?

In **2-3 days**, we will:

1. Build custom MCP server that accepts USDH on Hedera
2. Deploy MCP server with real flight data API
3. Update backend to use real x402 payments
4. Remove all mock code

### What AR Viewer Needs to Do

**NOTHING** - The API contract remains the same:

- Same endpoint URL
- Same request format
- Same response structure
- Only difference: `payment.mock` will be `false` (or omitted)

### Code Changes Required (Backend Only)

In `tools/travel-agent-template/services/mcpService.js`:

1. **Remove mock block** (lines 153-202) - marked with `TODO: REPLACE THIS MOCK`
2. **Uncomment real MCP code** (after line 202)
3. **Update `.env`** with real MCP endpoint
4. **Test with small amounts** first

### Visual Indicators to Update

When migration happens:

- Remove "🔧 MOCK" badges
- Remove development mode banner
- Change transaction links to say "View on HashScan" (not "Mock Transaction")
- Update colors from orange/yellow to production scheme

---

## 🚨 Important Notes

### Current Limitations (Mock Mode)

❌ **HashScan links WON'T work** - Transaction IDs are fake  
❌ **No real payments** - No USDH is actually spent  
❌ **Flight data is random** - Not real flight schedules  
❌ **Same query gives different results** - Mock generates new data each time

### What Works Correctly

✅ **API endpoint structure** - Production-ready  
✅ **Request/response format** - Final schema  
✅ **Error handling** - Proper HTTP codes  
✅ **CORS enabled** - AR Viewer can access from browser  
✅ **Response timing** - Realistic delays (500-1500ms)

---

## 📞 Troubleshooting

### Backend Not Responding

**Problem:** `ECONNREFUSED` or `Cannot POST /api/agents/travel/query`

**Solution:**

```bash
# Check if backend is running
lsof -i:4001

# If not, start it
cd tools/travel-agent-template
node index.js
```

### "Missing required parameters" Error

**Problem:** Backend returns 400 error

**Solution:** Ensure you're sending `origin` and `destination` in the request body:

```json
{
  "origin": "BUD", // Must be 3-letter IATA code
  "destination": "BCN" // Must be 3-letter IATA code
}
```

### No Flights Returned

**Problem:** `flights: []` in response

**Solution:** This shouldn't happen in mock mode - if it does, check backend logs:

```bash
tail -f tools/travel-agent-template/backend.log
```

### CORS Error in Browser

**Problem:** `Access-Control-Allow-Origin` error

**Solution:** Backend has CORS enabled for all origins. If issue persists:

1. Check backend is running
2. Verify URL is `http://localhost:4001` (not `https`)
3. Restart backend server

---

## 📚 Additional Resources

### Related Documentation

- `AGENT_WALLET_ARCHITECTURE.md` - Hedera payment architecture
- `AR_VIEWER_DYNAMIC_PAYMENT_INTEGRATION.md` - Payment flow overview
- `API_DOCUMENTATION_POLYGON_AMOY_SOLANA_DEVNET.md` - Other agent APIs

### Backend Code Reference

- **Service:** `tools/travel-agent-template/services/mcpService.js`

  - Line 153-202: Mock implementation block (clearly marked)
  - Line 203+: Real MCP code (commented out)
  - Line 312+: Mock flight generator function

- **Server:** `tools/travel-agent-template/index.js`
  - Line 330-365: `/api/agents/travel/query` endpoint handler

### Environment Variables

Current `.env` in backend:

```bash
AGENT_ACCOUNT_ID=0.0.7301930
USDH_TOKEN_ID=0.0.7218375
MCP_FLIGHTRADAR_ENABLED=true
MCP_FLIGHTRADAR_ENDPOINT=https://nexus.thirdweb.com/routes/dck8b9de  # Will change to custom MCP
```

---

## ✅ Integration Checklist for AR Viewer Team

- [ ] Update flight query function to use `http://localhost:4001/api/agents/travel/query`
- [ ] Change request format to `{ origin, destination, date }`
- [ ] Parse response flights array and display in AR
- [ ] Add mock mode visual indicators (`payment.mock === true`)
- [ ] Display transaction info (cost, HashScan link)
- [ ] Add error handling for common cases
- [ ] Test with multiple routes (BUD→BCN, BUD→LON, etc.)
- [ ] Verify CORS works from AR Viewer origin
- [ ] Add "Development Mode" banner when `payment.mock === true`
- [ ] Document what changes when migrating to real MCP (none required)

---

**Last Updated:** November 21, 2025  
**Backend Version:** 2.0.0  
**Mock Mode:** Active  
**Production Ready:** 2-3 days
