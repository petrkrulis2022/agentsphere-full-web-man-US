# 🚀 AR Viewer - Hedera Testnet Agent Deployment Guide

## ✅ Current Status

- **AR Viewer**: Connected to Hedera Testnet via MetaMask
- **Network**: Hedera Testnet (Chain ID 296)
- **RPC**: testnet.hashio.io/api
- **Currency**: HBAR
- **Wallet**: MetaMask integration working

---

## 🎯 Deployment Flow for Hedera Testnet Agents

### Step 1: Deploy Agent on Main App (Port 5174)

1. Navigate to Deploy page in main app
2. Ensure MetaMask is connected to **Hedera Testnet**
3. Fill in agent details:
   - Name, description, capabilities
   - Location coordinates
   - Agent type, interaction fee
4. System auto-detects **Hedera Testnet** network
5. Deploy → Creates database entry with `network: "Hedera Testnet"`

### Step 2: Agent Appears in AR Viewer (Port 5180)

- AR viewer fetches agents from Supabase `deployed_objects` table
- Filters agents by network (Hedera Testnet)
- Displays agents at GPS coordinates in AR view

---

## 🔧 AR Viewer Integration Checklist

### Already Working ✅

- [x] MetaMask connected to Hedera Testnet
- [x] HBAR balance display
- [x] Network detection (Chain ID 296)

### Needs Implementation 🔨

- [ ] **Agent payment flow on Hedera Testnet**
  - Add HBAR payment handling in payment modal
  - Native HBAR transfer (no stablecoin needed initially)
- [ ] **Network filter in agent list**

  - Filter agents by `network = "Hedera Testnet"`
  - Display network badge on agent cards

- [ ] **QR code generation for HBAR payments**
  - Generate payment QR with HBAR amount
  - Support MetaMask wallet connection

---

## 💡 Key Implementation Points

### 1. Payment Configuration

```javascript
// In AR viewer config
export const HEDERA_PAYMENT_CONFIG = {
  network: "Hedera Testnet",
  chainId: 296,
  currency: "HBAR",
  decimals: 18,
  interactionFee: 1, // 1 HBAR per interaction
  paymentType: "native", // Native HBAR (not stablecoin)
};
```

### 2. Agent Filtering

```javascript
// Filter agents deployed on Hedera Testnet
const hederaAgents = agents.filter(
  (agent) =>
    agent.network === "Hedera Testnet" ||
    agent.deployment_network_name === "Hedera Testnet"
);
```

### 3. Payment Transaction

```javascript
// Send HBAR payment via MetaMask
async function payWithHBAR(toAddress, amountInHBAR) {
  const amountInWei = ethers.parseEther(amountInHBAR.toString());

  const tx = await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: userAddress,
        to: toAddress,
        value: "0x" + amountInWei.toString(16),
        chainId: "0x128", // 296 in hex
      },
    ],
  });

  return tx;
}
```

---

## 📝 Testing Steps

1. **Deploy test agent on Hedera Testnet** (main app)
   - Use small interaction fee (0.1-1 HBAR)
   - Add test location coordinates
2. **Verify in AR viewer**
   - Check agent appears in database
   - Confirm network = "Hedera Testnet"
   - Test camera/AR view at location
3. **Test payment flow**
   - Click agent in AR
   - Payment modal should show HBAR amount
   - MetaMask prompts for HBAR transaction
   - Verify on Hashscan explorer

---

## 🔗 Resources

- **Hedera Docs**: https://docs.hedera.com/
- **Hashscan Testnet Explorer**: https://hashscan.io/testnet
- **MetaMask Hedera Guide**: https://docs.hedera.com/hedera/tutorials/smart-contracts/deploy-a-smart-contract-using-metamask-and-remix

---

## 🎨 UI Recommendations

### Network Badge

```jsx
{
  agent.network === "Hedera Testnet" && (
    <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">
      ⚡ Hedera HBAR
    </span>
  );
}
```

### Payment Button

```jsx
<button className="bg-purple-600 hover:bg-purple-700 text-white">
  💎 Pay {interactionFee} HBAR
</button>
```

---

## ⚡ Quick Implementation Priority

1. **HIGH**: Test agent deployment on Hedera (main app) ✅
2. **HIGH**: Verify agent appears in database with correct network
3. **MEDIUM**: Add HBAR payment flow in AR viewer
4. **MEDIUM**: Filter agents by network in AR view
5. **LOW**: Polish UI with Hedera branding

---

**Status**: Ready to deploy first test agent on Hedera Testnet! 🚀
