import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const SolanaConnectButton: React.FC = () => {
  const { connected, publicKey } = useWallet();

  return (
    <div className="flex items-center">
      {connected && publicKey ? (
        <div className="flex items-center space-x-2">
          {/* Solana Network Indicator */}
          <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Solana Devnet</span>
          </div>

          {/* Wallet Address & Disconnect Button */}
          <WalletMultiButton className="!bg-purple-600 !hover:bg-purple-700 !text-white !font-medium !py-2 !px-4 !rounded-md !text-sm !transition-colors" />
        </div>
      ) : (
        <WalletMultiButton className="!bg-purple-600 !hover:bg-purple-700 !text-white !font-medium !py-2 !px-4 !rounded-md !text-sm !transition-colors">
          Connect Solana
        </WalletMultiButton>
      )}
    </div>
  );
};

export default SolanaConnectButton;
