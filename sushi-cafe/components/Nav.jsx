'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from './CartProvider'
import { useLenis } from './LenisProvider'

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'platters', label: 'Order' },
  { id: 'visit', label: 'Visit' },
]

/**
 * Fixed top navigation bar with brand logo, section links, and an order CTA.
 * Uses pointer-events-none on the wrapper so the transparent background stays
 * click-through, with pointer-events-auto restored on each interactive element.
 */
export default function Nav() {
    const { count, openDrawer } = useCart()
    const lenis = useLenis()
    const pathname = usePathname()
    const onHome = pathname === '/'
    const tableNumber = useOpenTable(pathname)

    // On the home page, glide to the section with Lenis. On any other page
    // (e.g. /table) the sections aren't there, so let the link go to /#section.
    function scrollTo(e, target) {
      if (!onHome || !lenis) return
      e.preventDefault()
      lenis.scrollTo(target)
    }

    return (
      <nav className="pointer-events-none fixed inset-x-0 top-0
      z-50 flex items-center justify-between px-[var(--pad-x)]
      py-[10px] font-mono text-xs uppercase tracking-[0.14em]
      text-ink-mute bg-[var(--color-bg)] shadow-sm">

        { /* Brand */}
        <Link
          href="/"
          onClick={(e) => scrollTo(e, 0)}
          className="pointer-events-auto flex items-center gap-[10px]
          font-display text-[22px] font-bold normal-case italic
          tracking-normal text-ink"
        >
          <span className="h-[10px] w-[10px] rounded-full bg-red"
          aria-hidden="true" />
          Sushi Cafe
        </Link>

        {/* Links — hidden on mobile */}
        <div className="pointer-events-auto hidden gap-[28px] md:flex">
          {SECTIONS.map(({ id, label }) => (
            <Link key={id} href={`/#${id}`} onClick={(e) => scrollTo(e, `#${id}`)} className="transition-colors duration-200 hover:text-ink">
              {label}
            </Link>
          ))}
        </div>

      <div className="flex items-center gap-3">
        {/* Only while this phone is at an open table (it scanned the QR code) */}
        {tableNumber && (
          <Link
            href="/table"
            aria-current={pathname === '/table' ? 'page' : undefined}
            className="pointer-events-auto rounded-full border border-red
            px-[14px] py-[9px] text-red transition-colors duration-200
            hover:bg-red hover:text-cream-fg"
          >
            Table {tableNumber}
          </Link>
        )}

        {/* CTA — opens the cart drawer */}
        <button
          type="button"
          onClick={openDrawer}
          aria-haspopup="dialog"
          className="pointer-events-auto rounded-full border border-ink
          bg-transparent px-[18px] py-[9px] uppercase text-ink
          transition-colors duration-200 hover:bg-ink hover:text-bg"
        >
          Cart{count > 0 ? `  ${count}` : ''}
        </button>
      </div>

      </nav>
    );
  }

// The number of the open table this phone is at, or null. Re-checks on every
// page change and whenever the tab comes back into view, so the link appears
// after a QR scan and disappears once staff close the table.
function useOpenTable(pathname) {
    const [tableNumber, setTableNumber] = useState(null)

    useEffect(() => {
        let cancelled = false
        function check() {
            fetch('/api/table', { cache: 'no-store' })
                .then((res) => res.json())
                .then((data) => { if (!cancelled) setTableNumber(data.open ? data.tableNumber : null) })
                .catch(() => {})
        }
        check()
        const onVisibility = () => { if (!document.hidden) check() }
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            cancelled = true
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [pathname])

    return tableNumber
}
