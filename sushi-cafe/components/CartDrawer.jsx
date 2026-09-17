'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCart } from './CartProvider'
import { useLenis } from './LenisProvider'
import SendToKitchen from './SendToKitchen'

// Right-hand cart drawer — built from CART_DRAWER_TUTORIAL.md (Phases 3–7).
// The footer's action is Send to kitchen (M3) instead of the tutorial's Checkout stub.
export default function CartDrawer() {
    const { items, count, total, setQty, removeItem, clearCart, drawerOpen, closeDrawer } = useCart()
    const reduce = useReducedMotion()
    const lenis = useLenis()
    const closeButtonRef = useRef(null)

    // Escape closes, and page scroll is locked while open (Problem 3).
    useEffect(() => {
        if (!drawerOpen) return
        function handleEscape(e) {
            if (e.key === 'Escape') closeDrawer()
        }
        document.addEventListener('keydown', handleEscape)
        lenis?.stop()
        return () => {
            document.removeEventListener('keydown', handleEscape)
            lenis?.start()
        }
    }, [drawerOpen, lenis, closeDrawer])

    // Focus moves into the drawer on open, and back to whatever opened it
    // (the Cart button) on close (FR11).
    useEffect(() => {
        if (!drawerOpen) return
        const previouslyFocused = document.activeElement
        closeButtonRef.current?.focus()
        return () => previouslyFocused?.focus?.()
    }, [drawerOpen])

    return (
        <AnimatePresence>
            {drawerOpen && (
                <>
                    {/* BACKDROP — click to close */}
                    <motion.div
                        className="fixed inset-0 z-[200] bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeDrawer}
                    />

                    {/* PANEL. data-lenis-prevent: Lenis is stopped while the drawer
                        is open and would otherwise block the list's own scrolling. */}
                    <motion.aside
                        role="dialog"
                        aria-modal="true"
                        aria-label="Your cart"
                        data-lenis-prevent
                        className="fixed right-0 top-0 z-[200] flex h-full w-full max-w-[440px] flex-col bg-bg-paper text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]"
                        initial={reduce ? false : { x: '100%' }}
                        animate={{ x: 0 }}
                        exit={reduce ? { opacity: 0 } : { x: '100%' }}
                        transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                        {/* HEADER */}
                        <header className="flex items-center gap-4 border-b border-rule px-6 py-5">
                            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-mute">
                                Your Order
                            </span>
                            <span className="font-display text-[15px] font-bold">
                                {count} {count === 1 ? 'item' : 'items'}
                            </span>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={closeDrawer}
                                aria-label="Close cart"
                                className="pointer-events-auto ml-auto text-ink-mute transition-colors duration-200 hover:text-ink"
                            >
                                ✕
                            </button>
                        </header>

                        {items.length === 0 ? (
                            /* EMPTY STATE */
                            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                                <p className="m-0 text-ink-mute">Your cart is empty.</p>
                                <Link
                                    href="/#platters"
                                    onClick={closeDrawer}
                                    className="pointer-events-auto border-b border-red pb-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-red no-underline"
                                >
                                    Browse the platters
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* SCROLLING LIST */}
                                <ul className="m-0 flex-1 list-none overflow-y-auto px-6 py-2">
                                    {items.map((line) => (
                                        <li
                                            key={line.id}
                                            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-rule py-4"
                                        >
                                            <div className="flex min-w-0 flex-col gap-0.5">
                                                <span className="truncate font-display text-[15px] font-bold">{line.name}</span>
                                                {line.variant && (
                                                    <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-mute">
                                                        {line.variant}
                                                    </span>
                                                )}
                                                <span className="text-[12px] text-ink-mute">${line.price.toFixed(2)} each</span>
                                            </div>

                                            <span className="justify-self-end font-display text-[15px] font-bold">
                                                ${(line.price * line.qty).toFixed(2)}
                                            </span>

                                            <div className="flex items-center gap-3 font-mono text-[13px]">
                                                <button
                                                    type="button"
                                                    aria-label={`Decrease ${line.name}`}
                                                    onClick={() => setQty(line.id, line.qty - 1)}
                                                    className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full border border-rule text-ink transition-colors duration-200 hover:border-ink"
                                                >
                                                    −
                                                </button>
                                                <span aria-live="polite">{line.qty}</span>
                                                <button
                                                    type="button"
                                                    aria-label={`Increase ${line.name}`}
                                                    onClick={() => setQty(line.id, line.qty + 1)}
                                                    className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full border border-rule text-ink transition-colors duration-200 hover:border-ink"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                aria-label={`Remove ${line.name}`}
                                                onClick={() => removeItem(line.id)}
                                                className="pointer-events-auto justify-self-end font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute transition-colors duration-200 hover:text-red"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {/* FOOTER */}
                                <footer className="border-t border-rule px-6 py-5">
                                    <div className="mb-4 flex items-baseline justify-between font-display text-[18px] font-bold">
                                        <span>Subtotal</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <SendToKitchen />
                                    <button
                                        type="button"
                                        onClick={clearCart}
                                        className="pointer-events-auto mt-2 w-full py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute transition-colors duration-200 hover:text-red"
                                    >
                                        Clear cart
                                    </button>
                                </footer>
                            </>
                        )}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}
