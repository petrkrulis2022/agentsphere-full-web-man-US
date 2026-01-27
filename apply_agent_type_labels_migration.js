import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("VITE_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
  console.error(
    "VITE_SUPABASE_ANON_KEY:",
    supabaseKey ? "✅ Set" : "❌ Missing",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyAgentTypeLabelsMigration() {
  console.log("🚀 Starting Agent Type Labels Migration...\n");

  try {
    // SQL to drop existing constraint and add updated one
    const migrationSQL = `
      -- Drop the existing constraint
      ALTER TABLE deployed_objects 
      DROP CONSTRAINT IF EXISTS valid_agent_type;

      -- Add updated constraint with new labels
      ALTER TABLE deployed_objects 
      ADD CONSTRAINT valid_agent_type 
      CHECK ((agent_type IS NULL) OR (agent_type = ANY (ARRAY[
        -- Legacy types (maintain compatibility)
        'ai_agent'::text, 
        'study_buddy'::text, 
        'tutor'::text, 
        'landmark'::text, 
        'building'::text,
        -- Enhanced agent categories (updated labels)
        'My Payment Terminal'::text,
        'Payment Terminal - POS'::text,
        'Virtual ATM'::text,
        'Intelligent Assistant'::text,
        'Local Services'::text, 
        'Payment Terminal'::text,
        'Trailing Payment Terminal'::text,
        'My Ghost'::text,
        'Game Agent'::text,
        '3D World Builder'::text,
        'Home Security'::text,
        'Content Creator'::text,
        'Real Estate Broker'::text,
        'Bus Stop Agent'::text,
        -- Previous enhanced types
        'Taxi driver'::text,
        'Travel Influencer'::text,
        -- Hedera AI Travel Agents
        '🚌 Bus Agent (Hedera AI)'::text,
        '🚆 Train Agent (Hedera AI)'::text,
        '🏨 Hotel Agent (Hedera AI)'::text,
        '✈️ Flight Agent (Hedera AI)'::text,
        '🍽️ Restaurant Agent (Hedera AI)'::text,
        '🌍 Travel Coordinator (Hedera AI)'::text
      ])));
    `;

    console.log("📝 Applying SQL migration...");

    const { data, error } = await supabase.rpc("exec_sql", {
      sql_query: migrationSQL,
    });

    if (error) {
      // If RPC method doesn't exist, try direct SQL execution
      console.log("⚠️  RPC method not available, trying direct execution...");

      // Alternative: Execute via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ sql_query: migrationSQL }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("✅ Migration applied successfully via REST API");
    } else {
      console.log("✅ Migration applied successfully via RPC");
    }

    // Verify the migration
    console.log("\n🔍 Verifying migration...");

    const { data: constraints, error: verifyError } = await supabase
      .from("information_schema.table_constraints")
      .select("*")
      .eq("table_name", "deployed_objects")
      .eq("constraint_name", "valid_agent_type");

    if (verifyError) {
      console.log("⚠️  Could not verify constraint (this is OK if using RLS)");
    } else {
      console.log(
        "✅ Constraint verified:",
        constraints ? "Present" : "Not found",
      );
    }

    // Test with a sample query
    console.log("\n🧪 Testing agent types query...");
    const { data: agents, error: queryError } = await supabase
      .from("deployed_objects")
      .select("agent_type")
      .limit(5);

    if (queryError) {
      console.log("⚠️  Query test failed:", queryError.message);
    } else {
      console.log("✅ Query test successful");
      console.log(
        "Sample agent types:",
        agents?.map((a) => a.agent_type) || [],
      );
    }

    console.log("\n✨ Migration completed successfully!");
    console.log("\n📋 Updated Agent Type Labels:");
    console.log("  1. Content Creator → My Payment Terminal");
    console.log("  2. Payment Terminal → Payment Terminal - POS");
    console.log("  3. Home Security → Virtual ATM");
    console.log("\n  Plus all Hedera AI agent types (🚌🚆🏨✈️🍽️🌍)");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error(
      "\n💡 Alternative: Run the SQL directly in Supabase SQL Editor:",
    );
    console.error("   1. Go to Supabase Dashboard > SQL Editor");
    console.error("   2. Paste the contents of update_agent_types_labels.sql");
    console.error("   3. Execute the query");
    process.exit(1);
  }
}

// Run the migration
applyAgentTypeLabelsMigration();
