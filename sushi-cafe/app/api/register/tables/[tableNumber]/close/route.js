import { json } from '@/lib/http'
import { getSessionBill } from '@/lib/orders'
import { requireRegister } from '@/lib/register-auth'
import { closeTable, parseTableNumber } from '@/lib/tables'

// Staff — the group has paid. Closes the table, and every phone at it stops being
// able to order straight away, even if its token hasn't expired.
export async function POST(request, { params }) {
    const denied = await requireRegister(request)
    if (denied) return denied

    const tableNumber = parseTableNumber((await params).tableNumber)
    if (!tableNumber) return json({ error: 'unknown_table' }, 404)

    const session = await closeTable(tableNumber)
    if (!session) return json({ error: 'not_open' }, 404)

    // The final bill, for the register to take payment.
    const { orders, totalCents } = await getSessionBill(session.id)
    return json({ tableNumber, orders, totalCents })
}
