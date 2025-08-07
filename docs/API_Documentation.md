# API Documentation

## 🌐 **AgentSphere API Reference**

Comprehensive documentation for all API endpoints, functions, and integrations in the AgentSphere platform.

---

## 🔗 **Base Configuration**

### **Environment Variables**

```typescript
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
  thirdwebClientId: process.env.VITE_THIRDWEB_CLIENT_ID,
  thirdwebSecretKey: process.env.VITE_THIRDWEB_SECRET_KEY,
  assemblyAiKey: process.env.ASSEBLY_AI_API_KEY,
};
```

### **Base URLs**

- **Database:** `https://ncjbwzibnqrbrvicdmec.supabase.co`
- **API Endpoint:** `/rest/v1/`
- **Real-time:** `/realtime/v1/`

---

## 🗄️ **Database API (Supabase)**

### **Authentication Headers**

```typescript
const headers = {
  apikey: process.env.VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};
```

---

## 🤖 **Agent Management API**

### **1. Deploy Agent**

#### **Endpoint:** `POST /deployed_objects`

**Description:** Deploy a new AI agent to a specific location with customizable properties.

**Request Body:**

```typescript
interface DeployAgentRequest {
  user_id: string;
  object_type: ObjectType;
  latitude: number;
  longitude: number;
  altitude?: number;
  trailing_agent?: boolean;
  interaction_range?: number;
  ar_notifications?: boolean;
  location_type?: LocationType;
  currency_type?: CurrencyType;
  network?: NetworkType;
}
```

**Response:**

```typescript
interface DeployAgentResponse {
  data: DeployedObject | null;
  error: string | null;
  status: number;
  statusText: string;
}
```

**Implementation:**

```typescript
export const deployAgent = async (
  agentData: DeployAgentRequest
): Promise<DeployAgentResponse> => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .insert([agentData])
    .select()
    .single();

  return {
    data,
    error: error?.message || null,
    status: error ? 400 : 201,
    statusText: error ? "Bad Request" : "Created",
  };
};
```

**Example Usage:**

```typescript
const newAgent = await deployAgent({
  user_id: "user123",
  object_type: "ai_agent",
  latitude: 40.7128,
  longitude: -74.006,
  altitude: 10.5,
  trailing_agent: false,
  interaction_range: 15.0,
  ar_notifications: true,
  location_type: "Street",
  currency_type: "USDFC",
  network: "ethereum",
});
```

---

### **2. Get Agents by Location**

#### **Endpoint:** `GET /deployed_objects`

**Description:** Retrieve all agents within a specified geographic boundary.

**Query Parameters:**

```typescript
interface LocationQuery {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  limit?: number;
  offset?: number;
}
```

**Implementation:**

```typescript
export const getAgentsByLocation = async (
  bounds: LocationBounds,
  limit = 50
) => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .gte("latitude", bounds.minLat)
    .lte("latitude", bounds.maxLat)
    .gte("longitude", bounds.minLng)
    .lte("longitude", bounds.maxLng)
    .limit(limit)
    .order("created_at", { ascending: false });

  return { data, error };
};
```

---

### **3. Get User's Agents**

#### **Endpoint:** `GET /deployed_objects`

**Description:** Retrieve all agents deployed by a specific user.

**Query Parameters:**

```typescript
interface UserAgentsQuery {
  user_id: string;
  limit?: number;
  offset?: number;
  order_by?: "created_at" | "object_type" | "location_type";
  order_direction?: "asc" | "desc";
}
```

**Implementation:**

```typescript
export const getUserAgents = async (
  userId: string,
  options: UserAgentsQuery = {}
) => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .eq("user_id", userId)
    .limit(options.limit || 50)
    .order(options.order_by || "created_at", {
      ascending: options.order_direction === "asc",
    });

  return { data, error };
};
```

---

### **4. Update Agent**

#### **Endpoint:** `PATCH /deployed_objects`

**Description:** Update properties of an existing agent (owner only).

**Request Body:**

```typescript
interface UpdateAgentRequest {
  id: string;
  updates: Partial<DeployedObject>;
}
```

**Implementation:**

```typescript
export const updateAgent = async (
  agentId: string,
  updates: Partial<DeployedObject>
) => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .update(updates)
    .eq("id", agentId)
    .select()
    .single();

  return { data, error };
};
```

---

### **5. Delete Agent**

#### **Endpoint:** `DELETE /deployed_objects`

**Description:** Remove an agent from the platform (owner only).

**Implementation:**

```typescript
export const deleteAgent = async (agentId: string) => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .delete()
    .eq("id", agentId)
    .select()
    .single();

  return { data, error };
};
```

---

## 🌍 **Location & Proximity API**

### **1. Find Nearby Agents**

**Description:** Find agents within a specific radius of a location.

**Function:**

```typescript
export const findNearbyAgents = async (
  centerLat: number,
  centerLng: number,
  radiusKm: number = 0.1
) => {
  // Calculate bounding box
  const latOffset = radiusKm / 111.32; // 1 degree ≈ 111.32 km
  const lngOffset = radiusKm / (111.32 * Math.cos((centerLat * Math.PI) / 180));

  const bounds: LocationBounds = {
    minLat: centerLat - latOffset,
    maxLat: centerLat + latOffset,
    minLng: centerLng - lngOffset,
    maxLng: centerLng + lngOffset,
  };

  const { data: agents, error } = await getAgentsByLocation(bounds);

  if (error) return { agents: [], error };

  // Filter by exact distance
  const nearbyAgents =
    agents?.filter((agent) => {
      const distance = calculateDistance(
        centerLat,
        centerLng,
        agent.latitude,
        agent.longitude
      );
      return distance <= radiusKm;
    }) || [];

  return { agents: nearbyAgents, error: null };
};
```

### **2. Calculate Distance**

**Description:** Calculate distance between two GPS coordinates.

**Function:**

```typescript
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
```

---

## 🔄 **Real-time API (WebSocket)**

### **1. Subscribe to Agent Updates**

**Description:** Subscribe to real-time updates for all agents.

**Implementation:**

```typescript
export const subscribeToAgentUpdates = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel("deployed_objects_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "deployed_objects",
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};
```

**Payload Structure:**

```typescript
interface RealtimePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: DeployedObject | null;
  old: DeployedObject | null;
  schema: string;
  table: string;
  commit_timestamp: string;
}
```

### **2. Subscribe to Location-based Updates**

**Description:** Subscribe to updates within a specific geographic area.

**Implementation:**

```typescript
export const subscribeToLocationUpdates = (
  bounds: LocationBounds,
  callback: (payload: any) => void
) => {
  const subscription = supabase
    .channel("location_updates")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "deployed_objects",
        filter: `latitude=gte.${bounds.minLat}&latitude=lte.${bounds.maxLat}&longitude=gte.${bounds.minLng}&longitude=lte.${bounds.maxLng}`,
      },
      callback
    )
    .subscribe();

  return subscription;
};
```

---

## 🎯 **AR/QR Code API**

### **1. Generate QR Code**

**Description:** Generate QR code data for agent deployment.

**Function:**

```typescript
export const generateAgentQRCode = (agentData: DeployedObject): string => {
  const qrData = {
    agentId: agentData.id,
    latitude: agentData.latitude,
    longitude: agentData.longitude,
    objectType: agentData.object_type,
    interactionRange: agentData.interaction_range,
    timestamp: new Date().toISOString(),
    version: "1.0",
  };

  return JSON.stringify(qrData);
};
```

### **2. Parse QR Code**

**Description:** Parse and validate QR code data.

**Function:**

```typescript
interface QRCodeData {
  agentId: string;
  latitude: number;
  longitude: number;
  objectType: ObjectType;
  interactionRange?: number;
  timestamp: string;
  version: string;
}

export const parseQRCode = (qrString: string): QRCodeData | null => {
  try {
    const data = JSON.parse(qrString);

    // Validate required fields
    if (
      !data.agentId ||
      !data.latitude ||
      !data.longitude ||
      !data.objectType
    ) {
      return null;
    }

    return data as QRCodeData;
  } catch (error) {
    console.error("Failed to parse QR code:", error);
    return null;
  }
};
```

---

## 🔍 **Analytics & Monitoring API**

### **1. Connection Test**

**Description:** Test database connectivity and performance.

**Function:**

```typescript
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
}> => {
  const startTime = Date.now();

  try {
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        success: false,
        error: error.message,
        responseTime,
      };
    }

    return {
      success: true,
      data,
      responseTime,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      responseTime: Date.now() - startTime,
    };
  }
};
```

### **2. Get Platform Statistics**

**Description:** Retrieve platform usage statistics.

**Function:**

```typescript
export const getPlatformStats = async () => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("object_type, location_type, created_at");

  if (error) return { stats: null, error };

  const stats = {
    totalAgents: data?.length || 0,
    agentsByType: {},
    agentsByLocation: {},
    recentDeployments:
      data?.filter((agent) => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(agent.created_at) > dayAgo;
      }).length || 0,
  };

  return { stats, error: null };
};
```

---

## 🔐 **Authentication API** _(Future Implementation)_

### **1. User Authentication**

**Function:**

```typescript
export const authenticateUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error: error?.message || null,
  };
};
```

### **2. Wallet Connection**

**Function:**

```typescript
export const connectWallet = async (walletAddress: string) => {
  // ThirdWeb wallet connection implementation
  // This will be implemented in Phase 3
};
```

---

## 🚀 **External API Integrations**

### **1. Assembly AI Integration**

**Description:** Voice processing and transcription services.

**Base URL:** `https://api.assemblyai.com/v2/`

**Headers:**

```typescript
const assemblyHeaders = {
  authorization: process.env.ASSEBLY_AI_API_KEY,
  "content-type": "application/json",
};
```

**Functions:**

```typescript
export const transcribeAudio = async (audioUrl: string) => {
  // Implementation planned for Phase 2
};
```

### **2. ThirdWeb Integration**

**Description:** Blockchain and wallet operations.

**Configuration:**

```typescript
const thirdwebConfig = {
  clientId: process.env.VITE_THIRDWEB_CLIENT_ID,
  secretKey: process.env.VITE_THIRDWEB_SECRET_KEY,
};
```

---

## 📊 **Error Handling**

### **Standard Error Response**

```typescript
interface APIError {
  error: string;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}
```

### **Error Codes**

- `AUTH_ERROR`: Authentication failure
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `PERMISSION_DENIED`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## 📋 **Rate Limits**

### **Supabase Limits**

- **Requests per minute:** 100 (free tier)
- **Real-time connections:** 200 concurrent
- **Database connections:** 60 concurrent

### **Best Practices**

- Implement request debouncing
- Use real-time subscriptions instead of polling
- Cache frequently accessed data
- Implement proper error handling and retries

---

## 🧪 **Testing API Endpoints**

### **Example Test Suite**

```typescript
describe("Agent API", () => {
  test("Deploy agent successfully", async () => {
    const agentData = {
      user_id: "test_user",
      object_type: "ai_agent",
      latitude: 40.7128,
      longitude: -74.006,
    };

    const result = await deployAgent(agentData);
    expect(result.data).toBeTruthy();
    expect(result.error).toBeNull();
  });

  test("Get nearby agents", async () => {
    const nearby = await findNearbyAgents(40.7128, -74.006, 1.0);
    expect(nearby.agents).toBeInstanceOf(Array);
  });
});
```

---

_This API documentation will be expanded as new endpoints and features are implemented throughout the development phases._
