# CubePay Complete Implementation Plan

## AgentSphere + AR Viewer → CubePay Monorepo Rebuild

---

## 🎯 Project Overview

**Goal**: Rebuild AgentSphere deployment hub + AR Viewer as unified CubePay monorepo with:

- 3D payment cubes (6 payment faces per cube)
- Dual positioning system (GPS coordinates + screen x/y coordinates)
- ARC Gateway for cross-chain payments (NO Chainlink CCIP)
- ENS payment integration
- Black & cream UI theme
- 11 blockchain networks with USDC as primary token

**Database**: okzjeufiaeznfyomfenk.supabase.co (schema created ✅)

**Reference Codebases** (for code patterns only):

- AgentSphere: `/agentsphere-full-web-man-US/`
- AR Viewer: `/src/`

---

## 📊 Database Schema

### Core Table: `deployed_objects`

```sql
CREATE TABLE deployed_objects (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- GPS Positioning
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  altitude DECIMAL(10, 2),

  -- Screen Positioning (NEW)
  screen_position JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,

  -- 3D Model
  model_url TEXT NOT NULL,
  model_type TEXT DEFAULT 'glb',
  scale DECIMAL(10, 4) DEFAULT 1.0,
  rotation JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,

  -- Agent Properties
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  agent_description TEXT,
  agent_avatar_url TEXT,
  agent_capabilities JSONB DEFAULT '[]'::jsonb,

  -- Payment Cube Configuration
  cube_enabled BOOLEAN DEFAULT false,
  payment_enabled BOOLEAN DEFAULT false,
  accepted_tokens JSONB DEFAULT '["USDC"]'::jsonb,

  -- Blockchain Configuration
  blockchain TEXT DEFAULT 'ethereum-sepolia',
  chain_id TEXT DEFAULT '11155111',
  payment_address TEXT,
  token_address TEXT,

  -- Fee Configuration
  fee_type TEXT DEFAULT 'fixed' CHECK (fee_type IN ('fixed', 'percentage')),
  fixed_fee_amount DECIMAL(20, 6) DEFAULT 0,
  percentage_fee DECIMAL(5, 2) DEFAULT 0,

  -- ARC Gateway Integration (NEW)
  arc_gateway_enabled BOOLEAN DEFAULT false,
  arc_fee_percentage DECIMAL(5, 2) DEFAULT 0.3,
  arc_source_chain TEXT,
  arc_destination_chain TEXT,

  -- ENS Integration (NEW)
  ens_payment_enabled BOOLEAN DEFAULT false,
  ens_domain TEXT,
  ens_resolver_address TEXT,
  ens_avatar_url TEXT,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Payment Sessions Table

```sql
CREATE TABLE payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployed_object_id UUID REFERENCES deployed_objects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  -- Payment Details
  amount DECIMAL(20, 6) NOT NULL,
  token TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  chain_id TEXT NOT NULL,

  -- Transaction Details
  transaction_hash TEXT,
  from_address TEXT,
  to_address TEXT,

  -- ARC Gateway Details
  arc_enabled BOOLEAN DEFAULT false,
  arc_source_chain TEXT,
  arc_destination_chain TEXT,
  arc_fee_amount DECIMAL(20, 6),

  -- ENS Details
  ens_domain TEXT,
  ens_resolved_address TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

---

## 🔗 Blockchain Configuration

### Supported Networks (11 total)

1. **Ethereum Sepolia** (Primary)

   - Chain ID: `11155111`
   - RPC: `https://rpc.sepolia.org`
   - USDC: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

2. **Hedera Testnet**

   - Chain ID: `296`
   - RPC: `https://testnet.hashio.io/api`
   - USDH: `0.0.12345678`

3. **Solana Devnet**

   - Chain ID: `devnet`
   - RPC: `https://api.devnet.solana.com`
   - USDC: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

4. **Base Sepolia**

   - Chain ID: `84532`
   - RPC: `https://sepolia.base.org`
   - USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

5. **Arbitrum Sepolia**

   - Chain ID: `421614`
   - RPC: `https://sepolia-rollup.arbitrum.io/rpc`
   - USDC: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`

6. **Optimism Sepolia**

   - Chain ID: `11155420`
   - RPC: `https://sepolia.optimism.io`
   - USDC: `0x5fd84259d66Cd46123540766Be93DFE6D43130D7`

7. **Polygon Amoy**

   - Chain ID: `80002`
   - RPC: `https://rpc-amoy.polygon.technology`
   - USDC: `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`

8. **Avalanche Fuji**

   - Chain ID: `43113`
   - RPC: `https://api.avax-test.network/ext/bc/C/rpc`
   - USDC: `0x5425890298aed601595a70AB815c96711a31Bc65`

9. **BNB Testnet**

   - Chain ID: `97`
   - RPC: `https://data-seed-prebsc-1-s1.binance.org:8545`
   - USDC: `0x64544969ed7EBf5f083679233325356EbE738930`

10. **Linea Sepolia**

    - Chain ID: `59141`
    - RPC: `https://rpc.sepolia.linea.build`
    - USDC: (Deploy test token)

11. **Scroll Sepolia**
    - Chain ID: `534351`
    - RPC: `https://sepolia-rpc.scroll.io`
    - USDC: (Deploy test token)

**Default**: Ethereum Sepolia (11155111) with USDC  
**Removed**: Morph Holesky, Chainlink CCIP

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--bg-black: #1a1a1a;
--text-cream: #f5f5dc;
--cube-blue: #0066cc;

/* Accent Colors */
--accent-gold: #ffd700;
--accent-green: #00ff88;
--error-red: #ff4444;

/* Gradients */
--gradient-gold: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
--gradient-blue: linear-gradient(135deg, #0066cc 0%, #0044aa 100%);
```

### Payment Cube Specifications

```javascript
const CUBE_CONFIG = {
  geometry: {
    width: 1,
    height: 1,
    depth: 1,
  },
  material: {
    color: "#0066cc",
    metalness: 0.8,
    roughness: 0.2,
    emissive: "#0044aa",
    emissiveIntensity: 0.3,
  },
  faces: [
    { index: 0, label: "Crypto QR", type: "qr-payment", icon: "📱" },
    { index: 1, label: "Sound Pay", type: "audio-payment", icon: "🔊" },
    { index: 2, label: "Voice Pay", type: "voice-payment", icon: "🎤" },
    { index: 3, label: "Virtual Card", type: "card-payment", icon: "💳" },
    { index: 4, label: "ENS Payment", type: "ens-payment", icon: "🌐" },
    { index: 5, label: "On-Ramp", type: "fiat-onramp", icon: "🏦" },
  ],
  animation: {
    rotation: { x: 0.005, y: 0.01 },
    hover: { scale: 1.2, duration: 200 },
    click: { scale: 0.9, duration: 100 },
  },
};
```

---

## 📁 Monorepo Structure

```
cube-pay-hacks/
├── apps/
│   ├── deployment-hub/        # Deploy payment cubes
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── DeploymentForm.tsx
│   │   │   │   ├── CubePreview.tsx
│   │   │   │   ├── BlockchainSelector.tsx
│   │   │   │   ├── PositionSelector.tsx  # GPS + Screen XY
│   │   │   │   ├── ARCGatewayConfig.tsx
│   │   │   │   └── ENSIntegration.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDatabase.ts
│   │   │   │   ├── useWallet.ts
│   │   │   │   └── useARCGateway.ts
│   │   │   └── pages/
│   │   │       ├── Deploy.tsx
│   │   │       ├── Dashboard.tsx
│   │   │       └── Analytics.tsx
│   │   └── package.json
│   │
│   └── ar-viewer/             # View & interact with cubes
│       ├── src/
│       │   ├── components/
│       │   │   ├── ARViewer.tsx
│       │   │   ├── PaymentCube.tsx
│       │   │   ├── CubeOverlay.tsx
│       │   │   ├── PaymentModal.tsx
│       │   │   └── FilterPanel.tsx
│       │   ├── hooks/
│       │   │   ├── useARTracking.ts
│       │   │   ├── usePayment.ts
│       │   │   └── useENSResolver.ts
│       │   └── utils/
│       │       ├── positioning.ts  # GPS + Screen conversion
│       │       ├── raycasting.ts
│       │       └── cubePhysics.ts
│       └── package.json
│
├── packages/
│   ├── ui/                    # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── CubeCanvas.tsx
│   │
│   ├── blockchain/            # Blockchain utilities
│   │   ├── wallets/
│   │   │   ├── metamask.ts
│   │   │   ├── hedera.ts
│   │   │   └── solana.ts
│   │   ├── contracts/
│   │   │   ├── payment.ts
│   │   │   ├── arc-gateway.ts
│   │   │   └── ens-resolver.ts
│   │   └── utils/
│   │       ├── chainConfig.ts
│   │       └── tokenAddresses.ts
│   │
│   ├── database/              # Supabase client
│   │   ├── client.ts
│   │   ├── queries/
│   │   │   ├── deployments.ts
│   │   │   ├── payments.ts
│   │   │   └── analytics.ts
│   │   └── types/
│   │       └── database.types.ts
│   │
│   └── three/                 # Three.js utilities
│       ├── CubeGeometry.ts
│       ├── CubeMaterial.ts
│       ├── CubeAnimations.ts
│       └── ARCamera.ts
│
├── supabase/
│   ├── migrations/
│   │   └── 20260203_initial_schema.sql
│   ├── functions/
│   │   ├── process-arc-payment/
│   │   ├── resolve-ens-domain/
│   │   └── validate-transaction/
│   └── config.toml
│
├── docs/
│   ├── DEPLOYMENT.md
│   ├── BLOCKCHAIN.md
│   ├── ARC_GATEWAY.md
│   └── ENS_INTEGRATION.md
│
├── package.json               # Workspace root
├── turbo.json                 # Turborepo config
├── tsconfig.json              # Base TypeScript config
└── README.md
```

---

## 🚀 Implementation Phases (8 Weeks)

### Week 1: Foundation Setup

**Goal**: Monorepo infrastructure + database connection

**Tasks**:

1. Initialize Turborepo monorepo

   ```bash
   npx create-turbo@latest cube-pay-hacks
   ```

2. Configure workspace packages

   ```json
   {
     "workspaces": ["apps/*", "packages/*"]
   }
   ```

3. Set up Supabase client package

   - Create `packages/database/client.ts`
   - Configure environment variables
   - Add TypeScript types from database schema

4. Create shared UI package with Tailwind

   - Black background theme
   - Cream text components
   - Button/Input/Modal primitives

5. Set up blockchain package structure
   - Chain configurations (11 networks)
   - Token addresses (USDC primary)
   - Wallet connection utilities

**Reference Files**:

- AgentSphere: `/agentsphere-full-web-man-US/src/lib/supabase.ts`
- AgentSphere: `/agentsphere-full-web-man-US/src/index.css` (theme)

**Deliverables**:

- ✅ Monorepo with 2 apps + 4 packages
- ✅ Supabase connection verified
- ✅ Base UI components with black/cream theme

---

### Week 2: Deployment Hub

**Goal**: Create UI to deploy payment cubes with dual positioning

**Tasks**:

1. Build DeploymentForm component

   - Agent name/type/description inputs
   - 3D model URL input
   - GPS coordinate inputs (lat/lng/alt)
   - Screen position inputs (x/y/z)
   - Scale/rotation controls

2. Create BlockchainSelector component

   - Dropdown for 11 networks
   - Token selector (USDC default)
   - Payment address input
   - Fee configuration (fixed vs percentage)

3. Implement CubePreview component

   - Three.js canvas with metallic blue cube
   - Real-time rotation animation
   - 6-face label visualization
   - Interactive hover effects

4. Add PositionSelector component

   - GPS coordinate picker (map integration)
   - Screen XY coordinate slider
   - Visual preview of both positioning modes
   - Conversion utilities between systems

5. Build ARCGatewayConfig component

   - Enable/disable toggle
   - Source/destination chain selectors
   - Fee percentage input (default 0.3%)

6. Create ENSIntegration component

   - ENS domain input
   - Domain resolver lookup
   - Avatar URL display
   - Payment routing configuration

7. Implement database mutations
   - Insert deployed_objects with all fields
   - Handle screen_position JSONB
   - Validate blockchain/token combinations

**Reference Files**:

- AgentSphere: `/agentsphere-full-web-man-US/src/components/DeployObject.tsx` (lines 909-1100)
- AgentSphere: `/agentsphere-full-web-man-US/database/database_setup.sql`

**Deliverables**:

- ✅ Full deployment form with GPS + Screen positioning
- ✅ 11 blockchain networks selectable
- ✅ ARC Gateway configuration
- ✅ ENS integration setup
- ✅ Database inserts working

---

### Week 3: AR Viewer App

**Goal**: Display payment cubes in AR with dual positioning modes

**Tasks**:

1. Build ARViewer component

   - Initialize Three.js scene
   - Set up AR camera with device orientation
   - Implement GPS-based positioning
   - Add screen coordinate positioning mode
   - Toggle between GPS/Screen modes

2. Create PaymentCube component

   - BoxGeometry with metallic blue material
   - 6 payment faces with labels
   - Rotation animation (x: 0.005, y: 0.01)
   - Hover scaling (1.2x)
   - Click scaling (0.9x)

3. Implement CubeOverlay component

   - Agent name/description display
   - Payment options per face
   - Network/token information
   - ARC Gateway status
   - ENS domain display

4. Build FilterPanel component

   - Filter by agent type (20+ types from AR Viewer)
   - Filter by blockchain (11 networks)
   - Filter by token (USDC, USDH, etc.)
   - Filter by payment method (ARC, ENS, Direct)
   - Distance-based filtering

5. Add raycasting for cube interaction

   - Detect cube taps/clicks
   - Show overlay on selection
   - Handle face-specific interactions

6. Implement database queries
   - Fetch deployed_objects with filters
   - Real-time updates via Supabase subscriptions
   - Pagination for large datasets

**Reference Files**:

- AR Viewer: `/src/components/ARViewer.jsx` (lines 75-250)
- AR Viewer: `/src/components/ARAgentOverlay.jsx` (lines 61-146)
- AR Viewer: `/src/components/AR3DScene.jsx` (lines 245-330)
- AR Viewer: `/src/hooks/useDatabase.js`

**Deliverables**:

- ✅ AR scene with payment cubes
- ✅ GPS + Screen positioning modes
- ✅ Interactive cubes with 6 faces
- ✅ Filtering system (20+ filters)
- ✅ Real-time database sync

---

### Week 4: Payment Integration

**Goal**: Process payments on 11 blockchains with USDC

**Tasks**:

1. Implement wallet connections

   - MetaMask (Ethereum + EVM chains)
   - Hedera Wallet Connect
   - Solana Phantom/Solflare

2. Create payment flow

   - Show PaymentModal on cube tap
   - Display selected face (network/token)
   - Input amount
   - Calculate fees (fixed or percentage)
   - Add ARC Gateway fee if enabled

3. Build transaction execution

   - USDC transfers on Ethereum Sepolia
   - USDH transfers on Hedera
   - USDC transfers on Solana
   - ERC-20 transfers on other EVM chains

4. Add transaction tracking

   - Create payment_sessions record
   - Monitor transaction status
   - Update on confirmation
   - Handle failures with error messages

5. Implement ENS payment routing
   - Resolve ENS domain to address
   - Route payment to resolved address
   - Store ENS metadata in payment_sessions

**Reference Files**:

- AgentSphere: `/agentsphere-full-web-man-US/src/components/SolanaWalletConnect.tsx`
- AgentSphere: `/agentsphere-full-web-man-US/src/components/HederaWalletConnect.tsx`

**Deliverables**:

- ✅ 11 blockchain payment support
- ✅ USDC as primary token
- ✅ ENS payment routing
- ✅ Transaction tracking in database

---

### Week 5: ARC Gateway Integration

**Goal**: Enable cross-chain payments via ARC Gateway

**Tasks**:

1. Integrate ARC Gateway SDK

   - Add SDK to blockchain package
   - Configure API keys
   - Set up chain mappings

2. Build cross-chain payment flow

   - Detect source chain from wallet
   - Allow destination chain selection
   - Calculate ARC Gateway fees (default 0.3%)
   - Show total cost breakdown

3. Implement ARC transaction execution

   - Initiate cross-chain transfer
   - Monitor bridge transaction
   - Track destination chain confirmation
   - Update payment_sessions with ARC metadata

4. Add ARC status monitoring

   - Show bridge status in real-time
   - Display estimated completion time
   - Handle bridge failures
   - Provide transaction receipts

5. Build ARC analytics dashboard
   - Total cross-chain volume
   - Fee breakdown by chain
   - Success/failure rates
   - Average bridge time

**Deliverables**:

- ✅ ARC Gateway cross-chain payments
- ✅ 0.3% default fee (configurable)
- ✅ Real-time bridge monitoring
- ✅ Analytics dashboard

---

### Week 6: ENS Integration

**Goal**: Enable payments to ENS domains

**Tasks**:

1. Implement ENS resolver

   - Use ethers.js ENS provider
   - Resolve .eth domains to addresses
   - Cache resolved addresses
   - Handle reverse lookups

2. Build ENS configuration UI

   - ENS domain input in deployment form
   - Domain validation
   - Avatar URL fetching
   - Resolver address display

3. Create ENS payment flow

   - Accept ENS domains in payment modal
   - Resolve domain before transaction
   - Show resolved address for confirmation
   - Store ENS metadata in payment_sessions

4. Add ENS profile display

   - Show ENS avatar in cube overlay
   - Display ENS domain instead of address
   - Add ENS badge to cubes with domains

5. Implement ENS analytics
   - Track payments by ENS domain
   - Show popular domains
   - Display total volume per domain

**Deliverables**:

- ✅ ENS domain resolution
- ✅ ENS payment routing
- ✅ ENS profiles in UI
- ✅ ENS analytics

---

### Week 7: Mobile Optimization

**Goal**: Optimize for mobile AR and touch interactions

**Tasks**:

1. Optimize Three.js performance

   - Reduce cube polygon count
   - Implement LOD (Level of Detail)
   - Use instanced rendering for many cubes
   - Add frustum culling

2. Improve touch interactions

   - Larger tap targets
   - Touch gesture support (pinch/swipe)
   - Haptic feedback
   - Long-press for cube details

3. Add mobile-specific features

   - Orientation lock toggle
   - Screen brightness control
   - Battery usage optimization
   - Offline mode preparation

4. Implement responsive layouts

   - Mobile-first deployment form
   - Collapsible filter panel
   - Bottom sheet payment modal
   - Optimized cube overlay

5. Add PWA features
   - Service worker for caching
   - Install prompt
   - Push notifications for payments
   - Background sync

**Deliverables**:

- ✅ Smooth 60fps AR on mobile
- ✅ Touch-optimized interactions
- ✅ Responsive layouts
- ✅ PWA capabilities

---

### Week 8: Production Deployment

**Goal**: Deploy to production with monitoring

**Tasks**:

1. Configure production environment

   - Set up Vercel/Netlify deployment
   - Configure production Supabase
   - Add environment variables
   - Set up custom domain

2. Implement monitoring

   - Add Sentry error tracking
   - Set up analytics (PostHog/Mixpanel)
   - Add performance monitoring
   - Configure uptime monitoring

3. Add security features

   - Rate limiting
   - CORS configuration
   - XSS/CSRF protection
   - Input sanitization

4. Create documentation

   - User guide for deployment
   - Developer API documentation
   - Blockchain integration guide
   - Troubleshooting guide

5. Set up CI/CD
   - GitHub Actions pipeline
   - Automated testing
   - Staging environment
   - Production deployment workflow

**Deliverables**:

- ✅ Production deployment
- ✅ Monitoring & analytics
- ✅ Security hardening
- ✅ Complete documentation

---

## 🤖 GitHub Copilot Agent Prompt

```markdown
# CubePay Monorepo Implementation

Build a complete monorepo for CubePay with the following specifications:

## Architecture

- **Turborepo** monorepo with 2 apps (deployment-hub, ar-viewer) and 4 packages (ui, blockchain, database, three)
- **React 18.3.1** + **TypeScript 5.8.2** + **Vite 6.2.0**
- **Three.js 0.164.1** for 3D payment cubes
- **Supabase** database: okzjeufiaeznfyomfenk.supabase.co
- **ThirdWeb SDK 5.x** for blockchain connections
- **Tailwind CSS** with black (#1a1a1a) bg, cream (#f5f5dc) text

## Database Schema

Use the `deployed_objects` table with these key fields:

- GPS positioning: `latitude`, `longitude`, `altitude`
- Screen positioning: `screen_position` (JSONB: {x, y, z})
- Payment config: `cube_enabled`, `payment_enabled`, `accepted_tokens`
- Blockchain: `blockchain`, `chain_id`, `payment_address`, `token_address`
- Fees: `fee_type` (fixed/percentage), `fixed_fee_amount`, `percentage_fee`
- ARC Gateway: `arc_gateway_enabled`, `arc_fee_percentage`, `arc_source_chain`, `arc_destination_chain`
- ENS: `ens_payment_enabled`, `ens_domain`, `ens_resolver_address`, `ens_avatar_url`

## Blockchain Configuration (11 Networks)

1. **Ethereum Sepolia** (11155111) - USDC: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 [PRIMARY]
2. **Hedera Testnet** (296) - USDH: 0.0.12345678
3. **Solana Devnet** (devnet) - USDC: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
4. **Base Sepolia** (84532) - USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
5. **Arbitrum Sepolia** (421614) - USDC: 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
6. **Optimism Sepolia** (11155420) - USDC: 0x5fd84259d66Cd46123540766Be93DFE6D43130D7
7. **Polygon Amoy** (80002) - USDC: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
8. **Avalanche Fuji** (43113) - USDC: 0x5425890298aed601595a70AB815c96711a31Bc65
9. **BNB Testnet** (97) - USDC: 0x64544969ed7EBf5f083679233325356EbE738930
10. **Linea Sepolia** (59141)
11. **Scroll Sepolia** (534351)

**Default**: Ethereum Sepolia + USDC

## Payment Cube Specifications

- **Geometry**: 1x1x1 box
- **Material**: Metallic blue (#0066cc), metalness: 0.8, roughness: 0.2, emissive: #0044aa (0.3 intensity)
- **6 Payment Faces**:
  1. **Crypto QR** 📱 - QR code-based cryptocurrency payments
  2. **Sound Pay** 🔊 - Audio frequency-based payments
  3. **Voice Pay** 🎤 - Voice-activated payment authorization
  4. **Virtual Card** 💳 - Virtual card payments (Revolut integration)
  5. **ENS Payment** 🌐 - ENS domain payment routing
  6. **On-Ramp** 🏦 - Fiat-to-crypto onboarding
- **Animation**: Continuous rotation (x: 0.005, y: 0.01), hover scale 1.2x, click scale 0.9x

## Key Features

### 1. Deployment Hub (`apps/deployment-hub`)

Create form to deploy payment cubes with:

- Agent configuration (name, type, description, avatar, capabilities)
- 3D model upload (GLB/GLTF)
- **Dual positioning**:
  - GPS coordinates (lat/lng/alt)
  - Screen coordinates (x/y/z in JSONB)
- Blockchain selection (11 networks, USDC primary)
- Fee configuration (fixed amount or percentage)
- ARC Gateway toggle (0.3% default fee, source/destination chain selection)
- ENS domain configuration (domain, resolver, avatar)
- Live 3D preview of cube with rotation

### 2. AR Viewer (`apps/ar-viewer`)

Build AR experience with:

- Three.js scene with AR camera (device orientation tracking)
- **Dual positioning modes**:
  - GPS mode: Position cubes based on lat/lng
  - Screen mode: Position cubes based on x/y/z coordinates
  - Toggle between modes
- Payment cubes with 6 labeled faces
- Raycasting for cube tap detection
- Filter panel (20+ filters):
  - Agent type (AI Assistant, Travel Agent, Shopping Agent, Payment Terminal, DeFi Agent, NFT Agent, etc.)
  - Blockchain (all 11 networks)
  - Token (USDC, USDH, etc.)
  - Payment method (Direct, ARC, ENS)
  - Distance radius
- Cube overlay on tap:
  - Agent name/description/avatar
  - Payment options per face
  - Network/token info
  - ARC Gateway status
  - ENS domain (if configured)

### 3. Payment System

Implement complete payment flow:

- **Wallet connections**:
  - MetaMask (Ethereum + EVM chains)
  - Hedera Wallet Connect
  - Solana Phantom/Solflare
- **Payment modal** (shows on cube tap):
  - Selected face (network/token)
  - Amount input
  - Fee calculation (fixed or percentage)
  - ARC Gateway fee (if enabled)
  - Total cost breakdown
- **Transaction execution**:
  - USDC transfers (ERC-20 on EVM chains)
  - USDH transfers (HTS on Hedera)
  - SOL USDC transfers (SPL on Solana)
- **Transaction tracking**:
  - Insert `payment_sessions` record
  - Monitor transaction status
  - Update on confirmation
  - Handle failures

### 4. ARC Gateway Integration

Enable cross-chain payments:

- Detect source chain from wallet
- Allow destination chain selection in payment modal
- Calculate ARC Gateway fee (default 0.3%, configurable per cube)
- Execute cross-chain transfer via ARC Gateway SDK
- Track bridge transaction status
- Store ARC metadata in `payment_sessions`: `arc_enabled`, `arc_source_chain`, `arc_destination_chain`, `arc_fee_amount`

### 5. ENS Payment Routing

Support ENS domains:

- Resolve .eth domains to addresses using ethers.js
- Show ENS avatar in cube overlay
- Accept ENS domains in payment modal
- Resolve before transaction execution
- Store ENS metadata in `payment_sessions`: `ens_domain`, `ens_resolved_address`

## Packages

### `packages/ui`

Shared UI components with black/cream theme:

- Button (cream bg, black text, hover effects)
- Input (cream border, black bg, cream text)
- Modal (black bg, cream border, centered overlay)
- CubeCanvas (Three.js wrapper component)

### `packages/blockchain`

Blockchain utilities:

- `chainConfig.ts`: All 11 network configurations
- `tokenAddresses.ts`: USDC/USDH addresses per network
- `wallets/`: MetaMask, Hedera, Solana connection logic
- `contracts/`: ERC-20, HTS, SPL payment functions
- `arc-gateway.ts`: ARC Gateway SDK integration
- `ens-resolver.ts`: ENS domain resolution

### `packages/database`

Supabase client and queries:

- `client.ts`: Initialize Supabase with env vars
- `queries/deployments.ts`: CRUD for `deployed_objects`
- `queries/payments.ts`: CRUD for `payment_sessions`
- `types/database.types.ts`: TypeScript types from schema

### `packages/three`

Three.js utilities:

- `CubeGeometry.ts`: Create 1x1x1 box with 6 faces
- `CubeMaterial.ts`: Metallic blue material with emissive glow
- `CubeAnimations.ts`: Rotation, hover, click animations
- `ARCamera.ts`: Camera with device orientation tracking

## Implementation Steps

### Phase 1: Foundation (Week 1)

1. Initialize Turborepo: `npx create-turbo@latest cube-pay-hacks`
2. Create folder structure: `apps/`, `packages/`, `supabase/`
3. Set up `packages/database` with Supabase client
4. Set up `packages/ui` with Tailwind (black/cream theme)
5. Set up `packages/blockchain` with 11 chain configs
6. Verify database connection to okzjeufiaeznfyomfenk.supabase.co

### Phase 2: Deployment Hub (Week 2)

1. Create `apps/deployment-hub` React app
2. Build DeploymentForm with all fields (GPS + screen position)
3. Build BlockchainSelector (11 networks, USDC default)
4. Build CubePreview with Three.js (metallic blue, rotating)
5. Build ARCGatewayConfig (enable toggle, fee input, chain selectors)
6. Build ENSIntegration (domain input, resolver lookup)
7. Implement database insert to `deployed_objects`

### Phase 3: AR Viewer (Week 3)

1. Create `apps/ar-viewer` React app
2. Build ARViewer with Three.js scene + AR camera
3. Implement GPS positioning (lat/lng to 3D coords)
4. Implement screen positioning (JSONB x/y/z to 3D coords)
5. Build PaymentCube component (6 faces, rotation animation)
6. Build FilterPanel (20+ filters for agent types, blockchains, tokens)
7. Build CubeOverlay (shows agent info + payment options on tap)
8. Implement raycasting for cube interaction
9. Fetch `deployed_objects` from database with real-time subscriptions

### Phase 4: Payments (Week 4)

1. Integrate ThirdWeb SDK in `packages/blockchain`
2. Implement wallet connections (MetaMask, Hedera, Phantom)
3. Build PaymentModal (amount input, fee calc, ARC fee, total)
4. Implement USDC transfers on Ethereum Sepolia
5. Implement USDH transfers on Hedera Testnet
6. Implement USDC transfers on Solana Devnet
7. Implement ERC-20 transfers on 8 other EVM chains
8. Create `payment_sessions` record on payment initiation
9. Update status on transaction confirmation

### Phase 5: ARC Gateway (Week 5)

1. Integrate ARC Gateway SDK in `packages/blockchain`
2. Build cross-chain payment flow (source/destination chain selection)
3. Calculate ARC Gateway fee (0.3% default)
4. Execute cross-chain transfer via ARC Gateway
5. Track bridge transaction status
6. Update `payment_sessions` with ARC metadata

### Phase 6: ENS Integration (Week 6)

1. Add ethers.js ENS provider in `packages/blockchain`
2. Implement ENS resolver (domain → address)
3. Add ENS domain input in DeploymentForm
4. Show ENS avatar in CubeOverlay
5. Accept ENS domains in PaymentModal
6. Resolve ENS before transaction execution
7. Store ENS metadata in `payment_sessions`

### Phase 7: Mobile Optimization (Week 7)

1. Optimize Three.js performance (LOD, instancing, culling)
2. Add touch interactions (larger tap targets, gestures, haptics)
3. Implement responsive layouts (mobile-first)
4. Add PWA features (service worker, offline mode)

### Phase 8: Production (Week 8)

1. Deploy to Vercel/Netlify
2. Configure production Supabase
3. Add monitoring (Sentry, analytics)
4. Add security (rate limiting, CORS, XSS protection)
5. Create documentation

## Reference Codebases (for patterns only)

### AgentSphere (`/agentsphere-full-web-man-US/`)

- `src/components/DeployObject.tsx` (lines 909-1100): Deployment form patterns
- `src/components/SolanaWalletConnect.tsx`: Solana wallet integration
- `src/components/HederaWalletConnect.tsx`: Hedera wallet integration
- `database/database_setup.sql`: Database schema reference
- `src/lib/supabase.ts`: Supabase client setup

### AR Viewer (`/src/`)

- `components/ARViewer.jsx` (lines 75-250): AR scene setup, GPS positioning
- `components/ARAgentOverlay.jsx` (lines 61-146): Agent overlay UI
- `components/AR3DScene.jsx` (lines 245-330): Three.js scene with 3D objects
- `hooks/useDatabase.js`: Supabase queries and subscriptions

## Critical Requirements

1. **Dual Positioning**: MUST support both GPS (lat/lng/alt) and screen (x/y/z) positioning modes with toggle
2. **11 Blockchains**: MUST support all 11 networks with proper chain IDs and token addresses
3. **USDC Primary**: Default to Ethereum Sepolia + USDC, but support all tokens
4. **ARC Gateway**: MUST use ARC Gateway for cross-chain (NOT Chainlink CCIP)
5. **ENS Domains**: MUST resolve .eth domains and route payments correctly
6. **Payment Cubes**: MUST have 6 distinct payment faces with proper labels
7. **Black/Cream Theme**: MUST use #1a1a1a bg, #f5f5dc text, #0066cc cubes
8. **Database**: MUST use okzjeufiaeznfyomfenk.supabase.co with `deployed_objects` and `payment_sessions` tables
9. **Monorepo**: MUST use Turborepo structure with 2 apps + 4 packages
10. **Mobile-First**: MUST work on mobile with touch interactions

## Exclusions (DO NOT IMPLEMENT)

- ❌ Morph Holesky blockchain
- ❌ Chainlink CCIP (use ARC Gateway instead)
- ❌ Light theme (only black/cream dark theme)
- ❌ Non-USDC default tokens (USDC is primary)

## Success Criteria

- ✅ Deploy payment cubes with GPS + screen positioning
- ✅ View cubes in AR with both positioning modes
- ✅ Filter by 20+ criteria (agent types, blockchains, tokens)
- ✅ Process payments on all 11 blockchains
- ✅ Execute cross-chain payments via ARC Gateway
- ✅ Pay to ENS domains with resolution
- ✅ Display agent info with overlays
- ✅ Track all transactions in database
- ✅ Smooth 60fps performance on mobile

Execute this plan systematically, starting with Phase 1 and progressing through all 8 phases.
```

---

## 📋 Next Steps

1. **Copy this file** to `/home/petrunix/cube-pay-hacks/IMPLEMENTATION_PLAN.md`

2. **Open cube-pay-hacks in VS Code**

3. **Open GitHub Copilot Chat**

4. **Paste the "GitHub Copilot Agent Prompt" section** (starts with "# CubePay Monorepo Implementation")

5. **Let Copilot execute all 8 phases systematically**

6. **Monitor progress** and provide feedback as needed

---

## 🎯 Quick Reference

### Database Connection

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://okzjeufiaeznfyomfenk.supabase.co",
  "YOUR_SUPABASE_ANON_KEY",
);
```

### Deploy Payment Cube

```javascript
const { data, error } = await supabase.from("deployed_objects").insert({
  agent_name: "Payment Cube",
  agent_type: "payment_terminal",
  latitude: 40.7128,
  longitude: -74.006,
  screen_position: { x: 0, y: 1, z: -5 },
  blockchain: "ethereum-sepolia",
  chain_id: "11155111",
  token_address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  cube_enabled: true,
  payment_enabled: true,
  arc_gateway_enabled: true,
  arc_fee_percentage: 0.3,
});
```

### Fetch Cubes for AR Viewer

```javascript
const { data: cubes } = await supabase
  .from("deployed_objects")
  .select("*")
  .eq("is_active", true)
  .eq("cube_enabled", true);
```

### Process Payment

```javascript
const { data: session } = await supabase.from("payment_sessions").insert({
  deployed_object_id: cubeId,
  amount: 10.0,
  token: "USDC",
  blockchain: "ethereum-sepolia",
  chain_id: "11155111",
  status: "pending",
  arc_enabled: true,
  arc_source_chain: "ethereum-sepolia",
  arc_destination_chain: "arbitrum-sepolia",
  arc_fee_amount: 0.03,
});
```

---

**End of Implementation Plan**

_Generated: February 3, 2026_  
_Database: okzjeufiaeznfyomfenk.supabase.co_  
_Status: Ready for execution_
