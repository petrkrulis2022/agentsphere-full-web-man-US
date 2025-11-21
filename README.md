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

## 🎉 **Production Agents Deployed!**

### **1. Travel Agent (Coordinator)**

**My Hedera Travel Agent 1**

- **Hedera Account:** `0.0.7301232`
- **DID:** `did:hedera:testnet:0.0.7301232`
- **Fee:** 625 USDH (Static)
- **Identity NFT Tx:** `0x04beefb4e8d16246e7bef4892d318fdaf75efdefc417771720a9d23766a8ed58`
- **Verification:** [View on HashScan](https://hashscan.io/testnet/account/0.0.7301232)

### **2. AI Bus Agent**

**Hedera AI Bus 2**

- **Hedera Account:** `0.0.7299550`
- **DID:** `did:hedera:testnet:0.0.7299550`
- **Fee:** 1000 USDH
- **Identity NFT Tx:** `0x13ef328ce59d2be1c69388a8ec2fe02f53ad0d4a01557c7a54b7204b5ef0fd70`
- **Verification:** [View on HashScan](https://hashscan.io/testnet/account/0.0.7299550)

### **3. AI Train Agent**

**Hedera Train 1**

- **Hedera Account:** `0.0.7300963`
- **DID:** `did:hedera:testnet:0.0.7300963`
- **Fee:** 1500 USDH
- **Identity NFT Tx:** `0xe698be655a81032a36dfb37198cfafc311cb7a10452d3c988ab42cbce5eb3f93`
- **Verification:** [View on HashScan](https://hashscan.io/testnet/account/0.0.7300963)

### **4. AI Hotel Agent**

**Hedera Hotel Agent 1**

- **Hedera Account:** `0.0.7300950`
- **DID:** `did:hedera:testnet:0.0.7300950`
- **Fee:** 1200 USDH
- **Identity NFT Tx:** `0x6cc9f647253353c7b10fb11c24e55714ff8ebfc5890742f8886808bed7b5173f`
- **Verification:** [View on HashScan](https://hashscan.io/testnet/account/0.0.7300950)

**Identity Registry Contract:** `0x91465109a685abc19ecc94474c0f24bb05045d37` (Hedera: 0.0.7299955)

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
