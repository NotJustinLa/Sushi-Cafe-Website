'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { send } from './usePoll'

const TABS = [
    { href: '/register', label: 'Tables' },
    { href: '/register/kitchen', label: 'Kitchen' },
]

export default function RegisterHeader() {
    const pathname = usePathname()

    async function logOut() {
        await send('POST', '/api/register/logout')
        window.location.assign('/register/login')
    }

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 bg-ink px-4 text-cream-fg sm:px-6">
            <span className="mr-auto flex items-center gap-2 font-display text-[20px] font-bold italic">
                <span className="h-[9px] w-[9px] rounded-full bg-red" aria-hidden="true" />
                Sushi Cafe
                <span className="hidden font-display text-[20px] font-bold italic text-cream-fg/60 sm:inline">
                    Register
                </span>
            </span>

            <nav className="flex gap-1 rounded-full bg-cream-fg/10 p-1" aria-label="Register">
                {TABS.map(({ href, label }) => {
                    const active = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            className={[
                                'flex h-11 items-center rounded-full px-5 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors',
                                active ? 'bg-cream-fg text-ink' : 'text-cream-fg/75 hover:text-cream-fg',
                            ].join(' ')}
                        >
                            {label}
                        </Link>
                    )
                })}
            </nav>

            <button
                type="button"
                onClick={logOut}
                className="ml-2 h-11 rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-cream-fg/70 hover:text-cream-fg"
            >
                Log out
            </button>
        </header>
    )
}
