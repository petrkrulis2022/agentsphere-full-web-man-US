// Hedera Testnet Wallet Service
import {
  HEDERA_NETWORKS,
  HBAR_TESTNET_CONFIG,
  getHederaNetworkConfig,
} from "../config/hederaNetworks";

export interface HederaBalanceData {
  hbar: number;
  usdh?: number; // USDh stablecoin balance
  usdDelta?: number; // USDΔ stablecoin balance
  usdaix?: number; // USDaix stablecoin balance
  usdDeltaPlus?: number; // USDΔ+ stablecoin balance
  usdaixPlus?: number; // USDaix+ stablecoin balance
  usdar?: number; // USDar stablecoin balance
  usdair?: number; // USDair stablecoin balance
  loading: boolean;
  error: string | null;
}

export class HederaWalletService {
  private currentNetwork: string;

  constructor(network: string = "TESTNET") {
    this.currentNetwork = network;
  }

  public switchNetwork(network: string): void {
    this.currentNetwork = network;
  }

  public getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  public async getHBARBalance(walletAddress: string): Promise<number> {
    try {
      const networkConfig = getHederaNetworkConfig(this.currentNetwork);

      // Check if MetaMask is available
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not detected");
      }

      // First verify we're on the correct network
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      const expectedChainId = `0x${networkConfig.chainId.toString(16)}`; // 0x128 for chain 296

      if (currentChainId !== expectedChainId) {
        throw new Error(
          `Please switch to Hedera Testnet (Chain ID: ${networkConfig.chainId})`
        );
      }

      // Get balance using MetaMask eth_getBalance method
      const balanceHex = await window.ethereum.request({
        method: "eth_getBalance",
        params: [walletAddress, "latest"],
      });

      console.log("🔍 Raw balance from Hedera Testnet:", {
        address: walletAddress,
        balanceHex,
        chainId: currentChainId,
        expectedChainId,
      });

      // Convert from hex wei to HBAR (18 decimals)
      // balanceHex is a string like "0x1bc16d674ec80000"
      const balanceWei = BigInt(balanceHex);
      const hbarBalance = Number(balanceWei) / Math.pow(10, 18);

      console.log("💰 Converted HBAR balance:", hbarBalance);

      return hbarBalance;
    } catch (error) {
      console.error("Error fetching HBAR balance:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch HBAR balance: ${errorMessage}`);
    }
  }

  public async getBalances(
    walletAddress: string
  ): Promise<{ hbar: number; usdh?: number }> {
    try {
      const hbar = await this.getHBARBalance(walletAddress);
      const usdh = await this.getUSDhBalance(walletAddress);
      return { hbar, usdh };
    } catch (error) {
      console.error("Error fetching balances:", error);
      throw error;
    }
  }

  /**
   * Get ERC-20 token balance (like USDh)
   * @param walletAddress The wallet address to check
   * @param tokenAddress The ERC-20 token contract address
   * @param decimals Token decimals (default 6 for stablecoins)
   */
  public async getERC20Balance(
    walletAddress: string,
    tokenAddress: string,
    decimals: number = 6
  ): Promise<number> {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not detected");
      }

      // ERC-20 balanceOf function signature: balanceOf(address)
      // Function selector: 0x70a08231
      const data = "0x70a08231" + walletAddress.substring(2).padStart(64, "0");

      console.log("📞 Calling ERC-20 balanceOf:", {
        tokenAddress,
        walletAddress,
        data,
      });

      const balanceHex = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: tokenAddress,
            data: data,
          },
          "latest",
        ],
      });

      console.log("🔍 Raw ERC-20 balance:", {
        tokenAddress,
        balanceHex,
      });

      // Convert from hex to decimal
      const balanceWei = BigInt(balanceHex);
      const balance = Number(balanceWei) / Math.pow(10, decimals);

      console.log(`💰 Converted ${tokenAddress} balance:`, balance);

      return balance;
    } catch (error) {
      console.error("Error fetching ERC-20 balance:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch ERC-20 balance: ${errorMessage}`);
    }
  }

  /**
   * Get USDh token balance on Hedera Testnet
   */
  public async getUSDhBalance(walletAddress: string): Promise<number> {
    const USDH_CONTRACT = "0x00000000000000000000000000000000006e24c7";
    return this.getERC20Balance(walletAddress, USDH_CONTRACT, 6);
  }

  /**
   * Get USDΔ token balance
   */
  public async getUSDDeltaBalance(walletAddress: string): Promise<number> {
    const USDDELTA_CONTRACT = "0x0000000000000000000000000000000000000000"; // TODO: Add contract address
    return this.getERC20Balance(walletAddress, USDDELTA_CONTRACT, 6);
  }

  /**
   * Get USDaix token balance
   */
  public async getUSDaixBalance(walletAddress: string): Promise<number> {
    const USDAIX_CONTRACT = "0x0000000000000000000000000000000000000000"; // TODO: Add contract address
    return this.getERC20Balance(walletAddress, USDAIX_CONTRACT, 6);
  }

  /**
   * Get USDΔ+ token balance
   */
  public async getUSDDeltaPlusBalance(walletAddress: string): Promise<number> {
    const USDDELTAPLUS_CONTRACT = "0x0000000000000000000000000000000000000000"; // TODO: Add contract address
    return this.getERC20Balance(walletAddress, USDDELTAPLUS_CONTRACT, 6);
  }

  /**
   * Get USDaix+ token balance
   */
  public async getUSDaixPlusBalance(walletAddress: string): Promise<number> {
    const USDAIXPLUS_CONTRACT = "0x0000000000000000000000000000000000000000"; // TODO: Add contract address
    return this.getERC20Balance(walletAddress, USDAIXPLUS_CONTRACT, 6);
  }

  /**
   * Get USDar token balance
   */
  public async getUSdarBalance(walletAddress: string): Promise<number> {
    const USDAR_CONTRACT = "0x0000000000000000000000000000000000000000"; // TODO: Add contract address
    return this.getERC20Balance(walletAddress, USDAR_CONTRACT, 6);
  }

  /**
   * Get USDair token balance
   */
  public async getUSDairBalance(walletAddress: string): Promise<number> {
    const USDAIR_CONTRACT = "0x0000000000000000000000000000000000000000"; // TODO: Add contract address
    return this.getERC20Balance(walletAddress, USDAIR_CONTRACT, 6);
  }

  public getExplorerUrl(address: string): string {
    const networkConfig = getHederaNetworkConfig(this.currentNetwork);
    return `${networkConfig.explorerUrl}/account/${address}`;
  }

  public async getCurrentWalletAddress(): Promise<string | null> {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        return null;
      }

      // Get accounts without requesting permission (eth_accounts vs eth_requestAccounts)
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (!accounts || accounts.length === 0) {
        return null;
      }

      return accounts[0];
    } catch (error) {
      console.error("Error getting current wallet address:", error);
      return null;
    }
  }

  public async connectWallet(): Promise<string | null> {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not detected");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const walletAddress = accounts[0];

      // Check if user is on Hedera Testnet
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      const expectedChainId = `0x${getHederaNetworkConfig(
        this.currentNetwork
      ).chainId.toString(16)}`;

      if (chainId !== expectedChainId) {
        // Try to switch to Hedera Testnet
        await this.switchToHederaTestnet();
      }

      return walletAddress;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }

  public async switchToHederaTestnet(): Promise<void> {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not detected");
      }

      const networkConfig = getHederaNetworkConfig(this.currentNetwork);
      const chainIdHex = `0x${networkConfig.chainId.toString(16)}`;

      try {
        // Try to switch to the network
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainIdHex,
                chainName: networkConfig.name,
                nativeCurrency: networkConfig.nativeCurrency,
                rpcUrls: [networkConfig.rpc],
                blockExplorerUrls: [networkConfig.explorerUrl],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error("Error switching to Hedera Testnet:", error);
      throw error;
    }
  }

  public async isConnectedToHederaTestnet(): Promise<boolean> {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        return false;
      }

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      const expectedChainId = `0x${getHederaNetworkConfig(
        this.currentNetwork
      ).chainId.toString(16)}`;
      return chainId === expectedChainId;
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  }
}

// Export a singleton instance
export const hederaWalletService = new HederaWalletService();
