# AgentSphere - Full Web Management Platform

## 🌟 **Comprehensive AR/QR Code Deployment Platform**

AgentSphere is a cutting-edge platform for deploying and managing AI agents through augmented reality and QR code technology with full blockchain integration.

### 🚀 **Current Repository: Full Web Management System**

**Complete AgentSphere Implementation**

- Full-stack web application with React + TypeScript
- Supabase database integration for real-time data
- AR/QR code generation and management
- Blockchain integration with ThirdWeb
- Interactive map visualization and agent deployment

## 🎯 **Current Setup Status**

### **✅ Environment Configuration Complete:**

- Supabase database connection established
- ThirdWeb blockchain integration configured
- Assembly AI API integration ready
- Development environment fully operational

### **✅ Core Features Implemented:**

- Real-time database connectivity testing
- AR/QR code generation capabilities
- Interactive map visualization
- Agent deployment system
- Blockchain payment integration

### **✅ Database Schema:**

- Complete `deployed_objects` table with advanced features
- Support for trailing agents and interaction ranges
- Multi-blockchain network compatibility
- Location-based services and AR notifications

## 🎉 **First Production Agent Deployed!**

### **🚌 Hedera AI Bus 2 - Production Identity NFT**

**Agent Details:**

- **Name:** Hedera AI Bus 2
- **Type:** AI Bus Agent
- **Hedera Account:** `0.0.7299550`
- **DID:** `did:hedera:testnet:0.0.7299550`
- **Agent Wallet (EVM):** `0x0000000000000000000000000000000007299550`
- **Network:** Hedera Testnet

**Identity NFT (AID Token):**

- **Contract:** `0x91465109a685abc19ecc94474c0f24bb05045d37` (Hedera: 0.0.7299955)
- **Token Standard:** ERC-8004 (Identity Registry)
- **Token Symbol:** AID (AgentIdentity)
- **Minting Transaction:** `0x13ef328ce59d2be1c69388a8ec2fe02f53ad0d4a01557c7a54b7204b5ef0fd70`
- **Minted By:** `0x97b83759eadb2503a8947e8d6eb734795cdefc95` (Treasury Wallet)

**NFT Metadata (12 On-Chain Fields):**

```json
{
  "name": "AI Bus Identity",
  "description": "Verified agent identity for Hedera AI Bus 2. DID: did:hedera:testnet:0.0.7299550. x402 micropayments enabled. Fee: 1000 USDH (static).",
  "attributes": [
    { "trait_type": "Agent Type", "value": "AI Bus" },
    { "trait_type": "Network", "value": "Hedera Testnet" },
    { "trait_type": "Hedera Account", "value": "0.0.7299550" },
    { "trait_type": "DID", "value": "did:hedera:testnet:0.0.7299550" },
    { "trait_type": "Interaction Fee", "value": "1000 USDH" },
    { "trait_type": "Fee Type", "value": "static" },
    { "trait_type": "Fee Currency", "value": "USDH" },
    { "trait_type": "x402 Enabled", "value": "Yes" },
    {
      "trait_type": "Agent Wallet (EVM)",
      "value": "0x0000000000000000000000000000000007299550"
    },
    {
      "trait_type": "Deployer Wallet (EVM)",
      "value": "0x97b83759eadb2503a8947e8d6eb734795cdefc95"
    },
    { "trait_type": "Deployment Date", "value": "2025-11-21T12:14:49.317Z" },
    { "trait_type": "Verification Status", "value": "Verified" }
  ]
}
```

**Pricing & Features:**

- **Interaction Fee:** 1000 USDH (static)
- **Fee Currency:** USDH (Hedera USD stablecoin)
- **x402 Protocol:** ✅ Enabled (micropayment protocol)
- **A2A Communication:** ✅ Supported (agent-to-agent)

**On-Chain Verification:**

- **View Agent:** [HashScan - Account 0.0.7299550](https://hashscan.io/testnet/account/0.0.7299550)
- **View Identity Contract:** [HashScan - Contract 0.0.7299955](https://hashscan.io/testnet/contract/0x91465109a685abc19ecc94474c0f24bb05045d37)
- **View Transaction:** [HashScan - Mint TX](https://hashscan.io/testnet/transaction/0x13ef328ce59d2be1c69388a8ec2fe02f53ad0d4a01557c7a54b7204b5ef0fd70)

**Metadata Storage:**

- **On-Chain:** 12 critical identity fields stored in IdentityRegistry contract
- **Off-Chain:** Complete JSON metadata with unlimited attributes
- **Format:** ERC-8004 compliant with OpenSea compatibility

## 🚀 **Quick Start Guide**

### **Prerequisites:**

- Node.js 18+ and npm
- Git
- Modern web browser with WebRTC support

### **Installation & Setup:**

1. **Clone and Navigate:**

   ```bash
   git clone https://github.com/petrkrulis2022/agentsphere-full-web-man-US.git
   cd agentsphere-full-web-man-US
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**
   The `.env` file is already configured with:

   ```env
   VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
   VITE_SUPABASE_ANON_KEY=[configured]
   VITE_THIRDWEB_CLIENT_ID=[configured]
   VITE_THIRDWEB_SECRET_KEY=[configured]
   ASSEBLY-AI-API-KEY=[configured]
   ```

4. **Start Development Server:**

   ```bash
   npm run dev
   ```

5. **Access Application:**
   Open `http://localhost:5175` in your browser

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    AgentSphere                              │
│                   Complete Ecosystem                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────────────┐
        │              Three Repositories                     │
        └─────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │    Main     │  │ NEAR+Filecoin   │  │   AR Viewer     │
    │ Repository  │  │  +USDC Integr.  │  │   Repository    │
    │             │  │                 │  │                 │
    │ • Landing   │  │ • NEAR Smart    │  │ • AR Camera     │
    │ • Landing   │  │ • Smart         │  │ • AR Camera     │
    │ • UI/UX     │  │   Contracts     │  │ • WebXR         │
    │ • Auth      │  │ • Filecoin      │  │ • A-Frame       │
    │ • Hub       │  │ • IPFS Storage  │  │ • GPS/Location  │
    │             │  │ • USDC Payments │  │ • Agent Render  │
    └─────────────┘  └─────────────────┘  └─────────────────┘
```

## 🛠️ **Technology Stack**

### **Frontend (Main Repo):**

- React + TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- Vite

### **Blockchain (Blockchain+Storage+Payment Repo):**

- Blockchain Protocol SDK
- Filecoin/IPFS integration
- USDC smart contracts
- Web3 wallet connections
- Supabase database

### **AR Viewer (AR Repo):**

- A-Frame WebXR
- Three.js
- WebRTC camera access
- GPS/location APIs
- Real-time rendering

## 🚀 **Getting Started**

### **1. Clone All Repositories:**

```bash
# Main repository
git clone https://github.com/BeerSlothAgent/Agent-Sphere-1.git

# Blockchain + Storage + Payment integrations
git clone https://github.com/BeerSlothAgent/geospatila-agent-near-shade-integrations.git

# AR Viewer
git clone https://github.com/BeerSlothAgent/geospatial-agent-ar-viewer.git
```

### **2. Setup Main Repository:**

```bash
cd Agent-Sphere-1
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### **3. Setup Blockchain Integrations:**

```bash
cd geospatila-agent-near-shade-integrations
npm install
# Follow repository-specific setup instructions
```

### **4. Setup AR Viewer:**

```bash
cd geospatial-agent-ar-viewer
npm install
# Follow repository-specific setup instructions
```

## 🌐 **Environment Variables**

### **Main Repository (.env):**

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_id
```

### **Additional Configuration:**

- See individual repository README files for specific setup instructions
- Each repository has its own environment configuration
- Cross-repository communication is handled via APIs and shared protocols

## 🎯 **Key Features**

### **🔗 Blockchain Integration:**

- Smart contract deployment for agents
- Wallet connectivity
- Decentralized agent ownership
- Blockchain-based payment processing

### **📁 Filecoin/IPFS Storage:**

- Agent metadata storage on IPFS
- Long-term preservation via Filecoin
- Decentralized content addressing
- Immutable agent data

### **💰 USDC Payment System:**

- Stable coin payments
- Cross-chain compatibility
- Instant settlement
- Low transaction fees

### **👁️ Augmented Reality:**

- Real-time AR agent visualization
- Camera-based interaction
- GPS-accurate positioning
- WebXR compatibility

## 🏆 **Blockchain Innovation**

This project demonstrates:

- ✅ **Deep blockchain integration**
- ✅ **Innovative use of Filecoin/IPFS**
- ✅ **Real-world utility and adoption potential**
- ✅ **Professional development practices**
- ✅ **Comprehensive documentation**
- ✅ **Live working demos**

## 🤝 **Contributing**

Each repository accepts contributions:

1. Fork the specific repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
5. Follow repository-specific contribution guidelines

## 📄 **License**

MIT License - See individual repositories for specific license terms.

## 🔗 **Links**

- **Main Repository:** [Agent-Sphere-1](https://github.com/BeerSlothAgent/Agent-Sphere-1)
- **Blockchain+Storage+Payment:** [geospatila-agent-near-shade-integrations](https://github.com/BeerSlothAgent/geospatila-agent-near-shade-integrations)
- **AR Viewer:** [geospatial-agent-ar-viewer](https://github.com/BeerSlothAgent/geospatial-agent-ar-viewer)
- **Presentation** https://agentsphere-0xa1tku.gamma.site/
- **Main AgentSPher** https://playful-cranachan-e941e5.netlify.app/
- **Live AR Demo:** [https://admirable-hamster-b9c370.netlify.app/](https://admirable-hamster-b9c370.netlify.app/)
- ***

  **Built with Blockchain Innovation** 🚀
  **Powered by Blockchain + Filecoin + USDC** 💎
