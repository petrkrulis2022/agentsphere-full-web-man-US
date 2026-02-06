# Agent Type Cleanup & Dual Rendering Fix - Session Summary

**Date:** February 6, 2026  
**Status:** Frontend Updated ✅ | Database Migration Ready ⏳ | AR Viewer Fix Needed 🔧

---

## 🎯 Session Objectives

1. **Clean up agent type confusion** - Remove repurposed legacy types
2. **Fix constraint violations** - Align database constraints with frontend values
3. **Resolve dual rendering issue** - Fix AR Viewer showing agents twice
4. **Update all code references** - Replace old types with new clean values

---

## 🔥 Problem Discovery

### Issue 1: Agent Type Confusion

**Root Cause:** Old agent types were being repurposed instead of creating clean new types:

- `home_security` → repurposed as "Virtual ATM"
- `content_creator` → repurposed as "My Payment Terminal"
- `payment_terminal` → repurposed as "Payment Terminal - POS"

**Impact:**

- Database constraint mismatches
- AR Viewer filtering issues
- Dropdown showing wrong types
- Deployment failures

### Issue 2: Dual Rendering in AR Viewer

**Problem:** POS 2 agent rendering TWICE on screen:

- Large 3D model at GPS coordinates
- Small marker at screen position

**Database Evidence:**

```json
{
  "name": "POS 2 with x.y",
  "agent_type": "pos_terminal",
  "positioning_mode": "screen",
  "screen_position_x": 74.6473354231975,
  "screen_position_y": 56.2579403380983,
  "latitude": 50.6474119493353,
  "longitude": 13.835567
}
```

**Root Cause:** AR Viewer ignoring `positioning_mode` field and rendering both GPS + screen visualizations simultaneously.

---

## ✅ Solutions Implemented

### 1. Frontend Updates - DeployObject.tsx

**Updated all agent type references** (17 locations):

**Old Values:**

```typescript
{ value: "content_creator", label: "My Payment Terminal" }
{ value: "payment_terminal", label: "Payment Terminal - POS" }
{ value: "Virtual Terminal", label: "Virtual ATM" }
```

**New Clean Values:**

```typescript
{ value: "my_payment_terminal", label: "My Payment Terminal" }
{ value: "pos_terminal", label: "Payment Terminal - POS" }
{ value: "artm_terminal", label: "Virtual ATM" }
```

**All Updated Locations:**

- Line 227-229: Dropdown array
- Line 1046: ARTM validation check
- Lines 1440-1453: POS terminal fee type logic
- Line 1558: ARTM configuration spread
- Line 2835: Bank & Exchange integrations conditional
- Line 2846: Terminal Display Config conditional
- Line 2950: Fee type selector for POS
- Line 2989: Dynamic fee info box
- Line 3021: Interaction fee placeholder text
- Line 3033: Revenue sharing label
- Line 3038: Revenue sharing display
- Line 3196: Payment Methods hide conditional
- Line 3399: Virtual Terminal configuration

**Status:** ✅ Complete - No TypeScript errors, all old references removed

### 2. Database Migration Created

**File:** `clean_agent_types_fresh_start.sql`

**Key Changes:**

```sql
-- Delete all existing agents
DELETE FROM deployed_objects;

-- Drop old constraint
ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_agent_type;

-- Add new clean constraint
ALTER TABLE deployed_objects ADD CONSTRAINT valid_agent_type CHECK (
  agent_type IS NULL OR agent_type IN (
    'my_payment_terminal',
    'pos_terminal',
    'artm_terminal',
    'intelligent_assistant',
    'local_services',
    -- ... other types
  )
);
```

**Status:** ⏳ Ready to run in Supabase SQL Editor

---

## 📊 Current Database State

**Query Results for POS Agents:**

| ID      | Name           | Type         | Mode   | Screen X | Screen Y | GPS            |
| ------- | -------------- | ------------ | ------ | -------- | -------- | -------------- |
| 36b3... | POS 2 with x.y | pos_terminal | screen | 74.65%   | 56.26%   | 50.647, 13.835 |
| 79ff... | POS 1 No x,y   | pos_terminal | gps    | null     | null     | 50.647, 13.835 |

**Visual Rendering Status:**

- POS 1 (GPS mode): ✅ Renders correctly (single 3D model)
- POS 2 (Screen mode): ❌ Renders incorrectly (3D model + marker)

---

## 🎯 Positioning System Explanation

### Two Distinct Modes:

#### **GPS Mode** (`positioning_mode: "gps"`)

- Agent appears at **real GPS coordinates**
- User must physically walk to that location
- Filtered by distance (e.g., 500m radius)
- **Use case:** Real-world locations (ATM at specific address, coffee shop)

#### **Screen Mode** (`positioning_mode: "screen"`)

- Agent appears at **screen coordinates** (X%, Y%)
- Always visible, "pinned" to user's screen
- No distance filtering needed
- **Use case:** Personal agents (portable payment terminal, virtual assistant)

### How AR Viewer Should Work:

```javascript
// CORRECT LOGIC (needs to be implemented in AR Viewer)
for (agent in allAgents) {
  if (agent.positioning_mode === "gps") {
    // GPS Mode: Check distance, render 3D model at GPS
    distance = calculateDistance(userGPS, agent.gps);
    if (distance < MAX_RANGE) {
      render3DModelAtGPS(agent.latitude, agent.longitude);
    }
  } else if (agent.positioning_mode === "screen") {
    // Screen Mode: Render marker at screen position (no distance check)
    renderMarkerAtScreen(agent.screen_position_x, agent.screen_position_y);
  }
}
```

**Current Bug:** AR Viewer renders **BOTH** modes for screen-positioned agents instead of checking `positioning_mode`.

---

## 🔧 AR Viewer Required Changes

### Critical Fix Needed:

**File:** AR Viewer rendering logic  
**Issue:** Not checking `positioning_mode` before rendering

**Required Changes:**

1. **Add positioning_mode check in rendering loop**

   ```javascript
   // BEFORE (current buggy behavior):
   renderGPS(agent);
   if (agent.screen_position_x) renderScreen(agent);

   // AFTER (correct behavior):
   if (agent.positioning_mode === "gps") {
     renderGPS(agent);
   } else if (agent.positioning_mode === "screen") {
     renderScreen(agent);
   }
   ```

2. **Update type filters for new agent types**
   - Replace: `content_creator`, `payment_terminal`, `Virtual Terminal`
   - With: `my_payment_terminal`, `pos_terminal`, `artm_terminal`

3. **Update normalizeAgentType function**

   ```javascript
   function normalizeAgentType(type) {
     const mapping = {
       my_payment_terminal: "My Payment Terminal",
       pos_terminal: "Payment Terminal",
       artm_terminal: "Virtual ATM",
     };
     return mapping[type] || type;
   }
   ```

4. **Update 3D model selection logic**
   - Map `artm_terminal` → ARTM 3D model
   - Map `pos_terminal` → POS terminal 3D model
   - Map `my_payment_terminal` → Personal terminal 3D model

---

## 📝 Next Steps

### 1. Database (User Action Required)

- [ ] Run `clean_agent_types_fresh_start.sql` in Supabase SQL Editor
- [ ] Verify constraints accept new type values
- [ ] Test deploying new agent types

### 2. Frontend (Complete ✅)

- [x] Update all DeployObject.tsx references
- [x] Remove old type values
- [x] Add new clean type values
- [x] Verify no TypeScript errors

### 3. AR Viewer (Needs Implementation)

- [ ] Add `positioning_mode` check in rendering logic
- [ ] Update type filters to new values
- [ ] Update normalizeAgentType function
- [ ] Update 3D model selection
- [ ] Test dual rendering fix

### 4. Testing

- [ ] Deploy POS agent (GPS mode) - should render single 3D model
- [ ] Deploy POS agent (Screen mode) - should render single marker
- [ ] Deploy ARTM agent (Screen mode) - should render single marker
- [ ] Verify no dual rendering
- [ ] Verify correct type display in AR Viewer

---

## 🎓 Key Learnings

### 1. Don't Repurpose Agent Types

**Wrong Approach:**

- Rename `home_security` → "Virtual ATM"
- Causes confusion in database, AR Viewer, and code

**Right Approach:**

- Delete old types completely
- Create new clean types with proper naming
- No legacy baggage

### 2. Positioning Mode Is Critical

**Database stores BOTH:**

- GPS coordinates (always present)
- Screen coordinates (optional)
- `positioning_mode` field (tells AR Viewer which to use)

**AR Viewer must check positioning_mode** before deciding what to render.

### 3. Constraint Format Consistency

- Frontend dropdown values must EXACTLY match database constraint values
- Use consistent naming: lowercase_underscore format
- Avoid mixing "Capitalized Space" and lowercase_underscore

---

## 📊 Type Mapping Reference

| Old Type         | New Type            | Label                  | Use Case                   |
| ---------------- | ------------------- | ---------------------- | -------------------------- |
| content_creator  | my_payment_terminal | My Payment Terminal    | Personal portable terminal |
| payment_terminal | pos_terminal        | Payment Terminal - POS | Point of sale terminal     |
| Virtual Terminal | artm_terminal       | Virtual ATM            | Augmented Reality ATM      |
| home_security    | ❌ REMOVED          | -                      | -                          |

---

## 🚀 Server Status

**Development Server:** Running on port 5175  
**URL:** http://localhost:5175/  
**Status:** ✅ Active

---

## 📅 Session Timeline

1. **Started:** Server restart on port 5175
2. **Discovered:** Dual rendering issue in AR Viewer
3. **Analyzed:** Database query showing correct data
4. **Decided:** Clean up all agent types, remove legacy confusion
5. **Updated:** All 17 references in DeployObject.tsx
6. **Created:** SQL migration for clean agent types
7. **Documented:** AR Viewer fix requirements
8. **Explained:** Positioning system (GPS vs Screen modes)

---

## 💡 Summary

**Problem:** Agent type confusion and dual rendering in AR Viewer  
**Cause:** Repurposed types + AR Viewer not checking positioning_mode  
**Solution:** Clean new types + AR Viewer positioning_mode logic  
**Status:** Frontend complete, awaiting database migration and AR Viewer fix

**Ready to deploy new clean agent types once SQL migration runs!** 🎉
