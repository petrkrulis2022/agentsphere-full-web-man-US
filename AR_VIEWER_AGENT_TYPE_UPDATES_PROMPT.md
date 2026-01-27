# AR Viewer Agent Type Updates - Integration Prompt

## Overview

The agent type dropdown has been updated with new labels and reordering. The top three payment-related agent types have been renamed and moved to the first positions in the dropdown.

## Changes Made in Deploy AR Agent Page

### Agent Type Updates:

1. **"Content Creator"** → **"My Payment Terminal"** (moved to position #1)
2. **"Payment Terminal"** → **"Payment Terminal - POS"** (moved to position #2)
3. **"Home Security"** → **"Virtual ATM"** (moved to position #3)

### New Dropdown Order:

```typescript
const agentTypes = [
  // Top three payment-related agents
  { value: "content_creator", label: "My Payment Terminal" },
  { value: "payment_terminal", label: "Payment Terminal - POS" },
  { value: "home_security", label: "Virtual ATM" },
  // Other agent types
  { value: "intelligent_assistant", label: "Intelligent Assistant" },
  { value: "local_services", label: "Local Services" },
  { value: "game_agent", label: "Game Agent" },
  { value: "3d_world_builder", label: "3D World Builder" },
  { value: "real_estate_broker", label: "Real Estate Broker" },
  { value: "bus_stop_agent", label: "Bus Stop Agent" },
  // Hedera AI Travel Agents with A2A Communication
  { value: "bus_agent", label: "🚌 Bus Agent (Hedera AI)" },
  { value: "train_agent", label: "🚆 Train Agent (Hedera AI)" },
  { value: "hotel_agent", label: "🏨 Hotel Agent (Hedera AI)" },
  { value: "flight_agent", label: "✈️ Flight Agent (Hedera AI)" },
  { value: "restaurant_agent", label: "🍽️ Restaurant Agent (Hedera AI)" },
  { value: "travel_agent", label: "🌍 Travel Coordinator (Hedera AI)" },
  // Conditional trailing agent types
  ...(trailingAgent
    ? [
        {
          value: "trailing_payment_terminal",
          label: "Trailing Payment Terminal",
        },
        { value: "my_ghost", label: "My Ghost" },
      ]
    : []),
];
```

## Required Changes in AR Viewer

### 1. Update Agent Type Display Logic

If your AR viewer displays agent type labels, update the display mapping:

```typescript
// Update agent type display names
const getAgentTypeDisplayName = (agentType: string) => {
  const typeMap = {
    content_creator: "My Payment Terminal",
    payment_terminal: "Payment Terminal - POS",
    home_security: "Virtual ATM",
    intelligent_assistant: "Intelligent Assistant",
    local_services: "Local Services",
    game_agent: "Game Agent",
    "3d_world_builder": "3D World Builder",
    real_estate_broker: "Real Estate Broker",
    bus_stop_agent: "Bus Stop Agent",
    bus_agent: "🚌 Bus Agent (Hedera AI)",
    train_agent: "🚆 Train Agent (Hedera AI)",
    hotel_agent: "🏨 Hotel Agent (Hedera AI)",
    flight_agent: "✈️ Flight Agent (Hedera AI)",
    restaurant_agent: "🍽️ Restaurant Agent (Hedera AI)",
    travel_agent: "🌍 Travel Coordinator (Hedera AI)",
    trailing_payment_terminal: "Trailing Payment Terminal",
    my_ghost: "My Ghost",
  };
  return typeMap[agentType] || agentType;
};
```

### 2. Update Agent Type Icons/Images

If you have specific icons or 3D models for each agent type:

```typescript
const getAgentTypeIcon = (agentType: string) => {
  switch (agentType) {
    case "content_creator": // Now "My Payment Terminal"
      return "/icons/my-payment-terminal.svg";
    case "payment_terminal": // Now "Payment Terminal - POS"
      return "/icons/payment-terminal-pos.svg";
    case "home_security": // Now "Virtual ATM"
      return "/icons/virtual-atm.svg";
    // ... other cases
  }
};
```

### 3. Update Agent Type Filtering/Sorting

If you have filters or categories in AR viewer:

```typescript
// Payment-focused category
const paymentAgents = [
  "content_creator", // My Payment Terminal
  "payment_terminal", // Payment Terminal - POS
  "home_security", // Virtual ATM
  "trailing_payment_terminal",
];

// Check if agent is payment-related
const isPaymentAgent = (agentType: string) => {
  return paymentAgents.includes(agentType);
};
```

### 4. Update Agent Card Display

If you show agent cards with type badges:

```typescript
const getAgentTypeBadgeColor = (agentType: string) => {
  // Payment terminals get special styling
  if (
    ["content_creator", "payment_terminal", "home_security"].includes(agentType)
  ) {
    return "bg-green-500 text-white"; // Green for payment agents
  }
  // Hedera AI agents
  if (
    agentType.includes("_agent") &&
    !["game_agent", "bus_stop_agent"].includes(agentType)
  ) {
    return "bg-purple-500 text-white"; // Purple for Hedera AI
  }
  return "bg-blue-500 text-white"; // Default
};
```

### 5. Update Search/Query Logic

If AR viewer searches for agents by type:

```typescript
// Update search keywords
const agentTypeKeywords = {
  content_creator: ["my", "payment", "terminal", "personal", "wallet"],
  payment_terminal: ["payment", "terminal", "pos", "point", "sale"],
  home_security: ["virtual", "atm", "cash", "withdrawal", "automated"],
  // ... other types
};
```

### 6. Update Database Queries

Ensure your AR viewer queries use the correct value (not the label):

```typescript
// Correct - uses value
const agents = await supabase
  .from("deployed_objects")
  .select("*")
  .eq("agent_type", "content_creator"); // value stays the same

// The label is now "My Payment Terminal" but value remains "content_creator"
```

## Database Schema Update

The Supabase constraint has been updated to include all new labels:

```sql
ALTER TABLE deployed_objects
ADD CONSTRAINT valid_agent_type
CHECK ((agent_type IS NULL) OR (agent_type = ANY (ARRAY[
  -- Updated payment labels
  'My Payment Terminal'::text,
  'Payment Terminal - POS'::text,
  'Virtual ATM'::text,
  -- All other agent types
  'Intelligent Assistant'::text,
  'Local Services'::text,
  'Game Agent'::text,
  -- Hedera AI types
  '🚌 Bus Agent (Hedera AI)'::text,
  '🚆 Train Agent (Hedera AI)'::text,
  '🏨 Hotel Agent (Hedera AI)'::text,
  '✈️ Flight Agent (Hedera AI)'::text,
  '🍽️ Restaurant Agent (Hedera AI)'::text,
  '🌍 Travel Coordinator (Hedera AI)'::text,
  -- Legacy types maintained for compatibility
  'ai_agent'::text,
  'study_buddy'::text,
  'tutor'::text,
  'landmark'::text,
  'building'::text
])));
```

## Important Notes

### Value vs Label

- **Values** (database identifiers) remain unchanged:
  - `content_creator` → still `content_creator`
  - `payment_terminal` → still `payment_terminal`
  - `home_security` → still `home_security`
- **Labels** (display text) have been updated:
  - `content_creator` now displays as **"My Payment Terminal"**
  - `payment_terminal` now displays as **"Payment Terminal - POS"**
  - `home_security` now displays as **"Virtual ATM"**

### Backward Compatibility

- All existing agents in database will continue to work
- Legacy agent types are maintained in constraint
- AR viewer should handle both old and new data seamlessly

### Priority Order

The three payment-related agents are now prominently featured at the top of the dropdown to encourage their use for payment and financial transaction scenarios.

## Testing Checklist

- [ ] Verify agent type labels display correctly in AR view
- [ ] Test filtering by payment agent types
- [ ] Confirm agent cards show correct type badges
- [ ] Validate agent type icons/3D models load correctly
- [ ] Test search functionality with new keywords
- [ ] Verify database queries return correct results
- [ ] Check that existing deployed agents still display properly
- [ ] Test deployment of new agents with updated types
- [ ] Confirm Hedera AI agent types (with emojis) display correctly
- [ ] Validate payment terminal agents show appropriate UI elements

## Files Modified

1. **src/components/DeployObject.tsx** - Agent types array updated and reordered
2. **supabase/migrations/20250802120000_agent_card_fields.sql** - Constraint updated
3. **update_agent_types_labels.sql** - New migration file for database update

## Migration Command

To apply the database changes:

```bash
# Run the migration in Supabase
psql $DATABASE_URL -f update_agent_types_labels.sql

# Or via Supabase CLI
supabase db push
```
