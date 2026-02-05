# AR Viewer Screen Positioning Integration Guide

**Date:** February 5, 2026  
**Feature:** Dual Positioning System - GPS + Screen Percentage Coordinates  
**Component:** ARViewer.tsx  
**Purpose:** Enable agents to be positioned at fixed screen locations (x,y%) in addition to GPS coordinates

---

## Overview

The AR Agent deployment system now supports **two positioning modes**:

1. **GPS Mode (existing)** - Agents placed at real-world GPS coordinates with RTK precision
2. **Screen Mode (NEW)** - Agents placed at x,y percentage coordinates on viewer's screen (0-100%)

This allows agents to appear at consistent screen locations for all viewers, regardless of their physical GPS location. Perfect for overlay UI elements, fixed-position interactive agents, or streaming platform integrations.

---

## Database Schema Changes

### New Columns in `deployed_objects` Table

```sql
ALTER TABLE deployed_objects
ADD COLUMN screen_position_x double precision,
ADD COLUMN screen_position_y double precision,
ADD COLUMN positioning_mode varchar(20) DEFAULT 'gps';

-- Add check constraint
ALTER TABLE deployed_objects
ADD CONSTRAINT check_positioning_mode
CHECK (positioning_mode IN ('gps', 'screen'));

-- Add index for screen-positioned queries
CREATE INDEX idx_deployed_objects_screen_mode
ON deployed_objects (positioning_mode)
WHERE positioning_mode = 'screen';
```

### Column Descriptions

- **`screen_position_x`** - Horizontal position as percentage (0.0 - 100.0)
  - `0%` = Left edge of viewport
  - `50%` = Center horizontally
  - `100%` = Right edge of viewport

- **`screen_position_y`** - Vertical position as percentage (0.0 - 100.0)
  - `0%` = Top edge of viewport
  - `50%` = Center vertically
  - `100%` = Bottom edge of viewport

- **`positioning_mode`** - Determines which coordinate system to use
  - `'gps'` = Use latitude/longitude (default, existing behavior)
  - `'screen'` = Use screen_position_x/screen_position_y (new)

---

## Updated TypeScript Interface

### File: `src/types/DeployedObject.ts`

```typescript
export interface DeployedObject {
  id: string;
  name: string;
  description: string;
  agent_type: string;
  user_id: string;

  // GPS Coordinates (existing)
  latitude: number;
  longitude: number;
  altitude?: number;
  preciselatitude?: number;
  preciselongitude?: number;
  precisealtitude?: number;
  accuracy?: number;

  // Screen Percentage Coordinates (NEW)
  screen_position_x?: number; // 0-100%
  screen_position_y?: number; // 0-100%
  positioning_mode?: "gps" | "screen";

  // Other fields...
  range_meters?: number;
  interaction_range?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}
```

---

## ARViewer Integration Steps

### 1. Update Supabase Query

**File:** `src/components/ARViewer.tsx`

**Current Query:**

```typescript
const loadObjects = async () => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("Error loading objects:", error);
    return;
  }

  setObjects(data || []);
};
```

**Updated Query (ADD NEW COLUMNS):**

```typescript
const loadObjects = async () => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select(
      `
      *,
      screen_position_x,
      screen_position_y,
      positioning_mode
    `,
    )
    .eq("is_active", true);

  if (error) {
    console.error("Error loading objects:", error);
    return;
  }

  console.log(`✅ Loaded ${data?.length || 0} agents:`, {
    gpsMode: data?.filter(
      (a) => !a.positioning_mode || a.positioning_mode === "gps",
    ).length,
    screenMode: data?.filter((a) => a.positioning_mode === "screen").length,
  });

  setObjects(data || []);
};
```

---

### 2. Create Screen-to-AR Converter Function

**Add this NEW function to ARViewer.tsx:**

```typescript
/**
 * Convert screen percentage coordinates (0-100%) to 3D AR space coordinates
 * @param xPercent - Horizontal position (0 = left, 50 = center, 100 = right)
 * @param yPercent - Vertical position (0 = top, 50 = center, 100 = bottom)
 * @param index - Agent index for slight offset in case of overlap
 * @returns 3D position {x, y, z} in AR coordinate space
 */
const convertScreenPercentToAR = (
  xPercent: number,
  yPercent: number,
  index: number,
): { x: number; y: number; z: number } => {
  // Get current viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Convert percentage to pixel position
  const screenX = (xPercent / 100) * viewportWidth;
  const screenY = (yPercent / 100) * viewportHeight;

  // Convert to normalized device coordinates (NDC: -1 to 1)
  // X: -1 = left edge, 0 = center, 1 = right edge
  // Y: 1 = top edge, 0 = center, -1 = bottom edge (inverted for screen coords)
  const ndcX = (screenX / viewportWidth) * 2 - 1;
  const ndcY = -(screenY / viewportHeight) * 2 + 1;

  // Camera settings (should match your AR camera configuration)
  const distance = 5; // Distance from camera in meters
  const fov = 60; // Field of view in degrees
  const aspect = viewportWidth / viewportHeight;

  // Calculate visible dimensions at the given distance
  const vFOV = (fov * Math.PI) / 180; // Vertical FOV in radians
  const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect); // Horizontal FOV

  // Project NDC coordinates into 3D space
  const x = ndcX * distance * Math.tan(hFOV / 2);
  const y = ndcY * distance * Math.tan(vFOV / 2);
  const z = -distance;

  // Add small offset per agent to prevent exact overlap
  const offset = index * 0.05;

  return {
    x: x + offset,
    y: y + offset,
    z: z - offset,
  };
};
```

---

### 3. Update getRelativePosition() Function

**Find the existing `getRelativePosition()` function and modify it:**

```typescript
const getRelativePosition = (obj: DeployedObject, index: number) => {
  // ===== NEW: Screen-based positioning =====
  if (
    obj.positioning_mode === "screen" &&
    obj.screen_position_x !== undefined &&
    obj.screen_position_y !== undefined
  ) {
    console.log(
      `📍 Rendering screen-positioned agent: ${obj.name} at (${obj.screen_position_x}%, ${obj.screen_position_y}%)`,
    );

    return convertScreenPercentToAR(
      obj.screen_position_x,
      obj.screen_position_y,
      index,
    );
  }

  // ===== EXISTING: GPS-based positioning =====

  // Demo mode (no user location available)
  if (!userLocation) {
    const angle = (index * 60 * Math.PI) / 180;
    const radius = 8 + index * 1.5;
    return {
      x: Math.sin(angle) * radius * 0.8,
      y: 1.6 + index * 0.2,
      z: -Math.cos(angle) * radius * 0.8,
    };
  }

  // Real GPS mode (user location available)
  const objLat = obj.preciselatitude || obj.latitude;
  const objLon = obj.preciselongitude || obj.longitude;

  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    objLat,
    objLon,
  );

  const bearing = calculateBearing(
    userLocation.latitude,
    userLocation.longitude,
    objLat,
    objLon,
  );

  const scaledDistance = Math.min(distance / 5, 15);

  return {
    x: Math.sin(bearing) * scaledDistance,
    y: 1.6,
    z: -Math.cos(bearing) * scaledDistance,
  };
};
```

---

### 4. Add Visual Distinction for Screen-Positioned Agents

**Update the agent rendering to show mode indicator:**

```typescript
// In your agent rendering JSX
<a-entity key={obj.id} position={`${position.x} ${position.y} ${position.z}`}>

  {/* 3D Model */}
  <a-entity
    gltf-model={obj.agent_type === 'pos_terminal' ? "#payment-terminal-model" : "#robotic-face-model"}
    scale="0.01 0.01 0.01"
    animation="property: rotation; to: 0 360 0; loop: true; dur: 10000"
    onClick={() => handleAgentInteraction(obj)}
  />

  {/* Agent Name Label */}
  <a-text
    value={obj.name}
    position="0 1.0 0"
    align="center"
    color="#ffffff"
    width="4"
  />

  {/* NEW: Mode Indicator Badge */}
  {obj.positioning_mode === 'screen' && (
    <a-plane
      position="0 -0.5 0"
      width="0.8"
      height="0.3"
      color="#3b82f6"
      opacity="0.8"
    >
      <a-text
        value="SCREEN"
        position="0 0 0.01"
        align="center"
        color="#ffffff"
        width="1.5"
      />
    </a-plane>
  )}

  {/* GPS Mode Badge (optional) */}
  {(!obj.positioning_mode || obj.positioning_mode === 'gps') && (
    <a-plane
      position="0 -0.5 0"
      width="0.8"
      height="0.3"
      color="#10b981"
      opacity="0.8"
    >
      <a-text
        value="GPS"
        position="0 0 0.01"
        align="center"
        color="#ffffff"
        width="1.5"
      />
    </a-plane>
  )}

</a-entity>
```

---

### 5. Handle Responsive Behavior

**Add resize listener to recalculate screen positions:**

```typescript
useEffect(() => {
  let resizeTimeout: NodeJS.Timeout;

  const handleResize = () => {
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      console.log(
        "📐 Viewport resized, recalculating screen-positioned agents",
      );

      // Force re-render by triggering state update
      setObjects((prevObjects) => [...prevObjects]);
    }, 300);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
    clearTimeout(resizeTimeout);
  };
}, []);
```

---

## Testing Checklist

### Basic Functionality

- [ ] Load agents with `positioning_mode='screen'`
- [ ] Verify screen percentages render at correct viewport positions
- [ ] Confirm GPS agents still work correctly (backward compatibility)
- [ ] Test mixed GPS + screen agent scenes simultaneously

### Screen Position Accuracy

- [ ] Test corner positions (0%,0%), (100%,100%), (0%,100%), (100%,0%)
- [ ] Test center position (50%, 50%)
- [ ] Test edge positions (0%, 50%), (50%, 0%), (100%, 50%), (50%, 100%)

### Responsive Behavior

- [ ] Test on phone screen (360x640, 375x667, 414x896)
- [ ] Test on tablet screen (768x1024, 820x1180)
- [ ] Test on desktop screen (1920x1080, 2560x1440)
- [ ] Rotate device and verify positions update correctly
- [ ] Resize browser window and verify re-positioning

### Visual Indicators

- [ ] Blue badge appears on screen-positioned agents
- [ ] Green badge appears on GPS-positioned agents
- [ ] Badges are readable and positioned correctly

### Edge Cases

- [ ] Agent with `positioning_mode=null` defaults to GPS
- [ ] Agent with `screen_position_x=null` but `mode='screen'` falls back to GPS
- [ ] Multiple agents at same screen position (slight offset applied)
- [ ] Screen position outside 0-100% range (should clamp)

---

## Example Agent Data

### GPS-Positioned Agent (Existing)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Store Clerk",
  "agent_type": "pos_terminal",
  "latitude": 34.0522365,
  "longitude": -118.2437408,
  "altitude": 0,
  "positioning_mode": "gps"
}
```

### Screen-Positioned Agent (NEW)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "UI Assistant",
  "agent_type": "helper_bot",
  "latitude": 0,
  "longitude": 0,
  "screen_position_x": 85.0,
  "screen_position_y": 15.0,
  "positioning_mode": "screen"
}
```

This agent will appear in the **top-right corner** (85% from left, 15% from top) on all viewers' screens.

---

## Common Screen Position Presets

```typescript
// Useful constants for common positions
const SCREEN_POSITIONS = {
  TOP_LEFT: { x: 10, y: 10 },
  TOP_CENTER: { x: 50, y: 10 },
  TOP_RIGHT: { x: 90, y: 10 },

  CENTER_LEFT: { x: 10, y: 50 },
  CENTER: { x: 50, y: 50 },
  CENTER_RIGHT: { x: 90, y: 50 },

  BOTTOM_LEFT: { x: 10, y: 90 },
  BOTTOM_CENTER: { x: 50, y: 90 },
  BOTTOM_RIGHT: { x: 90, y: 90 },
};
```

---

## Troubleshooting

### Issue: Screen-positioned agents not appearing

**Check:**

1. Database has `screen_position_x` and `screen_position_y` columns
2. Query includes new columns in SELECT statement
3. `positioning_mode` is set to `'screen'` not `'gps'`
4. Percentage values are within 0-100 range

### Issue: Agents positioned incorrectly

**Debug:**

```typescript
console.log("Agent data:", {
  name: obj.name,
  mode: obj.positioning_mode,
  screenX: obj.screen_position_x,
  screenY: obj.screen_position_y,
  calculatedPosition: position,
  viewport: { width: window.innerWidth, height: window.innerHeight },
});
```

### Issue: Agents don't update on resize

**Verify:**

- Resize event listener is attached
- State update triggers re-render
- No caching preventing recalculation

---

## Performance Considerations

### Screen-positioned agents are more performant than GPS agents:

- ✅ No GPS distance calculations needed
- ✅ No bearing computations
- ✅ Simpler coordinate transformation
- ✅ Fixed position (no movement tracking)

### Optimize for many screen-positioned agents:

- Cache viewport dimensions
- Batch position updates on resize
- Use memoization for coordinate conversion

---

## Migration Guide

### For existing GPS agents:

**No action required** - They will continue working as before. The system defaults to GPS mode when `positioning_mode` is null or 'gps'.

### To convert GPS agent to screen positioning:

```sql
UPDATE deployed_objects
SET
  positioning_mode = 'screen',
  screen_position_x = 50.0,  -- Center horizontally
  screen_position_y = 50.0   -- Center vertically
WHERE id = 'your-agent-id';
```

### To support both modes in UI:

Add a toggle in deployment form to let users choose positioning mode.

---

## Summary

This integration enables a **dual positioning system** where agents can be placed either:

1. **In the physical world** (GPS coordinates) - Great for location-based services, outdoor AR, navigation
2. **On the screen** (percentage coordinates) - Perfect for UI overlays, streaming platforms, consistent viewer experience

Both modes work simultaneously in the same AR scene, giving maximum flexibility for different use cases.

**Backward Compatible:** All existing GPS-positioned agents continue working without any changes needed.

---

**Implementation Status:** Ready for integration  
**Breaking Changes:** None (fully backward compatible)  
**Documentation Version:** 1.0  
**Last Updated:** February 5, 2026
