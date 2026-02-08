# 🗄️ Deployed Agents SQL Resources

Complete SQL query collection for querying deployed agents from your Supabase database.

## 📂 Files Overview

| File | Description | Use When |
|------|-------------|----------|
| **[query_deployed_agents.sql](query_deployed_agents.sql)** | 30+ pre-built queries for common scenarios | You need specific query examples |
| **[rpc_functions.sql](rpc_functions.sql)** | 12 stored procedures for complex operations | Building reusable database functions |
| **[quick_tests.sql](quick_tests.sql)** | Quick validation and health check queries | Testing database or debugging |
| **[QUERY_GUIDE.md](QUERY_GUIDE.md)** | Complete usage guide and examples | Learning how to query agents |

## 🚀 Quick Start

### 1. Test Your Database (30 seconds)
```sql
-- Copy and paste into Supabase SQL Editor
SELECT COUNT(*) as total_agents FROM deployed_objects;
SELECT * FROM deployed_objects WHERE is_active = true LIMIT 5;
```

### 2. Common Queries

**Get all active agents:**
```sql
SELECT * FROM deployed_objects 
WHERE is_active = true 
ORDER BY created_at DESC;
```

**Get agents by network:**
```sql
SELECT * FROM deployed_objects 
WHERE deployment_network_name = 'Polygon Amoy' 
AND is_active = true;
```

**Search by name:**
```sql
SELECT * FROM deployed_objects 
WHERE name ILIKE '%search%' 
AND is_active = true;
```

### 3. Using in Your App

**With TypeScript utility (recommended):**
```typescript
import { queryDeployedAgents } from './utils/queryDeployedAgents';

// Get all active agents
const { data, error, count } = await queryDeployedAgents();

// Search with filters
const { data } = await queryDeployedAgents({
  name: 'AI',
  network: 'Polygon Amoy',
  limit: 20
});
```

**With React hook:**
```typescript
import { useDeployedAgents } from './hooks/useDeployedAgents';

function MyComponent() {
  const { agents, loading, error, refetch } = useDeployedAgents({
    network: 'Polygon Amoy',
    limit: 10
  });
  
  return <div>{agents.map(agent => ...)}</div>;
}
```

**Direct Supabase query:**
```typescript
const { data } = await supabase
  .from('deployed_objects')
  .select('*')
  .eq('is_active', true)
  .limit(10);
```

## 📊 Available Query Types

### Basic Queries
- Get all agents
- Get agent by ID
- Get agents by network
- Get agents by owner
- Search by name/description

### Location Queries
- Get agents near location
- Get agents in bounding box
- Calculate distances

### Advanced Queries
- Multi-filter search
- Pagination
- Aggregations (count, stats)
- Network statistics
- Deployment trends

### Admin Queries
- Bulk operations
- Data quality checks
- Performance analysis

## 🔧 Setup Instructions

### Create RPC Functions (Optional but Recommended)

1. Go to Supabase SQL Editor
2. Copy contents from `rpc_functions.sql`
3. Execute to create stored procedures
4. Use from your app:
```typescript
const { data } = await supabase.rpc('search_agents', { 
  search_text: 'AI assistant' 
});
```

### Add Indexes for Performance

```sql
CREATE INDEX idx_is_active ON deployed_objects(is_active);
CREATE INDEX idx_network ON deployed_objects(deployment_network_name);
CREATE INDEX idx_wallet ON deployed_objects(agent_identity_wallet);
CREATE INDEX idx_created_at ON deployed_objects(created_at DESC);
```

## 💡 Usage Examples

### Example 1: Homepage - Featured Agents
```typescript
// Get 6 most recent active agents
const { data } = await queryDeployedAgents({
  isActive: true,
  limit: 6,
  orderBy: 'created_at',
  orderDirection: 'desc'
});
```

### Example 2: Map View - Agents in Area
```typescript
// Get agents near user location
const { data } = await queryAgentsNearLocation(
  userLatitude,
  userLongitude,
  10 // 10km radius
);
```

### Example 3: User Dashboard - My Agents
```typescript
// Get user's deployed agents
const { data } = await queryAgentsByOwner(walletAddress);
```

### Example 4: Network Explorer
```typescript
// Get all agents on specific network
const { data } = await queryAgentsByNetwork('Polygon Amoy');
```

### Example 5: Admin Dashboard
```typescript
// Get comprehensive statistics
const { data } = await getAgentStatistics();
```

## 📋 Database Schema

```typescript
interface DeployedAgent {
  id: string;                          // UUID
  name: string;
  description: string;
  object_type: string;
  agent_identity_wallet: string;       // Owner wallet
  agent_identity_type: string;
  deployment_network_name: string;     // e.g., "Polygon Amoy"
  deployment_chain_id: string;         // e.g., "80002"
  deployment_status: string;
  interaction_fee_amount: string;
  interaction_fee_token: string;
  payment_methods: object;             // JSONB
  latitude: number;
  longitude: number;
  address: string;
  is_active: boolean;
  created_at: timestamp;
  updated_at: timestamp;
}
```

## 🎯 Common Use Cases

| Use Case | File | Function/Query |
|----------|------|----------------|
| Homepage listing | `utils/queryDeployedAgents.ts` | `queryDeployedAgents()` |
| Single agent view | `utils/queryDeployedAgents.ts` | `queryDeployedAgentById()` |
| Network filter | `utils/queryDeployedAgents.ts` | `queryAgentsByNetwork()` |
| User's agents | `utils/queryDeployedAgents.ts` | `queryAgentsByOwner()` |
| Map view | `rpc_functions.sql` | `get_agents_in_bounds()` |
| Nearby search | `utils/queryDeployedAgents.ts` | `queryAgentsNearLocation()` |
| Search | `rpc_functions.sql` | `search_agents()` |
| Statistics | `utils/queryDeployedAgents.ts` | `getAgentStatistics()` |

## 🔍 Testing Your Queries

Run health check:
```bash
# In Supabase SQL Editor or psql
\i sql/quick_tests.sql
```

Or use the first test query:
```sql
SELECT COUNT(*) as total_agents FROM deployed_objects;
```

## 📖 Documentation

- **[QUERY_GUIDE.md](QUERY_GUIDE.md)** - Complete reference with examples
- **[query_deployed_agents.sql](query_deployed_agents.sql)** - 30+ ready-to-use queries
- **[rpc_functions.sql](rpc_functions.sql)** - Advanced stored procedures
- **[quick_tests.sql](quick_tests.sql)** - Testing and validation queries

## 🆘 Troubleshooting

### Query returns no results
- Check `is_active = true` filter
- Verify network name spelling
- Run: `SELECT COUNT(*) FROM deployed_objects;`

### Slow performance
- Add indexes (see Setup Instructions)
- Use LIMIT for large result sets
- Specify only needed columns

### Type errors
- Convert strings to numbers: `field::numeric`
- Handle NULL: `COALESCE(field, default)`
- Cast types: `field::type`

## 🔗 Related Files

- **[src/utils/queryDeployedAgents.ts](../src/utils/queryDeployedAgents.ts)** - TypeScript utilities
- **[src/hooks/useDeployedAgents.ts](../src/hooks/useDeployedAgents.ts)** - React hooks
- **[src/lib/supabase.ts](../src/lib/supabase.ts)** - Supabase client

## 🎓 Learning Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [PostGIS for Location Queries](https://postgis.net/)

## 📝 Notes

- All queries filter for `is_active = true` by default
- Distance calculations use Haversine formula (Earth as sphere)
- JSONB fields require special syntax (see examples)
- Timestamps stored in UTC

## 🚀 Next Steps

1. ✅ Run test queries from `quick_tests.sql`
2. ✅ Create indexes for better performance
3. ✅ Deploy RPC functions from `rpc_functions.sql`
4. ✅ Use TypeScript utilities in your components
5. ✅ Check out `QUERY_GUIDE.md` for detailed examples

---

**Created:** 2026-02-07  
**Last Updated:** 2026-02-07  
**Database:** Supabase (PostgreSQL)
