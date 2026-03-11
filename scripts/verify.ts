import postgres from "postgres";
import "dotenv/config";

async function verify() {
  const sql = postgres(process.env.POSTGRES_URL!);

  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log("📊 Tables created:");
    tables.forEach((t) => console.log(`  - ${t.table_name}`));

    console.log(`\n✅ Total: ${tables.length} tables`);
  } finally {
    await sql.end();
  }
}

verify();
