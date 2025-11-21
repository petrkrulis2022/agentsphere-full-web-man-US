# AR Viewer - Flightradar24 MCP Integration with x402 Payment

**Date**: November 21, 2025  
**Objective**: Integrate real Flightradar24 flight data queries with server-side x402 micropayments

---

## 🎯 **Current Status**

✅ **Backend (Travel Agent)**: Configured and running on `http://localhost:4001`  
✅ **x402 Service**: Implemented in backend (`tools/travel-agent-template/services/x402Service.js`)  
✅ **MCP Service**: Implemented in backend (`tools/travel-agent-template/services/mcpService.js`)  
✅ **AR Viewer**: Chat working, but incorrectly triggering client-side payment

❌ **Issue**: AR Viewer is asking user's MetaMask to pay 0.1 USDH (WRONG!)  
✅ **Solution**: AR Viewer should send query to backend → Backend pays 0.00022 USDH from agent's wallet

---

## 📚 **Critical Documentation Links**

### **Flightradar24 MCP Server (Nexus)**

- **MCP Endpoint**: `https://nexus.thirdweb.com/routes/dck8b9de`
- **Documentation**: https://nexus.thirdweb.com/routes/dck8b9de (view endpoint details)
- **Payment Protocol**: x402 (HTTP 402 Payment Required)
- **Cost per query**: **0.00022 USDH** (as shown in your screenshot)
- **Payment recipient**: MCP server account (likely `0.0.7145000` based on tutorial)

### **x402 Protocol Documentation**

- **Tutorial Reference**: `tools/tutorial-a2a-x402-trustless-agent/`
- **Client Implementation**: `tools/tutorial-a2a-x402-trustless-agent/a2a-agent/client.ts`
- **Protocol**: L402 (Lightning Network HTTP 402 adapted for Hedera)
- **Flow**:
  1. Request → 402 response with invoice
  2. Parse invoice (amount, recipient, memo)
  3. Execute Hedera HTS transfer (USDH)
  4. Retry request with payment proof in `Authorization: L402 macaroon:txId`

### **Your Backend Implementation**

- **x402 Service**: `/tools/travel-agent-template/services/x402Service.js`
- **MCP Service**: `/tools/travel-agent-template/services/mcpService.js`
- **Main Backend**: `/tools/travel-agent-template/index.js`
- **Query Endpoint**: `POST http://localhost:4001/api/agents/travel/query`

### **Hedera & USDH Configuration**

- **Network**: Hedera Testnet
- **USDH Token**: `0.0.7218375`
- **Travel Agent Account**: `0.0.7301930`
- **Travel Agent Private Key**: In `.env` file (`HEDERA_PRIVATE_KEY`)
- **HashScan Explorer**: https://hashscan.io/testnet/transaction/{txId}

---

## 🔧 **Backend Configuration (Already Done)**

Your backend is already configured with:

```javascript
// tools/travel-agent-template/services/mcpService.js
class FlightradarMCPService {
  constructor() {
    this.mcpEndpoint = "https://nexus.thirdweb.com/routes/dck8b9de";
    this.x402Service = new X402PaymentService({
      accountId: process.env.HEDERA_ACCOUNT_ID, // 0.0.7301930
      privateKey: process.env.HEDERA_PRIVATE_KEY,
      usdhTokenId: process.env.USDH_TOKEN_ID, // 0.0.7218375
      network: "testnet",
    });
  }

  async queryFlights({ origin, destination, date, maxResults = 5 }) {
    // Makes x402 request to Flightradar24 MCP
    // Backend pays 0.00022 USDH from agent's wallet
    const response = await this.x402Service.request({
      url: `${this.mcpEndpoint}/api/live/flight-positions/full`,
      method: "GET",
      params: { origin, destination, date },
    });

    return {
      flights: response.data,
      payment: {
        cost_usdh: "0.00022",
        transaction_id: response.transactionId,
        hashscan_url: `https://hashscan.io/testnet/transaction/${response.transactionId}`,
      },
    };
  }
}
```

---

## 🚀 **AR Viewer Integration Steps**

### **Step 1: Remove Client-Side x402 Payment Logic**

**Files to check/modify in AR Viewer:**

- Any component attempting to trigger MetaMask for x402 payment
- Remove or comment out client-side x402 service calls
- Keep ONLY the 650 USDH unlock payment (via MetaMask)

### **Step 2: Send Queries to Backend API**

**Correct Implementation:**

```typescript
// ar-viewer/src/services/agentChatService.ts
async function sendTravelQuery(userMessage: string) {
  // Parse user intent (e.g., "flights from BUD to BCN")
  const query = parseFlightQuery(userMessage);

  if (!query) {
    return "Please specify origin and destination (e.g., 'flights from BUD to BCN')";
  }

  try {
    // Send to Travel Agent backend (SERVER-SIDE x402)
    const response = await fetch(
      "http://localhost:4001/api/agents/travel/query",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: query.origin, // "BUD"
          destination: query.dest, // "BCN"
          date: query.date || new Date().toISOString().split("T")[0],
        }),
      }
    );

    const data = await response.json();
    return formatFlightResults(data);
  } catch (error) {
    console.error("Flight query failed:", error);
    return `Failed to fetch flight data: ${error.message}`;
  }
}
```

### **Step 3: Display Results with HashScan Link**

```typescript
// ar-viewer/src/components/ChatMessage.tsx
function formatFlightResults(data: any) {
  if (!data.flights || data.flights.length === 0) {
    return "No flights found for this route.";
  }

  let message = `✈️ Found ${data.flights.length} flights:\n\n`;

  data.flights.forEach((flight: any, idx: number) => {
    message += `${idx + 1}. ${flight.flightNumber} - ${flight.airline}\n`;
    message += `   Departs: ${flight.departure.time}\n`;
    message += `   Arrives: ${flight.arrival.time}\n`;
    message += `   Price: €${flight.price.economy}\n\n`;
  });

  // Add x402 payment info with HashScan link
  if (data.payment) {
    message += `\n💳 MCP Query Cost: ${data.payment.cost_usdh} USDH\n`;
    message += `🔗 [View payment on HashScan](${data.payment.hashscan_url})`;
  }

  return message;
}
```

---

## 📋 **Testing Checklist**

### **Backend Testing**

```bash
# 1. Verify backend is running
cd tools/travel-agent-template
npm start
# Should see: Server running on http://localhost:4001

# 2. Test x402 payment manually
curl -X POST http://localhost:4001/api/agents/travel/query \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BUD",
    "destination": "BCN"
  }'

# Expected response:
# {
#   "flights": [...],
#   "payment": {
#     "cost_usdh": "0.00022",
#     "transaction_id": "0xd6e5bd1e4e1a57ab59...",
#     "hashscan_url": "https://hashscan.io/testnet/transaction/0x..."
#   }
# }
```

### **AR Viewer Testing**

1. ✅ User clicks bus stop → Payment modal shows **650 USDH** (dynamic from agent)
2. ✅ User pays 650 USDH via MetaMask → Transaction on HashScan
3. ✅ Chat unlocks (no more MetaMask popups!)
4. ✅ User types: "flights from BUD to BCN"
5. ✅ AR Viewer sends to `localhost:4001/api/agents/travel/query`
6. ✅ Backend pays 0.00022 USDH from agent's wallet (user sees nothing)
7. ✅ Flight results displayed with HashScan link to x402 payment
8. ✅ User clicks HashScan link → Sees agent's payment transaction

---

## 🔍 **Debugging Guide**

### **Issue: MetaMask Still Popping Up for x402**

**Diagnosis**: AR Viewer has client-side x402 payment code

**Solution**:

```bash
# Search AR Viewer for x402 client-side code
cd /path/to/ar-viewer
grep -r "x402" src/
grep -r "0.1 USDh" src/
grep -r "0.00022" src/

# Remove any client-side x402 payment triggers
```

### **Issue: "402 Payment Required" Error**

**Diagnosis**: Backend x402Service not working

**Check**:

1. `.env` has correct `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY`
2. Agent wallet has USDH balance: `node tools/travel-agent-template/check_balance.js`
3. Backend logs show x402 payment execution

### **Issue: No HashScan Link in Response**

**Diagnosis**: mcpService.js not including transaction_id

**Check**:

```javascript
// tools/travel-agent-template/services/mcpService.js line 225
responseData.transactionId = paymentProof; // Should be present
```

---

## 🎯 **Expected User Flow (Final)**

```
1. User clicks bus stop (AR object)
   ↓
2. Payment modal: "Pay 650 USDH to unlock"
   ↓
3. User pays via MetaMask
   → HashScan: https://hashscan.io/testnet/transaction/{unlockTxId}
   ↓
4. Chat/Voice/Video unlocked
   ↓
5. User types: "Get me flights from BUD to BCN"
   ↓
6. AR Viewer → POST localhost:4001/api/agents/travel/query
   ↓
7. Backend pays 0.00022 USDH to Flightradar24 MCP
   → HashScan: https://hashscan.io/testnet/transaction/{x402TxId}
   (User doesn't see this payment - happens server-side)
   ↓
8. Backend receives flight data
   ↓
9. AR Viewer displays:
   "✈️ 3 flights found
    1. Ryanair FR8024 - BUD to BCN
       Departs: 18:05 | Arrives: 18:30
       Price: $45

    💳 MCP Cost: 0.00022 USDH
    🔗 View payment on HashScan"
   ↓
10. User clicks HashScan link
    → Opens: https://hashscan.io/testnet/transaction/0xd6e5bd...
    → Shows: Travel Agent (0.0.7301930) → 0.00022 USDH → MCP (0.0.7145000)
```

---

## 💡 **Key Reminders**

### **Two Separate Payments**

| Payment      | Amount       | Who Pays          | What For                | Where       |
| ------------ | ------------ | ----------------- | ----------------------- | ----------- |
| **Unlock**   | 650 USDH     | User via MetaMask | Unlock chat/voice/video | Client-side |
| **x402 MCP** | 0.00022 USDH | Agent's wallet    | Get flight data         | Server-side |

### **User NEVER Pays for MCP Queries**

- ❌ No MetaMask popup for x402
- ❌ No client-side x402 payment logic
- ✅ Backend handles all MCP payments
- ✅ User only pays 650 USDH once to unlock agent

### **HashScan Links**

- **Unlock payment**: User can see their own transaction
- **x402 payment**: User can see agent's transaction (transparency)
- Both on Hedera Testnet: `https://hashscan.io/testnet/transaction/{txId}`

---

## 📞 **Next Actions**

**For AR Viewer Team:**

1. **Remove** any client-side x402 payment code
2. **Implement** backend query endpoint call: `POST localhost:4001/api/agents/travel/query`
3. **Parse** user messages for flight queries (origin, destination)
4. **Display** flight results with HashScan link
5. **Test** complete flow from unlock → query → results

**For Backend Team (You):**

1. ✅ Backend already configured correctly
2. ✅ x402Service paying from agent wallet
3. ✅ mcpService returning transaction IDs
4. ⏳ Verify MCP endpoint works: Test with `curl` or Postman
5. ⏳ Check agent wallet has sufficient USDH balance

---

## 🔗 **Quick Reference Links**

- **Nexus MCP Endpoint**: https://nexus.thirdweb.com/routes/dck8b9de
- **HashScan (Testnet)**: https://hashscan.io/testnet
- **Travel Agent Account**: https://hashscan.io/testnet/account/0.0.7301930
- **USDH Token**: https://hashscan.io/testnet/token/0.0.7218375
- **Backend API**: http://localhost:4001/api/agents/travel/query
- **Agent Card**: http://localhost:4001/.well-known/agent-card.json

---

**Architecture Diagram**: See `A2A_ARCHITECTURE_COMPLETE_SUMMARY.md` lines 696-892 for complete flow

**Documentation Status**: ✅ Updated to reflect server-side x402 architecture
