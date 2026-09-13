import { json } from '@/lib/http'
import { getCurrentTable } from '@/lib/tables'

// Which table is this phone at, and can it order? The cart drawer (M3) and
// the /table page (M4) call this. Orders + running total are filled in by M4.
export async function GET() {
    const table = await getCurrentTable()

    if (table.status === 'no_token') {
        return json({ tableNumber: null, reason: 'no_token' })
    }
    if (table.status === 'table_closed') {
        return json({ tableNumber: table.tableNumber, open: false, reason: 'table_closed' })
    }
    return json({
        tableNumber: table.tableNumber,
        open: true,
        expiresAt: table.expiresAt,
        orders: [],
        runningTotalCents: 0,
    })
}
