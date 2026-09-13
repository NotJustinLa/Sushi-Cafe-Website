// Fails the build if this file is ever imported into client code —
// the service role key bypasses RLS and must never reach the browser.
import 'server-only'

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
    throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — check .env.local (or Vercel env vars)'
    )
}

// One shared client for all route handlers. No user logins on the server,
// so there's no session to persist or refresh.
export const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
})
