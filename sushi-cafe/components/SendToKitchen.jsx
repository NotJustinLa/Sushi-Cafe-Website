'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from './CartProvider'

// The cart drawer's footer action: sends the cart to the kitchen for this
// phone's table. The table comes from the phone's token cookie (set by
// scanning the QR code) — this component only asks the server which table it is.
export default function SendToKitchen() {
    const { items, total, clearCart, closeDrawer } = useCart()
    const router = useRouter()

    // null = still checking; otherwise the /api/table response.
    const [table, setTable] = useState(null)
    const [note, setNote] = useState('')
    const [sending, setSending] = useState(false)
    const [error, setError] = useState(null)

    // Ask the server which table this phone is at, each time the drawer opens.
    useEffect(() => {
        let cancelled = false
        fetch('/api/table')
            .then((r) => r.json())
            .then((data) => { if (!cancelled) setTable(data) })
            .catch(() => { if (!cancelled) setTable({ tableNumber: null, reason: 'error' }) })
        return () => { cancelled = true }
    }, [])

    const atOpenTable = table?.open === true

    async function send() {
        setSending(true)
        setError(null)

        let res, data
        try {
            res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Ids + quantities only — the server prices it from the menu.
                body: JSON.stringify({
                    items: items.map(({ id, qty }) => ({ id, qty })),
                    note: note.trim() || undefined,
                }),
            })
            data = await res.json()
        } catch {
            setError("Couldn't reach the kitchen — check your connection and try again.")
            setSending(false)
            return
        }

        if (!res.ok) {
            setError(data.message ?? 'Something went wrong — please try again.')
            // Token expired or table closed since the drawer opened: show that state.
            if (res.status === 401) setTable({ tableNumber: null, reason: 'no_token' })
            if (res.status === 403) setTable({ tableNumber: data.tableNumber ?? null, open: false, reason: 'table_closed' })
            setSending(false)
            return
        }

        // The kitchen has it. Nothing from here on may look like a failure —
        // a guest who thinks it failed sends it again and the kitchen makes it twice.
        clearCart()
        closeDrawer()
        router.push(`/table?sent=${data.orderNumber}`)
    }

    // Not at an open table (or still checking): explain why the button is off.
    let blockedMessage = null
    if (table === null) blockedMessage = 'Checking your table…'
    else if (table.reason === 'table_closed') blockedMessage = 'This table is closed — please see the counter.'
    else if (!atOpenTable) blockedMessage = 'Scan the QR code on your table to order.'

    return (
        <div>
            {atOpenTable && (
                <>
                    <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-mute">
                        Ordering for <span className="text-ink">Table {table.tableNumber}</span>
                    </p>
                    <label className="mb-4 block">
                        <span className="sr-only">Note for the kitchen</span>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={200}
                            rows={2}
                            placeholder="Note for the kitchen (optional)"
                            className="pointer-events-auto block w-full resize-none rounded-md border border-rule bg-bg px-3 py-2 text-[14px] text-ink placeholder:text-ink-mute focus:border-ink focus:outline-none"
                        />
                    </label>
                </>
            )}

            <button
                type="button"
                onClick={send}
                disabled={!atOpenTable || sending || items.length === 0}
                className="pointer-events-auto w-full rounded-full border border-red bg-red py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-cream-fg transition-colors duration-200 hover:border-red-deep hover:bg-red-deep disabled:cursor-not-allowed disabled:border-rule disabled:bg-bg-deep disabled:text-ink-mute"
            >
                {sending ? 'Sending…' : `Send to kitchen · $${total.toFixed(2)}`}
            </button>

            {(error || blockedMessage) && (
                <p role="alert" className="mt-3 text-center text-[13px] leading-[1.5] text-ink-soft">
                    {error ?? blockedMessage}
                </p>
            )}
        </div>
    )
}
