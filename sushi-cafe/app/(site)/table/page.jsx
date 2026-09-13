import TableOrders, { TableMessage } from '@/components/TableOrders'
import { getTableStatus } from '@/lib/tables'

export const metadata = {
    title: 'Your table | Sushi Cafe',
}

// Failed QR scans redirect here with a reason (/table?reason=not_open).
const SCAN_PROBLEMS = {
    not_open: {
        eyebrow: 'Almost there',
        title: "Your table isn't open yet",
        body: 'Please ask staff to open your table, then scan the QR code again.',
    },
    bad_code: {
        eyebrow: 'Hmm',
        title: "That QR code didn't work",
        body: 'Please scan the code on your table again, or ask staff for help.',
    },
}

// The guest's table page. Renders the current state on the server, then
// TableOrders keeps it live by polling /api/table.
export default async function TablePage({ searchParams }) {
    const { reason, sent } = await searchParams

    // hasOwn, not `in` — `in` also matches inherited names like ?reason=constructor.
    if (typeof reason === 'string' && Object.hasOwn(SCAN_PROBLEMS, reason)) {
        return <TableMessage {...SCAN_PROBLEMS[reason]} />
    }

    // After Send to kitchen the drawer lands here with ?sent=<order number>.
    // The key remounts TableOrders for each new order, so sending again from
    // this page shows the new order at once instead of on the next poll.
    const sentOrder = /^\d+$/.test(String(sent)) ? Number(sent) : null
    return <TableOrders key={sentOrder ?? 'table'} initial={await getTableStatus()} sent={sentOrder} />
}
