'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

// The QR route redirects to /?from=qr after a successful scan. Record that as
// a PostHog event once, then drop the marker from the URL so a refresh or a
// shared link doesn't count again.
export default function QrScanTracker() {
    useEffect(() => {
        const url = new URL(window.location.href)
        if (url.searchParams.get('from') !== 'qr') return

        posthog.capture('qr_scanned')
        url.searchParams.delete('from')
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    }, [])

    return null
}
