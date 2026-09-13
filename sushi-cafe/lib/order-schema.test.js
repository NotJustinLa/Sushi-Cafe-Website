import { describe, expect, it } from 'vitest'
import { MAX_LINES, orderSchema } from './order-schema'

const ok = (body) => orderSchema.safeParse(body).success
const line = (qty = 1, id = 'mixed-sushi-platter') => ({ id, qty })

describe('orderSchema', () => {
    it('accepts items with an optional note', () => {
        expect(ok({ items: [line(2)] })).toBe(true)
        expect(ok({ items: [line()], note: 'No wasabi please' })).toBe(true)
    })

    it('rejects an empty cart', () => {
        expect(ok({ items: [] })).toBe(false)
        expect(ok({})).toBe(false)
    })

    it('rejects quantities that are zero, too big, fractional, or strings', () => {
        for (const qty of [0, -1, 21, 1.5, '2']) expect(ok({ items: [line(qty)] })).toBe(false)
        expect(ok({ items: [line(20)] })).toBe(true)
    })

    it(`rejects more than ${MAX_LINES} lines`, () => {
        expect(ok({ items: Array.from({ length: MAX_LINES }, () => line()) })).toBe(true)
        expect(ok({ items: Array.from({ length: MAX_LINES + 1 }, () => line()) })).toBe(false)
    })

    it('rejects a note over 200 characters, and trims it', () => {
        expect(ok({ items: [line()], note: 'x'.repeat(201) })).toBe(false)
        expect(orderSchema.parse({ items: [line()], note: '  hi  ' }).note).toBe('hi')
    })

    it('strips anything else the browser sends (prices, totals, table numbers)', () => {
        const data = orderSchema.parse({
            items: [{ id: 'mixed-sushi-platter', qty: 1, price: 0.01 }],
            totalCents: 1,
            tableNumber: 3,
        })
        expect(data).toEqual({ items: [{ id: 'mixed-sushi-platter', qty: 1 }] })
    })
})
