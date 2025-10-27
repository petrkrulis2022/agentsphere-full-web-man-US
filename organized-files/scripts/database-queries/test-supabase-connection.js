import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Testing Supabase connection...");
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

async function testConnection() {
  try {
    console.log("📡 Testing database connection...");

    const { data, error } = await supabase
      .from("deployed_objects")
      .select("id, name, created_at")
      .limit(1);

    if (error) {
      console.error("❌ Supabase Error:", error);
      return;
    }

    console.log("✅ Connection successful!");
    console.log("📊 Sample data:", data);
  } catch (err) {
    console.error("💥 Connection failed:", err);
  }
}

testConnection();
