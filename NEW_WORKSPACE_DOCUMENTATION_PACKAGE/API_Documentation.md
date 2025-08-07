# 🚀 **Unified AgentSphere API Documentation**

## **📋 Overview**

This document provides comprehensive API documentation for the unified AgentSphere application, covering all endpoints, services, and functions across deployment, marketplace, and AR viewer functionality with **futuristic visual theme** and **Morph Holesky + USDT-only** approach.

## **🎯 Unified Architecture**

The API is designed for single-network simplicity while providing comprehensive agent management:

- **Network**: Morph Holesky Testnet only (Chain ID: 2810)
- **Token**: USDT only (0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98)
- **Database**: Supabase with enhanced schema
- **Real-time**: Supabase subscriptions for live updates
- **Wallet**: Thirdweb SDK integration

### **Base Configuration**

```typescript
const unifiedConfig = {
  // Supabase (shared across all views)
  supabaseUrl: "https://jqajtdtrlujksoxftyvb.supabase.co",
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,

  // Thirdweb (blockchain integration)
  thirdwebClientId: "299516306b51bd6356fd8995ed628950",
  thirdwebSecretKey: process.env.VITE_THIRDWEB_SECRET_KEY,

  // Morph Holesky (fixed network)
  morphChainId: 2810,
  usdtContract: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
  morphRPC: "https://rpc-quicknode-holesky.morphl2.io",
  morphExplorer: "https://explorer-holesky.morphl2.io",
};
```

## **🛠️ Core Unified Services**

### **1. Unified Agent Management Service**

**Purpose**: Manages agents across deployment, marketplace, and AR viewer with single source of truth

#### **Enhanced Agent Deployment**

```typescript
interface UnifiedAgentData {
  // Basic info (deployment form)
  agent_name: string;
  agent_description: string;
  object_type: AgentType;

  // Location (shared with AR)
  latitude: number;
  longitude: number;
  altitude?: number;

  // Wallets (Morph Holesky only)
  deployer_wallet_address: string;
  payment_recipient_address: string;
  agent_wallet_address?: string;

  // Payment (USDT only)
  interaction_fee: number; // Always in USDT

  // Capabilities (displayed in marketplace & AR)
  text_chat: boolean;
  voice_chat: boolean;
  video_chat: boolean;
  features: string[];
  mcp_services: MCPService[];

  // AR settings
  visibility_range: number;
  interaction_range: number;
  ar_notifications: boolean;
}

export const deployUnifiedAgent = async (agentData: UnifiedAgentData) => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .insert([
      {
        ...agentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        interaction_count: 0,
        revenue_total: 0,
      },
    ])
    .select(
      `
      id, agent_name, agent_description, object_type,
      latitude, longitude, altitude,
      deployer_wallet_address, payment_recipient_address, agent_wallet_address,
      interaction_fee, text_chat, voice_chat, video_chat,
      features, mcp_services, visibility_range, interaction_range,
      ar_notifications, created_at
    `
    )
    .single();

  return {
    agent: data,
    error: error?.message || null,
    // Immediately available in marketplace and AR
    isUnified: true,
  };
};
```

#### **Unified Agent Retrieval**

```typescript
export const getUnifiedAgents = async (filters?: {
  object_type?: string;
  location?: { lat: number; lng: number; radius: number };
  capabilities?: ("text_chat" | "voice_chat" | "video_chat")[];
}) => {
  let query = supabase
    .from("deployed_objects")
    .select(
      `
      id, agent_name, agent_description, object_type,
      latitude, longitude, altitude, location_type,
      deployer_wallet_address, payment_recipient_address, agent_wallet_address,
      interaction_fee, text_chat, voice_chat, video_chat,
      features, mcp_services, visibility_range, interaction_range,
      ar_notifications, interaction_count, revenue_total, created_at
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.object_type) {
    query = query.eq("object_type", filters.object_type);
  }

  if (filters?.location) {
    const { lat, lng, radius } = filters.location;
    const latOffset = radius / 111.32;
    const lngOffset = radius / (111.32 * Math.cos((lat * Math.PI) / 180));

    query = query
      .gte("latitude", lat - latOffset)
      .lte("latitude", lat + latOffset)
      .gte("longitude", lng - lngOffset)
      .lte("longitude", lng + lngOffset);
  }

  const { data, error } = await query.limit(100);

  return {
    agents: data || [],
    error: error?.message || null,
    count: data?.length || 0,
  };
};
```

### **2. Futuristic AR Payment Service**

**Purpose**: Generates holographic QR codes for USDT payments with cosmic styling

#### **Enhanced QR Generation**

```typescript
interface FuturisticQRData {
  qrCodeData: string; // EIP-681 for Morph Holesky USDT
  transactionId: string;
  agentId: string;
  amount: string; // USDT amount
  recipient: string; // payment_recipient_address
  contractAddress: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98";
  chainId: 2810;
  // Futuristic styling
  visualStyle: {
    glowColor: string;
    borderEffect: "neon" | "holographic";
    animation: "pulse" | "rotate" | "float";
  };
  // AR positioning
  arPosition: { x: number; y: number; z: number };
  expiration: Date;
}

export const generateFuturisticPaymentQR = async (
  agent: UnifiedAgent
): Promise<FuturisticQRData> => {
  // Convert USDT to wei (18 decimals on Morph Holesky)
  const amountInWei = BigInt(Math.floor(agent.interaction_fee * 1e18));

  // Generate EIP-681 URI
  const qrCodeData = `ethereum:${unifiedConfig.usdtContract}@${unifiedConfig.morphChainId}/transfer?address=${agent.payment_recipient_address}&uint256=${amountInWei}`;

  const transactionId = `unified_${Date.now()}_${agent.id}`;

  // Calculate AR position
  const arPosition = calculateCosmicPosition(agent, Date.now());

  // Agent type color mapping
  const agentColors = {
    "Intelligent Assistant": "#00BFFF",
    "Local Services": "#FF00FF",
    "Payment Terminal": "#00FF41",
    "Game Agent": "#00FFFF",
    "3D World Builder": "#FF1493",
    "Home Security": "#32CD32",
    "Content Creator": "#FFD700",
  };

  const qrData: FuturisticQRData = {
    qrCodeData,
    transactionId,
    agentId: agent.id,
    amount: agent.interaction_fee.toString(),
    recipient: agent.payment_recipient_address,
    contractAddress: unifiedConfig.usdtContract,
    chainId: unifiedConfig.morphChainId,
    visualStyle: {
      glowColor: agentColors[agent.object_type] || "#00BFFF",
      borderEffect: "holographic",
      animation: "float",
    },
    arPosition,
    expiration: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  };

  // Store in AR QR codes table
  await supabase.from("ar_qr_codes").insert([
    {
      transaction_id: transactionId,
      qr_code_data: qrCodeData,
      agent_id: agent.id,
      position_x: arPosition.x,
      position_y: arPosition.y,
      position_z: arPosition.z,
      amount: amountInWei.toString(),
      recipient_address: agent.payment_recipient_address,
      contract_address: unifiedConfig.usdtContract,
      chain_id: unifiedConfig.morphChainId.toString(),
      status: "active",
    },
  ]);

  return qrData;
};
```

#### **Cosmic AR Positioning**

```typescript
const calculateCosmicPosition = (
  agent: UnifiedAgent,
  timestamp: number
): { x: number; y: number; z: number } => {
  const index = parseInt(agent.id.slice(-4), 16) % 8; // Use agent ID for consistent positioning
  const angle = index * 45 * (Math.PI / 180); // 45° spacing
  const distance = 2.5 + (index % 3) * 0.5; // Staggered distances
  const height = 0.5 + (index % 4) * 0.3; // Varied heights

  return {
    x: Math.sin(angle) * distance,
    y: height,
    z: -distance + Math.cos(angle) * 0.3, // Negative Z = in front of camera
  };
};
```

### **3. Real-time Unified Sync Service**

**Purpose**: Live updates across deployment, marketplace, and AR viewer

```typescript
export const useUnifiedRealtimeSync = () => {
  const [agents, setAgents] = useState<UnifiedAgent[]>([]);
  const [qrCodes, setQrCodes] = useState<FuturisticQRData[]>([]);

  useEffect(() => {
    // Subscribe to agent changes
    const agentSubscription = supabase
      .channel("unified_agents")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deployed_objects" },
        (payload) => {
          console.log("🔄 Unified agent update:", payload);

          switch (payload.eventType) {
            case "INSERT":
              setAgents((prev) => [...prev, payload.new as UnifiedAgent]);
              break;
            case "UPDATE":
              setAgents((prev) =>
                prev.map((agent) =>
                  agent.id === payload.new.id
                    ? (payload.new as UnifiedAgent)
                    : agent
                )
              );
              break;
            case "DELETE":
              setAgents((prev) =>
                prev.filter((agent) => agent.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    // Subscribe to QR code changes
    const qrSubscription = supabase
      .channel("ar_qr_codes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ar_qr_codes" },
        (payload) => {
          console.log("✨ QR code update:", payload);

          if (payload.eventType === "INSERT") {
            // Add new QR code to AR scene
            const newQR = transformToFuturisticQR(payload.new);
            setQrCodes((prev) => [...prev, newQR]);
          } else if (payload.eventType === "UPDATE") {
            // Update QR status (scanned, paid, etc.)
            setQrCodes((prev) =>
              prev.map((qr) =>
                qr.transactionId === payload.new.transaction_id
                  ? { ...qr, status: payload.new.status }
                  : qr
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      agentSubscription.unsubscribe();
      qrSubscription.unsubscribe();
    };
  }, []);

  return {
    agents,
    qrCodes,
    // Deployment functions
    deployAgent: deployUnifiedAgent,
    updateAgent: updateUnifiedAgent,
    deleteAgent: deleteUnifiedAgent,
    // AR functions
    generatePaymentQR: generateFuturisticPaymentQR,
    clearExpiredQRs: () => {
      setQrCodes((prev) => prev.filter((qr) => qr.expiration > new Date()));
    },
  };
};
```

## **🎨 Futuristic Component APIs**

### **1. HolographicCard Component**

```typescript
interface HolographicCardProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
  glowIntensity?: number;
  animation?: boolean;
  className?: string;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  variant = "primary",
  glowIntensity = 0.5,
  animation = true,
  className = "",
}) => {
  const variantStyles = {
    primary: "border-cyan-400/30 shadow-cyan-400/20",
    secondary: "border-magenta-400/30 shadow-magenta-400/20",
    accent: "border-green-400/30 shadow-green-400/20",
  };

  return (
    <div
      className={`
      bg-gradient-to-br from-slate-900/80 to-slate-800/60 
      backdrop-blur-lg rounded-2xl border ${variantStyles[variant]}
      shadow-2xl hover:shadow-xl transition-all duration-500
      relative overflow-hidden ${className}
    `}
    >
      {animation && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent animate-pulse" />
      )}
      <div className="relative z-10 p-6">{children}</div>
    </div>
  );
};
```

### **2. FuturisticButton Component**

```typescript
interface FuturisticButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "accent";
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export const FuturisticButton: React.FC<FuturisticButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  loading = false,
  disabled = false,
  size = "md",
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-cyan-400 hover:shadow-cyan-400/50",
    secondary:
      "bg-gradient-to-r from-purple-500/20 to-magenta-500/20 border-magenta-400 hover:shadow-magenta-400/50",
    accent:
      "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400 hover:shadow-green-400/50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`
        ${sizes[size]} rounded-xl backdrop-blur-md transition-all duration-300 
        transform hover:scale-105 font-semibold text-white shadow-lg 
        border border-opacity-30 ${variants[variant]}
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      `}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        boxShadow: disabled ? "none" : "0 0 20px rgba(0, 255, 255, 0.3)",
        textShadow: disabled ? "none" : "0 0 10px rgba(255, 255, 255, 0.5)",
      }}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
```

### **3. CosmicQRDisplay Component**

```typescript
interface CosmicQRDisplayProps {
  qrData: FuturisticQRData;
  size?: number;
  showDetails?: boolean;
}

export const CosmicQRDisplay: React.FC<CosmicQRDisplayProps> = ({
  qrData,
  size = 256,
  showDetails = true,
}) => (
  <div className="relative inline-block">
    {/* Cosmic glow effect */}
    <div
      className="absolute inset-0 rounded-xl blur-lg opacity-60 animate-pulse"
      style={{
        background: `linear-gradient(45deg, ${qrData.visualStyle.glowColor}, #FF00FF)`,
        transform: "scale(1.1)",
      }}
    />

    {/* QR code container */}
    <div className="relative bg-white p-4 rounded-xl border-2 border-white/20">
      <QRCodeSVG
        value={qrData.qrCodeData}
        size={size}
        bgColor="#FFFFFF"
        fgColor="#000000"
        level="M"
        imageSettings={{
          src: "/logo.svg",
          height: 24,
          width: 24,
          excavate: true,
        }}
      />
    </div>

    {/* Floating details */}
    {showDetails && (
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
        <HolographicCard variant="accent" className="px-4 py-2">
          <p className="text-sm font-semibold text-white neon-text">
            💳 {qrData.amount} USDT
          </p>
          <p className="text-xs text-cyan-300">
            Morph Holesky • {qrData.agentId.slice(0, 8)}...
          </p>
        </HolographicCard>
      </div>
    )}

    {/* Holographic particles */}
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: "2s",
          }}
        />
      ))}
    </div>
  </div>
);
```

## **📱 Cross-Platform Navigation API**

### **Unified Router Service**

```typescript
interface UnifiedNavigationState {
  // Current page context
  currentPage: "home" | "deploy" | "marketplace" | "ar-viewer";

  // Shared state between pages
  selectedAgent?: UnifiedAgent;
  highlightedAgent?: string;
  filterType?: string;
  deploymentSuccess?: boolean;

  // Navigation functions
  navigateToAR: (agentId?: string, filter?: string) => void;
  navigateToMarketplace: (highlight?: string) => void;
  navigateToDeploy: (source?: string) => void;
  navigateToHome: () => void;
}

export const useUnifiedNavigation = (): UnifiedNavigationState => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAgent, setSelectedAgent] = useState<UnifiedAgent>();

  const getCurrentPage = (): UnifiedNavigationState["currentPage"] => {
    const path = location.pathname;
    if (path.includes("/deploy")) return "deploy";
    if (path.includes("/marketplace")) return "marketplace";
    if (path.includes("/ar-viewer")) return "ar-viewer";
    return "home";
  };

  return {
    currentPage: getCurrentPage(),
    selectedAgent,

    navigateToAR: (agentId, filter) => {
      const params = new URLSearchParams();
      if (agentId) params.set("highlight", agentId);
      if (filter) params.set("filter", filter);

      navigate(
        `/ar-viewer${params.toString() ? "?" + params.toString() : ""}`,
        {
          state: { source: getCurrentPage() },
        }
      );
    },

    navigateToMarketplace: (highlight) => {
      const params = highlight ? `?highlight=${highlight}` : "";
      navigate(`/marketplace${params}`, {
        state: { source: getCurrentPage() },
      });
    },

    navigateToDeploy: (source) => {
      navigate("/deploy", {
        state: { source: source || getCurrentPage() },
      });
    },

    navigateToHome: () => {
      navigate("/", {
        state: { source: getCurrentPage() },
      });
    },
  };
};
```

## **🔐 Enhanced Security & Validation**

### **Unified Input Validation**

```typescript
export const UnifiedValidators = {
  agent: {
    validateDeployment: (data: UnifiedAgentData) => {
      const errors: string[] = [];

      // Basic validation
      if (!data.agent_name || data.agent_name.length < 3) {
        errors.push("Agent name must be at least 3 characters");
      }

      if (!data.agent_description || data.agent_description.length < 10) {
        errors.push("Agent description must be at least 10 characters");
      }

      // Wallet validation (Morph Holesky format)
      if (!isValidEthereumAddress(data.deployer_wallet_address)) {
        errors.push("Invalid deployer wallet address");
      }

      if (!isValidEthereumAddress(data.payment_recipient_address)) {
        errors.push("Invalid payment recipient address");
      }

      // Location validation
      if (
        !isValidLatitude(data.latitude) ||
        !isValidLongitude(data.longitude)
      ) {
        errors.push("Invalid GPS coordinates");
      }

      // Fee validation (USDT)
      if (data.interaction_fee < 0.01 || data.interaction_fee > 1000) {
        errors.push("Interaction fee must be between 0.01 and 1000 USDT");
      }

      // Capability validation
      if (!data.text_chat && !data.voice_chat && !data.video_chat) {
        errors.push("At least one communication method must be enabled");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },

  payment: {
    validateQRData: (qrData: FuturisticQRData) => {
      const errors: string[] = [];

      // Network validation
      if (qrData.chainId !== 2810) {
        errors.push("Invalid chain ID - must be Morph Holesky (2810)");
      }

      // Contract validation
      if (qrData.contractAddress !== unifiedConfig.usdtContract) {
        errors.push("Invalid contract address - must be USDT on Morph Holesky");
      }

      // Amount validation
      const amount = parseFloat(qrData.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push("Invalid payment amount");
      }

      // Expiration validation
      if (qrData.expiration <= new Date()) {
        errors.push("QR code has expired");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },

  wallet: {
    validateMorphHoleskyWallet: async (address: string) => {
      if (!isValidEthereumAddress(address)) {
        return { isValid: false, error: "Invalid Ethereum address format" };
      }

      try {
        // Check if connected to Morph Holesky
        const chainId = await window.ethereum?.request({
          method: "eth_chainId",
        });
        if (chainId !== "0xAFA") {
          // 2810 in hex
          return {
            isValid: false,
            error: "Wallet must be connected to Morph Holesky testnet",
          };
        }

        return { isValid: true };
      } catch (error) {
        return {
          isValid: false,
          error: "Unable to verify wallet connection",
        };
      }
    },
  },
};

// Helper functions
const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const isValidLatitude = (lat: number): boolean => {
  return lat >= -90 && lat <= 90;
};

const isValidLongitude = (lng: number): boolean => {
  return lng >= -180 && lng <= 180;
};
```

## **📊 Analytics & Monitoring API**

### **Unified Analytics Service**

```typescript
interface UnifiedAnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export const useUnifiedAnalytics = () => {
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const track = (event: string, properties: Record<string, any> = {}) => {
    const analyticsEvent: UnifiedAnalyticsEvent = {
      event,
      properties: {
        ...properties,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
      sessionId,
    };

    // Send to analytics service
    console.log("📊 Analytics:", analyticsEvent);

    // In production, send to your analytics service
    // analytics.track(analyticsEvent);
  };

  return {
    // Deployment events
    trackAgentDeployment: (agent: UnifiedAgent) => {
      track("agent_deployed", {
        agent_id: agent.id,
        agent_type: agent.object_type,
        interaction_fee: agent.interaction_fee,
        capabilities: {
          text_chat: agent.text_chat,
          voice_chat: agent.voice_chat,
          video_chat: agent.video_chat,
        },
        mcp_services_count: agent.mcp_services?.length || 0,
        features_count: agent.features?.length || 0,
      });
    },

    // Marketplace events
    trackAgentView: (
      agent: UnifiedAgent,
      source: "marketplace" | "ar-viewer"
    ) => {
      track("agent_viewed", {
        agent_id: agent.id,
        agent_type: agent.object_type,
        source,
        interaction_fee: agent.interaction_fee,
      });
    },

    // AR events
    trackARSession: (
      duration: number,
      agentsViewed: string[],
      qrCodesGenerated: number
    ) => {
      track("ar_session", {
        duration_seconds: duration,
        agents_viewed_count: agentsViewed.length,
        agents_viewed: agentsViewed,
        qr_codes_generated: qrCodesGenerated,
      });
    },

    // Payment events
    trackPaymentGeneration: (qrData: FuturisticQRData) => {
      track("payment_qr_generated", {
        agent_id: qrData.agentId,
        amount_usdt: qrData.amount,
        transaction_id: qrData.transactionId,
        chain_id: qrData.chainId,
      });
    },

    trackPaymentCompletion: (
      transactionId: string,
      success: boolean,
      txHash?: string
    ) => {
      track("payment_completed", {
        transaction_id: transactionId,
        success,
        tx_hash: txHash,
        network: "morph_holesky",
      });
    },

    // Navigation events
    trackNavigation: (from: string, to: string, method: "click" | "direct") => {
      track("page_navigation", {
        from_page: from,
        to_page: to,
        navigation_method: method,
      });
    },
  };
};
```

## **🔧 Error Handling & Response Formats**

### **Unified Error Response**

```typescript
interface UnifiedAPIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    request_id?: string;
    component:
      | "deployment"
      | "marketplace"
      | "ar-viewer"
      | "payment"
      | "database";
  };
}

interface UnifiedAPISuccess<T = any> {
  success: true;
  data: T;
  timestamp: string;
  request_id?: string;
}

type UnifiedAPIResponse<T = any> = UnifiedAPISuccess<T> | UnifiedAPIError;

// Error codes
export const UnifiedErrorCodes = {
  // Validation errors
  INVALID_AGENT_DATA: "INVALID_AGENT_DATA",
  INVALID_WALLET_ADDRESS: "INVALID_WALLET_ADDRESS",
  INVALID_LOCATION: "INVALID_LOCATION",
  INVALID_PAYMENT_AMOUNT: "INVALID_PAYMENT_AMOUNT",

  // Network errors
  WRONG_NETWORK: "WRONG_NETWORK",
  WALLET_NOT_CONNECTED: "WALLET_NOT_CONNECTED",
  TRANSACTION_FAILED: "TRANSACTION_FAILED",

  // Database errors
  DATABASE_ERROR: "DATABASE_ERROR",
  AGENT_NOT_FOUND: "AGENT_NOT_FOUND",
  DUPLICATE_AGENT: "DUPLICATE_AGENT",

  // AR errors
  AR_NOT_SUPPORTED: "AR_NOT_SUPPORTED",
  CAMERA_PERMISSION_DENIED: "CAMERA_PERMISSION_DENIED",
  QR_CODE_EXPIRED: "QR_CODE_EXPIRED",

  // Rate limiting
  RATE_LIMITED: "RATE_LIMITED",
  TOO_MANY_AGENTS: "TOO_MANY_AGENTS",
};

// Error handler utility
export const handleUnifiedError = (
  error: any,
  component: string
): UnifiedAPIError => {
  const requestId = crypto.randomUUID();

  return {
    success: false,
    error: {
      code: error.code || "UNKNOWN_ERROR",
      message: error.message || "An unexpected error occurred",
      details: error.details || null,
      timestamp: new Date().toISOString(),
      request_id: requestId,
      component: component as any,
    },
  };
};
```

## **🧪 Testing & Development**

### **API Testing Utilities**

```typescript
// Test data generators
export const TestDataGenerators = {
  generateMockAgent: (
    overrides: Partial<UnifiedAgentData> = {}
  ): UnifiedAgentData => ({
    agent_name: "Test Agent",
    agent_description: "A test agent for development purposes",
    object_type: "Intelligent Assistant",
    latitude: 40.7128,
    longitude: -74.006,
    altitude: 0,
    deployer_wallet_address: "0x742d35Cc6639C0532fba578b7c24A5C0bF5c21DE",
    payment_recipient_address: "0x742d35Cc6639C0532fba578b7c24A5C0bF5c21DE",
    interaction_fee: 1.0,
    text_chat: true,
    voice_chat: false,
    video_chat: false,
    features: ["AI Assistant", "Question Answering"],
    mcp_services: [],
    visibility_range: 25.0,
    interaction_range: 15.0,
    ar_notifications: true,
    ...overrides,
  }),

  generateMockQRData: (agent: UnifiedAgent): FuturisticQRData => ({
    qrCodeData: `ethereum:${unifiedConfig.usdtContract}@${unifiedConfig.morphChainId}/transfer?address=${agent.payment_recipient_address}&uint256=1000000000000000000`,
    transactionId: `test_${Date.now()}`,
    agentId: agent.id,
    amount: agent.interaction_fee.toString(),
    recipient: agent.payment_recipient_address,
    contractAddress: unifiedConfig.usdtContract,
    chainId: unifiedConfig.morphChainId,
    visualStyle: {
      glowColor: "#00BFFF",
      borderEffect: "holographic",
      animation: "float",
    },
    arPosition: { x: 0, y: 1, z: -2 },
    expiration: new Date(Date.now() + 5 * 60 * 1000),
  }),
};

// Development health check
export const runHealthCheck = async (): Promise<{
  database: boolean;
  blockchain: boolean;
  apis: boolean;
  overall: boolean;
}> => {
  console.log("🔍 Running unified health check...");

  const results = {
    database: false,
    blockchain: false,
    apis: false,
    overall: false,
  };

  try {
    // Test database connection
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("count")
      .limit(1);
    results.database = !error;

    // Test blockchain connection
    if (typeof window !== "undefined" && window.ethereum) {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      results.blockchain = chainId === "0xAFA"; // Morph Holesky
    }

    // Test APIs
    results.apis = true; // Add actual API tests

    results.overall = results.database && results.apis;

    console.log("✅ Health check results:", results);
    return results;
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return results;
  }
};
```

---

**API Documentation Status**: ✅ **Complete & Updated**  
**Version**: 2.0.0 - Unified AgentSphere  
**Architecture**: Single-network (Morph Holesky + USDT)  
**Theme**: Futuristic with holographic elements  
**Integration**: Deployment + Marketplace + AR Viewer  
**Last Updated**: August 2, 2025

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
