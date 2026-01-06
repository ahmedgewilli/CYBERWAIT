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
- Optionally, if you use Supabase directly from the frontend, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel as well.
- After setting env vars, redeploy (or trigger a new deployment) — the frontend will use `VITE_API_URL` to fetch menu items and to POST orders.

Notes:
- The frontend falls back to Supabase (if configured) or to the built-in static menu when no backend is provided.
- If you want me to deploy the backend + database and set the env vars, tell me which provider you prefer (Render, Railway, or I can prepare a Dockerfile and instructions).
Notes:
- If you prefer Vercel for more powerful hosting (custom domains, serverless functions, environment variables), I can add a Vercel configuration and instructions instead.
- The app will work as a static demo without a database (the frontend uses a static fallback `MENU_ITEMS`). For a full end-to-end demo (orders persisted), set up the database and backend or use Supabase and run the provided migration.
