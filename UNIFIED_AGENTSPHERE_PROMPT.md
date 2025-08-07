# 🚀 **Unified AgentSphere + AR Viewer Application - Complete Build Prompt**

## **Project Overview**

Create a comprehensive React + TypeScript application that combines AgentSphere deployment functionality with AR Viewer capabilities in a single, unified workspace. This will include agent deployment, marketplace browsing, and AR visualization with real wallet integration and QR code payment flows.

## **🎯 Application Architecture**

### **Simplified Single-Network Approach**

This application is designed specifically for **Morph Holesky Testnet** with **USDT-only** payments. This eliminates:

- ❌ Chain selection complexity
- ❌ Multi-token management
- ❌ Network switching logic
- ❌ Database chain/token columns
- ✅ Simple, focused implementation
- ✅ Easy testing and deployment
- ✅ Clean user experience

### **Core Technologies**

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS for responsive design with **futuristic visual theme**
- **Blockchain**: Thirdweb SDK for wallet integration
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **AR Framework**: A-Frame for AR/VR capabilities
- **QR Codes**: ethereum-qr-code + qrcode libraries
- **Navigation**: React Router DOM for SPA routing

### **🎨 Futuristic Visual Design System**

**Color Palette & Theme**:

- **Primary**: Electric Blue (#00BFFF) and Neon Cyan (#00FFFF)
- **Secondary**: Deep Purple (#4B0082) and Magenta (#FF00FF)
- **Accent**: Bright Green (#00FF41) and Orange (#FF6600)
- **Background**: Dark Space (#0A0A0A) with subtle gradients
- **Glass Effects**: Semi-transparent panels with backdrop blur
- **Glow Effects**: Neon outlines and shadow effects on interactive elements

**Visual Style Guidelines**:

- ✨ **Glassmorphism**: Translucent cards with backdrop blur effects
- 🌟 **Neon Accents**: Glowing borders on buttons and interactive elements
- 🔮 **Gradient Backgrounds**: Animated cosmic gradients and particle effects
- ⚡ **Electric Animations**: Smooth transitions with electric/energy themes
- 🚀 **Sci-Fi Typography**: Modern, clean fonts with subtle glow effects
- 💎 **Holographic Elements**: Iridescent effects on key UI components
- 🌌 **Space Theme**: Dark backgrounds with starfield or cosmic patterns

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

  -- Blockchain & Wallet integration (Morph Holesky Only)
  owner_wallet VARCHAR(42) NOT NULL,
  deployer_wallet_address VARCHAR(42) NOT NULL,
  payment_recipient_address VARCHAR(42) NOT NULL,
  agent_wallet_address VARCHAR(42),

  -- Token & Payment configuration (USDT on Morph Holesky Only)
  interaction_fee DECIMAL(10, 2) DEFAULT 1.00, -- Always in USDT

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
VITE_SUPABASE_URL=https://jqajtdtrlujksoxftyvb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxYWp0ZHRybHVqa3NveGZ0eXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTE4NjQsImV4cCI6MjA2OTcyNzg2NH0.nw_1Vo5vr2Tdq2sg4BrfRXdCpNR9G4v-9TvoeijFMRs
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxYWp0ZHRybHVqa3NveGZ0eXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE1MTg2NCwiZXhwIjoyMDY5NzI3ODY0fQ.xzhjNTj38sptUFW01jpnW-QCwQKStfqVY_LDfqDyAr0

# Thirdweb Configuration (Blockchain)
VITE_THIRDWEB_CLIENT_ID=299516306b51bd6356fd8995ed628950
VITE_THIRDWEB_SECRET_KEY=X2Td-JQsUBzfE7f-go2OjauaMsfN3ygzPzBvpz4eHn00ip5mMZQbWaf7UO4yvELtiNpcNQZknD30aoPh656qyA

# Morph Holesky Testnet Configuration (Fixed Network)
VITE_CHAIN_ID=2810
VITE_CHAIN_NAME="Morph Holesky"
VITE_RPC_URL="https://rpc-quicknode-holesky.morphl2.io"
VITE_BLOCK_EXPLORER="https://explorer-holesky.morphl2.io"
VITE_CURRENCY_SYMBOL="ETH"

# USDT Token Address (Morph Holesky - Only Supported Token)
VITE_USDT_ADDRESS="0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98"

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
    "axios": "^1.5.0",
    "three": "^0.158.0",
    "@react-three/fiber": "^8.15.0",
    "particles.js": "^2.0.0"
  },
  "devDependencies": {
    "@types/aframe": "^1.2.0",
    "@types/qrcode": "^1.5.5",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@types/three": "^0.158.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.2.2",
    "tailwindcss": "^3.3.5",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

### **🎨 Tailwind CSS Futuristic Extensions**

```css
/* Custom CSS for futuristic effects */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .glass-panel {
    @apply bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-lg border border-cyan-400/30;
  }

  .neon-text {
    text-shadow: 0 0 10px currentColor, 0 0 20px currentColor,
      0 0 40px currentColor;
  }

  .holographic-border {
    background: linear-gradient(45deg, #00bfff, #ff00ff, #00ff41, #ff6600);
    background-size: 400% 400%;
    animation: gradient-shift 3s ease infinite;
  }

  @keyframes gradient-shift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  .particle-background {
    background: radial-gradient(
        circle at 20% 50%,
        #00bfff22 0%,
        transparent 50%
      ), radial-gradient(circle at 80% 20%, #ff00ff22 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, #00ff4122 0%, transparent 50%), #0a0a0a;
  }
}
```

## **🎨 Key Feature Implementation**

### **1. Futuristic UI Components**

```typescript
// Glassmorphism Button Component with Neon Effects
const FuturisticButton = ({ children, onClick, variant = "primary" }) => {
  const baseClasses =
    "px-6 py-3 rounded-xl backdrop-blur-md transition-all duration-300 transform hover:scale-105 font-semibold text-white shadow-lg border border-opacity-30";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-cyan-400 hover:shadow-cyan-400/50 hover:shadow-xl",
    secondary:
      "bg-gradient-to-r from-purple-500/20 to-magenta-500/20 border-magenta-400 hover:shadow-magenta-400/50 hover:shadow-xl",
    accent:
      "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400 hover:shadow-green-400/50 hover:shadow-xl",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} hover:border-opacity-80`}
      onClick={onClick}
      style={{
        boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
      }}
    >
      {children}
    </button>
  );
};

// Holographic Card Component
const HolographicCard = ({ children, className = "" }) => (
  <div
    className={`
    bg-gradient-to-br from-slate-900/80 to-slate-800/60 
    backdrop-blur-lg rounded-2xl border border-cyan-400/30 
    shadow-2xl hover:shadow-cyan-400/20 transition-all duration-500
    relative overflow-hidden ${className}
  `}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent animate-pulse" />
    <div className="relative z-10 p-6">{children}</div>
  </div>
);
```

### **2. Advanced Wallet Integration with Futuristic UI**

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

// Futuristic Wallet Connection Component
const WalletConnector = () => (
  <HolographicCard className="max-w-md mx-auto">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
        <WalletIcon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
      <p className="text-cyan-300/80">Connect your wallet to deploy agents</p>
      <FuturisticButton variant="primary" onClick={connectWallet}>
        ⚡ Connect Wallet
      </FuturisticButton>
    </div>
  </HolographicCard>
);
```

### **3. Simplified Payment Flow (USDT Only) with Neon QR Codes**

```typescript
// Generate payment QR codes for agent interactions - USDT on Morph Holesky only
const generatePaymentQR = (agent: Agent) => {
  const paymentData = {
    to: agent.deployer_wallet_address,
    value: agent.interaction_fee, // Always in USDT
    token: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98", // Fixed USDT address
    chainId: 2810, // Fixed Morph Holesky chain ID
    network: "Morph Holesky",
    agentId: agent.id,
  };

  return QRCode.toDataURL(JSON.stringify(paymentData));
};

// Futuristic QR Code Display Component
const NeonQRCode = ({ qrData, agent }) => (
  <HolographicCard className="text-center space-y-4">
    <div className="relative inline-block">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-60 animate-pulse" />
      <div className="relative bg-white p-4 rounded-xl">
        <img src={qrData} alt="Payment QR Code" className="w-48 h-48" />
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-white">💳 Pay with USDT</h3>
      <p className="text-cyan-300">Amount: {agent.interaction_fee} USDT</p>
      <p className="text-sm text-gray-400">
        Scan to interact with {agent.agent_name}
      </p>
    </div>
  </HolographicCard>
);
```

### **4. Real-time Agent Sync with Electric Animations**

```typescript
// Real-time updates between deployment and AR viewer
const useAgentSync = () => {
  const { data: agents } = useSupabaseSubscription("deployed_objects", {
    event: "*",
    schema: "public",
  });

  return agents;
};

// Futuristic Agent Status Indicator
const AgentStatusPulse = ({ isOnline }) => (
  <div className="relative">
    <div
      className={`w-3 h-3 rounded-full ${
        isOnline ? "bg-green-400" : "bg-red-400"
      }`}
    />
    {isOnline && (
      <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-60" />
    )}
  </div>
);
```

### **5. Futuristic AR Integration with Cosmic Theme**

```jsx
// A-Frame AR scene with futuristic agent overlays and cosmic effects
<Scene
  vr-mode-ui="enabled: false"
  arjs="trackingMethod: best;"
  background="color: #000011; shader: gradient;"
>
  {/* Cosmic background with stars */}
  <Entity
    geometry="primitive: sphere; radius: 5000"
    material="shader: gradient; topColor: #000033; bottomColor: #000011; side: back"
  />

  {/* Agent representations with futuristic styling */}
  {agents.map((agent) => (
    <Entity
      key={agent.id}
      position={`${agent.longitude} ${agent.altitude} ${agent.latitude}`}
    >
      {/* Holographic agent cube with glow effect */}
      <Entity
        geometry="primitive: box; width: 1; height: 1; depth: 1"
        material={`
          color: ${getAgentColor(agent.object_type)}; 
          shader: standard; 
          emissive: ${getAgentColor(agent.object_type)}; 
          emissiveIntensity: 0.3;
          transparent: true;
          opacity: 0.8
        `}
        animation="property: rotation; to: 0 360 0; loop: true; dur: 10000"
        onClick={() => handleAgentInteraction(agent)}
      />

      {/* Pulsing energy ring around agent */}
      <Entity
        geometry="primitive: ring; radiusInner: 1.2; radiusOuter: 1.5"
        material="color: #00FFFF; shader: standard; emissive: #00FFFF; emissiveIntensity: 0.5; transparent: true; opacity: 0.6"
        rotation="-90 0 0"
        animation="property: scale; to: 1.2 1.2 1.2; dir: alternate; loop: true; dur: 2000"
      />

      {/* Floating holographic text label */}
      <Entity
        text={`value: ${agent.agent_name}; color: #00FFFF; shader: msdf; font: roboto; align: center`}
        position="0 1.5 0"
        look-at="[camera]"
      />
    </Entity>
  ))}
</Scene>;

// Agent color mapping for futuristic theme
const getAgentColor = (agentType: string) => {
  const colorMap = {
    "Intelligent Assistant": "#00BFFF", // Electric Blue
    "Local Services": "#FF00FF", // Magenta
    "Payment Terminal": "#00FF41", // Neon Green
    "Trailing Payment Terminal": "#FF6600", // Orange
    "My Ghost": "#9400D3", // Violet
    "Game Agent": "#00FFFF", // Cyan
    "3D World Builder": "#FF1493", // Deep Pink
    "Home Security": "#32CD32", // Lime Green
    "Content Creator": "#FFD700", // Gold
    "Real Estate Broker": "#FF4500", // Red Orange
    "Bus Stop Agent": "#8A2BE2", // Blue Violet
  };
  return colorMap[agentType] || "#00BFFF";
};
```

## **💳 Morph Holesky Testnet Configuration**

### **Fixed Network & Token Setup**

```typescript
// Fixed network configuration - Morph Holesky only
const MORPH_HOLESKY = {
  chainId: 2810,
  name: "Morph Holesky",
  rpc: "https://rpc-quicknode-holesky.morphl2.io",
  explorer: "https://explorer-holesky.morphl2.io",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
};

// Single token support - USDT only
const USDT_TOKEN = {
  symbol: "USDT",
  address: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
  decimals: 18,
  name: "Tether USD",
};

// Simplified payment flow - no chain/token selection needed
const generatePaymentQR = (agent: Agent) => {
  const paymentData = {
    to: agent.deployer_wallet_address,
    value: agent.interaction_fee,
    token: USDT_TOKEN.address,
    chainId: MORPH_HOLESKY.chainId,
    agentId: agent.id,
  };

  return QRCode.toDataURL(JSON.stringify(paymentData));
};

// Thirdweb configuration for Morph Holesky
import { defineChain } from "@thirdweb-dev/chains";

const morphHolesky = defineChain({
  id: 2810,
  name: "Morph Holesky",
  rpc: "https://rpc-quicknode-holesky.morphl2.io",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Morph Explorer",
      url: "https://explorer-holesky.morphl2.io",
    },
  ],
});

// ThirdwebProvider setup in main.tsx
<ThirdwebProvider
  clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
  activeChain={morphHolesky}
>
  <App />
</ThirdwebProvider>;
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
- ✅ **QR Payment Flow**: Direct USDT transactions from AR viewer to deployer wallets
- ✅ **Real-time Sync**: Deployed agents immediately available in AR
- ✅ **Comprehensive Agent Types**: 11+ categories with full feature support
- ✅ **Single Token Simplicity**: USDT-only payments eliminate complexity
- ✅ **Clean Database**: No chain/token selection columns needed
- ✅ **Fast Development**: Focused scope enables rapid iteration
- ✨ **Futuristic Design**: Unique visual identity with glassmorphism and neon effects
- 🚀 **Sci-Fi Experience**: Immersive cosmic theme throughout the application
- ⚡ **Electric Animations**: Smooth, energy-themed transitions and interactions
- 🔮 **Holographic UI**: Semi-transparent panels with advanced visual effects

## **🔄 Future Network Expansion Strategy**

### **Phase 2: Add New Networks**

When ready to add additional testnets (Solana, other EVM chains):

1. **Database Migration**: Add `network` and `token_symbol` columns
2. **Network Selection UI**: Add chain switching in deployment form
3. **Multi-Token Support**: Expand payment QR generation
4. **Solana Integration**: Add `@solana/web3.js` for non-EVM support

### **Expansion Benefits of Starting Simple**

- ✅ **Proven Architecture**: Single-network version validates all core features
- ✅ **Clean Foundation**: Easy to extend without refactoring
- ✅ **User Testing**: Get feedback on UX before adding complexity
- ✅ **Development Speed**: Ship faster with focused scope

## **🚀 Ready to Build**

This comprehensive setup will create a production-ready AgentSphere application that combines deployment and AR viewing in a single, cohesive experience. The unified approach eliminates the complexity of managing separate codebases while providing all the advanced features developed in the current system.

**Use this prompt to create the complete unified AgentSphere + AR Viewer application from scratch!** 🎯
