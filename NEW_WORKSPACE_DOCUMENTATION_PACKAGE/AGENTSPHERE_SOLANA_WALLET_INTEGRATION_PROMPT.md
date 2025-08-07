# Agentsphere Solana Devnet Wallet Integration Prompt

## 🎯 **Objective**

Integrate Solana Devnet wallet connection functionality into the main Agentsphere workspace with SOL and USDC balance display, based on successful implementation from the AR Agent Viewer project.

## 📋 **Context & Requirements**

### **Multi-Root Workspace Setup**

- **Source Project**: `ar-agent-viewer-web-man-US` (current working implementation)
- **Target Project**: Main Agentsphere workspace (part of multi-root workspace)
- **Integration Goal**: Port wallet connection and balance display functionality

### **Proven Implementation Reference**

We have a fully working Solana wallet integration in the AR Agent Viewer with:

- ✅ Phantom/Solflare wallet connection
- ✅ SOL balance display on Solana Testnet
- ✅ USDC balance display on Solana Devnet
- ✅ Real transaction processing capabilities
- ✅ Multi-network support (Testnet/Devnet)
- ✅ Comprehensive error handling and fallbacks

## 🛠 **Implementation Requirements**

### **1. Core Wallet Connection**

```javascript
// Key functionality to implement:
- Solana wallet adapter integration (@solana/wallet-adapter-react)
- Phantom and Solflare wallet support
- Network switching between Testnet and Devnet
- Connection state management
- Wallet disconnection handling
```

### **2. Balance Display System**

```javascript
// Balance monitoring for:
- SOL balance on Solana Testnet/Devnet
- USDC balance on Solana Devnet (mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU)
- Real-time balance updates
- Network-specific balance queries
- Error handling for network issues
```

### **3. Reference Code Patterns**

#### **Wallet Connection Component Pattern:**

```jsx
// Based on: src/components/SolanaWalletConnect.jsx
const SolanaWalletConnect = () => {
  const { connected, connecting, wallet, connect, disconnect } = useWallet();
  const [solBalance, setSolBalance] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [network, setNetwork] = useState("DEVNET");

  // Connection logic
  // Balance fetching
  // Network switching
  // Error handling
};
```

#### **Balance Service Pattern:**

```javascript
// Based on: src/services/solanaPaymentService.js
export const getSolanaBalance = async (publicKey) => {
  // SOL balance fetching logic
};

export const getUSDCBalance = async (walletAddress, network = "DEVNET") => {
  // USDC balance fetching with SPL token support
};

export const switchSolanaNetwork = (networkKey) => {
  // Network switching logic
};
```

#### **Wallet Provider Pattern:**

```jsx
// Integration with existing providers
<SolanaWalletProvider>
  <YourAgentsphereComponents />
</SolanaWalletProvider>
```

## 📦 **Required Dependencies**

### **Package.json Additions:**

```json
{
  "dependencies": {
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.32",
    "@solana/web3.js": "^1.95.3",
    "@solana/spl-token": "^0.4.8"
  }
}
```

### **Buffer Polyfill Configuration:**

```javascript
// Essential for browser compatibility
// Add to vite.config.js or webpack config:
define: {
  global: 'globalThis',
},
resolve: {
  alias: {
    buffer: 'buffer',
  },
},
optimizeDeps: {
  include: ['buffer'],
},
```

## 🎨 **UI/UX Integration**

### **Wallet Connection Button**

- Clean, modern design matching Agentsphere aesthetic
- Connection status indicator (connected/disconnected)
- Wallet type display (Phantom/Solflare)
- Network indicator (Testnet/Devnet)

### **Balance Display Card**

```jsx
// Balance display layout:
┌─────────────────────────────┐
│ 🦄 Phantom Wallet Connected │
│ ─────────────────────────── │
│ SOL Balance: 2.45 SOL       │
│ USDC Balance: 100.00 USDC   │
│ Network: Solana Devnet      │
│ [Disconnect] [Switch Net]   │
└─────────────────────────────┘
```

### **Network Switching**

- Toggle between Solana Testnet and Devnet
- Visual indicator of current network
- Balance updates on network switch

## 🔧 **Implementation Steps**

### **Step 1: Setup Wallet Infrastructure**

1. Install required dependencies
2. Configure Buffer polyfills
3. Create Solana network configurations
4. Setup wallet adapter providers

### **Step 2: Create Wallet Components**

1. `SolanaWalletConnect.jsx` - Main wallet connection component
2. `SolanaBalanceDisplay.jsx` - Balance monitoring component
3. `SolanaNetworkSelector.jsx` - Network switching component

### **Step 3: Implement Services**

1. `solanaWalletService.js` - Wallet connection management
2. `solanaBalanceService.js` - Balance fetching and monitoring
3. `solanaNetworkService.js` - Network configuration and switching

### **Step 4: Integration**

1. Add wallet provider to main app component
2. Integrate wallet button in navigation/header
3. Add balance display to dashboard/profile area
4. Test connection and balance display

## 📁 **File Structure Reference**

```
src/
├── components/
│   ├── SolanaWalletConnect.jsx      # Main wallet connection
│   ├── SolanaBalanceDisplay.jsx     # Balance monitoring
│   └── SolanaNetworkSelector.jsx    # Network switching
├── services/
│   ├── solanaWalletService.js       # Wallet management
│   ├── solanaBalanceService.js      # Balance operations
│   └── solanaNetworkService.js      # Network configuration
├── providers/
│   └── SolanaWalletProvider.jsx     # Wallet context provider
└── config/
    └── solanaNetworks.js            # Network configurations
```

## 💡 **Key Implementation Details**

### **Network Configuration:**

```javascript
const SOLANA_NETWORKS = {
  TESTNET: {
    name: "Solana Testnet",
    rpc: "https://api.testnet.solana.com",
    explorerUrl: "https://explorer.solana.com/?cluster=testnet",
  },
  DEVNET: {
    name: "Solana Devnet",
    rpc: "https://api.devnet.solana.com",
    explorerUrl: "https://explorer.solana.com/?cluster=devnet",
  },
};
```

### **USDC Token Configuration:**

```javascript
const USDC_DEVNET_CONFIG = {
  mintAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  symbol: "USDC",
  decimals: 6,
  name: "USD Coin (Devnet)",
};
```

### **Balance Fetching Logic:**

```javascript
// SOL Balance
const solBalance = await connection.getBalance(new PublicKey(walletAddress));
const solInSol = solBalance / LAMPORTS_PER_SOL;

// USDC Balance (SPL Token)
const associatedTokenAddress = await getAssociatedTokenAddress(
  new PublicKey(USDC_DEVNET_CONFIG.mintAddress),
  new PublicKey(walletAddress)
);
const tokenAccountInfo = await connection.getTokenAccountBalance(
  associatedTokenAddress
);
const usdcBalance = parseFloat(tokenAccountInfo.value.uiAmount || 0);
```

## 🚀 **Success Criteria**

### **Functional Requirements:**

- ✅ Users can connect Phantom/Solflare wallets
- ✅ Real-time SOL balance display
- ✅ Real-time USDC balance display (Devnet)
- ✅ Network switching capability
- ✅ Clean disconnection process
- ✅ Error handling for connection issues

### **Technical Requirements:**

- ✅ No console errors or warnings
- ✅ Responsive design on mobile/desktop
- ✅ Fast balance updates (<2 seconds)
- ✅ Proper loading states
- ✅ Network indicator accuracy

### **User Experience:**

- ✅ Intuitive wallet connection flow
- ✅ Clear balance display
- ✅ Visual connection status
- ✅ Smooth network switching
- ✅ Professional UI integration

## 🔗 **Reference Implementation**

**Source Location:** `/ar-agent-viewer-web-man-US/src/`
**Key Files to Reference:**

- `components/SolanaWalletConnect.jsx`
- `services/solanaPaymentService.js`
- `providers/ThirdWebProvider.jsx` (for provider pattern)
- `main.jsx` (for Buffer polyfill setup)
- `vite.config.js` (for build configuration)

## 🎯 **Expected Outcome**

After implementation, Agentsphere users will have:

1. **Seamless Solana wallet connection** directly in the main workspace
2. **Real-time balance monitoring** for SOL and USDC
3. **Network flexibility** to switch between Testnet and Devnet
4. **Foundation for future features** like payments, NFTs, and DeFi integrations
5. **Professional UX** matching Agentsphere design standards

This integration will position Agentsphere as a comprehensive Web3 development platform with native Solana blockchain support.

---

**Implementation Priority: HIGH** 🔥  
**Estimated Development Time: 4-6 hours**  
**Dependencies: Working knowledge of React, Solana Web3.js**  
**Success Reference: Fully functional in AR Agent Viewer project** ✅
