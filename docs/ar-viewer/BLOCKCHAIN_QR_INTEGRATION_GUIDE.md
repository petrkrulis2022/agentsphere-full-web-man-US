# Blockchain QR Code Integration Guide

## 📋 Overview

This document serves as a comprehensive knowledge base for integrating blockchain QR code payments into the AR Viewer system. It covers common issues, solutions, and best practices learned from implementing multiple blockchain networks.

## 🏗️ Architecture Overview

### Current Implementation

- **BlockDAG Primordial Testnet** - USBDG+ token payments (EIP-681)
- **Solana Testnet** - SOL payments (Solana Pay standard)
- **Morph Holesky Testnet** - USDT payments (EIP-681)

### File Structure

```
src/
├── config/
│   ├── blockdag-chain.js          # BlockDAG network configuration
│   ├── morph-holesky-chain.js     # Morph Holesky configuration
├── services/
│   ├── solanaPaymentService.js    # Solana payment handling
│   ├── morphPaymentService.js     # Morph payment handling
├── components/
│   ├── UnifiedWalletConnect.jsx   # Multi-chain wallet connection
│   ├── EnhancedPaymentQRModal.jsx # Payment QR generation modal
│   ├── MorphWalletConnect.jsx     # Morph-specific wallet component
│   ├── SolanaWalletConnect.jsx    # Solana-specific wallet component
│   └── ThirdWebWalletConnect.jsx  # BlockDAG wallet component
```

## 🎯 Morph Holesky Integration Case Study

### Initial Requirements

- **Network**: Morph Holesky Testnet (Chain ID: 2810)
- **RPC**: rpc-quicknode-holesky.morphl2.io
- **Token**: USDT
- **Contract**: 0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98
- **Amount**: 1 USDT payment
- **Wallet**: MetaMask compatibility

### 🐛 Issues Encountered & Solutions

#### Issue #1: Wrong Recipient Address

**Problem**: QR code was using placeholder address instead of connected wallet

```javascript
// ❌ WRONG - Using placeholder
const defaultRecipient = "0x1234567890123456789012345678901234567890";
const recipient = agent.wallet_address || defaultRecipient;
```

**Solution**: Get connected MetaMask wallet address dynamically

```javascript
// ✅ CORRECT - Get connected wallet
export const getConnectedWalletAddress = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      return accounts[0] || null;
    } catch (error) {
      console.error("Error getting connected wallet:", error);
      return null;
    }
  }
  return null;
};

const connectedWallet = await getConnectedWalletAddress();
const recipient = connectedWallet || agent.wallet_address || defaultRecipient;
```

#### Issue #2: Wrong QR Format - Showing as ETH Transfer

**Problem**: Wallet showed "0 ETH" instead of "1 USDT"

```javascript
// ❌ WRONG - Recipient address first
ethereum:0xd7ca8219c8afa07b455ab7e004fc5381b3727b1e@2810?value=0&contractAddress=0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98&decimal=6&symbol=USDT&amount=1
```

**Solution**: Use proper EIP-681 format with contract address first

```javascript
// ✅ CORRECT - Contract address first for token transfers
ethereum:0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98@2810/transfer?address=0xd7ca8219c8afa07b455ab7e004fc5381b3727b1e&uint256=1000000000000000000
```

#### Issue #3: Wrong Decimal Configuration

**Problem**: Assumed USDT uses 6 decimals, but Morph Holesky USDT uses 18

```javascript
// ❌ WRONG - Standard USDT decimals
decimals: 6, // USDT typically uses 6 decimals
// 1 USDT = 1,000,000 (6 decimals)
```

**Solution**: Check actual contract decimals in wallet/explorer

```javascript
// ✅ CORRECT - Morph Holesky USDT decimals
decimals: 18, // This USDT contract on Morph Holesky uses 18 decimals
// 1 USDT = 1,000,000,000,000,000,000 (18 decimals)
```

### 🎯 Final Working Configuration

#### Network Configuration (`morph-holesky-chain.js`)

```javascript
export const MorphHoleskyTestnet = {
  chainId: 2810,
  name: "Morph Holesky",
  rpc: ["https://rpc-quicknode-holesky.morphl2.io"],
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  explorers: [
    {
      name: "Morph Holesky Explorer",
      url: "https://explorer-holesky.morphl2.io",
    },
  ],
};

export const MorphUSDTToken = {
  address: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
  name: "USDT",
  symbol: "USDT",
  decimals: 18, // ⚠️ IMPORTANT: Verified from wallet - not standard 6!
  chainId: 2810,
};
```

#### QR Generation (`morphPaymentService.js`)

```javascript
export const generateMorphAgentPayment = async (agent, amount = 1) => {
  // Get connected wallet address as recipient
  const connectedWallet = await getConnectedWalletAddress();
  const recipient = connectedWallet || agent.wallet_address || defaultRecipient;

  // Warn if using fallback
  if (!connectedWallet) {
    console.warn("⚠️ No MetaMask wallet connected! Using fallback address.");
  }

  return {
    recipient: recipient,
    amount: amount,
    token: "USDT",
    contractAddress: MorphUSDTToken.address,
    chainId: MorphHoleskyTestnet.chainId,
    decimals: MorphUSDTToken.decimals,
  };
};

export const generateMorphPaymentQRData = (paymentInfo) => {
  const { amount, recipient, contractAddress, chainId } = paymentInfo;

  // Convert to token units using correct decimals
  const amountInTokenUnits = Math.floor(
    amount * Math.pow(10, MorphUSDTToken.decimals)
  );

  // EIP-681 format: contract address first for token transfers
  const uri = `ethereum:${contractAddress}@${chainId}/transfer?address=${recipient}&uint256=${amountInTokenUnits}`;

  return uri;
};
```

## 📝 Best Practices for New Blockchain Integration

### 1. Pre-Integration Research

- [ ] **Verify Network Details**: Chain ID, RPC URL, block explorer
- [ ] **Token Contract Analysis**: Address, decimals, symbol verification
- [ ] **Wallet Compatibility**: Which wallets support the network
- [ ] **QR Standards**: EIP-681 for EVM, Solana Pay for Solana, etc.

### 2. Configuration Files

Create dedicated config file for each blockchain:

```javascript
// src/config/{blockchain-name}-chain.js
export const {BlockchainName}Testnet = {
  chainId: number,
  name: "string",
  rpc: ["url"],
  nativeCurrency: { name, symbol, decimals },
  explorers: [{ name, url }],
};

export const {TokenName}Token = {
  address: "0x...",
  name: "string",
  symbol: "string",
  decimals: number, // ⚠️ VERIFY THIS IN WALLET/EXPLORER!
  chainId: number,
};
```

### 3. Service Layer Implementation

```javascript
// src/services/{blockchain}PaymentService.js

// 1. Get connected wallet address
export const getConnectedWalletAddress = async () => {
  // Implementation specific to wallet type
};

// 2. Generate payment data
export const generate{Blockchain}AgentPayment = async (agent, amount) => {
  const connectedWallet = await getConnectedWalletAddress();
  // Always use connected wallet as recipient
};

// 3. Generate QR data with proper format
export const generate{Blockchain}PaymentQRData = (paymentInfo) => {
  // Use blockchain-specific QR format
};

// 4. Multiple format testing
export const generate{Blockchain}QRFormats = (paymentInfo) => {
  // Generate multiple QR formats for compatibility testing
};
```

### 4. Component Integration

```jsx
// Add to UnifiedWalletConnect.jsx
<TabsTrigger value="{blockchain}">{BlockchainName}</TabsTrigger>
<TabsContent value="{blockchain}">
  <{Blockchain}WalletConnect onConnectionChange={handle{Blockchain}Connection} />
</TabsContent>

// Add to EnhancedPaymentQRModal.jsx
if (network === "{blockchain}") {
  const payment = await {blockchain}PaymentService.generate{Blockchain}AgentPayment(agent, 1);
  const qrData = {blockchain}PaymentService.generate{Blockchain}PaymentQRData(payment);
  // ...
}
```

## 🧪 Testing Methodology

### 1. Console Logging Strategy

```javascript
console.log("🎯 Generating {blockchain} payment:");
console.log("- Connected wallet:", connectedWallet);
console.log("- Recipient address:", recipient);
console.log("- Amount:", amount, token);
console.log("- Contract:", contractAddress);
console.log("- Decimals:", decimals);
console.log("- Amount in token units:", amountInTokenUnits);
console.log("- QR URI:", uri);
```

### 2. Multiple Format Generation

Always generate multiple QR formats for testing:

```javascript
const formats = {
  standard: "standard EIP-681 format",
  alternative: "alternative format for compatibility",
  basic: "simplified format",
  experimental: "experimental format",
};
```

### 3. Wallet Testing Checklist

- [ ] **Correct Network**: Wallet shows right network name
- [ ] **Correct Token**: Shows token symbol (not native currency)
- [ ] **Correct Amount**: Shows human-readable amount
- [ ] **Correct Recipient**: Connected wallet address
- [ ] **Transaction Preview**: Can preview transaction before signing

## ⚠️ Common Pitfalls

### 1. Decimal Mismatches

- **DON'T ASSUME**: Standard token decimals (e.g., USDT = 6)
- **ALWAYS VERIFY**: Check decimals in wallet or block explorer
- **TEST FIRST**: Generate small test transactions

### 2. QR Format Issues

- **Contract First**: For token transfers, put contract address first in URI
- **Recipient First**: For native currency, put recipient first
- **Parameter Names**: Use standard parameter names (address, uint256, value)

### 3. Wallet Integration

- **Connected State**: Always check if wallet is connected
- **Network Switching**: Implement automatic network switching
- **Error Handling**: Graceful fallbacks for connection issues

### 4. Async Operations

- **Payment Generation**: May need to be async for wallet address fetching
- **Component Updates**: Update useEffect to handle async functions
- **Error Boundaries**: Implement proper error handling

## 🔍 Debugging Tools

### 1. QR Code Validators

```javascript
// Test multiple QR formats
const testFormats = generate{Blockchain}QRFormats(paymentInfo);
console.log("📱 Test these formats if main one fails:");
Object.entries(testFormats).forEach(([name, uri]) => {
  console.log(`${name}: ${uri}`);
});
```

### 2. Wallet Connection Checks

```javascript
const checkWalletCompatibility = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    return { compatible: false, reason: "Wallet not detected" };
  }
  // Additional checks...
};
```

### 3. Network Verification

```javascript
const verifyNetwork = async () => {
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  const expectedChainId = `0x${targetChainId.toString(16)}`;
  return chainId === expectedChainId;
};
```

## 📊 Success Metrics

### Integration Complete When:

- [ ] **Wallet Connection**: Can connect to target network
- [ ] **Address Detection**: Uses connected wallet address as recipient
- [ ] **QR Generation**: Creates valid, scannable QR codes
- [ ] **Token Recognition**: Wallet shows correct token and amount
- [ ] **Transaction Preview**: Can preview transaction details
- [ ] **Error Handling**: Graceful error handling and user feedback
- [ ] **Multiple Wallets**: Compatible with multiple wallet types
- [ ] **AR Integration**: QR codes work in AR environment

## 🚀 Future Enhancements

### Planned Features

- **Multi-Token Support**: Support multiple tokens per network
- **Dynamic Pricing**: Real-time token price updates
- **Transaction Monitoring**: Track transaction status
- **Gas Estimation**: Show estimated transaction fees
- **Batch Payments**: Support for multiple recipients
- **Payment History**: Store and display transaction history

### Technical Improvements

- **WebXR Support**: Native AR for compatible devices
- **Performance**: Web Workers for QR generation
- **Caching**: Cache network configurations
- **Testing**: Automated QR format testing
- **Documentation**: Auto-generated API docs

---

## 📝 Version History

- **v1.0** - Initial BlockDAG integration
- **v1.1** - Added Solana support
- **v1.2** - Added Morph Holesky with USDT (18 decimals)
- **v1.3** - Fixed QR format and wallet address issues

---

**Last Updated**: July 30, 2025  
**Status**: ✅ Production Ready  
**Next Integration**: [TBD - Add new blockchain here]
