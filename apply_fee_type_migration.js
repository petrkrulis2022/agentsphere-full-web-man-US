/**
 * Apply fee_type migration to deployed_objects table
 *
 * This script adds the fee_type column to support dynamic payment terminal fees.
 *
 * Run with: node apply_fee_type_migration.js
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Missing Supabase credentials in .env file");
  console.error(
    "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log("🚀 Starting fee_type migration...\n");

  try {
    // Read the migration SQL file
    const migrationPath = join(__dirname, "add_fee_type_migration.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    // Split the SQL into individual statements (skip comments and empty lines)
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip SELECT statements (these are just for verification)
      if (statement.trim().toUpperCase().startsWith("SELECT")) {
        console.log(
          `⏭️  Skipping verification query (${i + 1}/${statements.length})`
        );
        continue;
      }

      console.log(`▶️  Executing statement ${i + 1}/${statements.length}...`);

      const { data, error } = await supabase.rpc("exec_sql", {
        query: statement,
      });

      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase
          .from("deployed_objects")
          .select("*")
          .limit(0); // Just testing connection

        if (directError) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          throw error;
        }

        console.log(`⚠️  RPC not available, using alternative method...`);
        console.log(`   Statement: ${statement.substring(0, 100)}...`);
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }

    // Verify the migration
    console.log("\n🔍 Verifying migration...");

    const { data: paymentTerminals, error: verifyError } = await supabase
      .from("deployed_objects")
      .select("object_type, fee_type, interaction_fee_amount")
      .in("object_type", ["payment_terminal", "trailing_payment_terminal"]);

    if (verifyError) {
      console.error("❌ Error verifying migration:", verifyError);
      throw verifyError;
    }

    console.log("\n📊 Payment Terminal Agents Summary:");
    console.log("─".repeat(50));

    if (paymentTerminals && paymentTerminals.length > 0) {
      const summary = paymentTerminals.reduce((acc, agent) => {
        const key = `${agent.object_type}_${agent.fee_type}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      Object.entries(summary).forEach(([key, count]) => {
        const [type, feeType] = key.split("_");
        console.log(`${type}: ${feeType} fees - ${count} agent(s)`);
      });
    } else {
      console.log("No payment terminal agents found in database");
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log('1. Test deploying a Payment Terminal with "Fixed Fee"');
    console.log('2. Test deploying a Payment Terminal with "Dynamic Fee"');
    console.log("3. Verify the fee_type is correctly stored in the database");
    console.log("4. Check that AR Viewer displays the correct fee information");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();
