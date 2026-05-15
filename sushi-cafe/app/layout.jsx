import { Bebas_Neue, Noto_Serif_JP, Space_Mono } from 'next/font/google'
import Nav from '@/components/Nav'
import LenisProvider from '@/components/LenisProvider'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue', // creates CSS var--font display
})

const notoSerifJP = Noto_Serif_JP({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-noto-serif-jp', // creates CSS var--font serif
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono', // creates CSS var--font mono
})

export const metadata = {
  title: 'Sushi Cafe',
  description: 'Handcrafted sushi in Melbourne. Fresh daily, made with love.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${notoSerifJP.variable} ${spaceMono.variable}`}>
      <body className="bg-brand-black">
        <LenisProvider>
          <Nav />
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}