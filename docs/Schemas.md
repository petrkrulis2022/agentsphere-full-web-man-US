# Database Schemas Documentation

## 🗄️ **Database Schema Overview**

AgentSphere uses PostgreSQL via Supabase with a comprehensive schema designed for AR/QR agent deployment, location services, and blockchain integration.

---

## 📋 **Primary Tables**

### **1. deployed_objects** _(Main Table)_

The core table storing all deployed AI agents and AR objects with their properties and metadata.

#### **Table Structure**

```sql
CREATE TABLE deployed_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  object_type text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  altitude double precision,
  trailing_agent boolean DEFAULT false,
  interaction_range numeric(5,2) DEFAULT 15.0,
  ar_notifications boolean DEFAULT true,
  location_type text,
  currency_type text,
  network text,
  created_at timestamptz DEFAULT now()
);
```

#### **Column Descriptions**

| Column              | Type             | Description                       | Constraints                    |
| ------------------- | ---------------- | --------------------------------- | ------------------------------ |
| `id`                | uuid             | Primary key, auto-generated       | PRIMARY KEY, NOT NULL          |
| `user_id`           | text             | Wallet address or user identifier | NOT NULL                       |
| `object_type`       | text             | Type of deployed agent/object     | NOT NULL, CHECK constraint     |
| `latitude`          | double precision | GPS latitude coordinate           | NOT NULL                       |
| `longitude`         | double precision | GPS longitude coordinate          | NOT NULL                       |
| `altitude`          | double precision | Elevation in meters               | NULLABLE                       |
| `trailing_agent`    | boolean          | Whether agent follows user        | DEFAULT false                  |
| `interaction_range` | numeric(5,2)     | Interaction range in meters       | DEFAULT 15.0, CHECK (1.0-25.0) |
| `ar_notifications`  | boolean          | AR notification enabled           | DEFAULT true                   |
| `location_type`     | text             | Environment category              | CHECK constraint               |
| `currency_type`     | text             | Payment currency                  | CHECK constraint               |
| `network`           | text             | Blockchain network                | CHECK constraint               |
| `created_at`        | timestamptz      | Creation timestamp                | DEFAULT now()                  |

#### **Constraints & Validations**

##### **Object Type Constraint**

```sql
ALTER TABLE deployed_objects
ADD CONSTRAINT valid_object_type
CHECK (object_type = ANY (ARRAY[
  'ai_agent'::text,
  'study_buddy'::text,
  'tutor'::text,
  'landmark'::text,
  'building'::text,
  'Intelligent Assistant'::text,
  'Content Creator'::text,
  'Local Services'::text,
  'Tutor/Teacher'::text,
  '3D World Modelling'::text,
  'Game Agent'::text,
  'Taxi driver'::text,
  'Travel Influencer'::text
]));
```

##### **Location Type Constraint**

```sql
ALTER TABLE deployed_objects
ADD CONSTRAINT valid_location_type
CHECK (location_type = ANY (ARRAY[
  'Home'::character varying,
  'Street'::character varying,
  'Countryside'::character varying,
  'Classroom'::character varying,
  'Office'::character varying,
  'Car'::character varying
]));
```

##### **Currency Type Constraint**

```sql
ALTER TABLE deployed_objects
ADD CONSTRAINT valid_currency_type
CHECK (currency_type = ANY (ARRAY[
  'USDFC'::text,
  'AURAS'::text,
  'BDAG'::text
]));
```

##### **Network Constraint**

```sql
ALTER TABLE deployed_objects
ADD CONSTRAINT valid_network
CHECK (network = ANY (ARRAY[
  'avalanche-fuji'::text,
  'avalanche-mainnet'::text,
  'ethereum'::text,
  'polygon'::text,
  'algorand-testnet'::text,
  'algorand-mainnet'::text,
  'near-testnet'::text,
  'near-mainnet'::text,
  'blockdag-testnet'::text
]));
```

##### **Interaction Range Constraint**

```sql
ALTER TABLE deployed_objects
ADD CONSTRAINT valid_interaction_range
CHECK ((interaction_range >= 1.0) AND (interaction_range <= 25.0));
```

#### **Indexes**

```sql
-- Primary key index (automatic)
CREATE UNIQUE INDEX deployed_objects_pkey ON deployed_objects (id);

-- Location-based queries
CREATE INDEX idx_deployed_objects_location ON deployed_objects (latitude, longitude);

-- User-based queries
CREATE INDEX idx_deployed_objects_user ON deployed_objects (user_id);

-- Trailing agents
CREATE INDEX idx_deployed_objects_trailing_agent
ON deployed_objects (trailing_agent)
WHERE (trailing_agent = true);

-- Interaction range
CREATE INDEX idx_deployed_objects_interaction_range
ON deployed_objects (interaction_range);

-- Created timestamp
CREATE INDEX idx_deployed_objects_created_at ON deployed_objects (created_at);
```

---

## 🔐 **Row Level Security (RLS)**

### **Security Policies**

#### **1. Read Policy - Public Access**

```sql
CREATE POLICY "Anyone can read deployed objects"
ON deployed_objects
FOR SELECT
TO public
USING (true);
```

#### **2. Insert Policy - Public Deployment**

```sql
CREATE POLICY "Users can insert their own objects"
ON deployed_objects
FOR INSERT
TO public
WITH CHECK (true);
```

#### **3. Update Policy - Owner Only**

```sql
CREATE POLICY "Users can update their own objects"
ON deployed_objects
FOR UPDATE
TO public
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

#### **4. Delete Policy - Owner Only**

```sql
CREATE POLICY "Users can delete their own objects"
ON deployed_objects
FOR DELETE
TO public
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

---

## 📊 **TypeScript Interfaces**

### **DeployedObject Interface**

```typescript
export interface DeployedObject {
  id: string;
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
  created_at: string;
}
```

### **Enum Types**

```typescript
export type ObjectType =
  | "ai_agent"
  | "study_buddy"
  | "tutor"
  | "landmark"
  | "building"
  | "Intelligent Assistant"
  | "Content Creator"
  | "Local Services"
  | "Tutor/Teacher"
  | "3D World Modelling"
  | "Game Agent"
  | "Taxi driver"
  | "Travel Influencer";

export type LocationType =
  | "Home"
  | "Street"
  | "Countryside"
  | "Classroom"
  | "Office"
  | "Car";

export type CurrencyType = "USDFC" | "AURAS" | "BDAG";

export type NetworkType =
  | "avalanche-fuji"
  | "avalanche-mainnet"
  | "ethereum"
  | "polygon"
  | "algorand-testnet"
  | "algorand-mainnet"
  | "near-testnet"
  | "near-mainnet"
  | "blockdag-testnet";
```

### **Database Operation Interfaces**

```typescript
export interface DatabaseResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface LocationBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface AgentDeploymentRequest {
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

---

## 📈 **Migration History**

### **Migration Files (Chronological Order)**

1. **20250623121541_gentle_paper.sql** - Initial table creation
2. **20250625112258_empty_cave.sql** - Basic enhancements
3. **20250626154804_weathered_palace.sql** - Additional fields
4. **20250626172018_mellow_mountain.sql** - Constraint updates
5. **20250705183547_floating_shadow.sql** - Security policies
6. **20250706172806_lively_summit.sql** - Performance indexes
7. **20250706174146_little_wood.sql** - Object type expansions
8. **20250706181142_frosty_oasis.sql** - Location type additions
9. **20250706210244_tiny_bar.sql** - Currency integrations
10. **20250710103810_empty_summit.sql** - Network additions
11. **20250710104102_curly_valley.sql** - Validation improvements
12. **20250714100809_foggy_shore.sql** - Trailing agent features

### **Latest Migration Details (20250714100809_foggy_shore.sql)**

```sql
-- Add trailing agent and interaction fields
ALTER TABLE deployed_objects
ADD COLUMN IF NOT EXISTS trailing_agent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS interaction_range numeric(5,2) DEFAULT 15.0,
ADD COLUMN IF NOT EXISTS ar_notifications boolean DEFAULT true;

-- Updated object types to include 'Taxi driver', 'Travel Influencer'
-- Updated location types to include 'Car'
-- Updated currency types to include 'BDAG'
-- Updated networks to include 'blockdag-testnet'
```

---

## 🔄 **Future Schema Enhancements**

### **Planned Tables**

#### **1. users** _(Authentication)_

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  wallet_address text UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### **2. agent_interactions** _(Analytics)_

```sql
CREATE TABLE agent_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES deployed_objects(id),
  user_id text NOT NULL,
  interaction_type text NOT NULL,
  interaction_data jsonb,
  location_lat double precision,
  location_lng double precision,
  created_at timestamptz DEFAULT now()
);
```

#### **3. agent_metadata** _(Extended Properties)_

```sql
CREATE TABLE agent_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES deployed_objects(id),
  name text,
  description text,
  avatar_url text,
  behavior_config jsonb,
  custom_properties jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### **4. waitlist** _(Marketing)_

```sql
CREATE TABLE waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  referral_code text UNIQUE,
  referred_by text,
  position integer,
  status text DEFAULT 'pending',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

---

## 🔍 **Query Patterns**

### **Common Queries**

#### **1. Find Nearby Agents**

```sql
SELECT * FROM deployed_objects
WHERE latitude BETWEEN $1 AND $2
AND longitude BETWEEN $3 AND $4
AND interaction_range >= ST_Distance(
  ST_Point(longitude, latitude)::geography,
  ST_Point($5, $6)::geography
);
```

#### **2. Get User's Agents**

```sql
SELECT * FROM deployed_objects
WHERE user_id = $1
ORDER BY created_at DESC;
```

#### **3. Get Trailing Agents**

```sql
SELECT * FROM deployed_objects
WHERE trailing_agent = true
AND user_id = $1;
```

#### **4. Agent Statistics**

```sql
SELECT
  object_type,
  COUNT(*) as count,
  AVG(interaction_range) as avg_range
FROM deployed_objects
GROUP BY object_type
ORDER BY count DESC;
```

---

## 📋 **Data Validation Rules**

### **Business Rules**

1. **Interaction Range:** Must be between 1.0 and 25.0 meters
2. **Location Coordinates:** Must be valid GPS coordinates
3. **Object Types:** Must match predefined list
4. **User Ownership:** Users can only modify their own agents
5. **Trailing Agents:** Cannot exceed 5 per user (future rule)

### **Data Integrity**

- All coordinates must be within valid GPS ranges
- Currency types must match supported blockchain tokens
- Network types must correspond to active blockchain networks
- Agent metadata must be consistent across related tables

---

_This schema documentation will be updated as new features are implemented and database structure evolves._
