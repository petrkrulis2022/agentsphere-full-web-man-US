// AR Agent Viewer proven polyfills for browser compatibility
import "./polyfills.js";

// Import Solana wallet styles FIRST
import "@solana/wallet-adapter-react-ui/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { SolanaWalletProvider } from "./providers/SolanaWalletProvider.tsx";

// Suppress Radix UI dialog title warnings from third-party components
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.("DialogContent") &&
    args[0]?.includes?.("DialogTitle")
  ) {
    return; // Suppress this specific warning
  }
  originalConsoleError(...args);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SolanaWalletProvider>
      <ThirdwebProvider
        clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
        autoConnect={false}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThirdwebProvider>
    </SolanaWalletProvider>
  </React.StrictMode>
);
