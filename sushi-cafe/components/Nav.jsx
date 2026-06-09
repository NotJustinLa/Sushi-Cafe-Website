/**
 * Fixed top navigation bar with brand logo, section links, and an order CTA.
 * Uses pointer-events-none on the wrapper so the transparent background stays
 * click-through, with pointer-events-auto restored on each interactive element.
 */
export default function Nav() {
    return (
      <nav className="pointer-events-none fixed inset-x-0 top-0 
      z-50 flex items-center justify-between px-[var(--pad-x)] 
      py-[22px] font-mono text-xs uppercase tracking-[0.14em] 
      text-ink-mute">

        { /* Brand */}
        <a
          href="#hero"
          className="pointer-events-auto flex items-center gap-[10px] 
          font-display text-[22px] font-bold normal-case italic 
          tracking-normal text-ink"
        >
          <span className="h-[10px] w-[10px] rounded-full bg-red" 
          aria-hidden="true" />
          Sushi Cafe
        </a>

        {/* Links — hidden on mobile */}
        <div className="pointer-events-auto hidden gap-[28px] md:flex">
          <a href="#about" className="transition-colors duration-200 hover:text-ink">About</a>
          <a href="#menu"  className="transition-colors duration-200 hover:text-ink">Menu</a>
          <a href="#visit" className="transition-colors duration-200 hover:text-ink">Visit</a>
        </div>

      {/* CTA */}
      <a
        href="#visit"
        className="pointer-events-auto rounded-full border border-ink 
        bg-transparent px-[18px] py-[9px] text-ink 
        transition-colors duration-200 hover:bg-ink hover:text-bg"
      >
        Order
      </a>

      </nav>
    );
  }


