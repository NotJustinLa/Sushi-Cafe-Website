"use client"

import { motion } from "framer-motion"

export default function LoadingSplash() {
    return (
        <motion.div
            className="fixed inset-0 z-[1000] grid place-items-center
            overflow-hidden bg-splash-bg"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 , visibility: "hidden" }}
            transition={{ duration: 0.55, ease: "easeOut"}}
            aria-hidden="true"
        >
            <div className="relative grid aspect-square w-min(320px, 70vw)] 
            place-items-center">
                {/* Red Circle */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-red"
                    initial={{ scale: 0 , opacity: 0 }}
                    animate={{
                        scale: [0,1.03,1],
                        opacity: [0,1,1]
                    }}
                    transition={{
                        duration: 1.1,
                        ease: [0.2, 0.8, 0.2, 1],
                        times: [0, 0.6, 1],
                    }}
                />

                {/* Text */}
                <motion.div
                    className="relative z-[1] text-center font-display
                    text-[clamp(40px, 7vw, 62px)] italic leading-[0.95]
                    text-cream-fg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut", delay: 0.55 }}
                >
                    <span className="block">SUSHI</span>
                    <span className="ml-[18px] mt-2 block">CAFE</span>
                </motion.div>

                {/* Japanese subtitle */}
                <motion.div
                    className="absolute -bottom-[54px] left-1/2
                    -translate-x-1/2 whitespace-nowrap font-jp text-xs
                    tracking-[0.35em] text-[rgba(255,248,231,0.55)]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.85 }}
                >
                    寿司カフェ · BALWYN NORTH
                </motion.div>
            </div>

        </motion.div>
        );
    }