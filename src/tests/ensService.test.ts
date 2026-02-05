/**
 * ENS Service Unit Tests
 * Tests ENS domain resolution, caching, and validation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ENSService } from "../services/ensService";

describe("ENSService", () => {
  let ensService: ENSService;

  beforeEach(() => {
    ensService = new ENSService();
  });

  describe("isValidENSDomain", () => {
    it("should validate correct ENS domains", () => {
      expect(ensService.isValidENSDomain("vitalik.eth")).toBe(true);
      expect(ensService.isValidENSDomain("nick.eth")).toBe(true);
      expect(ensService.isValidENSDomain("test-domain.eth")).toBe(true);
      expect(ensService.isValidENSDomain("abc.eth")).toBe(true);
    });

    it("should reject invalid ENS domains", () => {
      expect(ensService.isValidENSDomain("vitalik")).toBe(false); // No .eth
      expect(ensService.isValidENSDomain("VITALIK.ETH")).toBe(false); // Uppercase
      expect(ensService.isValidENSDomain(".eth")).toBe(false); // No name
      expect(ensService.isValidENSDomain("ab.eth")).toBe(false); // Too short (< 3 chars before .eth)
      expect(ensService.isValidENSDomain("-test.eth")).toBe(false); // Starts with hyphen
      expect(ensService.isValidENSDomain("test-.eth")).toBe(false); // Ends with hyphen
      expect(ensService.isValidENSDomain("")).toBe(false); // Empty
      expect(ensService.isValidENSDomain("test.com")).toBe(false); // Wrong TLD
    });

    it("should handle edge cases", () => {
      expect(ensService.isValidENSDomain("  vitalik.eth  ")).toBe(true); // Whitespace trimmed
      expect(ensService.isValidENSDomain("a".repeat(251) + ".eth")).toBe(false); // Too long
    });
  });

  describe("Cache Management", () => {
    it("should initialize with empty cache", () => {
      const stats = ensService.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });

    it("should clear cache", () => {
      ensService.clearCache();
      const stats = ensService.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });

    it("should clear cache for specific identifier", () => {
      ensService.clearCacheFor("vitalik.eth", "mainnet");
      // Cache should remain functional
      const stats = ensService.getCacheStats();
      expect(stats).toBeDefined();
    });
  });

  describe("Network Support", () => {
    it("should support mainnet", () => {
      expect(ensService.isNetworkSupported("mainnet")).toBe(true);
    });

    it("should support sepolia", () => {
      expect(ensService.isNetworkSupported("sepolia")).toBe(true);
    });

    it("should not support other networks", () => {
      expect(ensService.isNetworkSupported("goerli")).toBe(false);
      expect(ensService.isNetworkSupported("polygon")).toBe(false);
      expect(ensService.isNetworkSupported("invalid")).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid domain gracefully", async () => {
      const result = await ensService.resolveENS("invalid");
      expect(result).toBeNull();
    });

    it("should handle invalid address gracefully", async () => {
      const result = await ensService.reverseResolve("not-an-address");
      expect(result).toBeNull();
    });

    it("should handle empty domain", async () => {
      const result = await ensService.resolveENS("");
      expect(result).toBeNull();
    });
  });

  describe("Integration Tests", () => {
    // These tests make real network calls - skip in CI or use mocks

    it.skip("should resolve vitalik.eth on mainnet", async () => {
      const address = await ensService.resolveENS("vitalik.eth", "mainnet");
      expect(address).toBeTruthy();
      expect(address?.startsWith("0x")).toBe(true);
      expect(address?.length).toBe(42);
    }, 10000);

    it.skip("should get avatar for nick.eth", async () => {
      const avatar = await ensService.getAvatar("nick.eth", "mainnet");
      expect(avatar).toBeTruthy();
    }, 10000);

    it.skip("should resolve with avatar in one call", async () => {
      const { address, avatar } = await ensService.resolveWithAvatar(
        "vitalik.eth",
        "mainnet",
      );
      expect(address).toBeTruthy();
      // Avatar may or may not exist
    }, 10000);
  });

  describe("Validation Edge Cases", () => {
    it("should handle null and undefined", () => {
      expect(ensService.isValidENSDomain(null as any)).toBe(false);
      expect(ensService.isValidENSDomain(undefined as any)).toBe(false);
    });

    it("should handle non-string inputs", () => {
      expect(ensService.isValidENSDomain(123 as any)).toBe(false);
      expect(ensService.isValidENSDomain({} as any)).toBe(false);
      expect(ensService.isValidENSDomain([] as any)).toBe(false);
    });

    it("should validate domain length", () => {
      // Minimum: 3 chars + .eth = 7 total
      expect(ensService.isValidENSDomain("ab.eth")).toBe(false);
      expect(ensService.isValidENSDomain("abc.eth")).toBe(true);

      // Maximum: 255 chars total
      const longDomain = "a".repeat(251) + ".eth"; // 255 chars
      expect(ensService.isValidENSDomain(longDomain)).toBe(true);

      const tooLongDomain = "a".repeat(252) + ".eth"; // 256 chars
      expect(ensService.isValidENSDomain(tooLongDomain)).toBe(false);
    });

    it("should handle special characters", () => {
      expect(ensService.isValidENSDomain("test_name.eth")).toBe(false); // Underscore not allowed
      expect(ensService.isValidENSDomain("test.name.eth")).toBe(false); // Multiple dots
      expect(ensService.isValidENSDomain("test@name.eth")).toBe(false); // Special char
      expect(ensService.isValidENSDomain("test name.eth")).toBe(false); // Space
    });
  });
});

// Export test domains for use in other tests
export const TEST_DOMAINS = {
  mainnet: {
    valid: ["vitalik.eth", "nick.eth", "brantly.eth"],
    invalid: [
      "notregistered.eth",
      "this-domain-definitely-does-not-exist-12345.eth",
    ],
  },
  sepolia: {
    valid: ["test.eth"],
    invalid: ["invalid-sepolia-domain.eth"],
  },
  format: {
    invalid: [
      "invalid",
      "0x123",
      "",
      "test.com",
      "TEST.ETH",
      "-test.eth",
      "test-.eth",
    ],
  },
};
