# Database Integration Setup Guide

This guide will walk you through setting up the database connection for your CyberWait application.

## ✅ What's Been Done

All backend files have been created:
- ✅ Backend server (`backend/server.js`)
- ✅ Database connection (`backend/db/connection.js`)
- ✅ API routes (`backend/routes/menu.js`, `backend/routes/orders.js`, `backend/routes/tracking.js`)
- ✅ SQL migration file (`backend/database.sql`)
- ✅ Frontend updated to use API (`index.tsx`)

## 📋 Step-by-Step Setup

### Step 1: Install PostgreSQL

If you don't have PostgreSQL installed:

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create the Database

Open a terminal/command prompt and run:

```bash
# Windows (using psql)
psql -U postgres

# Mac/Linux
psql postgres
```

Then in the PostgreSQL prompt:
```sql
CREATE DATABASE cyberwait;
\q
```

### Step 3: Run the SQL Migration

Run the SQL file to create tables and insert sample data:

```bash
# From the CYBERWAIT/backend directory
psql -U postgres -d cyberwait -f database.sql
```

You can also run the migration runner which will execute any SQL files placed in `backend/migrations/` (in lexicographic order):

**PowerShell**
```powershell
$env:DATABASE_URL = 'postgresql://postgres:yourpass@localhost:5432/cyberwait'
npm run migrate --prefix backend
```

**bash**
```bash
DATABASE_URL="postgresql://postgres:yourpass@localhost:5432/cyberwait" npm run migrate --prefix backend
```

This is useful for incremental migrations such as removing obsolete columns or making small schema updates.
Or manually:
1. Open `backend/database.sql`
2. Copy all the SQL commands
3. Connect to your database and paste/run them

### Step 4: Configure Backend Environment

Create a `.env` file in the `backend` folder:

**Windows PowerShell:**
```powershell
cd backend
New-Item -Path .env -ItemType File
notepad .env
```

**Mac/Linux:**
```bash
cd backend
touch .env
nano .env
```

Add this content (replace with your actual PostgreSQL password):
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=cyberwait
DB_PASSWORD=your_postgres_password_here
DB_PORT=5432
PORT=5000
```

### Step 5: Start the Backend Server

Open a new terminal window and run:

```bash
cd CYBERWAIT/backend
npm install  # If you haven't already
npm run dev
```

You should see: `Server running on port 5000`

### Step 6: Start the Frontend

Open another terminal window and run:

```bash
cd CYBERWAIT
npm run dev
```

The frontend will run on `http://localhost:3000` (or another port if 3000 is busy).

## 🧪 Testing the Setup

1. **Test the API directly:**
   Open your browser and go to: `http://localhost:5000/api/menu`
   You should see JSON data with menu items.

2. **Test the Frontend:**
   - Open `http://localhost:3000` in your browser
   - You should see the menu items loading from the database
   - Add items to cart and complete an order
   - Check your database to see the order was saved!

## 🔍 Verify Database Connection

To verify orders are being saved:

```sql
-- Connect to database
psql -U postgres -d cyberwait

-- Check menu items
SELECT * FROM menu_items;

-- Check orders
SELECT * FROM orders;

-- Check order items
SELECT * FROM order_items;
```

### How to access the database (local or Supabase)

- Local Postgres: run `psql -U postgres -d cyberwait` (password from your `.env`) or use a GUI like DBeaver/pgAdmin and connect with the same credentials.
- Supabase: open your project dashboard → **Table Editor** → pick `orders` to browse rows; or use the SQL editor.
- From terminal, you can run: `psql <DATABASE_URL> -c "SELECT * FROM orders LIMIT 10;"` where `DATABASE_URL` is in your `.env`.

### What is Docker used for in this project?

- Docker can be used to run a local Postgres instance or run the whole stack in containers so your environment matches production.
- Example: `docker run --name cyberwait-db -e POSTGRES_PASSWORD=yourpass -p 5432:5432 -d postgres` will start a Postgres DB the app can connect to using the `DATABASE_URL`.
- Using Docker is optional but recommended if you want an isolated, reproducible dev environment.

> **Security note:** Do NOT store CVV or full card numbers in your database. For production, integrate a PCI-compliant payment provider (like Stripe) — store only masked data (e.g., last 4 digits) and never CVV.

## 🐛 Troubleshooting

### "Cannot connect to database"
- Make sure PostgreSQL is running
- Check your `.env` file has the correct password
- Verify database name is `cyberwait`

### "Port 5000 already in use"
- Change `PORT=5000` to another port (e.g., `PORT=5001`) in `.env`
- Update `API_URL` in `index.tsx` to match

### "Module not found" errors
- Run `npm install` in both `backend` and root directories

### Frontend can't connect to API
- Make sure backend server is running
- Check CORS is enabled (it is in `server.js`)
- Verify the API_URL in `index.tsx` matches your backend port

## 📁 Project Structure

```
CYBERWAIT/
├── backend/
│   ├── db/
│   │   └── connection.js      # Database connection
│   ├── routes/
│   │   ├── menu.js            # Menu API endpoints
│   │   ├── orders.js          # Orders API endpoints
│   │   └── tracking.js        # Tracking API endpoints
│   ├── database.sql           # Database schema & sample data
│   ├── server.js              # Express server
│   ├── package.json
│   └── .env                   # Environment variables (create this)
├── index.tsx                  # Frontend (updated to use API)
└── ...
```

## 🎉 You're All Set!

Your CyberWait application is now connected to a PostgreSQL database. Orders will be saved and you can track them through the API!

---

## Optional: Supabase (client-side)

If you'd rather use Supabase's hosted Postgres and client library from the frontend, follow these steps:

1. Install the Supabase client in the frontend:

```bash
npm install @supabase/supabase-js
```

2. Create `src/supabase.js` and add:

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

3. Add the following env vars to your local `.env.local` (do NOT commit this file):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

4. In Vercel (production), add the same env vars under Project Settings → Environment Variables and redeploy.

5. How to use in the frontend:

```js
import { supabase } from './supabase'

// example: read menu items
const { data, error } = await supabase.from('menu').select('*')
```

## Supabase: running the DB migration (added files)

I added an idempotent SQL migration file: `supabase/00-init.sql` and a short README at `supabase/README.md`.

Options to run it:

- Supabase SQL Editor (recommended):
  1. Open your Supabase project → **SQL Editor** → **New query**
  2. Open `supabase/00-init.sql`, paste the contents, and click **Run**

- CLI / psql (if you have a connection string):
  1. Get your `DATABASE_URL` (format: `postgresql://<user>:<password>@<host>:5432/<db>`)
  2. Run: `psql "<DATABASE_URL>" -f supabase/00-init.sql`

What the migration does:
- Creates `menu`, `profiles`, `orders`, and `order_items` tables
- Enables RLS on orders/order_items and adds owner policies
- Seeds the `menu` table (idempotent)

Verification queries you can run after migrating:

```sql
SELECT COUNT(*) FROM menu;
SELECT * FROM menu LIMIT 10;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM profiles;
```

Security notes:
- You do not need to share the service_role key to run the SQL in the dashboard. If you used any temporary keys, revoke them afterwards (Supabase → Project Settings → API → Service Role Key).
- Never commit secrets into the repository.

If you'd like me to run the migration for you, provide a temporary `DATABASE_URL` (I will revoke it after use) or I can continue to guide you step-by-step.

