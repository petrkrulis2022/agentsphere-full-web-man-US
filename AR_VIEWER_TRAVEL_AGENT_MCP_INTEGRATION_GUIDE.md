# AR Viewer - Travel Agent 2 MCP Integration Guide

**Date**: November 21, 2025  
**Purpose**: Add MCP Flightradar24 query capability to existing AR Viewer payment flow

---

## ✅ **What's Already Working (DO NOT TOUCH)**

Your AR Viewer already has a complete, working payment flow:

1. ✅ User clicks AR object (bus stop) → `AgentInteractionModal` opens
2. ✅ Chat/Voice/Video tabs locked 🔒
3. ✅ Payment tab shows **Dynamic Amount** (650 USDH from agent deployment)
4. ✅ User clicks "Generate Payment" → QR code appears
5. ✅ User pays via **MetaMask** (Hedera Testnet) → Transaction confirms
6. ✅ Modal **stays open** → Chat/Voice/Video unlocked ✅
7. ✅ User can chat with agent

**THIS ENTIRE FLOW MUST STAY EXACTLY THE SAME!**

---

## 🎯 **What Needs to Be Added (ONLY THIS)**

After payment is confirmed and chat is unlocked, add ability for Travel Agent 2 to query MCP Flightradar24.

### **Integration Points**

#### **1. Add Travel Agent API Service**

Create: `src/services/travelAgentAPI.js`

```javascript
// src/services/travelAgentAPI.js
const TRAVEL_AGENT_BACKEND = "http://localhost:4001";

/**
 * Query Travel Agent 2 backend for flight data
 * ONLY called AFTER user has paid and unlocked chat
 */
export const queryTravelAgent = async ({
  agentAccountId,
  query,
  origin,
  destination,
  date,
}) => {
  try {
    console.log("🌐 Calling Travel Agent API:", {
      backend: TRAVEL_AGENT_BACKEND,
      agentAccountId,
      query,
    });

    const response = await fetch(
      `${TRAVEL_AGENT_BACKEND}/api/agents/travel/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentAccountId,
          query,
          origin,
          destination,
          date,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Travel Agent API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      flightData: data.flightData,
      mcpCost: data.mcpCost || 0.00001,
      alternativePackage: data.alternativePackage,
    };
  } catch (error) {
    console.error("❌ Travel Agent API error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
```

---

#### **2. Detect Travel Agent in AgentInteractionModal**

In `src/components/AgentInteractionModal.jsx`, detect if the agent is Travel Agent 2:

```javascript
// Near the top of AgentInteractionModal component
const isTravelAgent =
  agent?.hedera_account_id === "0.0.7301930" ||
  agent?.name?.includes("Travel Agent");
```

---

#### **3. Add MCP Query Logic to Chat**

When user sends a message in chat (AFTER payment/unlock), check if it's a travel query:

```javascript
// In AgentInteractionModal.jsx, in the message send handler

const handleSendMessage = async (message) => {
  // Add user message to chat
  const userMessage = { role: "user", content: message };
  setMessages((prev) => [...prev, userMessage]);

  // Check if this is Travel Agent and message is a travel query
  if (isTravelAgent && isTravelQuery(message)) {
    // Show loading indicator
    setIsQuerying(true);

    try {
      // Call Travel Agent backend
      const result = await queryTravelAgent({
        agentAccountId: agent.hedera_account_id,
        query: message,
        origin: extractOrigin(message) || "BUD",
        destination: extractDestination(message) || "BCN",
        date: new Date().toISOString().split("T")[0],
      });

      if (result.success) {
        // Add agent response with flight data
        const agentResponse = {
          role: "agent",
          content: formatFlightResponse(result.flightData),
          flightData: result.flightData,
          alternativePackage: result.alternativePackage,
        };
        setMessages((prev) => [...prev, agentResponse]);
      } else {
        // Error response
        const errorResponse = {
          role: "agent",
          content: `Sorry, I couldn't process that query: ${result.error}`,
        };
        setMessages((prev) => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error("Query error:", error);
    } finally {
      setIsQuerying(false);
    }
  } else {
    // Regular chat message (existing behavior)
    const agentResponse = {
      role: "agent",
      content: `I received your message: "${message}"`,
    };
    setMessages((prev) => [...prev, agentResponse]);
  }
};

// Helper functions
const isTravelQuery = (message) => {
  const travelKeywords = [
    "flight",
    "fly",
    "ticket",
    "travel",
    "bus",
    "train",
    "hotel",
  ];
  return travelKeywords.some((keyword) =>
    message.toLowerCase().includes(keyword)
  );
};

const extractOrigin = (message) => {
  // Simple extraction - can be improved
  const match = message.match(/from\s+([A-Z]{3})/i);
  return match ? match[1].toUpperCase() : null;
};

const extractDestination = (message) => {
  const match = message.match(/to\s+([A-Z]{3})/i);
  return match ? match[1].toUpperCase() : null;
};

const formatFlightResponse = (flightData) => {
  if (!flightData || !flightData.flights || flightData.flights.length === 0) {
    return "No flights found.";
  }

  const flight = flightData.flights[0];
  return (
    `✈️ Found flight ${flight.flightNumber} (${flight.airline}):\n` +
    `📍 ${flight.departure.airport} → ${flight.arrival.airport}\n` +
    `🕐 ${flight.departure.time} → ${flight.arrival.time}\n` +
    `💰 ${flight.price.economy} USDH\n` +
    `⏱️ Duration: ${flight.duration}`
  );
};
```

---

#### **4. Display Flight Data in Chat UI**

Add special rendering for messages with flight data:

```javascript
// In AgentInteractionModal.jsx, message rendering section

{
  messages.map((msg, idx) => (
    <div
      key={idx}
      className={msg.role === "user" ? "user-message" : "agent-message"}
    >
      <p>{msg.content}</p>

      {/* If message has flight data, show formatted display */}
      {msg.flightData && (
        <div className="flight-data-card">
          {msg.flightData.flights.map((flight, i) => (
            <div key={i} className="flight-card">
              <div className="flight-header">
                <span className="airline">{flight.airline}</span>
                <span className="flight-number">{flight.flightNumber}</span>
              </div>
              <div className="flight-route">
                <div className="departure">
                  <strong>{flight.departure.airport}</strong>
                  <span>{flight.departure.time}</span>
                </div>
                <div className="arrow">✈️</div>
                <div className="arrival">
                  <strong>{flight.arrival.airport}</strong>
                  <span>{flight.arrival.time}</span>
                </div>
              </div>
              <div className="flight-details">
                <span>Duration: {flight.duration}</span>
                <span className="price">{flight.price.economy} USDH</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* If message has alternative package, show it */}
      {msg.alternativePackage && (
        <div className="package-suggestion">
          <h4>💡 Alternative Package Available</h4>
          <p>Bus + Train + Hotel: {msg.alternativePackage.total} USDH</p>
          <button onClick={() => handlePackageRequest(msg.alternativePackage)}>
            View Details
          </button>
        </div>
      )}
    </div>
  ));
}
```

---

## 🔄 **Complete User Flow (With MCP Integration)**

```
┌─────────────────────────────────────────────────────────┐
│ 1. User Clicks Bus Stop (AR Object)                     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. AgentInteractionModal Opens                          │
│    - Chat Tab 🔒 LOCKED                                 │
│    - Voice Tab 🔒 LOCKED                                │
│    - Video Tab 🔒 LOCKED                                │
│    - Payment Tab ✅ Active                              │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Payment Tab Shows:                                   │
│    - Service Fee: Dynamic Amount (650 USDH)             │
│    - Network: Hedera Testnet                            │
│    - Receiving Wallet: 0xd7ca...7b1e                    │
│    - Token Contract: 0x000000...e24c7                   │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. User Clicks "Generate Payment"                       │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 5. QR Code Appears + "Scan QR to Pay" Button            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 6. User Clicks QR Code → MetaMask Opens                 │
│    - Network: Hedera Testnet                            │
│    - Interacting with: 0x00000...e24c7                  │
│    - Amount: 650 USDh                                   │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 7. User Confirms in MetaMask                            │
│    - Transaction broadcasts                             │
│    - Confirmation received                              │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 8. Modal STAYS OPEN - Tabs Unlock:                      │
│    - Chat Tab ✅ UNLOCKED                               │
│    - Voice Tab ✅ UNLOCKED                              │
│    - Video Tab ✅ UNLOCKED                              │
│    - Payment Tab ✅ Completed                           │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 9. User Types in Chat:                                  │
│    "Get me a flight from BUD to BCN"                    │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 10. AR Viewer Detects Travel Query                      │
│     - Calls: POST localhost:4001/api/agents/travel/query│
│     - Shows loading indicator                           │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 11. Travel Agent Backend:                               │
│     - Queries Flightradar24 via x402 MCP                │
│     - Pays 0.00001 HBAR for API access                  │
│     - Returns flight data                               │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 12. AR Viewer Displays Flight Results:                  │
│     ✈️ Flight FR8024 (Ryanair)                          │
│     📍 BUD → BCN                                        │
│     🕐 16:05 → 18:30                                    │
│     💰 45 USDH                                          │
│     ⏱️ Duration: 2h 25m                                 │
│                                                         │
│     💡 Alternative: Bus+Train+Hotel: 4325 USDH          │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 13. User Asks: "Show me other options"                  │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 14. Travel Agent Queries Sub-Agents:                    │
│     - Bus Agent (0.0.7299550) via A2A                   │
│     - Train Agent (0.0.7300963) via A2A                 │
│     - Hotel Agent (0.0.7300950) via A2A                 │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 15. AR Viewer Shows Package Summary:                    │
│     🚌 Bus: 1000 USDH                                   │
│     🚆 Train: 1500 USDH                                 │
│     🏨 Hotel: 1200 USDH                                 │
│     💼 Agent Fee: 625 USDH (already paid)               │
│     ───────────────────                                 │
│     💰 Total: 3700 USDH                                 │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 16. User Agrees → Pays 3700 USDH                        │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 17. Travel Agent Splits Payment:                        │
│     - Sends 1000 USDH → Bus Agent                       │
│     - Sends 1500 USDH → Train Agent                     │
│     - Sends 1200 USDH → Hotel Agent                     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 18. Sub-Agents Mint NFT Tickets → Send to User Wallet   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚫 **What NOT to Do**

1. ❌ **Do NOT create `UnlockPayment.jsx`** - Use existing `AgentInteractionModal`
2. ❌ **Do NOT hardcode fees** - Use dynamic fee from agent deployment
3. ❌ **Do NOT use HashPack** - Use MetaMask (already integrated)
4. ❌ **Do NOT create new payment modals** - Use existing Payment tab
5. ❌ **Do NOT close modal after payment** - Keep it open with unlocked tabs
6. ❌ **Do NOT modify existing payment flow** - Only add MCP query logic

---

## ✅ **What TO Do**

1. ✅ **Create `travelAgentAPI.js` service** - Only this file
2. ✅ **Add MCP query detection** - In existing chat handler
3. ✅ **Add flight data rendering** - In existing message display
4. ✅ **Keep modal open after payment** - Already working, don't break it
5. ✅ **Add MCP badge to Travel Agent card** - Visual indicator only

---

## 📁 **Files to Modify**

### **New File**

- `src/services/travelAgentAPI.js` - Travel Agent backend API service

### **Modify Existing**

- `src/components/AgentInteractionModal.jsx` - Add MCP query logic to chat
  - Import `travelAgentAPI.js`
  - Detect Travel Agent
  - Handle travel queries
  - Render flight data

---

## 🧪 **Testing Checklist**

1. ✅ Click bus stop → Modal opens with locked tabs
2. ✅ Payment tab shows 650 USDH dynamic fee
3. ✅ Generate payment → QR code appears
4. ✅ Click QR → MetaMask opens with correct amount
5. ✅ Confirm payment → Modal stays open, tabs unlock
6. ✅ Type in chat: "Get flight from BUD to BCN"
7. ✅ See loading indicator
8. ✅ See flight results displayed
9. ✅ Ask "show other options"
10. ✅ See package summary (bus + train + hotel)
11. ✅ Pay package total
12. ✅ Receive NFT tickets in wallet

---

## 🎨 **Optional Enhancements**

1. **MCP Badge on Agent Card** - Show Flightradar24 integration
2. **Loading Animation** - When querying MCP
3. **Flight Card Styling** - Make flight data look nice
4. **Package Comparison** - Side-by-side flight vs package
5. **NFT Display** - Show tickets received in wallet

---

## 🔧 **Backend Configuration**

Make sure Travel Agent 2 backend is running:

```bash
# In tools/travel-agent-template/
node index.js

# Should see:
# ✅ Travel Agent 2 (0.0.7301930) started on port 4001
# ✅ MCP Flightradar24 enabled
```

---

## 📝 **Summary**

**Existing Flow (Working - Don't Touch)**:

- Click agent → Modal → Payment → QR → MetaMask → Unlock tabs

**New Addition (Only This)**:

- Chat message → Detect travel query → Call backend → Display flights

**Result**:

- Same payment experience + MCP-powered travel queries

---

**NO new payment modals. NO hardcoded fees. NO HashPack. Just add MCP query to existing chat!**
