'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }) {
    useEffect(() => {
        //create the lenis instance with our settings
        const lenis = new Lenis({
            // `lerp` controls WHEEL smoothness (0–1). Higher = snappier / less
            // smooth, lower = floatier. 0.1 is Lenis's floaty default; raise it
            // to reduce the effect (0.2–0.4 is tight, 1 = no smoothing).
            // NOTE: duration/easing only affect programmatic scrollTo (anchor
            // jumps), NOT the wheel — that's why tuning duration did nothing.
            lerp: 0.3,
            smoothWheel: true,
            smoothTouch: false,
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