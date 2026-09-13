import { Shippori_Mincho, Zen_Kaku_Gothic_New, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const shippori = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-shippori-mincho',
  display: 'swap',
})

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-zen-kaku', // creates CSS var--font serif
  display: 'swap',
})

const dmSans = DM_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono', // creates CSS var--font mono
  display: 'swap',
})

const jetBrains = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-jet-brains',
  display: 'swap',
})
  
export const metadata = {
  title: 'Sushi Cafe — 292 Doncaster Rd, Balwyn North',
  description: 'A family sushi spot on Doncaster Road. Hand-rolled fresh daily in Balwyn North since 2013.',
}

// viewport object configures how the website is displayed on mobile phones 
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// Shared by everything: fonts, <html> and <body> only. The public site's
// pieces (splash, smooth scroll, nav, cart) live in app/(site)/layout.jsx, and
// the staff register has its own app/register/layout.jsx.
export default function RootLayout({ children }) {
  return (
    <html
    lang="en"
    className={`${shippori.variable} ${zenKaku.variable} ${dmSans.variable} ${jetBrains.variable}`}>
      <body>{children}</body>
    </html>
  )
}