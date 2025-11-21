/**
 * Travel Agent - A2A Communication Server with x402 MCP Integration
 *
 * Features:
 * 1. A2A Protocol (Agent-to-Agent communication)
 * 2. x402 Micropayments to Flightradar24 MCP server
 * 3. Multi-agent coordination (Bus, Train, Hotel agents)
 * 4. Hedera HTS payments (USDH stablecoin)
 *
 * Environment Variables Required:
 * - AGENT_ACCOUNT_ID: Travel Agent Hedera account
 * - AGENT_PRIVATE_KEY: Travel Agent private key
 * - USDH_TOKEN_ID: USDH token ID (default: 0.0.7218375)
 * - MCP_FLIGHTRADAR_ENABLED: Enable Flightradar24 MCP integration (true/false)
 * - MCP_FLIGHTRADAR_ENDPOINT: Flightradar24 MCP endpoint
 * - AGENT_PORT: Server port (default: 4001)
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";
import { A2AExpressApp } from "@a2a-js/sdk/server/express";
import FlightradarMcpService from "./services/mcpService.js";

// Load environment variables
const AGENT_ACCOUNT_ID = process.env.AGENT_ACCOUNT_ID;
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY;
const USDH_TOKEN_ID = process.env.USDH_TOKEN_ID || "0.0.7218375";
const MCP_FLIGHTRADAR_ENABLED = process.env.MCP_FLIGHTRADAR_ENABLED === "true";
const MCP_FLIGHTRADAR_ENDPOINT =
  process.env.MCP_FLIGHTRADAR_ENDPOINT ||
  "https://nexus.thirdweb.com/routes/dck8b9de";
const AGENT_PORT = parseInt(process.env.AGENT_PORT || "4001");

// Validate required configuration
if (!AGENT_ACCOUNT_ID || !AGENT_PRIVATE_KEY) {
  console.error("ERROR: Missing required environment variables:");
  console.error("  - AGENT_ACCOUNT_ID");
  console.error("  - AGENT_PRIVATE_KEY");
  process.exit(1);
}

// Initialize Flightradar24 MCP service (if enabled)
let flightradarService = null;
if (MCP_FLIGHTRADAR_ENABLED) {
  console.log("[TravelAgent] Initializing Flightradar24 MCP service...");
  flightradarService = new FlightradarMcpService({
    accountId: AGENT_ACCOUNT_ID,
    privateKey: AGENT_PRIVATE_KEY,
    usdhTokenId: USDH_TOKEN_ID,
    mcpEndpoint: MCP_FLIGHTRADAR_ENDPOINT,
    network: "testnet",
    cacheEnabled: true,
    cacheTtlMs: 300000, // 5 minutes
  });
  console.log("[TravelAgent] Flightradar24 MCP service initialized");
} else {
  console.log("[TravelAgent] Flightradar24 MCP integration disabled");
}

// Define Travel Agent Card
const travelAgentCard = {
  name: "Travel Agent",
  description:
    "Coordinates multi-modal travel packages. Uses x402 to query Flightradar24 for real-time flight data, then coordinates with Bus, Train, and Hotel agents.",
  protocolVersion: "0.3.0",
  version: "2.0.0",
  url: `http://localhost:${AGENT_PORT}/`,
  skills: [
    {
      id: "plan-trip",
      name: "Plan Trip",
      description:
        "Create comprehensive travel package with flight, ground transport, and accommodation",
      tags: ["travel", "coordination", "x402", "mcp"],
    },
    {
      id: "query-flights",
      name: "Query Flights",
      description:
        "Search real-time flight data via Flightradar24 MCP (x402 micropayments)",
      tags: ["flights", "x402", "mcp"],
    },
  ],
  capabilities: {
    streaming: false,
    pushNotifications: false,
    stateTransitionHistory: true,
  },
  defaultInputModes: ["text"],
  defaultOutputModes: ["text", "json"],
};

// Travel Agent Executor
class TravelAgentExecutor {
  async execute(requestContext, eventBus) {
    try {
      const userMessage =
        requestContext.messages[requestContext.messages.length - 1];
      const messageText =
        userMessage.parts.find((p) => p.kind === "text")?.text || "";

      console.log(`[TravelAgent] Received message: ${messageText}`);

      // Parse user request
      const request = this._parseUserRequest(messageText);
      console.log(`[TravelAgent] Parsed request:`, request);

      let responseText = "";

      // Handle different request types
      if (request.type === "query-flights") {
        responseText = await this._handleFlightQuery(request);
      } else if (request.type === "plan-trip") {
        responseText = await this._handleTripPlanning(request);
      } else {
        responseText = this._handleGeneralQuery(messageText);
      }

      // Create response message
      const responseMessage = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [{ kind: "text", text: responseText }],
        contextId: requestContext.contextId,
      };

      eventBus.publish(responseMessage);
      eventBus.finished();
    } catch (error) {
      console.error("[TravelAgent] Execution error:", error);

      const errorMessage = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text: `Error processing request: ${error.message}`,
          },
        ],
        contextId: requestContext.contextId,
      };

      eventBus.publish(errorMessage);
      eventBus.finished();
    }
  }

  /**
   * Parse user message to determine intent
   */
  _parseUserRequest(messageText) {
    const lowerText = messageText.toLowerCase();

    // Detect flight query
    if (
      lowerText.includes("flight") ||
      lowerText.includes("fly") ||
      lowerText.includes("plane")
    ) {
      // Extract origin, destination, date from message
      // Simple pattern matching (can be improved with NLP)
      const originMatch = messageText.match(/from\s+([A-Z]{3})/i);
      const destMatch = messageText.match(/to\s+([A-Z]{3})/i);
      const dateMatch = messageText.match(/on\s+([\d-]+)/);

      return {
        type: "query-flights",
        origin: originMatch ? originMatch[1].toUpperCase() : null,
        destination: destMatch ? destMatch[1].toUpperCase() : null,
        date: dateMatch ? dateMatch[1] : null,
      };
    }

    // Detect trip planning
    if (
      lowerText.includes("plan") ||
      lowerText.includes("trip") ||
      lowerText.includes("travel package")
    ) {
      return {
        type: "plan-trip",
        rawText: messageText,
      };
    }

    return {
      type: "general",
      rawText: messageText,
    };
  }

  /**
   * Handle flight query using Flightradar24 MCP
   */
  async _handleFlightQuery(request) {
    if (!MCP_FLIGHTRADAR_ENABLED || !flightradarService) {
      return "Flight query service is not available. MCP integration is disabled.";
    }

    const { origin, destination, date } = request;

    if (!origin || !destination) {
      return "Please provide origin and destination airport codes (e.g., 'flights from BUD to BCN').";
    }

    try {
      console.log(
        `[TravelAgent] Querying Flightradar24: ${origin} → ${destination}`
      );

      // Query Flightradar24 via x402
      const flightData = await flightradarService.queryFlights({
        origin,
        destination,
        date: date || new Date().toISOString().split("T")[0], // Default to today
        maxResults: 5,
        includeAlternatives: true,
      });

      // Format response
      let response = `✈️ Flight Options (${origin} → ${destination}):\n\n`;

      if (flightData.flights && flightData.flights.length > 0) {
        flightData.flights.forEach((flight, idx) => {
          response += `${idx + 1}. ${flight.flightNumber} - ${
            flight.airline
          }\n`;
          response += `   Departs: ${flight.departure.time} (Gate ${flight.departure.gate})\n`;
          response += `   Arrives: ${flight.arrival.time} (Gate ${flight.arrival.gate})\n`;
          response += `   Duration: ${flight.duration}\n`;
          response += `   Price: €${flight.price.economy} (Economy)\n`;
          response += `   Status: ${flight.status}\n\n`;
        });
      } else {
        response += "No flights found for the specified route.\n\n";
      }

      response += `💳 MCP Query Cost: ${flightData.payment.cost_usdh} USDH\n`;
      response += `⏱️ Response Time: ${flightData.payment.response_time_ms}ms`;

      return response;
    } catch (error) {
      console.error("[TravelAgent] Flight query error:", error);
      return `Failed to query flight data: ${error.message}`;
    }
  }

  /**
   * Handle trip planning (coordinates with other agents)
   */
  async _handleTripPlanning(request) {
    // This would coordinate with Bus, Train, Hotel agents via A2A
    // For now, return placeholder
    return `🌍 Travel Package Planning\n\nStep 1: Query flights via Flightradar24 (x402)\nStep 2: Coordinate with Bus Agent (A2A)\nStep 3: Coordinate with Train Agent (A2A)\nStep 4: Coordinate with Hotel Agent (A2A)\nStep 5: Present complete package to user\n\n(Full implementation pending)`;
  }

  /**
   * Handle general queries
   */
  _handleGeneralQuery(messageText) {
    return `I am the Travel Agent. I can help you:\n1. Query real-time flight data (via Flightradar24 MCP)\n2. Plan complete travel packages\n3. Coordinate with Bus, Train, and Hotel agents\n\nExample: "Find flights from BUD to BCN on 2025-01-15"`;
  }

  cancelTask = async () => {};
}

// Initialize server
const agentExecutor = new TravelAgentExecutor();
const requestHandler = new DefaultRequestHandler(
  travelAgentCard,
  new InMemoryTaskStore(),
  agentExecutor
);

const appBuilder = new A2AExpressApp(requestHandler);
const expressApp = appBuilder.setupRoutes(express());

// Enable CORS for AR Viewer
expressApp.use(
  cors({
    origin: "*", // Allow all origins for development (restrict in production)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check endpoint
expressApp.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    agent: "Travel Agent",
    version: "2.0.0",
    mcp_enabled: MCP_FLIGHTRADAR_ENABLED,
    account_id: AGENT_ACCOUNT_ID,
  });
});

// AR Viewer MCP Query Endpoint (Server-side x402)
expressApp.post("/api/agents/travel/query", async (req, res) => {
  try {
    const { origin, destination, date, include_package } = req.body;

    console.log(`[API] Flight query received: ${origin} → ${destination}`);

    if (include_package) {
      console.log(
        `[API] ⚠️ A2A package requested - switching to HCS coordination`
      );
    }

    if (!origin || !destination) {
      return res.status(400).json({
        error: "Missing required parameters",
        details: "Both 'origin' and 'destination' are required",
      });
    }

    if (!flightradarService) {
      return res.status(503).json({
        error: "MCP service not available",
        details: "Flightradar24 MCP integration is disabled",
      });
    }

    // Use provided date or default to tomorrow
    const queryDate =
      date ||
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    console.log(
      `[API] Querying Flightradar24 MCP for ${origin} → ${destination} on ${queryDate}`
    );

    // Query Flightradar24 MCP with server-side x402 payment
    const result = await flightradarService.queryFlights({
      origin,
      destination,
      date: queryDate,
      maxResults: 5,
      includeAlternatives: true,
    });

    // If A2A package requested, initiate HCS-based agent coordination
    if (include_package) {
      console.log(`[API] 🤝 Starting A2A coordination via HCS...`);

      // TODO: IMPLEMENT REAL HCS-BASED A2A COORDINATION
      // For now, return placeholder structure
      result.a2a_package = {
        coordinator: {
          agent_id: AGENT_ACCOUNT_ID,
          agent_type: "travel",
          coordination_fee: 625,
          total_agents: 3,
        },
        agents: [
          {
            agent_id: "0.0.PENDING",
            agent_type: "bus",
            service: "HCS Discovery Pending",
            status: "discovering",
            discovery_method: "hcs_topic",
          },
          {
            agent_id: "0.0.PENDING",
            agent_type: "train",
            service: "HCS Discovery Pending",
            status: "discovering",
            discovery_method: "hcs_topic",
          },
          {
            agent_id: "0.0.PENDING",
            agent_type: "hotel",
            service: "HCS Discovery Pending",
            status: "discovering",
            discovery_method: "hcs_topic",
          },
        ],
        coordination_metadata: {
          discovery_time_ms: 0,
          coordination_time_ms: 0,
          total_a2a_time_ms: 0,
          agents_discovered: 0,
          agents_selected: 0,
          hcs_messages_sent: 0,
          hcs_messages_received: 0,
          status: "TODO: Implement HCS-based agent discovery",
        },
      };

      console.log(
        `[API] ⚠️ A2A coordination not yet implemented - returning placeholder`
      );
    }

    console.log(`[API] MCP query successful`);
    res.json(result);
  } catch (error) {
    console.error(`[API] Error querying flights:`, error);
    res.status(500).json({
      error: "Failed to query flights",
      details: error.message,
    });
  }
});

// Start server
expressApp.listen(AGENT_PORT, () => {
  console.log(`🚀 Travel Agent started on http://localhost:${AGENT_PORT}`);
  console.log(`   Account ID: ${AGENT_ACCOUNT_ID}`);
  console.log(
    `   MCP Integration: ${MCP_FLIGHTRADAR_ENABLED ? "Enabled" : "Disabled"}`
  );
  if (MCP_FLIGHTRADAR_ENABLED) {
    console.log(`   Flightradar24 Endpoint: ${MCP_FLIGHTRADAR_ENDPOINT}`);
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n[TravelAgent] Shutting down...");
  if (flightradarService) {
    await flightradarService.close();
  }
  process.exit(0);
});
