'use client'

import { useEffect, useRef, useState } from 'react'
import { formatTime, money } from '@/lib/format'
import { send } from './usePoll'

// The bill for an open table. Staff take payment on the EFTPOS terminal, then
// "Paid — close table" closes it (every guest phone at the table is locked out).
export default function BillSheet({ tableNumber, onClosed, onBack }) {
    const [bill, setBill] = useState(null)
    const [closing, setClosing] = useState(false)
    const [error, setError] = useState(null)
    const backRef = useRef(null)

    useEffect(() => {
        let cancelled = false
        fetch(`/api/register/tables/${tableNumber}/bill`, { cache: 'no-store' })
            .then(async (res) => {
                const data = await res.json()
                if (!cancelled) setBill(res.ok ? data : { error: data.error === 'not_open' ? 'This table is no longer open.' : "Couldn't load the bill." })
            })
            .catch(() => { if (!cancelled) setBill({ error: "Couldn't reach the server." }) })
        return () => { cancelled = true }
    }, [tableNumber])

    // Escape goes back; focus starts inside the sheet.
    useEffect(() => {
        backRef.current?.focus()
        const onKey = (e) => { if (e.key === 'Escape') onBack() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onBack])

    async function paid() {
        setClosing(true)
        setError(null)
        const res = await send('POST', `/api/register/tables/${tableNumber}/close`)
        if (res.ok) return onClosed(res.data)
        setError(res.data.message ?? (res.status === 404 ? 'This table is already closed.' : "Couldn't close the table. Try again."))
        setClosing(false)
    }

    const unserved = bill?.orders?.filter((o) => o.status !== 'served').length ?? 0

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" onClick={onBack}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="bill-title"
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-[90vh] w-full max-w-[480px] flex-col rounded-t-xl bg-bg-paper sm:rounded-xl"
            >
                <header className="flex items-baseline justify-between border-b border-rule px-6 py-5">
                    <h2 id="bill-title" className="font-display text-[26px] font-bold">Table {tableNumber} bill</h2>
                    {bill?.openedAt && <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute">since {formatTime(bill.openedAt)}</span>}
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {!bill && <p className="text-ink-mute">Loading bill…</p>}
                    {bill?.error && <p className="text-red">{bill.error}</p>}
                    {bill?.orders?.length === 0 && <p className="text-ink-mute">No orders at this table.</p>}
                    {bill?.orders?.map((order) => (
                        <div key={order.orderNumber} className="border-b border-rule py-3 last:border-0">
                            <p className="mb-1 flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute">
                                <span>#{order.orderNumber} · {formatTime(order.createdAt)}</span>
                                {order.status !== 'served' && <span className="text-red">{order.status}</span>}
                            </p>
                            {order.items.map((line) => (
                                <p key={line.id} className="flex justify-between gap-4 text-[15px]">
                                    <span>{line.qty}× {line.name}{line.variant ? ` · ${line.variant}` : ''}</span>
                                    <span className="shrink-0">{money(line.unitCents * line.qty)}</span>
                                </p>
                            ))}
                        </div>
                    ))}
                </div>

                {bill && !bill.error && (
                    <footer className="border-t border-rule px-6 py-5">
                        <p className="mb-2 flex items-baseline justify-between font-display text-[24px] font-bold">
                            <span>Total</span>
                            <span>{money(bill.totalCents)}</span>
                        </p>
                        {unserved > 0 && (
                            <p className="mb-2 text-[14px] text-red">
                                {`⚠ ${unserved} ${unserved === 1 ? 'order' : 'orders'} not served yet`}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={paid}
                            disabled={closing}
                            className="mt-2 h-14 w-full rounded-full bg-red font-mono text-[12px] uppercase tracking-[0.16em] text-cream-fg hover:bg-red-deep disabled:opacity-50"
                        >
                            {closing ? 'Closing…' : 'Paid, close table'}
                        </button>
                        {error && <p role="alert" className="mt-3 text-center text-[14px] text-red">{error}</p>}
                    </footer>
                )}

                <button
                    ref={backRef}
                    type="button"
                    onClick={onBack}
                    className="h-12 border-t border-rule font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute hover:text-ink"
                >
                    Back
                </button>
            </div>
        </div>
    )
}
