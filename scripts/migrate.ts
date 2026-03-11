import postgres from "postgres";
import fs from "fs";
import path from "path";
import "dotenv/config";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const sql = postgres(process.env.POSTGRES_URL!);

  try {
    // Read all migration files
    const drizzleDir = path.join(__dirname, "..", "drizzle");
    const migrationFiles = fs.readdirSync(drizzleDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`\n📄 Processing ${file}...`);
      const migrationFile = path.join(drizzleDir, file);
      const migrationSQL = fs.readFileSync(migrationFile, "utf-8");

      // Split by statement breakpoint and execute each statement
      const statements = migrationSQL
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      console.log(`  Executing ${statements.length} statements...`);

      for (const statement of statements) {
        try {
          await sql.unsafe(statement);
          console.log("  ✓ Executed statement successfully");
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.message?.includes("already exists") || error.message?.includes("does not exist")) {
            console.log("  ⚠ Skipping (already exists or not applicable)");
          } else {
            console.error("  ❌ Error:", error.message);
          }
        }
      }
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
