import { getCurrentTable } from '@/lib/tables'

export const metadata = {
    title: 'Your table — Sushi Cafe',
}

// What each state says. `reason` comes from the QR route's redirect
// (/table?reason=not_open); with no reason, the phone's token decides.
const MESSAGES = {
    open: (n) => ({
        eyebrow: 'Dine in',
        title: `Table ${n}`,
        body: "You're all set. Pick from the menu and send your order to the kitchen — we'll bring it to your table.",
        cta: { href: '/#platters', label: 'Back to the menu' },
    }),
    // After Send to kitchen (/table?sent=42).
    sent: (n, orderNumber) => ({
        eyebrow: `Order #${orderNumber} sent`,
        title: `Table ${n}`,
        body: "Your order is with the kitchen — we'll bring it to your table when it's ready.",
        cta: { href: '/#platters', label: 'Order more' },
    }),
    not_open: () => ({
        eyebrow: 'Almost there',
        title: "Your table isn't open yet",
        body: 'Please ask staff to open your table, then scan the QR code again.',
    }),
    bad_code: () => ({
        eyebrow: 'Hmm',
        title: "That QR code didn't work",
        body: 'Please scan the code on your table again, or ask staff for help.',
    }),
    no_token: () => ({
        eyebrow: 'Dine in',
        title: 'Scan the QR code on your table',
        body: "To order from your phone, scan the code on your table. If you've been here a while, your session may have expired — just scan it again.",
    }),
    table_closed: () => ({
        eyebrow: 'Thank you',
        title: 'Thanks for coming!',
        body: "This table's bill is closed. If you'd like to order more, ask staff to open your table again.",
    }),
}

// PLACEHOLDER (M2) — M4 replaces this with the live list of the table's orders.
export default async function TablePage({ searchParams }) {
    const { reason, sent } = await searchParams

    let message
    // hasOwn, not `in` — `in` also matches inherited names like ?reason=constructor.
    if (typeof reason === 'string' && Object.hasOwn(MESSAGES, reason) && !['open', 'sent'].includes(reason)) {
        message = MESSAGES[reason]()
    } else {
        const table = await getCurrentTable()
        const justSent = table.status === 'open' && /^\d+$/.test(String(sent))
        message = justSent ? MESSAGES.sent(table.tableNumber, sent) : MESSAGES[table.status](table.tableNumber)
    }

    return (
        <main className="flex min-h-screen items-center px-[var(--pad-x)] pb-[60px] pt-[140px]">
            <div className="mx-auto w-full max-w-[640px]">
                <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-mute">
                    {message.eyebrow}
                </p>
                <h1 className="mb-6 font-display text-[clamp(40px,7vw,80px)] font-bold leading-[0.95] tracking-[-0.015em] text-ink">
                    {message.title}
                </h1>
                <p className="max-w-[45ch] text-[clamp(16px,1.3vw,19px)] leading-[1.6] text-ink-soft">
                    {message.body}
                </p>
                {message.cta && (
                    <a
                        href={message.cta.href}
                        className="mt-10 inline-flex rounded-full border border-ink px-[26px] py-4 font-mono text-[12px] uppercase tracking-[0.16em] text-ink transition-colors duration-200 hover:bg-ink hover:text-bg"
                    >
                        {message.cta.label}
                    </a>
                )}
            </div>
        </main>
    )
}
