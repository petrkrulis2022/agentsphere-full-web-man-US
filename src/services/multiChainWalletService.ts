// Multi-Chain Wallet Service for AgentSphere
// Manages wallet connections across different blockchain networks

import {
  NetworkConfig,
  EVM_NETWORKS,
  ALL_NETWORKS,
  getNetworkByChainId,
} from "../config/multiChainNetworks";

export interface WalletConnection {
  networkType: string;
  walletType: string;
  address: string;
  chainId: number;
  isConnected: boolean;
  balance?: string;
  lastUpdated: number;
}

export interface WalletProvider {
  name: string;
  icon: string;
  isInstalled: boolean;
  connect: () => Promise<string>;
  disconnect: () => Promise<void>;
  getBalance: (address: string) => Promise<string>;
  switchNetwork: (chainId: number) => Promise<boolean>;
}

export class MultiChainWalletService {
  private connectedWallets: Map<string, WalletConnection> = new Map();
  private supportedWallets: Record<string, string[]> = {
    evm: ["metamask", "coinbase", "walletconnect"],
    solana: ["phantom", "solflare"],
    hedera: ["hashpack", "metamask"],
    xrpl: ["xumm"],
    tron: ["tronlink"],
    starknet: ["argentx", "braavos"],
  };

  constructor() {
    this.initializeWalletDetection();
  }

  private initializeWalletDetection() {
    // Listen for wallet events
    if (typeof window !== "undefined") {
      window.addEventListener("load", () => {
        this.detectAvailableWallets();
      });
    }
  }

  private async detectAvailableWallets(): Promise<
    Record<string, WalletProvider>
  > {
    const wallets: Record<string, WalletProvider> = {};

    // MetaMask detection
    if (typeof window !== "undefined" && window.ethereum?.isMetaMask) {
      wallets.metamask = {
        name: "MetaMask",
        icon: "metamask",
        isInstalled: true,
        connect: () => this.connectMetaMask(),
        disconnect: () => this.disconnectMetaMask(),
        getBalance: (address: string) => this.getEVMBalance(address),
        switchNetwork: (chainId: number) => this.switchEVMNetwork(chainId),
      };
    }

    // Coinbase Wallet detection
    if (typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet) {
      wallets.coinbase = {
        name: "Coinbase Wallet",
        icon: "coinbase",
        isInstalled: true,
        connect: () => this.connectCoinbaseWallet(),
        disconnect: () => this.disconnectCoinbaseWallet(),
        getBalance: (address: string) => this.getEVMBalance(address),
        switchNetwork: (chainId: number) => this.switchEVMNetwork(chainId),
      };
    }

    // Phantom (Solana) detection
    if (typeof window !== "undefined" && window.solana?.isPhantom) {
      wallets.phantom = {
        name: "Phantom",
        icon: "phantom",
        isInstalled: true,
        connect: () => this.connectPhantom(),
        disconnect: () => this.disconnectPhantom(),
        getBalance: (address: string) => this.getSolanaBalance(address),
        switchNetwork: () => Promise.resolve(true),
      };
    }

    return wallets;
  }

  // MetaMask Integration
  private async connectMetaMask(): Promise<string> {
    if (!window.ethereum?.isMetaMask) {
      throw new Error("MetaMask not detected");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const address = accounts[0];
      const chainId = await this.getCurrentChainId();

      const connection: WalletConnection = {
        networkType: "evm",
        walletType: "metamask",
        address,
        chainId,
        isConnected: true,
        lastUpdated: Date.now(),
      };

      this.connectedWallets.set("evm_metamask", connection);

      // Set up event listeners
      this.setupMetaMaskListeners();

      console.log("🦊 MetaMask connected:", address);
      return address;
    } catch (error) {
      console.error("MetaMask connection failed:", error);
      throw error;
    }
  }

  private setupMetaMaskListeners() {
    if (!window.ethereum) return;

    // Account changes
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length === 0) {
        this.connectedWallets.delete("evm_metamask");
      } else {
        const connection = this.connectedWallets.get("evm_metamask");
        if (connection) {
          connection.address = accounts[0];
          connection.lastUpdated = Date.now();
        }
      }
    });

    // Chain changes
    window.ethereum.on("chainChanged", (chainId: string) => {
      const connection = this.connectedWallets.get("evm_metamask");
      if (connection) {
        connection.chainId = parseInt(chainId, 16);
        connection.lastUpdated = Date.now();
      }
    });
  }

  private async disconnectMetaMask(): Promise<void> {
    this.connectedWallets.delete("evm_metamask");
    console.log("🦊 MetaMask disconnected");
  }

  // Coinbase Wallet Integration
  private async connectCoinbaseWallet(): Promise<string> {
    if (!window.ethereum?.isCoinbaseWallet) {
      throw new Error("Coinbase Wallet not detected");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];
      const chainId = await this.getCurrentChainId();

      const connection: WalletConnection = {
        networkType: "evm",
        walletType: "coinbase",
        address,
        chainId,
        isConnected: true,
        lastUpdated: Date.now(),
      };

      this.connectedWallets.set("evm_coinbase", connection);
      console.log("🔵 Coinbase Wallet connected:", address);
      return address;
    } catch (error) {
      console.error("Coinbase Wallet connection failed:", error);
      throw error;
    }
  }

  private async disconnectCoinbaseWallet(): Promise<void> {
    this.connectedWallets.delete("evm_coinbase");
    console.log("🔵 Coinbase Wallet disconnected");
  }

  // Phantom (Solana) Integration
  private async connectPhantom(): Promise<string> {
    if (!window.solana?.isPhantom) {
      throw new Error("Phantom wallet not detected");
    }

    try {
      const response = await window.solana.connect();
      const address = response.publicKey.toString();

      const connection: WalletConnection = {
        networkType: "solana",
        walletType: "phantom",
        address,
        chainId: 0, // Solana doesn't use chainId
        isConnected: true,
        lastUpdated: Date.now(),
      };

      this.connectedWallets.set("solana_phantom", connection);
      console.log("👻 Phantom connected:", address);
      return address;
    } catch (error) {
      console.error("Phantom connection failed:", error);
      throw error;
    }
  }

  private async disconnectPhantom(): Promise<void> {
    if (window.solana?.isPhantom) {
      await window.solana.disconnect();
    }
    this.connectedWallets.delete("solana_phantom");
    console.log("👻 Phantom disconnected");
  }

  // Network Management
  public async switchToNetwork(network: NetworkConfig): Promise<boolean> {
    if (network.type === "evm") {
      return await this.switchEVMNetwork(network.chainId);
    }
    // Add support for other network types
    return false;
  }

  private async switchEVMNetwork(chainId: number): Promise<boolean> {
    if (!window.ethereum) {
      return false;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        const network = getNetworkByChainId(chainId);
        if (network) {
          return await this.addEVMNetwork(network);
        }
      }
      return false;
    }
  }

  private async addEVMNetwork(network: NetworkConfig): Promise<boolean> {
    if (!window.ethereum || network.type !== "evm") {
      return false;
    }

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
    } catch (error) {
      console.error("Failed to add network:", error);
      return false;
    }
  }

  // Balance Management
  private async getEVMBalance(address: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error("No EVM provider available");
    }

    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      // Convert from Wei to ETH
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      return balanceInEth.toFixed(4);
    } catch (error) {
      console.error("Failed to get EVM balance:", error);
      return "0.0000";
    }
  }

  private async getSolanaBalance(address: string): Promise<string> {
    try {
      // Solana balance fetching would require additional setup
      // For now, return placeholder
      return "0.0000";
    } catch (error) {
      console.error("Failed to get Solana balance:", error);
      return "0.0000";
    }
  }

  // Utility Methods
  private async getCurrentChainId(): Promise<number> {
    if (!window.ethereum) {
      return 0;
    }

    try {
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      return parseInt(chainId, 16);
    } catch (error) {
      console.error("Failed to get chain ID:", error);
      return 0;
    }
  }

  public getWalletForNetwork(networkType: string): WalletConnection | null {
    for (const [key, wallet] of this.connectedWallets) {
      if (key.startsWith(networkType)) {
        return wallet;
      }
    }
    return null;
  }

  public getAllConnectedWallets(): Map<string, WalletConnection> {
    return new Map(this.connectedWallets);
  }

  public isWalletConnected(networkType: string, walletType?: string): boolean {
    if (walletType) {
      return this.connectedWallets.has(`${networkType}_${walletType}`);
    }

    for (const key of this.connectedWallets.keys()) {
      if (key.startsWith(networkType)) {
        return true;
      }
    }
    return false;
  }

  public getConnectionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};

    for (const networkType of Object.keys(this.supportedWallets)) {
      status[networkType] = this.isWalletConnected(networkType);
    }

    return status;
  }

  // Connect to specific wallet for network
  public async connectWallet(
    networkType: string,
    walletType: string
  ): Promise<string> {
    const key = `${networkType}_${walletType}`;

    try {
      let address: string;

      switch (key) {
        case "evm_metamask":
          address = await this.connectMetaMask();
          break;
        case "evm_coinbase":
          address = await this.connectCoinbaseWallet();
          break;
        case "solana_phantom":
          address = await this.connectPhantom();
          break;
        default:
          throw new Error(`Unsupported wallet: ${key}`);
      }

      return address;
    } catch (error) {
      console.error(`Failed to connect ${walletType} wallet:`, error);
      throw error;
    }
  }

  // Disconnect specific wallet
  public async disconnectWallet(
    networkType: string,
    walletType: string
  ): Promise<void> {
    const key = `${networkType}_${walletType}`;

    switch (key) {
      case "evm_metamask":
        await this.disconnectMetaMask();
        break;
      case "evm_coinbase":
        await this.disconnectCoinbaseWallet();
        break;
      case "solana_phantom":
        await this.disconnectPhantom();
        break;
      default:
        this.connectedWallets.delete(key);
    }
  }
}

// Export singleton instance
export const multiChainWalletService = new MultiChainWalletService();

// Type declarations for window objects
declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

export default MultiChainWalletService;
