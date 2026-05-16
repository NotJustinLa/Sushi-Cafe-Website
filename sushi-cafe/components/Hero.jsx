'use client'

import { motion } from 'framer-motion'

// --- Animation variants ---
//container for two title words.
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
// ease: [0.16, 1, 0.3, 1] is a fast-start, soft landing cubic bezier
const wordVariant = {
    hidden: { y: '105%' , opacity: 0},
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.95,
            ease: [0.16, 1, 0.3, 1],
        },
    },
}

const jpVariant = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: 0.2 },
    },
}

// The bottom bar (melbourne + Scroll) fades in
// after everything else.
const bottomVariant = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.7, delay: 1.1},
    },
}

export default function Hero() {
    return (
        <section
        id="hero"
        // "This section is a full-screen black box, centred both ways, with children stacked vertically, and anything that spills outside gets clipped."
        className="relative h-screen flex flex-col items-center justify-center bg-brand-black text-center overflow-hidden"
    >
        {/* JP text*/}
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
            className="font-display text-[clamp(100px,19vw,280px)]
            leading-none tracking-[-0.02em] flex gap-[0.06em]"
            variants={titleContainer}
            initial="hidden"
            animate="visible"
        >
            { /* loops over the words */ }
            {[
                { word: 'SUSHI', color: 'text-brand-red' },
                { word: 'CAFE',  color: 'text-brand-white' },
                ].map(({ word, color }) => (
                <span key={word} className="overflow-hidden block">
                    <motion.span className={`block ${color}`} variants={wordVariant}>
                    {word}
                    </motion.span>
                </span>
            ))}

        </motion.h1>
        
        {/* Bottom text - absolutely positioned so it
         does not push the title off centre */}

         <motion.div
            className="absolute bottom-9 right-10 flex
            items-center gap-6"
            variants={bottomVariant}
            initial="hidden"
            animate="visible"
         >
        {/* Left - city name */}
        <span className="font-mono text-[9px] tracking-[0.3em]
        uppercase text-brand-white/50">
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

    




