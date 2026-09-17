'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { formatTime, money } from '@/lib/format'

const POLL_MS = 5000
const BASE_TITLE = 'Your table | Sushi Cafe'
const NO_ORDERS = [] // one shared empty array, so effects keyed on `orders` don't re-run every render

// What the guest sees for each order status (§4 of the plan).
const STATUS_LABEL = {
    received: 'Sent to the kitchen',
    preparing: 'Being made',
    ready: 'Ready',
    served: 'Served, enjoy!',
    cancelled: 'Cancelled, please see the counter',
}

// Shared layout for the simple message states (also used by app/table/page.jsx).
export function TableMessage({ eyebrow, title, body, cta }) {
    return (
        <main className="flex min-h-screen items-center px-[var(--pad-x)] pb-[60px] pt-[140px]">
            <div className="mx-auto w-full max-w-[640px]">
                <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-mute">{eyebrow}</p>
                <h1 className="mb-6 font-display text-[clamp(40px,7vw,80px)] font-bold leading-[0.95] tracking-[-0.015em] text-ink">
                    {title}
                </h1>
                <p className="max-w-[45ch] text-[clamp(16px,1.3vw,19px)] leading-[1.6] text-ink-soft">{body}</p>
                {cta && (
                    <Link
                        href={cta.href}
                        className="mt-10 inline-flex rounded-full border border-ink px-[26px] py-4 font-mono text-[12px] uppercase tracking-[0.16em] text-ink transition-colors duration-200 hover:bg-ink hover:text-bg"
                    >
                        {cta.label}
                    </Link>
                )}
            </div>
        </main>
    )
}

// The live /table page — every order at this table during this visit, with
// statuses that update every 5 seconds. `initial` is the same shape as
// GET /api/table, rendered on the server so the page never starts empty.
export default function TableOrders({ initial, sent }) {
    const [status, setStatus] = useState(initial)
    const orders = status.orders ?? NO_ORDERS

    // Poll while the table is open. Pauses while the tab is hidden, fetches
    // straight away when it's visible again, and stops for good once the
    // table closes or the token expires (status.open stops being true).
    useEffect(() => {
        if (!status.open) return
        let cancelled = false
        async function refresh() {
            if (document.hidden) return
            try {
                const res = await fetch('/api/table', { cache: 'no-store' })
                const data = await res.json()
                if (!cancelled) setStatus(data)
            } catch {
                // Offline for a moment — try again on the next tick.
            }
        }
        const timer = setInterval(refresh, POLL_MS)
        const onVisibility = () => { if (!document.hidden) refresh() }
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            cancelled = true
            clearInterval(timer)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [status.open])

    // Buzz the phone ONCE when an order turns ready. Compare against the
    // statuses seen last time. Nothing buzzes for orders already ready on load.
    const seen = useRef(null)
    useEffect(() => {
        const before = seen.current
        if (before && orders.some((o) => o.status === 'ready' && before.get(o.orderNumber) !== 'ready')) {
            navigator.vibrate?.(200)
        }
        seen.current = new Map(orders.map((o) => [o.orderNumber, o.status]))
    }, [orders])

    // Tab title shows ready orders, so it's visible even from another tab.
    useEffect(() => {
        const ready = orders.filter((o) => o.status === 'ready').map((o) => `#${o.orderNumber}`)
        document.title = ready.length ? `READY · Order ${ready.join(', ')}` : BASE_TITLE
    }, [orders])

    if (status.reason === 'table_closed') {
        return (
            <TableMessage
                eyebrow="Thank you"
                title="Thanks for coming!"
                body="This table's bill is closed. If you'd like to order more, ask staff to open your table again."
            />
        )
    }
    if (!status.open) {
        return (
            <TableMessage
                eyebrow="Dine in"
                title="Scan the QR code on your table"
                body="To order from your phone, scan the code on your table. If you've been here a while, your session may have expired. Just scan it again."
            />
        )
    }

    const newestFirst = [...orders].reverse()

    return (
        <main className="min-h-screen px-[var(--pad-x)] pb-[80px] pt-[120px]">
            <div className="mx-auto w-full max-w-[640px]">
                <p className="mb-4 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-mute">
                    <span className="h-[6px] w-[6px] animate-pulse rounded-full bg-red" aria-hidden="true" />
                    Dine in · updates automatically
                </p>
                <h1 className="mb-8 font-display text-[clamp(48px,8vw,88px)] font-bold leading-[0.95] tracking-[-0.015em] text-ink">
                    Table {status.tableNumber}
                </h1>

                {sent && (
                    <p className="mb-6 rounded-md border border-rule bg-bg-paper px-4 py-3 text-[14px] text-ink-soft">
                        {/* Template string on purpose: as plain JSX text the space
                            after {sent} was dropped by the compiler ("Order #7sent"). */}
                        {`Order #${sent} sent. It's with the kitchen.`}
                    </p>
                )}

                {orders.length === 0 ? (
                    <p className="mb-8 text-[16px] leading-[1.6] text-ink-soft">
                        No orders yet. Pick from the menu and send your order to the kitchen, and we&apos;ll bring it to your table.
                    </p>
                ) : (
                    <ul aria-live="polite" className="m-0 mb-8 flex list-none flex-col gap-4 p-0">
                        {newestFirst.map((order) => (
                            <OrderCard key={order.orderNumber} order={order} />
                        ))}
                    </ul>
                )}

                <div className="border-t border-rule pt-6">
                    <div className="flex items-baseline justify-between font-display text-[22px] font-bold text-ink">
                        <span>Running total</span>
                        <span>{money(status.runningTotalCents)}</span>
                    </div>
                    <p className="mt-2 text-[14px] text-ink-mute">Pay at the register when you&apos;re done.</p>
                    <Link
                        href="/#platters"
                        className="mt-8 inline-flex rounded-full border border-ink px-[26px] py-4 font-mono text-[12px] uppercase tracking-[0.16em] text-ink transition-colors duration-200 hover:bg-ink hover:text-bg"
                    >
                        Add more
                    </Link>
                </div>
            </div>
        </main>
    )
}

function OrderCard({ order }) {
    const ready = order.status === 'ready'
    const cancelled = order.status === 'cancelled'

    return (
        <li
            className={[
                'rounded-lg border bg-bg-paper p-5 transition-colors duration-300',
                ready ? 'border-red border-2' : 'border-rule',
                cancelled ? 'opacity-60' : '',
            ].join(' ')}
        >
            {/* Wraps on narrow phones: the status drops under the order number instead of squashing it. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-ink-mute">
                    Order #{order.orderNumber} · {formatTime(order.createdAt)}
                </span>
                {!ready && (
                    <span className="text-right font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
                        {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                )}
            </div>

            {ready && (
                <p className="mb-1 mt-3 font-display text-[clamp(26px,5vw,34px)] font-bold leading-[1.1] text-red">
                    READY, we&apos;ll bring it to your table
                </p>
            )}

            <ul className="m-0 mt-4 flex list-none flex-col gap-1 p-0 text-[15px] text-ink">
                {order.items.map((line) => (
                    <li key={line.id} className="flex justify-between gap-4">
                        <span>
                            {line.qty}× {line.name}
                            {line.variant && <span className="text-ink-mute"> · {line.variant}</span>}
                        </span>
                        <span className="shrink-0 text-ink-soft">{money(line.unitCents * line.qty)}</span>
                    </li>
                ))}
            </ul>

            {order.note && <p className="mb-0 mt-3 text-[13px] italic text-ink-mute">“{order.note}”</p>}

            <div className="mt-4 flex justify-between border-t border-rule pt-3 font-display text-[16px] font-bold text-ink">
                <span>Total</span>
                <span className={cancelled ? 'line-through' : ''}>{money(order.totalCents)}</span>
            </div>
        </li>
    )
}
