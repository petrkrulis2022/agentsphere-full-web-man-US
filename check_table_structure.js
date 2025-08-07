import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
  console.log("🔍 Checking deployed_objects table structure...");

  try {
    // Get a sample record to see current column structure
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Error querying table:", error);
      return;
    }

    if (data && data.length > 0) {
      console.log("✅ Current deployed_objects table columns:");
      const columns = Object.keys(data[0]);
      columns.forEach((col, index) => {
        const hasWallet =
          col.includes("wallet") ||
          col.includes("deployer") ||
          col.includes("payment");
        console.log(`   ${index + 1}. ${col}${hasWallet ? " 🔑" : ""}`);
      });

      // Check specifically for wallet-related columns
      const walletColumns = columns.filter(
        (col) =>
          col.includes("wallet") ||
          col.includes("deployer") ||
          col.includes("payment")
      );

      console.log("\n🔑 Wallet-related columns found:");
      walletColumns.forEach((col) => {
        console.log(`   ✓ ${col}`);
      });

      // Check if we need to add new columns
      const needsDeployer = !columns.includes("deployer_wallet_address");
      const needsPayment = !columns.includes("payment_recipient_address");

      console.log("\n📋 Migration status:");
      console.log(
        `   deployer_wallet_address: ${
          needsDeployer ? "❌ Missing" : "✅ Exists"
        }`
      );
      console.log(
        `   payment_recipient_address: ${
          needsPayment ? "❌ Missing" : "✅ Exists"
        }`
      );

      if (needsDeployer || needsPayment) {
        console.log(
          "\n🚨 Migration required! Use Supabase Dashboard SQL Editor with:"
        );
        console.log("   File: wallet_migration_manual.sql");
      }
    } else {
      console.log("⚠️  No data found in deployed_objects table");
    }
  } catch (error) {
    console.error("❌ Error checking table structure:", error);
  }
}

checkTableStructure();
