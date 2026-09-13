import { redirect } from 'next/navigation'
import LoginForm from '@/components/register/LoginForm'
import { hasStaffSession } from '@/lib/staff-session'

export const metadata = { title: 'Log in' }

export default async function LoginPage({ searchParams }) {
    // Only ever send staff back into the register — never to another site.
    const { next } = await searchParams
    const target = typeof next === 'string' && next.startsWith('/register') && !next.startsWith('//') ? next : '/register'

    if (await hasStaffSession()) redirect(target)

    return (
        <main className="flex min-h-screen items-center justify-center px-5 py-10">
            <div className="w-full max-w-[380px]">
                <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
                    <span className="h-[8px] w-[8px] rounded-full bg-red" aria-hidden="true" />
                    Sushi Cafe · Staff
                </p>
                <h1 className="mb-8 font-display text-[44px] font-bold leading-[1] text-ink">Register</h1>
                <LoginForm next={target} />
            </div>
        </main>
    )
}
