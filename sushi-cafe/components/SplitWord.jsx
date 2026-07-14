'use client'

import { motion } from 'framer-motion'
import { Fragment } from 'react'

// Splits text into words, then chars. Each word is wrapped in white-space:nowrap
// so the browser only breaks at the spaces *between* words — never mid-word.
export default function SplitWord({ children }) {
    const words = String(children).split(' ')

    return (
        <span style={{ display: 'inline-block', lineHeight: 1 }}>
            {words.map((word, wi) => (
                <Fragment key={wi}>
                    <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                        {[...word].map((char, ci) => (
                            <motion.span
                                key={ci}
                                style={{ display: 'inline-block', lineHeight: 1 }}
                                whileHover={{ y: -10 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </span>
                    {/* Space lives outside the nowrap wrapper so it renders and is breakable */}
                    {wi < words.length - 1 && ' '}
                </Fragment>
            ))}
        </span> 
    )
}
