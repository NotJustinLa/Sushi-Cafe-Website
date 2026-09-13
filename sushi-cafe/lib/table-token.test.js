import { beforeAll, describe, expect, it } from 'vitest'
import { createTableToken, readTableToken, TOKEN_TTL_MINUTES } from './table-token'

beforeAll(() => {
    process.env.TABLE_TOKEN_SECRET = 'test-secret-not-the-real-one'
})

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')

describe('table tokens', () => {
    it('reads back a valid token', () => {
        const data = readTableToken(createTableToken('session-1', 7))
        expect(data).toMatchObject({ sid: 'session-1', tbl: 7 })
    })

    it('expires after TOKEN_TTL_MINUTES', () => {
        const start = Date.now()
        const token = createTableToken('session-1', 7, start)
        expect(readTableToken(token, start + (TOKEN_TTL_MINUTES - 1) * 60_000)).not.toBeNull()
        expect(readTableToken(token, start + TOKEN_TTL_MINUTES * 60_000)).toBeNull()
    })

    it('rejects a token with the table number changed', () => {
        const [, sig] = createTableToken('session-1', 7).split('.')
        const forged = `${b64({ sid: 'session-1', tbl: 3, exp: Date.now() + 9e9 })}.${sig}`
        expect(readTableToken(forged)).toBeNull()
    })

    it('rejects a token with the signature changed', () => {
        const [payload, sig] = createTableToken('session-1', 7).split('.')
        const flipped = sig.slice(0, -1) + (sig.at(-1) === 'A' ? 'B' : 'A')
        expect(readTableToken(`${payload}.${flipped}`)).toBeNull()
    })

    it('rejects a token signed with a different secret', () => {
        const token = createTableToken('session-1', 7)
        process.env.TABLE_TOKEN_SECRET = 'rotated-secret'
        expect(readTableToken(token)).toBeNull()
        process.env.TABLE_TOKEN_SECRET = 'test-secret-not-the-real-one'
    })

    it('rejects garbage', () => {
        for (const junk of [undefined, null, '', 'nope', 'a.b.c', '.', 'x.']) {
            expect(readTableToken(junk)).toBeNull()
        }
    })
})
