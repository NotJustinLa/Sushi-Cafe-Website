# Sushi Cafe — Design Migration Tutorial

This guide walks you through updating your existing project to match the new design: a cream-palette, Japanese-typographic site with an animated loading splash followed by a staggered hero reveal. Each step is self-contained so you can work through them one at a time and test between each.

---

## What's changing at a glance

| Area | Old | New |
|---|---|---|
| Colour palette | Dark (`#0a0a0a` background, white text) | Cream (`#f7eedb`), deep ink, red accent |
| Fonts | Bebas Neue, Noto Serif JP, Space Mono | Shippori Mincho, DM Sans, JetBrains Mono, Zen Kaku Gothic New |
| CSS font vars | `--font-bebas-neue`, etc. | `--font-shippori-mincho`, etc. |
| Page structure | `Nav` + `Hero` + `Philosophy` in layout/page | `SiteShell` (splash manager) wrapping `Nav` + `Hero` |
| Loading screen | None | Animated red hinomaru bloom + italic wordmark |
| Hero | Dark full-screen, "SUSHI CAFE" in Bebas | Cream page, italic Shippori Mincho headline, eyebrow, sub copy, meta row, JP rail, scroll indicator |
| `Philosophy` | Returns `null` (placeholder) | Removed — no longer in the new design |
| Lenis config | `duration: 1.4, smooth: true` | `duration: 1.15`, no `smooth` key (deprecated) |

---

## Before you start

Make sure you're working in the right directory and the dev server is stopped. You'll restart it after all changes are in.

```bash
cd your-project-folder
# kill any running `npm run dev` process first
```

---

## Step 1 — Update the fonts in `app/layout.jsx`

The existing layout imports Bebas Neue, Noto Serif JP, and Space Mono. Replace those with the four fonts the new design uses.

**Open `app/layout.jsx` and replace the entire file with:**

```jsx
import { Shippori_Mincho, Zen_Kaku_Gothic_New, DM_Sans, JetBrains_Mono } from 'next/font/google'
import LenisProvider from '@/components/LenisProvider'
import './globals.css'

const shippori = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-shippori-mincho',
  display: 'swap',
})

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-zen-kaku',
    
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata = {
  title: 'Sushi Cafe — 292 Doncaster Rd, Balwyn North',
  description: 'A family sushi spot on Doncaster Road. Hand-rolled fresh daily in Balwyn North since 2013.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${shippori.variable} ${zenKaku.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
```

**What changed and why:**
- The old layout put `<Nav />` inside the layout — the new design wraps it inside `SiteShell` (on the page) so the splash can overlay it cleanly.
- The `<body>` no longer sets `bg-brand-black`; background is now controlled by CSS.
- Four new font variables are created; Tailwind's `@theme` block in the next step will wire them to utility classes.

---

## Step 2 — Rewrite `app/globals.css`

This is the biggest token change. The old CSS had a dark palette and three font references. Replace the entire file:

```css
@import "tailwindcss";

/* ─── Tailwind v4 theme tokens ─── */
@theme {
  --color-bg: #f7eedb;
  --color-bg-paper: #fbf5e4;
  --color-bg-deep: #ece1c6;
  --color-ink: #141210;
  --color-ink-soft: rgba(20, 18, 16, 0.72);
  --color-ink-mute: rgba(20, 18, 16, 0.48);
  --color-ink-faint: rgba(20, 18, 16, 0.18);
  --color-rule: rgba(20, 18, 16, 0.14);
  --color-red: #d81f2a;
  --color-red-deep: #a8131c;
  --color-cream-fg: #fff8e7;
  --color-splash-bg: #0a0807;

  --font-display: var(--font-shippori-mincho), 'Noto Serif JP', Georgia, serif;
  --font-body: var(--font-dm-sans), -apple-system, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, 'SFMono-Regular', monospace;
  --font-jp: var(--font-zen-kaku), 'Hiragino Sans', 'Yu Gothic', sans-serif;

  --container-maxw: 1440px;

  /* Keyframes used by the scroll indicator pulse and splash bloom */
  --animate-load-bloom: load-bloom 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  --animate-scroll-pulse: scroll-pulse 2.4s ease-in-out infinite;

  @keyframes load-bloom {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.03); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes scroll-pulse {
    0%, 100% { transform: scaleX(0.4); transform-origin: left; opacity: 0.4; }
    50%       { transform: scaleX(1); opacity: 1; }
  }
}

/* Base */
html,
body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}

/* Lenis smooth-scroll classes */
html.lenis,
html.lenis body {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}
.lenis.lenis-stopped {
  overflow: clip;
}

/* Fluid horizontal padding used by hero and nav */
:root {
  --pad-x: clamp(20px, 5vw, 72px);
}
```

**What changed and why:**
- Old tokens like `--color-brand-red`, `--color-brand-black`, `--font-display: var(--font-bebas-neue)` are all gone.
- New colour names — `bg`, `ink`, `red`, `splash-bg`, `cream-fg` — are what the new components reference via Tailwind utilities (`bg-bg`, `text-ink`, `text-red`, etc.).
- `--font-display` now points to Shippori Mincho. Any Tailwind class `font-display` will use it.
- Two keyframe animations are declared in `@theme` so they're available to Tailwind arbitrary-value syntax.

---

## Step 3 — Update `app/page.jsx`

The old page renders `<Hero />` and `<Philosophy />` directly. The new page wraps everything in a `SiteShell` component (which you'll create in Step 5) that manages the loading splash, and drops `Philosophy` entirely.

**Replace `app/page.jsx` with:**

```jsx
import SiteShell from '@/components/SiteShell'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <SiteShell>
      <Nav />
      <main>
        <Hero />
      </main>
    </SiteShell>
  )
}
```

**What changed and why:**
- `Philosophy` is removed — it returned `null` anyway and isn't in the new design.
- `Nav` moves from the layout into the page (inside `SiteShell`), so the splash overlay covers it during loading.
- `SiteShell` is the client component that mounts the splash, waits a minimum of 1.7 s, then animates it out.

---

## Step 4 — Update `components/LenisProvider.jsx`

The existing Lenis config uses a deprecated `smooth` option that was renamed in Lenis v1. The new version also adds `smoothWheel` and `smoothTouch` explicitly.

**Replace `components/LenisProvider.jsx` with:**

```jsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return children;
}
```

**What changed and why:**
- `smooth: true` → `smoothWheel: true` (the correct Lenis v1 API).
- `smoothTouch: false` keeps native momentum on mobile.
- The `rafId` is now stored so `cancelAnimationFrame` can clean it up properly on unmount (the old version leaked the loop).
- `<>{children}</>` → `children` directly (React 19 allows this).

---

## Step 5 — Create `components/SiteShell.jsx` (new file)

This component doesn't exist yet. It renders the loading splash on top of everything, waits for the page to load plus a minimum display time, then uses Framer Motion's `AnimatePresence` to animate the splash out.

**Create `components/SiteShell.jsx`:**

```jsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingSplash from "./LoadingSplash";

const MIN_DURATION = 1700; // ms — splash shows for at least this long

export default function SiteShell({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = performance.now();

    function dismiss() {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, MIN_DURATION - elapsed);
      const t = setTimeout(() => setLoading(false), remaining);
      return () => clearTimeout(t);
    }

    if (document.readyState === "complete") {
      return dismiss();
    }

    let cleanupDismiss;
    const onLoad = () => {
      cleanupDismiss = dismiss();
    };
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      if (cleanupDismiss) cleanupDismiss();
    };
  }, []);

  return (
    <>
      <AnimatePresence>{loading && <LoadingSplash key="splash" />}</AnimatePresence>
      {children}
    </>
  );
}
```

**How it works:**
- On mount, it records the current time.
- It waits for `window.load` (all assets ready). If the page is already loaded (e.g. on fast connections / HMR), it dismisses immediately after the minimum duration.
- `MIN_DURATION` ensures the bloom animation always completes before the splash fades.
- `AnimatePresence` watches for the splash leaving the tree and runs its `exit` animation.

---

## Step 6 — Create `components/LoadingSplash.jsx` (new file)

This is the full-screen black overlay with the red circle bloom and italic wordmark.

**Create `components/LoadingSplash.jsx`:**

```jsx
"use client";

import { motion } from "framer-motion";

export default function LoadingSplash() {
  return (
    <motion.div
      className="fixed inset-0 z-[1000] grid place-items-center overflow-hidden bg-splash-bg"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, visibility: "hidden" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      aria-hidden="true"
    >
      <div className="relative grid aspect-square w-[min(320px,70vw)] place-items-center">

        {/* Red hinomaru — blooms from scale(0) to scale(1) */}
        <motion.div
          className="absolute inset-0 rounded-full bg-red"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.03, 1],
            opacity: [0, 1, 1],
          }}
          transition={{
            duration: 1.1,
            ease: [0.2, 0.8, 0.2, 1],
            times: [0, 0.6, 1],
          }}
        />

        {/* Italic wordmark */}
        <motion.div
          className="relative z-[1] text-center font-display text-[clamp(40px,7vw,62px)] font-bold italic leading-[0.95] text-cream-fg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.55, ease: "easeOut" }}
        >
          <span className="block">Sushi</span>
          <span className="ml-[18px] mt-2 block">Cafe</span>
        </motion.div>

        {/* Japanese subtitle */}
        <motion.div
          className="absolute -bottom-[54px] left-1/2 -translate-x-1/2 whitespace-nowrap font-jp text-xs tracking-[0.35em] text-[rgba(255,248,231,0.55)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85, ease: "easeOut" }}
        >
          寿司カフェ · BALWYN NORTH
        </motion.div>

      </div>
    </motion.div>
  );
}
```

**Animation sequence:**
1. Circle blooms: `scale 0 → 1.03 → 1` over 1.1 s with a custom cubic ease
2. Wordmark fades up: starts at 0.55 s delay
3. JP subtitle fades up: starts at 0.85 s delay
4. After the minimum duration, the entire panel fades out via the `exit` prop (0.55 s)

---

## Step 7 — Replace `components/Nav.jsx`

The old nav is minimal — just three right-aligned links that fade in. The new nav adds a brand dot + logotype on the left and an "Order" CTA on the right.

**Replace `components/Nav.jsx` with:**

```jsx
export default function Nav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[var(--pad-x)] py-[22px] font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">

      {/* Brand */}
      <a
        href="#hero"
        className="pointer-events-auto flex items-center gap-[10px] font-display text-[22px] font-bold normal-case italic tracking-normal text-ink"
      >
        <span className="h-[10px] w-[10px] rounded-full bg-red" aria-hidden="true" />
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
        className="pointer-events-auto rounded-full border border-ink bg-transparent px-[18px] py-[9px] text-ink transition-colors duration-200 hover:bg-ink hover:text-bg"
      >
        Order &nbsp;↗
      </a>

    </nav>
  );
}
```

**What changed and why:**
- No more `motion.nav` — the hero content drives the entrance. The nav is immediately visible so it feels anchored rather than popping in later.
- `pointer-events-none` on the `<nav>` with `pointer-events-auto` on individual links keeps the transparent nav area non-clickable while the links stay interactive.
- Uses `--pad-x` (defined in `globals.css`) for consistent horizontal gutter with the hero.
- New token names: `text-ink-mute`, `text-ink`, `bg-red`, `border-ink`, `bg-transparent`, `text-bg`.

---

## Step 8 — Replace `components/Hero.jsx`

This is the largest change. The old hero was a dark full-screen centre-aligned layout with Bebas Neue. The new hero is light, left-aligned, with many typographic layers.

**Replace `components/Hero.jsx` with:**

```jsx
"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0  },
};

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative grid min-h-screen grid-cols-1 items-center px-[var(--pad-x)] pb-20 pt-[90px]"
    >
      {/* Faint background circle — decorative, no interaction */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8vw] top-1/2 -z-10 aspect-square w-[clamp(420px,60vw,820px)] -translate-y-1/2 rounded-full bg-red opacity-[0.06]"
      />

      {/* Staggered content container */}
      <motion.div
        className="relative mx-auto w-full max-w-[var(--container-maxw)]"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.12, delayChildren: 1.2 }}
      >

        {/* Eyebrow label */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="mb-6 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute before:h-px before:w-7 before:bg-current before:content-['']"
        >
          01 — Hand-rolled fresh, every single day
        </motion.div>

        {/* Main headline */}
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
          className="m-0 max-w-[9ch] font-display text-[clamp(72px,14vw,220px)] font-bold italic leading-[0.9] tracking-[-0.02em]"
        >
          <span className="block">Sushi</span>
          <span className="block">
            <em className="italic text-red">Cafe</em>
          </span>
        </motion.h1>

        {/* Sub copy */}
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-7 max-w-[32ch] text-[clamp(16px,1.4vw,19px)] leading-[1.5] text-ink-soft"
        >
          A family sushi spot on Doncaster Road. John and family, rolling fast,
          fresh nigiri, sashimi and rolls in Balwyn North since 2013.
        </motion.p>

        {/* Meta row */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-12 flex flex-wrap gap-7 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute"
        >
          {["Est. 2013", "Balwyn North · VIC", "46+ items daily"].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 before:h-1 before:w-1 before:rounded-full before:bg-red before:content-['']"
            >
              {item}
            </span>
          ))}
        </motion.div>

      </motion.div>

      {/* Vertical Japanese rail — decorative */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 1.6, ease: "easeOut" }}
        className="absolute bottom-[8vh] right-0 top-[12vh] flex select-none items-start font-jp text-[13px] font-medium tracking-[0.35em] text-ink-mute [writing-mode:vertical-rl] max-md:text-[11px]"
      >
        新鮮・手作り・292ドンキャスター
      </motion.div>

      {/* Scroll indicator — pulsing line on ::after */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 1.8, ease: "easeOut" }}
        className="absolute bottom-[26px] left-[var(--pad-x)] flex items-center gap-[14px] font-mono text-[10.5px] uppercase tracking-[0.26em] text-ink-mute after:h-px after:w-[60px] after:bg-current after:content-[''] after:[animation:scroll-pulse_2.4s_ease-in-out_infinite]"
      >
        Scroll
      </motion.div>

    </section>
  );
}
```

**What changed:**
- Dark → cream: all colour classes updated to new tokens.
- Bebas Neue full-width centred → Shippori Mincho italic left-aligned with `clamp` sizing.
- Stagger timing is `delayChildren: 1.2` — this lands just as the splash dissolves, so the content feels like it's being revealed.
- The `scroll-pulse` animation runs on the `::after` pseudo-element via Tailwind's arbitrary-value syntax `after:[animation:...]`.
- Vertical JP text uses CSS `writing-mode: vertical-rl` via Tailwind.

---

## Step 9 — Delete (or empty) `components/Philosophy.jsx`

`Philosophy` currently returns `null` and is no longer imported anywhere. You can safely delete it:

```bash
rm components/Philosophy.jsx
```

Or if you want to keep it around as a starting point for future work, just leave it — it won't affect the build since nothing imports it now.

---

## Step 10 — Verify your `package.json` dependencies

Your existing `package.json` already has all the right dependencies. Just double-check the versions look reasonable:

```json
"dependencies": {
  "framer-motion": "^12.x.x",
  "lenis": "^1.x.x",
  "next": "^16.2.6",
  "react": "19.2.4",
  "react-dom": "19.2.4"
}
```

If anything is missing or stale, run:

```bash
npm install
```

No new packages are needed — the new design only uses what's already installed.

---

## Step 11 — Run the dev server and check

```bash
npm run dev
```

Open `http://localhost:3000`. You should see:

1. **Black splash screen** appears immediately
2. **Red circle blooms** from the centre over 1.1 s
3. **"Sushi / Cafe"** italic wordmark fades up at 0.55 s
4. **"寿司カフェ · BALWYN NORTH"** subtitle fades up at 0.85 s
5. After minimum 1.7 s total, the **splash fades out** over 0.55 s
6. The **cream hero** is revealed with eyebrow, headline, sub copy, meta row all staggering in
7. The **vertical JP rail** and **scroll indicator** fade in last

---

## Troubleshooting

**Font utilities not working (e.g. `font-display` has no effect)**

Tailwind v4 generates font utilities from `@theme` `--font-*` variables. Make sure your `globals.css` has the full `@theme` block and that PostCSS is configured (`postcss.config.mjs` should have `@tailwindcss/postcss`). Your existing `postcss.config.mjs` should be fine — don't touch it.

**Colours like `bg-red` or `text-ink-mute` not applying**

Check `globals.css` — Tailwind v4 generates colour utilities from `--color-*` tokens. `--color-red` → `bg-red`, `text-red`. `--color-ink-mute` → `text-ink-mute`. If a token is missing from `@theme`, the utility won't exist.

**Splash never disappears**

Open the browser console and check for JS errors. The most common cause is a missing import — make sure `LoadingSplash` is imported correctly inside `SiteShell` and that both files are in `components/`.

**Scroll indicator line doesn't pulse**

The `scroll-pulse` keyframe is defined inside `@theme` in `globals.css`. Tailwind v4 emits keyframes defined in `@theme` globally, so the Tailwind arbitrary-value class `after:[animation:scroll-pulse_2.4s_ease-in-out_infinite]` will find it. If it doesn't work, check that the keyframe name exactly matches (no typos).

**`AnimatePresence` warning about multiple children**

Make sure `LoadingSplash` has a `key` prop when rendered inside `AnimatePresence`. The template already includes `key="splash"` — just don't remove it.
