/**
 * Apply Custom Stablecoins Migration
 * Adds 7 new ERC-20 stablecoins to the deployed_objects table constraints
 * Stablecoins: USDh, USDΔ, USDaix, USDΔ+, USDaix+, USDar, USDair
 */

console.log("");
console.log(
  "╔════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║   CUSTOM STABLECOINS DATABASE MIGRATION                       ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝"
);
console.log("");
console.log("⚠️  This script requires manual SQL execution in Supabase");
console.log("");
console.log("📋 INSTRUCTIONS:");
console.log("");
console.log("1. Open Supabase SQL Editor:");
console.log(
  "   https://supabase.com/dashboard/project/ncjbwzibnqrbrvicdmec/sql"
);
console.log("");
console.log(
  "2. Copy and paste the SQL from: add_custom_stablecoins_migration.sql"
);
console.log("");
console.log('3. Click "Run" to execute the migration');
console.log("");
console.log("────────────────────────────────────────────────────────────────");
console.log("");
console.log("📝 WHAT THIS MIGRATION DOES:");
console.log("");
console.log("✅ Adds 7 new stablecoins to valid_currency_type constraint:");
console.log("   • USDh    - USD Hedera (Primary)");
console.log("   • USDΔ    - USD Delta");
console.log("   • USDaix  - USD Aix");
console.log("   • USDΔ+   - USD Delta Plus");
console.log("   • USDaix+ - USD Aix Plus");
console.log("   • USDar   - USD AR");
console.log("   • USDair  - USD Air");
console.log("");
console.log("✅ Updates valid_interaction_fee_token constraint");
console.log("");
console.log("✅ Removes HBAR (native token) from constraints");
console.log("");
console.log("────────────────────────────────────────────────────────────────");
console.log("");
console.log("🎯 AFTER MIGRATION:");
console.log("");
console.log("You will be able to deploy agents with these tokens on:");
console.log("   • Hedera Testnet (Chain ID 296)");
console.log("   • Ethereum Sepolia");
console.log("   • Arbitrum Sepolia");
console.log("   • Base Sepolia");
console.log("   • OP Sepolia");
console.log("   • Avalanche Fuji");
console.log("   • Polygon Amoy");
console.log("");
console.log("════════════════════════════════════════════════════════════════");
console.log("");

// Quick SQL preview
console.log("📄 SQL PREVIEW (first 20 lines):");
console.log("");
console.log(
  "ALTER TABLE deployed_objects DROP CONSTRAINT IF EXISTS valid_currency_type;"
);
console.log(
  "ALTER TABLE deployed_objects ADD CONSTRAINT valid_currency_type CHECK ("
);
console.log("  (currency_type IS NULL) OR (currency_type = ANY (ARRAY[");
console.log("    -- Legacy currencies");
console.log("    'USDFC'::text, 'AURAS'::text, 'BDAG'::text,");
console.log("    -- Native tokens");
console.log("    'SOL'::text, 'ETH'::text, 'MATIC'::text, 'AVAX'::text,");
console.log("    -- Standard Stablecoins");
console.log("    'USDT'::text, 'USDC'::text, 'USDs'::text, 'DAI'::text,");
console.log("    'USDBG+'::text, 'USDe'::text, 'PYUSD'::text, 'RLUSD'::text,");
console.log("    'USDD'::text, 'GHO'::text, 'USDx'::text,");
console.log("    -- Custom Stablecoins (ERC-20) ⭐ NEW");
console.log("    'USDh'::text, 'USDΔ'::text, 'USDaix'::text,");
console.log(
  "    'USDΔ+'::text, 'USDaix+'::text, 'USDar'::text, 'USDair'::text"
);
console.log("  ]))");
console.log(");");
console.log("");
console.log("... (see full SQL in add_custom_stablecoins_migration.sql)");
console.log("");
console.log("════════════════════════════════════════════════════════════════");
console.log("");
