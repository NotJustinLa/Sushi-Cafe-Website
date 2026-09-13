import { beforeAll, describe, expect, it, vi } from 'vitest'

// staff-session imports next/headers for hasStaffSession(); these tests only
// cover the pure functions, so stub it out.
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }))

const { createStaffSession, passcodeMatches, readStaffSession, STAFF_SESSION_HOURS } = await import('./staff-session')
const { createTableToken } = await import('./table-token')

beforeAll(() => {
    process.env.STAFF_SESSION_SECRET = 'staff-test-secret'
    process.env.TABLE_TOKEN_SECRET = 'table-test-secret'
    process.env.STAFF_PASSCODE = '1010'
})

describe('staff sessions', () => {
    it('reads back a fresh session', () => {
        expect(readStaffSession(createStaffSession())).toMatchObject({ role: 'staff' })
    })

    it(`expires after ${STAFF_SESSION_HOURS} hours`, () => {
        const start = Date.now()
        const token = createStaffSession(start)
        expect(readStaffSession(token, start + (STAFF_SESSION_HOURS - 1) * 3_600_000)).not.toBeNull()
        expect(readStaffSession(token, start + STAFF_SESSION_HOURS * 3_600_000)).toBeNull()
    })

    it('rejects an edited session', () => {
        const [payload, sig] = createStaffSession().split('.')
        const forever = Buffer.from(JSON.stringify({ role: 'staff', exp: Date.now() + 9e12 })).toString('base64url')
        expect(readStaffSession(`${forever}.${sig}`)).toBeNull()
        expect(readStaffSession(`${payload}.${sig.slice(0, -1)}x`)).toBeNull()
    })

    it('never accepts a guest table token as a staff session', () => {
        expect(readStaffSession(createTableToken('session-1', 7))).toBeNull()
    })

    it('rejects garbage', () => {
        for (const junk of [undefined, '', 'nope', 'a.b']) expect(readStaffSession(junk)).toBeNull()
    })
})

describe('passcodeMatches', () => {
    it('accepts only the exact passcode', () => {
        expect(passcodeMatches('1010')).toBe(true)
        for (const wrong of ['1011', '101', '10100', '', undefined, null, 1010.5]) expect(passcodeMatches(wrong)).toBe(false)
    })

    it('fails closed when STAFF_PASSCODE is not set', () => {
        const saved = process.env.STAFF_PASSCODE
        delete process.env.STAFF_PASSCODE
        expect(passcodeMatches('')).toBe(false)
        expect(passcodeMatches(undefined)).toBe(false)
        process.env.STAFF_PASSCODE = saved
    })
})
