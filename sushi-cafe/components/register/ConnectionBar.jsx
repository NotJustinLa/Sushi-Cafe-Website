// Shown while polls are failing, so nobody trusts a frozen screen.
export default function ConnectionBar({ error }) {
    if (!error) return null
    return (
        <div role="status" className="sticky top-16 z-30 -mx-4 mb-4 bg-red px-4 py-2.5 text-center font-mono text-[12px] uppercase tracking-[0.14em] text-cream-fg sm:-mx-6">
            Connection lost, retrying…
        </div>
    )
}
