Supabase migration and run instructions

This folder contains an idempotent SQL migration for the project.

Files:
- `00-init.sql` — Creates extensions, tables (`menu`, `profiles`, `orders`, `order_items`), RLS policies, and seeds the `menu` table if empty.

How to run

Option A — Supabase SQL Editor (recommended)
1. Open your Supabase project dashboard
2. Go to **SQL Editor** → **New query**
3. Open `supabase/00-init.sql` and paste the contents into the editor
4. Click **Run**

Option B — psql / CLI (if you have a Postgres connection string)
1. Get your DATABASE_URL (format: `postgresql://<user>:<password>@<host>:5432/<db>`)
2. Run: `psql <DATABASE_URL> -f supabase/00-init.sql`

Notes & security
- The SQL is idempotent and safe to run multiple times.
- Do **not** commit any secrets (service_role keys or DB passwords) to the repository.
- If you used a service_role key for any automation, revoke it after running operations (Supabase → Project Settings → API → Service Role Key).

Verification
- After running, verify:
  - `SELECT COUNT(*) FROM menu;`
  - `SELECT * FROM profiles LIMIT 5;`
  - `SELECT * FROM orders LIMIT 5;`

If you want, I can run these steps for you — provide a temporary DATABASE_URL (revoked after use).