async function checkDatabaseStructure() {
  try {
    console.log("Checking deployed_objects table...");

    const response1 = await fetch(
      "https://hlrvcjjmwxzqixzwgktd.supabase.co/rest/v1/deployed_objects?order=created_at.desc&limit=1",
      {
        headers: {
          apikey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscnZjamptd3h6cWl4endna3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTEyNTQyMCwiZXhwIjoyMDM0NzAxNDIwfQ.xtOYjNRRkHEUFJCbGrG7dGd4KONhxTVRJxZ0dZkPfX8",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscnZjamptd3h6cWl4endna3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTEyNTQyMCwiZXhwIjoyMDM0NzAxNDIwfQ.xtOYjNRRkHEUFJCbGrG7dGd4KONhxTVRJxZ0dZkPfX8",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response status:", response1.status);

    if (response1.ok) {
      const data1 = await response1.json();
      console.log("=== LATEST DEPLOYED_OBJECTS ENTRY ===");
      if (data1 && data1.length > 0) {
        console.log(JSON.stringify(data1[0], null, 2));
      } else {
        console.log("No deployed_objects found");
      }
    } else {
      const errorText = await response1.text();
      console.log("Error response:", errorText);
    }

    console.log("\\n\\nChecking agents table...");

    const response2 = await fetch(
      "https://hlrvcjjmwxzqixzwgktd.supabase.co/rest/v1/agents?order=created_at.desc&limit=1",
      {
        headers: {
          apikey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscnZjamptd3h6cWl4endna3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTEyNTQyMCwiZXhwIjoyMDM0NzAxNDIwfQ.xtOYjNRRkHEUFJCbGrG7dGd4KONhxTVRJxZ0dZkPfX8",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscnZjamptd3h6cWl4endna3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTEyNTQyMCwiZXhwIjoyMDM0NzAxNDIwfQ.xtOYjNRRkHEUFJCbGrG7dGd4KONhxTVRJxZ0dZkPfX8",
          "Content-Type": "application/json",
        },
      }
    );

    if (response2.ok) {
      const data2 = await response2.json();
      console.log("=== LATEST AGENTS ENTRY ===");
      if (data2 && data2.length > 0) {
        console.log(JSON.stringify(data2[0], null, 2));
      } else {
        console.log("No agents found");
      }
    } else {
      const errorText = await response2.text();
      console.log("Error response:", errorText);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

import fetch from "node-fetch";

if (typeof global !== "undefined") {
  global.fetch = fetch;
}

checkDatabaseStructure();
