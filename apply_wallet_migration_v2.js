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
    // Apply individual migration statements using direct queries
    console.log("📄 Adding deployer_wallet_address column...");

    // Add deployer_wallet_address column
    const { error: deployerColError } = await supabase.rpc("exec", {
      sql: `ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS deployer_wallet_address VARCHAR(42);`,
    });

    if (deployerColError) {
      console.log(
        "⚠️  deployer_wallet_address column may already exist:",
        deployerColError.message
      );
    } else {
      console.log("✅ deployer_wallet_address column added");
    }

    // Add payment_recipient_address column
    console.log("📄 Adding payment_recipient_address column...");
    const { error: paymentColError } = await supabase.rpc("exec", {
      sql: `ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS payment_recipient_address VARCHAR(42);`,
    });

    if (paymentColError) {
      console.log(
        "⚠️  payment_recipient_address column may already exist:",
        paymentColError.message
      );
    } else {
      console.log("✅ payment_recipient_address column added");
    }

    // Try to verify columns by checking the deployed_objects table structure
    console.log("🔍 Verifying new wallet columns...");

    const { data: sampleData, error: verifyError } = await supabase
      .from("deployed_objects")
      .select("id, deployer_wallet_address, payment_recipient_address")
      .limit(1);

    if (verifyError) {
      console.error("❌ Could not verify columns:", verifyError);
    } else {
      console.log("✅ New wallet columns verified successfully!");
      if (sampleData && sampleData.length > 0) {
        console.log("Sample data structure:", Object.keys(sampleData[0]));
      }
    }

    console.log("✅ Wallet integration migration completed successfully!");
  } catch (error) {
    console.error("❌ Error applying migration:", error);
  }
}

// Run the migration
applyWalletIntegrationMigration();
