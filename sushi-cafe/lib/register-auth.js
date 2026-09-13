import 'server-only'
import { timingSafeEqual } from 'node:crypto'
import { json } from './http'

// Every /api/register/* handler starts with:
//   const denied = requireRegister(request)
//   if (denied) return denied
// Returns a 401 response unless the request carries
// "Authorization: Bearer <REGISTER_API_KEY>", otherwise null.
export function requireRegister(request) {
    const expected = process.env.REGISTER_API_KEY
    const header = request.headers.get('authorization') ?? ''
    const given = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''

    // Fail closed: a missing env var locks the register out rather than letting everyone in.
    if (!expected || !sameString(given, expected)) {
        return json({ error: 'unauthorized' }, 401)
    }
    return null
}

// Constant-time compare, so response timing can't leak how much of a guess
// was right. timingSafeEqual throws on different lengths, so check that first.
function sameString(a, b) {
    const x = Buffer.from(a)
    const y = Buffer.from(b)
    return x.length === y.length && timingSafeEqual(x, y)
}
