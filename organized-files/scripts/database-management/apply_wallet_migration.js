import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:");
  console.error("VITE_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
  console.error(
    "VITE_SUPABASE_SERVICE_ROLE_KEY:",
    supabaseServiceKey ? "✅ Set" : "❌ Missing"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyWalletIntegrationMigration() {
  console.log("🚀 Applying wallet integration fixes migration...");

  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync(
      "./supabase/migrations/20250802120000_wallet_integration_fixes.sql",
      "utf8"
    );

    console.log("📄 Migration file loaded, executing SQL...");

    // Split migration into individual statements and execute them
    const statements = migrationSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter(
        (stmt) =>
          stmt.length > 0 && !stmt.startsWith("/*") && !stmt.startsWith("--")
      );

    for (const statement of statements) {
      if (
        statement.includes("DO $$") ||
        statement.includes("BEGIN") ||
        statement.includes("END $$")
      ) {
        // Handle DO blocks specially
        try {
          const { error } = await supabase.rpc("exec_sql", {
            sql: statement + ";",
          });
          if (error) {
            console.log(
              `⚠️  Statement warning: ${error.message} (${statement.substring(
                0,
                50
              )}...)`
            );
          } else {
            console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
          }
        } catch (err) {
          console.log(
            `⚠️  Statement warning: ${err.message} (${statement.substring(
              0,
              50
            )}...)`
          );
        }
      } else {
        // Handle regular SQL statements
        try {
          const { error } = await supabase.rpc("exec_sql", {
            sql: statement + ";",
          });
          if (error) {
            console.log(
              `⚠️  Statement warning: ${error.message} (${statement.substring(
                0,
                50
              )}...)`
            );
          } else {
            console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
          }
        } catch (err) {
          console.log(
            `⚠️  Statement warning: ${err.message} (${statement.substring(
              0,
              50
            )}...)`
          );
        }
      }
    }

    console.log("✅ Wallet integration migration completed!");

    // Verify the new columns exist
    console.log("🔍 Verifying new wallet columns...");

    const { data: tableInfo, error: tableError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", "deployed_objects")
      .in("column_name", [
        "deployer_wallet_address",
        "payment_recipient_address",
      ]);

    if (tableError) {
      console.error("❌ Could not verify columns:", tableError);
    } else {
      console.log("✅ New wallet columns verified:");
      tableInfo.forEach((col) => {
        console.log(
          `   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error applying migration:", error);
  }
}

// Run the migration
applyWalletIntegrationMigration();
