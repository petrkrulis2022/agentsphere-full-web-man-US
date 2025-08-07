import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import topLevelAwait from "vite-plugin-top-level-await";
import path from "path";

// AR Agent Viewer PROVEN working configuration for AgentSphere
export default defineConfig({
  plugins: [
    react(),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: "__tla",
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`,
    }),
    {
      name: "buffer-polyfill",
      transformIndexHtml(html) {
        return html.replace(
          "<head>",
          `<head>
  <script>
    // AgentSphere Buffer polyfill - CRITICAL for Solana wallet
    if (typeof global === "undefined") { 
      var global = globalThis; 
    }
    // Pre-define Buffer for immediate availability
    window.Buffer = window.Buffer || {};
    globalThis.Buffer = globalThis.Buffer || {};
  </script>`
        );
      },
    },
  ],
  server: {
    port: 5174,
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      stream: "stream-browserify",
      util: "util",
      crypto: "crypto-browserify",
      assert: "assert",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify",
      url: "url",
      zlib: "browserify-zlib",
      path: "path-browserify",
      // 🔥 CRITICAL: Pino error fixes - AR viewer proven method
      pino: "pino/browser",
      "pino/child": "pino/browser",
    },
  },
  define: {
    global: "globalThis",
    "process.env": {},
    Buffer: "Buffer",
    "globalThis.Buffer": "Buffer",
  },
  optimizeDeps: {
    include: [
      "@solana/web3.js",
      "@solana/spl-token",
      "@solana/wallet-adapter-base",
      "@solana/wallet-adapter-react",
      "@solana/wallet-adapter-phantom",
      "buffer",
      "crypto-browserify",
      "stream-browserify",
      "assert",
      "util",
    ],
    exclude: [
      "pino-pretty", // 🔥 Exclude pino-pretty to prevent errors
    ],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
});
