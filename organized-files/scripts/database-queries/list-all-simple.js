import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("📋 Fetching complete list of all deployed objects...");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAllObjects() {
  try {
    const { data: allObjects, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching objects:", error);
      return;
    }

    console.log(
      `📊 COMPLETE LIST OF ALL ${allObjects?.length || 0} DEPLOYED OBJECTS:`
    );
    console.log(
      "═══════════════════════════════════════════════════════════════"
    );

    allObjects?.forEach((obj, index) => {
      const status = obj.is_active ? "✅" : "❌";
      const date = new Date(obj.created_at).toLocaleDateString();
      const time = new Date(obj.created_at).toLocaleTimeString();
      const location =
        obj.latitude && obj.longitude
          ? `📍 ${obj.latitude.toFixed(4)}, ${obj.longitude.toFixed(4)}`
          : "📍 No location";
      const network = obj.network || obj.chain_id || "Unknown";
      const token = obj.token_symbol || "N/A";

      console.log(`\n${index + 1}. ${status} ${obj.name}`);
      console.log(`   📅 Created: ${date} at ${time}`);
      console.log(`   ${location}`);
      console.log(`   🔗 Network: ${network} | 💰 Token: ${token}`);
      if (obj.contract_address) {
        console.log(`   📄 Contract: ${obj.contract_address}`);
      }
      console.log(`   🆔 ID: ${obj.id}`);
    });

    console.log(
      "\n═══════════════════════════════════════════════════════════════"
    );
    console.log("📈 SUMMARY:");
    console.log(`📦 Total Objects: ${allObjects?.length || 0}`);
    console.log(
      `✅ Active: ${allObjects?.filter((obj) => obj.is_active).length || 0}`
    );
  } catch (err) {
    console.error("💥 Failed to fetch objects:", err);
  }
}

listAllObjects();
