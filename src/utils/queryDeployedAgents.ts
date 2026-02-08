import { supabase } from "../lib/supabase";

export interface DeployedAgentQuery {
  id?: string;
  name?: string;
  agentIdentityWallet?: string;
  network?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: "created_at" | "name" | "id";
  orderDirection?: "asc" | "desc";
}

export interface DeployedAgentResult {
  id: string;
  name: string;
  description: string;
  object_type: string;
  latitude: number;
  longitude: number;
  address: string;
  agent_identity_wallet: string;
  agent_identity_type: string;
  deployment_network_name: string;
  deployment_chain_id: string;
  deployment_status: string;
  interaction_fee_amount: string;
  interaction_fee_token: string;
  payment_methods: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Add any other fields from your schema
}

/**
 * Query deployed agents from the database
 * @param query - Optional query parameters to filter agents
 * @returns Array of deployed agents matching the query
 */
export async function queryDeployedAgents(
  query: DeployedAgentQuery = {},
): Promise<{ data: DeployedAgentResult[] | null; error: any; count: number }> {
  try {
    console.log("🔍 Querying deployed agents with filters:", query);

    // Start building the query
    let supabaseQuery = supabase
      .from("deployed_objects")
      .select("*", { count: "exact" });

    // Apply filters
    if (query.id) {
      supabaseQuery = supabaseQuery.eq("id", query.id);
    }

    if (query.name) {
      supabaseQuery = supabaseQuery.ilike("name", `%${query.name}%`);
    }

    if (query.agentIdentityWallet) {
      supabaseQuery = supabaseQuery.eq(
        "agent_identity_wallet",
        query.agentIdentityWallet,
      );
    }

    if (query.network) {
      supabaseQuery = supabaseQuery.eq(
        "deployment_network_name",
        query.network,
      );
    }

    if (query.isActive !== undefined) {
      supabaseQuery = supabaseQuery.eq("is_active", query.isActive);
    } else {
      // Default to active agents only
      supabaseQuery = supabaseQuery.eq("is_active", true);
    }

    // Apply ordering
    const orderBy = query.orderBy || "created_at";
    const orderDirection = query.orderDirection || "desc";
    supabaseQuery = supabaseQuery.order(orderBy, {
      ascending: orderDirection === "asc",
    });

    // Apply pagination
    if (query.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit);
    }

    if (query.offset) {
      supabaseQuery = supabaseQuery.range(
        query.offset,
        query.offset + (query.limit || 10) - 1,
      );
    }

    // Execute the query
    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error("❌ Error querying deployed agents:", error);
      return { data: null, error, count: 0 };
    }

    console.log(
      `✅ Found ${data?.length || 0} deployed agents (total: ${count})`,
    );

    if (data && data.length > 0) {
      console.log("📊 Sample agent:", {
        id: data[0].id,
        name: data[0].name,
        network: data[0].deployment_network_name,
        status: data[0].deployment_status,
      });
    }

    return { data, error: null, count: count || 0 };
  } catch (error) {
    console.error("❌ Exception querying deployed agents:", error);
    return { data: null, error, count: 0 };
  }
}

/**
 * Query a single deployed agent by ID
 * @param id - Agent ID
 * @returns Single deployed agent or null
 */
export async function queryDeployedAgentById(
  id: string,
): Promise<{ data: DeployedAgentResult | null; error: any }> {
  try {
    console.log(`🔍 Querying agent by ID: ${id}`);

    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`❌ Error querying agent ${id}:`, error);
      return { data: null, error };
    }

    console.log(`✅ Found agent:`, data?.name);
    return { data, error: null };
  } catch (error) {
    console.error(`❌ Exception querying agent ${id}:`, error);
    return { data: null, error };
  }
}

/**
 * Query agents by network
 * @param network - Network name (e.g., "Polygon Amoy", "Hedera Testnet")
 * @returns Array of deployed agents on the specified network
 */
export async function queryAgentsByNetwork(
  network: string,
): Promise<{ data: DeployedAgentResult[] | null; error: any }> {
  try {
    console.log(`🔍 Querying agents on network: ${network}`);

    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("deployment_network_name", network)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`❌ Error querying agents on ${network}:`, error);
      return { data: null, error };
    }

    console.log(`✅ Found ${data?.length || 0} agents on ${network}`);
    return { data, error: null };
  } catch (error) {
    console.error(`❌ Exception querying agents on ${network}:`, error);
    return { data: null, error };
  }
}

/**
 * Query agents by owner wallet
 * @param wallet - Agent identity wallet address
 * @returns Array of deployed agents owned by the wallet
 */
export async function queryAgentsByOwner(
  wallet: string,
): Promise<{ data: DeployedAgentResult[] | null; error: any }> {
  try {
    console.log(`🔍 Querying agents owned by: ${wallet}`);

    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("agent_identity_wallet", wallet)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`❌ Error querying agents for wallet ${wallet}:`, error);
      return { data: null, error };
    }

    console.log(`✅ Found ${data?.length || 0} agents for wallet ${wallet}`);
    return { data, error: null };
  } catch (error) {
    console.error(`❌ Exception querying agents for wallet ${wallet}:`, error);
    return { data: null, error };
  }
}

/**
 * Query agents near a location
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param radiusKm - Search radius in kilometers (default: 10)
 * @returns Array of deployed agents near the location
 */
export async function queryAgentsNearLocation(
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
): Promise<{ data: DeployedAgentResult[] | null; error: any }> {
  try {
    console.log(
      `🔍 Querying agents near location: ${latitude}, ${longitude} (radius: ${radiusKm}km)`,
    );

    // Get all active agents (we'll filter by distance in JS for simplicity)
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("❌ Error querying agents near location:", error);
      return { data: null, error };
    }

    // Filter by distance (simple Haversine approximation)
    const filtered = data?.filter((agent) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        agent.latitude,
        agent.longitude,
      );
      return distance <= radiusKm;
    });

    console.log(
      `✅ Found ${filtered?.length || 0} agents within ${radiusKm}km`,
    );
    return { data: filtered || [], error: null };
  } catch (error) {
    console.error("❌ Exception querying agents near location:", error);
    return { data: null, error };
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get agent statistics
 * @returns Statistics about deployed agents
 */
export async function getAgentStatistics(): Promise<{
  data: {
    total: number;
    active: number;
    inactive: number;
    byNetwork: Record<string, number>;
  } | null;
  error: any;
}> {
  try {
    console.log("📊 Fetching agent statistics...");

    const { data, error } = await supabase
      .from("deployed_objects")
      .select("deployment_network_name, is_active");

    if (error) {
      console.error("❌ Error fetching agent statistics:", error);
      return { data: null, error };
    }

    const stats = {
      total: data?.length || 0,
      active: data?.filter((a) => a.is_active).length || 0,
      inactive: data?.filter((a) => !a.is_active).length || 0,
      byNetwork: {} as Record<string, number>,
    };

    // Count by network
    data?.forEach((agent) => {
      const network = agent.deployment_network_name || "Unknown";
      stats.byNetwork[network] = (stats.byNetwork[network] || 0) + 1;
    });

    console.log("✅ Agent statistics:", stats);
    return { data: stats, error: null };
  } catch (error) {
    console.error("❌ Exception fetching agent statistics:", error);
    return { data: null, error };
  }
}
