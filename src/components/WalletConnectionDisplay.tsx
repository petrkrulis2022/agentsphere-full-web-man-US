import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { networkDetectionService } from "../services/networkDetectionService.js";
import { hederaWalletService } from "../services/hederaWalletService";

interface WalletConnectionDisplayProps {
  onConnect?: () => void;
}

const WalletConnectionDisplay = ({
  onConnect,
}: WalletConnectionDisplayProps) => {
  const [solanaWallet, setSolanaWallet] = useState<any>(null);
  const [solanaAddress, setSolanaAddress] = useState<string>("");
  const [evmAddress, setEvmAddress] = useState<string>("");
  const [currentNetwork, setCurrentNetwork] = useState<any>(null);
  const [hbarBalance, setHbarBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Check for Phantom wallet (Solana)
  useEffect(() => {
    const checkSolanaWallet = () => {
      if (typeof window !== "undefined" && (window as any).solana) {
        const phantom = (window as any).solana;
        if (phantom.isPhantom) {
          setSolanaWallet(phantom);

          // Check if already connected
          if (phantom.isConnected && phantom.publicKey) {
            setSolanaAddress(phantom.publicKey.toString());
          }

          // Listen for connection changes
          phantom.on("connect", (publicKey: any) => {
            setSolanaAddress(publicKey.toString());
          });

          phantom.on("disconnect", () => {
            setSolanaAddress("");
          });

          phantom.on("accountChanged", (publicKey: any) => {
            if (publicKey) {
              setSolanaAddress(publicKey.toString());
            } else {
              setSolanaAddress("");
            }
          });
        }
      }
    };

    // Check immediately and set up interval for wallet detection
    checkSolanaWallet();
    const interval = setInterval(checkSolanaWallet, 1000);

    return () => {
      clearInterval(interval);
      if (solanaWallet) {
        solanaWallet.removeAllListeners();
      }
    };
  }, []);

  // Check for MetaMask/EVM wallet and detect network
  useEffect(() => {
    const checkEvmWallet = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          });
          if (accounts && accounts.length > 0) {
            setEvmAddress(accounts[0]);

            // Detect current network
            const network =
              await networkDetectionService.detectCurrentNetwork();
            setCurrentNetwork(network);
          }
        } catch (error) {
          console.error("Error checking EVM wallet:", error);
        }
      }
    };

    checkEvmWallet();

    // Listen for account changes
    if ((window as any).ethereum) {
      (window as any).ethereum.on(
        "accountsChanged",
        async (accounts: string[]) => {
          setEvmAddress(accounts[0] || "");
          if (accounts[0]) {
            const network =
              await networkDetectionService.detectCurrentNetwork();
            setCurrentNetwork(network);
          } else {
            setCurrentNetwork(null);
          }
        }
      );

      // Listen for network/chain changes
      (window as any).ethereum.on("chainChanged", async () => {
        const network = await networkDetectionService.detectCurrentNetwork();
        setCurrentNetwork(network);
      });
    }

    return () => {
      if ((window as any).ethereum?.removeListener) {
        (window as any).ethereum.removeListener("accountsChanged", () => {});
        (window as any).ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  // Fetch HBAR balance when connected to Hedera Testnet
  useEffect(() => {
    const fetchHbarBalance = async () => {
      // Check if we're on Hedera Testnet (Chain ID 296)
      if (evmAddress && currentNetwork && currentNetwork.chainId === 296) {
        setBalanceLoading(true);
        try {
          const balance = await hederaWalletService.getHBARBalance(evmAddress);
          setHbarBalance(balance);
          console.log("✅ HBAR Balance fetched:", balance);
        } catch (error) {
          console.error("❌ Error fetching HBAR balance:", error);
          setHbarBalance(null);
        } finally {
          setBalanceLoading(false);
        }
      } else {
        // Reset balance if not on Hedera Testnet
        setHbarBalance(null);
      }
    };

    fetchHbarBalance();
  }, [evmAddress, currentNetwork]);

  const connectSolanaWallet = async () => {
    if (solanaWallet) {
      try {
        await solanaWallet.connect();
      } catch (error) {
        console.error("Error connecting to Phantom:", error);
        alert("Failed to connect to Phantom wallet. Please try again.");
      }
    } else {
      const install = window.confirm(
        "Phantom wallet not detected. Would you like to install it?"
      );
      if (install) {
        window.open("https://phantom.app/", "_blank");
      }
    }
  };

  const connectEvmWallet = async () => {
    if ((window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      window.open("https://metamask.io/download/", "_blank");
    }
  };

  const disconnectSolana = async () => {
    if (solanaWallet) {
      try {
        await solanaWallet.disconnect();
        setSolanaAddress("");
      } catch (error) {
        console.error("Error disconnecting Phantom:", error);
      }
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Solana Wallet */}
      {solanaAddress ? (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-3 py-2 rounded-md bg-purple-50 text-purple-700">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Solana Devnet</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-purple-600 text-white">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">
              {formatAddress(solanaAddress)}
            </span>
            <button
              onClick={disconnectSolana}
              className="text-xs hover:text-purple-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={connectSolanaWallet}
          className="flex items-center space-x-2 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Solana</span>
        </button>
      )}

      {/* EVM Wallet */}
      {evmAddress ? (
        <div className="flex items-center space-x-2">
          {currentNetwork && (
            <div
              className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                currentNetwork.chainId === 296
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  currentNetwork.chainId === 296
                    ? "bg-emerald-500"
                    : "bg-blue-500"
                }`}
              ></div>
              <span className="text-xs font-medium">
                {currentNetwork.name}
                {currentNetwork.chainId === 296 && hbarBalance !== null && (
                  <span
                    className="ml-1 font-semibold"
                    style={{ color: "#00D4AA" }}
                  >
                    [{hbarBalance.toFixed(4)} HBAR]
                  </span>
                )}
                {currentNetwork.chainId === 296 && balanceLoading && (
                  <span className="ml-1 text-xs opacity-70">loading...</span>
                )}
              </span>
            </div>
          )}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-600 text-white">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">
              {formatAddress(evmAddress)}
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={connectEvmWallet}
          className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect EVM</span>
        </button>
      )}
    </div>
  );
};

export default WalletConnectionDisplay;
