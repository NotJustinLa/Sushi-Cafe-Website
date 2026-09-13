import { cookies } from 'next/headers'
import { json } from '@/lib/http'
import { STAFF_COOKIE } from '@/lib/staff-session'

// Staff: end the shift on this device.
export async function POST() {
    ;(await cookies()).delete(STAFF_COOKIE)
    return json({ ok: true })
}
