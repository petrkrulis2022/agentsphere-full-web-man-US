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

      // ═══════════════════════════════════════════════════════════════════════
      // TODO: REPLACE THIS MOCK WITH REAL MCP SERVER INTEGRATION
      // ═══════════════════════════════════════════════════════════════════════
      // CURRENT: Mock implementation for development (no real payments)
      // FUTURE: Replace with custom MCP server that accepts USDH on Hedera
      //
      // When integrating real MCP:
      // 1. Remove this entire mock block (lines 153-202)
      // 2. Uncomment the real x402 payment flow below
      // 3. Update MCP endpoint to your custom server URL
      // 4. Verify USDH token ID matches production token
      // 5. Test with small amounts first
      //
      // Real MCP server requirements:
      // - Accept x402 payment protocol
      // - Support USDH stablecoin (Hedera HTS)
      // - Return flight data in same format as mock
      // - Cost: ~0.00022 USDH per query
      // ═══════════════════════════════════════════════════════════════════════

      console.log(
        `[FlightradarMCP] MOCK MODE - Returning simulated flight data`
      );

      const startTime = Date.now();

      // Simulate API delay
      await new Promise((resolve) =>
        setTimeout(resolve, 500 + Math.random() * 1000)
      );

      // Generate mock flight data based on route
      const mockFlights = this._generateMockFlights(origin, destination, date);

      // Generate fake x402 transaction ID (Hedera format)
      const fakeTransactionId = `0.0.${Math.floor(
        Math.random() * 1000000
      )}@${Date.now()}.${Math.floor(Math.random() * 1000000000)}`;

      const responseTime = Date.now() - startTime;
      console.log(`[FlightradarMCP] MOCK query successful (${responseTime}ms)`);

      // Return mock result with fake x402 payment
      const result = {
        flights: mockFlights,
        query: { origin, destination, date },
        payment: {
          cost_usdh: "0.00022",
          amount: 0.00022,
          currency: "USDH",
          transaction_id: fakeTransactionId,
          hashscan_url: `https://hashscan.io/testnet/transaction/${fakeTransactionId}`,
          response_time_ms: responseTime,
          timestamp: new Date().toISOString(),
          protocol: "x402",
          service: "Flightradar24 MCP (MOCKED)",
          mock: true,
        },
      };

      // Cache result
      this._setCache(cacheKey, result);

      return result;

      // ═══════════════════════════════════════════════════════════════════════
      // END OF MOCK - REAL MCP IMPLEMENTATION STARTS HERE
      // ═══════════════════════════════════════════════════════════════════════
      // Uncomment this section when integrating real MCP server:
      /*
      // Build real MCP request payload
      const requestPayload = {
        method: "queryFlights",
        params: {
          origin,
          destination,
          date,
          maxResults,
          includeAlternatives,
        },
        timestamp: new Date().toISOString(),
      };

      // Execute x402 request to real MCP server
      const responseData = await this.x402Service.makeX402Request(
        this.mcpEndpoint, // Your custom MCP server URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-MCP-Route": this.mcpRouteId,
            "X-MCP-Action": "queryFlights",
          },
        },
        requestPayload
      );

      const result = {
        ...responseData,
        payment: {
          ...responseData.payment,
          cost_usdh: "0.00022",
          timestamp: new Date().toISOString(),
          protocol: "x402",
          service: "Custom Flight MCP",
        },
      };

      // Cache result
      this._setCache(cacheKey, result);

      return result;
      */
      // ═══════════════════════════════════════════════════════════════════════
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
   * Generate mock flight data for development
   *
   * TODO: DELETE THIS FUNCTION when integrating real MCP server
   * This is only used for mocking during development phase.
   */
  _generateMockFlights(origin, destination, date) {
    const airlines = [
      "Wizz Air",
      "Ryanair",
      "British Airways",
      "Lufthansa",
      "Air France",
    ];
    const numFlights = 2 + Math.floor(Math.random() * 4); // 2-5 flights

    const flights = [];
    const baseTime = new Date(date);
    baseTime.setHours(6, 0, 0, 0);

    for (let i = 0; i < numFlights; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNum = Math.floor(1000 + Math.random() * 8000);
      const departHours = 6 + i * 3 + Math.floor(Math.random() * 2);
      const departMins = Math.floor(Math.random() * 60);

      const departure = new Date(baseTime);
      departure.setHours(departHours, departMins);

      const arrival = new Date(departure);
      arrival.setHours(arrival.getHours() + 2 + Math.floor(Math.random() * 2));
      arrival.setMinutes(arrival.getMinutes() + Math.floor(Math.random() * 60));

      flights.push({
        airline: airline,
        flightNumber: `${airline.substring(0, 2).toUpperCase()}${flightNum}`,
        departure: {
          time: departure.toISOString(),
          airport: origin,
          terminal: `${Math.floor(Math.random() * 3) + 1}`,
          gate: `${String.fromCharCode(65 + Math.floor(Math.random() * 10))}${
            Math.floor(Math.random() * 20) + 1
          }`,
        },
        arrival: {
          time: arrival.toISOString(),
          airport: destination,
          terminal: `${Math.floor(Math.random() * 3) + 1}`,
          gate: `${String.fromCharCode(65 + Math.floor(Math.random() * 10))}${
            Math.floor(Math.random() * 20) + 1
          }`,
        },
        duration: `${Math.floor((arrival - departure) / 3600000)}h ${Math.floor(
          ((arrival - departure) % 3600000) / 60000
        )}m`,
        aircraft: ["Boeing 737-800", "Airbus A320", "Airbus A321"][
          Math.floor(Math.random() * 3)
        ],
        price: Math.floor(45 + Math.random() * 200),
        status: "On Time",
        available_seats: Math.floor(20 + Math.random() * 150),
      });
    }

    return flights;
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
