#!/usr/bin/env node

/**
 * Query latest deployed agent from Supabase
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getLatestAgent() {
  console.log("🔍 Querying latest deployed agent...\n");

  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log("⚠️  No agents found in database");
    process.exit(0);
  }

  const agent = data[0];

  console.log("✅ Latest Deployed Agent:\n");
  console.log("📋 Basic Info:");
  console.log(`  ID: ${agent.id}`);
  console.log(`  Name: ${agent.name}`);
  console.log(`  Type: ${agent.object_type || agent.agent_type || "N/A"}`);
  console.log(`  Created: ${new Date(agent.created_at).toLocaleString()}`);

  console.log("\n📍 Location:");
  console.log(`  Latitude: ${agent.latitude}`);
  console.log(`  Longitude: ${agent.longitude}`);

  console.log("\n⛓️  Networks:");
  console.log(`  Polygon Chain ID: ${agent.polygon_chain_id || "N/A"}`);
  console.log(`  Solana Network: ${agent.solana_network || "N/A"}`);
  console.log(`  Hedera Network: ${agent.hedera_network || "N/A"}`);

  console.log("\n🌐 ENS Payment:");
  console.log(`  Enabled: ${agent.ens_payment_enabled ? "✅ YES" : "❌ NO"}`);
  if (agent.ens_payment_enabled) {
    console.log(`  Domain: ${agent.ens_domain}`);
    console.log(`  Resolved Address: ${agent.ens_resolved_address}`);
    console.log(`  Network: ${agent.ens_resolver_network}`);
    console.log(`  Verified: ${agent.ens_verified ? "✅" : "⏳ Pending"}`);
  }
}

getLatestAgent();
