# AR Viewer - Agent Identity Integration Prompt

## Objective

Integrate agent identity verification into the AR Viewer agent marketplace cards, displaying the 🆔 Verified badge and DID identities for all agents with Hedera identities.

## Context

- **AgentSphere Backend**: Already has `agent_identity` field populated for all agents
- **Identity Format**: `did:hedera:testnet:0.0.{account_id}` for Hedera agents
- **Database**: Supabase `deployed_objects` table with `agent_identity` TEXT column
- **IdentityRegistry Contract**: Deployed at `0x91465109a685abc19ecc94474c0f24bb05045d37` (0.0.7299955)
- **Token Symbol**: AID (AgentIdentity NFT)

## Task 1: Update Agent Card UI in AR Viewer

### Files to Modify

1. **Agent Card Component** (find the component that displays agent cards in marketplace)
2. **Agent Data Interface/Type** (add agent_identity field)
3. **Agent Data Fetching** (ensure agent_identity is retrieved from API)

### Implementation Steps

#### Step 1: Update Agent TypeScript Interface

```typescript
// Add to your agent interface/type definition
export interface Agent {
  id: string;
  name: string;
  object_type: string;
  network: string;
  hedera_account_id?: string;
  agent_identity?: string; // ← ADD THIS
  // ... other fields
}
```

#### Step 2: Update API Call to Include agent_identity

```typescript
// In your agent data fetching function
const { data: agents } = await supabase
  .from("deployed_objects")
  .select(
    `
    *,
    agent_identity  // ← ENSURE THIS IS INCLUDED
  `
  )
  .eq("is_active", true);
```

#### Step 3: Add Identity Badge to Agent Card

```tsx
// In your Agent Card component (similar to MultiChainAgentDashboard.tsx)

{
  /* Add this badge next to agent name or in header */
}
{
  agent.agent_identity && (
    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
      <span className="text-lg">🆔</span>
      <span className="text-xs font-medium text-blue-700">Verified</span>
    </div>
  );
}

{
  /* Optional: Show full DID on hover or in modal */
}
{
  agent.agent_identity && (
    <div
      className="text-xs text-gray-500 font-mono cursor-pointer hover:text-blue-600"
      title={agent.agent_identity}
      onClick={() => copyToClipboard(agent.agent_identity)}
    >
      {agent.agent_identity.slice(0, 30)}...
    </div>
  );
}
```

#### Step 4: Add Verification Link to HashScan

```tsx
{
  agent.hedera_account_id && (
    <a
      href={`https://hashscan.io/testnet/account/${agent.hedera_account_id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
    >
      <span>View on HashScan</span>
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}
```

## Task 2: Add Agent Detail Modal with Identity Info

### Create Identity Display Section

```tsx
// In agent detail modal/expanded view
<div className="border-t pt-4 mt-4">
  <h3 className="text-sm font-semibold text-gray-700 mb-2">Agent Identity</h3>

  {agent.agent_identity ? (
    <div className="space-y-2">
      {/* DID Display */}
      <div className="flex items-start gap-2">
        <span className="text-xs text-gray-500 min-w-[80px]">DID:</span>
        <div className="flex-1 flex items-center gap-2">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono flex-1">
            {agent.agent_identity}
          </code>
          <button
            onClick={() => copyToClipboard(agent.agent_identity)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Copy DID"
          >
            📋
          </button>
        </div>
      </div>

      {/* Hedera Account */}
      {agent.hedera_account_id && (
        <div className="flex items-start gap-2">
          <span className="text-xs text-gray-500 min-w-[80px]">Account:</span>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
            {agent.hedera_account_id}
          </code>
        </div>
      )}

      {/* Verification Status */}
      <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 border border-green-200 rounded">
        <span className="text-green-600">✓</span>
        <span className="text-xs text-green-700">
          Identity verified on Hedera Testnet
        </span>
      </div>

      {/* View on HashScan Button */}
      {agent.hedera_account_id && (
        <a
          href={`https://hashscan.io/testnet/account/${agent.hedera_account_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          <span>View Identity on HashScan</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}
    </div>
  ) : (
    <div className="text-xs text-gray-500 italic">No verified identity</div>
  )}
</div>
```

## Task 3: Add Copy to Clipboard Utility

```typescript
// Add this utility function
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // Optional: Show toast notification
    console.log("Copied to clipboard:", text);
    // You can add a toast/notification here
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};
```

## Task 4: Add Filter for Verified Agents

```tsx
// Add to your filter controls
const [showOnlyVerified, setShowOnlyVerified] = useState(false);

// Filter logic
const filteredAgents = agents.filter((agent) => {
  if (showOnlyVerified && !agent.agent_identity) return false;
  // ... other filters
  return true;
});

// UI Toggle
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    checked={showOnlyVerified}
    onChange={(e) => setShowOnlyVerified(e.target.checked)}
    className="rounded"
  />
  <span className="text-sm">🆔 Verified Only</span>
</label>;
```

## Example: Complete Agent Card with Identity

```tsx
<div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
  {/* Header with Verified Badge */}
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-semibold text-lg">{agent.name}</h3>
    {agent.agent_identity && (
      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full">
        <span className="text-sm">🆔</span>
        <span className="text-xs font-medium text-blue-700">Verified</span>
      </div>
    )}
  </div>

  {/* Agent Details */}
  <div className="space-y-2 mb-3">
    <div className="text-sm text-gray-600">Type: {agent.object_type}</div>
    <div className="text-sm text-gray-600">Network: {agent.network}</div>

    {/* Identity DID - Truncated */}
    {agent.agent_identity && (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">DID:</span>
        <code
          className="text-xs bg-gray-100 px-2 py-1 rounded font-mono cursor-pointer hover:bg-gray-200"
          onClick={() => copyToClipboard(agent.agent_identity)}
          title={agent.agent_identity}
        >
          {agent.agent_identity.slice(0, 35)}...
        </code>
      </div>
    )}
  </div>

  {/* Action Buttons */}
  <div className="flex gap-2">
    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      View in AR
    </button>

    {agent.hedera_account_id && (
      <a
        href={`https://hashscan.io/testnet/account/${agent.hedera_account_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
        title="View on HashScan"
      >
        🔗
      </a>
    )}
  </div>
</div>
```

## Database Query Reference

```typescript
// Ensure your Supabase query includes agent_identity
const loadAgents = async () => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*") // This includes agent_identity
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading agents:", error);
    return;
  }

  setAgents(data || []);
};
```

## Styling Reference (Tailwind CSS)

```css
/* Verified Badge */
.verified-badge {
  @apply flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full;
}

/* DID Display */
.did-code {
  @apply text-xs bg-gray-100 px-2 py-1 rounded font-mono;
}

/* HashScan Link */
.hashscan-link {
  @apply text-xs text-blue-600 hover:underline flex items-center gap-1;
}
```

## Testing Checklist

- [ ] Agent cards display 🆔 Verified badge for agents with `agent_identity`
- [ ] Clicking on DID copies to clipboard
- [ ] HashScan link opens in new tab to correct account
- [ ] Filter for "Verified Only" works correctly
- [ ] Agent detail modal shows full identity information
- [ ] All existing agents from database display properly
- [ ] Responsive design works on mobile devices

## Expected Result

After implementing these changes, your AR Viewer agent marketplace should:

1. ✅ Display 🆔 Verified badges on all agent cards with identities
2. ✅ Show DID identifiers (did:hedera:testnet:0.0.XXXXXX)
3. ✅ Provide HashScan verification links
4. ✅ Allow filtering by verified status
5. ✅ Show complete identity info in detail modal

## Reference Files

- **AgentSphere Example**: `/src/components/MultiChainAgentDashboard.tsx` (lines 370-377 for badge implementation)
- **Database Schema**: `deployed_objects` table has `agent_identity` TEXT field
- **Identity Registry**: Contract at 0x91465109a685abc19ecc94474c0f24bb05045d37

## Notes

- All existing agents in the database already have `agent_identity` populated
- No backend changes needed - just update the AR Viewer frontend
- Identity format: `did:hedera:testnet:{account_id}` for Hedera agents
- Legacy agents use: `did:agent:testnet:{id_prefix}` format
