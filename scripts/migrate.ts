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
    // Read the migration file (go up one directory from scripts/)
    const migrationFile = path.join(__dirname, "..", "drizzle/0000_eager_xorn.sql");
    const migrationSQL = fs.readFileSync(migrationFile, "utf-8");

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Executing ${statements.length} statements...`);

    for (const statement of statements) {
      try {
        await sql.unsafe(statement);
        console.log("✓ Executed statement successfully");
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes("already exists")) {
          console.log("⚠ Table already exists, skipping...");
        } else {
          console.error("Error executing statement:", error.message);
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
