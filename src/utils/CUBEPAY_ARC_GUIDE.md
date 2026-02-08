# CubePay x Circle Arc - HackMoney 2026 Integration Guide

**Last Updated:** February 4, 2026  
**Target Track:** Best Chain Abstracted USDC Apps Using Arc as a Liquidity Hub ($5,000)

---

## Table of Contents

1. [What is Arc?](#what-is-arc)
2. [Track Requirements](#track-requirements)
3. [Your Questions Answered](#your-questions-answered)
4. [Architecture Overview](#architecture-overview)
5. [Technical Implementation](#technical-implementation)
6. [Migration from Chainlink CCIP](#migration-from-chainlink-ccip)
7. [Qualification Checklist](#qualification-checklist)
8. [Quick Start Guide](#quick-start-guide)
9. [Resources](#resources)

---

## What is Arc?

### Arc = Separate Layer-1 Blockchain (NOT just a liquidity layer)

**Arc Blockchain Specs:**
- **Type:** EVM-compatible Layer-1 blockchain
- **Builder:** Circle (USDC issuer)
- **Purpose:** Settlement and payment infrastructure
- **Finality:** Sub-second (<350ms)
- **Gas:** USDC-denominated (no ETH needed)
- **Consensus:** Malachite (improved Tendermint)
- **Status:** Testnet live, mainnet beta 2026

**Think of Arc as:**
> Ethereum/Solana/Base → General purpose blockchains  
> Arc → Specialized payment settlement blockchain

### Circle's Cross-Chain Stack

```
Your CubePay Application
         ↓
Bridge Kit (SDK/interface)
         ↓
CCTP (Cross-Chain Transfer Protocol - burn/mint)
         ↓
Arc Blockchain (settlement hub)
         ↓
EVM Chains (Ethereum, Base, Arbitrum, Polygon, etc.)
```

**Key Products:**
1. **Arc Blockchain** - L1 network for settlement
2. **Bridge Kit** - SDK for cross-chain transfers
3. **CCTP** - Protocol for USDC burn/mint (built into Bridge Kit)
4. **Circle Gateway** - Unified balance across chains (optional)
5. **Circle Wallets** - Programmable wallet infrastructure (optional)

---

## Track Requirements

### 🏆 Best Chain Abstracted USDC Apps Using Arc as a Liquidity Hub

**Prize:** $5,000 (1st: $2,500, 2nd: $2,500)

**Description:**
Build apps that treat multiple chains as one liquidity surface, using Arc to move USDC wherever it's needed. Projects should demonstrate how capital can be sourced, routed, and settled across chains without fragmenting user experience.

**What judges want:**
- ✅ Crosschain payments, credit, or treasury systems
- ✅ Applications that are not locked to a single chain
- ✅ Seamless user experience despite crosschain complexity

**REQUIRED Tools:**
- Arc blockchain
- USDC

**RECOMMENDED Tools:**
- Circle Wallets (optional - you can use MetaMask)
- Circle Gateway (optional)
- Bridge Kit (should use this)

**Qualification Requirements:**
- [ ] Functional MVP (frontend + backend)
- [ ] Architecture diagram
- [ ] Product feedback for Circle tools
- [ ] Video demonstration
- [ ] Detailed documentation
- [ ] GitHub/Replit repo

**Why CubePay is Perfect:**
- ✅ Already doing crosschain payments (merchant on Chain A, user on Chain B)
- ✅ Not locked to single chain (multi-EVM support)
- ✅ Seamless UX (AR terminal abstracts complexity)
- ✅ Real use case (not just demo)

---

## Your Questions Answered

### Q1: Is Arc a separate blockchain or just a layer for liquidity across EVM chains?

**A:** **Separate L1 blockchain** - But it's designed to act as a liquidity/settlement hub for EVM chains.

```
Arc is BOTH:
- Separate blockchain (can deploy contracts, hold balances)
- Settlement hub (optimized for cross-chain USDC routing)
```

### Q2: Do we need to bridge all assets into Arc? Or can we use it plug-and-play?

**A:** Arc is a **transit/settlement layer**, not permanent storage.

**Flow:**
```
User (Ethereum) 
  → Bridge to Arc (instant settlement)
  → Bridge to Merchant (Base)

Arc is the "middle hop" that provides:
- Sub-second finality
- Unified liquidity
- Predictable fees
```

You don't "bridge all to Arc and stay there" - you route **through** Arc.

### Q3: Do we need to create Circle wallets for users?

**A:** **NO** - Bridge Kit works with existing MetaMask wallets via Viem/Ethers adapters.

**Circle Wallets are optional** - only use if you want:
- Programmable wallet infrastructure
- Social login/recovery
- Developer-controlled wallets

For CubePay with MetaMask → Keep MetaMask, no Circle wallet needed.

### Q4: Are there two options: CCTP + Bridge OR Arc?

**A:** **One integrated stack** - they work together:

```
Bridge Kit = SDK (what you code with)
CCTP = Protocol (burn/mint mechanism)
Arc = Settlement hub (where transactions finalize)

You use: Bridge Kit + Arc together
Result: Replaces Chainlink CCIP completely
```

### Q5: Can we get rid of Chainlink CCIP?

**A:** **YES** - Bridge Kit + Arc replaces Chainlink CCIP for USDC transfers.

**Fun fact:** Chainlink CCIP actually uses Circle's CCTP under the hood for USDC, so you're cutting out the middleman.

**Comparison:**

| Feature | Chainlink CCIP | Bridge Kit + Arc |
|---------|---------------|------------------|
| Asset support | Multiple tokens | USDC-optimized |
| Cost | Oracle fees | Lower (native) |
| Speed | Variable | <2 seconds via Arc |
| Integration | Simple SDK | Simple SDK |
| Settlement | Multi-hop | Arc hub (instant) |

---

## Architecture Overview

### Current CubePay Flow (Chainlink CCIP)

```
┌─────────────────┐
│  User           │
│  MetaMask       │
│  (Ethereum)     │
└────────┬────────┘
         │
         │ Chainlink CCIP
         │ (multi-hop, variable time)
         │
         ↓
┌─────────────────┐
│  Merchant       │
│  MetaMask       │
│  (Base)         │
└─────────────────┘
```

### New CubePay Flow (Bridge Kit + Arc)

```
┌─────────────────┐
│  User           │
│  MetaMask       │
│  (Ethereum)     │
└────────┬────────┘
         │
         │ Bridge Kit (CCTP burn)
         ↓
┌─────────────────────────────┐
│     Arc Blockchain          │
│   (Liquidity Hub)           │ ← Key differentiator!
│   Settlement: <350ms        │
│   USDC gas: predictable     │
└────────┬────────────────────┘
         │
         │ Bridge Kit (CCTP mint)
         ↓
┌─────────────────┐
│  Merchant       │
│  MetaMask       │
│  (Base)         │
└─────────────────┘

Total time: ~1-2 seconds
```

### Architecture Diagram (for submission)

```
┌──────────────────────────────────────────────────────────┐
│                  CubePay AR Terminal                      │
│              (Web App + AR Interface)                     │
└───────────────────┬──────────────────────────────────────┘
                    │
                    │ User scans QR
                    │ Selects payment amount
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌────────▼────────┐
│  User Wallet   │    │ Merchant Wallet │
│  (MetaMask)    │    │  (MetaMask)     │
│  Any EVM Chain │    │  Any EVM Chain  │
└───────┬────────┘    └────────▲────────┘
        │                      │
        │ Bridge Kit           │ Bridge Kit
        │ (CCTP burn)          │ (CCTP mint)
        │                      │
        └──────────┬───────────┘
                   │
         ┌─────────▼──────────┐
         │  Arc Blockchain    │ ← Liquidity Hub
         │  (Settlement)      │   (Show this clearly!)
         │                    │
         │  Features:         │
         │  • <350ms finality │
         │  • USDC gas        │
         │  • Unified balance │
         └────────────────────┘

Benefits:
✓ User doesn't care which chain merchant uses
✓ Merchant receives USDC on preferred chain
✓ Sub-second settlement via Arc
✓ No liquidity fragmentation
```

---

## Technical Implementation

### Step 1: Install Dependencies

```bash
npm install @circle-fin/bridge-kit viem
```

### Step 2: Basic Bridge Kit Setup

```typescript
import { BridgeKit } from '@circle-fin/bridge-kit';
import { createWalletClient, custom } from 'viem';
import { mainnet, base, arbitrum, optimism } from 'viem/chains';

// Arc chain config (add to your chain list)
const arcChain = {
  id: 888888,
  name: 'Arc',
  network: 'arc',
  nativeCurrency: {
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.arc.network'] },
    public: { http: ['https://rpc.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://explorer.arc.network' },
  },
};

// Initialize Bridge Kit
const bridgeKit = new BridgeKit({
  // Configuration here
});
```

### Step 3: Create Payment Function (Two-Hop via Arc)

```typescript
interface PaymentParams {
  userAddress: string;
  merchantAddress: string;
  amount: string;
  sourceChain: string;
  destinationChain: string;
}

interface PaymentResult {
  success: boolean;
  arcTxHash: string;
  finalTxHash: string;
  arcExplorerUrl: string;
  destExplorerUrl: string;
  totalTime: number;
}

async function processCrossChainPayment(
  params: PaymentParams
): Promise<PaymentResult> {
  const startTime = Date.now();
  
  try {
    // Step 1: User chain → Arc (settlement)
    console.log(`Bridging ${params.amount} USDC from ${params.sourceChain} to Arc...`);
    
    const toArcTx = await bridgeKit.bridge({
      from: {
        adapter: viemAdapter,
        chain: params.sourceChain,
        address: params.userAddress,
      },
      to: {
        adapter: viemAdapter,
        chain: "Arc",
        address: params.merchantAddress,
      },
      amount: params.amount,
    });

    console.log(`Arc settlement complete: ${toArcTx.txHash}`);
    
    // Step 2: Arc → Merchant's destination chain
    console.log(`Bridging from Arc to ${params.destinationChain}...`);
    
    const toDestTx = await bridgeKit.bridge({
      from: {
        adapter: viemAdapter,
        chain: "Arc",
        address: params.merchantAddress,
      },
      to: {
        adapter: viemAdapter,
        chain: params.destinationChain,
        address: params.merchantAddress,
      },
      amount: params.amount,
    });

    console.log(`Final transfer complete: ${toDestTx.txHash}`);
    
    const totalTime = Date.now() - startTime;
    
    return {
      success: true,
      arcTxHash: toArcTx.txHash,
      finalTxHash: toDestTx.txHash,
      arcExplorerUrl: `https://explorer.arc.network/tx/${toArcTx.txHash}`,
      destExplorerUrl: getExplorerUrl(params.destinationChain, toDestTx.txHash),
      totalTime,
    };
    
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}

function getExplorerUrl(chain: string, txHash: string): string {
  const explorers: Record<string, string> = {
    Ethereum: 'https://etherscan.io',
    Base: 'https://basescan.org',
    Arbitrum: 'https://arbiscan.io',
    Optimism: 'https://optimistic.etherscan.io',
    Polygon: 'https://polygonscan.com',
  };
  return `${explorers[chain]}/tx/${txHash}`;
}
```

### Step 4: React Component Integration

```typescript
import { useState } from 'react';

interface PaymentFormProps {
  merchantAddress: string;
  merchantChain: string;
}

function CubePayPaymentForm({ merchantAddress, merchantChain }: PaymentFormProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  
  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      const userAddress = accounts[0];
      
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      const sourceChain = getChainName(chainId);
      
      const paymentResult = await processCrossChainPayment({
        userAddress,
        merchantAddress,
        amount,
        sourceChain,
        destinationChain: merchantChain,
      });
      
      setResult(paymentResult);
      showARSuccessAnimation(paymentResult);
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="payment-form">
      <h3>Pay with USDC (Any Chain)</h3>
      
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (USDC)"
        disabled={loading}
      />
      
      <button 
        onClick={handlePayment}
        disabled={loading || !amount}
      >
        {loading ? 'Processing via Arc...' : 'Pay Now'}
      </button>
      
      {result && (
        <div className="payment-success">
          <h4>✅ Payment Successful!</h4>
          <p>Settled via Arc in {result.totalTime}ms</p>
          <a href={result.arcExplorerUrl} target="_blank" rel="noopener">
            View Arc Settlement
          </a>
          <a href={result.destExplorerUrl} target="_blank" rel="noopener">
            View Final Transfer
          </a>
        </div>
      )}
    </div>
  );
}

function getChainName(chainId: string): string {
  const chains: Record<string, string> = {
    '0x1': 'Ethereum',
    '0x2105': 'Base',
    '0xa4b1': 'Arbitrum',
    '0xa': 'Optimism',
    '0x89': 'Polygon',
  };
  return chains[chainId] || 'Unknown';
}
```

---

## Migration from Chainlink CCIP

### Before (Chainlink CCIP)

```typescript
import { CCIPRouter } from '@chainlink/ccip';

const router = new CCIPRouter(routerAddress);

await router.ccipSend(
  destinationChainSelector,
  {
    receiver: merchantAddress,
    data: '0x',
    tokenAmounts: [{
      token: usdcAddress,
      amount: ethers.utils.parseUnits(amount, 6),
    }],
    feeToken: linkToken,
    extraArgs: '0x',
  },
  { value: fees }
);
```

### After (Bridge Kit + Arc)

```typescript
import { BridgeKit } from '@circle-fin/bridge-kit';

const bridgeKit = new BridgeKit();

// Hop 1: To Arc
await bridgeKit.bridge({
  from: { adapter: viemAdapter, chain: sourceChain },
  to: { adapter: viemAdapter, chain: "Arc" },
  amount: amount,
});

// Hop 2: From Arc to destination
await bridgeKit.bridge({
  from: { adapter: viemAdapter, chain: "Arc" },
  to: { adapter: viemAdapter, chain: destChain },
  amount: amount,
});
```

### Migration Checklist

- [ ] Remove Chainlink CCIP dependencies
- [ ] Install Bridge Kit SDK
- [ ] Update payment logic to use two-hop Arc flow
- [ ] Replace Chainlink router with Bridge Kit
- [ ] Update UI to show Arc settlement step
- [ ] Add Arc explorer links
- [ ] Test on Arc testnet
- [ ] Update documentation

---

## Qualification Checklist

### Required Deliverables

- [ ] **Functional MVP**
  - [ ] Frontend: CubePay AR terminal interface
  - [ ] Backend: Bridge Kit integration with Arc
  - [ ] Working crosschain payment flow

- [ ] **Architecture Diagram**
  - [ ] Show Arc as liquidity hub
  - [ ] Display Source Chain → Arc → Dest Chain flow

- [ ] **Video Demonstration**
  - [ ] Show AR terminal in action
  - [ ] Demo crosschain payment (different source/dest chains)
  - [ ] Show Arc block explorer transaction

- [ ] **Documentation**
  - [ ] How Arc enables chain abstraction
  - [ ] Why Arc as liquidity hub
  - [ ] Benefits: speed, unified liquidity, predictable fees

- [ ] **Product Feedback for Circle**
  - [ ] Bridge Kit ease of use
  - [ ] Arc testnet experience
  - [ ] Suggested improvements

- [ ] **GitHub/Replit Repo**
  - [ ] Public repository
  - [ ] Clear README
  - [ ] Code comments

---

## Quick Start Guide

### 1. Create Circle Developer Account

```
https://console.circle.com/signup
```

### 2. Get Arc Testnet USDC

```
https://faucet.circle.com/
```

### 3. Install Bridge Kit

```bash
npm install @circle-fin/bridge-kit viem
```

### 4. Configure Arc Network in MetaMask

- Network Name: Arc Testnet
- RPC URL: https://testnet-rpc.arc.network
- Chain ID: 888888
- Currency Symbol: USDC
- Block Explorer: https://testnet-explorer.arc.network

### 5. Test Simple Transfer

```typescript
import { BridgeKit } from '@circle-fin/bridge-kit';

const kit = new BridgeKit();

const result = await kit.bridge({
  from: { adapter: viemAdapter, chain: "Ethereum Sepolia" },
  to: { adapter: viemAdapter, chain: "Arc Testnet" },
  amount: "10.00",
});

console.log('Arc TX:', result.txHash);
```

### 6. Integrate into CubePay

Replace Chainlink CCIP calls with Bridge Kit + Arc two-hop flow.

### 7. Join Community for Support

```
https://community.arc.network/home
```

---

## Resources

### Official Documentation

- **Arc Docs:** https://docs.arc.network/arc/concepts/welcome-to-arc
- **Bridge Kit Docs:** https://developers.circle.com/bridge-kit
- **Circle Gateway Docs:** https://developers.circle.com/gateway
- **Circle Wallets Docs:** https://developers.circle.com/wallets

### Developer Tools

- **Circle Console:** https://console.circle.com
- **Arc Testnet Faucet:** https://faucet.circle.com
- **Arc Block Explorer:** https://explorer.arc.network
- **Arc Community:** https://community.arc.network

---

## Key Takeaways

### What Arc Does for CubePay

1. **Unifies Liquidity** - Single settlement layer across all EVM chains
2. **Sub-Second Finality** - <350ms settlement on Arc
3. **Predictable Fees** - USDC-denominated gas
4. **Chain Abstraction** - User/merchant don't care about chains

### What You Need to Do

1. ✅ Use Arc as **settlement hub** (not just another chain)
2. ✅ Route all payments: Source → Arc → Destination
3. ✅ Keep MetaMask wallets (no Circle wallets required)
4. ✅ Use Bridge Kit SDK (replaces Chainlink CCIP)
5. ✅ Show Arc transactions in demo/video

---

**Good luck with HackMoney 2026! 🚀**
