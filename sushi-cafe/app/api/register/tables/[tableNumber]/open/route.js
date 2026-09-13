import { json } from '@/lib/http'
import { requireRegister } from '@/lib/register-auth'
import { openTable, parseTableNumber } from '@/lib/tables'

// Staff: a group sat down. Opens the table so its QR code starts working.
export async function POST(request, { params }) {
    const denied = requireRegister(request)
    if (denied) return denied

    const tableNumber = parseTableNumber((await params).tableNumber)
    if (!tableNumber) return json({ error: 'unknown_table' }, 404)

    const { session, error } = await openTable(tableNumber)
    if (error === 'already_open') return json({ error: 'already_open' }, 409)
    if (error === 'unknown_table') return json({ error: 'unknown_table' }, 404)

    return json({ tableNumber, sessionId: session.id, openedAt: session.opened_at }, 201)
}
