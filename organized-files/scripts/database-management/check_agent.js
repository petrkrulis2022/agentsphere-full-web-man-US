async function checkLatestAgent() {
  try {
    const supabaseUrl = "https://hlrvcjjmwxzqixzwgktd.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscnZjamptd3h6cWl4endna3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTEyNTQyMCwiZXhwIjoyMDM0NzAxNDIwfQ.xtOYjNRRkHEUFJCbGrG7dGd4KONhxTVRJxZ0dZkPfX8";

    const response = await fetch(
      supabaseUrl + "/rest/v1/deployed_objects?order=created_at.desc&limit=1",
      {
        headers: {
          apikey: supabaseKey,
          Authorization: "Bearer " + supabaseKey,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      const agent = data[0];
      console.log("=== LATEST DEPLOYED AGENT ===");
      console.log("ID:", agent.id);
      console.log("Name:", agent.name);
      console.log("Type:", agent.agent_type);
      console.log("Description:", agent.description);
      console.log("");
      console.log("=== PAYMENT CONFIGURATION ===");
      console.log("Token:", agent.token);
      console.log("Interaction Fee:", agent.interaction_fee);
      console.log("Network:", agent.network);
      console.log("");
      console.log("=== WALLET ADDRESSES ===");
      console.log("Deployer Wallet:", agent.deployer_wallet_address);
      console.log("Payment Recipient:", agent.payment_recipient_address);
      console.log("Agent Wallet:", agent.agent_wallet_address);
      console.log("Owner Wallet:", agent.owner_wallet);
      console.log("");
      console.log("=== LOCATION DATA ===");
      console.log("Location Type:", agent.location_type);
      console.log("Latitude:", agent.latitude);
      console.log("Longitude:", agent.longitude);
      console.log("Altitude:", agent.altitude);
      console.log("");
      console.log("=== INTERACTION METHODS ===");
      console.log("Text Chat:", agent.text_chat);
      console.log("Voice Chat:", agent.voice_chat);
      console.log("Video Chat:", agent.video_chat);
      console.log("");
      console.log("=== MCP SERVICES ===");
      console.log("MCP Services:", agent.mcp_services);
      console.log("");
      console.log("=== SPECIAL FEATURES ===");
      console.log("Features:", agent.features);
      console.log("");
      console.log("=== RAW AGENT DATA ===");
      console.log(JSON.stringify(agent, null, 2));
    } else {
      console.log("No agents found or response:", data);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkLatestAgent();
