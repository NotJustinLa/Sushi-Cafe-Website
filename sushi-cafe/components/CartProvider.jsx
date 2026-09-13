'use client'

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from 'react'
import { findMenuItem } from '@/lib/menu'

const CartContext = createContext(null)

// ── Saved cart (localStorage) ─────────────────────────────────────────
// The cart lives in localStorage so it survives a refresh or an app switch.
// React reads it through useSyncExternalStore, which renders an empty cart on
// the server and during hydration, then swaps in the saved one — so the
// server's HTML and the browser's first render always match (no hydration error).

const STORAGE_KEY = 'sushi-cafe:cart'
const EMPTY = []
let cache = null // parsed cart; same array back until it changes, as React requires
const listeners = new Set()

// Rebuild a saved cart from the menu: keep only ids + quantities from storage,
// take name/size/price from the menu. Drops anything no longer on the menu,
// and means a price change (or a hand-edited localStorage) never shows a stale price.
function restoreCart(saved) {
    if (!Array.isArray(saved)) return EMPTY
    return saved.flatMap((line) => {
        const item = findMenuItem(line?.id)
        if (!item || !Number.isInteger(line.qty) || line.qty < 1) return []
        return [{ id: item.id, name: item.name, variant: item.variant ?? undefined, price: item.priceCents / 100, qty: line.qty }]
    })
}

function readCart() {
    if (cache === null) {
        try {
            cache = restoreCart(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))
        } catch {
            cache = EMPTY // corrupt JSON or storage blocked (e.g. private mode) — start empty
        }
    }
    return cache
}

function writeCart(next) {
    cache = next
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
        // Storage full or blocked — the cart still works, it just won't survive a refresh.
    }
    listeners.forEach((notify) => notify())
}

function subscribe(notify) {
    listeners.add(notify)
    // Another tab changed the cart → re-read it here too.
    function onStorage(e) {
        if (e.key !== STORAGE_KEY) return
        cache = null
        notify()
    }
    window.addEventListener('storage', onStorage)
    return () => {
        listeners.delete(notify)
        window.removeEventListener('storage', onStorage)
    }
}

const getServerCart = () => EMPTY

// Same call shape as useState's setter — takes the next cart, or a function
// of the current one — so the functions below read the same.
function setItems(update) {
    writeCart(typeof update === 'function' ? update(readCart()) : update)
}

// Wrap the app once (in layout) so every card shares one cart.
export function CartProvider({ children }) {
    const items = useSyncExternalStore(subscribe, readCart, getServerCart)
    const [drawerOpen, setDrawerOpen] = useState(false)
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
    // Set the quantity of a line item. If qty is 0 or less, remove it.
    function setQty(id, qty) {
        setItems((prev) =>
        qty <=0 
            ? prev.filter((line) => line.id !== id)
            : prev.map((line) =>
                line.id === id ? { ...line, qty } : line
            )
        )
    }

    function removeItem(id) {
        setItems((prev) => prev.filter((line) => line.id !== id))
    }

    function clearCart() {
        setItems([])
    }

    // useCallback keeps these the same function across renders. The drawer's
    // effect depends on closeDrawer — a fresh function every render would make
    // it stop/restart Lenis on every +/− click.
    const openDrawer = useCallback(() => setDrawerOpen(true), [])
    const closeDrawer = useCallback(() => setDrawerOpen(false), [])

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
        <CartContext.Provider value={{ items, addItem, setQty, removeItem, clearCart, count, total, drawerOpen, openDrawer, closeDrawer }}>
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
