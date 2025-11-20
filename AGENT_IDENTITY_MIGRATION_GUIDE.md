# Agent Identity Migration Guide

## Overview

This migration adds the `agent_identity` field to store verifiable identities for all agents, both Hedera and non-Hedera.

## Identity Format

### For Hedera AI Agents:

- **With ERC-8004 NFT**: `0.0.7218375/123` (NFT ID)
- **Without NFT**: `did:hedera:testnet:0.0.7297548` (DID from account)

### For Non-Hedera Agents:

- **Legacy agents**: `did:agent:testnet:2290e6bc` (DID from agent ID)

## Step 1: Apply Migration to Supabase

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: SQL Editor
3. **Copy and paste this SQL**:

```sql
-- Add agent_identity field to store verifiable identity information
ALTER TABLE deployed_objects
ADD COLUMN IF NOT EXISTS agent_identity TEXT;

-- Add index for identity lookups
CREATE INDEX IF NOT EXISTS idx_agent_identity ON deployed_objects(agent_identity);

-- Add comment
COMMENT ON COLUMN deployed_objects.agent_identity IS 'Agent verifiable identity: ERC-8004 NFT ID (format: 0.0.xxxxx/tokenId) or generated DID (format: did:hedera:testnet:xxxxx)';

-- Generate dummy identities for existing non-Hedera agents
-- Format: did:agent:testnet:{agent_id} for backward compatibility
UPDATE deployed_objects
SET agent_identity = CONCAT('did:agent:testnet:', SUBSTRING(id::text, 1, 8))
WHERE agent_identity IS NULL
  AND hedera_nft_id IS NULL
  AND object_type NOT IN ('bus_agent', 'train_agent', 'hotel_agent', 'flight_agent', 'restaurant_agent', 'travel_agent');

-- For Hedera agents with NFT IDs, use the NFT as identity
UPDATE deployed_objects
SET agent_identity = hedera_nft_id
WHERE agent_identity IS NULL
  AND hedera_nft_id IS NOT NULL;

-- For Hedera agents without NFT (but with account), create identity from account
UPDATE deployed_objects
SET agent_identity = CONCAT('did:hedera:testnet:', hedera_account_id)
WHERE agent_identity IS NULL
  AND hedera_account_id IS NOT NULL;
```

4. **Click "Run"**
5. **Verify**: Run this query to check results:

```sql
SELECT
  id,
  name,
  object_type,
  agent_identity,
  hedera_nft_id,
  hedera_account_id
FROM deployed_objects
ORDER BY created_at DESC
LIMIT 20;
```

## Step 2: UI Changes Already Applied

The following UI updates are already in the codebase:

### AgentCard Component (MultiChainAgentDashboard.tsx):

- ✅ Added "🆔 Verified" badge next to agent name when identity exists
- ✅ Badge uses gradient blue-purple styling
- ✅ Hover shows full identity DID/NFT ID

### Agent Detail Modal:

- ✅ Shows "🆔 Verified Identity" badge in modal header
- ✅ Displays full identity string in gray box below name
- ✅ Uses monospaced font for readability

### DeployObject Component:

- ✅ Automatically saves `agent_identity` when deploying Hedera agents
- ✅ Format: ERC-8004 NFT ID (if minted) OR `did:hedera:testnet:{account_id}`

## Step 3: Test the Integration

### Deploy a new Hedera agent:

1. Go to Deploy Agent page
2. Select "Bus Agent" or any Hedera agent type
3. Fill in details and deploy
4. Check the agent card - should show "🆔 Verified" badge
5. Click agent to open modal - should display identity

### Check existing agents:

1. Go to Agent Dashboard
2. All existing agents should now show verification badge
3. Legacy (non-Hedera) agents: `did:agent:testnet:xxxxx`
4. Hedera agents: `did:hedera:testnet:0.0.xxxxx`

## Expected Results

After migration, every agent will have:

- ✅ Visible identity badge on card
- ✅ Full identity displayed in modal
- ✅ Searchable/indexable identity field in database

## Visual Changes

### Before:

```
┌─────────────────────────┐
│ Hedera Bus AI 1         │ <- Just name
│ A bus_agent deployed... │
└─────────────────────────┘
```

### After:

```
┌─────────────────────────┐
│ Hedera Bus AI 1 🆔 Verified │ <- Name + Badge
│ A bus_agent deployed... │
└─────────────────────────┘
```

### Modal Before:

```
Agent Details
─────────────
Name: Hedera Bus AI 1
Description: ...
```

### Modal After:

```
Agent Details
─────────────
Name: Hedera Bus AI 1 🆔 Verified Identity

Agent Identity:
┌────────────────────────────────────┐
│ did:hedera:testnet:0.0.7297548     │
└────────────────────────────────────┘

Description: ...
```

## Troubleshooting

### If badges don't appear:

1. Clear browser cache
2. Restart dev server: `npm run dev`
3. Check console for TypeScript errors

### If identity field is null:

1. Re-run the UPDATE statements in Supabase
2. Check that `hedera_account_id` exists for Hedera agents
3. Verify migration was applied successfully

## Next Steps

After this migration, you can:

1. ✅ Deploy ERC-8004 contract to give true NFT identities
2. ✅ Update existing Hedera agents to mint NFTs
3. ✅ Add identity verification features (signature checks, etc.)
4. ✅ Display identity in AR Viewer
