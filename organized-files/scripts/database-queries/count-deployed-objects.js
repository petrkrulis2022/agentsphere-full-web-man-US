import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("📊 Counting deployed objects in database...");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countObjects() {
  try {
    // Get total count of all objects
    const { count: totalCount, error: totalError } = await supabase
      .from("deployed_objects")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      console.error("❌ Error counting total objects:", totalError);
      return;
    }

    // Get count of active objects
    const { count: activeCount, error: activeError } = await supabase
      .from("deployed_objects")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (activeError) {
      console.error("❌ Error counting active objects:", activeError);
      return;
    }

    // Get sample of recent objects
    const { data: recentObjects, error: recentError } = await supabase
      .from("deployed_objects")
      .select("id, name, created_at, is_active, latitude, longitude")
      .order("created_at", { ascending: false })
      .limit(10);

    if (recentError) {
      console.error("❌ Error fetching recent objects:", recentError);
      return;
    }

    console.log("📈 DEPLOYMENT STATISTICS:");
    console.log("═══════════════════════════");
    console.log(`📦 Total Objects: ${totalCount}`);
    console.log(`✅ Active Objects: ${activeCount}`);
    console.log(`❌ Inactive Objects: ${totalCount - activeCount}`);

    console.log("\n🕒 Recent Deployments:");
    console.log("═══════════════════════════");
    recentObjects?.forEach((obj, index) => {
      const status = obj.is_active ? "✅" : "❌";
      const date = new Date(obj.created_at).toLocaleDateString();
      console.log(`${index + 1}. ${status} ${obj.name} (${date})`);
    });
  } catch (err) {
    console.error("💥 Failed to count objects:", err);
  }
}

countObjects();
