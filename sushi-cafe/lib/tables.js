import 'server-only'
import { cookies } from 'next/headers'
import { supabase } from './supabase-server'
import { readTableToken, TABLE_COOKIE } from './table-token'

// Table codes are 12 hex characters (see dining_tables in the migration).
// Checking the shape first means junk URLs never reach the database.
const CODE_SHAPE = /^[0-9a-f]{12}$/

// "7" → 7. Anything that isn't a 1–2 digit number → null.
export function parseTableNumber(value) {
    return /^\d{1,2}$/.test(String(value)) ? Number(value) : null
}

// The table number for an active QR code, or null.
export async function findTableByCode(code) {
    if (!CODE_SHAPE.test(String(code))) return null
    const { data, error } = await supabase
        .from('dining_tables')
        .select('table_number')
        .eq('code', code)
        .eq('active', true)
        .maybeSingle()
    if (error) throw error
    return data?.table_number ?? null
}

// The table's open session, or null if staff haven't opened it.
export async function getOpenSession(tableNumber) {
    const { data, error } = await supabase
        .from('table_sessions')
        .select('id, table_number, opened_at')
        .eq('table_number', tableNumber)
        .is('closed_at', null)
        .maybeSingle()
    if (error) throw error
    return data
}

export async function getSession(id) {
    const { data, error } = await supabase
        .from('table_sessions')
        .select('id, table_number, opened_at, closed_at')
        .eq('id', id)
        .maybeSingle()
    if (error) throw error
    return data
}

// Staff: a group sat down. Returns { session } or { error }.
export async function openTable(tableNumber) {
    const { data, error } = await supabase
        .from('table_sessions')
        .insert({ table_number: tableNumber })
        .select('id, table_number, opened_at')
        .single()
    if (error?.code === '23505') return { error: 'already_open' } // one_open_session_per_table
    if (error?.code === '23503') return { error: 'unknown_table' } // no such dining_tables row
    if (error) throw error
    return { session: data }
}

// Staff: the group has paid. Returns the closed session, or null if the table wasn't open.
export async function closeTable(tableNumber) {
    const { data, error } = await supabase
        .from('table_sessions')
        .update({ closed_at: new Date().toISOString() })
        .eq('table_number', tableNumber)
        .is('closed_at', null)
        .select('id, table_number, opened_at, closed_at')
        .maybeSingle()
    if (error) throw error
    return data
}

// Every table, with its open session if it has one.
export async function listTables() {
    const [tables, sessions] = await Promise.all([
        supabase.from('dining_tables').select('table_number').order('table_number'),
        supabase.from('table_sessions').select('id, table_number, opened_at').is('closed_at', null),
    ])
    if (tables.error) throw tables.error
    if (sessions.error) throw sessions.error

    const openByTable = new Map(sessions.data.map((s) => [s.table_number, s]))
    return tables.data.map(({ table_number }) => {
        const session = openByTable.get(table_number)
        return session
            ? { tableNumber: table_number, open: true, sessionId: session.id, openedAt: session.opened_at }
            : { tableNumber: table_number, open: false }
    })
}

// Which table is this phone at? Reads the token cookie and checks the session
// is still open. Used by GET /api/table now, and by POST /api/orders in M3.
//   { status: 'no_token' }                                   no/edited/expired token
//   { status: 'table_closed', tableNumber }                  staff closed the table
//   { status: 'open', tableNumber, sessionId, expiresAt }    ok to order
export async function getCurrentTable() {
    const token = readTableToken((await cookies()).get(TABLE_COOKIE)?.value)
    if (!token) return { status: 'no_token' }

    const session = await getSession(token.sid)
    if (!session || session.closed_at) return { status: 'table_closed', tableNumber: token.tbl }

    return {
        status: 'open',
        tableNumber: token.tbl,
        sessionId: session.id,
        expiresAt: new Date(token.exp).toISOString(),
    }
}
