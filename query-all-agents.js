import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Querying all agents from database...");
console.log("URL:", supabaseUrl);
console.log(
  "Anon Key (first 20 chars):",
  supabaseAnonKey?.substring(0, 20) + "..."
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function queryAllAgents() {
  try {
    console.log("📡 Fetching all agents...");

    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase Error:", error);
      return;
    }

    console.log("✅ Query successful!");
    console.log(`📊 Total agents found: ${data.length}`);

    if (data.length > 0) {
      console.log("\n🤖 Agent Details:");
      data.forEach((agent, index) => {
        console.log(`\n--- Agent ${index + 1} ---`);
        console.log(`ID: ${agent.id}`);
        console.log(`Name: ${agent.name}`);
        console.log(`Type: ${agent.agent_type}`);
        console.log(`Network: ${agent.network}`);
        console.log(`Currency: ${agent.currency}`);
        console.log(`Deployment Fee: ${agent.deployment_fee}`);
        console.log(`Interaction Fee: ${agent.interaction_fee}`);
        console.log(`Created: ${agent.created_at}`);
        console.log(`Wallet Address: ${agent.wallet_address}`);
        console.log(`Status: ${agent.status || "N/A"}`);
      });
    } else {
      console.log("📭 No agents found in database");
    }
  } catch (err) {
    console.error("💥 Query failed:", err);
  }
}

queryAllAgents();
