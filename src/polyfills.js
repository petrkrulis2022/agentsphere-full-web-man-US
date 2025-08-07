// AgentSphere Solana Wallet Polyfills
// AR Agent Viewer PROVEN working configuration
// Fixes Buffer, Pino and compatibility issues

// Buffer polyfill (critical for Solana) - MUST BE FIRST
import { Buffer } from "buffer";

// Aggressively set Buffer everywhere with error handling
try {
  window.Buffer = Buffer;
  globalThis.Buffer = Buffer;
  if (typeof global !== "undefined") {
    global.Buffer = Buffer;
  }

  // Ensure Buffer constructor is available
  if (typeof window !== "undefined") {
    window.Buffer = Buffer;
    if (!window.global) {
      window.global = window;
    }
  }

  // Additional Buffer assignments for compatibility
  if (typeof globalThis !== "undefined") {
    globalThis.Buffer = Buffer;
    if (!globalThis.global) {
      globalThis.global = globalThis;
    }
  }
} catch (error) {
  console.warn("Buffer polyfill setup warning:", error);
}

// Global polyfill
if (typeof global === "undefined") {
  window.global = globalThis;
  globalThis.global = globalThis;
}

// Process polyfill
const processPolyfill = {
  env: {},
  browser: true,
  version: "",
  versions: {
    node: "",
  },
  nextTick: (fn) => setTimeout(fn, 0),
};

window.process = processPolyfill;
globalThis.process = processPolyfill;

// Console fallbacks for production
if (typeof console === "undefined") {
  window.console = {
    log: () => {},
    error: () => {},
    warn: () => {},
    info: () => {},
  };
}

// Ensure Buffer is available everywhere
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

export default {};
