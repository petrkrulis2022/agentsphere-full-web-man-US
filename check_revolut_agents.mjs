// Get deployed agents with Revolut payment details
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Use environment variables from .env
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://ncjbwzibnqrbrvicdmec.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error("❌ VITE_SUPABASE_ANON_KEY environment variable is required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAgentsWithRevolutDetails() {
  try {
    console.log(
      "🔍 Checking deployed agents for Revolut payment configurations...\n"
    );

    const { data: agents, error } = await supabase
      .from("deployed_objects")
      .select(
        `
        id, name, agent_type, description,
        interaction_fee, interaction_fee_usdfc, token_symbol,
        payment_methods, payment_config,
        deployer_wallet_address, owner_wallet,
        network, created_at
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ Error fetching agents:", error);
      return;
    }

    if (!agents || agents.length === 0) {
      console.log("📭 No active agents found in database");
      return;
    }

    console.log(`📊 Found ${agents.length} active agents:\n`);

    agents.forEach((agent, index) => {
      console.log(`🤖 Agent #${index + 1}: ${agent.name}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Type: ${agent.agent_type || "Not specified"}`);
      console.log(`   Description: ${agent.description || "No description"}`);
      console.log(
        `   Network: ${
          agent.deployment_network_name || agent.network || "Not specified"
        }`
      );
      console.log(
        `   Deployer: ${agent.deployer_wallet_address || "Not specified"}`
      );
      console.log(
        `   Payment Recipient: ${
          agent.payment_recipient_address || "Not specified"
        }`
      );

      // Payment configuration
      console.log(`\n   💰 PAYMENT CONFIG:`);
      console.log(
        `   - Interaction Fee: ${
          agent.interaction_fee_amount || agent.interaction_fee || "Not set"
        }`
      );
      console.log(
        `   - Fee Token: ${agent.interaction_fee_token || "Not specified"}`
      );

      // Check for existing payment methods
      let paymentMethods = [];
      try {
        if (agent.payment_methods_config) {
          const methods =
            typeof agent.payment_methods_config === "string"
              ? JSON.parse(agent.payment_methods_config)
              : agent.payment_methods_config;
          paymentMethods = Object.keys(methods).filter(
            (key) => methods[key]?.enabled
          );
        }
      } catch (e) {
        console.log(`   - Payment Methods: Parse error`);
      }

      if (paymentMethods.length > 0) {
        console.log(`   - Payment Methods: ${paymentMethods.join(", ")}`);
      } else {
        console.log(`   - Payment Methods: None configured`);
      }

      // Check for Revolut-specific config
      let hasRevolutConfig = false;
      try {
        if (agent.payment_config) {
          const config =
            typeof agent.payment_config === "string"
              ? JSON.parse(agent.payment_config)
              : agent.payment_config;
          hasRevolutConfig =
            config.revolut || config.bank_qr || config.virtual_card;
        }
      } catch (e) {
        // Parse error
      }

      console.log(
        `   - Revolut Config: ${
          hasRevolutConfig ? "✅ Present" : "❌ Not configured"
        }`
      );
      console.log(
        `   - Created: ${new Date(agent.created_at).toLocaleDateString()}`
      );
      console.log(`\n   ${"=".repeat(60)}\n`);
    });

    // Summary
    const agentsWithPayment = agents.filter(
      (a) => a.interaction_fee_amount || a.interaction_fee
    );
    const agentsWithWallet = agents.filter((a) => a.payment_recipient_address);

    console.log(`📈 SUMMARY:`);
    console.log(`   Total Active Agents: ${agents.length}`);
    console.log(`   Agents with Payment Fee: ${agentsWithPayment.length}`);
    console.log(`   Agents with Payment Wallet: ${agentsWithWallet.length}`);

    // Suggest which agent to test Revolut with
    const bestCandidate = agents.find(
      (a) =>
        (a.interaction_fee_amount || a.interaction_fee) &&
        a.payment_recipient_address
    );

    if (bestCandidate) {
      console.log(`\n🎯 RECOMMENDED FOR REVOLUT TESTING:`);
      console.log(`   Agent: ${bestCandidate.name} (${bestCandidate.id})`);
      console.log(
        `   Fee: ${
          bestCandidate.interaction_fee_amount || bestCandidate.interaction_fee
        }`
      );
      console.log(`   Wallet: ${bestCandidate.payment_recipient_address}`);
    }
  } catch (error) {
    console.error("💥 Failed to check agents:", error);
  }
}

checkAgentsWithRevolutDetails();
