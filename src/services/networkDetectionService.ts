import {
  EVM_NETWORKS,
  NON_EVM_NETWORKS,
  getNetworkByChainId,
  getActiveNetworks,
} from "../config/multiChainNetworks";

class NetworkDetectionService {
  constructor() {
    this.currentNetwork = null;
    this.isListening = false;
    this.listeners = [];
  }

  async detectCurrentNetwork() {
    if (!window.ethereum) {
      return null;
    }

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const numericChainId = parseInt(chainId, 16);

      // Find matching supported network
      const supportedNetwork = getNetworkByChainId(numericChainId);

      this.currentNetwork = supportedNetwork || {
        chainId: numericChainId,
        name: `Unknown Network (${numericChainId})`,
        shortName: "Unknown",
        isSupported: false,
      };

      // Add isSupported flag for compatibility
      if (
        this.currentNetwork &&
        !this.currentNetwork.hasOwnProperty("isSupported")
      ) {
        this.currentNetwork.isSupported = supportedNetwork ? true : false;
      }

      return this.currentNetwork;
    } catch (error) {
      console.error("Failed to detect network:", error);
      return null;
    }
  }

  async startNetworkListener() {
    if (!window.ethereum || this.isListening) return;

    this.isListening = true;

    const handleChainChanged = (chainId) => {
      const numericChainId = parseInt(chainId, 16);
      this.handleNetworkChange(numericChainId);
    };

    window.ethereum.on("chainChanged", handleChainChanged);

    // Store reference for cleanup
    this.ethereumChainListener = handleChainChanged;
  }

  stopNetworkListener() {
    if (window.ethereum && this.ethereumChainListener) {
      window.ethereum.removeListener(
        "chainChanged",
        this.ethereumChainListener
      );
      this.isListening = false;
    }
  }

  handleNetworkChange(chainId) {
    const supportedNetwork = getNetworkByChainId(chainId);

    this.currentNetwork = supportedNetwork || {
      chainId: chainId,
      name: `Unknown Network (${chainId})`,
      shortName: "Unknown",
      isSupported: false,
    };

    // Add isSupported flag for compatibility
    if (
      this.currentNetwork &&
      !this.currentNetwork.hasOwnProperty("isSupported")
    ) {
      this.currentNetwork.isSupported = supportedNetwork ? true : false;
    }

    // Emit network change event
    const event = new CustomEvent("networkChanged", {
      detail: { network: this.currentNetwork },
    });
    document.dispatchEvent(event);

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentNetwork);
      } catch (error) {
        console.error("Error in network change listener:", error);
      }
    });
  }

  addNetworkChangeListener(callback) {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  isNetworkSupported(chainId) {
    const allNetworks = [
      ...Object.values(EVM_NETWORKS),
      ...Object.values(NON_EVM_NETWORKS),
    ];
    return allNetworks.some((network) => network.chainId === chainId);
  }

  async switchToNetwork(targetNetwork) {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetNetwork.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // Network not added to wallet, add it first
      if (switchError.code === 4902) {
        await this.addNetworkToWallet(targetNetwork);
      } else {
        throw switchError;
      }
    }
  }

  async addNetworkToWallet(network) {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${network.chainId.toString(16)}`,
          chainName: network.name,
          rpcUrls: [network.rpcUrl],
          nativeCurrency: {
            name: network.nativeCurrency,
            symbol: network.symbol,
            decimals: 18,
          },
          blockExplorerUrls: [network.blockExplorer],
        },
      ],
    });
  }

  getCurrentNetwork() {
    return this.currentNetwork;
  }

  getSupportedNetworks() {
    return getActiveNetworks().filter((network) => network.type === "evm");
  }
}

export const networkDetectionService = new NetworkDetectionService();
