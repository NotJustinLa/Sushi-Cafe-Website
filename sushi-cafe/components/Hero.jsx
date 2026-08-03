'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SplitWord from './SplitWord'

const fadeUp = {
    hidden: { opacity: 0, y: 16},
    show: { opacity: 1, y: 0 },
};

// Full-viewport hero section with staggered fade-up entrance animations and decorative elements.
export default function Hero() {
    const sectionRef = useRef(null)

    // Scroll-linked parallax: track progress as the hero scrolls out of view.
    // 0 = section top aligned with viewport top (fully in view), 1 = section
    // bottom has reached the viewport top (fully scrolled past).
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end start'],
    })

    // Drift the content upward as you scroll down. Bound to scroll position, so
    // scrolling back up reverses the motion for free.
    const contentY = useTransform(scrollYProgress, [0, 1], [0, -120])

    // Rising-sun arc for the background circle. As you scroll down it sweeps
    // up-and-left along a curved path: x travels leftward while y climbs, with
    // the mid-stop making the trajectory curve (an arc) rather than a straight
    // diagonal. vw/vh keep it responsive; at progress 0 both are zero so the
    // sun starts exactly where it sits statically. Reverses on scroll-up.
    const sunX = useTransform(scrollYProgress, [0, 0.5, 1], ['0vw', '-28vw', '-55vw'])
    const sunY = useTransform(scrollYProgress, [0, 0.5, 1], ['0vh', '-28vh', '-34vh'])

    return (
        <section
        ref={sectionRef}
        id="hero"
        className="relative isolate grid min-h-screen grid-cols-1
        items-center overflow-x-clip px-[var(--pad-x)] pb-20 pt-[90px]"
        >
        {/* Faint background circle - decorative "sun". Outer div holds the base
            position + vertical centering (its own transform); the inner motion
            layer carries the scroll-linked arc transform so the two don't clash. */}
        <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-8vw]
            top-1/2 -z-10 aspect-square w-[clamp(100px,48vw,820px)]
            -translate-y-1/2"
        >
            <motion.div
                style={{ x: sunX, y: sunY }}
                className="h-full w-full rounded-full bg-red opacity-[0.1]"
            />
        </div>

        {/* Aoi leaf motifs - decorative. Two only: top-left and bottom-right,
            each with its tip pointing into the middle of the screen. The leaf
            points straight down at 0deg, so -45deg aims the tip down-right
            (top-left corner) and 135deg aims it up-left (bottom-right corner). */}
        {[
            { style: { top: '4vh',    left:  '2vw'  }, rotate: '-45deg', opacity: 0.11, size: 'clamp(140px,20vw,300px)' },
            { style: { bottom: '4vh', right: '2vw'  }, rotate: '135deg', opacity: 0.11, size: 'clamp(140px,20vw,300px)' },
        ].map(({ style, rotate, opacity, size }, i) => (
            <div
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute -z-10 aspect-square"
                style={{
                    width: size,
                    ...style,
                    opacity,
                    backgroundColor: 'var(--color-red)',
                    transform: `rotate(${rotate})`,
                    maskImage: 'url(/aoi_leaf_background.png)',
                    WebkitMaskImage: 'url(/aoi_leaf_background.png)',
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                }}
            />
        ))}

        {/* staggered content container*/}
        <motion.div
            className="relative mx-auto w-full
            max-w-[var(--container-maxw)]"
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.12, delayChildren: 1.2 }}
            style={{ y: contentY }}
        >

            {/* Main headline */}
            <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
                className="m-0 max-w-[9ch] font-display text-[clamp(72px,14vw,220px)] font-bold italic leading-none tracking-[-0.02em] gap-[0.05em]"
            >
                <span className="block"><SplitWord>Sushi</SplitWord></span>
                <span className="block">
                    <em className="italic text-red"><SplitWord>Cafe</SplitWord></em>
                </span>
            </motion.h1>

            {/* Sub Copy */}
            <motion.div
                variants={fadeUp}
                transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                className="mt-7 max-w-[45ch] text-[clamp(16px,1.4vw,19px)] 
                leading-[1.5] text-ink-soft"
            >
                <p>A family owned sushi spot on Doncaster Road. </p>
                
                <p>John and family, rolling fast,
                fresh nigiri, sashimi and rolls in Balwyn North since 2013.</p>
            </motion.div>

            {/* Meta row */}
            <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-12 flex flex-wrap gap-7 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute"
            >
            {["Est. 2013", "Balwyn North · VIC"].map((item) => (
                <span
                key={item}
                className="inline-flex items-center gap-2 before:h-1 before:w-1 before:rounded-full before:bg-red before:content-['']"
                >
                {item}
                </span>
            ))}
            </motion.div>

        </motion.div>

        {/* Vertical Japanese rail — positions against the section */}
        <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.6, ease: "easeOut" }}
            className="absolute right-3 top-1/2 -translate-y-1/2 select-none font-jp text-[13px] font-medium tracking-[0.35em] text-ink-mute [writing-mode:vertical-rl] max-md:text-[11px]"
        >
            新鮮・手作り・292ドンキャスター
        </motion.div>
    </section>
  );
}

