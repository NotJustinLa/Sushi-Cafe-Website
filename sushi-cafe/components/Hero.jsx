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


