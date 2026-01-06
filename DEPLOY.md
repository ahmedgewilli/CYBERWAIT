Deploy (Quick demo)

This repository includes a GitHub Actions workflow (`.github/workflows/pages.yml`) that builds the Vite frontend and deploys it to GitHub Pages whenever you push to `main`.

What I changed to support Pages:
- Set `base: './'` in `vite.config.ts` so assets use relative paths and the site works when served from Pages.
- Added `.github/workflows/pages.yml` to build and publish the `dist` folder.

How to use:
1. Push the current `main` branch (already done). The workflow will run automatically.
2. Visit the **Actions** tab in your repo to see the build & Pages deploy status.
3. When the deployment completes, check **Settings → Pages** for the public URL.

Notes:
- If you prefer Vercel for more powerful hosting (custom domains, serverless functions, environment variables), I can add a Vercel configuration and instructions instead.
- The app will work as a static demo without a database (the frontend uses a static fallback `MENU_ITEMS`). For a full end-to-end demo (orders persisted), set up the database and backend or use Supabase and run the provided migration.
