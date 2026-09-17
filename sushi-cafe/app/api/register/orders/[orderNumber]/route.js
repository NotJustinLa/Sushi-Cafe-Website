import { json } from '@/lib/http'
import { ORDER_STATUSES } from '@/lib/order-status'
import { updateOrderStatus } from '@/lib/orders'
import { requireRegister } from '@/lib/register-auth'

// Staff — move an order along by sending a new status (preparing, ready, served, or cancelled).
export async function PATCH(request, { params }) {
    const denied = await requireRegister(request)
    if (denied) return denied

    const raw = (await params).orderNumber
    if (!/^\d{1,12}$/.test(raw)) return json({ error: 'not_found' }, 404)

    let body
    try {
        body = await request.json()
    } catch {
        return json({ error: 'invalid', message: 'Request body must be JSON.' }, 400)
    }
    if (!ORDER_STATUSES.includes(body?.status)) {
        return json({ error: 'invalid', message: `status must be one of: ${ORDER_STATUSES.join(', ')}` }, 400)
    }

    const { order, error, from } = await updateOrderStatus(Number(raw), body.status)
    if (error === 'not_found') return json({ error }, 404)
    if (error === 'bad_transition') return json({ error, from, to: body.status }, 409)
    if (error === 'conflict') return json({ error, message: 'Someone else just changed this order. Refresh.' }, 409)
    return json({ order })
}
