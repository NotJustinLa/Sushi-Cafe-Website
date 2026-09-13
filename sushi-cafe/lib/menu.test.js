import { describe, expect, it } from 'vitest'
import { findMenuItem, itemId, menuItems, platters, priceOrder } from './menu'

describe('menuItems', () => {
    it('has one entry per size (3 handroll sizes + 5 single-price platters)', () => {
        expect(menuItems).toHaveLength(8)
    })

    it('has unique ids', () => {
        const ids = menuItems.map((item) => item.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it('uses the same ids the cards put in the cart', () => {
        for (const p of platters) {
            const labels = p.sizes ? p.sizes.map((s) => s.label) : [undefined]
            for (const label of labels) {
                expect(findMenuItem(itemId(p.name, label))).not.toBeNull()
            }
        }
        expect(itemId('Handroll Platter', 'Medium')).toBe('handroll-platter-medium')
        expect(itemId('Sushi & Sashimi Platter')).toBe('sushi-sashimi-platter')
    })

    it('stores prices in cents', () => {
        expect(findMenuItem('handroll-platter-medium').priceCents).toBe(6700)
        expect(findMenuItem('salmon-sashimi-platter').priceCents).toBe(12000)
    })
})

describe('priceOrder', () => {
    it('totals the order from menu prices', () => {
        const { items, totalCents } = priceOrder([
            { id: 'handroll-platter-medium', qty: 2 },
            { id: 'salmon-sashimi-platter', qty: 1 },
        ])
        expect(totalCents).toBe(2 * 6700 + 12000)
        expect(items[0]).toEqual({
            id: 'handroll-platter-medium',
            name: 'Handroll Platter',
            variant: 'Medium',
            unitCents: 6700,
            qty: 2,
        })
    })

    it('merges duplicate ids into one line', () => {
        const { items, totalCents } = priceOrder([
            { id: 'mixed-sushi-platter', qty: 1 },
            { id: 'mixed-sushi-platter', qty: 2 },
        ])
        expect(items).toHaveLength(1)
        expect(items[0].qty).toBe(3)
        expect(totalCents).toBe(3 * 5500)
    })

    it('ignores any price sent with the line', () => {
        const { totalCents } = priceOrder([{ id: 'mixed-sushi-platter', qty: 1, price: 0.01 }])
        expect(totalCents).toBe(5500)
    })

    it('throws on an unknown id', () => {
        expect(() => priceOrder([{ id: 'free-sushi', qty: 1 }])).toThrow(/Unknown menu item/)
    })

    it('throws on a zero, negative, or fractional quantity', () => {
        for (const qty of [0, -1, 1.5, '2']) {
            expect(() => priceOrder([{ id: 'mixed-sushi-platter', qty }])).toThrow(/Invalid quantity/)
        }
    })
})
