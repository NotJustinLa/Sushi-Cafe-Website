'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Hanko from './Hanko'
import SplitWord from './SplitWord'

const fadeUp = {
    hidden: { opacity: 0, y: 16},
    show: { opacity: 1, y: 0},
}

export default function About() {
    const sectionRef = useRef(null)

    // Scroll-linked progress across the whole time the section passes through
    // the viewport: 0 as it enters from the bottom, 1 as it leaves off the top.
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    })

    // Slide the big title and the smaller quote in opposite directions on the
    // x-axis. The movement is concentrated at entry (0 → 0.2) and exit
    // (0.8 → 1); through the middle they sit still. Bound to scroll position,
    // so scrolling back up reverses it.
    const titleX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [-24, 0, 0, 24])
    const quoteX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [24, 0, 0, -24])

    return (
        <section
            ref={sectionRef}
            id="about"
            className="relative min-h-screen overflow-x-clip border-t
            border-rule px-[var(--pad-x)] py-[120px]"

        >
        
            <div className="mx-auto grid w-full max-w-[var(--container-maxw)]
            items-center gap-20
            md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">

                {/* Left - reserved for the 3d hand */}
                <div className="relative min-h-[60vh]">
                    <div className="absolute bottom-0 left-0 flex flex-col gap-[14px]">
                        <div className="flex items-center gap-[14px]">
                                <Hanko char="鮨" />
                                <p className="m-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute">
                                    Sushi made daily
                                </p>
                            </div>
                            <div className="flex items-center gap-[14px]">
                                <Hanko char="家" rotate={3} />
                                <p className="m-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute">
                                    Family run for 13 years
                                </p>
                            </div>
                        </div>
                    </div>

                {/* Right for the text content */}
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ staggerChildren: 0.12 }}
                >

                    {/* Title */}
                    <motion.h2
                        variants={fadeUp}
                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                        style={{ x: titleX }}
                        className="mb-9 mt-6 max-w-[20ch] font-display text-[clamp(44px,5vw,88px)] font-bold leading-[0.95] tracking-[-0.015em] text-balance "
                    >
                        <span><SplitWord>One family.</SplitWord></span>
                        <em className="italic text-red"><SplitWord>Thirteen years.</SplitWord></em>{' '}
                        <span><SplitWord>A whole lot of fish.</SplitWord></span>
                    </motion.h2>

                    {/* Copy + quote */}
                    <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                        style={{ x: quoteX }}
                        className="max-w-[48ch] text-[clamp(16px,1.3vw,19px)] leading-[1.6] text-ink-soft"
                    >
                        <p className="mt-10 border-l-2 border-red pl-[22px] font-display text-[clamp(20px,1vw,26px)] italic leading-[1.35] text-ink">
                            Hi, we're John and family. We've been rolling sushi on Doncaster Road
                            for 13 years now. What started as a dad with a passion for good food
                            has turned into one of the neighbourhood's favourite quick stops.
                        </p>
                        <p className="mt-10 mb-[18px]">
                            Fast, fresh, and made with a little love every single time.
                        </p>
                        </motion.div>
        </motion.div>
      </div>
    </section>
  )
}