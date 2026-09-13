import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

// The QR scan gives each phone a signed, short-lived token in this cookie.
// It says which table session the phone belongs to and when it expires.
// Anyone who edits it breaks the signature, so they can't switch tables or
// extend it. It only works while the session is still open (checked separately).
export const TABLE_COOKIE = 'table_token'
export const TOKEN_TTL_MINUTES = 120

const sign = (data) => createHmac('sha256', process.env.TABLE_TOKEN_SECRET).update(data).digest('base64url')

export function createTableToken(sessionId, tableNumber, now = Date.now()) {
    const payload = Buffer.from(JSON.stringify({
        sid: sessionId, tbl: tableNumber, exp: now + TOKEN_TTL_MINUTES * 60_000,
    })).toString('base64url')
    return `${payload}.${sign(payload)}`
}

// Returns { sid, tbl, exp }, or null if the token is missing, edited, or expired.
// The caller must still check that session `sid` is open in the database.
export function readTableToken(token, now = Date.now()) {
    const [payload, sig] = String(token ?? '').split('.')
    if (!payload || !sig) return null
    const expected = Buffer.from(sign(payload))
    const given = Buffer.from(sig)
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
        return data.exp > now ? data : null
    } catch {
        return null
    }
}
