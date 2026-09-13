import 'server-only'
import { createSignedToken, readSignedToken } from './signed-token'

// The QR scan gives each phone a signed, short-lived token in this cookie.
// It says which table session the phone belongs to and when it expires.
// Anyone who edits it breaks the signature, so they can't switch tables or
// extend it. It only works while the session is still open (checked separately).
export const TABLE_COOKIE = 'table_token'
export const TOKEN_TTL_MINUTES = 120

export function createTableToken(sessionId, tableNumber, now = Date.now()) {
    return createSignedToken(
        { sid: sessionId, tbl: tableNumber, exp: now + TOKEN_TTL_MINUTES * 60_000 },
        process.env.TABLE_TOKEN_SECRET
    )
}

// Returns { sid, tbl, exp }, or null if the token is missing, edited, or expired.
// The caller must still check that session `sid` is open in the database.
export function readTableToken(token, now = Date.now()) {
    return readSignedToken(token, process.env.TABLE_TOKEN_SECRET, now)
}
