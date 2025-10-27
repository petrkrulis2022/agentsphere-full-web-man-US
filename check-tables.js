import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log("🔍 Checking database tables...");
console.log("URL:", supabaseUrl);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  try {
    console.log("📡 Fetching table information...");

    // Query to get all tables in the public schema
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `,
    });

    if (error) {
      console.error("❌ Supabase Error:", error);

      // Alternative approach - try to list some common tables
      console.log("🔄 Trying alternative approach...");
      const tables = [
        "deployed_objects",
        "agents",
        "users",
        "payments",
        "transactions",
      ];

      for (const table of tables) {
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(table)
            .select("*")
            .limit(1);

          if (!tableError) {
            console.log(`✅ Table '${table}' exists`);
          }
        } catch (e) {
          console.log(
            `❌ Table '${table}' does not exist or is not accessible`
          );
        }
      }
      return;
    }

    console.log("✅ Query successful!");
    console.log(`📊 Available tables:`);

    if (data && data.length > 0) {
      data.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log("📭 No tables found");
    }
  } catch (err) {
    console.error("💥 Query failed:", err);
  }
}

checkTables();
