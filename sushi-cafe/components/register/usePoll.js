'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Fetch `url` now and every `intervalMs` while the screen is visible.
// Returns data, error, fetchedAt, and reload
//   - error      set while requests are failing (shows "Connection lost"), cleared on success
//   - fetchedAt  when `data` arrived — use it as "now" for "4 min ago" labels
//   - reload()   fetch again straight away (after a button press)
// A 401 means the staff session ran out, so it redirects back to the login page.
// onData(data, previous) runs on every successful fetch (e.g. to chime on new orders).
export function usePoll(url, intervalMs, { onData } = {}) {
    const [state, setState] = useState({ data: null, error: null, fetchedAt: null })
    const [reloads, setReloads] = useState(0)

    // Keep the latest callback without restarting the timer when it changes.
    const onDataRef = useRef(onData)
    useEffect(() => { onDataRef.current = onData }, [onData])
    const previous = useRef(null)

    useEffect(() => {
        let cancelled = false
        async function load() {
            if (document.hidden) return
            try {
                const res = await fetch(url, { cache: 'no-store' })
                if (res.status === 401) {
                    window.location.assign(`/register/login?next=${encodeURIComponent(window.location.pathname)}`)
                    return
                }
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json()
                if (cancelled) return
                onDataRef.current?.(data, previous.current)
                previous.current = data
                setState({ data, error: null, fetchedAt: Date.now() })
            } catch (err) {
                if (!cancelled) setState((s) => ({ ...s, error: err.message || 'Network error' }))
            }
        }
        load()
        const timer = setInterval(load, intervalMs)
        const onVisibility = () => { if (!document.hidden) load() }
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            cancelled = true
            clearInterval(timer)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [url, intervalMs, reloads])

    const reload = useCallback(() => setReloads((n) => n + 1), [])
    return { ...state, reload }
}

// POST/PATCH to the register API. Returns { ok, status, data }.
export async function send(method, url, body) {
    try {
        const res = await fetch(url, {
            method,
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined,
        })
        if (res.status === 401) {
            window.location.assign('/register/login')
            return { ok: false, status: 401, data: {} }
        }
        return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) }
    } catch {
        return { ok: false, status: 0, data: { message: "Couldn't reach the server. Check the connection." } }
    }
}
