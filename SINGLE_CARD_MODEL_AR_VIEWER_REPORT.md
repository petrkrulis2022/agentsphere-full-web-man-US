# Single-Card-Per-Agent Model - AR Viewer Integration Report

**Date**: October 20, 2025  
**Branch**: `revolut-pay`  
**Commit**: `a86c694`  
**Status**: ✅ Implemented, Tested, and Committed

---

## 📋 Executive Summary

The Revolut virtual card system has been updated to enforce a **single-card-per-agent model** for simplicity. Each agent can now have only one active virtual card at a time, streamlining card management and reducing complexity for AR Viewer integrations.

---

## 🎯 What Changed

### 1. **New Primary Card Endpoint**

```
GET /api/revolut/virtual-card/agent/:agentId/primary
```

**Purpose**: Retrieve the single active virtual card for a specific agent.

**Response** (Success):

```json
{
  "success": true,
  "agent_id": "test_agent_1",
  "card": {
    "card_id": "mock_card_1760947681841",
    "agent_id": "test_agent_1",
    "label": "Agent_test_agent_1_Card",
    "currency": "USD",
    "state": "ACTIVE",
    "balance": 100,
    "card_number": "4111 1111 1111 1111",
    "cvv": "123",
    "expiry_date": "12/25",
    "created_at": "2025-10-20T08:08:01.841Z",
    "updated_at": "2025-10-20T08:08:01.842Z"
  }
}
```

**Response** (No Card):

```json
{
  "success": true,
  "agent_id": "test_agent_999",
  "card": null
}
```

### 2. **Duplicate Prevention**

```
POST /api/revolut/create-virtual-card
```

**New Behavior**: If an agent already has an active card, the endpoint returns `409 Conflict` instead of creating a duplicate.

**Response** (Duplicate Attempt):

```json
{
  "success": false,
  "error": "Agent already has an active virtual card",
  "existing_card_id": "mock_card_1760947681841",
  "message": "Use /topup endpoint to add funds or terminate the existing card first"
}
```

### 3. **Mock Mode Support**

```
GET /api/revolut/mock/virtual-card/agent/:agentId/primary
POST /api/revolut/mock/create-virtual-card (with enforcement)
```

Both mock endpoints now enforce the single-card-per-agent constraint for testing without hitting the Revolut API.

### 4. **Deprecated Endpoint**

```
GET /api/revolut/virtual-cards/agent/:agentId (deprecated)
```

The old list endpoint is kept for backward compatibility but marked as deprecated. Use the new `/primary` endpoint instead.

---

## 🔧 AR Viewer Integration Guide

### **Step 1: Check if Agent Has a Card**

```javascript
// AR Viewer Frontend Code
const agentId = "agent_123";
const response = await fetch(
  `http://localhost:3001/api/revolut/virtual-card/agent/${agentId}/primary`
);
const data = await response.json();

if (data.card) {
  console.log("Agent has card:", data.card.card_id);
  console.log("Current balance:", data.card.balance, data.card.currency);
} else {
  console.log("Agent has no card - need to create one");
}
```

### **Step 2: Create Card (If Needed)**

```javascript
// Only create if agent doesn't have a card
if (!data.card) {
  const createResponse = await fetch(
    "http://localhost:3001/api/revolut/create-virtual-card",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: agentId,
        amount: 100,
        currency: "USD",
      }),
    }
  );

  const result = await createResponse.json();

  if (createResponse.status === 409) {
    console.log("Card already exists:", result.existing_card_id);
    // Fetch the existing card using /primary endpoint
  } else if (result.success) {
    console.log("Card created:", result.card.card_id);
  }
}
```

### **Step 3: Top Up Card Balance**

```javascript
// Add funds to existing card
const cardId = data.card.card_id;
const topupResponse = await fetch(
  `http://localhost:3001/api/revolut/virtual-card/${cardId}/topup`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: 50,
      currency: "USD",
    }),
  }
);

const topupResult = await topupResponse.json();
console.log("New balance:", topupResult.card.balance);
```

### **Step 4: Process Payment with QR Code**

```javascript
// Use the agent's single card to pay via QR code
const paymentResponse = await fetch(
  "http://localhost:3001/api/revolut/process-virtual-card-payment",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: agentId,
      orderId: "order_abc123",
      amount: 25.0,
      currency: "USD",
    }),
  }
);

const paymentResult = await paymentResponse.json();
if (paymentResult.success) {
  console.log("Payment processed:", paymentResult.order_id);
  console.log("Remaining balance:", paymentResult.remaining_balance);
}
```

---

## 🧪 Testing with Mock Mode

### **Quick Test Commands**

```bash
# 1. Create card for agent
curl -X POST http://localhost:3001/api/revolut/mock/create-virtual-card \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test_agent_1","amount":100,"currency":"USD"}'

# 2. Get primary card
curl http://localhost:3001/api/revolut/mock/virtual-card/agent/test_agent_1/primary

# 3. Try to create duplicate (should fail with 409)
curl -X POST http://localhost:3001/api/revolut/mock/create-virtual-card \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test_agent_1","amount":50,"currency":"USD"}'

# 4. Top up existing card
curl -X POST http://localhost:3001/api/revolut/mock/virtual-card/mock_card_XXX/topup \
  -H "Content-Type: application/json" \
  -d '{"amount":50,"currency":"USD"}'
```

### **Automated Test Suite**

Run the comprehensive test suite:

```bash
./test-single-card-model.sh
```

**Test Results** (Verified ✅):

- ✅ Create first card succeeds
- ✅ Duplicate creation fails with 409
- ✅ Primary endpoint returns correct card
- ✅ Primary endpoint returns null when no card exists
- ✅ Different agents can each have their own card

---

## 📊 Benefits for AR Viewer

### **1. Simplified Card Management**

- No need to track multiple cards per agent
- Single source of truth: one card per agent
- Easier balance tracking and reconciliation

### **2. Clearer User Experience**

- Users see one card per agent, not a list
- No confusion about which card to use
- Simpler UI: just show/hide card details

### **3. Reduced Complexity**

- Frontend doesn't need to implement card selection logic
- No pagination or filtering required
- Straightforward "check → create → use" workflow

### **4. Better Error Handling**

- Clear 409 error when trying to create duplicate
- Helpful message directs users to topup instead
- Prevents accidental card proliferation

### **5. Cost Efficiency**

- One card per agent = lower transaction fees
- Easier to monitor and audit spending
- Simplified accounting and reporting

---

## 🔄 Migration from Multi-Card Model

### **If You Were Using the Old List Endpoint**

**Before** (Multi-Card Model):

```javascript
// Old way - had to filter and pick primary card
const response = await fetch(`/api/revolut/virtual-cards/agent/${agentId}`);
const data = await response.json();
const primaryCard = data.cards[0]; // Manually pick first one
```

**After** (Single-Card Model):

```javascript
// New way - directly get the one card
const response = await fetch(
  `/api/revolut/virtual-card/agent/${agentId}/primary`
);
const data = await response.json();
const card = data.card; // Either card object or null
```

### **Backward Compatibility**

The old list endpoint still works:

```
GET /api/revolut/virtual-cards/agent/:agentId
```

But it's **deprecated**. Please migrate to the new `/primary` endpoint for:

- Clearer semantics (primary vs. list)
- Better performance (no array filtering)
- Future-proof code (old endpoint may be removed)

---

## 🎨 UI Recommendations for AR Viewer

### **Card Display Component**

```javascript
// Example React component
function AgentCardDisplay({ agentId }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentCard();
  }, [agentId]);

  async function fetchAgentCard() {
    setLoading(true);
    const response = await fetch(
      `http://localhost:3001/api/revolut/virtual-card/agent/${agentId}/primary`
    );
    const data = await response.json();
    setCard(data.card);
    setLoading(false);
  }

  if (loading) return <div>Loading card...</div>;

  if (!card) {
    return (
      <div>
        <p>No virtual card for this agent</p>
        <button onClick={createCard}>Create Virtual Card</button>
      </div>
    );
  }

  return (
    <div className="card-display">
      <h3>Agent Virtual Card</h3>
      <p>
        Balance: {card.balance} {card.currency}
      </p>
      <p>Card: •••• {card.card_number.slice(-4)}</p>
      <p>Status: {card.state}</p>
      <button onClick={topupCard}>Add Funds</button>
      <button onClick={processPayment}>Pay with QR</button>
    </div>
  );
}
```

### **Visual States**

1. **No Card State**

   - Show "Create Card" button
   - Display expected benefits (instant payments, QR codes, etc.)

2. **Active Card State**

   - Show balance prominently
   - Display last 4 digits of card number
   - Provide "Top Up" and "Pay" actions

3. **Low Balance Warning**

   - Alert when balance < threshold (e.g., $10)
   - Suggest topping up before next payment

4. **Error States**
   - Handle 409 gracefully ("Card already exists")
   - Show network errors with retry option
   - Display insufficient balance errors clearly

---

## 🔐 Security Considerations

### **Agent ID Validation**

- Always validate `agentId` on backend
- Ensure user has permission to access agent's card
- Use JWT tokens or session authentication

### **Balance Protection**

- Check balance before processing payments
- Implement rate limiting on card creation
- Monitor for suspicious topup patterns

### **Mock Mode Warning**

```javascript
// In AR Viewer, warn if using mock mode in production
if (API_URL.includes("mock")) {
  console.warn("⚠️ Using MOCK mode - for testing only!");
}
```

---

## 📈 Metrics & Monitoring

### **Track These Metrics**

1. **Cards Per Agent**: Should always be 0 or 1
2. **409 Errors**: Monitor duplicate creation attempts
3. **Average Balance**: Track typical card balances
4. **Topup Frequency**: How often users add funds
5. **Payment Success Rate**: QR code payment completion

### **Logging Examples**

```javascript
// Backend logging (already implemented)
console.log(`✅ Created card ${cardId} for agent ${agentId}`);
console.log(`⚠️ Agent ${agentId} attempted duplicate card creation`);
console.log(`💳 Payment processed: ${amount} ${currency} from card ${cardId}`);
```

---

## 🚀 Next Steps for AR Viewer Integration

### **Phase 1: Basic Integration** (1-2 hours)

- [ ] Update AR Viewer to use new `/primary` endpoint
- [ ] Replace old list endpoint calls
- [ ] Test card creation flow
- [ ] Test topup functionality

### **Phase 2: UI Enhancement** (2-3 hours)

- [ ] Design single-card display component
- [ ] Add "Create Card" flow for new agents
- [ ] Implement topup modal/form
- [ ] Add balance warnings

### **Phase 3: QR Payment Integration** (2-3 hours)

- [ ] Connect QR scanner to payment endpoint
- [ ] Handle payment success/failure states
- [ ] Update card balance after payment
- [ ] Add payment history display

### **Phase 4: Error Handling** (1 hour)

- [ ] Handle 409 errors gracefully
- [ ] Add retry logic for network errors
- [ ] Display user-friendly error messages
- [ ] Implement fallback UI states

### **Phase 5: Testing & Polish** (1-2 hours)

- [ ] Test with mock mode endpoints
- [ ] Verify all edge cases (no card, low balance, etc.)
- [ ] Add loading states and animations
- [ ] Conduct user acceptance testing

---

## 📞 Support & Resources

### **Endpoints Reference**

| Endpoint                                           | Method  | Purpose                       |
| -------------------------------------------------- | ------- | ----------------------------- |
| `/api/revolut/virtual-card/agent/:agentId/primary` | GET     | Get agent's single card       |
| `/api/revolut/create-virtual-card`                 | POST    | Create card (enforces single) |
| `/api/revolut/virtual-card/:cardId/topup`          | POST    | Add funds to card             |
| `/api/revolut/process-virtual-card-payment`        | POST    | Process QR payment            |
| `/api/revolut/mock/*`                              | Various | Mock endpoints for testing    |

### **Documentation Files**

- `REVOLUT_API_DOCUMENTATION.md` - Complete API reference
- `test-single-card-model.sh` - Automated test suite
- `server.js` - Implementation (lines 340-710)

### **Testing**

```bash
# Start server
node server.js

# Run tests
./test-single-card-model.sh

# Check server logs
tail -f server.log
```

---

## ✅ Verification Checklist

Before deploying to AR Viewer:

- [x] Single-card model implemented
- [x] Primary endpoint working (real + mock)
- [x] Duplicate prevention tested (409 response)
- [x] Mock mode fully functional
- [x] Test suite passing (5/5 tests)
- [x] Changes committed to git
- [ ] AR Viewer frontend updated
- [ ] End-to-end testing completed
- [ ] User documentation updated
- [ ] Production deployment planned

---

## 🎉 Summary

The single-card-per-agent model simplifies Revolut virtual card management for the AR Viewer:

✅ **One card per agent** - No more complexity  
✅ **New `/primary` endpoint** - Direct access to agent's card  
✅ **Duplicate prevention** - Automatic 409 error handling  
✅ **Mock mode support** - Full testing without API calls  
✅ **Backward compatible** - Old endpoint still works

**Ready for AR Viewer integration!** 🚀

---

**Questions?** Check `REVOLUT_API_DOCUMENTATION.md` or run `./test-single-card-model.sh` to see it in action.
