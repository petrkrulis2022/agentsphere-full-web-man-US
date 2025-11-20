# Technical Documentation for Patent Application

## Virtual Payment Terminals in Augmented Reality

**Application Date:** November 12, 2025  
**Inventors:** AgentSphere Development Team  
**Technology:** AR-Based Blockchain Payment System

---

## 1. INVENTION OVERVIEW

### 1.1 Title of Invention

**"System and Method for Deploying Virtual Payment Terminals in Augmented Reality with Dynamic Fee Processing and Multi-Blockchain Integration"**

### 1.2 Technical Field

This invention relates to augmented reality (AR) payment systems, blockchain-based cryptocurrency transactions, and location-based virtual commerce infrastructure.

### 1.3 Problem Statement

Traditional payment terminals require physical hardware installation, maintenance costs, and fixed locations. Existing AR solutions lack:

- Multi-blockchain payment support
- Dynamic fee structures for merchant flexibility
- Real-time geospatial placement with precision positioning
- Cross-chain interoperability for diverse cryptocurrencies

### 1.4 Novel Solution

A web-based platform enabling users to deploy virtual payment terminals at precise geographic coordinates, viewable through AR-enabled devices, supporting multiple blockchain networks with configurable fee structures (fixed or dynamic).

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Core Components

**A. Deployment Application (Web Interface)**

- Technology: React 18.2, TypeScript 5.2, Vite 5.0
- Framework: Tailwind CSS, Framer Motion
- Blockchain Integration: @thirdweb-dev/react, @solana/web3.js, @hashgraph/stablecoin-npm-sdk

**B. AR Viewer Application**

- Technology: A-Frame 1.4.0, WebXR API, Three.js
- Real-time Data Sync: Supabase Realtime subscriptions
- Device Capabilities: Camera access, GPS, device orientation sensors

**C. Backend Infrastructure**

- Database: Supabase (PostgreSQL) with geographic extensions
- Authentication: Wallet-based (MetaMask, Phantom)
- Storage: Distributed object storage for 3D models

**D. Blockchain Layer**

- Supported Networks: Hedera (HBAR), Solana (SOL), Polygon Amoy (POL), Ethereum-compatible chains
- Payment Tokens: USDC, USDT, DAI, USDh, native tokens
- Smart Contract Integration: ERC-20, SPL tokens

### 2.2 Data Flow Architecture

```
[User Wallet] → [Deployment UI] → [Supabase DB] → [AR Viewer]
      ↓              ↓                  ↓              ↓
[Blockchain]   [GPS/Camera]    [Real-time Sync]  [3D Rendering]
```

---

## 3. KEY INNOVATIONS

### 3.1 Dynamic Fee Type System (Patent Claim 1)

**Innovation:** Dual-mode payment terminal supporting both fixed and variable transaction amounts.

**Technical Implementation:**

```typescript
// Database Schema
fee_type: "fixed" | "dynamic";
interaction_fee_amount: NUMERIC | NULL;
interaction_fee_token: VARCHAR;
```

**Fixed Fee Mode:**

- Predetermined amount set by terminal deployer
- Database stores: `fee_type='fixed'`, `interaction_fee_amount=10.00`
- AR displays: "Pay 10 USDC"

**Dynamic Fee Mode:**

- Merchant/e-shop sets amount per transaction via URL parameter
- Database stores: `fee_type='dynamic'`, `interaction_fee_amount=NULL`
- AR displays: "Dynamic Amount" with merchant-provided value
- URL format: `https://ar-viewer.app/agent/{id}?amount={value}`

**Commercial Applications:**

- E-commerce checkout redirects
- Variable service fees (taxi, food delivery)
- Donation terminals with suggested amounts
- On-ramp/off-ramp crypto exchanges

### 3.2 Precision Geospatial Placement (Patent Claim 2)

**Innovation:** Camera-based AR placement with sub-meter accuracy using device sensors.

**Technical Components:**

```typescript
interface PreciseLocationData {
  latitude: number; // GPS coordinate
  longitude: number; // GPS coordinate
  altitude: number; // Elevation (meters)
  accuracy: number; // Position accuracy (meters)
  deviceOrientation: {
    // Device angle
    alpha: number; // Compass heading (0-360°)
    beta: number; // Front-to-back tilt (-180 to 180°)
    gamma: number; // Left-to-right tilt (-90 to 90°)
  };
  cameraFOV: number; // Field of view (degrees)
  screenPosition: {
    // Touch/click coordinates
    x: number; // Screen X (pixels)
    y: number; // Screen Y (pixels)
  };
}
```

**Placement Algorithm:**

1. Access device rear camera (MediaStream API)
2. Obtain GPS coordinates (Geolocation API, ±5-10m accuracy)
3. Capture device orientation (DeviceOrientationEvent)
4. User taps screen to place virtual terminal
5. Calculate 3D world position from screen coordinates
6. Store coordinates with orientation metadata
7. AR Viewer renders at exact position using WebXR

**Accuracy Enhancement:**

- RTK GPS support for cm-level precision (optional)
- Visual SLAM for indoor positioning
- Multi-sensor fusion (GPS + compass + accelerometer)

### 3.3 Multi-Blockchain Payment Processing (Patent Claim 3)

**Innovation:** Unified interface supporting heterogeneous blockchain networks with automatic network detection.

**Supported Networks:**

| Network          | Chain ID | Native Token | Stablecoins           | Contract Standard          |
| ---------------- | -------- | ------------ | --------------------- | -------------------------- |
| Hedera Testnet   | 296      | HBAR         | USDC, USDT, DAI, USDh | HTS (Hedera Token Service) |
| Solana Devnet    | -        | SOL          | USDC                  | SPL Token                  |
| Polygon Amoy     | 80002    | POL          | USDC                  | ERC-20                     |
| Ethereum Sepolia | 11155111 | ETH          | USDC, USDT, DAI       | ERC-20                     |

**Network Auto-Detection:**

```typescript
async detectNetwork(provider: Web3Provider): Promise<NetworkInfo> {
  const chainId = await provider.getNetwork().chainId;
  const networkConfig = NETWORKS[chainId];
  return {
    chainId,
    name: networkConfig.name,
    rpcUrl: networkConfig.rpcUrl,
    isTestnet: networkConfig.testnet
  };
}
```

**Payment Flow:**

1. User scans QR code or clicks payment terminal in AR
2. System detects connected wallet and blockchain
3. Verifies terminal's accepted tokens match wallet network
4. Prompts wallet signature for transaction
5. Broadcasts to blockchain with gas estimation
6. Confirms payment and updates terminal state

### 3.4 Real-Time AR Synchronization (Patent Claim 4)

**Innovation:** Live updates to AR environment when payment terminals are deployed/removed globally.

**Technology Stack:**

- Supabase Realtime (PostgreSQL logical replication)
- WebSocket connections to AR clients
- Geographic bounding box queries for efficient data loading

**Implementation:**

```typescript
// Subscribe to nearby terminals
supabase
  .channel("deployed_objects")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "deployed_objects",
      filter: `location_type=in.(Street,Building,Park)`,
    },
    (payload) => {
      if (payload.eventType === "INSERT") {
        renderNewTerminal(payload.new);
      } else if (payload.eventType === "DELETE") {
        removeTerminal(payload.old.id);
      }
    }
  )
  .subscribe();
```

**Spatial Optimization:**

- Load only terminals within 5km radius of user
- Progressive loading based on camera direction
- Level-of-detail (LOD) for distant objects
- Caching for frequently viewed areas

### 3.5 QR Code Payment Integration (Patent Claim 5)

**Innovation:** Hybrid AR/QR payment flow for devices without AR capabilities.

**QR Code Generation:**

```typescript
// Embedded payment data
const qrData = {
  terminalId: "uuid",
  network: "hedera",
  tokenAddress: "0x...",
  amount: feeType === "dynamic" ? null : 10.0,
  recipient: "0x...",
  metadata: {
    merchantName: "Terminal Name",
    location: { lat, lng },
  },
};

// EIP-681 format for Ethereum
const qrString = `ethereum:${tokenAddress}@${chainId}/transfer?address=${recipient}&uint256=${amount}`;
```

**Fallback Mechanism:**

- If AR not supported → Display QR code
- User scans with wallet app (MetaMask, Phantom)
- Wallet auto-fills transaction parameters
- User confirms payment

---

## 4. DATABASE SCHEMA

### 4.1 Core Table Structure

```sql
CREATE TABLE deployed_objects (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Terminal Configuration
  name VARCHAR(255) NOT NULL,
  description TEXT,
  object_type VARCHAR(50) NOT NULL, -- 'payment_terminal', 'trailing_payment_terminal'

  -- Geospatial Data
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  altitude NUMERIC(10, 2),
  location_type VARCHAR(50), -- 'Street', 'Building', 'Park'

  -- Payment Configuration
  fee_type VARCHAR(10) DEFAULT 'fixed' CHECK (fee_type IN ('fixed', 'dynamic')),
  interaction_fee_amount NUMERIC(20, 6), -- NULL for dynamic
  interaction_fee_token VARCHAR(20), -- 'USDC', 'HBAR', 'SOL'
  interaction_fee_usdfc NUMERIC(20, 6),

  -- Blockchain Integration
  network_name VARCHAR(50), -- 'hedera', 'solana', 'polygon_amoy'
  chain_id INTEGER,
  token_contract_address TEXT,
  recipient_wallet_address TEXT NOT NULL,

  -- 3D Model
  model_url TEXT,
  model_scale NUMERIC(5, 2) DEFAULT 1.0,

  -- Placement Metadata
  device_orientation JSONB, -- {alpha, beta, gamma}
  placement_accuracy NUMERIC(10, 2),

  -- Indexes
  CREATE INDEX idx_location ON deployed_objects USING GIST (
    ST_MakePoint(longitude, latitude)
  ),
  CREATE INDEX idx_fee_type ON deployed_objects(fee_type),
  CREATE INDEX idx_network ON deployed_objects(network_name)
);
```

### 4.2 Supported Agent Types

| Type                      | Description                       | Fee Types      | Use Case                  |
| ------------------------- | --------------------------------- | -------------- | ------------------------- |
| payment_terminal          | Static terminal at fixed location | Fixed, Dynamic | Store checkout, ATM       |
| trailing_payment_terminal | Follows user (mobile)             | Fixed, Dynamic | Personal payment receiver |
| intelligent_assistant     | AI-powered info terminal          | Fixed          | Customer service          |
| content_display           | AR billboard/signage              | Fixed          | Advertising               |

---

## 5. AR VIEWER TECHNICAL DETAILS

### 5.1 Camera Access & Placement

**MediaStream API Usage:**

```typescript
// Access rear camera
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: "environment", // Rear camera
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
});

videoElement.srcObject = stream;
```

**Placement Calculation:**

```typescript
// Convert screen tap to 3D world coordinates
function screenToWorld(screenX: number, screenY: number): Vector3 {
  const camera = aframe.camera;
  const fov = camera.fov * (Math.PI / 180);
  const aspect = window.innerWidth / window.innerHeight;

  // Normalize screen coordinates
  const ndcX = (screenX / window.innerWidth) * 2 - 1;
  const ndcY = -(screenY / window.innerHeight) * 2 + 1;

  // Project into 3D space
  const direction = new THREE.Vector3(ndcX, ndcY, -1);
  direction.unproject(camera);

  // Calculate intersection with ground plane
  const distance = 2.0; // meters in front of camera
  return camera.position
    .clone()
    .add(direction.sub(camera.position).normalize().multiplyScalar(distance));
}
```

### 5.2 3D Model Rendering

**A-Frame Entity System:**

```html
<a-entity
  id="payment-terminal"
  gltf-model="url(${modelUrl})"
  position="${x} ${y} ${z}"
  rotation="0 ${heading} 0"
  scale="${scale} ${scale} ${scale}"
  gps-entity-place="latitude: ${lat}; longitude: ${lng};"
  animation="property: rotation; to: 0 360 0; loop: true; dur: 10000"
  click-listener="terminalId: ${id}"
/>
```

**Geographic Positioning:**

```typescript
// Convert lat/lng to AR scene coordinates
AFRAME.registerComponent("gps-entity-place", {
  schema: {
    latitude: { type: "number" },
    longitude: { type: "number" },
  },

  init: function () {
    const userPos = this.getUserGPS();
    const offset = this.calculateOffset(
      userPos.lat,
      userPos.lng,
      this.data.latitude,
      this.data.longitude
    );

    this.el.setAttribute("position", {
      x: offset.x,
      y: 0,
      z: offset.z,
    });
  },
});
```

### 5.3 Payment Modal Interaction

**Dynamic Fee Display:**

```typescript
// Check fee type and display appropriate UI
if (terminal.fee_type === "dynamic") {
  const urlAmount = new URLSearchParams(window.location.search).get("amount");
  displayAmount = urlAmount || "Enter Amount";
} else {
  displayAmount =
    terminal.interaction_fee_amount + " " + terminal.interaction_fee_token;
}
```

---

## 6. BLOCKCHAIN INTEGRATION

### 6.1 Wallet Connection

**Multi-Wallet Support:**

```typescript
// MetaMask (EVM chains)
const evmProvider = await window.ethereum.request({
  method: "eth_requestAccounts",
});

// Phantom (Solana)
const solanaProvider = await window.solana.connect();

// Hedera Wallet Connect
const hederaSession = await hederaWallet.connect({
  network: "testnet",
  methods: ["transfer", "contract_call"],
});
```

### 6.2 Transaction Processing

**ERC-20 Transfer (Ethereum/Polygon):**

```typescript
const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
const tx = await contract.transfer(
  recipientAddress,
  ethers.utils.parseUnits(amount.toString(), decimals)
);
await tx.wait();
```

**SPL Token Transfer (Solana):**

```typescript
const transaction = new Transaction().add(
  Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    sourceAccount,
    destinationAccount,
    ownerPublicKey,
    [],
    amount * Math.pow(10, decimals)
  )
);
await sendAndConfirmTransaction(connection, transaction, [payer]);
```

**Hedera Token Service:**

```typescript
const transaction = new TransferTransaction()
  .addTokenTransfer(tokenId, senderAccountId, -amount)
  .addTokenTransfer(tokenId, recipientAccountId, amount);

const txResponse = await transaction.execute(client);
const receipt = await txResponse.getReceipt(client);
```

### 6.3 Gas Estimation

```typescript
async function estimateGas(network: string, tx: Transaction): Promise<bigint> {
  if (network === "solana") {
    return await connection.getFeeForMessage(tx.compileMessage());
  } else {
    // EVM chains
    return await provider.estimateGas(tx);
  }
}
```

---

## 7. SECURITY & PRIVACY

### 7.1 Authentication

- Wallet-based authentication (no passwords)
- Message signing for identity verification
- Session management via JWT tokens

### 7.2 Data Protection

- HTTPS/TLS for all communications
- Encrypted storage of sensitive configuration
- No private keys stored on servers

### 7.3 Transaction Security

- Client-side transaction signing
- Multi-signature support (optional)
- Transaction simulation before broadcasting

### 7.4 Privacy Considerations

- User location data encrypted at rest
- Option to deploy terminals without revealing identity
- GDPR-compliant data handling

---

## 8. PERFORMANCE OPTIMIZATION

### 8.1 AR Rendering

- Frustum culling (render only visible terminals)
- Object pooling for 3D models
- Texture compression (KTX2, Basis)
- Level-of-detail (LOD) based on distance

### 8.2 Database Queries

- Spatial indexing (PostGIS)
- Query results limited to 5km radius
- Pagination for large datasets
- Caching layer (Redis optional)

### 8.3 Network Efficiency

- WebSocket for real-time updates (not polling)
- Differential updates (only changed data)
- Compressed payloads (gzip)

---

## 9. USE CASES

### 9.1 Retail & E-Commerce

- Virtual checkout terminals in stores
- AR product catalogs with integrated payments
- Pop-up shops without physical infrastructure

### 9.2 Events & Venues

- Festival wristband top-ups
- Stadium concession payments
- Conference booth transactions

### 9.3 Peer-to-Peer

- Street vendor payments
- Service provider terminals (taxi, delivery)
- Freelancer invoicing

### 9.4 Crypto On/Off Ramps

- Dynamic amount terminals for exchanges
- Merchant-variable payment flows
- Cross-border remittances

---

## 10. TECHNICAL SPECIFICATIONS

### 10.1 System Requirements

**Deployment Application:**

- Browser: Chrome 90+, Firefox 88+, Safari 14+
- Wallet: MetaMask, Phantom, WalletConnect compatible
- Network: 1 Mbps minimum internet speed

**AR Viewer Application:**

- Device: iOS 14+ (ARKit), Android 9+ (ARCore)
- Camera: Rear-facing camera required
- GPS: Location services enabled
- Sensors: Accelerometer, gyroscope, compass

### 10.2 Technology Dependencies

```json
{
  "core": {
    "react": "^18.2.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  },
  "blockchain": {
    "@thirdweb-dev/react": "^4.1.10",
    "@solana/web3.js": "^1.98.4",
    "@hashgraph/stablecoin-npm-sdk": "^2.1.5"
  },
  "ar": {
    "aframe": "^1.4.0",
    "three": "bundled with A-Frame"
  },
  "backend": {
    "@supabase/supabase-js": "^2.58.0"
  }
}
```

### 10.3 API Endpoints

**Deployment API:**

- POST `/api/deploy` - Create new payment terminal
- GET `/api/terminals` - List terminals (with geospatial filter)
- PATCH `/api/terminals/:id` - Update terminal config
- DELETE `/api/terminals/:id` - Remove terminal

**AR Viewer API:**

- GET `/api/ar/nearby?lat={lat}&lng={lng}&radius={km}` - Fetch nearby terminals
- WebSocket `/ws/realtime` - Live updates subscription

---

## 11. PATENT CLAIMS SUMMARY

### Primary Claims:

1. **Dynamic Fee System**: Method for virtual payment terminals accepting both fixed and variable transaction amounts determined by external merchants or applications

2. **AR Geospatial Placement**: System for placing virtual objects at precise geographic coordinates using camera-based AR and multi-sensor fusion

3. **Multi-Blockchain Integration**: Unified payment processing across heterogeneous blockchain networks with automatic network detection and token routing

4. **Real-Time Synchronization**: Live AR environment updates using database replication and WebSocket technology for globally distributed virtual terminals

5. **Hybrid AR/QR Payments**: Fallback mechanism providing QR code-based payment when AR is unavailable while maintaining transaction consistency

### Dependent Claims:

6. Camera-based placement algorithm with device orientation compensation
7. Spatial database indexing for efficient geographic queries
8. Token-agnostic payment interface supporting ERC-20, SPL, and HTS standards
9. Progressive loading of AR content based on user position and viewing direction
10. URL parameter-based dynamic amount injection for e-commerce integration

---

## 12. COMPETITIVE ADVANTAGES

1. **No Physical Infrastructure**: Eliminates hardware costs and installation time
2. **Global Deployment**: Terminals accessible worldwide via AR-enabled devices
3. **Multi-Chain Support**: Broadest cryptocurrency compatibility in AR space
4. **Dynamic Pricing**: Enables variable amount payments for e-commerce integration
5. **Real-Time Updates**: Instant synchronization across all AR viewers globally
6. **Open Standards**: Built on WebXR, W3C Geolocation, and standard blockchain protocols

---

## 13. FUTURE ENHANCEMENTS

- **Indoor Positioning**: Visual SLAM for precise indoor terminal placement
- **NFT Integration**: Virtual terminals as tradeable NFT assets
- **Multi-Signature**: Escrow payments requiring multiple approvals
- **Analytics Dashboard**: Terminal performance metrics and transaction history
- **White-Label Solution**: Customizable platform for enterprise deployment

---

## APPENDIX A: CODE SAMPLES

### A.1 Terminal Deployment Function

```typescript
async function deployPaymentTerminal(config: TerminalConfig) {
  // Validate wallet connection
  if (!address) throw new Error("Wallet not connected");

  // Prepare terminal data
  const terminalData = {
    user_id: address,
    name: config.name,
    object_type: "payment_terminal",
    latitude: config.location.latitude,
    longitude: config.location.longitude,
    fee_type: config.feeType,
    interaction_fee_amount: config.feeType === "dynamic" ? null : config.amount,
    interaction_fee_token: config.token,
    network_name: config.network,
    chain_id: NETWORKS[config.network].chainId,
    recipient_wallet_address: address,
    model_url: config.modelUrl || DEFAULT_MODEL_URL,
  };

  // Insert into database
  const { data, error } = await supabase
    .from("deployed_objects")
    .insert([terminalData])
    .select()
    .single();

  if (error) throw error;

  return data;
}
```

### A.2 AR Terminal Renderer

```typescript
function renderARTerminal(terminal: DeployedObject) {
  const scene = document.querySelector("a-scene");

  // Create A-Frame entity
  const entity = document.createElement("a-entity");
  entity.setAttribute("gltf-model", terminal.model_url);
  entity.setAttribute("gps-entity-place", {
    latitude: terminal.latitude,
    longitude: terminal.longitude,
  });
  entity.setAttribute(
    "scale",
    `${terminal.model_scale} ${terminal.model_scale} ${terminal.model_scale}`
  );

  // Add click listener for payment
  entity.addEventListener("click", () => {
    showPaymentModal(terminal);
  });

  scene.appendChild(entity);
}
```

---

**Document Version:** 1.0  
**Classification:** Patent Application Technical Attachment  
**Confidentiality:** Proprietary and Confidential

---

**END OF TECHNICAL DOCUMENTATION**
