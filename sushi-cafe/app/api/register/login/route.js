import { cookies } from 'next/headers'
import { json } from '@/lib/http'
import { createStaffSession, passcodeMatches, STAFF_COOKIE, STAFF_SESSION_HOURS } from '@/lib/staff-session'

// Staff: { "passcode": "…" } → sets the staff_session cookie for a shift.
export async function POST(request) {
    let body
    try {
        body = await request.json()
    } catch {
        return json({ error: 'invalid', message: 'Request body must be JSON.' }, 400)
    }

    if (!passcodeMatches(body?.passcode)) {
        // A short pause on every wrong guess makes trying all 4-digit codes slow.
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return json({ error: 'wrong_passcode', message: 'Wrong passcode.' }, 401)
    }

    ;(await cookies()).set(STAFF_COOKIE, createStaffSession(), {
        httpOnly: true, // page scripts can't read it
        sameSite: 'lax', // other sites can't make this browser send it with a POST
        secure: process.env.NODE_ENV === 'production',
        maxAge: STAFF_SESSION_HOURS * 3600,
        path: '/',
    })
    return json({ ok: true })
}
