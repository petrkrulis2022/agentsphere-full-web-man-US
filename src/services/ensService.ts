/**
 * ENS Service for AgentSphere (Ethers v5 Compatible)
 * Handles ENS domain resolution, reverse lookups, and avatar fetching
 *
 * Features:
 * - Forward resolution (domain → address)
 * - Reverse resolution (address → domain)
 * - Avatar fetching from ENS metadata
 * - 1-hour caching to reduce RPC calls
 * - Mainnet and Sepolia support
 * - Validation for ENS domain format
 */

import { ethers } from "ethers";

// ENS Configuration Constants
const ENS_CONFIG = {
  CACHE_TIMEOUT: 3600000, // 1 hour in milliseconds
  RESOLUTION_TIMEOUT: 10000, // 10 seconds max resolution time
  DEFAULT_NETWORK: "mainnet",
  SUPPORTED_NETWORKS: ["mainnet", "sepolia"],
  MIN_DOMAIN_LENGTH: 3,
  MAX_DOMAIN_LENGTH: 255,
};

// RPC Endpoints with fallbacks
const RPC_ENDPOINTS = {
  mainnet: [
    "https://eth-mainnet.g.alchemy.com/v2/demo",
    "https://rpc.ankr.com/eth",
    "https://eth.llamarpc.com",
    "https://ethereum.publicnode.com",
    "https://cloudflare-eth.com",
  ],
  sepolia: [
    "https://eth-sepolia.g.alchemy.com/v2/demo",
    "https://rpc.ankr.com/eth_sepolia",
    "https://ethereum-sepolia.publicnode.com",
  ],
};

// Cache entry interface
interface CacheEntry {
  value: string | null;
  timestamp: number;
}

// Cache statistics
interface CacheStats {
  size: number;
  hits: number;
  misses: number;
}

class ENSService {
  private cache: Map<string, CacheEntry>;
  private providers: Map<string, ethers.providers.JsonRpcProvider>;
  private cacheHits: number;
  private cacheMisses: number;

  constructor() {
    this.cache = new Map();
    this.providers = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.initializeProviders();
  }

  /**
   * Initialize ethers providers for supported networks
   */
  private initializeProviders(): void {
    // Initialize mainnet provider with fallbacks
    const mainnetProvider = new ethers.providers.JsonRpcProvider(
      RPC_ENDPOINTS.mainnet[0],
      "mainnet",
    );
    this.providers.set("mainnet", mainnetProvider);

    // Initialize sepolia provider with fallbacks
    const sepoliaProvider = new ethers.providers.JsonRpcProvider(
      RPC_ENDPOINTS.sepolia[0],
      "sepolia",
    );
    this.providers.set("sepolia", sepoliaProvider);
  }

  /**
   * Get provider for specified network
   */
  private getProvider(
    network: string = ENS_CONFIG.DEFAULT_NETWORK,
  ): ethers.providers.JsonRpcProvider {
    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(
        `Unsupported network: ${network}. Use 'mainnet' or 'sepolia'.`,
      );
    }
    return provider;
  }

  /**
   * Generate cache key for resolution
   */
  private getCacheKey(
    identifier: string,
    network: string,
    type: "forward" | "reverse" | "avatar",
  ): string {
    return `${type}:${network}:${identifier.toLowerCase()}`;
  }

  /**
   * Get value from cache if not expired
   */
  private getFromCache(key: string): string | null | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.cacheMisses++;
      return undefined;
    }

    const age = Date.now() - entry.timestamp;
    if (age > ENS_CONFIG.CACHE_TIMEOUT) {
      this.cache.delete(key);
      this.cacheMisses++;
      return undefined;
    }

    this.cacheHits++;
    return entry.value;
  }

  /**
   * Store value in cache
   */
  private setCache(key: string, value: string | null): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Validate ENS domain format
   * Must end with .eth, be 3-255 chars, contain only lowercase letters, numbers, and hyphens
   */
  public isValidENSDomain(domain: string): boolean {
    if (!domain || typeof domain !== "string") {
      return false;
    }

    const trimmed = domain.trim();

    // Check length
    if (
      trimmed.length < ENS_CONFIG.MIN_DOMAIN_LENGTH + 4 || // +4 for .eth
      trimmed.length > ENS_CONFIG.MAX_DOMAIN_LENGTH
    ) {
      return false;
    }

    // Check format: lowercase letters, numbers, hyphens, must end with .eth
    const ensRegex = /^[a-z0-9-]+\.eth$/;
    if (!ensRegex.test(trimmed)) {
      return false;
    }

    // Check that it doesn't start or end with hyphen
    const name = trimmed.replace(".eth", "");
    if (name.startsWith("-") || name.endsWith("-")) {
      return false;
    }

    return true;
  }

  /**
   * Resolve ENS domain to Ethereum address
   * @param domain - ENS domain (e.g., 'vitalik.eth')
   * @param network - Network to resolve on ('mainnet' or 'sepolia')
   * @returns Resolved address or null if not found
   */
  public async resolveENS(
    domain: string,
    network: string = ENS_CONFIG.DEFAULT_NETWORK,
  ): Promise<string | null> {
    try {
      // Validate domain format
      if (!this.isValidENSDomain(domain)) {
        console.warn(`Invalid ENS domain format: ${domain}`);
        return null;
      }

      // Check cache first
      const cacheKey = this.getCacheKey(domain, network, "forward");
      const cached = this.getFromCache(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      // Try multiple RPC endpoints with fallback
      const endpoints = RPC_ENDPOINTS[network as keyof typeof RPC_ENDPOINTS];
      let lastError: any = null;

      for (const endpoint of endpoints) {
        try {
          const provider = new ethers.providers.JsonRpcProvider(
            endpoint,
            network,
          );

          // Set timeout for resolution
          const resolutionPromise = provider.resolveName(domain);
          const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), ENS_CONFIG.RESOLUTION_TIMEOUT),
          );

          const address = await Promise.race([
            resolutionPromise,
            timeoutPromise,
          ]);

          // If we got a result, cache it and return
          if (address !== null) {
            this.setCache(cacheKey, address);
            console.log(
              `✅ Successfully resolved ${domain} to ${address} via ${endpoint}`,
            );
            return address;
          }
        } catch (error) {
          lastError = error;
          console.warn(`Failed to resolve ${domain} via ${endpoint}:`, error);
          continue; // Try next endpoint
        }
      }

      // All endpoints failed or returned null
      console.error(
        `Could not resolve ${domain} on ${network} after trying all endpoints`,
      );
      this.setCache(cacheKey, null);
      return null;
    } catch (error) {
      console.error(`Error resolving ENS domain ${domain}:`, error);
      return null;
    }
  }

  /**
   * Reverse resolve Ethereum address to ENS domain
   * @param address - Ethereum address (0x...)
   * @param network - Network to resolve on ('mainnet' or 'sepolia')
   * @returns ENS domain or null if not found
   */
  public async reverseResolve(
    address: string,
    network: string = ENS_CONFIG.DEFAULT_NETWORK,
  ): Promise<string | null> {
    try {
      // Validate address format
      if (!ethers.isAddress(address)) {
        console.warn(`Invalid Ethereum address: ${address}`);
        return null;
      }

      // Check cache first
      const cacheKey = this.getCacheKey(address, network, "reverse");
      const cached = this.getFromCache(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      // Resolve using ethers provider
      const provider = this.getProvider(network);

      // Set timeout for resolution
      const resolutionPromise = provider.lookupAddress(address);
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), ENS_CONFIG.RESOLUTION_TIMEOUT),
      );

      const domain = await Promise.race([resolutionPromise, timeoutPromise]);

      // Cache result (even if null)
      this.setCache(cacheKey, domain);

      return domain;
    } catch (error) {
      console.error(`Error reverse resolving address ${address}:`, error);
      return null;
    }
  }

  /**
   * Get avatar URL from ENS domain
   * @param domain - ENS domain (e.g., 'nick.eth')
   * @param network - Network to resolve on ('mainnet' or 'sepolia')
   * @returns Avatar URL or null if not found
   */
  public async getAvatar(
    domain: string,
    network: string = ENS_CONFIG.DEFAULT_NETWORK,
  ): Promise<string | null> {
    try {
      // Validate domain format
      if (!this.isValidENSDomain(domain)) {
        console.warn(`Invalid ENS domain format: ${domain}`);
        return null;
      }

      // Check cache first
      const cacheKey = this.getCacheKey(domain, network, "avatar");
      const cached = this.getFromCache(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      // Resolve using ethers provider
      const provider = this.getProvider(network);

      // Set timeout for resolution
      const avatarPromise = provider.getAvatar(domain);
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), ENS_CONFIG.RESOLUTION_TIMEOUT),
      );

      const avatarUrl = await Promise.race([avatarPromise, timeoutPromise]);

      // Cache result (even if null)
      this.setCache(cacheKey, avatarUrl);

      return avatarUrl;
    } catch (error) {
      console.error(`Error fetching avatar for ${domain}:`, error);
      return null;
    }
  }

  /**
   * Alias for resolveENS (compatibility with ethers provider API)
   * @param domain - ENS domain (e.g., 'vitalik.eth')
   * @param network - Network to resolve on ('mainnet' or 'sepolia')
   * @returns Resolved address or null if not found
   */
  public async resolveName(
    domain: string,
    network: string = ENS_CONFIG.DEFAULT_NETWORK,
  ): Promise<string | null> {
    return this.resolveENS(domain, network);
  }

  /**
   * Resolve ENS domain with avatar in one call
   * More efficient than calling resolveENS and getAvatar separately
   * @param domain - ENS domain
   * @param network - Network to resolve on
   * @returns Object with address and avatar URL
   */
  public async resolveWithAvatar(
    domain: string,
    network: string = ENS_CONFIG.DEFAULT_NETWORK,
  ): Promise<{ address: string | null; avatar: string | null }> {
    const [address, avatar] = await Promise.all([
      this.resolveENS(domain, network),
      this.getAvatar(domain, network),
    ]);

    return { address, avatar };
  }

  /**
   * Clear the entire cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Clear cache for specific domain or address
   */
  public clearCacheFor(
    identifier: string,
    network: string = ENS_CONFIG.DEFAULT_NETWORK,
  ): void {
    // Clear all cache entries related to this identifier
    const forwardKey = this.getCacheKey(identifier, network, "forward");
    const reverseKey = this.getCacheKey(identifier, network, "reverse");
    const avatarKey = this.getCacheKey(identifier, network, "avatar");

    this.cache.delete(forwardKey);
    this.cache.delete(reverseKey);
    this.cache.delete(avatarKey);
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): CacheStats {
    return {
      size: this.cache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
    };
  }

  /**
   * Validate if network is supported
   */
  public isNetworkSupported(network: string): boolean {
    return ENS_CONFIG.SUPPORTED_NETWORKS.includes(network);
  }
}

// Export singleton instance
export const ensService = new ENSService();

// Export class for testing
export { ENSService };

// Export configuration for reference
export { ENS_CONFIG, RPC_ENDPOINTS };
