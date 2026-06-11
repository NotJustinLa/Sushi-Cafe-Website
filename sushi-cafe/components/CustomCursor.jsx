'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// A small red dot that follows the cursor with a slight smooth lag.
// Hidden on touch devices (max-md) where there's no pointer.
export default function CustomCursor() {
    // Raw mouse position, starting off-screen so it doesn't flash at (0,0).
    const x = useMotionValue(-100)
    const y = useMotionValue(-100)

    // Spring-smoothed values — the dot eases toward the cursor instead of snapping.
    const springX = useSpring(x, { stiffness: 2000, damping: 40, mass: 0.5 })
    const springY = useSpring(y, { stiffness: 2000, damping: 40, mass: 0.5 })

    useEffect(() => {
        const move = (e) => {
            x.set(e.clientX)
            y.set(e.clientY)
        }
        window.addEventListener('mousemove', move)
        return () => window.removeEventListener('mousemove', move)
    }, [x, y])

    return (
        <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-1.5 -mt-1.5 h-3 w-3 rounded-full bg-red max-md:hidden"
            style={{ x: springX, y: springY }}
        />
    )
}
