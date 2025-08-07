import React, { useMemo, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

// Import Solana wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

// Network Configuration for AgentSphere
const AGENTSPHERE_SOLANA_NETWORKS = {
  testnet: {
    network: WalletAdapterNetwork.Testnet,
    rpc: "https://api.testnet.solana.com",
    name: "Solana Testnet",
    currency: "SOL",
    explorerCluster: "testnet",
  },
  devnet: {
    network: WalletAdapterNetwork.Devnet,
    rpc: "https://api.devnet.solana.com",
    name: "Solana Devnet",
    currency: "USDC",
    explorerCluster: "devnet",
  },
};

// USDC Token Configuration for Devnet
const USDC_DEVNET_CONFIG = {
  mintAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  symbol: "USDC",
  decimals: 6,
  name: "USD Coin (Devnet)",
};

// Wallet Content Component
const SolanaWalletContent = ({ onConnectionChange, network = "devnet" }) => {
  const { publicKey, connected, connecting, disconnect, wallet } = useWallet();
  const [solBalance, setSolBalance] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const networkConfig = AGENTSPHERE_SOLANA_NETWORKS[network];
  const connection = useMemo(
    () => new Connection(networkConfig.rpc),
    [networkConfig.rpc]
  );

  // Fetch wallet balances
  const fetchBalances = async () => {
    if (!publicKey || !connected) return;

    setLoading(true);
    try {
      // Always fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      setSolBalance(solBalance / 1e9);

      // For devnet, also fetch USDC balance
      if (network === "devnet") {
        try {
          const { getAccount, getAssociatedTokenAddress } = await import(
            "@solana/spl-token"
          );
          const usdcMint = new PublicKey(USDC_DEVNET_CONFIG.mintAddress);
          const usdcTokenAccount = await getAssociatedTokenAddress(
            usdcMint,
            publicKey
          );

          const usdcAccountInfo = await getAccount(
            connection,
            usdcTokenAccount
          );
          setUsdcBalance(Number(usdcAccountInfo.amount) / 1e6);
        } catch (usdcError) {
          console.log("No USDC token account found");
          setUsdcBalance(0);
        }
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
      setSolBalance(null);
      setUsdcBalance(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle connection changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange({
        isConnected: connected,
        publicKey: publicKey?.toBase58(),
        walletName: wallet?.adapter?.name,
        network: networkConfig.name,
        networkType: network,
        solBalance,
        usdcBalance,
      });
    }
  }, [
    connected,
    publicKey,
    wallet,
    solBalance,
    usdcBalance,
    onConnectionChange,
    network,
    networkConfig.name,
  ]);

  // Fetch balances when connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
    } else {
      setSolBalance(null);
      setUsdcBalance(null);
    }
  }, [connected, publicKey, network]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setSolBalance(null);
      setUsdcBalance(null);
      console.log(`🔌 Solana ${networkConfig.name} wallet disconnected`);
    } catch (error) {
      console.error("❌ Disconnect error:", error);
    }
  };

  if (connected && publicKey) {
    return (
      <div className="bg-gradient-to-br from-purple-900/80 to-slate-900/80 border border-purple-500/30 rounded-lg p-6 text-white">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold">
                {networkConfig.name} Connected
              </h3>
            </div>
            <span className="px-2 py-1 bg-purple-500/20 border border-purple-400/30 rounded text-sm">
              {network.toUpperCase()}
            </span>
          </div>

          {/* Wallet Info */}
          <div className="bg-purple-800/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-purple-200 text-sm">
                {wallet?.adapter?.name || "Phantom"} Wallet
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-purple-200 text-sm">Address</p>
              <code className="text-white text-xs bg-black/30 px-2 py-1 rounded block break-all">
                {publicKey.toBase58()}
              </code>
            </div>

            <div className="space-y-2">
              <p className="text-purple-200 text-sm">Balances</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-white">SOL:</span>
                  <span className="font-mono">
                    {loading
                      ? "..."
                      : solBalance !== null
                      ? `${solBalance.toFixed(4)}`
                      : "Error"}
                  </span>
                </div>
                {network === "devnet" && (
                  <div className="flex justify-between">
                    <span className="text-white">USDC:</span>
                    <span className="font-mono">
                      {loading
                        ? "..."
                        : usdcBalance !== null
                        ? `${usdcBalance.toFixed(2)}`
                        : "0.00"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={fetchBalances}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={handleDisconnect}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/80 border border-purple-500/30 rounded-lg p-6 text-white">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Connect Solana Wallet</h3>
          <p className="text-purple-200 text-sm mt-1">
            Connect to {networkConfig.name} for agent deployment
          </p>
        </div>

        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-slate-500 hover:!from-purple-600 hover:!to-slate-600 !border-none !rounded-lg !px-6 !py-3 !text-white !font-medium !transition-all !duration-200" />
        </div>

        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
          <p className="text-purple-200 text-sm font-medium">
            Setup Instructions:
          </p>
          <ul className="text-purple-300 text-sm space-y-1 mt-2">
            <li>• Install Phantom wallet extension</li>
            <li>• Switch to {networkConfig.name}</li>
            {network === "devnet" && <li>• Get USDC tokens for payments</li>}
            <li>• Click "Select Wallet" to connect</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main Provider Component
const SolanaWalletConnect = ({ onConnectionChange, network = "devnet" }) => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const networkConfig = AGENTSPHERE_SOLANA_NETWORKS[network];

  return (
    <ConnectionProvider endpoint={networkConfig.rpc}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaWalletContent
            onConnectionChange={onConnectionChange}
            network={network}
          />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletConnect;
