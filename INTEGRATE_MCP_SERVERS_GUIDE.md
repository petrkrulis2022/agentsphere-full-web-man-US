# Integration Guide: MCPServerIntegrations into DeployObject.tsx

**Date:** February 5, 2026  
**Purpose:** Step-by-step guide to add financial MCP servers to the deployment form

---

## Overview

This guide shows exactly how to integrate the new `MCPServerIntegrations` component into your existing `DeployObject.tsx` form.

---

## Step 1: Import the Component

**Location in DeployObject.tsx:** Top imports section (around line 30-40)

```tsx
// Add this import with your other component imports
import MCPServerIntegrations from "./MCPServerIntegrations";
```

---

## Step 2: Add State Variables

**Location in DeployObject.tsx:** State section (around line 140-200)

Add these three state variables after your existing agent configuration states:

```tsx
// MCP Server configuration states
const [selectedMcpServers, setSelectedMcpServers] = useState<string[]>([]);
const [mcpServersConfig, setMcpServersConfig] = useState<Record<string, any>>(
  {},
);
const [mcpServersLoading, setMcpServersLoading] = useState(false);
```

**Full context example:**

```tsx
// ... existing state variables ...
const [exchangeIntegrations, setExchangeIntegrations] = useState<string[]>([]);

// MCP Server configuration
const [selectedMcpServers, setSelectedMcpServers] = useState<string[]>([]);
const [mcpServersConfig, setMcpServersConfig] = useState<Record<string, any>>(
  {},
);
const [mcpServersLoading, setMcpServersLoading] = useState(false);

// ... rest of component ...
```

---

## Step 3: Add Handler Functions

**Location:** Add after validation functions (around line 1100-1200)

```tsx
// MCP Server handlers
const handleMcpServerToggle = (serverId: string) => {
  setSelectedMcpServers((prev) =>
    prev.includes(serverId)
      ? prev.filter((id) => id !== serverId)
      : [...prev, serverId],
  );
};

const handleMcpServerConfigUpdate = (
  serverId: string,
  config: Record<string, any>,
) => {
  setMcpServersConfig((prev) => ({
    ...prev,
    [serverId]: config,
  }));
};

// Validate MCP servers configuration
const validateMcpServers = (): boolean => {
  // Check if required servers are configured correctly
  for (const serverId of selectedMcpServers) {
    const config = mcpServersConfig[serverId];
    if (!config || Object.keys(config).length === 0) {
      setFormErrors((prev) => ({
        ...prev,
        mcpServers: `Please configure ${serverId}`,
      }));
      return false;
    }
  }
  return true;
};
```

---

## Step 4: Integrate into Validation Logic

**Location:** In your `validateForm()` or validation section (around line 1000-1100)

Add MCP server validation:

```tsx
// In validateForm function, add:
if (agentType === "home_security") {
  // Virtual Terminal agents
  if (!validatePaymentMethods()) return false;
  // Add MCP server validation for Virtual Terminals
  if (selectedMcpServers.length > 0 && !validateMcpServers()) {
    return false;
  }
} else {
  // Other agent types
  if (!validatePaymentMethods()) return false;
  // Add MCP server validation for other agents too
  if (selectedMcpServers.length > 0 && !validateMcpServers()) {
    return false;
  }
}
```

---

## Step 5: Add to Deployment Data

**Location:** In `deploymentData` object (around line 1500-1600)

Add MCP server data to the deployment payload:

```tsx
const deploymentData = {
  // ... existing fields ...
  agent_name: agentName,
  agent_type: agentType,

  // ... existing bank/exchange integrations ...
  bank_integrations: bankIntegrations,
  exchange_integrations: exchangeIntegrations,
  terminal_display_config: terminalDisplayConfig,

  // Add MCP servers configuration
  mcp_services: selectedMcpServers,
  mcp_servers: selectedMcpServers.reduce(
    (acc, serverId) => {
      acc[serverId] = {
        enabled: true,
        config: mcpServersConfig[serverId] || {},
      };
      return acc;
    },
    {} as Record<string, any>,
  ),

  // ... rest of deployment data ...
};
```

**Full context:**

```tsx
const deploymentData = {
  // Agent identity
  agent_name: agentName,
  agent_type: agentType,
  description: description,
  image_url: selectedImage,
  latitude: location?.latitude || 0,
  longitude: location?.longitude || 0,
  timezone: timezone,

  // Virtual Terminal (if applicable)
  ...(agentType === "home_security" && {
    payment_methods: null,
    bank_integrations: bankIntegrations,
    exchange_integrations: exchangeIntegrations,
    terminal_display_config: terminalDisplayConfig,
  }),

  // MCP Servers (all agent types)
  mcp_services: selectedMcpServers,
  mcp_servers: selectedMcpServers.reduce(
    (acc, serverId) => {
      acc[serverId] = {
        enabled: true,
        config: mcpServersConfig[serverId] || {},
      };
      return acc;
    },
    {} as Record<string, any>,
  ),

  // Wallet & blockchain
  wallet_address: walletAddress,
  blockchain_network: blockchainNetwork,

  // ... rest of fields ...
};
```

---

## Step 6: Add UI to Form

**Location:** In JSX return section, add after Bank/Exchange Integrations (around line 2800)

```tsx
{
  /* MCP Server Integrations Section */
}
{
  agentType === "home_security" && (
    <div className="mt-6 pt-6 border-t border-slate-700">
      <MCPServerIntegrations
        selectedServers={selectedMcpServers}
        onToggleServer={handleMcpServerToggle}
        onConfigUpdate={handleMcpServerConfigUpdate}
        className="mb-4"
      />
    </div>
  );
}

{
  /* OR for all agent types: */
}
<div className="mt-6 pt-6 border-t border-slate-700">
  <MCPServerIntegrations
    selectedServers={selectedMcpServers}
    onToggleServer={handleMcpServerToggle}
    onConfigUpdate={handleMcpServerConfigUpdate}
    className="mb-4"
  />
</div>;
```

**Example placement with context:**

```tsx
return (
  <div className="space-y-6">
    {/* ... existing form sections ... */}

    {/* Bank & Exchange Integrations */}
    {agentType === "home_security" && (
      <BankExchangeIntegrations
        bankIntegrations={bankIntegrations}
        // ... other props ...
      />
    )}

    {/* Terminal Display Config */}
    {agentType === "home_security" && (
      <TerminalDisplayConfig
        terminalDisplayConfig={terminalDisplayConfig}
        // ... other props ...
      />
    )}

    {/* NEW: MCP Server Integrations */}
    <div className="mt-6 pt-6 border-t border-slate-700">
      <MCPServerIntegrations
        selectedServers={selectedMcpServers}
        onToggleServer={handleMcpServerToggle}
        onConfigUpdate={handleMcpServerConfigUpdate}
        className="mb-4"
      />
    </div>

    {/* Submit Button */}
    <button onClick={deployAgent} className="...">
      Deploy Agent
    </button>
  </div>
);
```

---

## Step 7: Add Error Display (Optional)

**Location:** In JSX, add error display for MCP servers

```tsx
{
  /* Error display for MCP servers */
}
{
  formErrors.mcpServers && (
    <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-sm text-red-300 flex items-start gap-2">
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
      <span>{formErrors.mcpServers}</span>
    </div>
  );
}
```

---

## Step 8: Load Existing MCP Configuration (Optional)

**Location:** In useEffect that loads agent data for editing

```tsx
useEffect(() => {
  if (editingAgent) {
    // ... existing setters ...

    // Load MCP servers if available
    if (editingAgent.mcp_services) {
      setSelectedMcpServers(editingAgent.mcp_services);
    }
    if (editingAgent.mcp_servers) {
      setMcpServersConfig(
        Object.keys(editingAgent.mcp_servers).reduce(
          (acc, serverId) => {
            acc[serverId] = editingAgent.mcp_servers[serverId].config || {};
            return acc;
          },
          {} as Record<string, any>,
        ),
      );
    }
  }
}, [editingAgent]);
```

---

## Complete Example: DeployObject.tsx Sections

### Imports Section

```tsx
import React, { useState, useEffect } from "react";
import { AlertCircle, MapPin, ChevronDown } from "lucide-react";
import BankExchangeIntegrations from "./BankExchangeIntegrations";
import TerminalDisplayConfig, {
  TerminalDisplayConfig as TerminalDisplayConfigType,
} from "./TerminalDisplayConfig";
import MCPServerIntegrations from "./MCPServerIntegrations"; // NEW
import { supabase } from "@/utils/supabase";
```

### State Section

```tsx
export default function DeployObject() {
  // ... existing states ...
  const [exchangeIntegrations, setExchangeIntegrations] = useState<string[]>([]);

  // MCP Server configuration (NEW)
  const [selectedMcpServers, setSelectedMcpServers] = useState<string[]>([]);
  const [mcpServersConfig, setMcpServersConfig] = useState<Record<string, any>>({});

  // ... rest of component ...
```

### Handler Functions Section

```tsx
const validateMcpServers = (): boolean => {
  for (const serverId of selectedMcpServers) {
    const config = mcpServersConfig[serverId];
    if (!config || Object.keys(config).length === 0) {
      setFormErrors((prev) => ({
        ...prev,
        mcpServers: `Please configure ${serverId} before deploying`,
      }));
      return false;
    }
  }
  return true;
};

const handleMcpServerToggle = (serverId: string) => {
  setSelectedMcpServers((prev) =>
    prev.includes(serverId)
      ? prev.filter((id) => id !== serverId)
      : [...prev, serverId],
  );
};

const handleMcpServerConfigUpdate = (
  serverId: string,
  config: Record<string, any>,
) => {
  setMcpServersConfig((prev) => ({
    ...prev,
    [serverId]: config,
  }));
};
```

### Deployment Data Section

```tsx
const deploymentData = {
  agent_name: agentName,
  agent_type: agentType,
  description: description,
  latitude: location?.latitude || 0,
  longitude: location?.longitude || 0,

  // MCP Servers (NEW)
  mcp_services: selectedMcpServers,
  mcp_servers: selectedMcpServers.reduce(
    (acc, serverId) => {
      acc[serverId] = {
        enabled: true,
        config: mcpServersConfig[serverId] || {},
      };
      return acc;
    },
    {} as Record<string, any>,
  ),

  // ... rest of fields ...
};
```

### JSX Rendering Section

```tsx
  return (
    <div className="space-y-6">
      {/* ... existing form sections ... */}

      {/* MCP Server Integrations */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <MCPServerIntegrations
          selectedServers={selectedMcpServers}
          onToggleServer={handleMcpServerToggle}
          onConfigUpdate={handleMcpServerConfigUpdate}
          className="mb-4"
        />
      </div>

      {/* Error messages */}
      {formErrors.mcpServers && (
        <div className="p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-sm text-red-300">
          {formErrors.mcpServers}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={deployAgent}
        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:opacity-90"
      >
        Deploy Agent with Financial Services
      </button>
    </div>
  );
}
```

---

## Testing the Integration

### Test Case 1: Virtual ATM with Solana + Stripe

```typescript
// Select agent type: Virtual ATM (home_security)
// Select MCP servers:
//   ✅ Solana Network
//   ✅ Stripe Payments
//   ✅ CoinGecko Data

// Configure Solana:
//   network: mainnet
//   rpc_endpoint: https://api.mainnet-beta.solana.com

// Configure Stripe:
//   api_key: sk_test_...
//   api_version: 2024-02-01

// Submit form
// Check database: deployed_objects record should contain:
{
  agent_type: "home_security",
  mcp_services: ["solana-mcp", "stripe-mcp", "coingecko-mcp"],
  mcp_servers: {
    "solana-mcp": {
      enabled: true,
      config: {
        network: "mainnet",
        rpc_endpoint: "https://api.mainnet-beta.solana.com"
      }
    },
    "stripe-mcp": {
      enabled: true,
      config: {
        api_key: "sk_test_...",
        api_version: "2024-02-01"
      }
    },
    "coingecko-mcp": {
      enabled: true,
      config: {
        api_tier: "free"
      }
    }
  }
}
```

### Test Case 2: Cryptocurrency Trading Agent

```typescript
// Select agent type: Payment Terminal (or any type)
// Select MCP servers:
//   ✅ Ethereum/EVM
//   ✅ Uniswap DEX
//   ✅ Aave Lending
//   ✅ CoinGecko Data
//   ✅ Chainlink Oracles

// Deploy and verify configurations saved correctly
```

---

## Database Migration (If Needed)

If `mcp_servers` column doesn't exist, run:

```sql
-- Add MCP servers storage column
ALTER TABLE deployed_objects
ADD COLUMN IF NOT EXISTS mcp_servers JSONB DEFAULT jsonb_build_object();

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_deployed_objects_mcp_servers
ON deployed_objects USING GIN (mcp_servers)
WHERE mcp_servers IS NOT NULL AND
      jsonb_array_length(mcp_servers -> 'solana-mcp') > 0;

-- Add audit logging table (optional)
CREATE TABLE IF NOT EXISTS mcp_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID REFERENCES deployed_objects(id),
  server_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  request_params JSONB,
  response_data JSONB,
  status TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verify tables
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'deployed_objects'
AND column_name LIKE 'mcp%';
```

---

## Summary

You've successfully integrated financial MCP servers into DeployObject.tsx:

✅ Imported MCPServerIntegrations component  
✅ Added state variables for server selection & configuration  
✅ Created handler functions for updates  
✅ Added validation logic  
✅ Integrated into deployment data structure  
✅ Added UI to form  
✅ Optional: Error display & existing data loading

**Result:** Agents can now enable and configure any of 24+ financial services (Solana, Stripe, Uniswap, KYC, etc.) directly from the deployment form!

---

## Next Steps

1. Copy this guide and implement in DeployObject.tsx
2. Test with sample financial MCP servers
3. Verify data saves correctly to Supabase
4. Build actual MCP server implementations (see MCP_SERVERS_IMPLEMENTATION_GUIDE.md)
5. Test end-to-end flows
