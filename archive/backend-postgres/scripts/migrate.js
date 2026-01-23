/*
  Simple Node migration runner that executes SQL files against a Postgres DATABASE_URL.
  Usage (locally):
    DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/migrate.js
  In production (Render/other): set DATABASE_URL as an environment variable and run `npm run migrate`.
*/

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

(async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;
    if (!databaseUrl) {
      console.error('Missing DATABASE_URL environment variable.');
      process.exit(1);
    }

    // Check for a dedicated migrations directory: run any .sql files there in order
    const root = path.resolve(__dirname, '..', '..');
    const migrationsDir = path.join(root, 'backend', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
      if (files.length) {
        console.log('Found migration files:', files);
        const client = new Client({ connectionString: databaseUrl });
        await client.connect();
        for (const file of files) {
          const p = path.join(migrationsDir, file);
          const sql = fs.readFileSync(p, 'utf8');
          console.log('Running migration file:', p);
          await client.query(sql);
        }

        // Basic verification queries
        const checks = {};
        try {
          const r1 = await client.query("SELECT COUNT(*) AS cnt FROM menu;");
          checks.menu = Number(r1.rows[0].cnt);
        } catch (e) { checks.menu = null; }
        try {
          const r2 = await client.query("SELECT COUNT(*) AS cnt FROM orders;");
          checks.orders = Number(r2.rows[0].cnt);
        } catch (e) { checks.orders = null; }

        console.log('Migrations complete. Verification:', checks);
        await client.end();
        process.exit(0);
      }
    }

    // Prefer supabase migration file if present (legacy fallback)
    const candidates = [
      path.join(root, 'supabase', '00-init.sql'),
      path.join(root, 'backend', 'database.sql'),
      path.join(root, 'backend', 'migrations', 'init.sql')
    ];

    const sqlPath = candidates.find(p => fs.existsSync(p));
    if (!sqlPath) {
      console.error('No SQL migration file found (looked in supabase/00-init.sql, backend/database.sql).');
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, { encoding: 'utf8' });
    console.log('Found SQL file:', sqlPath);

    const client = new Client({ connectionString: databaseUrl });
    await client.connect();

    console.log('Running migration...');
    // Attempt to run all SQL in one query; many Postgres deployments accept this.
    await client.query(sql);

    // Basic verification queries
    const checks = {};
    try {
      const r1 = await client.query("SELECT COUNT(*) AS cnt FROM menu;");
      checks.menu = Number(r1.rows[0].cnt);
    } catch (e) { checks.menu = null; }
    try {
      const r2 = await client.query("SELECT COUNT(*) AS cnt FROM orders;");
      checks.orders = Number(r2.rows[0].cnt);
    } catch (e) { checks.orders = null; }

    console.log('Migration complete. Verification:', checks);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', String(err));
    process.exit(1);
  }
})();
