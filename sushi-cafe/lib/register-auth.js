import 'server-only'
import { json } from './http'
import { safeEqual } from './signed-token'
import { hasStaffSession } from './staff-session'

// Every /api/register/* handler starts with:
//   const denied = await requireRegister(request)
//   if (denied) return denied
// Lets the request through if it carries EITHER
//   - "Authorization: Bearer <REGISTER_API_KEY>"  (curl, scripts), or
//   - a valid staff_session cookie                 (the /register pages),
// otherwise returns a 401 response.
export async function requireRegister(request) {
    const expected = process.env.REGISTER_API_KEY
    const header = request.headers.get('authorization') ?? ''
    const given = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''

    // A missing env var never lets a key through (fail closed).
    if (expected && given && safeEqual(given, expected)) return null
    if (await hasStaffSession()) return null

    return json({ error: 'unauthorized' }, 401)
}
