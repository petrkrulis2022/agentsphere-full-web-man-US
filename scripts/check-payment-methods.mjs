#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);

console.log("🔍 Checking payment_methods JSON for POS 2...\n");

const { data, error } = await supabase
  .from("deployed_objects")
  .select("id, name, payment_methods, ens_payment_enabled, ens_domain")
  .ilike("name", "%pos 2%")
  .order("created_at", { ascending: false })
  .limit(1);

if (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}

if (!data || data.length === 0) {
  console.log("❌ No agent found");
  process.exit(0);
}

const agent = data[0];
console.log("Agent:", agent.name);
console.log("ID:", agent.id);
console.log("\n📦 payment_methods JSON:");
console.log(JSON.stringify(agent.payment_methods, null, 2));

console.log("\n🌐 ENS fields:");
console.log("  ens_payment_enabled:", agent.ens_payment_enabled);
console.log("  ens_domain:", agent.ens_domain);

if (agent.payment_methods) {
  console.log("\n✅ Enabled Payment Methods:");
  Object.entries(agent.payment_methods).forEach(([key, value]) => {
    if (value && typeof value === "object" && value.enabled) {
      console.log(`  - ${key}: ENABLED`);
    }
  });
} else {
  console.log("\n⚠️  payment_methods is NULL or empty!");
}
