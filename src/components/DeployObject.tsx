import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSDK } from "@thirdweb-dev/react";
import {
  MapPin,
  Crosshair,
  Plus,
  DollarSign,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wallet,
  Settings,
  Users,
  MessageCircle,
  Mic,
  Video,
  TrendingUp,
  Bell,
  Navigation,
} from "lucide-react";
import { useAddress } from "@thirdweb-dev/react";

interface DeployObjectProps {
  supabase: any;
}

interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

interface PreciseLocationData extends LocationData {
  preciseLatitude: number;
  preciseLongitude: number;
  preciseAltitude?: number;
  correctionApplied: boolean;
  fixType?: string;
  satellites?: number;
  processingTime?: number;
}

const DeployObject = ({ supabase }: DeployObjectProps) => {
  const address = useAddress();
  const sdk = useSDK();
  const [bdagBalance, setBdagBalance] = useState<string>("0.00");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string>("");

  // Location states
  const [location, setLocation] = useState<LocationData | null>(null);
  const [preciseLocation, setPreciseLocation] =
    useState<PreciseLocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [rtkLoading, setRtkLoading] = useState(false);

  // Agent configuration states
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState("intelligent_assistant");
  const [agentDescription, setAgentDescription] = useState("");
  const [locationType, setLocationType] = useState("Street");
  const [trailingAgent, setTrailingAgent] = useState(false);
  const [visibilityRange, setVisibilityRange] = useState(25);
  const [interactionRange, setInteractionRange] = useState(15);
  const [arNotifications, setArNotifications] = useState(true);

  // Interaction methods
  const [textChat, setTextChat] = useState(true);
  const [voiceChat, setVoiceChat] = useState(false);
  const [videoChat, setVideoChat] = useState(false);
  const [defiFeatures, setDefiFeatures] = useState(false);

  // MCP integrations
  const [mcpIntegrations, setMcpIntegrations] = useState<string[]>([]);

  // Economics
  const [interactionFee, setInteractionFee] = useState(1); // Changed to integer
  const [selectedToken, setSelectedToken] = useState("USDT"); // New token selection
  const [revenueSharing, setRevenueSharing] = useState(70);

  // Deployment states
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [deploymentError, setDeploymentError] = useState("");

  // Agent wallet = User connected wallet (same address)
  const agentWallet = address || "0x000...000";

  // USDC token contract address on Base Sepolia
  const BDAG_CONTRACT = "0x6533fe2Ebb66CcE28FDdBA9663Fe433A308137e9"; // BDAG Token Contract Address

  // Agent type options - Updated with new categories
  const agentTypes = [
    { value: "intelligent_assistant", label: "Intelligent Assistant" },
    { value: "local_services", label: "Local Services" },
    { value: "payment_terminal", label: "Payment Terminal" },
    { value: "game_agent", label: "Game Agent" },
    { value: "3d_world_builder", label: "3D World Builder" },
    { value: "home_security", label: "Home Security" },
    { value: "content_creator", label: "Content Creator" },
    { value: "real_estate_broker", label: "Real Estate Broker" },
    { value: "bus_stop_agent", label: "Bus Stop Agent" },
    // Conditional trailing agent types
    ...(trailingAgent
      ? [
          {
            value: "trailing_payment_terminal",
            label: "Trailing Payment Terminal",
          },
          { value: "my_ghost", label: "My Ghost" },
        ]
      : []),
  ];

  // Supported stablecoins for payment
  const SUPPORTED_STABLECOINS = [
    "USDT", // Tether USD
    "USDC", // USD Coin
    "USDs", // Stablecoin by Stably
    "USDBG+", // USD Bancor Governance Plus
    "USDe", // Ethena USD
    "LSTD+", // Liquid Staked Token Derivative Plus
    "AIX", // Aigang Token
    "PYUSD", // PayPal USD
    "RLUSD", // Ripple USD
    "USDD", // USDD Stablecoin
    "GHO", // GHO Stablecoin
    "USDx", // USDx Stablecoin
  ];

  // Token contract addresses for BlockDAG Primordial Testnet (Chain ID 1043)
  const TOKEN_ADDRESSES: { [key: string]: string } = {
    USDT: "0x1234567890123456789012345678901234567890", // Placeholder - Replace with actual contract addresses
    USDC: "0x2345678901234567890123456789012345678901",
    USDs: "0x3456789012345678901234567890123456789012",
    "USDBG+": "0x4567890123456789012345678901234567890123",
    USDe: "0x5678901234567890123456789012345678901234",
    "LSTD+": "0x6789012345678901234567890123456789012345",
    AIX: "0x7890123456789012345678901234567890123456",
    PYUSD: "0x8901234567890123456789012345678901234567",
    RLUSD: "0x9012345678901234567890123456789012345678",
    USDD: "0x0123456789012345678901234567890123456789",
    GHO: "0x1234567890123456789012345678901234567891",
    USDx: "0x2345678901234567890123456789012345678902",
  };

  // Location type options - Added Property
  const locationTypes = [
    "Home",
    "Street",
    "Countryside",
    "Classroom",
    "Office",
    "Property",
    ...(trailingAgent ? ["Car"] : []),
  ];

  // MCP integration options
  const mcpOptions = [
    "Chat",
    "Voice",
    "Analysis",
    "Information Lookup",
    "Educational Content",
    "Study Planning",
    "Q&A",
    "Location Services",
    "Directory",
    "Navigation",
    "Content Generation",
    "Brainstorming",
    "Writing",
    "Game Creation",
    "Puzzles",
    "Entertainment",
  ];

  // Fetch USDC balance
  const fetchBDAGBalance = async () => {
    if (!address) return;

    setLoadingBalance(true);
    setBalanceError("");
    try {
      console.log("🔍 Fetching BDAG balance for address:", address);
      console.log("🌐 Using RPC: https://test-rpc.primordial.bdagscan.com/");
      console.log("📄 Contract:", BDAG_CONTRACT);

      // Create provider using the correct RPC endpoint
      const { ethers } = await import("ethers");
      const provider = new ethers.providers.JsonRpcProvider(
        "https://test-rpc.primordial.bdagscan.com/"
      );

      // ERC-20 ABI for balanceOf function
      const erc20ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function name() view returns (string)",
        "function totalSupply() view returns (uint256)",
      ];

      const contract = new ethers.Contract(BDAG_CONTRACT, erc20ABI, provider);

      // Get comprehensive token info and balance
      const [balance, decimals, symbol, name, totalSupply] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol(),
        contract.name(),
        contract.totalSupply(),
      ]);

      // Convert from raw units to readable format
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      const balanceNumber = parseFloat(formattedBalance);
      const formattedTotalSupply = ethers.utils.formatUnits(
        totalSupply,
        decimals
      );

      console.log("✅ BDAG Balance Query Results:");
      console.log("   Token Name:", name);
      console.log("   Token Symbol:", symbol);
      console.log("   Decimals:", decimals.toString());
      console.log("   Total Supply:", formattedTotalSupply, "BDAG");
      console.log("   Raw Balance:", balance.toString());
      console.log("   Formatted Balance:", formattedBalance); // BDAG has 18 decimals
      console.log("   Final Balance:", balanceNumber.toFixed(2), "BDAG");
      console.log("   Account Address:", address);
      console.log("   Contract Address:", BDAG_CONTRACT);
      console.log("   Network: BlockDAG Primordial Testnet (Chain ID: 1043)");

      setBdagBalance(balanceNumber.toFixed(6)); // Display with 6 decimals for readability

      // Show balance in UI notification
      if (balanceNumber > 0) {
        console.log(
          `🎉 You have ${balanceNumber.toFixed(
            6
          )} BDAG in your connected account!`
        );
      } else {
        console.log("⚠️ No BDAG balance found in connected account");
        setBalanceError(
          `No BDAG balance found for ${address}. Ensure BDAG tokens are in this account on BlockDAG Primordial Testnet (Chain ID: 1043).`
        );
      }
    } catch (error) {
      console.error("❌ Error fetching USDC balance:", error);
      setBalanceError(
        `Balance fetch failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Check network connection and RPC endpoint.`
      );
      setBdagBalance("0.00");
    } finally {
      setLoadingBalance(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setLocationLoading(true);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy,
        };
        setLocation(locationData);
        setLocationLoading(false);
        console.log("📍 Current location obtained:", locationData);
      },
      (error) => {
        console.error("❌ Error getting location:", error);
        alert("Error getting location: " + error.message);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Get RTK enhanced location
  const getRTKLocation = async () => {
    if (!location) {
      alert("Please get your current location first");
      return;
    }

    setRtkLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/get-precise-location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPreciseLocation({
        ...location,
        preciseLatitude: data.preciseLatitude,
        preciseLongitude: data.preciseLongitude,
        preciseAltitude: data.preciseAltitude,
        correctionApplied: data.correctionApplied,
        fixType: data.fixType,
        satellites: data.satellites,
        processingTime: data.processingTime,
      });

      console.log("🎯 RTK enhanced location:", data);
    } catch (error) {
      console.error("❌ RTK correction failed:", error);
      alert("RTK correction failed. Using standard GPS location.");
    } finally {
      setRtkLoading(false);
    }
  };

  // Handle MCP integration toggle
  const toggleMCPIntegration = (integration: string) => {
    setMcpIntegrations((prev) =>
      prev.includes(integration)
        ? prev.filter((item) => item !== integration)
        : [...prev, integration]
    );
  };

  // Deploy agent
  const deployAgent = async () => {
    if (!supabase) {
      setDeploymentError(
        "Database connection not available. Please connect to Supabase first."
      );
      return;
    }

    if (!address) {
      setDeploymentError("Please connect your wallet first.");
      return;
    }

    if (!agentName.trim()) {
      setDeploymentError("Please enter an agent name.");
      return;
    }

    if (!location) {
      setDeploymentError("Please get your current location first.");
      return;
    }

    setIsDeploying(true);
    setDeploymentError("");

    try {
      // Simplified deployment data with only essential fields
      const deploymentData = {
        user_id: address,
        name: agentName.trim(),
        description:
          agentDescription.trim() ||
          `A ${agentType.replace("_", " ")} agent deployed via AR`,
        object_type: agentType,
        location_type: locationType,
        latitude: preciseLocation?.preciseLatitude || location.latitude,
        longitude: preciseLocation?.preciseLongitude || location.longitude,
        altitude: preciseLocation?.preciseAltitude || location.altitude || null,
        accuracy: preciseLocation?.correctionApplied
          ? 0.02
          : location.accuracy || 10,
        range_meters: visibilityRange,
        interaction_fee_usdfc: interactionFee,
        owner_wallet: address,
        agent_wallet_address: agentWallet,
        agent_wallet_type: "evm_wallet",
        network: "blockdag-testnet",
        currency_type: selectedToken,
        token_symbol: selectedToken,
        token_address: TOKEN_ADDRESSES[selectedToken] || null,
        chain_id: 1043,
        chat_enabled: textChat,
        voice_enabled: voiceChat,
        defi_enabled: defiFeatures,
        rtk_enhanced: preciseLocation?.correctionApplied || false,
        rtk_provider: preciseLocation?.correctionApplied ? "GeoNet" : null,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      // Add optional fields only if they have values
      if (mcpIntegrations.length > 0) {
        deploymentData.mcp_integrations = mcpIntegrations;
      }

      if (preciseLocation?.preciseLatitude) {
        deploymentData.preciselatitude = preciseLocation.preciseLatitude;
      }

      if (preciseLocation?.preciseLongitude) {
        deploymentData.preciselongitude = preciseLocation.preciseLongitude;
      }

      if (preciseLocation?.preciseAltitude) {
        deploymentData.precisealtitude = preciseLocation.preciseAltitude;
      }

      if (preciseLocation?.correctionApplied) {
        deploymentData.correctionapplied = true;
      }

      const interactionTypes = [];
      if (textChat) interactionTypes.push("text_chat");
      if (voiceChat) interactionTypes.push("voice_interface");
      if (videoChat) interactionTypes.push("video_interface");

      if (interactionTypes.length > 0) {
        deploymentData.interaction_types = interactionTypes;
      }

      console.log("🚀 Deploying agent with data:", deploymentData);

      const { data, error } = await supabase
        .from("deployed_objects")
        .insert([deploymentData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error details:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("✅ Agent deployed successfully:", data);
      setDeploymentSuccess(true);

      // Reset form after successful deployment
      setTimeout(() => {
        setDeploymentSuccess(false);
        setAgentName("");
        setAgentDescription("");
        setMcpIntegrations([]);
        setLocation(null);
        setPreciseLocation(null);
      }, 3000);
    } catch (error) {
      console.error("❌ Deployment failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Deployment failed - please check console for details";
      setDeploymentError(errorMessage);
    } finally {
      setIsDeploying(false);
    }
  };

  // Load USDC balance when wallet connects
  useEffect(() => {
    if (address && sdk) {
      fetchBDAGBalance();
    } else {
      setBdagBalance("0.00");
    }
  }, [address, sdk]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Deploy AR Agent
            </h1>
            <p className="text-green-100">
              Create and deploy your AI agent in the real world
            </p>

            {/* Wallet Connection & BDAG Balance */}
            {address && (
              <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wallet className="h-5 w-5 text-white mr-2" />
                    <span className="text-white font-medium">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white mr-2">BDAG Balance:</span>
                    {loadingBalance ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <span className="text-white font-bold">
                        {bdagBalance} BDAG
                      </span>
                    )}
                  </div>
                </div>
                {balanceError && (
                  <div className="mt-2 text-red-200 text-sm">
                    ⚠️ {balanceError}
                  </div>
                )}
                <div className="mt-2 text-white text-opacity-80 text-xs">
                  RPC: https://sepolia.base.org
                </div>
              </div>
            )}
          </div>

          <div className="p-8 space-y-8">
            {/* Location & Deployment Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-green-600" />
                Location & Deployment
              </h2>

              {/* Location Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {locationLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Crosshair className="h-5 w-5 mr-2" />
                  )}
                  Get Current Location
                </button>

                <button
                  onClick={getRTKLocation}
                  disabled={!location || rtkLoading}
                  className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {rtkLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Navigation className="h-5 w-5 mr-2" />
                  )}
                  Get RTK Enhanced Location
                </button>

                {/* Blockchain Connection Display */}
                <div className="flex items-center justify-center px-6 py-3 bg-blue-100 text-blue-800 rounded-lg border border-blue-200">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Connected to: BlockDAG Primordial Testnet
                </div>
              </div>

              {/* Location Display */}
              {location && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Current Location
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Latitude:</span>
                      <span className="ml-2 font-mono">
                        {location.latitude.toFixed(8)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Longitude:</span>
                      <span className="ml-2 font-mono">
                        {location.longitude.toFixed(8)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Accuracy:</span>
                      <span className="ml-2">
                        ±{location.accuracy?.toFixed(0) || "10"}m
                      </span>
                    </div>
                    {preciseLocation && (
                      <div>
                        <span className="text-gray-600">RTK Status:</span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            preciseLocation.correctionApplied
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {preciseLocation.correctionApplied
                            ? "Enhanced"
                            : "Standard"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trailing Agent Option */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="trailingAgent"
                    checked={trailingAgent}
                    onChange={(e) => setTrailingAgent(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="trailingAgent"
                    className="ml-2 text-sm font-medium text-gray-900"
                  >
                    Trailing Agent
                  </label>
                </div>
                {trailingAgent && (
                  <p className="text-sm text-blue-800">
                    When 'Trailing Agent' is enabled, the agent's location will
                    dynamically follow the device's location used for
                    deployment, ensuring it always stays with you.
                  </p>
                )}
              </div>

              {/* Visibility Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility Range: {visibilityRange}m
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() =>
                        setVisibilityRange(Math.max(5, visibilityRange - 5))
                      }
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={visibilityRange}
                      onChange={(e) =>
                        setVisibilityRange(Number(e.target.value))
                      }
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <button
                      onClick={() =>
                        setVisibilityRange(Math.min(50, visibilityRange + 5))
                      }
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Interaction Range & AR Notifications */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interaction Range: {interactionRange}m
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={interactionRange}
                      onChange={(e) =>
                        setInteractionRange(Number(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="arNotifications"
                      checked={arNotifications}
                      onChange={(e) => setArNotifications(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="arNotifications"
                      className="ml-2 text-sm text-gray-700"
                    >
                      AR Notifications
                    </label>
                  </div>
                </div>
              </div>

              {/* Notification & Discovery */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-yellow-600" />
                  Notification & Discovery
                </h3>
                <p className="text-sm text-gray-700">
                  Users within the interaction range ({interactionRange}m) will
                  receive notifications about your agent. The visibility range (
                  {visibilityRange}m) determines how far users can see your
                  agent in AR.
                </p>
              </div>
            </div>

            {/* Agent Details Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-green-600" />
                Agent Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Enter agent name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Type
                  </label>
                  <select
                    value={agentType}
                    onChange={(e) => setAgentType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {agentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Description
                  </label>
                  <textarea
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    placeholder="Describe your agent's purpose and capabilities"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Type
                  </label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {locationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Agent Interaction Methods */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageCircle className="h-6 w-6 mr-2 text-green-600" />
                Agent Interaction Methods
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="textChat"
                    checked={textChat}
                    onChange={(e) => setTextChat(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="textChat"
                    className="ml-2 text-sm font-medium text-gray-900 flex items-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Text Chat
                  </label>
                </div>

                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="voiceChat"
                    checked={voiceChat}
                    onChange={(e) => setVoiceChat(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="voiceChat"
                    className="ml-2 text-sm font-medium text-gray-900 flex items-center"
                  >
                    <Mic className="h-4 w-4 mr-1" />
                    Voice Chat
                  </label>
                </div>

                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="videoChat"
                    checked={videoChat}
                    onChange={(e) => setVideoChat(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="videoChat"
                    className="ml-2 text-sm font-medium text-gray-900 flex items-center"
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Video Chat
                  </label>
                </div>

                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="defiFeatures"
                    checked={defiFeatures}
                    onChange={(e) => setDefiFeatures(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="defiFeatures"
                    className="ml-2 text-sm font-medium text-gray-900 flex items-center"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    DeFi Features
                  </label>
                </div>
              </div>
            </div>

            {/* MCP Server Interactions */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-green-600" />
                MCP Server Interactions
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mcpOptions.map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`mcp-${option}`}
                      checked={mcpIntegrations.includes(option)}
                      onChange={() => toggleMCPIntegration(option)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`mcp-${option}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Wallet Type */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Wallet className="h-6 w-6 mr-2 text-green-600" />
                Agent Wallet Type
              </h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agent Wallet (Payment Receiver)
                    </label>
                    <div className="bg-white p-3 rounded border font-mono text-sm">
                      {agentWallet}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Connected Wallet
                    </label>
                    <div className="bg-white p-3 rounded border font-mono text-sm">
                      {address || "Not connected"}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Purpose:</strong> The agent's wallet address is
                    identical to your connected wallet. This address will be the
                    receiver of all payments when users interact with your
                    deployed agent. The interaction fee and token selection
                    below will be used for generating payment QR codes.
                  </p>
                </div>
              </div>
            </div>

            {/* Economics & Ownership */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <DollarSign className="h-6 w-6 mr-2 text-green-600" />
                Economics & Ownership
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Token
                  </label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {SUPPORTED_STABLECOINS.map((token) => (
                      <option key={token} value={token}>
                        {token}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interaction Fee
                  </label>
                  <input
                    type="number"
                    value={interactionFee}
                    onChange={(e) =>
                      setInteractionFee(parseInt(e.target.value) || 1)
                    }
                    min="1"
                    step="1"
                    placeholder="Enter fee amount (integer only)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revenue Sharing ({revenueSharing}% to you)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    value={revenueSharing}
                    onChange={(e) => setRevenueSharing(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Revenue Potential */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Revenue Potential
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {((interactionFee * revenueSharing) / 100).toFixed(6)}{" "}
                      {selectedToken}
                    </div>
                    <div className="text-sm text-gray-600">Per Interaction</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {(((interactionFee * revenueSharing) / 100) * 10).toFixed(
                        6
                      )}{" "}
                      {selectedToken}
                    </div>
                    <div className="text-sm text-gray-600">
                      10 Interactions/Day
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {(
                        ((interactionFee * revenueSharing) / 100) *
                        300
                      ).toFixed(6)}{" "}
                      {selectedToken}
                    </div>
                    <div className="text-sm text-gray-600">
                      Monthly Potential
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deployment Button */}
            <div className="pt-6 border-t border-gray-200">
              {deploymentError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-800">{deploymentError}</span>
                  </div>
                </div>
              )}

              {deploymentSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800">
                      Agent deployed successfully!
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={deployAgent}
                disabled={
                  isDeploying || !address || !agentName.trim() || !location
                }
                className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Deploying Agent...
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 mr-2" />
                    Deploy AR Agent
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeployObject;
