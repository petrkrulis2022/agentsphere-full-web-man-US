import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to avoid CORS issues
      "/api": {
        target: "http://localhost:5174", // Same server
        changeOrigin: true,
      },
    },
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://8323ecb51478.ngrok-free.app",
      ],
      credentials: true,
    },
  },
  build: {
    // Skip TypeScript checking for mobile testing build
    rollupOptions: {
      onwarn: (warning, warn) => {
        // Suppress TypeScript warnings during mobile build
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
        if (warning.code === "UNRESOLVED_IMPORT") return;
        warn(warning);
      },
    },
  },
  optimizeDeps: {
    include: [
      "bech32",
      "bn.js",
      "js-sha3",
      "hash.js",
      "hash.js/lib/hash",
      "hash.js/lib/hash/sha",
      "hash.js/lib/hash/ripemd",
    ],
    exclude: [
      "md5.js",
      "@safe-global/safe-ethers-lib",
      "@ethersproject/providers",
      "@walletconnect/universal-provider",
      "crypto-js",
      "@eth-optimism/sdk",
      "ethjs-unit",
    ],
  },
});
