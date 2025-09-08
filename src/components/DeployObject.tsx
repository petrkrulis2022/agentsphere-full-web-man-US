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
  Network,
} from "lucide-react";
import { useAddress } from "@thirdweb-dev/react";
import PaymentMethodsSelector from "./PaymentMethodsSelector";
import BankDetailsForm from "./BankDetailsForm";
import { networkDetectionService } from "../services/networkDetectionService.js";
import {
  SUPPORTED_EVM_NETWORKS,
  getSupportedNetworkByChainId,
} from "../config/evmNetworks.js";

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
  const [usdcBalance, setUsdcBalance] = useState<string>("0.000000");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string>("");

  // Location states
  const [location, setLocation] = useState<LocationData | null>(null);
  const [preciseLocation, setPreciseLocation] =
    useState<PreciseLocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [rtkLoading, setRtkLoading] = useState(false);

  // Network detection states
  const [currentNetwork, setCurrentNetwork] = useState<any>(null);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string>("");

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
  const [interactionFee, setInteractionFee] = useState(10); // Default to 10 USDC instead of 1
  const [selectedToken, setSelectedToken] = useState("USDC"); // Changed to USDC as default
  const [revenueSharing, setRevenueSharing] = useState(70);

  // Payment Methods (6-faced cube system)
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [showBankForm, setShowBankForm] = useState<
    "virtual_card" | "bank_qr" | null
  >(null);

  // Deployment states
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [deploymentError, setDeploymentError] = useState("");

  // Agent wallet = User connected wallet (same address)
  const agentWallet = address || "0x000...000";

  // USDC token contract address on Base Sepolia
  // USDC contract addresses for different networks
  const USDC_CONTRACTS = {
    11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Ethereum Sepolia
    421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia
    84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
    11155420: "0x5fd84259d3c8b37a387c0d8a4c5b0c0d7d3c0D7", // OP Sepolia
    43113: "0x5425890298aed601595a70AB815c96711a31Bc65", // Avalanche Fuji
  };

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

  // Supported stablecoins for payment - Dynamic based on network
  const getSupportedStablecoins = () => {
    if (currentNetwork?.chainId) {
      // Different tokens supported on different networks
      switch (currentNetwork.chainId) {
        case 11155111: // Ethereum Sepolia
          return ["USDC", "USDT", "DAI"];
        case 421614: // Arbitrum Sepolia
          return ["USDC", "USDT", "DAI"];
        case 84532: // Base Sepolia
          return ["USDC", "USDT", "DAI"]; // Fixed: Removed CBETH, added DAI
        case 11155420: // OP Sepolia
          return ["USDC", "USDT", "DAI"]; // Fixed: Removed OP, added DAI
        case 43113: // Avalanche Fuji
          return ["USDC", "USDT", "DAI"]; // Fixed: Removed AVAX, added DAI
        default:
          return ["USDC", "USDT", "DAI"]; // Fixed: Added DAI as default
      }
    }
    return [
      "USDC",
      "USDT",
      "USDs",
      "USDBG+",
      "USDe",
      "LSTD+",
      "AIX",
      "PYUSD",
      "RLUSD",
      "USDD",
      "GHO",
      "USDx",
    ];
  };

  // Dynamic token addresses based on current network
  const getTokenAddresses = () => {
    if (currentNetwork?.chainId) {
      switch (currentNetwork.chainId) {
        case 11155111: // Ethereum Sepolia
          return {
            USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
            USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
            DAI: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
          };
        case 421614: // Arbitrum Sepolia
          return {
            USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
            USDT: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
            ARB: "0x1234567890123456789012345678901234567890", // Placeholder
          };
        case 84532: // Base Sepolia
          return {
            USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
            USDT: "0x1234567890123456789012345678901234567890", // Placeholder
            CBETH: "0x1234567890123456789012345678901234567890", // Placeholder
          };
        case 11155420: // OP Sepolia
          return {
            USDC: "0x5fd84259d3c8b37a387c0d8a4c5b0c0d7d3c0D7",
            USDT: "0x1234567890123456789012345678901234567890", // Placeholder
            OP: "0x1234567890123456789012345678901234567890", // Placeholder
          };
        case 43113: // Avalanche Fuji
          return {
            USDC: "0x5425890298aed601595a70AB815c96711a31Bc65",
            USDT: "0x1234567890123456789012345678901234567890", // Placeholder
            AVAX: "0x0000000000000000000000000000000000000000", // Native token
          };
        default:
          return {};
      }
    }
    // Default fallback - basic USDC support
    return {
      USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Ethereum Sepolia USDC
    };
  };

  const SUPPORTED_STABLECOINS = getSupportedStablecoins();
  const TOKEN_ADDRESSES = getTokenAddresses();

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

  // Fetch USDC balance for current network
  const fetchUSDCBalance = async () => {
    if (!address || !currentNetwork) return;

    setLoadingBalance(true);
    setBalanceError("");
    try {
      console.log("🔍 Fetching USDC balance for address:", address);
      console.log("🌐 Network:", currentNetwork.name);
      console.log("🌐 Chain ID:", currentNetwork.chainId);

      const usdcContract = USDC_CONTRACTS[currentNetwork.chainId];
      if (!usdcContract) {
        console.warn(
          `USDC contract not found for chain ${currentNetwork.chainId}`
        );
        setBalanceError(`USDC not available on ${currentNetwork.name}`);
        setUsdcBalance("0.000000");
        return;
      }

      console.log("📄 USDC Contract:", usdcContract);

      // Create provider using the current network RPC
      const { ethers } = await import("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // ERC-20 ABI for balanceOf function
      const erc20ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function name() view returns (string)",
      ];

      const contract = new ethers.Contract(usdcContract, erc20ABI, provider);

      // Get token info and balance
      const [balance, decimals, symbol, name] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol(),
        contract.name(),
      ]);

      // Convert from raw units to readable format (USDC typically has 6 decimals)
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      const balanceNumber = parseFloat(formattedBalance);

      console.log("✅ USDC Balance Query Results:");
      console.log("   Token Name:", name);
      console.log("   Token Symbol:", symbol);
      console.log("   Decimals:", decimals.toString());
      console.log("   Raw Balance:", balance.toString());
      console.log("   Formatted Balance:", formattedBalance);
      console.log("   Final Balance:", balanceNumber.toFixed(6), "USDC");
      console.log("   Account Address:", address);
      console.log("   Contract Address:", usdcContract);
      console.log(
        "   Network:",
        currentNetwork.name,
        "(Chain ID:",
        currentNetwork.chainId + ")"
      );

      setUsdcBalance(balanceNumber.toFixed(6)); // Display with 6 decimals for USDC

      // Show balance in UI notification
      if (balanceNumber > 0) {
        console.log(
          `🎉 You have ${balanceNumber.toFixed(
            6
          )} USDC in your connected account on ${currentNetwork.name}!`
        );
      } else {
        console.log("⚠️ No USDC balance found in connected account");
        setBalanceError(
          `No USDC balance found for ${address}. You may need USDC tokens on ${currentNetwork.name} (Chain ID: ${currentNetwork.chainId}) to deploy agents.`
        );
      }
    } catch (error) {
      console.error("❌ Error fetching USDC balance:", error);
      setBalanceError(
        `Balance fetch failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Check network connection and ensure you're connected to ${
          currentNetwork?.name || "supported network"
        }.`
      );
      setUsdcBalance("0.000000");
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

  // Handle payment methods configuration
  const handlePaymentMethodsChange = (methods: any) => {
    setPaymentMethods(methods);
    console.log("💳 Payment methods updated:", methods);
  };

  // Handle bank details updates
  const handleBankDetailsChange = (
    details: any,
    paymentType: "virtual_card" | "bank_qr"
  ) => {
    if (paymentMethods) {
      const updatedMethods = { ...paymentMethods };
      if (paymentType === "virtual_card") {
        updatedMethods.bank_virtual_card.bank_details = details;
      } else if (paymentType === "bank_qr") {
        updatedMethods.bank_qr.bank_details = details;
      }
      setPaymentMethods(updatedMethods);
    }
  };

  // Validate payment methods configuration
  const validatePaymentMethods = (): string[] => {
    const errors: string[] = [];

    if (!paymentMethods) {
      errors.push("Payment methods configuration is required");
      return errors;
    }

    const enabledMethods = Object.values(paymentMethods).some(
      (method: any) => method.enabled
    );
    if (!enabledMethods) {
      errors.push("At least one payment method must be selected");
    }

    // Validate crypto methods have wallet connection
    const cryptoMethods = ["crypto_qr", "voice_pay", "sound_pay"];
    const hasCryptoEnabled = cryptoMethods.some(
      (method) => paymentMethods[method]?.enabled
    );

    if (hasCryptoEnabled && !address) {
      errors.push("Wallet connection required for crypto payment methods");
    }

    // Validate bank methods have details
    if (
      paymentMethods.bank_virtual_card?.enabled &&
      !paymentMethods.bank_virtual_card?.bank_details?.account_holder
    ) {
      errors.push("Bank details required for virtual card payments");
    }

    if (
      paymentMethods.bank_qr?.enabled &&
      !paymentMethods.bank_qr?.bank_details?.account_holder
    ) {
      errors.push("Bank details required for bank QR payments");
    }

    return errors;
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
      alert(
        "Database connection not available. Please connect to Supabase first."
      );
      return;
    }

    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!agentName.trim()) {
      alert("Please enter an agent name.");
      return;
    }

    if (!location) {
      alert("Please get your current location first.");
      return;
    }

    // Validate payment methods
    const paymentErrors = validatePaymentMethods();
    if (paymentErrors.length > 0) {
      alert("Payment configuration errors:\n" + paymentErrors.join("\n"));
      return;
    }

    setIsDeploying(true);
    setDeploymentError("");

    try {
      // Validate network is supported
      if (!currentNetwork || !currentNetwork.isSupported) {
        throw new Error(
          `Please connect to a supported network. Current: ${
            currentNetwork?.name || "Unknown"
          }`
        );
      }

      const deploymentData = {
        user_id: address,
        name: agentName.trim(),
        description:
          agentDescription.trim() ||
          `A ${agentType.toLowerCase()} agent deployed via AR`,
        object_type: agentType,
        location_type: locationType,
        latitude: preciseLocation?.preciseLatitude || location.latitude,
        longitude: preciseLocation?.preciseLongitude || location.longitude,
        altitude: preciseLocation?.preciseAltitude || location.altitude,
        preciselatitude: preciseLocation?.preciseLatitude,
        preciselongitude: preciseLocation?.preciseLongitude,
        precisealtitude: preciseLocation?.preciseAltitude,
        accuracy: preciseLocation?.correctionApplied
          ? 0.02
          : location.accuracy || 10,
        correctionapplied: preciseLocation?.correctionApplied || false,
        range_meters: visibilityRange,

        // DYNAMIC NETWORK DATA - FIXED
        deployment_network_name: currentNetwork.name, // "Ethereum Sepolia"
        deployment_chain_id: currentNetwork.chainId, // 11155111
        deployment_network_id: currentNetwork.chainId, // 11155111
        network: currentNetwork.name, // "Ethereum Sepolia" - Fixed to use full name
        chain_id: currentNetwork.chainId, // 11155111

        // DYNAMIC PAYMENT DATA - FIXED
        interaction_fee_amount: parseFloat(interactionFee.toString()), // 10.0
        interaction_fee_token: selectedToken, // "USDC"
        interaction_fee_usdfc: interactionFee, // Legacy field

        // Wallet configuration
        owner_wallet: address,
        agent_wallet_address: agentWallet,
        agent_wallet_type: "evm_wallet",
        deployer_address: address,

        // Token information
        currency_type: selectedToken,
        token_symbol: selectedToken,
        token_address:
          TOKEN_ADDRESSES[selectedToken as keyof typeof TOKEN_ADDRESSES] || "",

        // Communication features
        chat_enabled: textChat,
        voice_enabled: voiceChat,
        defi_enabled: defiFeatures,
        interaction_types: [
          ...(textChat ? ["text_chat"] : []),
          ...(voiceChat ? ["voice_interface"] : []),
          ...(videoChat ? ["video_interface"] : []),
        ],

        // Integrations
        mcp_integrations: mcpIntegrations.length > 0 ? mcpIntegrations : null,
        payment_methods: paymentMethods || {},

        // DYNAMIC PAYMENT CONFIG - FIXED
        payment_config: {
          wallet_address: address,
          supported_tokens: [selectedToken],
          network_info: {
            name: currentNetwork.name,
            chainId: currentNetwork.chainId,
            rpcUrl: currentNetwork.rpcUrl,
            blockExplorer: currentNetwork.blockExplorer,
          },
          usd_fee: interactionFee,
          revenue_sharing: revenueSharing,
          selected_token: selectedToken,
          cube_enabled: true, // Flag for AR Viewer to show 3D cube
        },

        // RTK and deployment metadata
        rtk_enhanced: preciseLocation?.correctionApplied || false,
        rtk_provider: "GeoNet",
        deployed_at: new Date().toISOString(),
        deployment_status: "active",
        is_active: true,
      };

      console.log("🚀 Deploying agent with DYNAMIC data:", deploymentData);
      console.log("🚀 Starting deployment with data:");
      console.log("📊 Agent Name:", agentName);
      console.log(
        "💰 Interaction Fee Input:",
        interactionFee,
        typeof interactionFee
      );
      console.log("🪙 Selected Token:", selectedToken);
      console.log(
        "🌐 Network:",
        currentNetwork.name,
        "Chain ID:",
        currentNetwork.chainId
      );

      // Verify the interaction fee amount before storing
      const feeAmount = parseFloat(interactionFee.toString());
      console.log("💵 Processed Fee Amount:", feeAmount, typeof feeAmount);
      console.log("� Deployment Data Fee Fields:", {
        interaction_fee_amount: feeAmount,
        interaction_fee_token: selectedToken,
        interaction_fee_usdfc: interactionFee,
      });

      const { data, error } = await supabase
        .from("deployed_objects")
        .insert([deploymentData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("✅ Agent deployed successfully:", data);

      // Verify what was actually stored in the database
      console.log("🔍 Database Verification - Stored Data:");
      console.log("📊 Stored Agent Name:", data.name);
      console.log(
        "💰 Stored Fee Amount:",
        data.interaction_fee_amount,
        typeof data.interaction_fee_amount
      );
      console.log("🪙 Stored Fee Token:", data.interaction_fee_token);
      console.log("🌐 Stored Network:", data.deployment_network_name);
      console.log("🔗 Stored Chain ID:", data.deployment_chain_id);
      console.log("📱 Stored Deployer:", data.deployer_address);

      setDeploymentSuccess(true);

      // Reset form after successful deployment
      setTimeout(() => {
        setDeploymentSuccess(false);
        setAgentName("");
        setAgentDescription("");
        setMcpIntegrations([]);
        setPaymentMethods(null);
        setShowBankForm(null);
        setLocation(null);
        setPreciseLocation(null);
      }, 3000);
    } catch (error) {
      console.error("❌ Deployment failed:", error);
      setDeploymentError(
        error instanceof Error ? error.message : "Deployment failed"
      );
    } finally {
      setIsDeploying(false);
    }
  };

  // Load USDC balance when wallet connects and network is detected
  useEffect(() => {
    if (address && currentNetwork && currentNetwork.isSupported !== false) {
      fetchUSDCBalance();
    } else {
      setUsdcBalance("0.000000");
    }
  }, [address, currentNetwork]);

  // Network detection when wallet connects
  useEffect(() => {
    const initializeNetwork = async () => {
      if (address && window.ethereum) {
        setNetworkLoading(true);
        setNetworkError("");

        try {
          const network = await networkDetectionService.detectCurrentNetwork();
          setCurrentNetwork(network);

          if (network && !network.isSupported) {
            setNetworkError(
              `Network ${network.name} is not supported. Please switch to a supported network.`
            );
          }

          // Start listening for network changes
          await networkDetectionService.startNetworkListener();

          // Subscribe to network change events
          const handleNetworkChange = (event: any) => {
            const newNetwork = event.detail.network;
            setCurrentNetwork(newNetwork);

            if (!newNetwork.isSupported) {
              setNetworkError(
                `Network ${newNetwork.name} is not supported. Please switch to a supported network.`
              );
            } else {
              setNetworkError("");
            }
          };

          document.addEventListener("networkChanged", handleNetworkChange);

          return () => {
            document.removeEventListener("networkChanged", handleNetworkChange);
            networkDetectionService.stopNetworkListener();
          };
        } catch (error) {
          console.error("Network detection failed:", error);
          setNetworkError(
            "Failed to detect network. Please ensure MetaMask is connected."
          );
        } finally {
          setNetworkLoading(false);
        }
      } else {
        setCurrentNetwork(null);
        setNetworkError("");
      }
    };

    initializeNetwork();
  }, [address]);

  // Update selected token when network changes
  useEffect(() => {
    if (currentNetwork) {
      const supportedTokens = getSupportedStablecoins();
      if (
        supportedTokens.length > 0 &&
        !supportedTokens.includes(selectedToken)
      ) {
        setSelectedToken(supportedTokens[0]); // Default to first supported token
      }
    }
  }, [currentNetwork]);

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

            {/* Wallet Connection & USDC Balance */}
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
                    <span className="text-white mr-2">USDC Balance:</span>
                    {loadingBalance ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <span className="text-white font-bold">
                        {usdcBalance} USDC
                      </span>
                    )}
                  </div>
                </div>

                {/* Network Status Display */}
                <div className="mt-3 pt-3 border-t border-white border-opacity-30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Network className="h-5 w-5 text-white mr-2" />
                      <span className="text-white font-medium">Network:</span>
                    </div>
                    <div className="flex items-center">
                      {networkLoading ? (
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                      ) : currentNetwork ? (
                        <div className="text-right">
                          <div className="text-white font-bold">
                            {currentNetwork.name}
                          </div>
                          <div className="text-green-100 text-sm">
                            Chain ID: {currentNetwork.chainId}
                          </div>
                        </div>
                      ) : (
                        <span className="text-yellow-200">Not detected</span>
                      )}
                    </div>
                  </div>

                  {/* Network Warning */}
                  {networkError && (
                    <div className="mt-2 p-2 bg-red-500 bg-opacity-50 rounded text-white text-sm">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      {networkError}
                    </div>
                  )}

                  {/* Balance Warning */}
                  {balanceError && (
                    <div className="mt-2 p-2 bg-yellow-500 bg-opacity-50 rounded text-white text-sm">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      {balanceError}
                      {currentNetwork && (
                        <div className="mt-1">
                          <a
                            href="https://faucet.circle.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-200 underline hover:text-blue-100"
                          >
                            Get USDC from faucet →
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Low Balance Warning */}
                  {!balanceError &&
                    usdcBalance &&
                    parseFloat(usdcBalance) < 1.0 &&
                    parseFloat(usdcBalance) > 0 && (
                      <div className="mt-2 p-2 bg-orange-500 bg-opacity-50 rounded text-white text-sm">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        Low USDC balance ({usdcBalance} USDC). You may need more
                        USDC to deploy agents.
                        <div className="mt-1">
                          <a
                            href="https://faucet.circle.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-200 underline hover:text-blue-100"
                          >
                            Get USDC from faucet →
                          </a>
                        </div>
                      </div>
                    )}

                  {/* Network Success */}
                  {currentNetwork && currentNetwork.isSupported && (
                    <div className="mt-2 p-2 bg-green-500 bg-opacity-50 rounded text-white text-sm">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Network supported ✓
                    </div>
                  )}
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
                    Payment Token{" "}
                    {currentNetwork && `(${currentNetwork.shortName})`}
                  </label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={!currentNetwork || !currentNetwork.isSupported}
                  >
                    {SUPPORTED_STABLECOINS.map((token) => (
                      <option key={token} value={token}>
                        {token}{" "}
                        {TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES]
                          ? "✓"
                          : "⚠"}
                      </option>
                    ))}
                  </select>
                  {currentNetwork && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available tokens for {currentNetwork.name}
                      {TOKEN_ADDRESSES[
                        selectedToken as keyof typeof TOKEN_ADDRESSES
                      ] ? (
                        <span className="text-green-600 ml-1">
                          ✓ Contract verified
                        </span>
                      ) : (
                        <span className="text-yellow-600 ml-1">
                          ⚠ Contract not configured
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interaction Fee (Dynamic Amount)
                  </label>
                  <input
                    type="number"
                    value={interactionFee}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setInteractionFee(
                        isNaN(value) || value <= 0 ? 10 : value
                      );
                    }}
                    min="0.1"
                    step="0.1"
                    placeholder="Enter fee amount (integer only)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This exact amount will be stored and displayed in agent
                    cards
                  </p>
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

            {/* Payment Methods Configuration (6-Faced Cube System) */}
            <div className="space-y-6">
              <PaymentMethodsSelector
                onPaymentMethodsChange={handlePaymentMethodsChange}
                connectedWallet={address}
                initialMethods={paymentMethods}
              />

              {/* Conditional Bank Details Forms */}
              {paymentMethods?.bank_virtual_card?.enabled && (
                <BankDetailsForm
                  onBankDetailsChange={(details) =>
                    handleBankDetailsChange(details, "virtual_card")
                  }
                  paymentType="virtual_card"
                  initialDetails={paymentMethods.bank_virtual_card.bank_details}
                />
              )}

              {paymentMethods?.bank_qr?.enabled && (
                <BankDetailsForm
                  onBankDetailsChange={(details) =>
                    handleBankDetailsChange(details, "bank_qr")
                  }
                  paymentType="bank_qr"
                  initialDetails={paymentMethods.bank_qr.bank_details}
                />
              )}
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
                  isDeploying ||
                  !address ||
                  !agentName.trim() ||
                  !location ||
                  !currentNetwork ||
                  !currentNetwork.isSupported ||
                  networkLoading
                }
                className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Deploying Agent...
                  </>
                ) : networkLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Detecting Network...
                  </>
                ) : !currentNetwork ? (
                  <>
                    <AlertCircle className="h-6 w-6 mr-2" />
                    Connect to Network
                  </>
                ) : !currentNetwork.isSupported ? (
                  <>
                    <AlertCircle className="h-6 w-6 mr-2" />
                    Switch to Supported Network
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 mr-2" />
                    Deploy on {currentNetwork.shortName}
                  </>
                )}
              </button>

              {/* Network-specific deployment info */}
              {currentNetwork && currentNetwork.isSupported && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-2">
                    Deployment Summary
                  </h4>
                  <div className="space-y-1 text-xs text-green-700">
                    <div>
                      Network:{" "}
                      <span className="font-medium">{currentNetwork.name}</span>
                    </div>
                    <div>
                      Chain ID:{" "}
                      <span className="font-medium">
                        {currentNetwork.chainId}
                      </span>
                    </div>
                    <div>
                      Fee:{" "}
                      <span className="font-medium">
                        {interactionFee} {selectedToken}
                      </span>
                    </div>
                    <div>
                      Token Contract:{" "}
                      <span className="font-mono text-xs">
                        {TOKEN_ADDRESSES[
                          selectedToken as keyof typeof TOKEN_ADDRESSES
                        ]
                          ? `${TOKEN_ADDRESSES[
                              selectedToken as keyof typeof TOKEN_ADDRESSES
                            ]?.slice(0, 8)}...${TOKEN_ADDRESSES[
                              selectedToken as keyof typeof TOKEN_ADDRESSES
                            ]?.slice(-6)}`
                          : "Not configured"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeployObject;
