import { json } from '@/lib/http'
import { getSessionBill } from '@/lib/orders'
import { requireRegister } from '@/lib/register-auth'
import { getOpenSession, parseTableNumber } from '@/lib/tables'

// Staff: the bill for an open table, WITHOUT closing it — shown before
// "Paid — close table". Same shape as the close response.
export async function GET(request, { params }) {
    const denied = await requireRegister(request)
    if (denied) return denied

    const tableNumber = parseTableNumber((await params).tableNumber)
    if (!tableNumber) return json({ error: 'unknown_table' }, 404)

    const session = await getOpenSession(tableNumber)
    if (!session) return json({ error: 'not_open' }, 404)

    const { orders, totalCents } = await getSessionBill(session.id)
    return json({ tableNumber, openedAt: session.opened_at, orders, totalCents })
}
