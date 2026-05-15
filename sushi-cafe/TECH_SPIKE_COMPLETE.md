# Sushi Cafe — Complete Tech Spike
## Build the full site from zero, step by step

This document teaches you how to build the Sushi Cafe website from scratch using Next.js, Tailwind CSS, and Framer Motion. Every concept is explained before the code that uses it. By the end you will have a working, deployable site.

Read it top to bottom. Do not skip sections.

---

## What you are building

Two full-screen sections, scrollable:

**Page 1 — Hero**
- "SUSHI" in red and "CAFE" in white, massive Bebas Neue type, centred on a black screen
- Each word pops up from below on load (clip + slide animation)
- Faint Japanese characters above the title
- Nav top-right: About, Menu, Reserve
- Melbourne / Scroll hint at the bottom

**Page 2 — Philosophy**
- "We believe sushi is best made by hand, with love"
- Each word pops up one by one as you scroll to it
- "We", "sushi", "hand," and "love" appear in red

**Across the whole site**
- Lenis smooth scroll
- Black background, red + cream accents
- Bebas Neue display font

---

## Table of contents

1. How the stack works together
2. Terminal basics
3. Project setup
4. Folder structure
5. How Next.js works
6. Tailwind CSS
7. React and JSX
8. Framer Motion
9. Build: globals.css
10. Build: app/layout.jsx
11. Build: app/page.jsx
12. Build: components/Nav.jsx
13. Build: components/Hero.jsx
14. Build: components/Philosophy.jsx
15. Build: components/LenisProvider.jsx
16. Run and check
17. Deploy to Vercel
18. Troubleshooting

---

## 1. How the stack works together

Before writing any code, understand what each tool does:

```
Next.js         The framework. Handles routing, server rendering, fonts, and
                the project structure. Think of it as the scaffolding.

React           The UI library Next.js is built on. You write components —
                small functions that return pieces of the UI — and React
                assembles them into the page.

Tailwind CSS    Styling. Instead of writing a separate CSS file, you put
                class names directly on your HTML elements. Each class does
                one thing: flex, text-white, h-screen, etc.

Framer Motion   Animations. You swap plain HTML tags for motion versions
                (motion.div, motion.h1) and add animation props to them.

Lenis           Smooth scroll. Replaces the browser's default jerky scroll
                with a fluid, eased scroll experience.
```

They connect like this:

```
Next.js
  └── renders your React components as HTML
        └── React components are styled with Tailwind classes
              └── animated with Framer Motion
                    └── Lenis makes the scrolling between sections smooth
```

---

## 2. Terminal basics

You will type commands in the Terminal (Mac: Applications → Utilities → Terminal).

```bash
# Navigate into a folder
cd folder-name

# Go up one level
cd ..

# List files in current folder
ls

# Create a folder
mkdir folder-name

# Check Node.js version (you need this installed)
node -v

# Run a command from a package
npm run dev
npm install package-name
```

If `node -v` prints nothing or an error, download Node.js from https://nodejs.org — choose the LTS version and run the installer.

---

## 3. Project setup

Run these commands one at a time in your terminal.

### Create the Next.js project

```bash
npx create-next-app@latest sushi-cafe
```

You will be asked questions. Answer exactly like this:

```
Would you like to use TypeScript?               No
Would you like to use ESLint?                   Yes
Would you like to use Tailwind CSS?             Yes
Would you like your code inside a src/ dir?     No
Would you like to use App Router?               Yes
Would you like to use Turbopack?                Yes
Would you like to customise the import alias?   No
```

### Move into the project and install the two libraries

```bash
cd sushi-cafe
npm install framer-motion lenis
```

### Open it in VS Code

```bash
code .
```

If `code .` does not work, open VS Code manually, then File → Open Folder → select the `sushi-cafe` folder.

### Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser. You should see the Next.js welcome page. Leave this terminal running — it auto-refreshes every time you save a file.

---

## 4. Folder structure

Next.js generates some files you do not need. Here is what the project should look like after you clean it up and create the files you need:

```
sushi-cafe/
├── app/
│   ├── layout.jsx          ← the shell that wraps every page
│   ├── page.jsx            ← the home page (what renders at /)
│   └── globals.css         ← tailwind + your brand colours
│
├── components/
│   ├── Nav.jsx             ← top-right navigation
│   ├── Hero.jsx            ← full-screen title section
│   ├── Philosophy.jsx      ← scroll-triggered quote section
│   └── LenisProvider.jsx   ← smooth scroll setup
│
├── public/                 ← images go here later
├── next.config.mjs
└── package.json
```

Create the `components/` folder in the root of the project (next to `app/`):

```bash
mkdir components
```

Then create each component file:

```bash
touch components/Nav.jsx
touch components/Hero.jsx
touch components/Philosophy.jsx
touch components/LenisProvider.jsx
```

---

## 5. How Next.js works

### The App Router — folders are URLs

In Next.js, the `app/` folder controls your URLs. The file `app/page.jsx` renders at `/`. If you create `app/menu/page.jsx` it renders at `/menu`. You never configure routes manually.

```
app/page.jsx          →  yoursite.com/
app/menu/page.jsx     →  yoursite.com/menu
app/reserve/page.jsx  →  yoursite.com/reserve
```

### layout.jsx wraps every page

`app/layout.jsx` is special. It wraps every page in your app. It is the right place for things that should appear everywhere: fonts, the nav bar, global style, and the Lenis provider.

```
layout.jsx
  └── page.jsx (your page content goes here as {children})
```

### Server Components vs Client Components

This is the most important Next.js concept.

By default, every component in Next.js is a **Server Component**. Server components run on the server — they generate HTML but cannot access the browser. They cannot use `useState`, `useEffect`, or Framer Motion.

To use those things, you must mark a component as a **Client Component** by writing `'use client'` as the very first line of the file.

```jsx
'use client'   // ← makes this a Client Component

import { motion } from 'framer-motion'
import { useState } from 'react'
// now these work
```

**Rule for this project:** any file that imports from `framer-motion` or `lenis`, or uses `useState`/`useEffect`, needs `'use client'` at the top.

| File | Type | Reason |
|------|------|--------|
| `app/layout.jsx` | Server | Just structure, no browser APIs |
| `app/page.jsx` | Server | Just arranges components |
| `components/Nav.jsx` | **Client** | Uses Framer Motion |
| `components/Hero.jsx` | **Client** | Uses Framer Motion |
| `components/Philosophy.jsx` | **Client** | Uses Framer Motion |
| `components/LenisProvider.jsx` | **Client** | Uses `useEffect` and Lenis |

---

## 6. Tailwind CSS

Tailwind works by putting class names directly on your elements. There is no separate CSS file for most things.

```jsx
// Without Tailwind — you write CSS separately
// .hero { display: flex; height: 100vh; background: black; }
<section className="hero">

// With Tailwind — the classes ARE the styles
<section className="flex h-screen bg-black">
```

**Important:** In React/JSX, the HTML attribute is `className` not `class`.

### Classes used in this project

```
Display and layout
──────────────────
flex              →  display: flex
flex-col          →  flex-direction: column
items-center      →  align-items: center
justify-center    →  justify-content: center
justify-between   →  justify-content: space-between
flex-wrap         →  flex-wrap: wrap
gap-8             →  gap: 32px  (1 unit = 4px)
gap-x-[0.2em]     →  column gap only, custom value

Position
────────
fixed             →  position: fixed
absolute          →  position: absolute
relative          →  position: relative
top-0             →  top: 0
right-0           →  right: 0
bottom-9          →  bottom: 36px
left-0            →  left: 0
z-50              →  z-index: 50

Size
────
w-full            →  width: 100%
h-screen          →  height: 100vh
min-h-screen      →  min-height: 100vh
w-10              →  width: 40px
h-px              →  height: 1px

Spacing
───────
px-10             →  padding left + right: 40px
py-7              →  padding top + bottom: 28px
px-12             →  padding left + right: 48px
py-32             →  padding top + bottom: 128px
mb-5              →  margin-bottom: 20px

Typography
──────────
font-display      →  font-family: Bebas Neue (our custom font)
font-jp           →  font-family: Noto Serif JP
font-mono         →  font-family: Space Mono
leading-none      →  line-height: 1
tracking-tight    →  letter-spacing: -0.025em
tracking-[0.55em] →  exact letter-spacing
uppercase         →  text-transform: uppercase
text-center       →  text-align: center

Colour
──────
bg-brand-black    →  background: #0a0a0a  (our custom colour)
text-brand-white  →  color: #f0ebe4
text-brand-red    →  color: #c8102e
text-brand-white/35  →  white at 35% opacity
text-brand-white/50  →  white at 50% opacity
border-brand-white/10 →  border white at 10% opacity

Other
─────
overflow-hidden   →  overflow: hidden  (used for the clip trick)
block             →  display: block
border-t          →  border-top: 1px solid
origin-left       →  transform-origin: left
transition-colors →  smooth colour transition on hover
max-w-5xl         →  max-width: 64rem
```

### Custom values

When a value does not exist as a Tailwind preset, write it inside square brackets:

```jsx
text-[13px]              // exactly 13px
tracking-[0.55em]        // exact letter spacing
text-[clamp(56px,9vw,124px)]  // fluid clamp value
gap-x-[0.2em]            // exact gap
```

### Opacity shorthand

Add `/number` after any colour class to set opacity:

```jsx
text-brand-white/50    // white at 50% opacity
text-brand-white/35    // white at 35% opacity
border-brand-white/10  // white border at 10% opacity
```

---

## 7. React and JSX

### Components

A component is a JavaScript function that returns JSX — HTML-like code that React turns into real HTML.

```jsx
// This is a component
function Greeting() {
  return (
    <p>Hello world</p>
  )
}

export default Greeting
```

### JSX rules

```jsx
// 1. Use className instead of class
<div className="flex">

// 2. Self-closing tags need a slash
<img src="photo.jpg" />

// 3. JavaScript goes inside curly braces
const name = 'Sushi Cafe'
<h1>{name}</h1>

// 4. Conditional class names
const isRed = true
<span className={isRed ? 'text-brand-red' : 'text-brand-white'}>

// 5. Multiple elements need one root — use a fragment <> if needed
return (
  <>
    <h1>Title</h1>
    <p>Body</p>
  </>
)
```

### Props — passing data into components

```jsx
// Child receives props as an argument
function Word({ text, isRed }) {
  return (
    <span className={isRed ? 'text-brand-red' : 'text-brand-white'}>
      {text}
    </span>
  )
}

// Parent passes props like HTML attributes
<Word text="Sushi" isRed={true} />
<Word text="Cafe"  isRed={false} />
```

### .map() — rendering lists

`.map()` loops over an array and returns a component for each item. You will use this for the nav links and the quote words.

```jsx
const words = ['We', 'believe', 'sushi']

// Turns the array into JSX elements
words.map((word) => <span key={word}>{word}</span>)
// renders: <span>We</span> <span>believe</span> <span>sushi</span>
```

The `key` prop is required by React whenever you render a list. It helps React track which items change. Use something unique — here the word itself is unique.

### .includes() — checking if a value exists in an array

```jsx
const redWords = ['We', 'sushi', 'love']

redWords.includes('sushi')   // true
redWords.includes('believe') // false

// Used to decide which words are red
const isRed = redWords.includes(word)
```

### useEffect — run code after the component renders

```jsx
import { useEffect } from 'react'

useEffect(() => {
  // Code here runs once, after the component appears on screen
  // Used for setting up Lenis

  return () => {
    // Cleanup — runs when the component is removed
    // Used for destroying Lenis
  }
}, []) // Empty array = run once only
```

### The children prop

When you wrap content inside a component, that content becomes `children` inside it:

```jsx
// Usage
<LenisProvider>
  <Nav />
  <Hero />
</LenisProvider>

// Inside LenisProvider — children = Nav + Hero
function LenisProvider({ children }) {
  return <>{children}</>
}
```

---

## 8. Framer Motion

Framer Motion animates React components. Replace regular HTML tags with `motion` versions and add animation props.

```jsx
import { motion } from 'framer-motion'

// Regular React
<div className="flex">

// Framer Motion — now it can be animated
<motion.div className="flex">
```

Every HTML element has a motion version: `motion.div`, `motion.h1`, `motion.p`, `motion.span`, `motion.nav`, `motion.section`.

### The three animation props

```jsx
<motion.div
  initial={{ opacity: 0, y: 40 }}   // starting state
  animate={{ opacity: 1, y: 0 }}    // ending state — animates to this on load
  transition={{ duration: 0.8 }}    // how long and how it eases
/>
```

`initial → animate` fires automatically when the component mounts. Used for the hero animation.

### whileInView — animate on scroll

```jsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.8 }}
/>
```

`whileInView` fires when the element scrolls into view. `once: true` means it only fires once — it does not reset if you scroll back up. `amount: 0.3` means trigger when 30% of the element is visible.

### Variants — named states for cleaner code

Instead of writing `initial` and `animate` inline on every element, define named states in an object:

```jsx
const wordVariant = {
  hidden:  { y: '105%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
}

// Now use the names instead of inline values
<motion.span
  variants={wordVariant}
  initial="hidden"
  animate="visible"
/>
```

This is cleaner and enables the most powerful feature: staggering children.

### staggerChildren — the word-by-word pop

When a parent has `staggerChildren` in its variants, Framer Motion automatically passes `initial` and `animate` down to all children — and delays each one.

```jsx
// Parent — defines the stagger
const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09   // each child animates 0.09s after the previous
    }
  }
}

// Child — just defines its own movement
const wordVariant = {
  hidden:  { y: '105%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.9 } }
}

// In JSX — parent fires, children follow automatically
<motion.p variants={container} initial="hidden" whileInView="visible">
  <span className="overflow-hidden block">
    <motion.span variants={wordVariant}>We</motion.span>
  </span>
  <span className="overflow-hidden block">
    <motion.span variants={wordVariant}>believe</motion.span>
  </span>
</motion.p>
```

The children do not need `initial` or `animate` — they inherit it from the parent.

### The clip trick — how the word pop actually works

The word slides up from below a box that hides anything outside its bounds. The result looks like the word is being revealed through a slot.

```
Before:                    After:
┌─────────────┐            ┌─────────────┐
│             │            │    SUSHI    │  ← visible
└─────────────┘            └─────────────┘
     SUSHI    ← hidden below
```

```jsx
{/* Parent is the clip box — hides the child when it is below */}
<span className="overflow-hidden block">
  {/* Child starts below the box and slides up into view */}
  <motion.span
    className="block"
    variants={wordVariant}   {/* y: '105%' → y: 0 */}
  >
    Sushi
  </motion.span>
</span>
```

`overflow-hidden` on the parent is what creates the clip. Without it the word would be visible below the box during the animation.

### Custom easing

```jsx
transition: {
  duration: 0.95,
  ease: [0.16, 1, 0.3, 1]  // cubic bezier — fast start, very soft landing
}
```

The four numbers define a cubic bezier curve. `[0.16, 1, 0.3, 1]` is the same as the CSS `cubic-bezier(0.16, 1, 0.3, 1)` used in the original HTML — it shoots up quickly and settles gently.

---

## 9. Build: globals.css

Open `app/globals.css`. Delete everything in it and replace with:

```css
@import "tailwindcss";

@theme {
  --color-brand-red: #c8102e;
  --color-brand-black: #0a0a0a;
  --color-brand-white: #f0ebe4;
  --font-display: var(--font-display);
  --font-jp: var(--font-jp);
  --font-mono: var(--font-mono);
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background: #0a0a0a;
}
```

**What each part does:**

`@import "tailwindcss"` — loads all of Tailwind's utility classes. Must be the first line.

`@theme {}` — registers your custom values as Tailwind classes. After this, `text-brand-red`, `bg-brand-black`, `font-display` etc. all work as Tailwind classes. The `--font-display: var(--font-display)` line wires the CSS variable that `next/font` injects (set up next in layout.jsx) into Tailwind's font system.

`* { box-sizing: border-box }` — makes element sizing predictable. Without this, padding can cause elements to grow unexpectedly.

---

## 10. Build: app/layout.jsx

`layout.jsx` wraps every page. It handles fonts, the nav, Lenis, and global metadata.

Open `app/layout.jsx`, delete everything, and write this:

```jsx
import { Bebas_Neue, Noto_Serif_JP, Space_Mono } from 'next/font/google'
import Nav from '@/components/Nav'
import LenisProvider from '@/components/LenisProvider'
import './globals.css'

// --- Font setup ---
// next/font downloads each font at build time and serves it from your domain.
// Each font creates a CSS variable that Tailwind's font-display/font-jp/font-mono
// classes will use.

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',  // creates CSS var --font-display
})

const notoSerifJP = Noto_Serif_JP({
  weight: ['200', '300'],
  subsets: ['latin'],
  variable: '--font-jp',       // creates CSS var --font-jp
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',     // creates CSS var --font-mono
})

// --- SEO metadata ---
// Next.js reads this and puts it in the <head> automatically.
export const metadata = {
  title: 'Sushi Cafe Melbourne',
  description: 'Handcrafted sushi in Melbourne. Fresh daily, made with love.',
}

// --- The layout component ---
// {children} is where app/page.jsx renders.
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${notoSerifJP.variable} ${spaceMono.variable}`}
    >
      <body className="bg-brand-black">
        <LenisProvider>
          <Nav />
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
```

**What is happening here:**

`from 'next/font/google'` — Next.js's built-in font loader. Downloads the font at build time, no Google request from the browser.

`variable: '--font-display'` — this injects a CSS custom property onto the `<html>` element. In `globals.css` you wrote `--font-display: var(--font-display)` in `@theme` — that wires the injected variable into Tailwind's `font-display` class.

`className={`${bebasNeue.variable} ${spaceMono.variable}...`}` — applying all three font variables to the `<html>` element so they are available everywhere on the page. The backtick syntax with `${}` is called a template literal — it lets you embed variables inside a string.

`{children}` — everything that `app/page.jsx` returns gets inserted here.

`@/` — a path alias that means "from the root of the project". `@/components/Nav` is the same as `../../components/Nav` but cleaner.

---

## 11. Build: app/page.jsx

This is the home page. It is a Server Component — no `'use client'` needed because it just arranges other components.

Open `app/page.jsx`, delete everything, and write this:

```jsx
import Hero from '@/components/Hero'
import Philosophy from '@/components/Philosophy'

export default function Home() {
  return (
    <main className="bg-brand-black">
      <Hero />
      <Philosophy />
    </main>
  )
}
```

That is the entire home page. Three lines of JSX. The actual work is inside `Hero` and `Philosophy`.

---

## 12. Build: components/Nav.jsx

The nav sits fixed in the top-right corner and fades in after the hero animation completes.

Open `components/Nav.jsx` and write:

```jsx
'use client'

import { motion } from 'framer-motion'

// The three links in the nav
const links = ['About', 'Menu', 'Reserve']

export default function Nav() {
  return (
    <motion.nav
      className="fixed top-0 right-0 z-50 flex gap-8 px-10 py-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      // Fades in after 1.2s — gives the hero words time to land first
    >
      {links.map((link) => (
        <a
          key={link}
          href={`#${link.toLowerCase()}`}
          // href="#about", "#menu", "#reserve" — links to section ids
          className="font-mono text-[10px] tracking-[0.18em] uppercase text-brand-white/50 hover:text-brand-white transition-colors"
        >
          {link}
        </a>
      ))}
    </motion.nav>
  )
}
```

**Breaking this down:**

`'use client'` — required because this file uses Framer Motion.

`motion.nav` — the `<nav>` element but animatable. Same as a regular `<nav>` plus animation props.

`initial={{ opacity: 0 }} animate={{ opacity: 1 }}` — starts invisible, animates to visible. Fires automatically when the component loads.

`transition={{ delay: 1.2 }}` — waits 1.2 seconds before starting. This gives the hero words time to pop in first so the animations do not fight each other.

`links.map((link) => (...))` — loops over `['About', 'Menu', 'Reserve']` and creates an `<a>` for each one.

`href={`#${link.toLowerCase()}`}` — creates `#about`, `#menu`, `#reserve`. The backtick string with `${}` embeds the variable. `.toLowerCase()` turns `About` into `about`.

`text-brand-white/50` — the nav links are white at 50% opacity by default, full white on hover.

---

## 13. Build: components/Hero.jsx

The hero is the full-screen first section. It contains the animated title, the JP text, and the bottom bar.

Open `components/Hero.jsx` and write:

```jsx
'use client'

import { motion } from 'framer-motion'

// --- Animation variants ---

// Container for the two title words.
// staggerChildren means each child animates 0.2s after the previous one.
const titleContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}

// Each word slides up from below its clip box.
// ease: [0.16, 1, 0.3, 1] is a fast-start, soft-landing cubic bezier.
const wordVariant = {
  hidden: { y: '105%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.95,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

// The JP text fades up from a slight offset.
const jpVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.2 },
  },
}

// The bottom bar (Melbourne + Scroll) fades in after everything else.
const bottomVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.7, delay: 1.1 },
  },
}

// --- Component ---

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative h-screen flex flex-col items-center justify-center bg-brand-black overflow-hidden"
      // relative  → needed so the absolute bottom bar is positioned relative to this section
      // h-screen  → full viewport height
      // flex flex-col items-center justify-center → centres children both ways
    >

      {/* JP text — 寿 司 カ フ ェ */}
      <motion.p
        className="font-jp text-[13px] font-light tracking-[0.55em] text-brand-white/35 mb-5"
        variants={jpVariant}
        initial="hidden"
        animate="visible"
      >
        寿 司 カ フ ェ
      </motion.p>

      {/* Main title — SUSHI CAFE */}
      {/*
        This motion.h1 is the stagger container.
        It has variants={titleContainer} which has staggerChildren: 0.2.
        Both child motion.spans use variants={wordVariant}.
        Framer Motion automatically staggers them 0.2s apart.
      */}
      <motion.h1
        className="font-display text-[clamp(100px,19vw,280px)] leading-none tracking-tight flex gap-[0.06em]"
        variants={titleContainer}
        initial="hidden"
        animate="visible"
      >

        {/* SUSHI — red */}
        {/* The outer span is the clip box (overflow-hidden). */}
        {/* The motion.span starts at y:'105%' (below the box) and rises to y:0 (visible). */}
        <span className="overflow-hidden block">
          <motion.span
            className="block text-brand-red"
            variants={wordVariant}
          >
            Sushi
          </motion.span>
        </span>

        {/* CAFE — white, same structure */}
        <span className="overflow-hidden block">
          <motion.span
            className="block text-brand-white"
            variants={wordVariant}
          >
            Cafe
          </motion.span>
        </span>

      </motion.h1>

      {/* Bottom bar — absolutely positioned so it does not push the title off-centre */}
      {/*
        Because the section is position:relative and this is position:absolute,
        this sits at the bottom of the section without affecting the flexbox centering above.
      */}
      <motion.div
        className="absolute bottom-9 left-0 right-0 px-10 flex items-center justify-between"
        variants={bottomVariant}
        initial="hidden"
        animate="visible"
      >

        {/* Left — city name */}
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-brand-white/20">
          Melbourne, Australia
        </span>

        {/* Right — scroll hint */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-brand-white/20">
            Scroll
          </span>
          {/* The red line grows from left to right (scaleX 0 → 1, origin-left) */}
          <motion.div
            className="h-px w-10 bg-brand-red origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          />
        </div>

      </motion.div>

    </section>
  )
}
```

**Key things to understand:**

`text-[clamp(100px,19vw,280px)]` — the title size is fluid. On a small phone it is at least 100px. On a large monitor it caps at 280px. In between it scales with the viewport width. The square brackets let you use any CSS value Tailwind does not have a preset for.

`relative` on the section + `absolute` on the bottom bar — the section is the reference point. The bottom bar is taken out of the flexbox flow so the centering only applies to the JP text and the title. Without this, the bottom bar would push the title upward.

`staggerChildren: 0.2` in `titleContainer` — Framer Motion reads this and delays each child by 0.2 seconds. "SUSHI" animates first, "CAFE" follows 0.2s later. You write the delay once on the parent — not once per child.

`origin-left` — makes the red line scale from its left edge outward, so it draws left to right.

---

## 14. Build: components/Philosophy.jsx

The philosophy section triggers on scroll. Each word in the quote pops up one by one as the section comes into view.

Open `components/Philosophy.jsx` and write:

```jsx
'use client'

import { motion } from 'framer-motion'

// --- Data ---

// The full quote as an array — one item per word
const words = ['We', 'believe', 'sushi', 'is', 'best', 'made', 'by', 'hand,', 'with', 'love']

// Which words should appear in red
const redWords = ['We', 'sushi', 'hand,', 'love']

// --- Animation variants ---

// Container — staggers each word 0.09s apart.
// whileInView on the parent triggers this when the section scrolls into view.
const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
}

// Each word — same clip slide-up as the hero
const wordVariant = {
  hidden: { y: '105%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

// --- Component ---

export default function Philosophy() {
  return (
    <section
      id="about"
      className="min-h-screen flex items-center justify-center bg-brand-black border-t border-brand-white/10 px-12 py-32"
      // border-t border-brand-white/10 → thin white line separating from the hero
      // min-h-screen → at least full screen height
      // flex items-center justify-center → quote sits in the middle
    >

      {/*
        This motion.p is the stagger container.
        whileInView="visible" fires when the section scrolls into view.
        viewport={{ once: true }} means it only fires once — not every time you scroll past.
        amount: 0.3 means trigger when 30% of the section is visible.

        The children (each .w span) inherit the initial/animate from this parent
        and stagger 0.09s apart automatically.
      */}
      <motion.p
        className="font-display text-[clamp(56px,9vw,124px)] leading-none tracking-wide flex flex-wrap justify-center gap-x-[0.2em] max-w-5xl text-center"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >

        {/*
          words.map() loops over the array and returns a clip box + animated word for each.

          For each word:
          1. Check if it is in redWords using .includes() → isRed = true or false
          2. The outer span is the clip box (overflow-hidden)
          3. The inner motion.span slides up from y:'105%' to y:0
          4. The colour class is chosen based on isRed
        */}
        {words.map((word) => {
          const isRed = redWords.includes(word)

          return (
            <span key={word} className="overflow-hidden block">
              <motion.span
                className={`block ${isRed ? 'text-brand-red' : 'text-brand-white'}`}
                variants={wordVariant}
              >
                {word}
              </motion.span>
            </span>
          )
        })}

      </motion.p>
    </section>
  )
}
```

**Key things to understand:**

`whileInView="visible"` — this is what makes the whole section wait until you scroll to it. Framer Motion watches the element with an IntersectionObserver internally. When it becomes 30% visible, it transitions from `"hidden"` to `"visible"`, which triggers the stagger and every word pops up in sequence.

`viewport={{ once: true }}` — without this the animation would reset every time you scroll away and back. `once: true` makes it fire once and stay.

`words.map((word) => { ... })` — this produces ten clip-box + motion.span pairs from the array. If you want to change the quote, just update the `words` array and the `redWords` array — the component rebuilds itself.

`` className={`block ${isRed ? 'text-brand-red' : 'text-brand-white'}`} `` — the backtick string embeds the conditional class. `block` is always applied. The colour class is decided by whether `isRed` is true or false.

---

## 15. Build: components/LenisProvider.jsx

Lenis replaces the browser's default scroll with a smooth, eased version. It needs `useEffect` (a browser API) so it must be a Client Component. We wrap it in its own component so the Server Component `layout.jsx` can use it as a child.

Open `components/LenisProvider.jsx` and write:

```jsx
'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }) {

  useEffect(() => {
    // Create the Lenis instance with our settings
    const lenis = new Lenis({
      duration: 1.4,
      // How long a scroll gesture takes to settle (in seconds)

      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Exponential ease-out — starts fast, slows to a very gentle stop.
      // t goes from 0 (scroll start) to 1 (scroll end).
      // Math.pow(2, -10 * t) is an exponential decay curve.
    })

    // Lenis needs to be updated every animation frame (60fps).
    // requestAnimationFrame calls a function on every frame.
    // raf calls itself recursively to keep running forever.
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Cleanup — when the component unmounts, destroy Lenis
    // to avoid memory leaks
    return () => lenis.destroy()

  }, []) // Empty array = run once when the component mounts

  // This component is invisible — it just renders its children
  return <>{children}</>
}
```

**Why a separate component?**

`layout.jsx` is a Server Component. Server Components cannot use `useEffect`. But Lenis needs `useEffect`. The solution is to move the Lenis setup into its own Client Component (`LenisProvider`) and then use that component inside `layout.jsx`. Server Components can render Client Components as children — they just cannot use browser APIs themselves.

**The `raf` loop:**

Lenis does not hook into the browser's scroll event directly. Instead it needs to be manually ticked every frame. `requestAnimationFrame` gives you a callback at ~60fps. The `raf` function calls `lenis.raf(time)` to update Lenis, then immediately schedules itself to run again next frame. This creates an infinite loop at 60fps that keeps Lenis running for the entire life of the page.

---

## 16. Run and check

Save all files. Your terminal should still be running `npm run dev`. Open `http://localhost:3000`.

You should see:
- Black screen
- "SUSHI" in red and "CAFE" in white popping up from below, staggered
- Faint JP characters above
- Nav fading in top-right after the words land
- Melbourne / Scroll at the bottom
- Smooth scroll down to the philosophy section
- Each word of the quote popping up one by one on scroll

**If something does not look right, check this list:**

| Symptom | Most likely cause | Fix |
|---------|------------------|-----|
| White page, nothing renders | Syntax error in a component | Check the terminal for a red error message |
| `window is not defined` | Framer Motion or Lenis in a Server Component | Add `'use client'` to that file |
| `Cannot find module 'framer-motion'` | Package not installed | Run `npm install framer-motion` |
| `Cannot find module 'lenis'` | Package not installed | Run `npm install lenis` |
| Fonts not loading | Variable name mismatch | Check `variable: '--font-display'` in layout.jsx matches `@theme` in globals.css |
| Custom colours not working | Wrong `@theme` syntax | Make sure colours are inside `@theme {}` in globals.css |
| Words not animating on scroll | `whileInView` on wrong element | It must be on a `motion.` element, not a plain `<span>` |
| Words animate immediately | `whileInView` missing | Make sure Philosophy uses `whileInView` not `animate` |
| Title not centred | `absolute` missing from bottom bar | The bottom bar needs `absolute` so it leaves the flexbox flow |

---

## 17. Deploy to Vercel

Vercel is made by the same team as Next.js. Deploying is free and takes two minutes.

### Option A — Vercel CLI (fastest)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Your site gets a live URL like `sushi-cafe-abc.vercel.app`.

### Option B — GitHub + Vercel (recommended for ongoing work)

Every time you push code, Vercel redeploys automatically.

**Step 1 — push to GitHub:**

```bash
git init
git add .
git commit -m "initial build"
```

Create a new repository at https://github.com/new, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/sushi-cafe.git
git push -u origin main
```

**Step 2 — connect to Vercel:**

1. Go to https://vercel.com and sign up (use your GitHub account)
2. Click Add New Project
3. Import your `sushi-cafe` repository
4. Vercel detects Next.js automatically — click Deploy
5. Done. Your site is live.

**From now on:** edit code → `git add . && git commit -m "description" && git push` → site updates in ~30 seconds.

### Add a custom domain

In your Vercel dashboard → project → Settings → Domains → Add `sushicafe.com.au`. Vercel gives you DNS records to add to your domain registrar (Namecheap, GoDaddy, etc.) and provisions a free SSL certificate automatically.

---

## 18. What the complete file list looks like

Here is every file you wrote and what it does:

```
app/globals.css
  @import tailwindcss
  @theme with brand colours and font variables

app/layout.jsx
  Server Component
  next/font setup for Bebas Neue, Noto Serif JP, Space Mono
  Applies font variables to <html>
  Wraps everything in <LenisProvider> and <Nav>
  SEO metadata

app/page.jsx
  Server Component
  Renders <Hero /> and <Philosophy /> inside a <main>

components/Nav.jsx
  'use client'
  motion.nav fades in with delay: 1.2
  links.map() renders the three nav links

components/Hero.jsx
  'use client'
  titleContainer variant with staggerChildren: 0.2
  wordVariant with y:'105%' → y:0 (the clip trick)
  jpVariant fades up
  bottomVariant fades in late
  absolute bottom bar does not affect flex centering

components/Philosophy.jsx
  'use client'
  container variant with staggerChildren: 0.09
  whileInView fires on scroll, once only
  words.map() renders each word with its clip box
  redWords.includes() decides the colour per word

components/LenisProvider.jsx
  'use client'
  useEffect creates Lenis once on mount
  requestAnimationFrame raf loop keeps Lenis running
  returns () => lenis.destroy() cleans up on unmount
  renders children invisibly
```

---

## Key patterns to remember

These four patterns cover most of what you built. Learn to recognise them.

**1. Clip + slide (the word pop)**
```
overflow-hidden on parent  →  y: '105%' on child  →  y: 0 on trigger
```

**2. Scroll trigger**
```
whileInView="visible"  +  viewport={{ once: true }}  on a motion element
```

**3. Stagger**
```
staggerChildren: 0.09 on parent variant  →  children just need matching variant names
```

**4. Absolute positioning for centering**
```
relative on section  +  absolute on the bottom bar  →  bar sits at bottom without affecting flex
```

