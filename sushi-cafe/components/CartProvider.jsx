'use client'

import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

// Wrap the app once (in layout) so every card shares one cart.
export function CartProvider({ children }) {
    const [items, setItems] = useState([])

    // Add one unit of a line item. `id` must be unique *per variant* —
    // so "handroll-platter-small" and "handroll-platter-large" are separate
    // lines, but adding the same size twice just bumps its qty.
    function addItem({ id, name, variant, price }) {
        setItems((prev) => {
            const existing = prev.find((line) => line.id === id)
            if (existing) {
                return prev.map((line) =>
                    line.id === id ? { ...line, qty: line.qty + 1 } : line
                )
            }
            return [...prev, { id, name, variant, price, qty: 1 }]
        })
    }

    // Derived totals — recomputed only when items change.
    const { count, total } = useMemo(() => {
        return items.reduce(
            (acc, line) => ({
                count: acc.count + line.qty,
                total: acc.total + line.qty * line.price,
            }),
            { count: 0, total: 0 }
        )
    }, [items])

    return (
        <CartContext.Provider value={{ items, addItem, count, total }}>
            {children}
        </CartContext.Provider>
    )
}

// Convenience hook so components call `useCart()` instead of wiring context.
export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) {
        throw new Error('useCart must be used inside <CartProvider>')
    }
    return ctx
}
