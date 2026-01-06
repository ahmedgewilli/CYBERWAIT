Deploy (Quick demo)

This repository includes a GitHub Actions workflow (`.github/workflows/pages.yml`) that builds the Vite frontend and deploys it to GitHub Pages whenever you push to `main`.

What I changed to support Pages:
- Set `base: './'` in `vite.config.ts` so assets use relative paths and the site works when served from Pages.
- Added `.github/workflows/pages.yml` to build and publish the `dist` folder.

How to use:
1. Push the current `main` branch (already done). The workflow will run automatically.
2. Visit the **Actions** tab in your repo to see the build & Pages deploy status.
3. When the deployment completes, check **Settings → Pages** for the public URL.

Connecting frontend to a hosted backend & database (Vercel)

- Set `VITE_API_URL` in your Vercel project environment variables to the full URL of your deployed backend (for example: `https://my-backend.onrender.com`).
- This repository now includes serverless API endpoints (Vercel-friendly) at `/api/*` that can be used as the backend. If you deploy the same repo to Vercel for the backend as well, set `VITE_API_URL` to your Vercel app's URL and the frontend will call `/api/menu`, `/api/orders`, and `/api/tracking/:id/status`.
- For persistence using Supabase, set the following Vercel environment variables:
  - `VITE_SUPABASE_URL` (public)
  - `VITE_SUPABASE_ANON_KEY` (public)
  - `SUPABASE_SERVICE_ROLE` (server-only, required to write orders)
- After setting env vars, redeploy (or trigger a new deployment) — the serverless endpoints will use Supabase when configured, otherwise will fall back to the built-in static menu and simulated orders.

Deploying the backend & running migrations (Render example)

1. Create a new Web Service on Render and connect your GitHub repo (`ahmedgewilli/CYBERWAIT`).
2. Use the **build command**: `cd backend && npm ci` and **start command**: `cd backend && npm start` (or use the provided `Dockerfile`).
3. Add a managed Postgres or set `DATABASE_URL` (Postgres connection string) in the Render service's Environment section.
4. Run the migration manually once (Render has a "Shell/Console" you can use) with:

   cd backend && npm run migrate

   The migration runner will look for `supabase/00-init.sql` (preferred) or `backend/database.sql` and execute it.
5. Optionally set a Release Command in Render to run `cd backend && npm run migrate` on each deploy.

Security note: If you use Supabase service_role or DB credentials temporarily, revoke or rotate them after any automation is complete.

Notes:
- The frontend falls back to Supabase (if configured) or to the built-in static menu when no backend is provided.
- If you want me to deploy the backend + database and set the env vars, tell me which provider you prefer (Render, Railway, or I can prepare a Dockerfile and instructions).
Notes:
- If you prefer Vercel for more powerful hosting (custom domains, serverless functions, environment variables), I can add a Vercel configuration and instructions instead.
- The app will work as a static demo without a database (the frontend uses a static fallback `MENU_ITEMS`). For a full end-to-end demo (orders persisted), set up the database and backend or use Supabase and run the provided migration.
