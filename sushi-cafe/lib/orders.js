import 'server-only'
import { supabase } from './supabase-server'

const ORDER_COLUMNS = 'order_number, table_number, items, total_cents, note, status, created_at'

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
    }
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
// Cancelled orders are left out of both.
export async function getSessionBill(sessionId) {
    const { data, error } = await supabase
        .from('orders')
        .select(ORDER_COLUMNS)
        .eq('session_id', sessionId)
        .neq('status', 'cancelled')
        .order('order_number')
    if (error) throw error

    const orders = data.map(toOrderJson)
    return { orders, totalCents: orders.reduce((sum, o) => sum + o.totalCents, 0) }
}
