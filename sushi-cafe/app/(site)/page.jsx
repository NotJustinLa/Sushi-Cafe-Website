import About from '@/components/About'
import Hero from '@/components/Hero'
import PartyPlatters from '@/components/PartyPlatters'
import Visit from '@/components/Visit'

export default function Home() {
  return (
    <main className="color-bg">
      <Hero />
      <About />
      <PartyPlatters />
      <Visit />

    </main>
  )
}

