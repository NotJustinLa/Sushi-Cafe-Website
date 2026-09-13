import { NextResponse } from 'next/server'

// Runs before /register pages render (Next 16's "proxy", formerly middleware).
// A quick first check only: no staff cookie → the login page. The real check
// (is the cookie genuine and unexpired?) happens in app/register/(staff)/layout.jsx
// and in every /api/register route, as Next's auth guide recommends.
export function proxy(request) {
    const { pathname, search } = request.nextUrl
    if (pathname === '/register/login') return NextResponse.next()
    if (request.cookies.has('staff_session')) return NextResponse.next()

    // Proxy redirects must be absolute URLs, but in `next dev` request.nextUrl
    // says localhost — which on the kitchen laptop is the wrong machine. So use
    // the host the browser actually asked for.
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')
    const login = new URL(`/register/login?next=${encodeURIComponent(pathname + search)}`, `${protocol}://${host}`)
    return NextResponse.redirect(login)
}

export const config = {
    matcher: ['/register', '/register/:path*'],
}
