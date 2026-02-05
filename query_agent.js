import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ncjbwzibnqrbrvicdmec.supabase.co",
  "sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA",
);

const { data, error } = await supabase
  .from("deployed_objects")
  .select(
    "id, agent_name, screen_position_x, screen_position_y, positioning_mode, latitude, longitude",
  )
  .order("created_at", { ascending: false })
  .limit(1)
  .single();

if (error) {
  console.error("❌ Error:", error);
} else {
  console.log("\n📊 Latest Deployed Agent:\n");
  console.log("ID:", data.id);
  console.log("Agent Name:", data.agent_name);
  console.log("─────────────────────────────────");
  console.log("Positioning Mode:", data.positioning_mode);
  console.log("Screen Position X:", data.screen_position_x, "%");
  console.log("Screen Position Y:", data.screen_position_y, "%");
  console.log("GPS Latitude:", data.latitude);
  console.log("GPS Longitude:", data.longitude);
  console.log("─────────────────────────────────\n");
}
