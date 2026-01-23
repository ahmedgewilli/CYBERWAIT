<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1z1yTrggCr78AQ-8O8-zLD5B7Ja7P4OAv

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Production environment variables (Vercel)

Set these in Vercel project settings:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` (optional fallback)

Never expose the service role key in client code. It must only be used in server-side environments such as Vercel serverless functions.

## Deployment (Vercel)

This app is deployed on Vercel using serverless functions in `/api` and a SPA fallback to `index.html`. There is no separate backend service to run.

## Local API proxy (optional)

By default, the app calls `/api/*` directly (for Vercel serverless functions). If you want Vite to proxy `/api` to a local backend on port 5000 during development, set:

- `VITE_USE_LOCAL_API_PROXY=true`
