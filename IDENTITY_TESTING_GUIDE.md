# Agent Identity System - Testing Guide

## ✅ What's Working Now

Your agent identity system is **LIVE** with:
- All agents have verifiable identities
- 🆔 Verified badges showing on agent cards
- On-chain verification via Hedera accounts
- DID format: `did:hedera:testnet:{account_id}`

---

## 🧪 Test 1: View Existing Agents with Identities

1. Open http://localhost:5174
2. See all agent cards with **🆔 Verified** badges
3. Click any agent to see details
4. Identity should be displayed in the modal

**Expected Result:** All agents show verified identity

---

## 🧪 Test 2: Verify Agent on Blockchain

1. Note the agent's Hedera account (e.g., 0.0.7299550)
2. Open https://hashscan.io/testnet/account/0.0.7299550
3. See the account on Hedera blockchain
4. Check balance, transactions, etc.

**Expected Result:** Agent account exists on-chain with balance

---

## 🧪 Test 3: Deploy New Agent with Identity

### Steps:
1. Click **"Deploy Object"** button
2. Select **"Bus Agent"** or **"Train Agent"**
3. Fill in details:
   ```
   Name: Test Identity Agent
   Description: Testing verifiable identity system
   Location: Prague (50.8474, 13.8355)
   Fee: 1000 USDh
   ```
4. Click **"Create Hedera Wallet"** button
5. Wait for wallet creation (~5-10 seconds)
6. You'll see:
   - Hedera Account ID created
   - Private key generated
   - A2A endpoint configured
7. Click **"Deploy"** button
8. New agent appears with **🆔 Verified** badge

**Expected Result:** New agent deployed with identity

---

## 🧪 Test 4: Check Identity in Database

Run this command to see all agent identities:

\`\`\`bash
cd /home/petrunix/agentsphere-full-web-man-US/agent-sphere-1-duplication-AR-QR-USECASE
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

(async () => {
  const { data } = await supabase
    .from('deployed_objects')
    .select('name, agent_identity, hedera_account_id, object_type')
    .order('created_at', { ascending: false })
    .limit(10);
  
  console.log('\\n📋 Agent Identities:\\n');
  data?.forEach((agent, i) => {
    console.log(\`\${i+1}. \${agent.name}\`);
    console.log(\`   Type: \${agent.object_type}\`);
    console.log(\`   Identity: \${agent.agent_identity}\`);
    console.log(\`   Account: \${agent.hedera_account_id || 'None'}\`);
    console.log('');
  });
})();
"
\`\`\`

**Expected Result:** All agents have agent_identity field populated

---

## 🧪 Test 5: Filter by Network

1. In dashboard, use **Network Filter** dropdown
2. Select **"Hedera Testnet"**
3. See only Hedera agents displayed
4. All should have **🆔 Verified** badges

**Expected Result:** Filtering works, identities visible

---

## 🔍 Identity Format Examples

Your agents will have these identity formats:

### Legacy Agents (pre-Hedera):
\`\`\`
did:agent:testnet:a1b2c3d4
\`\`\`

### Hedera Agents (new):
\`\`\`
did:hedera:testnet:0.0.7299550
\`\`\`

### Future (with ERC-8004 NFT):
\`\`\`
0.0.1234567/5  (NFT format)
\`\`\`

---

## 🎯 What to Look For

✅ **Working:**
- 🆔 Verified badge on all agent cards
- Identity displayed when clicking agent
- Hedera accounts created for new agents
- On-chain verification via Hashscan

⏳ **Optional (not blocking):**
- ERC-8004 NFT contract (requires stable RPC)
- NFT-based identity (hedera_nft_id field)

---

## 🐛 Troubleshooting

**Badge not showing?**
- Check browser console for errors
- Verify agent_identity field exists in database

**New agent not getting identity?**
- Check Hedera wallet creation succeeded
- Verify treasury wallet has HBAR balance

**Identity not on blockchain?**
- Check Hedera account ID is correct format (0.0.xxxxx)
- Verify on https://hashscan.io/testnet/

---

## 📊 Current Status

- ✅ Database migration applied
- ✅ All existing agents have identities
- ✅ New agents get identities automatically
- ✅ UI shows 🆔 Verified badges
- ✅ On-chain verification working
- ⏳ ERC-8004 NFT (optional enhancement)

**System is production-ready!** 🎉
