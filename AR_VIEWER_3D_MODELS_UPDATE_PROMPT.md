# AR Viewer 3D Models Update - Implementation Prompt

## Context

The AgentSphere backend has been updated to use custom 3D models instead of primitive shapes for agents. The AR Viewer application needs to be updated to match this change and render the same professional 3D models.

## Current Architecture

- **Backend (AgentSphere)**: Stores agents in Supabase `deployed_objects` table with `object_type` field
- **AR Viewer (Your App)**: Reads agents from Supabase and renders them in AR using React Three Fiber
- **Contract**: The `object_type` string field (e.g., `"payment_terminal"`, `"intelligent_assistant"`) is the shared agreement between both systems

## What Changed in the Backend

Previously, agent types were mapped to primitive geometric shapes (cubes, spheres, cylinders, etc.). Now they use professional 3D models from Sketchfab.

### New Model Assignment:

- **All regular agents** (intelligent_assistant, local_services, game_agent, 3d_world_builder, home_security, content_creator, real_estate_broker, etc.) → **Humanoid Robot Face model**
- **Payment-related agents** (payment_terminal, trailing_payment_terminal) → **Payment Terminal Device model**
- **Bus stop agents** (bus_stop_agent) → **Human Head model**

## Task: Update AR Viewer to Use 3D Models

### Step 1: Download and Add 3D Model Files

Download these three GLB files from Sketchfab and add them to your AR Viewer's `/public/models/` folder:

**Model 1: Humanoid Robot Face**

- **URL**: https://sketchfab.com/3d-models/humanoid-robot-face
- **File Format**: GLB (glTF Binary)
- **File Name**: `humanoid_robot_face.glb`
- **Use For**: All regular agent types (intelligent_assistant, local_services, game_agent, etc.)
- **Suggested Scale**: 0.3 to 1.0 (depends on actual model size)

**Model 2: Payment Terminal Device (PAX A920)**

- **URL**: https://sketchfab.com/3d-models/pax-a920-highpoly
- **File Format**: GLB (glTF Binary)
- **File Name**: `pax-a920_highpoly.glb`
- **Use For**: Payment terminal agents only
- **Suggested Scale**: 0.4 to 1.0 (depends on actual model size)

**Model 3: Human Head**

- **File Format**: GLB (glTF Binary)
- **File Name**: `human_head.glb`
- **Use For**: Bus stop agents (bus_stop_agent)
- **Suggested Scale**: 0.5 to 1.0 (depends on actual model size)

### Step 2: Update Your Shape/Geometry Mapping Logic

Find the code in your AR Viewer that maps `object_type` to 3D shapes. This is likely in a component that renders agents using React Three Fiber.

**Replace the current primitive geometry logic with GLB model loading:**

```typescript
// Example using React Three Fiber + useGLTF hook

import { useGLTF } from "@react-three/drei";

// Load models at component level or globally
const RoboticFace = () => {
  const { scene } = useGLTF("/models/humanoid_robot_face.glb");
  return <primitive object={scene.clone()} scale={0.5} />;
};

const PaymentTerminal = () => {
  const { scene } = useGLTF("/models/pax-a920_highpoly.glb");
  return <primitive object={scene.clone()} scale={0.6} />;
};

const HumanHead = () => {
  const { scene } = useGLTF("/models/human_head.glb");
  return <primitive object={scene.clone()} scale={0.5} />;
};

// In your agent rendering component:
const AgentModel = ({ objectType }: { objectType: string }) => {
  const isPaymentTerminal =
    objectType === "payment_terminal" ||
    objectType === "trailing_payment_terminal";
  const isBusStop = objectType === "bus_stop_agent";

  if (isPaymentTerminal) return <PaymentTerminal />;
  if (isBusStop) return <HumanHead />;
  return <RoboticFace />;
};

// Preload models for better performance
useGLTF.preload("/models/humanoid_robot_face.glb");
useGLTF.preload("/models/pax-a920_highpoly.glb");
useGLTF.preload("/models/human_head.glb");
```

### Step 3: Object Type Mapping Reference

Update your shape mapping to use these models for each agent type:

```typescript
const getAgentModel = (
  objectType: string
): "3d-robot" | "3d-terminal" | "3d-human-head" => {
  switch (objectType) {
    // Payment Terminal Models
    case "payment_terminal":
    case "trailing_payment_terminal":
      return "3d-terminal";

    // Bus Stop Agent - Human Head
    case "bus_stop_agent":
      return "3d-human-head";

    // All Other Agents - Robot Face
    case "intelligent_assistant":
    case "local_services":
    case "game_agent":
    case "3d_world_builder":
    case "home_security":
    case "content_creator":
    case "real_estate_broker":
    // Legacy types
    case "ai_agent":
    case "tutor":
    case "landmark":
    case "building":
    default:
      return "3d-robot";
  }
};
```

### Step 4: Add Animations (Optional)

The backend version includes rotation animations. You can add similar animations in React Three Fiber:

```typescript
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

const RotatingAgent = ({ children }: { children: React.ReactNode }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01; // Rotate on Y axis
    }
  });

  return <group ref={groupRef}>{children}</group>;
};
```

### Step 5: Scale Adjustment

The models may appear too large or too small. Recommended starting scales:

```typescript
// Adjust these values based on how models appear in your AR view
const MODEL_SCALES = {
  roboticFace: 0.5, // Start with 0.5, adjust as needed
  paymentTerminal: 0.6, // Start with 0.6, adjust as needed
  humanHead: 0.5, // Start with 0.5, adjust as needed
};

// If models are too large, use smaller values (0.1, 0.05, 0.01)
// If models are too small, use larger values (1.0, 2.0, 5.0)
```

### Step 6: Performance Optimization

For better performance with multiple agents:

```typescript
// Use instancing for multiple instances of the same model
import { Instances, Instance } from "@react-three/drei";

// Preload models
useEffect(() => {
  useGLTF.preload("/models/humanoid_robot_face.glb");
  useGLTF.preload("/models/pax-a920_highpoly.glb");
  useGLTF.preload("/models/human_head.glb");
}, []);

// Use LOD (Level of Detail) for distant objects if needed
import { Detailed } from "@react-three/drei";
```

## Testing Checklist

After implementing:

- [ ] Models load without errors in browser console
- [ ] Robotic face appears for regular agents (intelligent_assistant, etc.)
- [ ] Payment terminal device appears for payment_terminal agents
- [ ] Human head appears for bus_stop_agent agents
- [ ] Models are scaled appropriately (not too big/small)
- [ ] Models rotate smoothly (if animation added)
- [ ] Agent interactions still work (clicking/tapping agents)
- [ ] Performance is acceptable with multiple agents
- [ ] Models appear correctly in AR mode on mobile devices

## File Structure

Your AR Viewer should have:

```
/public/
  /models/
    humanoid_robot_face.glb     # 2.9 MB
    pax-a920_highpoly.glb       # 4.7 MB
    human_head.glb              # Size varies

/src/
  /components/
    AgentRenderer.tsx           # Component that renders agent 3D models
    /ar/
      ARScene.tsx               # Main AR scene component
```

## Database Query Reference

Your AR Viewer reads agents from Supabase like this:

```typescript
const { data: agents } = await supabase.from("deployed_objects").select("*");

// Each agent has:
// - id: string
// - name: string
// - object_type: string  ← THIS IS THE KEY FIELD
// - latitude: number
// - longitude: number
// - preciselatitude: number (optional)
// - preciselongitude: number (optional)
// - ... other fields
```

## Important Notes

1. **File Formats**: Use GLB (not GLTF+bin+textures) for simpler deployment
2. **CORS**: If models are hosted externally, ensure CORS headers allow loading
3. **Model Cleanup**: Call `scene.clone()` when reusing models to avoid conflicts
4. **Memory**: Monitor memory usage if loading many large models
5. **Fallback**: Keep primitive shapes as fallback if models fail to load

## Troubleshooting

**Models don't appear:**

- Check browser console for 404 errors
- Verify file paths are correct (`/models/` not `models/`)
- Ensure files are in `/public/models/` folder
- Check file names match exactly (case-sensitive)

**Models too large/small:**

- Adjust scale prop values
- Try scales: 0.01, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0

**Performance issues:**

- Use `useGLTF.preload()` to load models early
- Consider using lower-poly models
- Implement LOD (Level of Detail) for distant agents
- Limit number of visible agents

**Models appear black/wrong colors:**

- Check if scene has proper lighting
- Verify model materials are compatible with React Three Fiber
- Add ambient and directional lights to scene

## Backend Alignment

This update keeps the AR Viewer aligned with the backend (AgentSphere) which uses:

- A-Frame for AR rendering
- Same GLB model files
- Same `object_type` mapping logic

Both systems now share the same visual identity for agents.

## Questions to Address

Before implementing, confirm:

1. Where in your codebase is the agent shape/geometry currently defined?
2. Are you using React Three Fiber or a different 3D library?
3. Do you want to keep primitive shapes as fallback?
4. Should all agents rotate, or only certain types?
5. What's your preferred scale/size for models?

## Next Steps

1. Download the two GLB files from Sketchfab (humanoid_robot_face.glb and pax-a920_highpoly.glb)
2. Copy the human_head.glb file from the backend workspace
3. Add all three models to `/public/models/` in your AR Viewer workspace
4. Find your agent rendering component
5. Replace primitive geometry code with GLB model loading
6. Test with a few agents first
7. Adjust scales as needed
8. Deploy and test in actual AR on mobile devices

---

**Ready to implement?** Start by downloading the GLB files and locating your agent rendering code. Let me know if you need help with any specific step!
