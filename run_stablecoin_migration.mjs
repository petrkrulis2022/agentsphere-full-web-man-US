/**
 * Run Custom Stablecoins Migration
 * Adds 7 new ERC-20 stablecoins to database constraints
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log("\n🚀 Starting Custom Stablecoins Migration...\n");

  try {
    // Step 1: Update currency_type constraint
    console.log("Step 1: Updating currency_type constraint...");

    const { data: data1, error: error1 } = await supabase.rpc("exec_sql", {
      query: `
        ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_currency_type;
        
        ALTER TABLE deployed_objects ADD CONSTRAINT valid_currency_type 
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
        );
      `,
    });

    if (error1) {
      console.error("❌ Error:", error1.message);
      console.log(
        "\n⚠️  Function may not exist. Use manual SQL execution instead."
      );
      console.log(
        "📝 Open: https://supabase.com/dashboard/project/ncjbwzibnqrbrvicdmec/sql"
      );
      console.log("📄 Copy SQL from: add_custom_stablecoins_migration.sql\n");
      process.exit(1);
    }

    console.log("✅ Currency type constraint updated\n");

    // Step 2: Update interaction_fee_token constraint
    console.log("Step 2: Updating interaction_fee_token constraint...");

    const { data: data2, error: error2 } = await supabase.rpc("exec_sql", {
      query: `
        ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_interaction_fee_token;
        
        ALTER TABLE deployed_objects ADD CONSTRAINT valid_interaction_fee_token 
        CHECK (
          (interaction_fee_token IS NULL) OR 
          (interaction_fee_token = ANY (ARRAY[
            'SOL'::text, 'USDC'::text, 'USDT'::text, 'DAI'::text,
            'USDh'::text, 'USDΔ'::text, 'USDaix'::text, 
            'USDΔ+'::text, 'USDaix+'::text, 'USDar'::text, 'USDair'::text,
            'USDFC'::text, 'AURAS'::text, 'BDAG'::text
          ]))
        );
      `,
    });

    if (error2) {
      console.error("❌ Error:", error2.message);
      process.exit(1);
    }

    console.log("✅ Interaction fee token constraint updated\n");

    console.log("✅ Migration completed successfully!\n");
    console.log("📋 Added 7 custom stablecoins:");
    console.log("   1. USDh    - USD Hedera (Primary)");
    console.log("   2. USDΔ    - USD Delta");
    console.log("   3. USDaix  - USD Aix");
    console.log("   4. USDΔ+   - USD Delta Plus");
    console.log("   5. USDaix+ - USD Aix Plus");
    console.log("   6. USDar   - USD AR");
    console.log("   7. USDair  - USD Air\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.log("\n💡 Use manual SQL execution:");
    console.log(
      "   1. Open: https://supabase.com/dashboard/project/ncjbwzibnqrbrvicdmec/sql"
    );
    console.log("   2. Copy SQL from: add_custom_stablecoins_migration.sql");
    console.log('   3. Click "Run"\n');
    process.exit(1);
  }
}

runMigration();
