# AgentSphere Blockchain & Cryptocurrency Protocols

_A comprehensive documentation of all blockchain networks, cryptocurrencies, protocols, and integrations used in the AgentSphere project._

---

## 🌐 BLOCKCHAIN NETWORKS

### EVM-Compatible Testnets:

1. **Ethereum Sepolia** (Chain ID: 11155111)
2. **Arbitrum Sepolia** (Chain ID: 421614)
3. **Base Sepolia** (Chain ID: 84532)
4. **Optimism Sepolia** (Chain ID: 11155420)
5. **Avalanche Fuji** (Chain ID: 43113)
6. **Polygon Amoy** (Chain ID: 80002)

### Non-EVM Networks:

7. **Hedera Testnet** (Chain ID: 296)
8. **Solana Devnet** (Chain ID: "devnet")
9. **Solana Testnet**
10. **Solana Mainnet** (Chain ID: "mainnet-beta")

---

## 💰 CRYPTOCURRENCIES & TOKENS

### Standard Stablecoins:

1. **USDC** - USD Coin (primary stablecoin across all EVM chains)
2. **USDT** - Tether USD
3. **DAI** - MakerDAO stablecoin

### Hedera Custom Stablecoins:

4. **USDh** - Primary Hedera stablecoin (Token ID: 0.0.7218375)
5. **USDΔ** - Delta variant stablecoin
6. **USDaix** - AIX variant stablecoin
7. **USDΔ+** - Delta plus stablecoin
8. **USDaix+** - AIX plus stablecoin
9. **USDar** - AR variant stablecoin
10. **USDair** - Air variant stablecoin

### Native Cryptocurrencies:

11. **ETH** - Ethereum (on all EVM testnets)
12. **HBAR** - Hedera native cryptocurrency
13. **SOL** - Solana native cryptocurrency

### Solana SPL Tokens:

14. **USDC (Solana Devnet)** - Mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
15. **USDC (Solana Mainnet)** - Mint: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

---

## 🔗 BLOCKCHAIN PROTOCOLS & INFRASTRUCTURE

### Cross-Chain Protocols:

1. **Chainlink CCIP** - Cross-Chain Interoperability Protocol
   - Chain selectors for cross-chain routing
   - CCIP routers on each supported network
   - Cross-chain payment lanes

### DeFi Protocols:

2. **ThirdWeb** - Web3 development platform
   - Multi-chain wallet connections
   - Contract interactions
   - SDK integration

### Oracle Networks:

3. **Chainlink** - Decentralized oracle network (implied through CCIP)

---

## 🏗️ BLOCKCHAIN STANDARDS & PROTOCOLS

### Token Standards:

1. **ERC-20** - Fungible tokens (all stablecoins)
2. **SPL Token** - Solana Program Library tokens
3. **HTS** - Hedera Token Service

### Identity Standards:

4. **ERC-8004** - Agent Identity NFT standard
   - Contract deployed on Hedera: `0.0.7299955`
   - EVM address: `0x91465109a685abc19ecc94474c0f24bb05045d37`

### Communication Protocols:

5. **A2A Protocol** - Agent-to-Agent communication
6. **x402 Protocol** - Micropayment protocol for API access
7. **MCP (Model Context Protocol)** - AI agent context management

---

## 💳 PAYMENT PROCESSING PROTOCOLS

### Traditional Finance Integration:

1. **Revolut Merchant API** - Bank payments and virtual cards
2. **Apple Pay** - Mobile payments (via Revolut)
3. **Google Pay** - Mobile payments (via Revolut)

### Crypto Payment Methods:

4. **QR Code Payments** - Cryptocurrency QR generation
5. **Voice Pay** - Voice-activated crypto payments
6. **Sound Pay** - Audio-based payment triggers

---

## 📊 SPECIFIC TOKEN ADDRESSES

### USDC Contract Addresses by Network:

```typescript
const USDC_CONTRACTS = {
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Ethereum Sepolia
  421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
  11155420: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7", // OP Sepolia
  43113: "0x5425890298aed601595a70AB815c96711a31Bc65", // Avalanche Fuji
  80002: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582", // Polygon Amoy
  devnet: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Solana Devnet USDC
};
```

### Hedera Token IDs:

```yaml
USDh_Primary: "0.0.7218375"
ERC8004_Contract: "0.0.7299955"
Treasury_Account: "0.0.7145005"
```

### Deployed Agent Accounts (Hedera Testnet):

```yaml
Travel_Coordinator: "0.0.7301232"
Bus_Agent: "0.0.7299550"
Train_Agent: "0.0.7300963"
Hotel_Agent: "0.0.7300950"
```

---

## 🛠️ DEVELOPMENT & INTEGRATION TOOLS

### Blockchain SDKs:

1. **@hashgraph/sdk** (v2.77.0) - Official Hedera SDK
2. **@hashgraph/stablecoin-npm-sdk** (v2.1.5) - Hedera stablecoin management
3. **@solana/web3.js** (v1.98.4) - Solana blockchain interaction
4. **@solana/spl-token** (v0.4.14) - Solana token operations
5. **@thirdweb-dev/sdk** (v4.0.98) - ThirdWeb development kit
6. **@thirdweb-dev/react** (v4.1.10) - ThirdWeb React hooks
7. **@thirdweb-dev/chains** (v0.1.120) - Network configurations

### Wallet Integration:

8. **Web3Modal** (v1.9.12) - Multi-wallet connection interface
9. **MetaMask** - EVM wallet integration
10. **Phantom Wallet** - Solana wallet integration
11. **Coinbase Wallet** - Multi-chain wallet support

### Payment Processing:

12. **ethereum-qr-code** (v0.3.0) - QR code generation for payments
13. **qrcode** (v1.5.4) - General QR code generation

---

## 🔐 SECURITY & IDENTITY

### Blockchain Identity:

1. **DID (Decentralized Identifiers)** - Format: `did:hedera:testnet:0.0.xxxxxxx`
2. **Agent Identity NFTs** - ERC-8004 standard on Hedera
3. **Wallet-based Authentication** - Multi-chain wallet login
4. **Row Level Security (RLS)** - Database-level access control via Supabase

---

## 📈 DEFI & YIELD FEATURES

### DeFi Capabilities:

1. **Staking Rewards** - Built into agent configuration
2. **Yield Generation** - Agent monetization features
3. **Revenue Sharing** - 70/30 split between agent owners and platform
4. **Dynamic Fee System** - Payment terminals vs regular agents
5. **Cross-Chain Arbitrage** - Multi-network deployment opportunities

---

## 🌟 UNIQUE PROJECT INNOVATIONS

### Custom Protocols Developed:

1. **6-Faced Payment Cube System** - Multi-modal payment interface
   - Crypto QR, Bank QR, Virtual Card, Voice Pay, Sound Pay, Onboard Crypto
2. **Dynamic vs Fixed Fee System** - Payment terminal vs regular agent pricing
3. **Multi-Chain Agent Deployment** - Single agent deployed across multiple networks
4. **AR-Blockchain Integration** - Location-based blockchain agents
5. **Travel Agent Orchestration** - Multi-agent coordination using A2A protocol
6. **x402 Micropayments** - Pay-per-use API access for external data services
7. **Real-time Blockchain Sync** - AR viewer updates via Supabase real-time subscriptions

---

## 🌍 SUPPORTED REGIONS & CURRENCIES

### Fiat Currency Support (via Revolut):

- **USD** - US Dollar (primary)
- **EUR** - Euro (fallback)
- **GBP** - British Pound
- **Additional regional currencies** via Revolut's network

### Regional Support:

- **EU** - European Union
- **UK** - United Kingdom
- **US** - United States
- **Additional regions** via Revolut merchant network

---

## 📡 EXTERNAL API INTEGRATIONS

### MCP Server Integrations:

1. **Nexus API** - `https://nexus.thirdweb.com/api`
2. **Flightradar24** - `https://nexus.thirdweb.com/routes/dck8b9de`
3. **Timetable APIs** - x402-protected transport data
4. **Hotel Booking APIs** - x402-protected accommodation data
5. **Restaurant APIs** - Location-based dining services

---

## 🎯 PROTOCOL INTEGRATION SUMMARY

This represents one of the most comprehensive multi-chain, multi-protocol cryptocurrency integrations, spanning:

- **10 blockchain networks** (6 EVM testnets + Hedera + 3 Solana environments)
- **15+ cryptocurrencies** (3 standard stablecoins + 7 custom Hedera stablecoins + 3 native tokens + SPL tokens)
- **Custom protocols** (A2A, x402, ERC-8004, MCP)
- **Cross-chain infrastructure** (Chainlink CCIP)
- **Traditional finance bridge** (Revolut integration)
- **Innovative payment methods** (6-faced payment cube)
- **AR/location-based deployment** (real-world blockchain anchoring)

All integrated into a cohesive ecosystem that enables agent-to-agent communication, multi-chain deployment, dynamic fee structures, and real-time blockchain synchronization with AR capabilities.

---

_This documentation should be updated as new protocols, tokens, or blockchain networks are added to the AgentSphere ecosystem._
