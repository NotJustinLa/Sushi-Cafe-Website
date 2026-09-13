// TEMPORARY (M0) — proves the server can reach Supabase. Delete before launch (M6).
import { supabase } from '@/lib/supabase-server'

export async function GET() {
    // head: true → count only, no rows sent back.
    const { count, error } = await supabase
        .from('dining_tables')
        .select('*', { count: 'exact', head: true })

    if (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ tables: count })
}
