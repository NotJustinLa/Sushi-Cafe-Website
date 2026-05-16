'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }) {

    useEffect(() => {
        //create the lenis instance with our settings
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
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

        return () => lenis.destroy()

    }, [])

    return <>{children}</>
}