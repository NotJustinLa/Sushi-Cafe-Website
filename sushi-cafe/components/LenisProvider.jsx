'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }) {
    useEffect(() => {
        //create the lenis instance with our settings
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false,
            // Exponential ease-out — starts fast, slows to a very gentle stop.
            // t goes from 0 (scroll start) to 1 (scroll end).
            // Math.pow(2, -10 * t) is an exponential decay curve.
        });

        // Lenis needs to be updated every animation frame (60fps).
        // requestAnimationFrame calls a function on every frame.
        // raf calls itself recursively to keep running forever.
        let rafId;
        function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
        
        return() => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return children;
}