"use client"

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import LoadingSplash from "./LoadingSplash";

const MIN_DURATION = 1700 //that the splash shows for

/**
 * Root layout wrapper that gates page content behind the loading splash.
 * Waits for both the window "load" event and a MIN_DURATION floor before
 * dismissing — so the splash never flickers out on fast connections.
 * Wraps LoadingSplash in AnimatePresence so its exit animation runs cleanly.
 */
export default function SiteShell({ children}) {
    // loading starts as True so the splash is visible
    // when it turns to false, the splash animates out
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // record the exact moment this component mounted
        // mounted refers to first initalised on visual structure
        const start = performance.now()

        // This function is called when the page is finished loading
        // It ensures that it runs the rest oif the remaining time
        // setTimeout runs code after a delay
        // clearTimeout clears the timer.
        function dismiss() {
            const elapsed = performance.now()-start; //how long has it been
            const remaining = Math.max(0, MIN_DURATION -elapsed) // how long to wait
            const t = setTimeout(() => setLoading(false), remaining) // hide the splash after the remaining time
            return () => clearTimeout(t) //cancel the timeout so it doesn’t keep running.”
    }

    // if the webpage is loaded, return the dismiss function above
    if (document.readyState === "complete") {
        return dismiss();
    }

    let cleanupDismiss;
    const onLoad = () => {
        cleanupDismiss = dismiss()
    };
    window.addEventListener("load", onLoad);
    return () => {
        window.removeEventListener("load", onLoad);
        if (cleanupDismiss) cleanupDismiss();
    };

}, []);

return (
    <>
        <AnimatePresence>
            {loading && <LoadingSplash key="splash" />}
        </AnimatePresence>
        {children}
    </>
    );
}
