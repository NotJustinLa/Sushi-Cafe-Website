import 'server-only'
import { canTransition } from './order-status'
import { supabase } from './supabase-server'

const ORDER_COLUMNS = 'order_number, table_number, items, total_cents, note, status, created_at, ready_at'

// Database row → the shape the API sends (camelCase, like the rest of §5).
export function toOrderJson(row) {
    return {
        orderNumber: row.order_number,
        tableNumber: row.table_number,
        items: row.items,
        totalCents: row.total_cents,
        note: row.note,
        status: row.status,
        createdAt: row.created_at,
        readyAt: row.ready_at,
    }
}

// Register: orders in the given statuses, oldest first so the kitchen works
// through them in order. `since` (a Date) limits it to orders placed after it.
// Each order also says whether its table has since been closed (paid), so the
// kitchen can spot orders left behind when a group paid before being served.
export async function listOrders({ statuses, since }) {
    let query = supabase
        .from('orders')
        .select(`${ORDER_COLUMNS}, table_sessions(closed_at)`)
        .in('status', statuses)
        .order('order_number')
    if (since) query = query.gte('created_at', since.toISOString())

    const { data, error } = await query
    if (error) throw error
    return data.map((row) => ({ ...toOrderJson(row), tableClosed: Boolean(row.table_sessions?.closed_at) }))
}

// Register: move an order to a new status. Returns { order } or { error }.
// The update only applies if the order is still in the status we read, so
// two taps (or two screens) at once can't both apply — the second gets a conflict.
export async function updateOrderStatus(orderNumber, status) {
    const { data: current, error: readError } = await supabase
        .from('orders')
        .select('status')
        .eq('order_number', orderNumber)
        .maybeSingle()
    if (readError) throw readError
    if (!current) return { error: 'not_found' }
    if (!canTransition(current.status, status)) return { error: 'bad_transition', from: current.status }

    const now = new Date().toISOString()
    const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: now, ...(status === 'ready' ? { ready_at: now } : {}) })
        .eq('order_number', orderNumber)
        .eq('status', current.status)
        .select(ORDER_COLUMNS)
        .maybeSingle()
    if (error) throw error
    if (!data) return { error: 'conflict' } // someone else changed it first
    return { order: toOrderJson(data) }
}

// Register: order count + running total for each of these sessions
// (cancelled orders don't count). Returns Map(sessionId → { orderCount, runningTotalCents }).
export async function getSessionTotals(sessionIds) {
    const totals = new Map(sessionIds.map((id) => [id, { orderCount: 0, runningTotalCents: 0 }]))
    if (sessionIds.length === 0) return totals

    const { data, error } = await supabase
        .from('orders')
        .select('session_id, total_cents')
        .in('session_id', sessionIds)
        .neq('status', 'cancelled')
    if (error) throw error

    for (const row of data) {
        const t = totals.get(row.session_id)
        t.orderCount += 1
        t.runningTotalCents += row.total_cents
    }
    return totals
}

// Save an order. Prices must already come from priceOrder() — never the browser.
export async function createOrder({ tableNumber, sessionId, items, totalCents, note }) {
    const { data, error } = await supabase
        .from('orders')
        .insert({
            table_number: tableNumber,
            session_id: sessionId,
            items,
            total_cents: totalCents,
            note: note || null,
        })
        .select(ORDER_COLUMNS)
        .single()
    if (error) throw error
    return toOrderJson(data)
}

// Everything a table session ordered, oldest first, plus the total to pay.
// Cancelled orders never count towards the total. They're left out of the
// list too, unless includeCancelled — the guest's /table page shows them
// ("Cancelled — please see the counter"); the register's final bill doesn't.
export async function getSessionBill(sessionId, { includeCancelled = false } = {}) {
    let query = supabase
        .from('orders')
        .select(ORDER_COLUMNS)
        .eq('session_id', sessionId)
        .order('order_number')
    if (!includeCancelled) query = query.neq('status', 'cancelled')

    const { data, error } = await query
    if (error) throw error

    const orders = data.map(toOrderJson)
    const totalCents = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.totalCents, 0)
    return { orders, totalCents }
}
