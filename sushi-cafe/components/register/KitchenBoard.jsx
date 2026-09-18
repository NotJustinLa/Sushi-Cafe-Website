'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ago } from '@/lib/format'
import ConnectionBar from './ConnectionBar'
import { send, usePoll } from './usePoll'

const COLUMNS = [
    { status: 'received', title: 'New', empty: 'No new orders' },
    { status: 'preparing', title: 'Preparing', empty: 'Nothing being made' },
    { status: 'ready', title: 'Ready', empty: 'Nothing waiting to go out' },
]

// The new-order chime, played from public/sounds/chime.mp3.
function playChime(audio) {
    audio.currentTime = 0
    audio.play().catch(() => {}) // ignored: browser blocked it (rare once unlocked)
}

// Keep the kitchen laptop's screen awake while this page is open.
// Browsers drop the lock when the tab is hidden, so take it again on return.
function useWakeLock() {
    const [state, setState] = useState('checking') // 'on' | 'off' | 'unsupported'
    useEffect(() => {
        let lock = null
        let cancelled = false
        function acquire() {
            if (document.hidden) return
            if (!navigator.wakeLock) {
                Promise.resolve().then(() => { if (!cancelled) setState('unsupported') })
                return
            }
            navigator.wakeLock.request('screen')
                .then((l) => {
                    lock = l
                    if (!cancelled) setState('on')
                    l.addEventListener('release', () => { if (!cancelled) setState('off') })
                })
                .catch(() => { if (!cancelled) setState('off') })
        }
        acquire()
        const onVisibility = () => { if (!document.hidden) acquire() }
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            cancelled = true
            document.removeEventListener('visibilitychange', onVisibility)
            lock?.release().catch(() => {})
        }
    }, [])
    return state
}

// The kitchen laptop, every active order, oldest first, in three columns.
export default function KitchenBoard() {
    const audio = useRef(null) // Audio element once staff tap "Enable sound"
    const [soundOn, setSoundOn] = useState(false)
    const [notice, setNotice] = useState(null)
    useWakeLock() // keeps the kitchen screen from sleeping (no on-screen label)

    // Chime when a poll brings an order we haven't seen before.
    const onData = useCallback((data, previous) => {
        if (!previous || !audio.current) return
        const seen = new Set(previous.orders.map((o) => o.orderNumber))
        if (data.orders.some((o) => !seen.has(o.orderNumber))) playChime(audio.current)
    }, [])
    const { data, error, fetchedAt, reload } = usePoll('/api/register/orders', 3000, { onData })

    // Browsers only allow sound after a tap, so staff tap this once per shift.
    function toggleSound() {
        if (soundOn) {
            audio.current = null
            setSoundOn(false)
            return
        }
        audio.current = new Audio('/sounds/chime.mp3')
        playChime(audio.current) // so staff hear what it sounds like, and unlocks playback
        setSoundOn(true)
    }

    async function move(order, status) {
        const res = await send('PATCH', `/api/register/orders/${order.orderNumber}`, { status })
        if (!res.ok) {
            setNotice(res.status === 409
                ? `Order #${order.orderNumber} was just changed on another screen.`
                : res.data.message ?? `Couldn't update order #${order.orderNumber}.`)
        }
        reload()
    }

    const orders = data?.orders ?? []

    return (
        <main className="px-4 pb-16 pt-6 sm:px-6">
            <ConnectionBar error={error} />

            <div className="mb-5 flex flex-wrap items-center gap-3">
                <h1 className="mr-auto font-display text-[32px] font-bold">Kitchen</h1>
                <button
                    type="button"
                    onClick={toggleSound}
                    aria-pressed={soundOn}
                    className={`h-11 rounded-full px-5 font-mono text-[12px] uppercase tracking-[0.14em] ${soundOn ? 'border border-ink text-ink' : 'bg-red text-cream-fg'}`}
                >
                    {soundOn ? 'Sound on' : 'Tap to enable sound'}
                </button>
            </div>

            {notice && (
                <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-md bg-red/10 px-4 py-3 text-[15px] text-red">
                    {notice}
                    <button type="button" onClick={() => setNotice(null)} className="h-11 px-2 font-mono text-[11px] uppercase tracking-[0.14em] opacity-70 hover:opacity-100">
                        Dismiss
                    </button>
                </div>
            )}

            {!data ? (
                <p className="text-ink-mute">Loading orders…</p>
            ) : (
                <div className="grid gap-5 md:grid-cols-3">
                    {COLUMNS.map((col) => {
                        const inColumn = orders.filter((o) => o.status === col.status)
                        return (
                            <section key={col.status} aria-labelledby={`col-${col.status}`} className="min-w-0">
                                <h2 id={`col-${col.status}`} className="mb-3 flex items-baseline gap-2 border-b-2 border-ink pb-2 font-mono text-[13px] uppercase tracking-[0.16em]">
                                    {col.title}
                                    <span className={`rounded-full px-2 text-[12px] ${inColumn.length && col.status === 'received' ? 'bg-red text-cream-fg' : 'text-ink-mute'}`}>
                                        {inColumn.length}
                                    </span>
                                </h2>
                                {inColumn.length === 0 ? (
                                    <p className="py-6 text-center text-[14px] text-ink-mute">{col.empty}</p>
                                ) : (
                                    <ul className="m-0 flex list-none flex-col gap-3 p-0">
                                        {inColumn.map((order) => (
                                            <OrderTicket key={order.orderNumber} order={order} now={fetchedAt} onMove={move} />
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )
                    })}
                </div>
            )}
        </main>
    )
}

function OrderTicket({ order, now, onMove }) {
    const [busy, setBusy] = useState(false)
    const [confirmingCancel, setConfirmingCancel] = useState(false)
    const isNew = order.status === 'received' && now - Date.parse(order.createdAt) < 60_000

    async function move(status) {
        setBusy(true)
        await onMove(order, status)
        setBusy(false)
        setConfirmingCancel(false)
    }

    const button = 'h-12 flex-1 rounded-full font-mono text-[12px] uppercase tracking-[0.14em] disabled:opacity-50'

    return (
        <li className={`rounded-lg border bg-bg-paper p-4 ${isNew ? 'border-red ring-2 ring-red/40' : 'border-rule'}`}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="font-display text-[26px] font-bold leading-none">#{order.orderNumber}</span>
                <span className="rounded-full bg-ink px-3 py-1 font-mono text-[12px] uppercase tracking-[0.14em] text-cream-fg">
                    Table {order.tableNumber}
                </span>
            </div>
            {order.tableClosed && (
                <p className="mb-2 rounded-md bg-red/10 px-3 py-1.5 text-[13px] text-red">
                    Table already closed (paid). Check before making, or cancel it.
                </p>
            )}
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute">
                {isNew && <span className="text-red">New · </span>}
                {order.status === 'ready' ? `Ready ${ago(order.readyAt ?? order.createdAt, now)}` : ago(order.createdAt, now)}
            </p>

            <ul className="m-0 mb-3 list-none p-0 text-[17px] leading-[1.45]">
                {order.items.map((line) => (
                    <li key={line.id}>
                        <strong>{line.qty}×</strong> {line.name}
                        {line.variant && <span className="text-ink-mute">{` · ${line.variant}`}</span>}
                    </li>
                ))}
            </ul>
            {order.note && <p className="mb-3 rounded-md bg-bg-deep px-3 py-2 text-[15px] italic">“{order.note}”</p>}

            {confirmingCancel ? (
                <div className="flex items-center gap-2">
                    <span className="mr-auto text-[14px] text-red">{`Cancel #${order.orderNumber}?`}</span>
                    <button type="button" disabled={busy} onClick={() => move('cancelled')} className={`${button} flex-none bg-red px-5 text-cream-fg`}>
                        Yes, cancel
                    </button>
                    <button type="button" disabled={busy} onClick={() => setConfirmingCancel(false)} className={`${button} flex-none border border-rule px-5`}>
                        No
                    </button>
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'received' && (
                        <button type="button" disabled={busy} onClick={() => move('preparing')} className={`${button} border border-ink text-ink hover:bg-ink hover:text-bg`}>
                            Start
                        </button>
                    )}
                    {(order.status === 'received' || order.status === 'preparing') && (
                        <button type="button" disabled={busy} onClick={() => move('ready')} className={`${button} bg-red text-cream-fg hover:bg-red-deep`}>
                            Ready
                        </button>
                    )}
                    {order.status === 'ready' && (
                        <button type="button" disabled={busy} onClick={() => move('served')} className={`${button} bg-ink text-bg hover:bg-ink/85`}>
                            Served
                        </button>
                    )}
                    {order.status !== 'ready' && (
                        <button type="button" disabled={busy} onClick={() => setConfirmingCancel(true)} className="h-12 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute hover:text-red">
                            Cancel
                        </button>
                    )}
                </div>
            )}
        </li>
    )
}
