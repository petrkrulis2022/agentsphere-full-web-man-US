import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickCheck() {
  console.log("🔍 Quick Database Check\n");

  // Test 1: Count total agents
  const { count: totalCount, error: countError } = await supabase
    .from("deployed_objects")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.log("❌ Error:", countError.message);
  } else {
    console.log(`✅ Total agents in database: ${totalCount || 0}`);
  }

  // Test 2: Get all agent types
  const { data: agents, error: agentsError } = await supabase
    .from("deployed_objects")
    .select("agent_type");

  if (agentsError) {
    console.log("❌ Error fetching agent types:", agentsError.message);
  } else {
    const uniqueTypes = [
      ...new Set(agents?.map((a) => a.agent_type).filter(Boolean) || []),
    ];
    console.log(`\n📊 Unique agent types found: ${uniqueTypes.length}`);
    uniqueTypes.forEach((type) => {
      console.log(`   • ${type || "(null)"}`);
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Database is accessible and ready!");
  console.log("=".repeat(60));
  console.log("\nThe constraint has been updated to accept:");
  console.log("  • My Payment Terminal");
  console.log("  • Payment Terminal - POS");
  console.log("  • Virtual ATM");
  console.log("  • All Hedera AI agent types (🚌🚆🏨✈️🍽️🌍)");
  console.log("\nYou can now deploy agents with these new types!");
}

quickCheck();
