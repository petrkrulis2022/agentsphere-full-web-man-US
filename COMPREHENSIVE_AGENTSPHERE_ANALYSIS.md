# Comprehensive AgentSphere Deployment App Codebase Analysis

## Context

This analysis covers the AgentSphere deployment app from the `revolut-pay-sim-solana-hedera-ai` branch of the repository: https://github.com/petrkrulis2022/agentsphere-full-web-man-US

**Analysis Date:** February 1, 2026  
**Repository Branch:** revolut-pay-sim-solana-hedera-ai  
**Purpose:** Complete codebase analysis for from-scratch rebuild in monorepo structure

---

## 1. TECH STACK & DEPENDENCIES

### Core Frameworks & Build Tools

- **React 18.2.0** - Modern React with hooks and concurrent features
- **Vite 5.0.0** - Fast build tool and dev server with optimized bundling
- **TypeScript 5.2.2** - Full TypeScript support with strict typing
- **Node.js + Express 4.21.2** - Backend API server for Revolut integration

### UI Frameworks & Styling

- **Tailwind CSS 3.3.5** - Utility-first CSS framework for responsive design
- **Framer Motion 10.16.4** - Animation library for smooth transitions and interactions
- **Lucide React 0.294.0** - Modern icon library (2000+ icons)
- **PostCSS 8.4.31** - CSS processing with autoprefixer

### State Management

- **React Hooks** - Built-in state management (useState, useEffect, useContext)
- **No external state management library** - Uses React's native state management

### Form Management & Validation

- **Custom validation logic** - Built-in validation in PaymentMethodsSelector and DeployObject components
- **React controlled components** - Standard form handling patterns

### Blockchain Integrations

**EVM Networks & Libraries:**

- **ThirdWeb SDK 4.0.98** - Multi-chain wallet connection and contract interaction
- **ThirdWeb React 4.1.10** - React hooks for blockchain operations
- **ThirdWeb Chains 0.1.120** - Network configurations
- **Web3Modal 1.9.12** - Wallet connection interface
- **Ethereum QR Code 0.3.0** - QR code generation for payments

**Hedera Integration:**

- **@hashgraph/sdk 2.77.0** - Official Hedera SDK for account creation and transactions
- **@hashgraph/stablecoin-npm-sdk 2.1.5** - Stablecoin management on Hedera

**Solana Integration:**

- **@solana/web3.js 1.98.4** - Solana blockchain interaction
- **@solana/spl-token 0.4.14** - SPL token operations
- **@base-org/account 2.4.0** - Base chain account abstraction

**Multi-Chain Support:**

- **Supported Networks:** Ethereum Sepolia, Arbitrum Sepolia, Base Sepolia, OP Sepolia, Avalanche Fuji, Polygon Amoy, Solana Devnet, Hedera Testnet
- **CCIP Cross-Chain:** Chainlink CCIP integration for cross-chain payments

### Database Technology

- **Supabase JS 2.58.0** - PostgreSQL client with real-time subscriptions
- **PostgreSQL** - Backend database with JSONB support for complex data structures

### Payment Integrations

- **Revolut Merchant API** - Bank QR and Virtual Card payments (Apple/Google Pay)
- **Custom API Client** - revolutApiClient.js for sandbox integration
- **6-Faced Payment Cube System** - Crypto QR, Bank QR, Virtual Card, Voice Pay, Sound Pay, Onboard Crypto

### Utilities

- **QRCode 1.5.4** - QR code generation for payments
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 17.2.3** - Environment variable management
- **A-Frame 1.4.0** - WebXR framework for AR components

### Build Configuration

- **Vite Config Highlights:**
  - Multi-port support (5174, with ngrok proxy support)
  - CORS configuration for development
  - TypeScript optimization
  - Mobile build support with separate tsconfig
  - Polyfills for blockchain libraries (bech32, bn.js, js-sha3)

---

## 2. CORE FEATURES & FUNCTIONALITY

### Agent Creation Workflow

**Primary Files:** `src/components/DeployObject.tsx` (3024 lines)

- Complete multi-step agent configuration wizard
- Location-based deployment with GPS and RTK precision
- Multi-chain network selection (EVM/Solana/Hedera)
- Agent type selection with 20+ predefined types
- Payment method configuration (6-faced cube system)
- Real-time validation and error handling
- **Database Tables:** `deployed_objects`, `payment_cube_system`

### Agent Configuration

**Primary Files:** `src/components/DeployObject.tsx`, `src/services/agentDataService.ts`

- **Agent Types:** 20+ types including Payment Terminals, Travel Agents, AI Assistants
- **Interaction Methods:** Text/Voice/Video chat, DeFi features
- **MCP Integrations:** Filesystem, memory, search, educational content
- **AR Configuration:** Visibility range (25m), interaction range (15m), trailing agents
- **3D Model Management:** Model URL configuration and scaling
- **Database Fields:** agent_type, interaction_methods, mcp_integrations, ar_config

### Payment Method Configuration (6-Faced Cube System)

**Primary Files:** `src/components/PaymentMethodsSelector.tsx`, `src/components/BankDetailsForm.tsx`

- **Crypto QR:** Wallet address configuration with multi-chain support
- **Bank Virtual Card:** Apple Pay/Google Pay integration
- **Bank QR:** Traditional bank transfer QR codes
- **Voice Pay:** Voice-activated crypto payments
- **Sound Pay:** Audio-based payment triggers
- **Onboard Crypto:** Educational crypto onboarding
- **Database Tables:** payment_methods, payment_config (JSONB fields)

### Multi-Chain Network Support

**Primary Files:** `src/config/multiChainNetworks.ts`, `src/services/multiChainWalletService.ts`

- **EVM Networks:** 6 testnets (Ethereum, Arbitrum, Base, OP, Avalanche, Polygon)
- **Solana:** Devnet/Testnet/Mainnet support with USDC integration
- **Hedera:** Testnet with HBAR and custom stablecoins (USDh, USDΔ, etc.)
- **CCIP Integration:** Cross-chain payments via Chainlink
- **Database Fields:** deployment_network, network_config, supported_networks (JSONB)

### Location/GPS Management

**Primary Files:** `src/components/DeployObject.tsx` (location states and RTK integration)

- **Standard GPS:** Browser geolocation API with accuracy reporting
- **RTK Precision:** Enhanced GPS with correction algorithms
- **Altitude Support:** 3D positioning for AR applications
- **Location Types:** Street, Indoor, Landmark, Building, etc.
- **Database Fields:** latitude, longitude, altitude, preciselatitude, preciselongitude, rtk_enhanced

### Hedera AI Agent Kit Integration

**Primary Files:** `src/services/hederaService.ts`, `HEDERA_AI_AGENT_KIT_GUIDE.md`

- **Agent Wallet Creation:** Automatic Hedera account generation with HBAR funding
- **ERC-8004 Identity NFT:** Blockchain-based agent identity system
- **A2A Communication:** Agent-to-Agent messaging protocol
- **x402 Micropayments:** Pay-per-use API access
- **Travel Agent Orchestration:** Bus/Train/Hotel/Flight agent coordination
- **Database Fields:** hedera_account_id, identity_nft_id, a2a_endpoint, x402_enabled

### Agent Dashboard & Management

**Primary Files:** `src/components/MultiChainAgentDashboard.tsx` (1076 lines)

- **Real-time Agent List:** Live updates via Supabase subscriptions
- **Multi-chain Filtering:** Filter by network, status, agent type
- **Analytics Dashboard:** Network statistics, earnings tracking
- **Agent Status Management:** Enable/disable, update configuration
- **Cross-chain Deployment View:** Shows all networks where agent is deployed
- **Performance Metrics:** Interaction counts, revenue tracking

### Authentication System

**Primary Files:** Integrated via Supabase RLS policies

- **Wallet-based Authentication:** MetaMask/Phantom/Coinbase wallet login
- **Row Level Security (RLS):** Database-level access control
- **Multi-wallet Support:** EVM and Solana wallet connection simultaneously
- **Session Management:** JWT-based authentication with Supabase

### Dynamic Payment System

**Primary Files:** `DYNAMIC_PAYMENT_SYSTEM_DOCUMENTATION.md`, backend API endpoints

- **Fixed vs Dynamic Fees:** Regular agents use fixed fees, payment terminals use dynamic amounts
- **Payment Sessions:** 15-minute time-limited payment requests
- **Revenue Sharing:** 70/30 for regular agents, 100/0 for payment terminals
- **Merchant Integration:** API for e-shops and on-ramps
- **Session Management:** Create, retrieve, complete, cancel payments

### 3D Model Management

**Primary Files:** `src/components/DeployObject.tsx`

- **Model URL Configuration:** Support for GLTF/GLB 3D models
- **Scaling Controls:** X/Y/Z axis scaling for proper AR sizing
- **Rotation Support:** Initial rotation settings for optimal viewing
- **Model Preview:** Real-time preview of 3D model configuration
- **Database Fields:** model_url, scale_x, scale_y, scale_z, rotation_x, rotation_y, rotation_z

### AR Viewer Integration

**Primary Files:** `src/components/ARViewer.tsx`, `src/components/ARAgentPlacer.tsx`

- **WebXR Support:** Browser-based AR using A-Frame
- **Agent Placement:** Real-time agent positioning in AR space
- **Interaction Zones:** Configurable interaction and visibility ranges
- **Real-time Sync:** Live updates from deployment app via Supabase
- **GPS Integration:** Location-based agent discovery

---

## 3. ARCHITECTURE & STRUCTURE

### Application Entry Points

- **main.tsx** - Application root with ThirdWeb and Router providers
- **App.tsx** - Main app component with routing and global state
- **SimpleApp.tsx** - Simplified version for testing
- **TestApp.tsx** - Development testing component

### Routing Structure

```typescript
- "/" - Hero landing page with feature showcase
- "/deploy" - Agent deployment wizard (main feature)
- "/deploy/ar-placement" - AR agent placement interface
- "/dashboard" - Multi-chain agent management dashboard
- "/ar" - AR viewer component (embedded)
```

### Component Organization

```
src/components/
├── Core UI Components
│   ├── Navbar.tsx - Navigation with wallet connection
│   ├── Hero.tsx - Landing page hero section
│   ├── Features.tsx - Feature showcase
│   ├── MapVisualization.tsx - Interactive map for agent locations
│   └── Footer.tsx - Site footer
├── Deployment Components
│   ├── DeployObject.tsx - Main deployment wizard (3024 lines)
│   ├── PaymentMethodsSelector.tsx - 6-faced payment cube config
│   ├── BankDetailsForm.tsx - Bank payment configuration
│   ├── NetworkSelectionModal.tsx - Multi-chain network selection
│   └── EnhancedDeploymentForm.tsx - Enhanced deployment interface
├── Dashboard Components
│   └── MultiChainAgentDashboard.tsx - Agent management interface
├── AR Components
│   ├── ARViewer.tsx - AR viewing interface
│   ├── ARAgentPlacer.tsx - AR agent placement
│   └── TouchIndicator.jsx - Touch visualization for screen recording
├── Wallet Components
│   ├── MultiWalletConnector.tsx - Multi-chain wallet management
│   ├── HederaWalletConnect.tsx - Hedera-specific connection
│   ├── SolanaConnectButton.tsx - Solana wallet integration
│   └── WalletConnectionDisplay.tsx - Wallet status display
└── Interaction Components
    ├── CrossChainConfigPanel.tsx - Cross-chain configuration
    ├── CrossChainPaymentDemo.tsx - Payment demonstration
    └── UnsupportedNetworkModal.jsx - Network compatibility warnings
```

### Service Layer Organization

```
src/services/
├── Blockchain Services
│   ├── hederaService.ts - Hedera account/NFT/payment operations
│   ├── hederaWalletService.ts - Hedera wallet management
│   ├── solanaNetworkService.ts - Solana network configuration
│   ├── solanaPaymentService.ts - Solana payment processing
│   ├── solanaWalletService.ts - Solana wallet operations
│   └── multiChainWalletService.ts - Cross-chain wallet management
├── Payment Services
│   ├── revolutApiClient.js - Revolut bank payment integration
│   ├── crossChainPaymentService.ts - CCIP payment routing
│   └── paymentTrackingService.ts - Payment status monitoring
├── Agent Services
│   ├── agentDataService.ts - Complete agent data formatting (883 lines)
│   ├── multiChainDeploymentService.ts - Cross-chain deployment
│   └── a2aService.ts - Agent-to-Agent communication
└── Utility Services
    ├── networkDetectionService.ts - Network detection and switching
    └── x402Client.ts - x402 micropayment protocol
```

### Custom Hooks & State Management

```
src/hooks/ (inferred from component usage)
├── useLocation() - GPS and RTK positioning
├── useMultiChainWallet() - Multi-chain wallet state
├── useSupabaseRealtime() - Real-time database subscriptions
├── usePaymentMethods() - Payment configuration management
└── useAgentDeployment() - Deployment workflow state
```

### Data Flow Diagram (Text-based)

```
User Action → Component State → Service Layer → Supabase Database → Real-time Update → UI Refresh

Example: Deploy Agent Flow
1. User fills DeployObject form
2. Component validates and collects data
3. multiChainDeploymentService processes deployment
4. Database insert/update in deployed_objects table
5. Real-time subscription notifies dashboard and AR viewer
6. Dashboard updates agent list automatically
7. AR viewer shows new agent in real-time

Example: Payment Processing Flow
1. User configures payment methods in PaymentMethodsSelector
2. Payment data stored in component state
3. revolutApiClient or blockchain service processes payment
4. Payment status updated in database
5. Real-time notification sent to merchant/user
6. UI updates with payment confirmation
```

---

## 4. INTEGRATION POINTS

### Supabase Database Integration

**Connection Configuration:**

```typescript
// src/lib/supabase.ts and App.tsx
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Primary Table Schema - deployed_objects (Complete Current Schema):**

```sql
-- Core agent information
id: uuid (PRIMARY KEY, default: gen_random_uuid())
name: text NOT NULL
description: text
agent_type: text NOT NULL
user_id: text NOT NULL -- wallet address

-- Location data (AR positioning critical)
latitude: double precision NOT NULL
longitude: double precision NOT NULL
altitude: double precision
preciselatitude: double precision -- RTK enhanced
preciselongitude: double precision -- RTK enhanced
precisealtitude: double precision
accuracy: double precision
correctionapplied: boolean
location_type: text DEFAULT 'Street'

-- AR configuration
visibility_range: integer DEFAULT 25 -- meters
interaction_range: integer DEFAULT 15 -- meters
trailing_agent: boolean DEFAULT false
ar_notifications: boolean DEFAULT true
model_url: text
scale_x: double precision DEFAULT 1.0
scale_y: double precision DEFAULT 1.0
scale_z: double precision DEFAULT 1.0
rotation_x: double precision DEFAULT 0.0
rotation_y: double precision DEFAULT 0.0
rotation_z: double precision DEFAULT 0.0

-- Multi-chain deployment (JSONB columns - latest additions)
deployment_network: jsonb DEFAULT '{}'::jsonb -- Primary and additional networks
network_config: jsonb DEFAULT '{}'::jsonb -- Network-specific payment settings
cross_chain_config: jsonb DEFAULT '{}'::jsonb -- Cross-chain bridge settings
supported_networks: jsonb DEFAULT '[]'::jsonb -- Array of supported chain IDs

-- Payment system (6-faced cube)
payment_methods: jsonb DEFAULT '{}'::jsonb -- Cube configuration
payment_config: jsonb DEFAULT '{}'::jsonb -- Bank details, wallet addresses
interaction_fee_usdfc: numeric DEFAULT 10 -- Unified fee field
fee_type: text DEFAULT 'fixed' -- "fixed" | "dynamic"
currency_type: text DEFAULT 'USDC'
token_symbol: text DEFAULT 'USDC'

-- Agent capabilities
interaction_methods: jsonb -- {text_chat, voice_chat, video_chat, defi_features}
mcp_integrations: jsonb DEFAULT '[]'::jsonb -- Array of MCP services
mcp_services: jsonb DEFAULT '[]'::jsonb -- Detailed MCP configuration

-- Hedera AI Agent Kit integration
hedera_account_id: text
hedera_private_key: text -- encrypted
identity_nft_id: text
a2a_endpoint: text
x402_enabled: boolean DEFAULT false

-- Legacy blockchain fields (maintained for compatibility)
network: text
chain_id: integer
contract_address: text
deployment_tx: text
deployment_block: integer
gas_used: integer
agent_wallet_address: text
agent_wallet_type: text

-- System fields
is_active: boolean DEFAULT true
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
```

**Database Functions (PostgreSQL):**

- `validate_multi_chain_deployment(jsonb)` - Validates network deployment structure
- `validate_payment_methods(jsonb)` - Validates payment cube configuration
- `get_agents_by_network(integer)` - Retrieves agents for specific network
- `validate_network_payments(jsonb)` - Validates network-specific payment config

**Real-time Subscriptions:**

```typescript
// Example subscription for AR viewer
supabase
  .channel("deployed_objects_changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "deployed_objects" },
    (payload) => {
      // Real-time agent updates
    },
  )
  .subscribe();
```

**RLS Policies:**

- "Anyone can read deployed objects" - Public read access for AR viewer
- "Users can insert their own objects" - User-specific creation
- "Users can update their own objects" - Owner-only updates
- "Users can delete their own objects" - Owner-only deletion
- JWT-based user identification via wallet address

### Shared Tables with AR Viewer

- **deployed_objects** - Complete agent data consumed by AR viewer
- **Real-time subscriptions** - AR viewer subscribes to agent updates
- **Payment tracking** - Shared payment status monitoring
- **Location data** - GPS coordinates for AR positioning

### External API Integrations

**Revolut Merchant API (Bank Payments):**

```javascript
// Backend endpoints (Express server on port 5174)
POST /api/revolut/create-bank-order - Bank QR payment creation
POST /api/revolut/process-virtual-card-payment - Apple/Google Pay processing
POST /api/revolut/webhook - Payment status notifications from Revolut
GET /api/revolut/payment-status/:sessionId - Check payment status
```

**Blockchain APIs:**

- **ThirdWeb SDK** - Contract interaction and wallet management across all EVM chains
- **Hedera SDK** - Account creation, NFT minting, token transfers, A2A communication
- **Solana Web3.js** - Transaction processing, SPL token operations, account management

**MCP (Model Context Protocol) Integrations:**

- **Filesystem MCP** - File system operations
- **Memory MCP** - Persistent memory for agents
- **Search MCP** - Web search capabilities
- **Educational MCP** - Learning content generation
- **X402 MCP** - Micropayment-gated API access

### Environment Variables (Complete List)

```env
# Database Configuration
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Blockchain Configuration
VITE_THIRDWEB_CLIENT_ID=299516306b51bd6356fd8995ed628950
VITE_THIRDWEB_SECRET_KEY=your_thirdweb_secret_key_here

# Hedera Configuration
VITE_TREASURY_ACCOUNT_ID=0.0.xxxxxxx
VITE_TREASURY_PRIVATE_KEY=302e020100300506032b657004220420...
VITE_ERC8004_CONTRACT_ID=0.0.xxxxxxx
VITE_USDH_TOKEN_ID=0.0.7218375

# Payment API Configuration
REVOLUT_API_KEY=sandbox_api_key_here
REVOLUT_WEBHOOK_URL=https://ngrok-url.com/api/revolut/webhook

# External Service Configuration
VITE_NEXUS_API_URL=https://nexus.thirdweb.com/api
VITE_A2A_BASE_URL=http://localhost:3001

# Development Configuration
NODE_ENV=development
PORT=5174
```

**CORS & Security Configuration:**

```typescript
// vite.config.ts
server: {
  port: 5174,
  allowedHosts: [
    "6529c4b46a03.ngrok-free.app",
    "8323ecb51478.ngrok-free.app",
    // Multiple ngrok tunnels for development
  ],
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://6529c4b46a03.ngrok-free.app",
      // Ngrok URLs for cross-codespace communication
    ],
    credentials: true,
  }
}
```

### Backend API Endpoints (Express Server)

```javascript
// server.js - Main backend server
app.listen(5174, () => {
  console.log('AgentSphere backend running on port 5174');
});

// API Routes
GET /api/health - Health check
POST /api/revolut/create-bank-order - Bank QR payment creation
POST /api/revolut/process-virtual-card-payment - Virtual card processing
POST /api/revolut/webhook - Revolut webhook handler
GET /api/agents - List all deployed agents
POST /api/agents - Create new agent
PUT /api/agents/:id - Update agent
DELETE /api/agents/:id - Delete agent
GET /api/payment-sessions/:id - Get payment session status
```

---

## 5. KEY DOCUMENTATION

### Main Documentation Files

- **README.md** (305 lines) - Quick start guide, deployment status, production agents list
- **AgentSphere_Technical_Summary.md** (77 lines) - Technical architecture overview with mermaid diagrams
- **AgentSphere_Project_Summary.md** - Project goals, features, and business model

### Architecture Documentation

- **HEDERA_AI_AGENT_KIT_GUIDE.md** (449 lines) - Complete Hedera integration guide with A2A and x402
- **A2A_ARCHITECTURE_COMPLETE_SUMMARY.md** - Agent-to-Agent communication architecture
- **AGENT_WALLET_ARCHITECTURE.md** - Multi-wallet system design and implementation
- **AGENT_IDENTITY_SYSTEM_SUMMARY.md** - ERC-8004 identity NFT system

### Integration Guides

- **REVOLUT_INTEGRATION_COMPLETE_GUIDE.md** (942 lines) - Bank payment integration with codespace setup
- **API_DOCUMENTATION_POLYGON_AMOY_SOLANA_DEVNET.md** - Multi-chain API reference
- **DYNAMIC_PAYMENT_SYSTEM_DOCUMENTATION.md** (812 lines) - Payment terminal implementation
- **CCIP_IMPLEMENTATION_LEADERSHIP_SUMMARY.md** - Cross-chain payment routing

### Database Migration Documentation

```
supabase/migrations/ (20+ migration files)
├── 20250103120000_payment_cube_system.sql - 6-faced payment system
├── 20250623121541_gentle_paper.sql - Initial deployed_objects table
├── 20250830120000_multi_chain_support.sql (323 lines) - Multi-chain deployment
├── 20250802120000_agent_card_fields.sql - Agent identity fields
├── 20250802130000_add_mcp_services.sql - MCP integration fields
└── [Additional migrations for features and bug fixes]
```

### Recent Session Summaries

- **CHAT_SESSION_SUMMARY_DYNAMIC_FEES_DEPLOYMENT.md** - Dynamic fee implementation session
- **SESSION_SUMMARY_TRAVEL_AGENT_ARCHITECTURE.md** - Travel agent coordination development
- **REVOLUT_INTEGRATION_FINAL_STATUS.md** - Payment integration completion status
- **TRAVEL_AGENT_MCP_SESSION_SUMMARY.md** - MCP integration for travel agents

### Testing & Deployment Documentation

- **TESTING_GUIDE_DYNAMIC_FEES.md** - Dynamic payment system testing procedures
- **MOBILE_AR_DEPLOYMENT_GUIDE.md** - Mobile AR testing and deployment
- **NGROK_SETUP_COMPLETE.md** - Development environment setup with ngrok tunnels

### Feature Implementation Summaries

- **PAYMENT_CUBE_IMPLEMENTATION_COMPLETE.md** - 6-faced payment system implementation
- **MULTI_AGENT_TRAVEL_FLOW_USECASE.md** - Multi-agent travel coordination use case
- **AR_CAMERA_IMPLEMENTATION_SUMMARY.md** - AR camera placement feature

---

## 6. SPECIFIC QUESTIONS ANSWERED

### 1. Shared vs Separate Logic

**Duplicated Services Between Apps:**

- **Wallet Connection Logic** - Multi-chain wallet management patterns
- **Network Configuration** - multiChainNetworks.ts definitions
- **Agent Type Utilities** - agentTypeUtils.ts normalization functions
- **Supabase Client Setup** - Database connection initialization
- **Payment Processing** - Crypto and bank payment handlers

**Extractable Shared Packages:**

```typescript
// Recommended shared packages for monorepo
@agentsphere/wallet-connector
├── MultiWalletConnector component
├── Wallet service classes
├── Network detection utilities
└── Types and interfaces

@agentsphere/network-config
├── EVM network definitions
├── Solana network configurations
├── Hedera network setup
└── CCIP cross-chain mappings

@agentsphere/agent-types
├── Agent type normalization
├── Type validation utilities
├── Database schema types
└── Migration helpers

@agentsphere/payment-cube
├── PaymentMethodsSelector component
├── Payment validation logic
├── Revolut API integration
└── Crypto payment handlers

@agentsphere/database-client
├── Supabase client wrapper
├── RLS policy helpers
├── Real-time subscription managers
└── Migration utilities
```

### 2. Complete Database Schema

**deployed_objects Table (Full Production Schema):**

```sql
CREATE TABLE public.deployed_objects (
    -- Primary key and identity
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    agent_type text NOT NULL,
    user_id text NOT NULL, -- wallet address for authentication

    -- Location data (critical for AR positioning)
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    altitude double precision,
    preciselatitude double precision, -- RTK-enhanced positioning
    preciselongitude double precision,
    precisealtitude double precision,
    accuracy double precision,
    correctionapplied boolean DEFAULT false,
    location_type text DEFAULT 'Street'::text,
    rtk_enhanced boolean DEFAULT false,
    rtk_provider text,

    -- AR and 3D configuration
    visibility_range integer DEFAULT 25, -- meters
    interaction_range integer DEFAULT 15, -- meters
    trailing_agent boolean DEFAULT false,
    ar_notifications boolean DEFAULT true,
    model_url text,
    model_type text,
    scale_x double precision DEFAULT 1.0,
    scale_y double precision DEFAULT 1.0,
    scale_z double precision DEFAULT 1.0,
    rotation_x double precision DEFAULT 0.0,
    rotation_y double precision DEFAULT 0.0,
    rotation_z double precision DEFAULT 0.0,

    -- Multi-chain deployment (JSONB for flexibility)
    deployment_network jsonb DEFAULT '{}'::jsonb,
    network_config jsonb DEFAULT '{}'::jsonb,
    cross_chain_config jsonb DEFAULT '{}'::jsonb,
    supported_networks jsonb DEFAULT '[]'::jsonb,

    -- Payment system (6-faced cube)
    payment_methods jsonb DEFAULT '{}'::jsonb,
    payment_config jsonb DEFAULT '{}'::jsonb,
    interaction_fee_usdfc numeric DEFAULT 10,
    fee_type text DEFAULT 'fixed'::text, -- 'fixed' | 'dynamic'
    currency_type text DEFAULT 'USDC'::text,
    token_symbol text DEFAULT 'USDC'::text,

    -- Agent capabilities and interactions
    interaction_methods jsonb, -- {text_chat, voice_chat, video_chat, defi_features}
    mcp_integrations jsonb DEFAULT '[]'::jsonb,
    mcp_services jsonb DEFAULT '[]'::jsonb,

    -- Hedera AI Agent Kit
    hedera_account_id text,
    hedera_private_key text, -- encrypted storage
    identity_nft_id text,
    a2a_endpoint text,
    x402_enabled boolean DEFAULT false,

    -- Legacy blockchain fields (maintained for backward compatibility)
    network text,
    chain_id integer,
    contract_address text,
    deployment_tx text,
    deployment_block integer,
    gas_used integer,
    agent_wallet_address text,
    agent_wallet_type text,
    owner_wallet text,

    -- System and audit fields
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),

    -- Additional configuration
    chat_enabled boolean DEFAULT true,
    voice_enabled boolean DEFAULT false,
    defi_enabled boolean DEFAULT false,
    staking_rewards boolean DEFAULT false,
    yield_generation boolean DEFAULT false,

    -- Eliza AI integration
    eliza_config jsonb,

    -- Chainlink integration
    chainlink_config jsonb,

    -- Tokenization features
    tokenization_config jsonb
);

-- Indexes for performance
CREATE INDEX idx_deployed_objects_user_id ON deployed_objects(user_id);
CREATE INDEX idx_deployed_objects_location ON deployed_objects(latitude, longitude);
CREATE INDEX idx_deployed_objects_agent_type ON deployed_objects(agent_type);
CREATE INDEX idx_deployed_objects_chain_id ON deployed_objects(chain_id);
CREATE INDEX idx_deployed_objects_created_at ON deployed_objects(created_at);

-- JSONB indexes for complex queries
CREATE INDEX idx_deployed_objects_deployment_network ON deployed_objects USING GIN (deployment_network);
CREATE INDEX idx_deployed_objects_payment_methods ON deployed_objects USING GIN (payment_methods);
CREATE INDEX idx_deployed_objects_mcp_integrations ON deployed_objects USING GIN (mcp_integrations);
CREATE INDEX idx_deployed_objects_supported_networks ON deployed_objects USING GIN (supported_networks);

-- Row Level Security policies
ALTER TABLE deployed_objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read deployed objects" ON deployed_objects
    FOR SELECT TO public USING (true);

CREATE POLICY "Users can insert their own objects" ON deployed_objects
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Users can update their own objects" ON deployed_objects
    FOR UPDATE TO public
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own objects" ON deployed_objects
    FOR DELETE TO public
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

**Supporting Database Functions:**

```sql
-- Validation functions
CREATE OR REPLACE FUNCTION validate_multi_chain_deployment(deployment jsonb)
RETURNS boolean AS $$
BEGIN
    IF NOT (deployment ? 'primary') THEN
        RETURN FALSE;
    END IF;

    IF NOT (deployment->'primary' ? 'chainId' AND
            deployment->'primary' ? 'name' AND
            deployment->'primary' ? 'type') THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Query functions
CREATE OR REPLACE FUNCTION get_agents_by_network(target_chain_id integer)
RETURNS TABLE(
    id uuid,
    name text,
    description text,
    location jsonb,
    agent_type text,
    primary_network jsonb,
    network_deployment jsonb,
    interaction_fee_usdfc numeric,
    created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        do.id,
        do.name,
        do.description,
        jsonb_build_object(
            'latitude', do.latitude,
            'longitude', do.longitude,
            'altitude', do.altitude
        ) as location,
        do.agent_type,
        do.deployment_network->'primary' as primary_network,
        CASE
            WHEN (do.deployment_network->'primary'->>'chainId')::integer = target_chain_id
            THEN do.deployment_network->'primary'
            ELSE (
                SELECT network_deployment
                FROM jsonb_array_elements(do.deployment_network->'additional') AS network_deployment
                WHERE (network_deployment->>'chainId')::integer = target_chain_id
                LIMIT 1
            )
        END as network_deployment,
        do.interaction_fee_usdfc,
        do.created_at
    FROM public.deployed_objects do
    WHERE
        do.supported_networks ? target_chain_id::text OR
        (do.deployment_network->'primary'->>'chainId')::integer = target_chain_id;
END;
$$ LANGUAGE plpgsql;
```

### 3. Payment Configuration Flow

**Step-by-Step Payment Configuration:**

1. **Agent Type Selection** → If payment terminal type selected, dynamic fees enabled automatically
2. **Payment Method Selection** → 6-faced cube interface opens with all payment options
3. **Method Configuration:**
   - **Crypto QR:** User enters wallet address, selects supported chains
   - **Bank Virtual Card:** Bank details form for Apple/Google Pay
   - **Bank QR:** Traditional bank account information
   - **Voice Pay:** Voice command wallet configuration
   - **Sound Pay:** Audio trigger setup
   - **Onboard Crypto:** Educational content configuration
4. **Validation Layer:**
   - At least one payment method must be enabled
   - Crypto methods require wallet connection
   - Bank methods require complete bank details
   - Real-time validation with error display
5. **Database Storage:**
   ```json
   {
     "payment_methods": {
       "crypto_qr": {"enabled": true, "wallet_address": "0x..."},
       "bank_virtual_card": {"enabled": true, "bank_details": {...}},
       // ... other methods
     },
     "payment_config": {
       "revenue_sharing": {"user": 70, "platform": 30},
       "fee_type": "fixed" | "dynamic",
       "supported_currencies": ["USDC", "USDT", "DAI"]
     }
   }
   ```
6. **AR Viewer Integration:** Real-time sync enables immediate payment processing

**Payment Processing Integration:**

```typescript
// Payment method validation
const validatePaymentMethods = (methods: PaymentMethod) => {
  const enabledMethods = Object.values(methods).some(
    (method) => method.enabled,
  );
  if (!enabledMethods) {
    throw new Error("At least one payment method required");
  }

  // Validate crypto methods require wallet
  if (methods.crypto_qr.enabled && !methods.crypto_qr.wallet_address) {
    throw new Error("Crypto QR requires wallet address");
  }

  // Validate bank methods require details
  if (
    methods.bank_virtual_card.enabled &&
    !methods.bank_virtual_card.bank_details
  ) {
    throw new Error("Virtual card requires bank details");
  }
};
```

### 4. Agent Deployment Flow

**Complete Deployment Workflow:**

1. **User Agent Configuration:**

   ```typescript
   // DeployObject.tsx - Configuration collection
   const deploymentData = {
     name: "My Payment Terminal",
     agent_type: "payment_terminal",
     location: {latitude, longitude, altitude},
     payment_methods: {...},
     network_config: {...}
   };
   ```

2. **Multi-Chain Network Selection:**
   - Primary network selection (where agent is initially deployed)
   - Optional additional networks for cross-chain deployment
   - Network-specific configuration (gas fees, token addresses)
3. **Database Transaction:**

   ```typescript
   // Insert complete agent record
   const { data, error } = await supabase
     .from("deployed_objects")
     .insert(deploymentData)
     .select("*");
   ```

4. **Blockchain Registration (Optional):**

   ```typescript
   // Hedera AI Agent Kit integration
   if (agentType.includes("hedera")) {
     const agentWallet = await createAgentWallet();
     const identityNFT = await mintAgentIdentityNFT(agentData);
     // Update database with blockchain data
   }
   ```

5. **Real-Time Synchronization:**

   ```typescript
   // AR viewer receives instant updates
   supabase
     .channel("deployed_objects_changes")
     .on("postgres_changes", { event: "INSERT" }, (payload) => {
       // New agent appears in AR immediately
     });
   ```

6. **Payment Activation:**
   - Agent becomes available for interactions
   - Payment methods are active and validated
   - Revenue sharing rules applied

**On-Chain vs Off-Chain Considerations:**

- **Off-Chain:** Agent metadata, configuration, location data
- **On-Chain:** Agent identity NFTs (Hedera), payment transactions
- **Hybrid:** Agent registration references on-chain identity

### 5. Tech Debt & Code Quality Assessment

**Current Code Quality Issues:**

1. **Mixed JavaScript/TypeScript:**
   - `revolutApiClient.js` should be TypeScript
   - Several utility files still in JavaScript
2. **Large Component Files:**
   - `DeployObject.tsx` (3024 lines) - Should be split into sub-components
   - `MultiChainAgentDashboard.tsx` (1076 lines) - Could be modularized
   - `agentDataService.ts` (883 lines) - Should be split by functionality

3. **Missing Type Definitions:**
   - Some services lack complete TypeScript interfaces
   - JSONB database fields need stronger typing
   - Payment method types could be more specific

4. **Duplicate Logic:**
   - Wallet connection patterns repeated across components
   - Network switching logic duplicated
   - Validation patterns could be centralized

**Current React Patterns (Strengths):**

- ✅ Modern hooks usage throughout (useState, useEffect, useCallback)
- ✅ Custom hooks for complex logic
- ✅ Functional components only (no class components)
- ✅ Proper prop drilling and composition patterns
- ✅ Framer Motion animations with proper performance optimization

**Areas Requiring Modernization for Rebuild:**

1. **Component Architecture:**

   ```typescript
   // Current: Large monolithic components
   <DeployObject /> // 3024 lines

   // Recommended: Composed micro-components
   <DeploymentWizard>
     <AgentConfigStep />
     <LocationStep />
     <PaymentMethodStep />
     <NetworkSelectionStep />
     <ReviewStep />
   </DeploymentWizard>
   ```

2. **State Management:**

   ```typescript
   // Current: Local component state
   const [agents, setAgents] = useState([]);

   // Recommended: Global state management
   import { useAgentStore } from "@agentsphere/state";
   const { agents, loadAgents } = useAgentStore();
   ```

3. **Type Safety:**

   ```typescript
   // Current: Loose typing
   const agentData: any = {...};

   // Recommended: Strict typing
   const agentData: AgentDeploymentConfig = {...};
   ```

**Test Coverage Assessment:**

- **Current:** No visible test files in the repository
- **Recommended:**
  - Unit tests for all services
  - Integration tests for payment flows
  - E2E tests for deployment workflow
  - Component testing with React Testing Library

**Performance Considerations:**

- Real-time subscriptions properly managed
- Large form components could benefit from virtualization
- Database queries optimized with proper indexing
- Bundle size could be optimized with code splitting

---

## 7. MODERNIZATION RECOMMENDATIONS FOR REBUILD

### Recommended Architecture for New Monorepo

**1. Monorepo Structure (Turborepo/Nx):**

```
agentsphere-monorepo/
├── apps/
│   ├── deployment-app/          # Agent deployment interface
│   ├── ar-viewer-app/           # AR viewing application
│   ├── api-server/              # Backend API services
│   └── admin-dashboard/         # Administrative interface
├── packages/
│   ├── shared-ui/               # Common UI components
│   ├── wallet-connector/        # Multi-chain wallet management
│   ├── network-config/          # Blockchain network definitions
│   ├── payment-cube/            # Payment system components
│   ├── agent-types/             # Agent type utilities
│   ├── database-client/         # Supabase client wrapper
│   └── types/                   # Shared TypeScript types
├── tools/
│   ├── eslint-config/           # Shared linting rules
│   └── tsconfig/                # Shared TypeScript configs
└── docs/
    ├── api/                     # API documentation
    └── guides/                  # Implementation guides
```

**2. Technology Stack Updates:**

```json
{
  "frontend": {
    "react": "18.3.0",
    "typescript": "5.4.0",
    "vite": "5.2.0",
    "tailwindcss": "3.4.0"
  },
  "stateManagement": {
    "zustand": "4.5.0",
    "jotai": "2.8.0"
  },
  "blockchain": {
    "@thirdweb-dev/react": "5.0.0",
    "@solana/web3.js": "2.0.0",
    "@hashgraph/sdk": "3.0.0"
  },
  "database": {
    "@supabase/supabase-js": "2.43.0"
  },
  "testing": {
    "vitest": "1.6.0",
    "@testing-library/react": "15.0.0",
    "playwright": "1.44.0"
  }
}
```

**3. Modern Development Practices:**

- **TypeScript First:** Complete type safety throughout
- **Component Testing:** Comprehensive test coverage
- **Micro-frontends:** Modular application architecture
- **API-First Design:** Well-defined service interfaces
- **Real-time by Default:** WebSocket/Supabase real-time integration
- **Mobile-First:** Progressive Web App capabilities
- **Performance Monitoring:** Built-in analytics and monitoring

**4. Enhanced Features for Rebuild:**

- **Additional Cryptocurrency Support:** Bitcoin Lightning, Ethereum Layer 2s
- **Enhanced AR Capabilities:** Improved WebXR integration
- **Advanced Analytics:** Real-time usage and revenue tracking
- **Multi-language Support:** Internationalization framework
- **Advanced Security:** Enhanced wallet security and fraud prevention
- **Scalability:** Microservice architecture for backend components

This comprehensive analysis provides a complete foundation for rebuilding AgentSphere with modern architecture, enhanced features, and improved maintainability. The detailed documentation of existing patterns, database schema, and integration points ensures no functionality is lost in the transition to the new monorepo structure.
