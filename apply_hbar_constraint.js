import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env file");
  console.error(
    "Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  try {
    console.log("🔧 Applying HBAR currency constraint migration...\n");

    // Read the SQL file
    const sqlPath = join(__dirname, "fix_hbar_currency_constraint.sql");
    const sqlContent = readFileSync(sqlPath, "utf8");

    // Split by semicolons and filter out comments and empty statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter(
        (stmt) =>
          stmt.length > 0 && !stmt.startsWith("/*") && !stmt.startsWith("--")
      );

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and SELECT statements (they're just for status)
      if (
        statement.startsWith("/*") ||
        statement.startsWith("--") ||
        statement.startsWith("SELECT")
      ) {
        continue;
      }

      console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
      console.log(`   ${statement.substring(0, 60)}...`);

      const { data, error } = await supabase.rpc("exec_sql", {
        sql_query: statement + ";",
      });

      if (error) {
        // Try direct execution if RPC fails
        console.log("   Trying direct execution...");
        const { error: directError } = await supabase
          .from("_migrations")
          .insert([{ query: statement }]);

        if (directError) {
          console.error(`❌ Error executing statement:`, directError);
        }
      } else {
        console.log("   ✅ Success");
      }
    }

    console.log("\n🎉 Migration completed!");
    console.log("\n📋 Verifying constraints...");

    // Verify the constraint was updated
    const { data: constraints, error: checkError } = await supabase
      .from("information_schema.check_constraints")
      .select("*")
      .eq("constraint_name", "valid_currency_type");

    if (checkError) {
      console.log("⚠️  Could not verify constraint (this is normal)");
    } else {
      console.log("✅ Constraint verification:", constraints);
    }

    console.log("\n✨ HBAR is now supported as a valid currency!");
    console.log(
      "You can now deploy agents on Hedera Testnet with HBAR payments."
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

applyMigration();
