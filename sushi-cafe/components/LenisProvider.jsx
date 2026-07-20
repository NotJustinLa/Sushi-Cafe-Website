'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Lenis from 'lenis'

// The context just carries the live Lenis instance (or null before it mounts).
const LenisContext = createContext(null)

// Convenience hook so consumers write `const lenis = useLenis()`.
export function useLenis() {
    return useContext(LenisContext)
}

export default function LenisProvider({ children }) {
    // Hold the instance in state so a re-render publishes it to consumers once
    // it's ready. (On the very first render it's null — that's fine, we guard
    // for it at the call site.)
    const [lenis, setLenis] = useState(null)

    useEffect(() => {
        const instance = new Lenis({
            lerp: 0.1,
            smoothWheel: true,
            smoothTouch: false,
        })
        setLenis(instance)

        let rafId
        function raf(time) {
            instance.raf(time)
            rafId = requestAnimationFrame(raf)
        }
        rafId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(rafId)
            instance.destroy()
            setLenis(null)
        }
    }, [])

    return (
        <LenisContext.Provider value={lenis}>
            {children}
        </LenisContext.Provider>
    )
}