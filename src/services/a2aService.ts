/**
 * A2A (Agent-to-Agent) Communication Service
 * Based on: https://github.com/a2aproject/A2A
 *
 * Enables trustless communication between Hedera AI agents.
 * Agents can discover each other, send messages, and coordinate actions.
 */

interface A2AMessage {
  from: string; // Hedera Account ID of sender
  to: string; // Hedera Account ID of recipient
  type: "query" | "response" | "request" | "notification";
  payload: any;
  timestamp: number;
  signature?: string;
}

interface AgentDiscoveryQuery {
  agentType?: string; // "bus_agent", "train_agent", "hotel_agent"
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  capabilities?: string[];
}

interface AgentInfo {
  accountId: string;
  name: string;
  type: string;
  location: {
    latitude: number;
    longitude: number;
  };
  a2aEndpoint: string;
  capabilities: {
    chat: boolean;
    voice: boolean;
    video: boolean;
    a2a: boolean;
    x402: boolean;
  };
}

/**
 * A2A Communication Service Class
 */
class A2AService {
  private baseUrl: string;
  private agentAccountId: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_A2A_BASE_URL || "http://localhost:3001";
  }

  /**
   * Initialize the A2A service with agent credentials
   */
  initialize(agentAccountId: string) {
    this.agentAccountId = agentAccountId;
    console.log(`🔷 A2A Service initialized for agent: ${agentAccountId}`);
  }

  /**
   * Discover agents based on criteria
   */
  async discoverAgents(query: AgentDiscoveryQuery): Promise<AgentInfo[]> {
    try {
      console.log("🔍 Discovering agents with query:", query);

      // In production, this would query the Supabase database or Hedera network
      // For now, we'll use a placeholder implementation
      const response = await fetch(`${this.baseUrl}/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        throw new Error(`Discovery failed: ${response.statusText}`);
      }

      const agents = await response.json();
      console.log(`✅ Discovered ${agents.length} agents`);
      return agents;
    } catch (error) {
      console.error("❌ Agent discovery failed:", error);
      return [];
    }
  }

  /**
   * Send a message to another agent
   */
  async sendMessage(message: A2AMessage): Promise<boolean> {
    if (!this.agentAccountId) {
      throw new Error("A2A Service not initialized");
    }

    try {
      console.log(`📤 Sending A2A message to ${message.to}:`, message);

      const response = await fetch(`${this.baseUrl}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...message,
          from: this.agentAccountId,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Message send failed: ${response.statusText}`);
      }

      console.log(`✅ Message sent successfully to ${message.to}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to send A2A message:", error);
      return false;
    }
  }

  /**
   * Query another agent for information
   * Example: Bus agent queries Train agent for schedules
   */
  async queryAgent(
    targetAccountId: string,
    queryType: string,
    queryData: any
  ): Promise<any> {
    const message: A2AMessage = {
      from: this.agentAccountId || "",
      to: targetAccountId,
      type: "query",
      payload: {
        queryType,
        data: queryData,
      },
      timestamp: Date.now(),
    };

    try {
      console.log(`🔷 Querying agent ${targetAccountId} for ${queryType}`);

      const response = await fetch(`${this.baseUrl}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Received response from ${targetAccountId}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Query to agent ${targetAccountId} failed:`, error);
      throw error;
    }
  }

  /**
   * Coordinate a multi-agent journey
   * Example: User wants Bus → Train → Hotel
   */
  async coordinateJourney(request: {
    from: { latitude: number; longitude: number };
    to: { latitude: number; longitude: number };
    date: string;
    preferences?: any;
  }): Promise<{
    journey: any[];
    totalCost: number;
    agents: string[];
  }> {
    try {
      console.log("🗺️ Coordinating multi-agent journey:", request);

      // 1. Discover nearby Bus agents
      const busAgents = await this.discoverAgents({
        agentType: "bus_agent",
        location: {
          ...request.from,
          radius: 5000, // 5km radius
        },
      });

      if (busAgents.length === 0) {
        throw new Error("No bus agents found nearby");
      }

      // 2. Query bus agent for route options
      const busRoute = await this.queryAgent(
        busAgents[0].accountId,
        "route_query",
        {
          from: request.from,
          to: request.to,
          date: request.date,
        }
      );

      // 3. If journey requires multiple modes, discover other agents
      const trainAgents = await this.discoverAgents({
        agentType: "train_agent",
        location: {
          latitude: busRoute.destination.latitude,
          longitude: busRoute.destination.longitude,
          radius: 2000,
        },
      });

      // 4. Query train agent for connection
      let trainRoute = null;
      if (trainAgents.length > 0) {
        trainRoute = await this.queryAgent(
          trainAgents[0].accountId,
          "route_query",
          {
            from: busRoute.destination,
            to: request.to,
            date: request.date,
          }
        );
      }

      // 5. Discover hotel agents at destination
      const hotelAgents = await this.discoverAgents({
        agentType: "hotel_agent",
        location: {
          ...request.to,
          radius: 3000,
        },
      });

      // 6. Query hotel for availability
      let hotelBooking = null;
      if (hotelAgents.length > 0) {
        hotelBooking = await this.queryAgent(
          hotelAgents[0].accountId,
          "availability_query",
          {
            checkIn: request.date,
            nights: 1,
            preferences: request.preferences,
          }
        );
      }

      // 7. Compile journey plan
      const journey = [
        {
          type: "bus",
          agent: busAgents[0].accountId,
          details: busRoute,
          cost: busRoute.cost || 5,
        },
        ...(trainRoute
          ? [
              {
                type: "train",
                agent: trainAgents[0].accountId,
                details: trainRoute,
                cost: trainRoute.cost || 15,
              },
            ]
          : []),
        ...(hotelBooking
          ? [
              {
                type: "hotel",
                agent: hotelAgents[0].accountId,
                details: hotelBooking,
                cost: hotelBooking.cost || 80,
              },
            ]
          : []),
      ];

      const totalCost =
        journey.reduce((sum, leg) => sum + leg.cost, 0) + journey.length * 2; // Add agent fees (2 USDh per agent)

      console.log("✅ Journey coordinated:", journey);

      return {
        journey,
        totalCost,
        agents: journey.map((leg) => leg.agent),
      };
    } catch (error) {
      console.error("❌ Journey coordination failed:", error);
      throw error;
    }
  }

  /**
   * Listen for incoming A2A messages
   * (This would typically run in the agent's backend microservice)
   */
  async startListener(onMessage: (message: A2AMessage) => void): Promise<void> {
    if (!this.agentAccountId) {
      throw new Error("A2A Service not initialized");
    }

    console.log(`👂 Starting A2A listener for agent: ${this.agentAccountId}`);

    // In production, this would be a WebSocket or SSE connection
    // For now, we'll use polling (not recommended for production)
    setInterval(async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/messages/${this.agentAccountId}`
        );
        if (response.ok) {
          const messages = await response.json();
          messages.forEach((msg: A2AMessage) => onMessage(msg));
        }
      } catch (error) {
        console.error("❌ Error polling for messages:", error);
      }
    }, 5000); // Poll every 5 seconds
  }
}

// Export singleton instance
export const a2aService = new A2AService();

// Export types
export type { A2AMessage, AgentDiscoveryQuery, AgentInfo };
