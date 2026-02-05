#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);

console.log("🔍 Searching for POS 2...\n");

const { data, error } = await supabase
  .from("deployed_objects")
  .select("*")
  .ilike("name", "%pos 2%")
  .order("created_at", { ascending: false })
  .limit(1);

if (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}

if (!data || data.length === 0) {
  console.log('❌ No agent found with name containing "POS 2"');
  process.exit(0);
}

const agent = data[0];
console.log("✅ Agent Found: POS 2\n");
console.log("📋 Basic Info:");
console.log(`  ID: ${agent.id}`);
console.log(`  Name: ${agent.name}`);
console.log(`  Type: ${agent.object_type || "N/A"}`);
console.log(`  Created: ${new Date(agent.created_at).toLocaleString()}`);

console.log("\n📍 Location:");
console.log(`  Latitude: ${agent.latitude}`);
console.log(`  Longitude: ${agent.longitude}`);

console.log("\n⛓️  Networks:");
console.log(
  `  Polygon: ${agent.amoy_chain_id || agent.polygon_amoy_chain_id || "N/A"}`,
);
console.log(`  Solana: ${agent.solana_network || "N/A"}`);
console.log(`  Hedera: ${agent.hedera_network || "N/A"}`);

console.log("\n🌐 ENS Payment:");
console.log(`  Enabled: ${agent.ens_payment_enabled ? "✅ YES" : "❌ NO"}`);
if (agent.ens_payment_enabled) {
  console.log(`  Domain: ${agent.ens_domain}`);
  console.log(`  Resolved Address: ${agent.ens_resolved_address}`);
  console.log(`  Network: ${agent.ens_resolver_network}`);
  console.log(`  Verified: ${agent.ens_verified ? "✅" : "⏳"}`);
}

console.log("\n💳 Payment Methods:");
console.log(
  `  ENS Payment: ${agent.ens_payment_enabled ? "✅ ENABLED" : "❌"}`,
);
console.log(`  Revolut: ${agent.revolut_payment_enabled ? "✅" : "❌"}`);
console.log(`  Bank Transfer: ${agent.bank_details ? "✅" : "❌"}`);
