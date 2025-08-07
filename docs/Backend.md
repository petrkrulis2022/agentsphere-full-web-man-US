# Backend Operations Documentation

## 🏗️ **Backend Architecture Overview**

AgentSphere utilizes a modern serverless backend architecture combining Supabase for data management and various API integrations for specialized functionality.

---

## 🗄️ **Database Operations (Supabase)**

### **Primary Database: PostgreSQL via Supabase**

- **URL:** `https://ncjbwzibnqrbrvicdmec.supabase.co`
- **Type:** PostgreSQL with real-time capabilities
- **Row Level Security:** Enabled for all tables

### **Core Database Operations**

#### **1. Connection Management**

```typescript
// Connection utility in src/utils/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Connection testing
export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .limit(1);
  return { success: !error, data, error: error?.message };
}
```

#### **2. Agent Deployment Operations**

```typescript
// Create new agent deployment
const deployAgent = async (agentData: DeployedObject) => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .insert([agentData])
    .select();
  return { data, error };
};

// Retrieve agents by location
const getAgentsByLocation = async (
  lat: number,
  lng: number,
  radius: number
) => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .gte("latitude", lat - radius)
    .lte("latitude", lat + radius)
    .gte("longitude", lng - radius)
    .lte("longitude", lng + radius);
  return { data, error };
};

// Update agent properties
const updateAgent = async (
  agentId: string,
  updates: Partial<DeployedObject>
) => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .update(updates)
    .eq("id", agentId)
    .select();
  return { data, error };
};

// Delete agent
const deleteAgent = async (agentId: string, userId: string) => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .delete()
    .eq("id", agentId)
    .eq("user_id", userId);
  return { data, error };
};
```

#### **3. Real-time Subscriptions**

```typescript
// Subscribe to agent updates
const subscribeToAgentUpdates = (callback: (payload: any) => void) => {
  return supabase
    .channel("deployed_objects_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "deployed_objects" },
      callback
    )
    .subscribe();
};

// Subscribe to specific location updates
const subscribeToLocationUpdates = (
  bounds: LocationBounds,
  callback: Function
) => {
  return supabase
    .channel("location_updates")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "deployed_objects",
        filter: `latitude=gte.${bounds.minLat}&latitude=lte.${bounds.maxLat}`,
      },
      callback
    )
    .subscribe();
};
```

---

## 🔐 **Authentication Operations**

### **Row Level Security (RLS) Policies**

#### **Current Policies:**

1. **Read Access:** Anyone can read deployed objects (for map visualization)
2. **Insert Access:** Users can insert objects with any user_id (public deployment)
3. **Update Access:** Users can only update their own objects
4. **Delete Access:** Users can only delete their own objects

#### **Future Authentication Operations:**

```typescript
// User authentication (planned)
const authenticateUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data.user, session: data.session, error };
};

// Get current user session
const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Sign out user
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
```

---

## 🌐 **External API Integrations**

### **1. ThirdWeb Integration (Blockchain Operations)**

- **Client ID:** Configured in environment
- **Purpose:** Blockchain interactions, wallet connections, smart contracts

```typescript
// ThirdWeb operations (planned implementation)
const connectWallet = async () => {
  // Wallet connection logic
};

const deploySmartContract = async (contractData: any) => {
  // Smart contract deployment
};

const processPayment = async (amount: number, currency: string) => {
  // Blockchain payment processing
};
```

### **2. Assembly AI Integration (Voice Processing)**

- **API Key:** Configured in environment
- **Purpose:** Voice command processing for AR interactions

```typescript
// Assembly AI operations (planned)
const processVoiceCommand = async (audioData: Blob) => {
  // Voice processing logic
};

const transcribeAudio = async (audioUrl: string) => {
  // Audio transcription
};
```

---

## 📍 **Location & Mapping Operations**

### **GPS and Location Services**

```typescript
// Get user location
const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// Calculate distance between two points
const calculateDistance = (
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

// Find agents within interaction range
const findNearbyAgents = async (
  userLat: number,
  userLng: number,
  maxDistance: number = 0.1
) => {
  const { data: agents, error } = await supabase
    .from("deployed_objects")
    .select("*");

  if (error) return { agents: [], error };

  const nearbyAgents =
    agents?.filter((agent) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        agent.latitude,
        agent.longitude
      );
      return distance <= maxDistance;
    }) || [];

  return { agents: nearbyAgents, error: null };
};
```

---

## 🎯 **AR/QR Code Operations**

### **QR Code Generation**

```typescript
// Generate QR code for agent
const generateAgentQRCode = async (
  agentId: string,
  agentData: DeployedObject
) => {
  const qrData = {
    agentId,
    latitude: agentData.latitude,
    longitude: agentData.longitude,
    objectType: agentData.object_type,
    interactionRange: agentData.interaction_range,
    timestamp: new Date().toISOString(),
  };

  // QR code generation logic
  return JSON.stringify(qrData);
};

// Parse QR code data
const parseQRCode = (qrString: string) => {
  try {
    return JSON.parse(qrString);
  } catch (error) {
    return null;
  }
};
```

### **AR Operations**

```typescript
// Initialize AR session
const initializeARSession = async () => {
  // AR initialization logic
};

// Place agent in AR space
const placeAgentInAR = (
  agentData: DeployedObject,
  userLocation: GeolocationPosition
) => {
  // AR placement calculation
};

// Handle AR interactions
const handleARInteraction = (agentId: string, interactionType: string) => {
  // AR interaction processing
};
```

---

## 📊 **Analytics & Monitoring Operations**

### **Usage Analytics**

```typescript
// Track agent deployments
const trackAgentDeployment = async (agentData: DeployedObject) => {
  // Analytics tracking logic
};

// Track user interactions
const trackUserInteraction = async (
  userId: string,
  agentId: string,
  interactionType: string
) => {
  // Interaction tracking
};

// Track performance metrics
const trackPerformanceMetric = (metricName: string, value: number) => {
  // Performance monitoring
};
```

### **Error Handling & Logging**

```typescript
// Centralized error handling
const handleError = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error);
  // Send to monitoring service
};

// Log important events
const logEvent = (eventType: string, data: any) => {
  console.log(`Event [${eventType}]:`, data);
  // Send to analytics service
};
```

---

## 🔄 **Data Synchronization Operations**

### **Real-time Data Sync**

```typescript
// Sync agent data across clients
const syncAgentData = async () => {
  // Data synchronization logic
};

// Handle offline/online state
const handleConnectionState = (isOnline: boolean) => {
  if (isOnline) {
    // Sync pending changes
  } else {
    // Store changes locally
  }
};
```

---

## 🚀 **Deployment Operations**

### **Environment Management**

- **Development:** Local development with hot reload
- **Staging:** Preview deployments for testing
- **Production:** Optimized builds with CDN

### **Database Migrations**

```sql
-- Migration execution tracked in supabase/migrations/
-- Current migrations: 12 files from 2025-06-23 to 2025-07-14
-- Latest: 20250714100809_foggy_shore.sql (trailing agent features)
```

### **Backup & Recovery**

- **Automated Backups:** Daily Supabase backups
- **Point-in-time Recovery:** Available through Supabase
- **Data Export:** API available for data extraction

---

## 📋 **Performance Considerations**

### **Database Optimization**

- Indexes on frequently queried columns (latitude, longitude, user_id)
- Row Level Security for data protection
- Connection pooling for scalability

### **API Rate Limiting**

- Supabase: Default limits apply
- ThirdWeb: Rate limits per API key
- Assembly AI: Usage-based pricing

### **Caching Strategy**

- Browser caching for static assets
- Service worker for offline functionality
- Local storage for user preferences

---

_This documentation will be updated as backend operations are implemented and optimized throughout the development phases._
