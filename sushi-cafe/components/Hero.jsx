'use client'

import { motion } from 'framer-motion'

const fadeUp = {
    hidden: { opacity: 0, y: 16},
    show: { opacity: 1, y: 0 },
};

function SplitWord({ children }) {
    return (
        <span style={{ display: 'inline-block' }}>
            {[...children].map((char, i) => (
                <motion.span
                    key={i}
                    style={{ display: 'inline-block' }}
                    whileHover={{ y: -10 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                    {char}
                </motion.span>
            ))}
        </span>
    )
}

// Full-viewport hero section with staggered fade-up entrance animations and decorative elements.
export default function Hero() {
    return (
        <section 
        id="hero" 
        className="relative isolate grid min-h-screen grid-cols-1
        items-center px-[var(--pad-x)] pb-20 pt-[90px]"
        >
        {/* Faint background circle - decorative */}
        <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-8vw]
            top-1/2 -z-10 aspect-square w-[clamp(100px,48vw,820px)]
            -translate-y-1/2 rounded-full bg-red opacity-[0.1]"
        />

        {/* Aoi leaf motifs - decorative */}
        {[
            { style: { top: '6vh',    left:  '5vw'  }, rotate: '20deg',  opacity: 0.13, size: 'clamp(60px,11vw,160px)'  },
            { style: { top: '45vh',   left:  '6vw'  }, rotate: '55deg',  opacity: 0.09, size: 'clamp(60px,10vw,145px)'  },
            { style: { bottom: '8vh', left:  '3vw'  }, rotate: '-20deg', opacity: 0.10, size: 'clamp(55px,9vw,130px)'   },
            { style: { top: '8vh',    left:  '30vw' }, rotate: '-50deg', opacity: 0.07, size: 'clamp(48px,6.5vw,95px)'  },
            { style: { top: '33vh',   left:  '18vw' }, rotate: '110deg', opacity: 0.06, size: 'clamp(44px,6vw,88px)'    },
            { style: { top: '60vh',   left:  '25vw' }, rotate: '-80deg', opacity: 0.08, size: 'clamp(55px,8vw,115px)'   },
            { style: { top: '78vh',   left:  '18vw' }, rotate: '90deg',  opacity: 0.07, size: 'clamp(50px,7vw,100px)'   },
            { style: { top: '15vh',   left:  '42vw' }, rotate: '-65deg', opacity: 0.06, size: 'clamp(44px,6vw,88px)'    },
            { style: { top: '50vh',   left:  '40vw' }, rotate: '135deg', opacity: 0.06, size: 'clamp(48px,6.5vw,95px)'  },
            { style: { top: '25vh',   left:  '48vw' }, rotate: '45deg',  opacity: 0.07, size: 'clamp(50px,7vw,100px)'   },
            { style: { top: '62vh',   left:  '44vw' }, rotate: '120deg', opacity: 0.07, size: 'clamp(55px,8vw,115px)'   },
            { style: { bottom: '20vh',left:  '38vw' }, rotate: '40deg',  opacity: 0.07, size: 'clamp(48px,6.5vw,95px)'  },
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
        >

            {/* Main headline */}
            <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
                className="m-0 max-w-[9ch] font-display text-[clamp(72px,14vw,220px)] font-bold italic leading-[0.9] tracking-[-0.02em]"
            >
                <span className="block"><SplitWord>Sushi</SplitWord></span>
                <span className="block">
                    <em className="italic text-red"><SplitWord>Cafe</SplitWord></em>
                </span>
            </motion.h1>

            {/* Sub Copy */}
            <motion.p
                variants={fadeUp}
                transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                className="mt-7 max-w-[55ch] text-[clamp(16px,1.4vw,19px)] 
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

