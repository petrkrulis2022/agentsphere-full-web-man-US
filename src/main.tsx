import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThirdwebProvider } from '@thirdweb-dev/react'

// BlockDAG Primordial Testnet configuration
const BlockDAGTestnet = {
  chainId: 1043,
  slug: "primordial-blockdag-testnet",
  name: "Primordial BlockDAG Testnet",
  nativeCurrency: {
    name: "BDAG",
    symbol: "BDAG",
    decimals: 18,
  },
  rpc: ["https://rpc.primordial.bdagscan.com"],
  blockExplorers: [
    {
      name: "BlockDAG Explorer",
      url: "https://primordial.bdagscan.com",
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
      activeChain={BlockDAGTestnet}
      autoConnect={false}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThirdwebProvider>
  </React.StrictMode>,
)