import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThirdwebProvider } from '@thirdweb-dev/react'

// Base Sepolia Testnet configuration (v4 format)
const BaseSepoliaTestnet = {
  chainId: 84532,
  slug: "base-sepolia-testnet",
  name: "Base Sepolia Testnet",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpc: ["https://sepolia.base.org"],
  explorers: [
    {
      name: "Base Sepolia Explorer",
      url: "https://sepolia-explorer.base.org",
    },
  ],
  testnet: true,
}

// Suppress Radix UI dialog title warnings from third-party components
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('DialogContent') && args[0]?.includes?.('DialogTitle')) {
    return; // Suppress this specific warning
  }
  originalConsoleError(...args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThirdwebProvider 
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
      activeChain={BaseSepoliaTestnet}
      autoConnect={false}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThirdwebProvider>
  </React.StrictMode>,
)