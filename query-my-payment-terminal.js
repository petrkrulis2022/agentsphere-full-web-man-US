import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yrvjogyvpkpfzvyetfsl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyxm9neXZwa3BmenZ5ZXRmc2wiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwOTcwNzEwOCwiZXhwIjoxMzEzMzA3MTA4fQ.sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA";

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log("🔍 Querying My Payment Terminal agents...\n");

  try {
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("object_type", "my_payment_terminal")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Query error:", error.message);
      process.exit(1);
    }

    console.log(`✅ Found ${data.length} My Payment Terminal agents:\n`);
    
    data.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Type: ${agent.object_type}`);
      console.log(`   Location: ${agent.latitude?.toFixed(4)}, ${agent.longitude?.toFixed(4)}`);
      console.log(`   Fee Type: ${agent.fee_type || 'N/A'}`);
      console.log(`   Fee Amount: ${agent.interaction_fee_amount || agent.interaction_fee_usdfc || 'Dynamic'}`);
      console.log(`   Fee Token: ${agent.interaction_fee_token || 'N/A'}`);
      console.log(`   Bank Integrations: ${agent.bank_integrations?.join(', ') || 'None'}`);
      console.log(`   Exchange Integrations: ${agent.exchange_integrations?.join(', ') || 'None'}`);
      console.log(`   Created: ${new Date(agent.created_at).toLocaleString()}`);
      console.log();
    });

  } catch (err) {
    console.error("❌ Exception:", err.message);
    process.exit(1);
  }
})();
