import { json } from '@/lib/http'
import { ACTIVE_STATUSES, ORDER_STATUSES } from '@/lib/order-status'
import { listOrders } from '@/lib/orders'
import { requireRegister } from '@/lib/register-auth'

// Staff — orders for the kitchen, oldest first.
//   ?status=received,preparing   which statuses (default is the active ones)
//   ?since=2026-09-16T00:00:00+10:00   only orders placed after this time
export async function GET(request) {
    const denied = await requireRegister(request)
    if (denied) return denied

    const params = new URL(request.url).searchParams

    const statuses = params.get('status')?.split(',').map((s) => s.trim()).filter(Boolean) ?? ACTIVE_STATUSES
    const unknown = statuses.filter((s) => !ORDER_STATUSES.includes(s))
    if (statuses.length === 0 || unknown.length) {
        return json({ error: 'invalid', message: `Unknown status: ${unknown.join(', ') || '(none)'}` }, 400)
    }

    let since = null
    if (params.has('since')) {
        since = new Date(params.get('since'))
        if (Number.isNaN(since.getTime())) return json({ error: 'invalid', message: '`since` must be a date' }, 400)
    }

    return json({ orders: await listOrders({ statuses, since }) })
}
