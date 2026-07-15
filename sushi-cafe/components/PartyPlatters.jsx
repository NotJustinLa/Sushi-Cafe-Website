'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useCart } from './CartProvider'
import SplitWord from './SplitWord'

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
}

// A platter is EITHER a single price ({ price })
// OR a set of size variants ({ sizes: [{ label, price }, …] }).
// The card renders a size toggle only when `sizes` is present.
const platters = [
    {
        name: 'Handroll Platter',
        sizes: [
            { label: 'Small', price: 55 },
            { label: 'Medium', price: 67 },
            { label: 'Large', price: 80 },
        ],
    },
    { name: 'Salmon Sashimi Platter', price: 120 },
    { name: 'Deluxe Platter for Two', price: 65 },
    { name: 'Mixed Sushi Platter', price: 55 },
    { name: 'Assorted Sushi Platter', price: 78 },
    { name: 'Sushi & Sashimi Platter', price: 120 },
]

// Turn a name/size into a stable cart id: "Handroll Platter" + "Medium"
// → "handroll-platter-medium".
const slug = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// One platter card. Shows a size toggle when the item has `sizes`. The image
// area is intentionally an empty box — drop an <img> into the slot when you
// have photos.
function PlatterCard({ name, price, sizes }) {
    const { addItem } = useCart()
    const hasSizes = Array.isArray(sizes) && sizes.length > 0

    // Which size is selected. Default to the first (Small). Unused when
    // the platter has no sizes.
    const [sizeIdx, setSizeIdx] = useState(0)

    // Resolve the "active" price + label from whichever mode we're in.
    const activePrice = hasSizes ? sizes[sizeIdx].price : price
    const activeLabel = hasSizes ? sizes[sizeIdx].label : undefined

    const [justAdded, setJustAdded] = useState(false)

    function handleAdd() {
        addItem({
            id: hasSizes ? `${slug(name)}-${slug(activeLabel)}` : slug(name),
            name,
            variant: activeLabel,
            price: activePrice,
        })
        // Tiny confirmation flash on the button.
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 1200)
    }

    return (
        <motion.article
            variants={fadeUp}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="group flex h-full flex-col overflow-hidden rounded-lg border border-rule bg-bg-paper"
        >
            {/* IMAGE SLOT — empty on purpose. Replace this div with your <img>. */}
            <div aria-hidden="true" className="aspect-[4/3] w-full bg-bg-deep" />

            <div className="flex flex-1 flex-col gap-4 p-6">
                {/* Name + live price */}
                <div className="flex items-start justify-between gap-4">
                    <h3 className="m-0 font-display text-[22px] font-bold leading-tight text-ink">
                        {name}
                    </h3>
                    <span className="shrink-0 font-display text-[22px] font-bold leading-tight text-red">
                        ${activePrice}
                    </span>
                </div>

                {/* Handroll: S / M / L toggle. */}
                {hasSizes && (
                    <div
                        role="group"
                        aria-label={`${name} size`}
                        className="flex gap-2"
                    >
                        {sizes.map((s, i) => {
                            const selected = i === sizeIdx
                            return (
                                <button
                                    key={s.label}
                                    type="button"
                                    onClick={() => setSizeIdx(i)}
                                    aria-pressed={selected}
                                    className={[
                                        'flex-1 rounded-md border py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-200',
                                        selected
                                            ? 'border-ink bg-ink text-bg'
                                            : 'border-rule text-ink-mute hover:border-ink hover:text-ink',
                                    ].join(' ')}
                                >
                                    {s.label[0]}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Add to cart — pushes to the bottom of the card. */}
                <button
                    type="button"
                    onClick={handleAdd}
                    className="mt-auto rounded-full border border-ink bg-transparent py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-colors duration-200 hover:bg-ink hover:text-bg"
                >
                    {justAdded ? 'Added ✓' : `Add to cart · $${activePrice}`}
                </button>
            </div>
        </motion.article>
    )
}

// "Party platters" — grouped horizontal snap strips of order-ahead platters
// with add-to-cart, mirroring the eyebrow / headline pattern from About.
export default function PartyPlatters() {
    const wrapperRef = useRef(null)
    const stripRef = useRef(null)

    const { scrollYProgress } = useScroll({
        target: wrapperRef,
        offset: ['start start', 'end end'],
    })

    useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const strip = stripRef.current
    if (!strip) return 
    const maxScroll = strip.scrollWidth - strip.clientWidth
    if (maxScroll <= 0 ) return // dont need to scroll as the scroll width fits
    strip.scrollLeft = progress * maxScroll
 })

 //dynamicaly set the wrapper height 
    const [wrapperHeight, setWrapperHeight] = useState('100vh')

    useEffect(() => {
        const strip = stripRef.current
        if (!strip) return

        function recalculate() {
            const maxScroll = strip.scrollWidth - strip.clientWidth
            setWrapperHeight(`calc(100vh + ${maxScroll}px)`)
        }

        recalculate()
        const observer = new ResizeObserver(recalculate)
        observer.observe(strip)
        return () => observer.disconnect()
    }, [])
        
    return (
        // The wrapper is a tall invisible spacer. Its height = 100vh + strip's
        // scroll width, so the section stays pinned for exactly as long as it
        // takes to scroll through all the cards.
        <div ref={wrapperRef} style={{ height: wrapperHeight }}>
            <section
                id="platters"
                className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden border-t border-rule px-[var(--pad-x)]"
            >
                <div className="mx-auto w-full max-w-[var(--container-maxw)]">

                    {/* Headline */}
                    <motion.h2
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.6 }}
                        variants={fadeUp}
                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                        className="mb-10 mt-1 ml-10 max-w-[18ch] font-display text-[clamp(40px,5vw,80px)] font-bold leading-[0.95] tracking-[-0.015em] text-balance"
                    >
                        <SplitWord>Party </SplitWord>
                        <em className="italic text-red"><SplitWord>platters</SplitWord></em>
                    </motion.h2>

                    {/* Card strip — overflow-x-auto on mobile (native touch scroll),
                        overflow-hidden on md+ (programmatic drive via scrollLeft) */}
                    <motion.div
                        ref={stripRef}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ staggerChildren: 0.1 }}
                        className="-mx-[var(--pad-x)] flex gap-6 overflow-x-auto md:overflow-hidden scroll-px-[var(--pad-x)] px-[var(--pad-x)] pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {platters.map((item) => (
                            <div
                                key={item.name}
                                className="w-[300px] shrink-0"
                            >
                                <PlatterCard {...item} />
                            </div>
                        ))}
                    </motion.div>

                </div>
            </section>
        </div>
    )
}
