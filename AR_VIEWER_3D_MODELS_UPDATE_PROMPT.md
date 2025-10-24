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

- **All regular agents** (intelligent_assistant, local_services, game_agent, 3d_world_builder, home_security, content_creator, real_estate_broker, bus_stop_agent, etc.) → **Humanoid Robot Face model**
- **Payment-related agents** (payment_terminal, trailing_payment_terminal) → **Payment Terminal Device model**

## Task: Update AR Viewer to Use 3D Models

### Step 1: Download and Add 3D Model Files

Download these two GLB files from Sketchfab and add them to your AR Viewer's `/public/models/` folder:

**Model 1: Humanoid Robot Face**

- **URL**: https://sketchfab.com/3d-models/humanoid-robot-face
- **File Format**: GLB (glTF Binary)
- **File Name**: `humanoid_robot_face.glb`
- **Use For**: All agent types except payment terminals
- **Suggested Scale**: 0.3 to 1.0 (depends on actual model size)

**Model 2: Payment Terminal Device (PAX A920)**

- **URL**: https://sketchfab.com/3d-models/pax-a920-highpoly
- **File Format**: GLB (glTF Binary)
- **File Name**: `pax-a920_highpoly.glb`
- **Use For**: Payment terminal agents only
- **Suggested Scale**: 0.4 to 1.0 (depends on actual model size)

### Step 2: Update Your Shape/Geometry Mapping Logic

Find the code in your AR Viewer that maps `object_type` to 3D shapes. This is likely in a component that renders agents using React Three Fiber.

**Replace the current primitive geometry logic with GLB model loading:**

````typescript
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

// In your agent rendering component:
const AgentModel = ({ objectType }: { objectType: string }) => {
  const isPaymentTerminal =
    objectType === "payment_terminal" ||
    objectType === "trailing_payment_terminal";

  return isPaymentTerminal ? <PaymentTerminal /> : <RoboticFace />;
};

### Step 6: Implement Model Preloading (Optional but Recommended)

For better performance and smoother UX:

```typescript
import { useGLTF } from "@react-three/drei";

// Preload all models at app initialization
export const preloadModels = () => {
  useGLTF.preload("/models/humanoid_robot_face.glb");
  useGLTF.preload("/models/pax-a920_highpoly.glb");
};

// Call this in your main AR component's useEffect
useEffect(() => {
  preloadModels();
}, []);
````

````

### Step 3: Update AR Model Mapping

The backend workspace already maps these object types in the database:

- **Standard agents** (default) → `humanoid_robot_face.glb`
- **Payment terminals** → `pax-a920_highpoly.glb`

Payment terminal object types:

- `payment_terminal`
- `trailing_payment_terminal`

**All other agent types use the robotic face model by default.**

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
````

### Step 5: Adjust Model Scales (If Needed)

The Sketchfab models may need scale adjustments:

```typescript
// Initial scales from backend workspace testing:
const roboticFace = { scale: 0.5 }; // Robotic face model
const paymentTerminal = { scale: 0.6 }; // Payment terminal model

// You may need to adjust based on your AR viewer's camera/scene setup
```

Test and adjust scales for your specific AR implementation.

### Step 6: Performance Optimization

For better performance with multiple agents:

```typescript
// Use instancing for multiple instances of the same model
import { Instances, Instance } from "@react-three/drei";

// Preload models
useEffect(() => {
  useGLTF.preload("/models/humanoid_robot_face.glb");
  useGLTF.preload("/models/pax-a920_highpoly.glb");
}, []);

// Use LOD (Level of Detail) for distant objects if needed
import { Detailed } from "@react-three/drei";
```

## Testing Checklist

After implementation, verify:

### Model Loading

- [ ] Robotic face model loads without errors
- [ ] Payment terminal model loads without errors
- [ ] Check browser console for GLB loading errors
- [ ] Verify model file sizes are reasonable (both ~2-5MB)

### Visual Verification

- [ ] Robotic face appears for standard agents
- [ ] Payment terminal appears for `payment_terminal` type
- [ ] Payment terminal appears for `trailing_payment_terminal` type
- [ ] Models are properly scaled and visible in AR view
- [ ] Models maintain proper orientation

### Performance

- [ ] Initial load time is acceptable
- [ ] No frame rate drops when multiple models visible
- [ ] Models render smoothly in AR camera view
- [ ] Preloading works (no loading delays during AR session)

## File Structure

Your AR Viewer should have:

```
/public/
  /models/
    humanoid_robot_face.glb     # 2.9 MB
    pax-a920_highpoly.glb       # 4.7 MB

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
2. Add both models to `/public/models/` in your AR Viewer workspace
3. Find your agent rendering component
4. Replace primitive geometry code with GLB model loading
5. Test with a few agents first
6. Adjust scales as needed
7. Deploy and test in actual AR on mobile devices

---

**Ready to implement?** Start by downloading the GLB files and locating your agent rendering code. Let me know if you need help with any specific step!
