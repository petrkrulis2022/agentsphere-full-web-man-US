# 🆔 AR Viewer - Agent Identity Display Integration Guide

## Overview

This guide shows how to display agent identities (ERC-8004 NFT IDs and DIDs) on agent cards in the AR Viewer application.

---

## ✅ What's Already Done (AgentSphere Side)

### Database:

- ✅ `agent_identity` field added to `deployed_objects` table
- ✅ All existing agents have dummy identity: `did:agent:testnet:xxxxxxxx`
- ✅ New Hedera agents get real identity:
  - With ERC-8004 NFT: `0.0.7218375/123` (NFT ID)
  - Without NFT: `did:hedera:testnet:0.0.7297548`

### UI (AgentSphere Dashboard):

- ✅ Agent cards show "🆔 Verified" badge
- ✅ Detail modal displays full identity
- ✅ Identity saved automatically on deployment

---

## 🔧 AR Viewer Integration Steps

### Step 1: Update Agent Data Fetching

The AR Viewer already fetches agents from Supabase. We need to ensure `agent_identity` field is included:

**Location**: `src/components/ARViewer.tsx` (or your AR Viewer component)

```typescript
// CURRENT CODE (around line 50-80):
const { data, error } = await supabase
  .from("deployed_objects")
  .select("*")
  .eq("is_active", true);

// ADD agent_identity to your interface:
interface DeployedObject {
  id: string;
  name: string;
  description: string;
  object_type: string;
  latitude: number;
  longitude: number;
  agent_wallet_address?: string;
  hedera_account_id?: string;
  hedera_nft_id?: string;
  agent_identity?: string; // ⬅️ ADD THIS
  // ... other fields
}
```

The `agent_identity` field will automatically be fetched with the `select("*")` query.

---

### Step 2: Display Identity Badge on AR Agent Labels

**Location**: Where you render agent labels in AR scene

```typescript
// EXAMPLE: Update the A-Frame text labels (around line 380-400 in ARViewer.tsx)

// CURRENT:
<a-text
  value={obj.name}
  position="0 1.0 0"
  align="center"
  color="#ffffff"
  font="kelsonsans"
  width="6"
/>

// UPDATE TO:
<a-text
  value={`${obj.name}${obj.agent_identity ? ' 🆔' : ''}`}
  position="0 1.0 0"
  align="center"
  color="#ffffff"
  font="kelsonsans"
  width="6"
/>

// ADD identity verification indicator below name:
{obj.agent_identity && (
  <a-text
    value="Verified Identity"
    position="0 0.8 0"
    align="center"
    color="#60a5fa"
    font="kelsonsans"
    width="4"
    scale="0.8 0.8 0.8"
  />
)}
```

---

### Step 3: Update Agent Detail Modal/Panel

**Location**: Where you show agent details (around line 600-700 in ARViewer.tsx)

```tsx
// CURRENT MODAL (example):
{
  selectedObject && (
    <div className="agent-details-modal">
      <h3>{selectedObject.name}</h3>
      <p>{selectedObject.description}</p>
      <p>Type: {selectedObject.object_type}</p>
      {/* ... other details */}
    </div>
  );
}

// UPDATE TO:
{
  selectedObject && (
    <div className="agent-details-modal">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-xl font-bold">{selectedObject.name}</h3>
        {selectedObject.agent_identity && (
          <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs font-medium">
            🆔 Verified
          </span>
        )}
      </div>

      {/* Show full identity */}
      {selectedObject.agent_identity && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Agent Identity:</p>
          <p className="text-sm font-mono text-gray-700 break-all">
            {selectedObject.agent_identity}
          </p>
          {selectedObject.agent_identity.startsWith("did:hedera:") && (
            <p className="text-xs text-green-600 mt-1">
              ✅ Hedera Blockchain Identity
            </p>
          )}
          {selectedObject.hedera_nft_id && (
            <p className="text-xs text-purple-600 mt-1">
              🎫 ERC-8004 NFT: {selectedObject.hedera_nft_id}
            </p>
          )}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-2">{selectedObject.description}</p>
      <p className="text-sm">Type: {selectedObject.object_type}</p>
      {/* ... other details */}
    </div>
  );
}
```

---

### Step 4: Add Identity Badge to Object List

**Location**: Where you list nearby agents (around line 520-580)

```tsx
// CURRENT LIST:
{
  objects.map((obj) => (
    <div key={obj.id} className="agent-list-item">
      <span>{obj.name}</span>
      <span>{obj.object_type}</span>
    </div>
  ));
}

// UPDATE TO:
{
  objects.map((obj) => (
    <div
      key={obj.id}
      className="agent-list-item flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{obj.name}</span>
        {obj.agent_identity && (
          <span
            className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded"
            title={obj.agent_identity}
          >
            🆔
          </span>
        )}
      </div>
      <span className="text-xs text-gray-500">{obj.object_type}</span>
    </div>
  ));
}
```

---

### Step 5: Add Identity Type Helper Function

Add this utility function to identify different identity types:

```typescript
// Add to ARViewer.tsx or create utils/identityHelper.ts

interface IdentityInfo {
  type: "erc8004" | "hedera_did" | "legacy_did" | "none";
  displayName: string;
  color: string;
  icon: string;
}

function getIdentityInfo(agent: DeployedObject): IdentityInfo {
  const identity = agent.agent_identity;

  if (!identity) {
    return {
      type: "none",
      displayName: "No Identity",
      color: "gray",
      icon: "❓",
    };
  }

  // ERC-8004 NFT format: "0.0.xxxxx/tokenId"
  if (identity.match(/^0\.0\.\d+\/\d+$/)) {
    return {
      type: "erc8004",
      displayName: "ERC-8004 NFT",
      color: "purple",
      icon: "🎫",
    };
  }

  // Hedera DID format: "did:hedera:testnet:0.0.xxxxx"
  if (identity.startsWith("did:hedera:")) {
    return {
      type: "hedera_did",
      displayName: "Hedera DID",
      color: "green",
      icon: "🔗",
    };
  }

  // Legacy DID format: "did:agent:testnet:xxxxxxxx"
  if (identity.startsWith("did:agent:")) {
    return {
      type: "legacy_did",
      displayName: "Legacy DID",
      color: "blue",
      icon: "🆔",
    };
  }

  return {
    type: "none",
    displayName: "Unknown",
    color: "gray",
    icon: "❓",
  };
}

// USAGE EXAMPLE:
const identityInfo = getIdentityInfo(selectedObject);

<span className={`text-${identityInfo.color}-600`}>
  {identityInfo.icon} {identityInfo.displayName}
</span>;
```

---

### Step 6: Add Identity Verification Visual Indicator

For enhanced visual feedback, add a verification checkmark:

```tsx
// Component for identity badge
const IdentityBadge: React.FC<{ agent: DeployedObject }> = ({ agent }) => {
  if (!agent.agent_identity) return null;

  const identityInfo = getIdentityInfo(agent);

  const colorClasses = {
    purple: "from-purple-100 to-pink-100 text-purple-700",
    green: "from-green-100 to-emerald-100 text-green-700",
    blue: "from-blue-100 to-cyan-100 text-blue-700",
    gray: "from-gray-100 to-gray-200 text-gray-600",
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${
        colorClasses[identityInfo.color]
      } rounded-full text-xs font-medium`}
    >
      <span>{identityInfo.icon}</span>
      <span>{identityInfo.displayName}</span>
    </div>
  );
};

// USAGE:
<IdentityBadge agent={selectedObject} />;
```

---

## 🎨 Visual Examples

### Before (No Identity):

```
┌─────────────────────────┐
│ 🚌 Bus Agent 1          │
│ Type: bus_agent         │
│ Location: Street        │
└─────────────────────────┘
```

### After (With Identity):

```
┌─────────────────────────────────────┐
│ 🚌 Bus Agent 1  🆔 Verified         │
│ ┌─────────────────────────────────┐ │
│ │ Agent Identity:                 │ │
│ │ did:hedera:testnet:0.0.7297548  │ │
│ │ ✅ Hedera Blockchain Identity   │ │
│ └─────────────────────────────────┘ │
│ Type: bus_agent                     │
│ Location: Street                    │
└─────────────────────────────────────┘
```

### AR Scene Label:

```
Current:
  Bus Agent 1
  15m away

Updated:
  Bus Agent 1 🆔
  Verified Identity
  15m away
```

---

## 📊 Identity Types & Display

| Identity Type    | Format                           | Display Badge   | Color  |
| ---------------- | -------------------------------- | --------------- | ------ |
| **ERC-8004 NFT** | `0.0.7218375/123`                | 🎫 ERC-8004 NFT | Purple |
| **Hedera DID**   | `did:hedera:testnet:0.0.7297548` | 🔗 Hedera DID   | Green  |
| **Legacy DID**   | `did:agent:testnet:2290e6bc`     | 🆔 Legacy DID   | Blue   |
| **No Identity**  | `null` or `undefined`            | ❓ No Identity  | Gray   |

---

## 🧪 Testing Checklist

After implementing the changes:

### ✅ Database Query Test:

```sql
-- Verify all agents have identities
SELECT
  id,
  name,
  object_type,
  agent_identity,
  hedera_account_id,
  hedera_nft_id
FROM deployed_objects
WHERE agent_identity IS NULL;
-- Should return 0 rows after migration
```

### ✅ AR Viewer Tests:

1. **Load AR View** → All agents should load with `agent_identity` field
2. **Check Labels** → Agent labels should show 🆔 icon for verified agents
3. **Click Agent** → Detail modal should display full identity
4. **Agent List** → List view should show identity badges
5. **New Hedera Agent** → Deploy new agent, should show Hedera DID immediately
6. **Legacy Agent** → Existing agents should show Legacy DID

---

## 🚀 Deployment Steps

1. **Apply Database Migration** (if not done):

   - Copy SQL from `migrations/add_agent_identity_field.sql`
   - Execute in Supabase SQL Editor
   - Verify with test query

2. **Update AR Viewer Code**:

   - Add `agent_identity` to interface
   - Update agent labels in AR scene
   - Update detail modal
   - Add identity badge component

3. **Test Locally**:

   - Start AR Viewer: `npm run dev`
   - Load agents from database
   - Verify identity display

4. **Deploy**:
   - Commit changes
   - Push to repository
   - Deploy to production

---

## 🔗 Related Files

- **Database Migration**: `migrations/add_agent_identity_field.sql`
- **AgentSphere UI**: `src/components/MultiChainAgentDashboard.tsx`
- **AR Viewer Component**: `src/components/ARViewer.tsx`
- **Agent Interaction Modal**: `src/components/interaction/AgentInteractionModal.tsx`

---

## 💡 Future Enhancements

1. **QR Code with Identity**:

   - Include agent identity in payment QR code
   - Verify identity before payment

2. **Identity Verification**:

   - Check ERC-8004 NFT on blockchain
   - Verify Hedera account existence
   - Show verification status (verified ✅ / unverified ⚠️)

3. **Identity Search**:

   - Filter agents by identity type
   - Search by DID or NFT ID

4. **Trust Score**:
   - Calculate trust based on identity type
   - ERC-8004 NFT = highest trust
   - Hedera DID = medium trust
   - Legacy DID = basic trust

---

## ❓ FAQ

**Q: Do all agents need identity?**
A: After migration, yes. All existing agents get Legacy DID, new Hedera agents get real blockchain identity.

**Q: What if `agent_identity` is null?**
A: Should not happen after migration. But you can handle it gracefully by showing "No Identity" badge.

**Q: Can users verify identity?**
A: Future enhancement. For now, identity is displayed but not verified against blockchain.

**Q: Will AR Viewer work without changes?**
A: Yes, but identity won't be visible. Update recommended for full feature set.

---

## 📞 Support

If you encounter issues:

1. Check database migration was applied successfully
2. Verify `agent_identity` field exists in Supabase
3. Check browser console for errors
4. Verify agents are fetched with `select("*")`

**Ready to integrate?** Follow the steps above to add identity display to your AR Viewer! 🚀
