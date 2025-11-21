/**
 * Flightradar24 MCP Service for Travel Agent
 * Wraps Thirdweb Nexus MCP server access with x402 micropayments
 *
 * MCP Endpoint: https://nexus.thirdweb.com/routes/dck8b9de
 * Cost: $0.00022 per query (220000000000000 smallest units of USDH)
 * Payment Protocol: x402 (HTTP 402 Payment Required + Hedera HTS)
 *
 * Use Cases:
 * - Query real-time flight data (departure/arrival times, delays, gates)
 * - Check flight availability for specific routes and dates
 * - Get airline pricing estimates
 * - Retrieve alternative flight options
 */

import X402PaymentService from "./x402Service.js";

export class FlightradarMcpService {
  constructor(config) {
    // MCP configuration
    this.mcpEndpoint =
      config.mcpEndpoint || "https://nexus.thirdweb.com/routes/dck8b9de";
    this.mcpRouteId = "dck8b9de"; // Flightradar24 route ID

    // Initialize x402 payment service
    this.x402Service = new X402PaymentService({
      accountId: config.accountId,
      privateKey: config.privateKey,
      usdhTokenId: config.usdhTokenId || "0.0.7218375",
      network: config.network || "testnet",
      maxRetries: 3,
      retryDelayMs: 1500,
    });

    // Query cache (optional, to reduce costs)
    this.cacheEnabled = config.cacheEnabled !== false;
    this.cache = new Map();
    this.cacheTtlMs = config.cacheTtlMs || 300000; // 5 minutes default

    console.log(
      `[FlightradarMCP] Initialized with endpoint: ${this.mcpEndpoint}`
    );
  }

  /**
   * Generate cache key from query parameters
   */
  _getCacheKey(method, params) {
    return `${method}:${JSON.stringify(params)}`;
  }

  /**
   * Check cache for recent query results
   */
  _getFromCache(cacheKey) {
    if (!this.cacheEnabled) return null;

    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.cacheTtlMs) {
      this.cache.delete(cacheKey);
      return null;
    }

    console.log(`[FlightradarMCP] Cache hit (age: ${Math.round(age / 1000)}s)`);
    return cached.data;
  }

  /**
   * Store query result in cache
   */
  _setCache(cacheKey, data) {
    if (!this.cacheEnabled) return;

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    // Clean old cache entries (max 100 items)
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Query Flightradar24 for flight information
   *
   * @param {object} params - Query parameters
   * @param {string} params.origin - Origin airport code (e.g., "BUD")
   * @param {string} params.destination - Destination airport code (e.g., "BCN")
   * @param {string} params.date - Departure date (ISO 8601 format: "2025-01-15")
   * @param {string} [params.time] - Preferred departure time (HH:MM format: "16:00")
   * @param {number} [params.maxResults=5] - Maximum number of flight options to return
   * @param {boolean} [params.includeAlternatives=true] - Include alternative dates/routes
   *
   * @returns {object} Flight data with payment metadata
   * {
   *   "query": { "origin": "BUD", "destination": "BCN", "date": "2025-01-15" },
   *   "flights": [
   *     {
   *       "flightNumber": "FR8024",
   *       "airline": "Ryanair",
   *       "departure": { "time": "16:05", "airport": "BUD", "terminal": "2B", "gate": "A5" },
   *       "arrival": { "time": "18:30", "airport": "BCN", "terminal": "2", "gate": "B12" },
   *       "duration": "2h 25m",
   *       "aircraft": "Boeing 737-800",
   *       "price": { "economy": 45, "business": null },
   *       "status": "On Time",
   *       "available_seats": 78
   *     }
   *   ],
   *   "alternatives": [...],
   *   "payment": {
   *     "cost_usdh": "0.00022",
   *     "transaction_id": "0.0.7145005@1704067200.123456789",
   *     "timestamp": "2025-01-14T15:00:00Z"
   *   }
   * }
   */
  async queryFlights(params) {
    try {
      const {
        origin,
        destination,
        date,
        time,
        maxResults = 5,
        includeAlternatives = true,
      } = params;

      // Validate required parameters
      if (!origin || !destination || !date) {
        throw new Error(
          "Missing required parameters: origin, destination, date"
        );
      }

      console.log(
        `[FlightradarMCP] Querying flights: ${origin} → ${destination} on ${date}`
      );

      // Check cache
      const cacheKey = this._getCacheKey("queryFlights", params);
      const cachedResult = this._getFromCache(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Build MCP request payload
      const requestPayload = {
        method: "queryFlights",
        params: {
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          date,
          time,
          maxResults,
          includeAlternatives,
        },
        timestamp: new Date().toISOString(),
      };

      // Execute x402 payment request
      const startTime = Date.now();
      const responseData = await this.x402Service.makeX402Request(
        this.mcpEndpoint,
        {
          method: "POST",
          headers: {
            "X-MCP-Route": this.mcpRouteId,
            "X-MCP-Action": "queryFlights",
          },
        },
        requestPayload
      );

      const responseTime = Date.now() - startTime;
      console.log(`[FlightradarMCP] Query successful (${responseTime}ms)`);

      // Attach payment metadata
      const result = {
        ...responseData,
        payment: {
          cost_usdh: "0.00022",
          response_time_ms: responseTime,
          timestamp: new Date().toISOString(),
        },
      };

      // Cache result
      this._setCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error(`[FlightradarMCP] Query failed:`, error);
      throw new Error(`Flightradar24 MCP query failed: ${error.message}`);
    }
  }

  /**
   * Query specific flight details by flight number
   *
   * @param {string} flightNumber - Flight number (e.g., "FR8024")
   * @param {string} date - Flight date (ISO 8601)
   * @returns {object} Detailed flight information
   */
  async getFlightDetails(flightNumber, date) {
    try {
      console.log(
        `[FlightradarMCP] Getting flight details: ${flightNumber} on ${date}`
      );

      // Check cache
      const cacheKey = this._getCacheKey("getFlightDetails", {
        flightNumber,
        date,
      });
      const cachedResult = this._getFromCache(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Build MCP request
      const requestPayload = {
        method: "getFlightDetails",
        params: {
          flightNumber: flightNumber.toUpperCase(),
          date,
        },
        timestamp: new Date().toISOString(),
      };

      // Execute x402 request
      const responseData = await this.x402Service.makeX402Request(
        this.mcpEndpoint,
        {
          method: "POST",
          headers: {
            "X-MCP-Route": this.mcpRouteId,
            "X-MCP-Action": "getFlightDetails",
          },
        },
        requestPayload
      );

      const result = {
        ...responseData,
        payment: {
          cost_usdh: "0.00022",
          timestamp: new Date().toISOString(),
        },
      };

      // Cache result
      this._setCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error(`[FlightradarMCP] Flight details query failed:`, error);
      throw new Error(`Flight details query failed: ${error.message}`);
    }
  }

  /**
   * Get current USDH balance available for MCP queries
   * @returns {object} Balance information
   */
  async getBalance() {
    try {
      const balanceUnits = await this.x402Service.getUsdhBalance();
      const balanceUsdh = balanceUnits / 1e18; // Convert to USDH (18 decimals)
      const queriesAvailable = Math.floor(balanceUsdh / 0.00022);

      return {
        balance_usdh: balanceUsdh.toFixed(6),
        balance_units: balanceUnits,
        queries_available: queriesAvailable,
        cost_per_query_usdh: "0.00022",
      };
    } catch (error) {
      console.error(`[FlightradarMCP] Balance check failed:`, error);
      return {
        balance_usdh: "0",
        balance_units: 0,
        queries_available: 0,
        cost_per_query_usdh: "0.00022",
      };
    }
  }

  /**
   * Clear query cache
   */
  clearCache() {
    this.cache.clear();
    console.log(`[FlightradarMCP] Cache cleared`);
  }

  /**
   * Close service and cleanup
   */
  async close() {
    await this.x402Service.close();
    this.clearCache();
  }
}

export default FlightradarMcpService;
