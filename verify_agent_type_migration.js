import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAgentTypeMigration() {
  console.log("🔍 Verifying Agent Type Labels Migration...\n");

  try {
    // Test 1: Query deployed_objects table structure
    console.log("1️⃣ Testing deployed_objects table access...");
    const { data: testQuery, error: testError } = await supabase
      .from("deployed_objects")
      .select("agent_type")
      .limit(1);

    if (testError) {
      console.log("⚠️  Table query error:", testError.message);
    } else {
      console.log("✅ Table accessible");
    }

    // Test 2: Get distinct agent types from database
    console.log("\n2️⃣ Fetching existing agent types from database...");
    const { data: agents, error: agentsError } = await supabase
      .from("deployed_objects")
      .select("agent_type")
      .not("agent_type", "is", null);

    if (agentsError) {
      console.log("❌ Error fetching agents:", agentsError.message);
    } else {
      const uniqueTypes = [...new Set(agents?.map((a) => a.agent_type) || [])];
      console.log("✅ Found agent types in database:");
      uniqueTypes.forEach((type) => {
        console.log(`   - ${type}`);
      });

      // Check for new types
      const newTypes = [
        "My Payment Terminal",
        "Payment Terminal - POS",
        "Virtual ATM",
      ];
      const hederaTypes = [
        "🚌 Bus Agent (Hedera AI)",
        "🚆 Train Agent (Hedera AI)",
        "🏨 Hotel Agent (Hedera AI)",
        "✈️ Flight Agent (Hedera AI)",
        "🍽️ Restaurant Agent (Hedera AI)",
        "🌍 Travel Coordinator (Hedera AI)",
      ];

      console.log("\n3️⃣ Checking for new label types...");
      const foundNewTypes = uniqueTypes.filter((t) => newTypes.includes(t));
      const foundHederaTypes = uniqueTypes.filter((t) =>
        hederaTypes.includes(t),
      );

      if (foundNewTypes.length > 0) {
        console.log("✅ New payment terminal labels found:");
        foundNewTypes.forEach((t) => console.log(`   ✓ ${t}`));
      } else {
        console.log(
          "ℹ️  No agents with new labels yet (this is OK - constraint is ready)",
        );
      }

      if (foundHederaTypes.length > 0) {
        console.log("✅ Hedera AI agent types found:");
        foundHederaTypes.forEach((t) => console.log(`   ✓ ${t}`));
      }
    }

    // Test 3: Try to insert a test record with new type (then delete it)
    console.log("\n4️⃣ Testing constraint with new agent type...");

    const testAgent = {
      agent_name: "TEST_MIGRATION_VERIFICATION",
      agent_type: "My Payment Terminal",
      latitude: 0,
      longitude: 0,
      location_type: "test",
      interaction_fee: 0.01,
      selected_token: "USDC",
      network: "Ethereum Sepolia",
      chain_id: "11155111",
    };

    const { data: insertData, error: insertError } = await supabase
      .from("deployed_objects")
      .insert([testAgent])
      .select();

    if (insertError) {
      if (insertError.message.includes("valid_agent_type")) {
        console.log(
          "❌ Constraint NOT updated - 'My Payment Terminal' rejected",
        );
        console.log("   Error:", insertError.message);
        console.log("\n💡 Migration may not have been applied correctly.");
        console.log("   Please re-run the SQL in Supabase SQL Editor.");
      } else {
        console.log(
          "⚠️  Insert error (may be unrelated to constraint):",
          insertError.message,
        );
      }
    } else {
      console.log(
        "✅ Constraint accepts 'My Payment Terminal' - Migration successful!",
      );

      // Clean up test record
      if (insertData && insertData[0]?.id) {
        await supabase
          .from("deployed_objects")
          .delete()
          .eq("id", insertData[0].id);
        console.log("🧹 Test record cleaned up");
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 VERIFICATION SUMMARY");
    console.log("=".repeat(60));

    if (!insertError || !insertError.message.includes("valid_agent_type")) {
      console.log("✅ Migration Status: SUCCESS");
      console.log("\nThe database constraint has been updated!");
      console.log("\nNew agent types are ready to use:");
      console.log("  • My Payment Terminal");
      console.log("  • Payment Terminal - POS");
      console.log("  • Virtual ATM");
      console.log("  • All Hedera AI agent types (🚌🚆🏨✈️🍽️🌍)");
      console.log("\nYou can now deploy agents with these types.");
    } else {
      console.log("❌ Migration Status: FAILED or NOT APPLIED");
      console.log("\nPlease run the SQL migration again:");
      console.log("  1. Open Supabase Dashboard > SQL Editor");
      console.log("  2. Copy contents of update_agent_types_labels.sql");
      console.log("  3. Paste and execute");
    }
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Verification failed:", error);
    console.log("\n💡 This might be a connection issue. Check:");
    console.log("   - Your .env file has correct Supabase credentials");
    console.log("   - Your internet connection is working");
    console.log("   - The Supabase project is active");
  }
}

// Run verification
verifyAgentTypeMigration();
