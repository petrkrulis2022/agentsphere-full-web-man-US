# API Documentation

## 📡 Overview

This document provides comprehensive API documentation for the AR Viewer project, covering all endpoints, services, and functions across the frontend application.

## 🛠️ Service APIs

### 1. QR Code Service (`src/services/qrCodeService.js`)

**Purpose**: Handles QR code generation and management for multi-blockchain payments

#### Core Functions

##### `generateARQRCode(amount, recipient, blockchain, agentName)`

```javascript
/**
 * Generates QR code for AR payments with blockchain-specific formatting
 * @param {number} amount - Payment amount in USD
 * @param {string} recipient - Wallet address to receive payment
 * @param {string} blockchain - Target blockchain ('blockdag', 'solana', 'morph')
 * @param {string} agentName - Agent name for transaction reference
 * @returns {Promise<Object>} QR code data and transaction info
 */
```

**Request Format**:

```javascript
const qrData = await generateARQRCode(
  1.0,
  "0x1234...",
  "morph",
  "AI Assistant"
);
```

**Response Format**:

```javascript
{
  qrCodeData: "ethereum:0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98@2810/transfer?address=0x1234...&uint256=1000000000000000000",
  transactionId: "tx_1738174800000_ai_assistant",
  blockchain: "morph",
  amount: 1000000000000000000,
  recipient: "0x1234...",
  metadata: {
    agentName: "AI Assistant",
    timestamp: 1738174800000,
    chainId: "2810"
  }
}
```

##### `createQRPosition(index, total)`

```javascript
/**
 * Calculates 3D positioning for AR QR codes
 * @param {number} index - QR code index in array
 * @param {number} total - Total number of QR codes
 * @returns {Object} 3D position coordinates
 */
```

**Response**:

```javascript
{
  x: 2.5,      // X coordinate in AR space
  y: 0,        // Y coordinate (always 0 for horizontal)
  z: -2        // Z coordinate (negative = in front)
}
```

---

### 2. Morph Payment Service (`src/services/morphPaymentService.js`)

**Purpose**: Handles Morph Holesky EVM blockchain payments via MetaMask

#### Core Functions

##### `getConnectedWalletAddress()`

```javascript
/**
 * Retrieves connected MetaMask wallet address asynchronously
 * @returns {Promise<string|null>} Connected wallet address or null
 * @throws {Error} If MetaMask not available or not connected
 */
```

**Usage**:

```javascript
try {
  const address = await getConnectedWalletAddress();
  console.log("Connected wallet:", address);
} catch (error) {
  console.error("Wallet not connected:", error.message);
}
```

##### `generateMorphAgentPayment(agentName, amount)`

```javascript
/**
 * Generates Morph payment QR with dynamic wallet detection
 * @param {string} agentName - Name of the AI agent
 * @param {number} amount - Payment amount in USD
 * @returns {Promise<Object>} Complete payment data with QR codes
 */
```

**Request**:

```javascript
const payment = await generateMorphAgentPayment("AI Assistant", 1.0);
```

**Response**:

```javascript
{
  qrCodeData: "ethereum:0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98@2810/transfer?address=0x1234...&uint256=1000000000000000000",
  transactionId: "morph_1738174800000_ai_assistant",
  blockchain: "morph",
  amount: 1000000000000000000,
  recipient: "0x1234...", // Dynamic wallet address
  rawAmount: 1.0,
  agentName: "AI Assistant",
  metadata: {
    chainId: "2810",
    contractAddress: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
    tokenSymbol: "USDT",
    decimals: 18
  }
}
```

##### `generateMorphQRFormats(recipient, amount, agentName)`

```javascript
/**
 * Generates multiple QR formats for compatibility testing
 * @param {string} recipient - Recipient wallet address
 * @param {number} amount - Amount in USD
 * @param {string} agentName - Agent name
 * @returns {Object} Multiple QR format variations
 */
```

**Response**:

```javascript
{
  eip681: "ethereum:0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98@2810/transfer?address=0x1234...&uint256=1000000000000000000",
  walletConnect: "ethereum:0x1234...@2810?value=1000000000000000000",
  metamask: "https://metamask.app.link/send/0x1234...@2810?value=1000000000000000000"
}
```

---

### 3. Solana Payment Service (`src/services/solanaPaymentService.js`)

**Purpose**: Handles Solana blockchain payments via Phantom wallet

#### Core Functions

##### `generateSolanaAgentPayment(agentName, amount)`

```javascript
/**
 * Generates Solana Pay QR code for agent payments
 * @param {string} agentName - Name of the AI agent
 * @param {number} amount - Payment amount in USD
 * @returns {Object} Solana payment data
 */
```

**Response**:

```javascript
{
  qrCodeData: "solana:9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM?amount=0.003&label=Payment%20to%20AI%20Assistant",
  transactionId: "solana_1738174800000_ai_assistant",
  blockchain: "solana",
  amount: 3000000, // Amount in lamports
  recipient: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  rawAmount: 1.0
}
```

---

### 4. RTK Location Service (`src/services/rtkLocation.js`)

**Purpose**: Provides location and authentication services for AR positioning

#### Core Functions

##### `getLocation()`

```javascript
/**
 * Retrieves current GPS location
 * @returns {Promise<Object>} Location coordinates
 */
```

**Response**:

```javascript
{
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
  timestamp: 1738174800000
}
```

##### `authenticateUser(credentials)`

```javascript
/**
 * Authenticates user with provided credentials
 * @param {Object} credentials - User authentication data
 * @returns {Promise<Object>} Authentication result
 */
```

---

## 🔗 Database Service API (`src/hooks/useDatabase.js`)

**Purpose**: Custom React hook for Supabase database operations

### Hook Usage

#### `useDatabase()`

```javascript
/**
 * React hook for database operations
 * @returns {Object} Database operation functions
 */
const {
  insertARQRCode,
  getActiveQRCodes,
  updateQRCodeStatus,
  insertPaymentTransaction,
} = useDatabase();
```

### Database Functions

##### `insertARQRCode(qrData)`

```javascript
/**
 * Inserts new AR QR code into database
 * @param {Object} qrData - QR code data object
 * @returns {Promise<Object>} Database insert result
 */
```

**Input Format**:

```javascript
const qrData = {
  transaction_id: "morph_1738174800000_ai_assistant",
  qr_code_data: "ethereum:0x9E12...",
  position_x: 0,
  position_y: 0,
  position_z: -2,
  amount: 1000000000000000000,
  recipient_address: "0x1234...",
  contract_address: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
  chain_id: "2810",
  agent_id: "agent-uuid",
  status: "active",
};
```

##### `getActiveQRCodes()`

```javascript
/**
 * Retrieves all active QR codes from database
 * @returns {Promise<Array>} Array of active QR codes
 */
```

##### `updateQRCodeStatus(qrId, status)`

```javascript
/**
 * Updates QR code status in database
 * @param {string} qrId - QR code UUID
 * @param {string} status - New status ('scanned', 'paid', 'expired')
 * @returns {Promise<Object>} Update result
 */
```

##### `insertPaymentTransaction(transactionData)`

```javascript
/**
 * Records payment transaction in database
 * @param {Object} transactionData - Transaction details
 * @returns {Promise<Object>} Insert result
 */
```

---

## 🌐 Blockchain Configuration APIs

### 1. Morph Holesky Chain (`src/config/morph-holesky-chain.js`)

#### Network Configuration

##### `MorphHoleskyTestnet`

```javascript
/**
 * Morph Holesky testnet configuration object
 */
const MorphHoleskyTestnet = {
  chainId: "0xAFA", // 2810 in hex
  chainName: "Morph Holesky Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-quicknode-holesky.morphl2.io"],
  blockExplorerUrls: ["https://explorer-holesky.morphl2.io"],
};
```

##### `MorphUSDTToken`

```javascript
/**
 * USDT token configuration on Morph Holesky
 */
const MorphUSDTToken = {
  address: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
  symbol: "USDT",
  decimals: 18,
  name: "Tether USD",
};
```

#### Utility Functions

##### `generateMorphPaymentURI(recipient, amount)`

```javascript
/**
 * Generates EIP-681 payment URI for Morph USDT transfers
 * @param {string} recipient - Recipient wallet address
 * @param {string} amount - Amount in wei (18 decimals)
 * @returns {string} EIP-681 formatted payment URI
 */
```

**Output**:

```
ethereum:0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98@2810/transfer?address=0x1234...&uint256=1000000000000000000
```

### 2. BlockDAG Chain (`src/config/blockdag-chain.js`)

#### Network Configuration

##### `BlockDAGPrimordialTestnet`

```javascript
/**
 * BlockDAG Primordial testnet configuration
 */
const BlockDAGPrimordialTestnet = {
  chainId: "0x30B9", // 12473 in hex
  chainName: "BlockDAG Primordial Testnet",
  nativeCurrency: {
    name: "BDAG",
    symbol: "BDAG",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-testnet.blockdag.org"],
  blockExplorerUrls: ["https://explorer-testnet.blockdag.org"],
};
```

---

## 🎨 Component APIs

### 1. Enhanced Payment QR Modal (`src/components/EnhancedPaymentQRModal.jsx`)

#### Props Interface

```typescript
interface EnhancedPaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  amount: number;
  onPaymentSuccess?: (transactionData: Object) => void;
}
```

#### Component API

##### Methods

```javascript
/**
 * Handles blockchain network selection
 * @param {string} blockchain - Selected blockchain ('blockdag', 'solana', 'morph')
 */
const handleBlockchainSelect = (blockchain) => {
  /* ... */
};

/**
 * Generates QR code for selected blockchain
 * @param {string} blockchain - Target blockchain
 */
const generateQRCode = async (blockchain) => {
  /* ... */
};

/**
 * Initiates payment monitoring
 * @param {string} transactionId - Transaction to monitor
 */
const startPaymentMonitoring = (transactionId) => {
  /* ... */
};
```

### 2. AR QR Viewer (`src/components/ARQRViewer.jsx`)

#### Props Interface

```typescript
interface ARQRViewerProps {
  qrData: string;
  position: { x: number; y: number; z: number };
  onScan?: (qrData: string) => void;
  visible?: boolean;
}
```

### 3. Unified Wallet Connect (`src/components/UnifiedWalletConnect.jsx`)

#### Props Interface

```typescript
interface UnifiedWalletConnectProps {
  onWalletConnected?: (walletInfo: Object) => void;
  supportedChains?: string[];
}
```

#### Wallet Connection API

##### Methods

```javascript
/**
 * Connects to MetaMask wallet
 * @returns {Promise<Object>} Connection result
 */
const connectMetaMask = async () => {
  /* ... */
};

/**
 * Connects to Phantom wallet
 * @returns {Promise<Object>} Connection result
 */
const connectPhantom = async () => {
  /* ... */
};

/**
 * Disconnects current wallet
 */
const disconnectWallet = () => {
  /* ... */
};
```

---

## 🔐 Authentication API

### Supabase Authentication (`src/lib/supabase.js`)

#### Client Configuration

```javascript
/**
 * Supabase client instance
 */
export const supabase = createClient("your-supabase-url", "your-anon-key");
```

#### Auth Functions

##### `signUp(email, password)`

```javascript
/**
 * Creates new user account
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Signup result
 */
```

##### `signIn(email, password)`

```javascript
/**
 * Authenticates existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login result
 */
```

##### `signOut()`

```javascript
/**
 * Signs out current user
 * @returns {Promise<Object>} Logout result
 */
```

---

## 📱 Mobile Detection API (`src/hooks/use-mobile.js`)

#### Hook Usage

```javascript
/**
 * React hook for mobile device detection
 * @returns {boolean} True if mobile device
 */
const isMobile = useMobile();
```

---

## 🎯 Response Status Codes

### Success Responses

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `204` - No Content: Request successful, no content returned

### Error Responses

- `400` - Bad Request: Invalid request parameters
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Access denied
- `404` - Not Found: Resource not found
- `422` - Unprocessable Entity: Validation errors
- `500` - Internal Server Error: Server error

### Blockchain-Specific Errors

- `WALLET_NOT_CONNECTED` - Wallet not connected
- `NETWORK_MISMATCH` - Wrong blockchain network
- `INSUFFICIENT_FUNDS` - Insufficient wallet balance
- `TRANSACTION_FAILED` - Blockchain transaction failed
- `CONTRACT_ERROR` - Smart contract execution error

---

## 🔄 WebSocket Events (Future Implementation)

### QR Code Status Updates

```javascript
// Subscribe to QR code status changes
supabase
  .channel("ar_qr_codes")
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "ar_qr_codes" },
    (payload) => {
      console.log("QR code updated:", payload);
    }
  )
  .subscribe();
```

### Payment Notifications

```javascript
// Subscribe to payment transaction updates
supabase
  .channel("payment_transactions")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "payment_transactions" },
    (payload) => {
      console.log("New payment:", payload);
    }
  )
  .subscribe();
```

---

## 📋 Rate Limits

### QR Code Generation

- **Limit**: 100 requests per minute per user
- **Timeout**: 5 minutes for QR code expiration
- **Cooldown**: 1 second between requests

### Database Operations

- **Limit**: 1000 requests per minute per user
- **Batch Size**: Maximum 50 records per query
- **Connection Pool**: 20 concurrent connections

### Blockchain Interactions

- **MetaMask**: Limited by browser wallet
- **Phantom**: Limited by wallet implementation
- **RPC Calls**: 100 requests per minute per endpoint

---

## 🧪 Testing Endpoints

### Development QR Generation

```javascript
// Test QR code generation
const testQR = await generateARQRCode(
  1.0,
  "test-address",
  "morph",
  "Test Agent"
);
console.log("Test QR:", testQR);
```

### Database Health Check

```javascript
// Test database connection
const { data, error } = await supabase
  .from("ar_qr_codes")
  .select("count")
  .limit(1);
console.log("DB Health:", error ? "Error" : "OK");
```

---

**API Version**: 1.3.0  
**Last Updated**: July 30, 2025  
**Documentation Status**: ✅ Complete  
**Coverage**: Frontend Services, Database, Blockchain, Components
