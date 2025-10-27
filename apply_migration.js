import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Supabase client with service role key from environment
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://ncjbwzibnqrbrvicdmec.supabase.co";
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error(
    "❌ VITE_SUPABASE_SERVICE_ROLE_KEY environment variable is required"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log("🚀 Starting AgentSphere database migration...");

  try {
    // Step 1: Test connection and check existing structure
    console.log("📝 Checking current table structure...");

    const { data: existingData, error: selectError } = await supabase
      .from("deployed_objects")
      .select("*")
      .limit(1);

    if (selectError) {
      console.error("❌ Error accessing table:", selectError);
      return;
    }

    console.log("✅ Database connection successful");
    console.log(
      "📊 Current table accessed, proceeding with manual column addition..."
    );

    // Since we can't execute DDL directly, let's check what columns exist
    if (existingData && existingData.length > 0) {
      const existingColumns = Object.keys(existingData[0]);
      console.log("📋 Existing columns:", existingColumns);

      const requiredColumns = [
        "token_address",
        "token_symbol",
        "chain_id",
        "altitude",
      ];
      const missingColumns = requiredColumns.filter(
        (col) => !existingColumns.includes(col)
      );

      if (missingColumns.length > 0) {
        console.log("⚠️  Missing columns:", missingColumns);
        console.log(
          "🔧 Please apply the migration manually via Supabase Dashboard"
        );
        console.log("📋 Required SQL:");
        console.log(`
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS token_address VARCHAR(42);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS token_symbol VARCHAR(10);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS chain_id INTEGER;
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS altitude DECIMAL(10,6);
        `);
      } else {
        console.log("✅ All required columns exist!");

        // Try to update existing records
        console.log("📝 Updating existing records with default values...");

        const { data: updateData, error: updateError } = await supabase
          .from("deployed_objects")
          .update({
            chain_id: 2810,
            token_address: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
            token_symbol: "USDT",
            altitude: 0.0,
          })
          .is("chain_id", null);

        if (updateError) {
          console.error("❌ Error updating records:", updateError);
        } else {
          console.log("✅ Records updated successfully");
        }
      }
    }

    console.log("🎯 Next step: Test agent deployment!");
  } catch (error) {
    console.error("💥 Migration check failed:", error);
  }
}

applyMigration();
