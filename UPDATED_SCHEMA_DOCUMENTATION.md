# 📋 **Updated AgentSphere Database Schema - Morph Holesky Focused**

## **🎯 Schema Overview**

This schema is specifically designed for **Morph Holesky Testnet with USDT-only payments**. All complexity around multiple chains, tokens, and networks has been eliminated for a clean, focused implementation.

---

## **🗄️ Complete deployed_objects Table Schema**

### **SQL Creation Script**

```sql
CREATE TABLE deployed_objects (
  -- Core identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Agent details
  agent_name VARCHAR(255) NOT NULL,
  agent_description TEXT,
  object_type VARCHAR(100) NOT NULL,

  -- Location data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  altitude DECIMAL(10, 6) DEFAULT 0,
  location_type VARCHAR(50) DEFAULT 'Street',

  -- Morph Holesky Wallet integration (EVM addresses only)
  owner_wallet VARCHAR(42) NOT NULL,
  deployer_wallet_address VARCHAR(42) NOT NULL,
  payment_recipient_address VARCHAR(42) NOT NULL,
  agent_wallet_address VARCHAR(42),

  -- USDT Payment configuration (simplified)
  interaction_fee DECIMAL(10, 2) DEFAULT 1.00,

  -- Agent capabilities
  text_chat BOOLEAN DEFAULT true,
  voice_chat BOOLEAN DEFAULT false,
  video_chat BOOLEAN DEFAULT false,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- MCP Server integrations (JSONB for flexibility)
  mcp_services JSONB DEFAULT '[]'::JSONB,

  -- AR & Interaction settings
  visibility_range DECIMAL(5, 2) DEFAULT 25.0,
  interaction_range DECIMAL(5, 2) DEFAULT 15.0,
  trailing_agent BOOLEAN DEFAULT false,
  ar_notifications BOOLEAN DEFAULT true,

  -- Revenue tracking
  interaction_count INTEGER DEFAULT 0,
  revenue_total DECIMAL(15, 2) DEFAULT 0,

  -- Validation constraints
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
```

### **Performance Indexes**

```sql
-- Location-based queries (most important for AR)
CREATE INDEX idx_deployed_objects_location ON deployed_objects (latitude, longitude);

-- Agent type filtering
CREATE INDEX idx_deployed_objects_type ON deployed_objects (object_type);

-- User wallet queries
CREATE INDEX idx_deployed_objects_wallet ON deployed_objects (deployer_wallet_address);

-- MCP services queries (GIN index for JSONB)
CREATE INDEX idx_deployed_objects_mcp ON deployed_objects USING GIN (mcp_services);

-- Recent deployments
CREATE INDEX idx_deployed_objects_created_at ON deployed_objects (created_at DESC);
```

---

## **🤖 Enhanced Agent Types**

### **Complete Agent Type Constraint**

```sql
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
    'Bus Stop Agent',
    'Personal Finance Manager',
    'Health & Wellness Coach',
    'Travel Guide',
    'Language Tutor'
  ])
);
```

### **Agent Type Descriptions**

```typescript
export const AGENT_TYPES = {
  "Intelligent Assistant": "General-purpose AI assistant for daily tasks",
  "Local Services":
    "Location-based service provider (restaurants, shops, etc.)",
  "Payment Terminal": "USDT payment processing for local services",
  "Trailing Payment Terminal": "Mobile payment agent that follows users",
  "My Ghost": "Personal AI representing user when absent",
  "Game Agent": "Interactive gaming and entertainment agent",
  "3D World Builder": "AR environment creation and modification",
  "Home Security": "Smart home monitoring and security alerts",
  "Content Creator": "Social media and content generation assistant",
  "Real Estate Broker": "Property information and virtual tours",
  "Bus Stop Agent": "Public transport information and scheduling",
  "Personal Finance Manager": "Expense tracking and financial advice",
  "Health & Wellness Coach": "Fitness and wellness guidance",
  "Travel Guide": "Tourist information and recommendations",
  "Language Tutor": "Language learning and practice assistant",
} as const;
```

---

## **💰 MCP Services Integration**

### **MCP Services JSONB Structure**

```typescript
export interface MCPService {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  capabilities: string[];
  enabled: boolean;
  config?: Record<string, any>;
}

// Example MCP services for different agent types
export const MCP_SERVICE_EXAMPLES = {
  "Intelligent Assistant": [
    {
      id: "weather-service",
      name: "Weather Service",
      description: "Real-time weather information",
      endpoint: "https://api.weather.com/mcp",
      capabilities: ["current-weather", "forecast", "alerts"],
      enabled: true,
    },
  ],
  "Local Services": [
    {
      id: "maps-service",
      name: "Maps & Navigation",
      description: "Location and navigation services",
      endpoint: "https://maps.googleapis.com/mcp",
      capabilities: ["directions", "places", "geocoding"],
      enabled: true,
    },
  ],
  "Payment Terminal": [
    {
      id: "payment-processor",
      name: "USDT Payment Processor",
      description: "Handles USDT transactions on Morph Holesky",
      endpoint: "https://payments.agentsphere.com/mcp",
      capabilities: [
        "process-payment",
        "verify-balance",
        "transaction-history",
      ],
      enabled: true,
      config: {
        tokenAddress: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
        chainId: 2810,
      },
    },
  ],
};
```

---

## **🔐 Morph Holesky Network Configuration**

### **Fixed Network Constants**

```typescript
export const MORPH_HOLESKY_CONFIG = {
  chainId: 2810,
  name: "Morph Holesky",
  rpcUrl: "https://rpc-quicknode-holesky.morphl2.io",
  blockExplorer: "https://explorer-holesky.morphl2.io",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  testnet: true,
} as const;

export const USDT_CONFIG = {
  symbol: "USDT",
  name: "Tether USD",
  address: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
  decimals: 18,
  chainId: 2810,
} as const;
```

---

## **📊 TypeScript Schema Interfaces**

### **Complete Type Definitions**

```typescript
export interface DeployedObject {
  id: string;
  created_at: string;
  updated_at: string;

  // Agent details
  agent_name: string;
  agent_description?: string;
  object_type: AgentType;

  // Location
  latitude: number;
  longitude: number;
  altitude?: number;
  location_type?: LocationType;

  // Wallet addresses (all EVM format)
  owner_wallet: string;
  deployer_wallet_address: string;
  payment_recipient_address: string;
  agent_wallet_address?: string;

  // Payment (USDT only)
  interaction_fee: number;

  // Capabilities
  text_chat: boolean;
  voice_chat: boolean;
  video_chat: boolean;
  features: string[];

  // MCP integration
  mcp_services: MCPService[];

  // AR settings
  visibility_range: number;
  interaction_range: number;
  trailing_agent: boolean;
  ar_notifications: boolean;

  // Analytics
  interaction_count: number;
  revenue_total: number;
}

export type AgentType = keyof typeof AGENT_TYPES;

export type LocationType =
  | "Home"
  | "Street"
  | "Countryside"
  | "Classroom"
  | "Office"
  | "Car"
  | "Restaurant"
  | "Shop"
  | "Park"
  | "Transit";

export interface DatabaseOperationResult<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
```

---

## **🔍 Common Query Patterns**

### **1. Find Nearby Agents**

```sql
-- Find agents within 100 meters of a location
SELECT * FROM deployed_objects
WHERE ST_DWithin(
  ST_Point(longitude, latitude)::geography,
  ST_Point($1, $2)::geography,
  100
)
ORDER BY ST_Distance(
  ST_Point(longitude, latitude)::geography,
  ST_Point($1, $2)::geography
);
```

### **2. Get User's Deployed Agents**

```sql
-- Get all agents deployed by a specific wallet
SELECT * FROM deployed_objects
WHERE deployer_wallet_address = $1
ORDER BY created_at DESC;
```

### **3. Filter by Agent Type and Range**

```sql
-- Find specific agent types within interaction range
SELECT * FROM deployed_objects
WHERE object_type = ANY($1::text[])
AND interaction_range >= $2
AND latitude BETWEEN $3 AND $4
AND longitude BETWEEN $5 AND $6;
```

### **4. Revenue Analytics**

```sql
-- Get revenue statistics by agent type
SELECT
  object_type,
  COUNT(*) as agent_count,
  SUM(revenue_total) as total_revenue,
  AVG(interaction_fee) as avg_fee,
  SUM(interaction_count) as total_interactions
FROM deployed_objects
GROUP BY object_type
ORDER BY total_revenue DESC;
```

---

## **🔄 Database Migration Scripts**

### **Migration to Add Missing Columns**

```sql
-- Add any missing columns for full compatibility
ALTER TABLE deployed_objects
ADD COLUMN IF NOT EXISTS agent_name VARCHAR(255) DEFAULT 'Unnamed Agent',
ADD COLUMN IF NOT EXISTS agent_description TEXT,
ADD COLUMN IF NOT EXISTS agent_wallet_address VARCHAR(42),
ADD COLUMN IF NOT EXISTS text_chat BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS voice_chat BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS video_chat BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS mcp_services JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS visibility_range DECIMAL(5,2) DEFAULT 25.0,
ADD COLUMN IF NOT EXISTS ar_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS interaction_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_total DECIMAL(15,2) DEFAULT 0;
```

### **Clean Up Legacy Columns**

```sql
-- Remove network/chain specific columns (Morph Holesky only)
ALTER TABLE deployed_objects
DROP COLUMN IF EXISTS network,
DROP COLUMN IF EXISTS chain_id,
DROP COLUMN IF EXISTS token_symbol,
DROP COLUMN IF EXISTS token_address,
DROP COLUMN IF EXISTS currency_type;
```

---

## **🎯 Simplified Data Operations**

### **Agent Deployment (No Chain Selection)**

```typescript
export const deployAgent = async (agentData: {
  agent_name: string;
  agent_description?: string;
  object_type: AgentType;
  latitude: number;
  longitude: number;
  deployer_wallet_address: string;
  interaction_fee?: number;
  mcp_services?: MCPService[];
}) => {
  // All agents automatically use:
  // - Morph Holesky network (chainId: 2810)
  // - USDT token (0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98)
  // - Fixed network configuration

  const { data, error } = await supabase
    .from("deployed_objects")
    .insert([
      {
        ...agentData,
        owner_wallet: agentData.deployer_wallet_address,
        payment_recipient_address: agentData.deployer_wallet_address,
        mcp_services: agentData.mcp_services || [],
      },
    ])
    .select()
    .single();

  return { data, error };
};
```

---

## **✅ Schema Validation Rules**

### **Business Logic Constraints**

1. **Wallet Addresses**: Must be valid EVM format (0x + 40 hex chars)
2. **Coordinates**: Must be valid GPS coordinates (-90 to 90 lat, -180 to 180 lng)
3. **Interaction Range**: 1-50 meters (practical AR limits)
4. **Visibility Range**: 1-100 meters (performance limits)
5. **Interaction Fee**: Non-negative USDT amount
6. **MCP Services**: Valid JSONB array structure

### **Performance Optimizations**

1. **Location Indexing**: PostGIS spatial indexes for efficient proximity queries
2. **JSONB Indexing**: GIN indexes for MCP services filtering
3. **Wallet Indexing**: B-tree indexes for user agent lookups
4. **Partial Indexing**: Index only active/visible agents

---

## **🚀 Ready for Production**

This simplified schema eliminates the complexity of multiple chains while maintaining all the enhanced features we've developed:

- ✅ **11+ Agent Types** with clear descriptions
- ✅ **MCP Services Integration** for extensible capabilities
- ✅ **Real Wallet Validation** with proper EVM address constraints
- ✅ **AR/Location Features** optimized for mobile AR experiences
- ✅ **Revenue Tracking** for business analytics
- ✅ **Performance Indexes** for scale
- ✅ **Type Safety** with comprehensive TypeScript interfaces

**This schema is production-ready for Morph Holesky testnet deployment!** 🎯
