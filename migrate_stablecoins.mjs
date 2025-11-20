/**
 * Direct Database Migration - Add Custom Stablecoins
 * Executes SQL directly using Supabase client
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log("\n🚀 Running Custom Stablecoins Migration...\n");

  try {
    // Execute raw SQL using the from() method with a custom query
    // We'll use the Supabase REST API directly

    const migrations = [
      {
        name: "Drop old currency_type constraint",
        sql: "ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_currency_type",
      },
      {
        name: "Add new currency_type constraint with 7 stablecoins",
        sql: `ALTER TABLE deployed_objects ADD CONSTRAINT valid_currency_type 
CHECK (
  (currency_type IS NULL) OR 
  (currency_type = ANY (ARRAY[
    'USDFC'::text, 'AURAS'::text, 'BDAG'::text,
    'SOL'::text, 'ETH'::text, 'MATIC'::text, 'AVAX'::text,
    'USDT'::text, 'USDC'::text, 'USDs'::text, 'DAI'::text,
    'USDBG+'::text, 'USDe'::text, 'PYUSD'::text, 'RLUSD'::text,
    'USDD'::text, 'GHO'::text, 'USDx'::text,
    'USDh'::text, 'USDΔ'::text, 'USDaix'::text, 
    'USDΔ+'::text, 'USDaix+'::text, 'USDar'::text, 'USDair'::text
  ]))
)`,
      },
      {
        name: "Drop old interaction_fee_token constraint",
        sql: "ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_interaction_fee_token",
      },
      {
        name: "Add new interaction_fee_token constraint",
        sql: `ALTER TABLE deployed_objects ADD CONSTRAINT valid_interaction_fee_token 
CHECK (
  (interaction_fee_token IS NULL) OR 
  (interaction_fee_token = ANY (ARRAY[
    'SOL'::text, 'USDC'::text, 'USDT'::text, 'DAI'::text,
    'USDh'::text, 'USDΔ'::text, 'USDaix'::text, 
    'USDΔ+'::text, 'USDaix+'::text, 'USDar'::text, 'USDair'::text,
    'USDFC'::text, 'AURAS'::text, 'BDAG'::text
  ]))
)`,
      },
    ];

    for (const migration of migrations) {
      console.log(`⏳ ${migration.name}...`);

      // Use fetch to call Supabase REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ query: migration.sql }),
      });

      if (!response.ok) {
        // If RPC doesn't work, print manual instructions
        console.log("❌ Automated execution not available\n");
        console.log("📋 Please run this SQL manually in Supabase Dashboard:\n");
        console.log(
          "🔗 https://supabase.com/dashboard/project/ncjbwzibnqrbrvicdmec/sql\n"
        );
        console.log(
          "Copy and paste from: add_custom_stablecoins_migration.sql\n"
        );
        process.exit(1);
      }

      console.log(`✅ ${migration.name} - Done\n`);
    }

    console.log("✅ Migration completed successfully!\n");
    console.log("📋 Added 7 custom stablecoins:");
    console.log("   • USDh, USDΔ, USDaix, USDΔ+, USDaix+, USDar, USDair\n");
    console.log("🎯 You can now deploy agents with these tokens!\n");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.log("\n📋 Manual SQL Execution Required:\n");
    console.log(
      "1. Open: https://supabase.com/dashboard/project/ncjbwzibnqrbrvicdmec/sql"
    );
    console.log("2. Copy SQL from: add_custom_stablecoins_migration.sql");
    console.log("3. Click RUN\n");
    process.exit(1);
  }
}

runMigration();
