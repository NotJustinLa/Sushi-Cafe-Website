'use client'

import { motion } from 'framer-motion'

// the three links in the nav
const links = ['About', 'Menu', 'Contact']

export default function Nav() {
    return (
        <motion.nav
            className="fixed top-0 right-0 z-50 flex gap-8 px-10 py-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            // fades in the nav after 1.2 seconds after
            // the page loads
        > 
            {links.map((link) => (
        <a
          key={link}
          href={`#${link.toLowerCase()}`}
          // href="#about", "#menu", "#reserve" — links to section ids
          className="font-mono text-[10px] tracking-[0.18em] uppercase text-brand-white/50 hover:text-brand-white transition-colors"
        >
          {link}
        </a>
      ))}
    </motion.nav>
    )
}