import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";

interface WalletConnectionDisplayProps {
  onConnect?: () => void;
}

const WalletConnectionDisplay = ({
  onConnect,
}: WalletConnectionDisplayProps) => {
  const [solanaWallet, setSolanaWallet] = useState<any>(null);
  const [solanaAddress, setSolanaAddress] = useState<string>("");
  const [evmAddress, setEvmAddress] = useState<string>("");

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

  // Check for MetaMask/EVM wallet
  useEffect(() => {
    const checkEvmWallet = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          });
          if (accounts && accounts.length > 0) {
            setEvmAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking EVM wallet:", error);
        }
      }
    };

    checkEvmWallet();

    // Listen for account changes
    if ((window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        setEvmAddress(accounts[0] || "");
      });
    }

    return () => {
      if ((window as any).ethereum?.removeListener) {
        (window as any).ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

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
        <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-600 text-white">
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formatAddress(evmAddress)}
          </span>
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
