import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyIdentityMigration() {
  console.log("🚀 Applying agent_identity migration...\n");

  try {
    // Read the migration file
    const migrationSql = fs.readFileSync(
      "./migrations/add_agent_identity_field.sql",
      "utf8"
    );

    // Split into individual statements (basic split, adjust if needed)
    const statements = migrationSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      console.log(`SQL: ${statement.substring(0, 100)}...`);

      const { data, error } = await supabase.rpc("exec_sql", {
        sql: statement,
      });

      if (error) {
        // Try direct execution for Supabase
        console.log("⚠️  RPC method not available, trying alternative...");
        console.log(
          "📋 Please execute this SQL manually in Supabase SQL Editor:"
        );
        console.log("\n" + "=".repeat(60));
        console.log(migrationSql);
        console.log("=".repeat(60) + "\n");
        break;
      } else {
        console.log("✅ Statement executed successfully");
      }
    }

    // Query to verify the migration
    console.log("\n🔍 Verifying migration results...\n");

    const { data: agents, error: queryError } = await supabase
      .from("deployed_objects")
      .select(
        "id, name, object_type, agent_identity, hedera_nft_id, hedera_account_id"
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (queryError) {
      console.error("❌ Error querying agents:", queryError);
      return;
    }

    console.log("📊 Sample agents with identities:\n");
    agents.forEach((agent, idx) => {
      console.log(`${idx + 1}. ${agent.name} (${agent.object_type})`);
      console.log(`   Identity: ${agent.agent_identity || "Not set"}`);
      if (agent.hedera_account_id) {
        console.log(`   Hedera Account: ${agent.hedera_account_id}`);
      }
      if (agent.hedera_nft_id) {
        console.log(`   NFT ID: ${agent.hedera_nft_id}`);
      }
      console.log("");
    });

    const withIdentity = agents.filter((a) => a.agent_identity).length;
    console.log(`\n✅ Migration summary:`);
    console.log(`   Total agents checked: ${agents.length}`);
    console.log(`   Agents with identity: ${withIdentity}`);
    console.log(
      `   Coverage: ${((withIdentity / agents.length) * 100).toFixed(1)}%`
    );
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.log(
      "\n📋 Manual migration required. Copy this SQL to Supabase SQL Editor:\n"
    );
    console.log("=".repeat(60));
    const migrationSql = fs.readFileSync(
      "./migrations/add_agent_identity_field.sql",
      "utf8"
    );
    console.log(migrationSql);
    console.log("=".repeat(60));
  }
}

applyIdentityMigration();
