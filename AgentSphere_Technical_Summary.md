# AgentSphere Technical Summary

## Architecture Diagram

```mermaid
graph TD
    A[User (Web/AR)] -->|Deploys/Interacts| B(AgentSphere Web App)
    B -->|REST/Realtime| C[Supabase Backend]
    C -->|Data Sync| D[AR Viewer App]
    B -->|Wallet Connect| E[MetaMask/Hedera]
    B -->|MCP API| F[MCP Integrations]
    F -->|Services| G[Filesystem, DB, Search, etc.]
```

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide, framer-motion
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Wallets:** EVM (MetaMask), Hedera Testnet (HBAR), BlockDAG, Stablecoins
- **AR/3D:** A-Frame, WebXR, Three.js (AR Viewer)
- **Other:** Node.js, npm, custom hooks/services

## API Details

### Supabase REST API (deployed_objects)

- **GET /deployed_objects**: List all deployed agents
- **POST /deployed_objects**: Deploy a new agent
- **PATCH /deployed_objects/:id**: Update agent config
- **DELETE /deployed_objects/:id**: Remove agent
- **Realtime**: Subscriptions for live updates (AR Viewer)

#### Example Agent Object

```json
{
  "id": "uuid",
  "user_id": "wallet_addr",
  "name": "Agent Name",
  "description": "Agent description",
  "object_type": "intelligent_assistant",
  "location_type": "Street",
  "latitude": 50.123,
  "longitude": 14.456,
  "mcp_integrations": ["filesystem", "memory"],
  "mcp_services": [{"name": "filesystem", "enabled": true, "type": "filesystem"}],
  "currency_type": "HBAR",
  "token_symbol": "HBAR",
  "chain_id": 296,
  ...
}
```

### MCP Integration API

- **POST /mcp/execute**: Run a task (search, db, etc.) for agent
- **GET /mcp/status**: MCP server health/status

### AR Viewer Data Flow

- Fetches agent data from Supabase
- Renders 3D/AR agents at geo-locations
- Listens for real-time updates (new/removed agents)
- Supports wallet-based interactions (payments, chat, etc.)

## Integration Flow

1. User deploys agent via AgentSphere Web App
2. Agent data stored in Supabase (with wallet, MCP, AR config)
3. AR Viewer app fetches and renders agents in AR/3D
4. MCP integrations enable advanced agent capabilities
5. Payments and interactions handled via wallet and Supabase

---

This summary provides a technical overview, architecture diagram, and API/data model details for AgentSphere and its AR Viewer integration.
