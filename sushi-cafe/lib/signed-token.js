import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

// Small signed-token format shared by table tokens and staff sessions:
//   "<base64url JSON payload>.<HMAC-SHA256 signature>"
// Anyone can read the payload, but changing any of it breaks the signature,
// and only the server knows the secret. Payloads carry `exp` (ms since epoch).

const sign = (data, secret) => createHmac('sha256', secret).update(data).digest('base64url')

export function createSignedToken(payload, secret) {
    if (!secret) throw new Error('Missing signing secret — check .env.local')
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
    return `${data}.${sign(data, secret)}`
}

// The payload, or null if the token is missing, edited, signed with another
// secret, or past its `exp`.
export function readSignedToken(token, secret, now = Date.now()) {
    if (!secret) return null
    const [data, sig] = String(token ?? '').split('.')
    if (!data || !sig) return null
    if (!safeEqual(sig, sign(data, secret))) return null
    try {
        const payload = JSON.parse(Buffer.from(data, 'base64url').toString())
        return payload.exp > now ? payload : null
    } catch {
        return null
    }
}

// Constant-time string compare, so response timing can't reveal how much of a
// guess was right. timingSafeEqual throws on different lengths, so check first.
export function safeEqual(a, b) {
    const x = Buffer.from(String(a))
    const y = Buffer.from(String(b))
    return x.length === y.length && timingSafeEqual(x, y)
}
