// Multi-Chain Network Configuration for AgentSphere
// Supports EVM testnets and future non-EVM network integration

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: string;
  symbol: string;
  blockExplorer: string;
  type: "evm" | "solana" | "hedera" | "xrpl" | "tron" | "starknet";
  usdcAddress?: string;
  agentRegistryAddress?: string;
  icon?: string;
  isTestnet: boolean;
  gasPrice?: string;
  status: "active" | "maintenance" | "deprecated";
}

// EVM Testnets (Primary Focus)
export const EVM_NETWORKS: Record<string, NetworkConfig> = {
  ETHEREUM_SEPOLIA: {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/",
    nativeCurrency: "SepoliaETH",
    symbol: "ETH",
    blockExplorer: "https://sepolia.etherscan.io",
    type: "evm",
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    icon: "ethereum",
    isTestnet: true,
    gasPrice: "20000000000", // 20 gwei
    status: "active",
  },
  ARBITRUM_SEPOLIA: {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    rpcUrl: "https://api.zan.top/node/v1/arb/sepolia/public",
    nativeCurrency: "ETH",
    symbol: "ETH",
    blockExplorer: "https://sepolia-explorer.arbitrum.io",
    type: "evm",
    usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    icon: "arbitrum",
    isTestnet: true,
    gasPrice: "100000000", // 0.1 gwei
    status: "active",
  },
  BASE_SEPOLIA: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    nativeCurrency: "ETH",
    symbol: "ETH",
    blockExplorer: "https://sepolia.basescan.org",
    type: "evm",
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    icon: "base",
    isTestnet: true,
    gasPrice: "1000000000", // 1 gwei
    status: "active",
  },
  OP_SEPOLIA: {
    chainId: 11155420,
    name: "OP Sepolia",
    rpcUrl: "https://sepolia.optimism.io",
    nativeCurrency: "ETH",
    symbol: "ETH",
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    type: "evm",
    usdcAddress: "0x5fd84259d3c8b37a387c0d8a4c5b0c0d7d3c0D7",
    icon: "optimism",
    isTestnet: true,
    gasPrice: "1000000000", // 1 gwei
    status: "active",
  },
  AVALANCHE_FUJI: {
    chainId: 43113,
    name: "Avalanche Fuji",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    nativeCurrency: "AVAX",
    symbol: "AVAX",
    blockExplorer: "https://testnet.snowtrace.io",
    type: "evm",
    usdcAddress: "0x5425890298aed601595a70AB815c96711a31Bc65",
    icon: "avalanche",
    isTestnet: true,
    gasPrice: "25000000000", // 25 gwei
    status: "active",
  },
};

// Non-EVM Networks (Future Support)
export const NON_EVM_NETWORKS: Record<string, NetworkConfig> = {
  SOLANA_DEVNET: {
    chainId: 0, // Solana doesn't use chainId
    name: "Solana Devnet",
    rpcUrl: "https://api.devnet.solana.com",
    nativeCurrency: "SOL",
    symbol: "SOL",
    blockExplorer: "https://explorer.solana.com/?cluster=devnet",
    type: "solana",
    usdcAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    icon: "solana",
    isTestnet: true,
    status: "active",
  },
  HEDERA_TESTNET: {
    chainId: 296,
    name: "Hedera Testnet",
    rpcUrl: "https://testnet.hashio.io/api",
    nativeCurrency: "HBAR",
    symbol: "HBAR",
    blockExplorer: "https://hashscan.io/testnet",
    type: "hedera",
    icon: "hedera",
    isTestnet: true,
    status: "active",
  },
  XRP_TESTNET: {
    chainId: 0,
    name: "XRP Ledger Testnet",
    rpcUrl: "https://s.altnet.rippletest.net:51234",
    nativeCurrency: "XRP",
    symbol: "XRP",
    blockExplorer: "https://testnet.xrpl.org",
    type: "xrpl",
    icon: "xrp",
    isTestnet: true,
    status: "active",
  },
  TRON_SHASTA: {
    chainId: 0,
    name: "Tron Shasta Testnet",
    rpcUrl: "https://api.shasta.trongrid.io",
    nativeCurrency: "TRX",
    symbol: "TRX",
    blockExplorer: "https://shasta.tronscan.org",
    type: "tron",
    icon: "tron",
    isTestnet: true,
    status: "active",
  },
  STARKNET_SEPOLIA: {
    chainId: 0,
    name: "Starknet Sepolia",
    rpcUrl: "https://starknet-sepolia.public.blastapi.io",
    nativeCurrency: "ETH",
    symbol: "ETH",
    blockExplorer: "https://sepolia.starkscan.co",
    type: "starknet",
    icon: "starknet",
    isTestnet: true,
    status: "active",
  },
};

// Combined networks for easy access
export const ALL_NETWORKS = { ...EVM_NETWORKS, ...NON_EVM_NETWORKS };

// Helper functions
export const getNetworkByChainId = (chainId: number): NetworkConfig | null => {
  return (
    Object.values(ALL_NETWORKS).find(
      (network) => network.chainId === chainId
    ) || null
  );
};

export const getNetworksByType = (
  type: NetworkConfig["type"]
): NetworkConfig[] => {
  return Object.values(ALL_NETWORKS).filter((network) => network.type === type);
};

export const getActiveNetworks = (): NetworkConfig[] => {
  return Object.values(ALL_NETWORKS).filter(
    (network) => network.status === "active"
  );
};

export const getEVMNetworks = (): NetworkConfig[] => {
  return Object.values(EVM_NETWORKS);
};

export const getNonEVMNetworks = (): NetworkConfig[] => {
  return Object.values(NON_EVM_NETWORKS);
};

// Network status checker
export const checkNetworkStatus = async (
  network: NetworkConfig
): Promise<boolean> => {
  try {
    if (network.type === "evm") {
      const response = await fetch(network.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
      });
      return response.ok;
    }
    // Add status checks for other network types
    return true;
  } catch (error) {
    console.error(`Network status check failed for ${network.name}:`, error);
    return false;
  }
};

// Network switching helper for MetaMask
export const switchToNetwork = async (
  network: NetworkConfig
): Promise<boolean> => {
  if (
    typeof window === "undefined" ||
    !window.ethereum ||
    network.type !== "evm"
  ) {
    return false;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${network.chainId.toString(16)}` }],
    });
    return true;
  } catch (switchError: any) {
    // If network is not added, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${network.chainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: {
                name: network.nativeCurrency,
                symbol: network.symbol,
                decimals: 18,
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.blockExplorer],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error("Failed to add network:", addError);
        return false;
      }
    }
    console.error("Failed to switch network:", switchError);
    return false;
  }
};

// Gas fee estimation
export const estimateGasFee = async (
  network: NetworkConfig
): Promise<string> => {
  if (network.type !== "evm") {
    return "N/A";
  }

  try {
    const response = await fetch(network.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_gasPrice",
        params: [],
        id: 1,
      }),
    });

    const data = await response.json();
    const gasPriceWei = parseInt(data.result, 16);
    const gasPriceGwei = gasPriceWei / 1e9;

    return `${gasPriceGwei.toFixed(2)} Gwei`;
  } catch (error) {
    console.error(`Gas fee estimation failed for ${network.name}:`, error);
    return network.gasPrice
      ? `${parseInt(network.gasPrice) / 1e9} Gwei`
      : "Unknown";
  }
};

export default {
  EVM_NETWORKS,
  NON_EVM_NETWORKS,
  ALL_NETWORKS,
  getNetworkByChainId,
  getNetworksByType,
  getActiveNetworks,
  getEVMNetworks,
  getNonEVMNetworks,
  checkNetworkStatus,
  switchToNetwork,
  estimateGasFee,
};
