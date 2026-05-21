'use client'

import { motion } from 'framer-motion'

const fadeUp = {
    hidden: { opacity: 0, y: 16},
    show: { opacity: 1, y: 0 },
};

// Full-viewport hero section with staggered fade-up entrance animations and decorative elements.
export default function Hero() {
    return (
        <section 
        id="hero" 
        className="relative grid min-h-screen grid-cols-1
        items-center px-[var(--pad-x)] pb-20 pt-[90px]"
        >
        {/* Faint background circle - decorative */}
        <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-8vw]
            top-1/2 -z-10 aspect-square w-[clamp(200px, 60vw, 820px)] 
            -translate-y-1/2 rounded-full bg-red opacity-[0.06]"
        />

        {/* staggered content container*/}
        <motion.div
            className="relative mx-auto w-full 
            max-w-[var(--container-maxw)]"
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

            {/* Sub Copy */}
            <motion.p
                variants={fadeUp}
                transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                className="mt-7 max-w-[32ch] text-[clamp(16px,1.4vw,19px)] 
                leading-[1.5] text-ink-soft"
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
        </motion.div>
    </section>
  );
}

