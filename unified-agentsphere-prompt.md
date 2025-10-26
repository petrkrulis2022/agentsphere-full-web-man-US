# 🚀 **Unified AgentSphere + AR Viewer Application - Complete Build Prompt**

## **Project Overview**

Create a comprehensive React + TypeScript application that combines AgentSphere deployment functionality with AR Viewer capabilities in a single, unified workspace. This will include agent deployment, marketplace browsing, and AR visualization with real wallet integration and QR code payment flows.

## **🎯 Application Architecture**

### **Core Technologies**

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS for responsive design
- **Blockchain**: Thirdweb SDK for wallet integration
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **AR Framework**: A-Frame for AR/VR capabilities
- **QR Codes**: ethereum-qr-code + qrcode libraries
- **Navigation**: React Router DOM for SPA routing

### **Project Structure**

```
unified-agentsphere/
├── src/
│   ├── components/
│   │   ├── shared/           # Shared components
│   │   ├── deployment/       # Agent deployment components
│   │   ├── marketplace/      # Agent marketplace components
│   │   ├── ar-viewer/        # AR viewing components
│   │   └── navigation/       # Navigation components
│   ├── pages/
│   │   ├── Home.tsx         # Landing page with navigation
│   │   ├── Deploy.tsx       # Agent deployment page
│   │   ├── Marketplace.tsx  # Agent marketplace
│   │   └── ARViewer.tsx     # AR viewing interface
│   ├── types/
│   │   ├── agent.ts         # Agent type definitions
│   │   ├── wallet.ts        # Wallet type definitions
│   │   └── database.ts      # Database schema types
│   ├── hooks/
│   │   ├── useSupabase.ts   # Supabase hooks
│   │   ├── useWallet.ts     # Wallet integration hooks
│   │   └── useGeolocation.ts # Location services
│   ├── utils/
│   │   ├── blockchain.ts    # Blockchain utilities
│   │   ├── qr-generation.ts # QR code generation
│   │   └── validation.ts    # Input validation
│   └── styles/
├── supabase/
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge functions
├── public/
└── package.json
```

## **📱 Application Flow & Navigation**

### **Main Navigation Structure**

1. **Landing Page** (`/`) - Hero section with two main CTAs:
   - 📱 "View Agents in AR" → `/ar-viewer`
   - 🚀 "Deploy New Agent" → `/deploy`
2. **Deployment Page** (`/deploy`) - Complete agent deployment form
   - Navigation back to home or marketplace after deployment
3. **Marketplace Page** (`/marketplace`) - Browse all deployed agents
   - Filter by type, location, price
   - Link to AR viewer for each agent
4. **AR Viewer Page** (`/ar-viewer`) - AR visualization
   - Camera view with agent overlays
   - QR code interaction system
   - Link back to marketplace or deploy

### **Cross-Page Integration Points**

- **Phone Icon** on main page → Link to AR Viewer
- **"Deploy Agent" Button** in AR Viewer → Link to deployment page
- **"View in AR" Button** on marketplace agent cards → Link to AR viewer with agent filter
- **Breadcrumb Navigation** for easy back/forward flow

## **🗄️ Database Schema (Supabase)**

### **Complete deployed_objects Table**

```sql
CREATE TABLE deployed_objects (
  -- Core identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Agent details
  agent_name VARCHAR(255) NOT NULL,
  agent_description TEXT,
  object_type VARCHAR(100) NOT NULL, -- Agent category

  -- Location data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  altitude DECIMAL(10, 6) DEFAULT 0,
  location_type VARCHAR(50) DEFAULT 'Street',

  -- Blockchain & Wallet integration
  owner_wallet VARCHAR(42) NOT NULL,
  deployer_wallet_address VARCHAR(42) NOT NULL,
  payment_recipient_address VARCHAR(42) NOT NULL,
  agent_wallet_address VARCHAR(42),
  network VARCHAR(50) DEFAULT 'morph-holesky-testnet',
  chain_id INTEGER DEFAULT 2810,

  -- Token & Payment configuration
  token_symbol VARCHAR(10) DEFAULT 'USDT',
  token_address VARCHAR(42) NOT NULL,
  currency_type VARCHAR(20) DEFAULT 'USDT',
  interaction_fee DECIMAL(10, 2) DEFAULT 1.00,

  -- Agent capabilities
  text_chat BOOLEAN DEFAULT true,
  voice_chat BOOLEAN DEFAULT false,
  video_chat BOOLEAN DEFAULT false,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- MCP Server integrations
  mcp_services JSONB DEFAULT '[]'::JSONB,

  -- AR & Interaction settings
  visibility_range DECIMAL(5, 2) DEFAULT 25.0,
  interaction_range DECIMAL(5, 2) DEFAULT 15.0,
  trailing_agent BOOLEAN DEFAULT false,
  ar_notifications BOOLEAN DEFAULT true,

  -- Revenue tracking
  interaction_count INTEGER DEFAULT 0,
  revenue_total DECIMAL(15, 2) DEFAULT 0,

  -- Constraints
  CONSTRAINT valid_wallet_format CHECK (
    owner_wallet ~ '^0x[a-fA-F0-9]{40}$' AND
    deployer_wallet_address ~ '^0x[a-fA-F0-9]{40}$' AND
    payment_recipient_address ~ '^0x[a-fA-F0-9]{40}$'
  ),
  CONSTRAINT valid_coordinates CHECK (
    latitude BETWEEN -90 AND 90 AND
    longitude BETWEEN -180 AND 180
  ),
  CONSTRAINT valid_ranges CHECK (
    visibility_range BETWEEN 1 AND 100 AND
    interaction_range BETWEEN 1 AND 50
  )
);

-- Indexes for performance
CREATE INDEX idx_deployed_objects_location ON deployed_objects (latitude, longitude);
CREATE INDEX idx_deployed_objects_type ON deployed_objects (object_type);
CREATE INDEX idx_deployed_objects_wallet ON deployed_objects (deployer_wallet_address);
CREATE INDEX idx_deployed_objects_network ON deployed_objects (network, chain_id);
CREATE INDEX idx_deployed_objects_mcp ON deployed_objects USING GIN (mcp_services);
```

### **Supported Agent Types**

```sql
-- Agent type constraint
ALTER TABLE deployed_objects ADD CONSTRAINT valid_agent_types CHECK (
  object_type = ANY (ARRAY[
    'Intelligent Assistant',
    'Local Services',
    'Payment Terminal',
    'Trailing Payment Terminal',
    'My Ghost',
    'Game Agent',
    '3D World Builder',
    'Home Security',
    'Content Creator',
    'Real Estate Broker',
    'Bus Stop Agent'
  ])
);
```

## **🔧 Environment Configuration (.env)**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Thirdweb Configuration (Blockchain)
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
VITE_THIRDWEB_SECRET_KEY=your_thirdweb_secret_key

# Morph Holesky Testnet Configuration
VITE_CHAIN_ID=2810
VITE_CHAIN_NAME=Morph Holesky Testnet
VITE_RPC_URL=https://rpc-quicknode-holesky.morphl2.io
VITE_BLOCK_EXPLORER=https://explorer-holesky.morphl2.io

# Token Addresses (Morph Holesky)
VITE_USDT_ADDRESS=0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98
VITE_USDC_ADDRESS=0x3C9f8A8E1b3f8B9c5D7e2F1a4B6c8D9e1F2a3B4c

# Geolocation Services
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Development Configuration
VITE_APP_NAME=AgentSphere
VITE_APP_VERSION=2.0.0
VITE_ENV=development
```

## **📦 Package.json Dependencies**

```json
{
  "name": "unified-agentsphere",
  "version": "2.0.0",
  "type": "module",
  "dependencies": {
    "@supabase/supabase-js": "^2.53.0",
    "@thirdweb-dev/react": "^4.1.10",
    "@thirdweb-dev/sdk": "^4.0.98",
    "@thirdweb-dev/chains": "^0.1.120",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.30.1",
    "aframe": "^1.4.0",
    "aframe-react": "^4.4.0",
    "ethereum-qr-code": "^0.3.0",
    "qrcode": "^1.5.4",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.294.0",
    "web3modal": "^1.9.12",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "@types/aframe": "^1.2.0",
    "@types/qrcode": "^1.5.5",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.2.2",
    "tailwindcss": "^3.3.5",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

## **🎨 Key Feature Implementation**

### **1. Unified Wallet Integration**

```typescript
// Real wallet connection across both deployment and AR viewing
const useWallet = () => {
  const { address, connect, disconnect } = useAddress();
  const { signer } = useSigner();

  return {
    address,
    connect,
    disconnect,
    isConnected: !!address,
    signer,
  };
};
```

### **2. QR Code Payment Flow**

```typescript
// Generate payment QR codes for agent interactions
const generatePaymentQR = (agent: Agent) => {
  const paymentData = {
    to: agent.deployer_wallet_address,
    value: agent.interaction_fee,
    token: agent.token_address,
    chainId: agent.chain_id,
    agentId: agent.id,
  };

  return QRCode.toDataURL(JSON.stringify(paymentData));
};
```

### **3. Real-time Agent Sync**

```typescript
// Real-time updates between deployment and AR viewer
const useAgentSync = () => {
  const { data: agents } = useSupabaseSubscription("deployed_objects", {
    event: "*",
    schema: "public",
  });

  return agents;
};
```

### **4. AR Integration**

```jsx
// A-Frame AR scene with agent overlays
<Scene vr-mode-ui="enabled: false" arjs="trackingMethod: best;">
  {agents.map((agent) => (
    <Entity
      key={agent.id}
      position={`${agent.longitude} ${agent.altitude} ${agent.latitude}`}
      geometry="primitive: box"
      material={`color: ${getAgentColor(agent.object_type)}`}
      onClick={() => handleAgentInteraction(agent)}
    />
  ))}
</Scene>
```

## **💳 Supported Stablecoins & Networks**

### **Token Configuration**

```typescript
const SUPPORTED_TOKENS = {
  USDT: {
    symbol: "USDT",
    address: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
    decimals: 18,
  },
  USDC: {
    symbol: "USDC",
    address: "0x3C9f8A8E1b3f8B9c5D7e2F1a4B6c8D9e1F2a3B4c",
    decimals: 18,
  },
  // Add more tokens as needed
};

const MORPH_HOLESKY = {
  chainId: 2810,
  name: "Morph Holesky Testnet",
  rpc: "https://rpc-quicknode-holesky.morphl2.io",
  explorer: "https://explorer-holesky.morphl2.io",
};
```

## **🎯 Implementation Priorities**

### **Phase 1: Core Infrastructure**

1. Set up Vite + React + TypeScript project
2. Configure Supabase database and authentication
3. Implement Thirdweb wallet integration
4. Create basic routing structure

### **Phase 2: Agent Deployment**

1. Build comprehensive deployment form
2. Implement real wallet validation
3. Add MCP services selection
4. Create agent type management

### **Phase 3: Marketplace & AR**

1. Build agent marketplace with filtering
2. Implement AR viewer with A-Frame
3. Create QR code payment system
4. Add real-time agent synchronization

### **Phase 4: Advanced Features**

1. Revenue tracking and analytics
2. Advanced AR interactions
3. Multi-token payment support
4. Performance optimization

## **✅ Expected Outcomes**

After implementation, the unified application will provide:

- ✅ **Single Codebase**: No multi-root workspace complexity
- ✅ **Seamless Navigation**: Phone icon → AR viewer, Deploy buttons everywhere
- ✅ **Real Wallet Integration**: No mock addresses, proper validation
- ✅ **QR Payment Flow**: Direct transactions from AR viewer to deployer wallets
- ✅ **Real-time Sync**: Deployed agents immediately available in AR
- ✅ **Comprehensive Agent Types**: 11+ categories with full feature support
- ✅ **Stablecoin Support**: USDT, USDC with proper token contracts
- ✅ **Clean Database**: Fresh schema with all enhancements built-in

## **🚀 Ready to Build**

This comprehensive setup will create a production-ready AgentSphere application that combines deployment and AR viewing in a single, cohesive experience. The unified approach eliminates the complexity of managing separate codebases while providing all the advanced features developed in the current system.

**Use this prompt to create the complete unified AgentSphere + AR Viewer application from scratch!** 🎯
