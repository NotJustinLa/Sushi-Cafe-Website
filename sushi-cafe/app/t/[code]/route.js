import { NextResponse } from 'next/server'
import { createTableToken, TABLE_COOKIE, TOKEN_TTL_MINUTES } from '@/lib/table-token'
import { findTableByCode, getOpenSession } from '@/lib/tables'

// The URL printed in each table's QR code: /t/<code>.
// Only hands the phone a token if staff have opened the table.
export async function GET(request, { params }) {
    const { code } = await params

    const tableNumber = await findTableByCode(code)
    if (!tableNumber) return withoutToken(redirectTo('/table?reason=bad_code'))

    const session = await getOpenSession(tableNumber)
    if (!session) return withoutToken(redirectTo('/table?reason=not_open'))

    const res = redirectTo('/?from=qr')
    res.cookies.set(TABLE_COOKIE, createTableToken(session.id, tableNumber), {
        httpOnly: true, // page scripts can't read or copy it
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: TOKEN_TTL_MINUTES * 60,
        path: '/',
    })
    return res
}

// Relative redirect ("Location: /?from=qr"), so the phone stays on whatever
// address it scanned — the Wi-Fi IP in dev, the real domain in production.
// Don't build it from request.url: in `next dev` that's always
// http://localhost:3000, which on a phone means the phone itself.
// (NextResponse.redirect() only accepts absolute URLs, hence the manual 307.)
function redirectTo(path) {
    return new NextResponse(null, { status: 307, headers: { Location: path } })
}

// A failed scan also clears any token left over from an earlier visit.
function withoutToken(res) {
    res.cookies.delete(TABLE_COOKIE)
    return res
}
