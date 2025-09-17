import "dotenv/config";
import { Client } from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    // Create a simple uploads table if it doesn't exist
    await client.query(`
      create table if not exists uploads (
        id uuid primary key default gen_random_uuid(),
        file_name text not null,
        file_type text,
        file_size bigint,
        storage_path text,
        created_at timestamptz not null default now()
      );
    `);

    // Ensure pgcrypto or uuid extension available for gen_random_uuid()
    await client.query(`create extension if not exists pgcrypto;`);

    console.log("Database setup complete: uploads table ensured.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("DB setup failed:", err);
  process.exit(1);
});


