import { createClient } from '@supabase/supabase-js';

/** Extract the Supabase project ref from a project URL, e.g. "aihdlaiku..." */
function getUrlRef(url) {
  return url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;
}

/** Extract the project ref embedded in a Supabase JWT payload */
function getJwtRef(token) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('utf8')
    );
    return payload.ref ?? null;
  } catch {
    return null;
  }
}

export function createSupabaseServerClient() {
  // VITE_SUPABASE_URL is the active/live project — prefer it first.
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    console.warn('createSupabaseServerClient: No Supabase URL found in env vars.');
    return null;
  }

  // Validate that the service role key actually belongs to the same project as the URL.
  // Keys from a deleted/old project will cause ENOTFOUND or "Invalid API key" errors.
  let validatedServiceRole = null;
  if (serviceRole) {
    const urlRef = getUrlRef(url);
    const keyRef = getJwtRef(serviceRole);
    if (urlRef && keyRef && urlRef === keyRef) {
      validatedServiceRole = serviceRole;
      console.log(`createSupabaseServerClient: using service role key for project '${urlRef}'`);
    } else {
      console.warn(
        `createSupabaseServerClient: SUPABASE_SERVICE_ROLE_KEY is for project '${keyRef}' ` +
        `but URL points to '${urlRef}' — ignoring mismatched key, falling back to anon.`
      );
    }
  }

  if (!validatedServiceRole) {
    console.warn('createSupabaseServerClient: using anon key — writes may be blocked by RLS.');
  }

  const key = validatedServiceRole || anon;
  return createClient(url, key, { auth: { persistSession: false } });
}
