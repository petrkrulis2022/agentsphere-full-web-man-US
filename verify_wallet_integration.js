import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyWalletIntegration() {
  console.log("🔍 Verifying Wallet Integration Migration Results...");

  try {
    // 1. Verify new columns exist
    console.log("\n📋 1. Checking new wallet columns...");

    const { data: sampleData, error: structureError } = await supabase
      .from("deployed_objects")
      .select(
        "id, deployer_wallet_address, payment_recipient_address, agent_wallet_address, owner_wallet"
      )
      .limit(1);

    if (structureError) {
      console.error("❌ Error checking table structure:", structureError);
      return;
    }

    if (sampleData && sampleData.length > 0) {
      const columns = Object.keys(sampleData[0]);
      console.log("✅ New wallet columns verified:");
      columns.forEach((col) => {
        if (
          col.includes("wallet") ||
          col.includes("deployer") ||
          col.includes("payment")
        ) {
          console.log(`   ✓ ${col}`);
        }
      });
    }

    // 2. Check that constraints are working
    console.log("\n🔒 2. Testing wallet address constraints...");

    // Try to insert a record with invalid wallet address (should fail)
    const { error: constraintError } = await supabase
      .from("deployed_objects")
      .insert({
        name: "Test Agent - Invalid Wallet",
        agent_wallet_address: "invalid_address", // This should fail
        latitude: 0,
        longitude: 0,
        object_type: "test",
      });

    if (
      constraintError &&
      constraintError.message.includes("check constraint")
    ) {
      console.log("✅ Wallet address validation constraint is working!");
      console.log("   ✓ Invalid addresses are properly rejected");
    } else {
      console.log("⚠️  Constraint test result:", constraintError);
    }

    // 3. Check for any remaining invalid wallet addresses
    console.log("\n🧹 3. Verifying data cleanup...");

    const { data: invalidData, error: invalidError } = await supabase
      .from("deployed_objects")
      .select("id, name, agent_wallet_address")
      .not("agent_wallet_address", "is", null)
      .not("agent_wallet_address", "like", "0x%");

    if (invalidError) {
      console.error("❌ Error checking for invalid addresses:", invalidError);
    } else if (invalidData && invalidData.length > 0) {
      console.log("⚠️  Found remaining invalid addresses:");
      invalidData.forEach((row) => {
        console.log(`   - ${row.name}: ${row.agent_wallet_address}`);
      });
    } else {
      console.log("✅ No invalid wallet addresses found - data is clean!");
    }

    // 4. Check overall table health
    console.log("\n📊 4. Database integration status...");

    const { count: totalAgents, error: countError } = await supabase
      .from("deployed_objects")
      .select("*", { count: "exact", head: true });

    if (!countError) {
      console.log(`✅ Total agents in database: ${totalAgents}`);
    }

    const { count: validWallets, error: validError } = await supabase
      .from("deployed_objects")
      .select("*", { count: "exact", head: true })
      .like("agent_wallet_address", "0x%");

    if (!validError) {
      console.log(
        `✅ Agents with valid wallet addresses: ${validWallets || 0}`
      );
    }

    console.log("\n🎉 Wallet Integration Verification Complete!");
    console.log("\n📝 Ready for testing:");
    console.log("   1. Open AgentSphere at http://localhost:5173");
    console.log("   2. Connect your wallet");
    console.log("   3. Deploy a test agent");
    console.log("   4. Verify real wallet addresses are captured");
  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
}

verifyWalletIntegration();
