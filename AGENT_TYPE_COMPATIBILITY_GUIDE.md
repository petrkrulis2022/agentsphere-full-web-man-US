# Agent Type Compatibility Guide

## Problem

The A-Frame workspace stores agent types as lowercase with underscores (`intelligent_assistant`, `content_creator`, etc.), while the React Three Fiber workspace expects them in title case with spaces (`"Intelligent Assistant"`, `"Content Creator"`, etc.). This mismatch causes all R3F agents to render as default boxes/cubes.

## Solution

Use the shared `agentTypeUtils.ts` utility to normalize agent types between workspaces.

## Implementation for React Three Fiber Workspace

### 1. Copy the utility file

Copy `src/utils/agentTypeUtils.ts` from this workspace to your R3F workspace.

### 2. Update Agent3DModel.jsx

```jsx
import { normalizeAgentType, toR3FAgentType } from '../utils/agentTypeUtils';

const Agent3DModel = ({ agent, ... }) => {
  // Get both normalized and R3F compatible types
  const normalizedType = normalizeAgentType(agent.agent_type || agent.object_type);
  const r3fType = toR3FAgentType(normalizedType);

  console.log("TYPE RAW:", agent.agent_type, "OBJ_TYPE:", agent.object_type, "NORMALIZED:", normalizedType, "R3F:", r3fType);

  const getAgentModel = useCallback(() => {
    // ... existing material setup ...

    switch (normalizedType) {
      case "intelligent_assistant":
        return (
          <group>
            {/* Main body - cube with rounded edges */}
            <Box ref={meshRef} args={[0.8, 0.8, 0.8]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            {/* ... rest of the component */}
          </group>
        );

      case "content_creator":
        return (
          <group>
            {/* Crystalline structure */}
            <Box ref={meshRef} args={[0.6, 1.2, 0.6]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            {/* ... rest of the component */}
          </group>
        );

      case "local_services":
        return (
          <group>
            {/* Cylindrical tower */}
            <Cylinder ref={meshRef} args={[0.4, 0.6, 1.2, 8]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Cylinder>
            {/* ... rest of the component */}
          </group>
        );

      case "tutor_teacher":
        return (
          <group>
            {/* Book-like structure */}
            <Box ref={meshRef} args={[1.0, 0.2, 0.8]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            {/* ... rest of the component */}
          </group>
        );

      case "game_agent":
        return (
          <group>
            {/* Geometric gaming shape */}
            <Box ref={meshRef} args={[0.8, 0.8, 0.8]} position={[0, 0, 0]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            {/* ... rest of the component */}
          </group>
        );

      default:
        return (
          <Box ref={meshRef} args={[0.8, 0.8, 0.8]} position={[0, 0, 0]}>
            <meshStandardMaterial {...commonMaterial} />
          </Box>
        );
    }
  }, [normalizedType, hovered]);

  // ... rest of component
};
```

### 3. Update Enhanced3DAgent.jsx

```jsx
import { normalizeAgentType, toR3FAgentType } from '../utils/agentTypeUtils';

const Enhanced3DAgent = ({ agent, ... }) => {
  const normalizedType = normalizeAgentType(agent.agent_type || agent.object_type);

  const getEnhanced3DModel = useCallback(() => {
    // ... existing material setup ...

    switch (normalizedType) {
      case "intelligent_assistant":
        return (
          <group>
            {/* Core cube with animated rotation */}
            <Box ref={meshRef} args={[1.0, 1.0, 1.0]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            {/* ... rest of intelligent assistant model */}
          </group>
        );

      case "content_creator":
        return (
          <group>
            {/* Dynamic crystal formation */}
            <Box ref={meshRef} args={[0.9, 1.6, 0.9]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            {/* ... rest of content creator model */}
          </group>
        );

      // ... add all other cases with normalized types

      default:
        return (
          <Box ref={meshRef} args={[1.0, 1.0, 1.0]} position={[0, 0, 0]}>
            <meshStandardMaterial {...commonMaterial} />
          </Box>
        );
    }
  }, [normalizedType, hovered, animationTime.current]);

  // ... rest of component
};
```

### 4. Update data fetching/mapping

In your database hooks or data fetching functions:

```jsx
import { enhanceAgentObject } from "../utils/agentTypeUtils";

// When fetching data from database
const fetchAgents = async () => {
  try {
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;

    // Enhance objects with normalized agent types
    const enhancedAgents = data.map(enhanceAgentObject);

    console.log("Enhanced agents:", enhancedAgents);
    return enhancedAgents;
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
};
```

### 5. Add debugging

Add this temporary debug code to verify the normalization is working:

```jsx
// In your component where agents are rendered
useEffect(() => {
  agents.forEach((agent) => {
    console.log("🔍 Agent type debugging:", {
      name: agent.name,
      raw_agent_type: agent.agent_type,
      raw_object_type: agent.object_type,
      normalized: normalizeAgentType(agent.agent_type || agent.object_type),
      r3f_format: toR3FAgentType(agent.agent_type || agent.object_type),
    });
  });
}, [agents]);
```

## Verification Steps

1. **Check console logs**: After implementing, you should see logs showing:

   - Raw types from database
   - Normalized types being used in switch statements
   - No "unknown agent type" warnings for valid types

2. **Visual verification**:

   - Agents should render with different shapes (spheres, cylinders, cones, tori)
   - No more all-cubes issue

3. **Test with different type formats**:
   - Database with `intelligent_assistant` → Should render as sphere
   - Database with `content_creator` → Should render as crystal structure
   - Database with `local_services` → Should render as cylinder

## Supported Agent Types

The utility supports these normalized types:

- `intelligent_assistant` (Sphere)
- `content_creator` (Crystal/Box structure)
- `local_services` (Cylinder)
- `payment_terminal` (Box)
- `game_agent` (Rotated cube)
- `3d_world_builder` (Box)
- `home_security` (Sphere)
- `real_estate_broker` (Cone)
- `bus_stop_agent` (Cylinder)
- `tutor_teacher` (Book structure)

## Legacy Compatibility

The utility also handles legacy formats:

- `"Intelligent Assistant"` → `intelligent_assistant`
- `"Content Creator"` → `content_creator`
- `"Tutor/Teacher"` → `tutor_teacher`
- `ai_agent` → `intelligent_assistant`

This ensures backward compatibility with existing data.
