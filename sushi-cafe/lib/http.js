// JSON response that browsers and CDNs must never cache — order and table
// state changes constantly, and a cached answer would show stale statuses.
export function json(data, status = 200) {
    return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
}
