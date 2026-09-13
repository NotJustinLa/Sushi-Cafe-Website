import { describe, expect, it } from 'vitest'
import { canTransition, ORDER_STATUSES } from './order-status'

describe('canTransition', () => {
    it('allows the normal kitchen flow', () => {
        expect(canTransition('received', 'preparing')).toBe(true)
        expect(canTransition('preparing', 'ready')).toBe(true)
        expect(canTransition('ready', 'served')).toBe(true)
    })

    it('lets a small kitchen skip "preparing"', () => {
        expect(canTransition('received', 'ready')).toBe(true)
    })

    it('allows cancelling before the food is ready, not after', () => {
        expect(canTransition('received', 'cancelled')).toBe(true)
        expect(canTransition('preparing', 'cancelled')).toBe(true)
        expect(canTransition('ready', 'cancelled')).toBe(false)
        expect(canTransition('served', 'cancelled')).toBe(false)
    })

    it('never goes backwards or out of a finished state', () => {
        expect(canTransition('ready', 'preparing')).toBe(false)
        expect(canTransition('served', 'ready')).toBe(false)
        expect(canTransition('cancelled', 'received')).toBe(false)
        for (const s of ORDER_STATUSES) expect(canTransition(s, s)).toBe(false)
    })

    it('rejects unknown statuses', () => {
        expect(canTransition('received', 'eaten')).toBe(false)
        expect(canTransition('nope', 'ready')).toBe(false)
        expect(canTransition('constructor', 'ready')).toBe(false)
    })
})
