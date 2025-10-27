import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log("🔍 AR VIEWER OBJECT DIAGNOSTIC SCRIPT");
console.log("═══════════════════════════════════════");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// 1. ENVIRONMENT VALIDATION
console.log("\n📋 STEP 1: Environment Validation");
console.log("─────────────────────────────────");
console.log("URL:", supabaseUrl || "❌ MISSING");
console.log(
  "Anon Key Format:",
  supabaseAnonKey
    ? supabaseAnonKey.startsWith("sb_publishable_")
      ? "✅ New Format (sb_)"
      : supabaseAnonKey.startsWith("eyJ")
      ? "❌ Legacy Format (JWT)"
      : "❓ Unknown Format"
    : "❌ MISSING"
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("💥 CRITICAL: Missing Supabase credentials!");
  console.log("\n🔧 SOLUTION:");
  console.log("Update .env file with:");
  console.log("VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co");
  console.log(
    "VITE_SUPABASE_ANON_KEY=sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runARViewerDiagnostics() {
  try {
    // 2. CONNECTION TEST
    console.log("\n📡 STEP 2: Connection Test");
    console.log("─────────────────────────────");

    const { data: testData, error: testError } = await supabase
      .from("deployed_objects")
      .select("id")
      .limit(1);

    if (testError) {
      console.error("❌ Connection Failed:", testError.message);

      if (testError.message.includes("Legacy API keys are disabled")) {
        console.log("\n🔧 SOLUTION: Update to new API key format");
        console.log("Replace JWT keys with sb_ format keys in .env file");
      }
      return;
    }

    console.log("✅ Connection Successful");

    // 3. OBJECT COUNT ANALYSIS
    console.log("\n📊 STEP 3: Object Count Analysis");
    console.log("─────────────────────────────────");

    const { count: totalCount, error: countError } = await supabase
      .from("deployed_objects")
      .select("*", { count: "exact", head: true });

    const { count: activeCount, error: activeError } = await supabase
      .from("deployed_objects")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (countError || activeError) {
      console.error("❌ Count Query Failed");
      return;
    }

    console.log(`📦 Total Objects: ${totalCount}`);
    console.log(`✅ Active Objects: ${activeCount}`);
    console.log(`❌ Inactive Objects: ${totalCount - activeCount}`);

    if (activeCount === 0) {
      console.log("⚠️  WARNING: No active objects found!");
      console.log("🔧 Check: All objects may be marked as is_active=false");
    }

    // 4. LOCATION DATA VALIDATION
    console.log("\n📍 STEP 4: Location Data Validation");
    console.log("─────────────────────────────────────");

    const { data: locationData, error: locationError } = await supabase
      .from("deployed_objects")
      .select(
        "id, name, latitude, longitude, preciselatitude, preciselongitude"
      )
      .eq("is_active", true);

    if (locationError) {
      console.error("❌ Location Query Failed");
      return;
    }

    const objectsWithLocation = locationData.filter(
      (obj) => obj.latitude && obj.longitude
    );
    const objectsWithPreciseLocation = locationData.filter(
      (obj) => obj.preciselatitude && obj.preciselongitude
    );

    console.log(
      `📍 Objects with basic location: ${objectsWithLocation.length}/${activeCount}`
    );
    console.log(
      `🎯 Objects with precise location: ${objectsWithPreciseLocation.length}/${activeCount}`
    );

    if (objectsWithLocation.length === 0) {
      console.log("⚠️  WARNING: No objects have location data!");
      console.log(
        "🔧 AR Viewer requires latitude/longitude to display objects"
      );
    }

    // 5. RECENT OBJECTS SAMPLE
    console.log("\n📋 STEP 5: Recent Active Objects Sample");
    console.log("─────────────────────────────────────────");

    const { data: recentObjects, error: recentError } = await supabase
      .from("deployed_objects")
      .select(
        "id, name, created_at, latitude, longitude, is_active, network, token_symbol"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentError) {
      console.error("❌ Recent Objects Query Failed");
      return;
    }

    recentObjects.forEach((obj, index) => {
      const hasLocation = obj.latitude && obj.longitude;
      const locationIcon = hasLocation ? "📍" : "❌";
      const date = new Date(obj.created_at).toLocaleDateString();

      console.log(`${index + 1}. ✅ ${obj.name}`);
      console.log(
        `   📅 ${date} | ${locationIcon} Location | 🔗 ${
          obj.network || "N/A"
        } | 💰 ${obj.token_symbol || "N/A"}`
      );
    });

    // 6. AR VIEWER SPECIFIC CHECKS
    console.log("\n🎯 STEP 6: AR Viewer Specific Checks");
    console.log("────────────────────────────────────");

    // Check for objects that AR Viewer query would return
    const { data: arViewerData, error: arViewerError } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (arViewerError) {
      console.error("❌ AR Viewer Query Failed:", arViewerError);
      return;
    }

    console.log(`🎯 Objects AR Viewer would load: ${arViewerData.length}`);

    // Check for common AR Viewer issues
    const objectsWithoutNames = arViewerData.filter(
      (obj) => !obj.name || obj.name.trim() === ""
    );
    const objectsWithoutNetwork = arViewerData.filter(
      (obj) => !obj.network && !obj.chain_id
    );

    if (objectsWithoutNames.length > 0) {
      console.log(`⚠️  ${objectsWithoutNames.length} objects missing names`);
    }

    if (objectsWithoutNetwork.length > 0) {
      console.log(
        `⚠️  ${objectsWithoutNetwork.length} objects missing network info`
      );
    }

    // 7. SUMMARY & RECOMMENDATIONS
    console.log("\n📈 STEP 7: Summary & Recommendations");
    console.log("───────────────────────────────────────");

    const issues = [];
    const recommendations = [];

    if (activeCount === 0) {
      issues.push("No active objects");
      recommendations.push(
        "Check database - activate objects by setting is_active=true"
      );
    }

    if (objectsWithLocation.length === 0) {
      issues.push("No location data");
      recommendations.push("Add latitude/longitude coordinates to objects");
    }

    if (supabaseAnonKey.startsWith("eyJ")) {
      issues.push("Legacy API keys");
      recommendations.push("Update to sb_ format API keys");
    }

    if (issues.length === 0) {
      console.log("✅ ALL CHECKS PASSED!");
      console.log("🎯 AR Viewer should display all objects correctly");
      console.log(`📊 Expected objects in AR Viewer: ${activeCount}`);
    } else {
      console.log("❌ ISSUES FOUND:");
      issues.forEach((issue) => console.log(`   • ${issue}`));
      console.log("\n🔧 RECOMMENDATIONS:");
      recommendations.forEach((rec) => console.log(`   • ${rec}`));
    }

    // 8. QUICK TEST QUERY
    console.log("\n🧪 STEP 8: Quick Test Query (Same as AR Viewer)");
    console.log("──────────────────────────────────────────────────");

    const { data: testQuery, error: testQueryError } = await supabase
      .from("deployed_objects")
      .select("id, name, latitude, longitude")
      .eq("is_active", true)
      .limit(3);

    if (testQueryError) {
      console.error("❌ Test Query Failed:", testQueryError);
    } else {
      console.log(
        `✅ Test Query Success: ${testQuery.length} objects returned`
      );
      testQuery.forEach((obj) => {
        console.log(`   • ${obj.name} (${obj.latitude}, ${obj.longitude})`);
      });
    }
  } catch (err) {
    console.error("💥 Diagnostic Failed:", err);
  }
}

// 9. ENVIRONMENT TIPS
console.log("\n💡 ENVIRONMENT TIPS:");
console.log("────────────────────");
console.log("• After .env changes: Restart development server");
console.log("• Clear browser cache: Ctrl+Shift+R (Cmd+Shift+R on Mac)");
console.log("• Test in incognito window to avoid cached keys");
console.log("• Check browser console for additional errors");

runARViewerDiagnostics();
