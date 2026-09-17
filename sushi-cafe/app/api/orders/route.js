import { json } from '@/lib/http'
import { priceOrder } from '@/lib/menu'
import { MAX_QTY, orderSchema } from '@/lib/order-schema'
import { createOrder } from '@/lib/orders'
import { getCurrentTable } from '@/lib/tables'

// Guest — send the cart to the kitchen. The steps below run in order.
export async function POST(request) {
    // 1. Validate the body — ids, quantities, and an optional note only.
    let body
    try {
        body = await request.json()
    } catch {
        return json({ error: 'invalid', message: 'Request body must be JSON.' }, 400)
    }
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
        return json({
            error: 'invalid',
            message: parsed.error.issues[0].message,
            issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        }, 400)
    }

    // 2–3. The table comes from the signed token cookie, never the body, and
    // its session must still be open.
    const table = await getCurrentTable()
    if (table.status === 'no_token') {
        return json({ error: 'no_token', message: 'Scan the QR code on your table to order.' }, 401)
    }
    if (table.status === 'table_closed') {
        return json({ error: 'table_closed', message: 'This table is closed. Please see the counter.' }, 403)
    }

    // 4. Price it from the menu. Unknown ids are rejected.
    let priced
    try {
        priced = priceOrder(parsed.data.items)
    } catch (err) {
        return json({ error: 'unknown_item', message: err.message }, 400)
    }
    // Duplicate ids get merged, so recheck the limit on the merged quantity.
    if (priced.items.some((line) => line.qty > MAX_QTY)) {
        return json({ error: 'invalid', message: `Maximum ${MAX_QTY} of any one item.` }, 400)
    }

    // 5. Save it.
    const order = await createOrder({
        tableNumber: table.tableNumber,
        sessionId: table.sessionId,
        items: priced.items,
        totalCents: priced.totalCents,
        note: parsed.data.note,
    })

    // 6. Done the client clears the cart and goes to /table.
    return json({ orderNumber: order.orderNumber, tableNumber: order.tableNumber, totalCents: order.totalCents }, 201)
}
