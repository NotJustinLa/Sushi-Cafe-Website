'use client'

import { useEffect, useRef, useState } from 'react'

export default function LoginForm({ next }) {
    const [passcode, setPasscode] = useState('')
    const [checking, setChecking] = useState(false)
    const [error, setError] = useState(null)
    const inputRef = useRef(null)

    useEffect(() => { inputRef.current?.focus() }, [])

    async function submit(e) {
        e.preventDefault()
        setChecking(true)
        setError(null)
        try {
            const res = await fetch('/api/register/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode }),
            })
            if (res.ok) {
                // Full load so the server-rendered register sees the new cookie.
                window.location.assign(next)
                return
            }
            const data = await res.json().catch(() => ({}))
            // 429 comes from the Vercel Firewall rate limit (5 tries a minute), not our API.
            setError(res.status === 429
                ? 'Too many attempts. Wait a minute, then try again.'
                : data.message ?? 'Something went wrong. Try again.')
            setPasscode('')
            inputRef.current?.focus()
        } catch {
            setError("Couldn't reach the server. Check the connection.")
        }
        setChecking(false)
    }

    return (
        <form onSubmit={submit}>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-ink-mute" htmlFor="passcode">
                Passcode
            </label>
            <input
                ref={inputRef}
                id="passcode"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                readOnly={checking} // a wrong guess clears the box, so don't let typing start until then
                className="block h-14 w-full rounded-md border border-rule bg-bg-paper px-4 text-center font-mono text-[24px] tracking-[0.5em] text-ink focus:border-ink focus:outline-none"
            />
            <button
                type="submit"
                disabled={checking || passcode.length === 0}
                className="mt-4 h-14 w-full rounded-full border border-red bg-red font-mono text-[12px] uppercase tracking-[0.16em] text-cream-fg transition-colors hover:border-red-deep hover:bg-red-deep disabled:border-rule disabled:bg-bg-deep disabled:text-ink-mute"
            >
                {checking ? 'Checking…' : 'Log in'}
            </button>
            {error && (
                <p role="alert" className="mt-4 text-center text-[14px] text-red">
                    {error}
                </p>
            )}
        </form>
    )
}
