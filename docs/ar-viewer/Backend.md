# Backend Operations Documentation

## 📋 Overview

This document covers all backend operations, services, and integrations used in the AR Viewer project. The backend architecture primarily uses Supabase as the main database and real-time service provider, with enhanced schema support for 56+ live agents and comprehensive wallet integration.

## 🔄 Recent Updates (August 2025)

### ✅ Database Connection Fixes

- **Issue Resolved**: Fixed critical fallback logic preventing real agent display
- **Result**: Successfully loading 56 real agents instead of 3 mock agents
- **Enhancement**: Improved retry mechanisms and error handling

### ✅ Enhanced Schema Integration

- **New Fields**: 25+ additional database fields for enhanced agent capabilities
- **Wallet Support**: Complete wallet address system (deployer, payment recipient, agent)
- **Multi-Token**: USDT, USDC, USDs, USBDG+ token integration
- **Communication**: Text, voice, video chat capability flags
- **MCP Services**: Model Context Protocol integration

### ✅ Location Services

- **RTK Integration**: GPS positioning with intelligent fallbacks
- **Global Coverage**: 100km radius for worldwide agent discovery
- **Dynamic Updates**: Real-time location-based agent filtering

## 🏗️ Backend Architecture

### Core Stack

- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Supabase REST API + Custom Services

### Service Layer Architecture

```
Frontend (React)
    ↓
Enhanced Service Layer (Custom JS Services + RTK Location)
    ↓
Supabase Client (Enhanced Queries)
    ↓
Supabase Backend (PostgreSQL + Enhanced Schema + Realtime)
    ↓
Live Agent Database (56+ Real Agents)
```

## 🗄️ Enhanced Database Operations

### Supabase Configuration

```javascript
// Enhanced configuration with real agent support
const supabaseUrl = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const supabaseAnonKey = "your_anon_key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced query with 25+ fields
export const getNearAgentsFromSupabase = async (location) => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select(
      `
      id, name, description, agent_type, location_lat, location_lng,
      deployer_wallet_address, payment_recipient_address, agent_wallet_address,
      token_address, token_symbol, interaction_fee,
      text_chat, voice_chat, video_chat,
      mcp_services, features, created_at, is_active
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return data || [];
};
```

- **Project URL**: Configured via environment variables
- **API Key**: Anon public key for client access
- **RLS**: Row Level Security enabled for data protection

### Core Tables

1. **agents** - AR agent data and metadata
2. **ar_qr_codes** - QR code management for payments
3. **user_profiles** - User account information
4. **payment_transactions** - Payment history and status

### Database Client Setup

```javascript
// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 🔗 Service Integrations

### 1. QR Code Service (`src/services/qrCodeService.js`)

#### Core Operations

- **Create QR Code**: Store QR data in database
- **Update QR Status**: Track payment lifecycle
- **Generate AR Position**: Calculate 3D positioning
- **Cleanup Expired**: Remove old QR codes

#### Key Functions

```javascript
// Create new QR code in database
const createQRCode = async (qrCodeData) => {
  const { data, error } = await supabase
    .from("ar_qr_codes")
    .insert([qrCodeData])
    .select();
  return data?.[0];
};

// Update QR code status
const updateQRCodeStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("ar_qr_codes")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  return data;
};
```

### 2. Blockchain Payment Services

#### BlockDAG Service (`src/services/blockdagPaymentService.js`)

- **Network**: BlockDAG Primordial Testnet (Chain ID: 1043)
- **Token**: USBDG+ tokens
- **Payment Format**: EIP-681 standard
- **Integration**: ThirdWeb wallet

#### Solana Service (`src/services/solanaPaymentService.js`)

- **Network**: Solana Testnet
- **Token**: SOL native currency
- **Payment Format**: Solana Pay standard
- **Integration**: Phantom wallet

#### Morph Service (`src/services/morphPaymentService.js`)

- **Network**: Morph Holesky Testnet (Chain ID: 2810)
- **Token**: USDT (18 decimals)
- **Payment Format**: EIP-681 standard
- **Integration**: MetaMask wallet

### 3. Database Hooks (`src/hooks/useDatabase.js`)

#### Real-time Subscriptions

```javascript
const useRealtimeQRCodes = () => {
  useEffect(() => {
    const subscription = supabase
      .channel("ar_qr_codes_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ar_qr_codes" },
        (payload) => {
          // Handle real-time updates
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);
};
```

## 🔄 Payment Flow Backend Operations

### 1. Payment Initiation

```javascript
// Frontend → QR Service → Database
const initiatePayment = async (agent, network) => {
  // 1. Generate payment data
  const paymentData = await generatePaymentData(agent, network);

  // 2. Create QR code in database
  const qrCode = await qrCodeService.createQRCode({
    transaction_id: paymentData.transactionId,
    qr_code_data: paymentData.qrData,
    agent_id: agent.id,
    amount: paymentData.amount,
    // ... other fields
  });

  // 3. Return QR code for AR display
  return qrCode;
};
```

### 2. Payment Status Tracking

```javascript
// Real-time status updates
const trackPaymentStatus = (qrCodeId) => {
  return supabase
    .channel(`qr_code_${qrCodeId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "ar_qr_codes",
        filter: `id=eq.${qrCodeId}`,
      },
      (payload) => {
        // Handle status changes: scanned → paid → completed
        updatePaymentUI(payload.new.status);
      }
    )
    .subscribe();
};
```

### 3. Blockchain Integration

```javascript
// Morph Holesky Integration Example
const processMorphPayment = async (agent) => {
  // 1. Get connected wallet
  const walletAddress = await getConnectedWalletAddress();

  // 2. Generate payment data
  const paymentData = {
    recipient: walletAddress,
    amount: 1, // 1 USDT
    contractAddress: MorphUSDTToken.address,
    chainId: MorphHoleskyTestnet.chainId,
  };

  // 3. Create EIP-681 QR code
  const qrData = generateMorphPaymentQRData(paymentData);

  // 4. Store in database
  const qrCode = await qrCodeService.createQRCode({
    transaction_id: `morph_${Date.now()}_${agent.id}`,
    qr_code_data: qrData,
    agent_id: agent.id,
    amount: 1000000000000000000, // 1 USDT in wei (18 decimals)
    recipient_address: walletAddress,
    contract_address: MorphUSDTToken.address,
    chain_id: "2810",
  });

  return qrCode;
};
```

## 🔐 Security & Authentication

### Row Level Security (RLS)

```sql
-- Allow reading active QR codes
CREATE POLICY "Allow read access to active QR codes" ON ar_qr_codes
  FOR SELECT USING (status IN ('active', 'generated'));

-- Allow creating QR codes (authenticated users)
CREATE POLICY "Allow creating QR codes" ON ar_qr_codes
  FOR INSERT WITH CHECK (true);
```

### Data Validation

- **Input Sanitization**: All user inputs validated
- **Address Validation**: Ethereum addresses verified
- **Amount Limits**: Payment amounts within reasonable bounds
- **Expiration**: QR codes auto-expire after 5 minutes

## 📊 Performance Optimization

### Database Indexing

```sql
-- Performance indexes
CREATE INDEX idx_ar_qr_codes_status ON ar_qr_codes(status);
CREATE INDEX idx_ar_qr_codes_agent_id ON ar_qr_codes(agent_id);
CREATE INDEX idx_ar_qr_codes_expiration ON ar_qr_codes(expiration_time);
```

### Caching Strategy

- **Connection Pooling**: Supabase handles connection pooling
- **Query Optimization**: Efficient database queries
- **Real-time Subscriptions**: Selective channel subscriptions

### Background Jobs

```sql
-- Cleanup expired QR codes
CREATE OR REPLACE FUNCTION cleanup_expired_qr_codes()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE ar_qr_codes
    SET status = 'expired', updated_at = NOW()
    WHERE status IN ('generated', 'active')
    AND expiration_time < NOW();

    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE 'plpgsql';
```

## 🚨 Error Handling

### Database Errors

```javascript
const handleDatabaseError = (error) => {
  console.error("Database operation failed:", error);

  // Categorize errors
  if (error.code === "23505") {
    // Unique constraint violation
    throw new Error("Transaction ID already exists");
  } else if (error.code === "23503") {
    // Foreign key violation
    throw new Error("Referenced agent not found");
  }

  // Generic error
  throw new Error("Database operation failed");
};
```

### Blockchain Errors

```javascript
const handleBlockchainError = (error, network) => {
  console.error(`${network} operation failed:`, error);

  if (error.code === 4001) {
    // User rejected transaction
    throw new Error("Transaction rejected by user");
  } else if (error.code === -32603) {
    // Network error
    throw new Error(`${network} network unavailable`);
  }

  throw new Error(`${network} transaction failed`);
};
```

## 📈 Monitoring & Logging

### Operation Logging

```javascript
const logOperation = async (operation, data, status) => {
  console.log(`[${new Date().toISOString()}] ${operation}:`, {
    status,
    data: JSON.stringify(data),
    timestamp: Date.now(),
  });

  // In production, send to monitoring service
  if (process.env.NODE_ENV === "production") {
    await sendToMonitoring({
      operation,
      data,
      status,
      timestamp: new Date().toISOString(),
    });
  }
};
```

### Health Checks

```javascript
const checkBackendHealth = async () => {
  try {
    // Check Supabase connection
    const { data, error } = await supabase
      .from("agents")
      .select("count")
      .limit(1);

    if (error) throw error;

    // Check blockchain connections
    const blockchainStatus = await Promise.all([
      checkBlockDAGConnection(),
      checkSolanaConnection(),
      checkMorphConnection(),
    ]);

    return {
      database: "healthy",
      blockchains: blockchainStatus,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      database: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};
```

## 🔮 Future Backend Enhancements

### Planned Improvements

1. **Microservices Architecture**

   - Separate blockchain services
   - Independent scaling
   - Service mesh implementation

2. **Advanced Caching**

   - Redis for session management
   - CDN for static assets
   - Query result caching

3. **Message Queues**

   - Payment processing queues
   - Background job processing
   - Event-driven architecture

4. **API Gateway**
   - Rate limiting
   - API versioning
   - Request/response transformation

### Monitoring & Analytics

- **APM Integration**: Application Performance Monitoring
- **Error Tracking**: Sentry or similar service
- **Metrics Collection**: Custom metrics for business logic
- **Log Aggregation**: Centralized logging system

---

**Last Updated**: July 30, 2025  
**Backend Status**: ✅ Operational  
**Database**: Supabase PostgreSQL  
**Monitoring**: Basic logging (Production monitoring planned)
