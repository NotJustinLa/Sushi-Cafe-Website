import 'server-only'
import { cookies } from 'next/headers'
import { createSignedToken, readSignedToken, safeEqual } from './signed-token'

// Staff log in to /register with a shared passcode (STAFF_PASSCODE) and get
// this signed, httpOnly cookie for a shift. Same signing as the table tokens,
// with its own secret, so a table token can never pass as a staff session.
export const STAFF_COOKIE = 'staff_session'
export const STAFF_SESSION_HOURS = 12

export function createStaffSession(now = Date.now()) {
    return createSignedToken(
        { role: 'staff', exp: now + STAFF_SESSION_HOURS * 3_600_000 },
        process.env.STAFF_SESSION_SECRET
    )
}

// The session payload, or null if missing / edited / expired.
export function readStaffSession(token, now = Date.now()) {
    const payload = readSignedToken(token, process.env.STAFF_SESSION_SECRET, now)
    return payload?.role === 'staff' ? payload : null
}

export function passcodeMatches(given) {
    const expected = process.env.STAFF_PASSCODE
    return Boolean(expected) && safeEqual(String(given ?? ''), expected)
}

// For server components and route handlers — is this request logged in as staff?
export async function hasStaffSession() {
    return readStaffSession((await cookies()).get(STAFF_COOKIE)?.value) !== null
}
