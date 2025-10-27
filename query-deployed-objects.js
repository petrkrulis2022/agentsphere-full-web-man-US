import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Querying all deployed objects (agents) from database...");
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

async function queryAllDeployedObjects() {
  try {
    console.log("📡 Fetching all deployed objects...");

    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase Error:", error);
      return;
    }

    console.log("✅ Query successful!");
    console.log(`📊 Total deployed objects found: ${data.length}`);

    if (data.length > 0) {
      console.log("\n🤖 Deployed Objects (Agents) Details:");
      data.forEach((obj, index) => {
        console.log(`\n--- Object ${index + 1} ---`);
        console.log(`ID: ${obj.id}`);
        console.log(`Name: ${obj.name}`);
        console.log(`Type: ${obj.object_type || "N/A"}`);
        console.log(`Network: ${obj.network}`);
        console.log(`Currency: ${obj.currency}`);
        console.log(
          `Location: ${
            obj.location ? `${obj.location.lat}, ${obj.location.lng}` : "N/A"
          }`
        );
        console.log(`Created: ${obj.created_at}`);
        console.log(`Updated: ${obj.updated_at}`);
        console.log(`Model URL: ${obj.model_url || "N/A"}`);
        console.log(`Wallet Address: ${obj.wallet_address || "N/A"}`);
        console.log(`Contract Address: ${obj.contract_address || "N/A"}`);
        console.log(`Status: ${obj.status || "N/A"}`);

        // Show deployment and interaction fees if available
        if (obj.deployment_fee !== undefined) {
          console.log(`Deployment Fee: ${obj.deployment_fee}`);
        }
        if (obj.interaction_fee !== undefined) {
          console.log(`Interaction Fee: ${obj.interaction_fee}`);
        }
      });

      // Summary by network
      const networkCounts = data.reduce((acc, obj) => {
        acc[obj.network] = (acc[obj.network] || 0) + 1;
        return acc;
      }, {});

      console.log("\n📈 Summary by Network:");
      Object.entries(networkCounts).forEach(([network, count]) => {
        console.log(`${network}: ${count} objects`);
      });
    } else {
      console.log("📭 No deployed objects found in database");
    }
  } catch (err) {
    console.error("💥 Query failed:", err);
  }
}

queryAllDeployedObjects();
