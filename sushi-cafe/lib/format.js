// Display helpers shared by the guest pages and the register. No secrets —
// safe to import from client components.

export const money = (cents) => `$${(cents / 100).toFixed(2)}`

// "12:41 pm" in Melbourne time. Built from parts rather than toLocaleTimeString()
// so the server and the browser produce exactly the same text (no hydration mismatch).
const timeParts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne', hour: 'numeric', minute: '2-digit', hour12: true,
})
export function formatTime(iso) {
    const p = Object.fromEntries(timeParts.formatToParts(new Date(iso)).map((x) => [x.type, x.value]))
    return `${p.hour}:${p.minute} ${(p.dayPeriod ?? '').toLowerCase()}`
}

// "42 min" / "1 h 5 min" between `iso` and `now` (ms). Never negative.
export function duration(iso, now) {
    const minutes = Math.max(0, Math.floor((now - Date.parse(iso)) / 60_000))
    if (minutes < 60) return `${minutes} min`
    return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
}

// "just now" / "4 min ago"
export function ago(iso, now) {
    return now - Date.parse(iso) < 60_000 ? 'just now' : `${duration(iso, now)} ago`
}
