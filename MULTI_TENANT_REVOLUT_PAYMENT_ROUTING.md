# 🏦 Multi-Tenant Revolut Payment Routing - Architecture Guide

**Date:** October 15, 2025  
**Issue:** Current implementation routes ALL payments to platform owner's Revolut account  
**Status:** ⚠️ **CRITICAL - Needs Multi-Tenant Architecture**

---

## 🚨 **THE PROBLEM**

### **Current Implementation (Testing Only):**

```
User A deploys Agent → Revolut payments enabled
User B deploys Agent → Revolut payments enabled
User C deploys Agent → Revolut payments enabled
                ↓
        ALL PAYMENTS GO TO →
                ↓
    YOUR Revolut Merchant Account
    (Client ID: 96ca6a20-254d-46e7-aad1-46132e087901)
```

**This works for testing, but is COMPLETELY WRONG for production!**

### **Why This is a Problem:**

1. ❌ User A deploys agent, but YOU receive the money
2. ❌ User B deploys agent, but YOU receive the money
3. ❌ Users have no way to get THEIR revenue
4. ❌ Legal/compliance nightmare
5. ❌ Not a sustainable business model
6. ❌ Violates payment processor ToS (acting as unlicensed payment aggregator)

---

## ✅ **THE SOLUTION: Multiple Architecture Options**

### **Option 1: Revolut Connect (RECOMMENDED) 🏆**

**What it is:** Like "Stripe Connect" - allows your platform to onboard multiple merchants, each with their own Revolut accounts.

#### **How It Works:**

```
┌─────────────────────────────────────────────────────────────┐
│                   AgentSphere Platform                       │
│              (Your Revolut Merchant Account)                 │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   User A      │ │   User B      │ │   User C      │
│ Revolut Sub-  │ │ Revolut Sub-  │ │ Revolut Sub-  │
│  Account      │ │  Account      │ │  Account      │
│ (Connected)   │ │ (Connected)   │ │ (Connected)   │
└───────────────┘ └───────────────┘ └───────────────┘
       │                 │                 │
       ▼                 ▼                 ▼
  Receives          Receives          Receives
  their own         their own         their own
  payments          payments          payments
```

#### **Implementation:**

```javascript
// 1. User onboarding flow
async function connectUserRevolutAccount(userId) {
  // Generate Revolut Connect authorization URL
  const connectUrl = await revolutConnect.authorize({
    platform_account_id: PLATFORM_REVOLUT_ID,
    redirect_uri: `${APP_URL}/revolut/callback`,
    scope: ["payments", "webhooks"],
    user_id: userId,
  });

  // Redirect user to Revolut to connect their account
  return connectUrl;
}

// 2. Store connected account
async function handleRevolutCallback(code, userId) {
  const account = await revolutConnect.exchange({
    code: code,
    platform_account_id: PLATFORM_REVOLUT_ID,
  });

  // Store in database
  await supabase.from("user_payment_accounts").insert({
    user_id: userId,
    provider: "revolut",
    connected_account_id: account.id,
    access_token: encrypt(account.access_token),
    refresh_token: encrypt(account.refresh_token),
    status: "active",
  });
}

// 3. Create payment for specific user's agent
async function createPaymentForAgent(agentId, amount) {
  // Get agent owner
  const agent = await getAgent(agentId);
  const owner = agent.deployer_address;

  // Get owner's Revolut connected account
  const paymentAccount = await supabase
    .from("user_payment_accounts")
    .select("*")
    .eq("user_id", owner)
    .eq("provider", "revolut")
    .single();

  if (!paymentAccount) {
    throw new Error("Agent owner has not connected Revolut account");
  }

  // Create payment using OWNER's connected account
  const order = await revolutApiFetch("/api/1.0/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${decrypt(paymentAccount.access_token)}`,
    },
    body: JSON.stringify({
      amount: amount * 100,
      currency: "EUR",
      order_description: `Payment to Agent ${agentId}`,
      // Platform fee (optional)
      application_fee_amount: Math.round(amount * 0.3 * 100), // 30% platform fee
    }),
  });

  return order;
}
```

#### **Database Schema:**

```sql
-- New table: user_payment_accounts
CREATE TABLE user_payment_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(wallet_address),
  provider TEXT NOT NULL, -- 'revolut', 'stripe', etc.
  connected_account_id TEXT NOT NULL,
  access_token TEXT NOT NULL, -- Encrypted
  refresh_token TEXT, -- Encrypted
  account_email TEXT,
  account_status TEXT DEFAULT 'pending',
  onboarding_complete BOOLEAN DEFAULT false,
  capabilities JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Add to deployed_objects
ALTER TABLE deployed_objects
ADD COLUMN payment_routing_account_id UUID REFERENCES user_payment_accounts(id);
```

#### **Advantages:**

- ✅ Each user receives payments directly to THEIR account
- ✅ Platform can take fees automatically (application_fee_amount)
- ✅ Users maintain control of their funds
- ✅ Compliant with payment regulations
- ✅ Revolut handles KYC/AML for each sub-account
- ✅ Supports multiple currencies
- ✅ Real-time payouts

#### **Disadvantages:**

- ⚠️ Requires Revolut Business account upgrade
- ⚠️ Users must have/create Revolut accounts
- ⚠️ More complex implementation
- ⚠️ May require platform approval from Revolut

---

### **Option 2: Manual Bank Account Collection + Payouts**

**What it is:** Collect user bank details, receive payments to your account, then manually/automatically payout to users.

#### **How It Works:**

```
User pays Agent A → Your Revolut Account
                         │
                         ▼
              Calculate: Agent A owner gets 70%
                         │
                         ▼
              Payout to User A's Bank Account
              (Using stored bank_details)
```

#### **Implementation:**

```javascript
// 1. Collect bank details during deployment
const paymentMethods = {
  bank_qr: {
    enabled: true,
    bank_details: {
      account_holder: "John Doe",
      account_number: "GB29NWBK60161331926819",
      bank_name: "Revolut Ltd",
      swift_code: "REVOGB21"
    }
  }
};

// 2. Track revenue per agent owner
CREATE TABLE agent_revenue (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES deployed_objects(id),
  owner_wallet TEXT NOT NULL,
  total_earned DECIMAL(18,8) DEFAULT 0,
  total_paid_out DECIMAL(18,8) DEFAULT 0,
  pending_payout DECIMAL(18,8) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  last_payout_at TIMESTAMP
);

// 3. Process incoming payment
async function handleIncomingPayment(orderId, amount, agentId) {
  const agent = await getAgent(agentId);
  const ownerShare = amount * 0.70; // 70% to owner
  const platformFee = amount * 0.30; // 30% platform fee

  // Record revenue
  await supabase
    .from('agent_revenue')
    .upsert({
      agent_id: agentId,
      owner_wallet: agent.deployer_address,
      total_earned: sql`total_earned + ${ownerShare}`,
      pending_payout: sql`pending_payout + ${ownerShare}`
    });
}

// 4. Batch payout (daily/weekly)
async function processPendingPayouts() {
  const pendingPayouts = await supabase
    .from('agent_revenue')
    .select('*, deployed_objects!inner(payment_methods)')
    .gt('pending_payout', 10) // Minimum 10 EUR payout
    .execute();

  for (const payout of pendingPayouts.data) {
    const bankDetails = payout.deployed_objects.payment_methods.bank_qr.bank_details;

    // Create Revolut payout
    await revolutApiFetch('/api/1.0/payouts', {
      method: 'POST',
      body: JSON.stringify({
        amount: Math.round(payout.pending_payout * 100),
        currency: payout.currency,
        recipient: {
          account_holder: bankDetails.account_holder,
          account_number: bankDetails.account_number,
          bank_name: bankDetails.bank_name,
          swift_code: bankDetails.swift_code
        },
        reference: `AgentSphere payout - Agent ${payout.agent_id}`
      })
    });

    // Update records
    await supabase
      .from('agent_revenue')
      .update({
        total_paid_out: sql`total_paid_out + ${payout.pending_payout}`,
        pending_payout: 0,
        last_payout_at: new Date()
      })
      .eq('id', payout.id);
  }
}
```

#### **Advantages:**

- ✅ Simpler implementation (uses existing bank_details)
- ✅ Works with any bank (not just Revolut)
- ✅ Platform has more control
- ✅ Can batch payouts to reduce fees

#### **Disadvantages:**

- ❌ Delays in payouts (not instant)
- ❌ Platform acts as intermediary (regulatory risk)
- ❌ More complex accounting/reconciliation
- ❌ Need to handle failed payouts
- ❌ Currency conversion complexity
- ❌ Higher payment processing fees
- ❌ Trust issue: users don't control funds

---

### **Option 3: Hybrid - Stripe Connect + Revolut**

**What it is:** Use Stripe Connect for payment routing, Revolut for alternative payment methods.

#### **How It Works:**

```
User chooses payment method:
    │
    ├─ Crypto → Direct to agent owner's wallet (existing)
    │
    ├─ Stripe → Stripe Connect → Agent owner's Stripe account
    │
    └─ Revolut → Platform Revolut → Batch payout to bank
```

#### **Advantages:**

- ✅ Best of both worlds
- ✅ Stripe Connect handles most routing
- ✅ Revolut for European/UK users
- ✅ Multiple payment options

#### **Disadvantages:**

- ⚠️ Most complex implementation
- ⚠️ Two payment processors = double fees
- ⚠️ More integration work

---

## 🎯 **RECOMMENDED IMPLEMENTATION**

### **Phase 1: Current (Testing)**

✅ **Keep as-is** - Single Revolut account for testing

```
ALL payments → Your account
Purpose: Testing, development, proof-of-concept
```

### **Phase 2: MVP Launch (Option 2)**

✅ **Bank Account Collection + Payouts**

```
1. Users provide bank details during deployment
2. Payments come to your Revolut account
3. Weekly automated payouts to user bank accounts
4. Track revenue per user in database
```

**Implementation Checklist:**

- [x] BankDetailsForm already exists
- [ ] Create `agent_revenue` tracking table
- [ ] Implement webhook payment tracking
- [ ] Build payout service (batch processing)
- [ ] Add user dashboard showing pending/paid revenue
- [ ] Set minimum payout threshold (e.g., 10 EUR)
- [ ] Add payout schedule (weekly/bi-weekly)
- [ ] Email notifications for payouts

### **Phase 3: Scale (Option 1)**

✅ **Revolut Connect**

```
1. Apply for Revolut Connect access
2. Implement OAuth flow for user onboarding
3. Each user connects their Revolut account
4. Payments route directly to user accounts
5. Platform fee deducted automatically
```

**Implementation Checklist:**

- [ ] Apply for Revolut Business account
- [ ] Request Revolut Connect API access
- [ ] Implement OAuth authorization flow
- [ ] Create user onboarding UI
- [ ] Store connected account credentials (encrypted)
- [ ] Update payment creation to use connected accounts
- [ ] Implement webhook routing per connected account
- [ ] Build user payment account management dashboard

---

## 💡 **Immediate Action Items**

### **For Testing (Current State):**

✅ **No changes needed** - Continue using single account

### **For MVP Launch (Next 2-4 weeks):**

1. **Create Revenue Tracking System:**

```sql
-- Run this migration
CREATE TABLE agent_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES deployed_objects(id),
  owner_wallet TEXT NOT NULL,
  total_earned DECIMAL(18,8) DEFAULT 0,
  total_paid_out DECIMAL(18,8) DEFAULT 0,
  pending_payout DECIMAL(18,8) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  last_payout_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_revenue_owner ON agent_revenue(owner_wallet);
CREATE INDEX idx_agent_revenue_pending ON agent_revenue(pending_payout) WHERE pending_payout > 0;
```

2. **Update Webhook Handler:**

```javascript
// src/pages/api/revolut/webhook.js
case 'ORDER_COMPLETED':
  // Extract agent ID from order metadata
  const agentId = order.merchant_order_ext_ref.split('_')[1];

  // Calculate revenue split
  const totalAmount = order.amount / 100; // Convert from pence
  const ownerShare = totalAmount * 0.70;
  const platformFee = totalAmount * 0.30;

  // Track revenue
  await trackAgentRevenue(agentId, ownerShare, order.currency);

  // Unlock agent interaction
  await updateAgentPaymentStatus(order.id, 'completed');
  break;
```

3. **Build Payout Service:**

```javascript
// Create new file: src/services/payoutService.js
export async function processWeeklyPayouts() {
  // Get all pending payouts >= 10 EUR
  const payouts = await getPendingPayouts(10);

  for (const payout of payouts) {
    try {
      await processPayoutToBank(payout);
      await markPayoutComplete(payout.id);
      await sendPayoutNotification(payout.owner_wallet, payout.amount);
    } catch (error) {
      await logPayoutError(payout.id, error);
    }
  }
}
```

4. **Add User Dashboard:**

```tsx
// src/components/RevenuesDashboard.tsx
function RevenuesDashboard() {
  const [revenue, setRevenue] = useState(null);

  useEffect(() => {
    fetchUserRevenue(userWallet).then(setRevenue);
  }, [userWallet]);

  return (
    <div>
      <h2>Your Agent Revenue</h2>
      <p>Total Earned: {revenue.total_earned} EUR</p>
      <p>Paid Out: {revenue.total_paid_out} EUR</p>
      <p>Pending Payout: {revenue.pending_payout} EUR</p>
      <p>Next Payout: {getNextPayoutDate()}</p>
    </div>
  );
}
```

---

## 📊 **Revenue Flow Comparison**

### **Current (Testing):**

```
End User → Revolut Payment → YOUR Account
                                  ↓
                          You keep 100% 💰
```

### **Option 2 (MVP - Recommended):**

```
End User → Revolut Payment → YOUR Account
                                  ↓
                    Track: Owner gets 70%, You get 30%
                                  ↓
                Weekly Payout → Owner's Bank Account (70%)
                                  ↓
                          You keep 30% 💰
```

### **Option 1 (Scale):**

```
End User → Revolut Payment → Agent Owner's Account (70%)
                                  ↓
                Platform Fee → YOUR Account (30%) 💰
```

---

## 🔐 **Security & Compliance**

### **For Option 2 (Bank Details Collection):**

- ✅ Encrypt bank details at rest
- ✅ PCI DSS compliance (if storing card data)
- ✅ Clear ToS about payout schedule
- ✅ Track all payouts for auditing
- ✅ Handle failed payouts gracefully
- ✅ Provide payout receipts/invoices

### **For Option 1 (Revolut Connect):**

- ✅ OAuth tokens encrypted
- ✅ Use refresh tokens properly
- ✅ Revolut handles KYC/AML
- ✅ Comply with Revolut Connect ToS
- ✅ Monitor connected account status

---

## 📝 **User Experience**

### **Option 2 Flow:**

1. User deploys agent
2. Provides bank account details in form
3. Agent goes live
4. End users pay → Money accumulates
5. Weekly email: "You earned 50 EUR this week!"
6. Automatic payout to bank account
7. Email: "50 EUR sent to your account ending in 6819"

### **Option 1 Flow:**

1. User deploys agent
2. Clicks "Connect Revolut Account"
3. Redirected to Revolut OAuth
4. Authorizes AgentSphere
5. Agent goes live
6. End users pay → Money goes directly to user
7. Real-time notifications: "You received 10 EUR!"

---

## 🎯 **Decision Matrix**

| Criteria              | Option 1 (Connect) | Option 2 (Payouts) | Option 3 (Hybrid) |
| --------------------- | ------------------ | ------------------ | ----------------- |
| **Time to Implement** | 2-3 weeks          | 1 week             | 3-4 weeks         |
| **Complexity**        | Medium             | Low                | High              |
| **User Trust**        | High               | Medium             | High              |
| **Regulatory Risk**   | Low                | Medium-High        | Low-Medium        |
| **Payout Speed**      | Instant            | Weekly             | Mixed             |
| **Platform Control**  | Low                | High               | Medium            |
| **Scalability**       | Excellent          | Good               | Excellent         |
| **Cost (Fees)**       | Low                | Medium-High        | Medium            |
| **MVP Friendly**      | ❌                 | ✅                 | ❌                |
| **Long-term Best**    | ✅                 | ❌                 | ✅                |

---

## ✅ **Final Recommendation**

### **Immediate (Now):**

Continue with current setup for testing

### **MVP Launch (Next Month):**

Implement **Option 2** - Bank Account Collection + Weekly Payouts

- Uses existing `BankDetailsForm`
- Quick to implement
- Builds user base
- Generates revenue data

### **Scale (6 months):**

Migrate to **Option 1** - Revolut Connect

- Better UX
- Instant payouts
- Lower regulatory risk
- Industry standard

---

## 📞 **Next Steps**

1. ✅ **Decide on timeline** - When do you need multi-tenant?
2. ✅ **Choose implementation** - Option 1, 2, or 3?
3. ✅ **Create migration plan** - Database schema, services, UI
4. ✅ **Set payout parameters** - Frequency, minimum amount, fees
5. ✅ **Update documentation** - User guides, ToS, privacy policy

---

**Questions to Answer:**

1. When do you plan to launch publicly (with other users)?
2. What's your platform fee percentage (currently assuming 30%)?
3. Do you want instant payouts or batched payouts?
4. Do you have/plan to get Revolut Business account?
5. What's your preferred payout schedule (daily/weekly/monthly)?

---

**Status:** Ready to implement multi-tenant architecture  
**Recommended Path:** Option 2 → Option 1 migration  
**Estimated Timeline:** 1 week (Option 2) + 2-3 weeks (Option 1)

Let me know which option you want to implement! 🚀
