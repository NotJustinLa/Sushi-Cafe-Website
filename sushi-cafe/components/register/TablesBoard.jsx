'use client'

import { useState } from 'react'
import { ago, duration, money } from '@/lib/format'
import BillSheet from './BillSheet'
import ConnectionBar from './ConnectionBar'
import { send, usePoll } from './usePoll'

// Front of house (the counter iPad): orders ready to carry out, and all 9
// tables — open one when a group sits down, see its bill, close it when they pay.
export default function TablesBoard() {
    const tables = usePoll('/api/register/tables', 5000)
    const ready = usePoll('/api/register/orders?status=ready', 5000)
    const [busy, setBusy] = useState(null) // what's being saved, e.g. "table-7" / "order-43"
    const [notice, setNotice] = useState(null)
    const [billFor, setBillFor] = useState(null)

    async function openTable(n) {
        setBusy(`table-${n}`)
        const res = await send('POST', `/api/register/tables/${n}/open`)
        // 409 = already open (another device got there first) — fine, just refresh.
        if (!res.ok && res.status !== 409) setNotice({ tone: 'error', text: res.data.message ?? `Couldn't open table ${n}.` })
        setBusy(null)
        tables.reload()
    }

    async function markServed(order) {
        setBusy(`order-${order.orderNumber}`)
        const res = await send('PATCH', `/api/register/orders/${order.orderNumber}`, { status: 'served' })
        if (!res.ok) setNotice({ tone: 'error', text: res.data.message ?? `Couldn't update order #${order.orderNumber}.` })
        setBusy(null)
        ready.reload()
    }

    function billClosed(bill) {
        setBillFor(null)
        setNotice({ tone: 'ok', text: `Table ${bill.tableNumber} closed — ${money(bill.totalCents)} paid.` })
        tables.reload()
        ready.reload()
    }

    const readyOrders = ready.data?.orders ?? []
    const openTables = tables.data?.tables.filter((t) => t.open) ?? []

    return (
        <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 sm:px-6">
            <ConnectionBar error={tables.error || ready.error} />

            {notice && (
                <div
                    role={notice.tone === 'error' ? 'alert' : 'status'}
                    className={`mb-5 flex items-center justify-between gap-4 rounded-md px-4 py-3 text-[15px] ${notice.tone === 'error' ? 'bg-red/10 text-red' : 'bg-ink text-cream-fg'}`}
                >
                    {notice.text}
                    <button type="button" onClick={() => setNotice(null)} className="h-11 px-2 font-mono text-[11px] uppercase tracking-[0.14em] opacity-70 hover:opacity-100">
                        Dismiss
                    </button>
                </div>
            )}

            {readyOrders.length > 0 && (
                <section aria-labelledby="ready-heading" className="mb-8">
                    <h2 id="ready-heading" className="mb-3 font-mono text-[12px] uppercase tracking-[0.18em] text-red">
                        Ready to serve · {readyOrders.length}
                    </h2>
                    <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
                        {readyOrders.map((order) => (
                            <li key={order.orderNumber} className="flex items-start justify-between gap-4 rounded-lg border-2 border-red bg-bg-paper p-4">
                                <div className="min-w-0">
                                    <p className="font-display text-[24px] font-bold leading-tight">
                                        Table {order.tableNumber} <span className="text-[16px] text-ink-mute">#{order.orderNumber}</span>
                                    </p>
                                    <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-red">
                                        {`Ready ${ago(order.readyAt ?? order.createdAt, ready.fetchedAt)}${order.tableClosed ? ' · table already closed' : ''}`}
                                    </p>
                                    <ul className="m-0 list-none p-0 text-[15px] text-ink-soft">
                                        {order.items.map((line) => (
                                            <li key={line.id}>{line.qty}× {line.name}{line.variant ? ` · ${line.variant}` : ''}</li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => markServed(order)}
                                    disabled={busy === `order-${order.orderNumber}`}
                                    className="h-14 shrink-0 rounded-full bg-red px-7 font-mono text-[12px] uppercase tracking-[0.16em] text-cream-fg hover:bg-red-deep disabled:opacity-50"
                                >
                                    Served
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section aria-labelledby="tables-heading">
                <div className="mb-4 flex items-baseline justify-between gap-4">
                    <h1 id="tables-heading" className="font-display text-[32px] font-bold">Tables</h1>
                    {tables.data && (
                        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-mute">
                            {`${openTables.length} open · ${money(openTables.reduce((sum, t) => sum + t.runningTotalCents, 0))} to collect`}
                        </p>
                    )}
                </div>

                {!tables.data ? (
                    <p className="text-ink-mute">Loading tables…</p>
                ) : (
                    <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-5">
                        {tables.data.tables.map((t) => (
                            <li
                                key={t.tableNumber}
                                className={`flex min-h-[220px] flex-col rounded-lg p-4 ${t.open ? 'border-2 border-ink bg-bg-paper' : 'border border-dashed border-ink-faint'}`}
                            >
                                <div className="flex items-baseline justify-between">
                                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-mute">Table</span>
                                    <span className={`font-mono text-[11px] uppercase tracking-[0.14em] ${t.open ? 'text-red' : 'text-ink-mute'}`}>
                                        {t.open ? '● Open' : 'Free'}
                                    </span>
                                </div>
                                <span className={`font-display text-[52px] font-bold leading-none ${t.open ? 'text-ink' : 'text-ink-faint'}`}>{t.tableNumber}</span>

                                {t.open ? (
                                    <>
                                        <p className="mt-3 text-[14px] text-ink-soft">
                                            {duration(t.openedAt, tables.fetchedAt)} · {t.orderCount} {t.orderCount === 1 ? 'order' : 'orders'}
                                        </p>
                                        <p className="font-display text-[22px] font-bold">{money(t.runningTotalCents)}</p>
                                        <button
                                            type="button"
                                            onClick={() => setBillFor(t.tableNumber)}
                                            className="mt-auto h-12 rounded-full bg-ink font-mono text-[12px] uppercase tracking-[0.16em] text-bg hover:bg-ink/85"
                                        >
                                            Bill
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => openTable(t.tableNumber)}
                                        disabled={busy === `table-${t.tableNumber}`}
                                        className="mt-auto h-12 rounded-full border border-ink font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:bg-ink hover:text-bg disabled:opacity-50"
                                    >
                                        {busy === `table-${t.tableNumber}` ? 'Opening…' : 'Open table'}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {billFor && <BillSheet tableNumber={billFor} onClosed={billClosed} onBack={() => setBillFor(null)} />}
        </main>
    )
}
