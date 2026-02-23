'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { BackgroundEffects } from '@/components/ui/BackgroundEffects'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { NeonButton } from '@/components/ui/NeonButton'
import { FighterCard } from '@/components/ui/FighterCard'
import { useAuth } from '@/contexts/AuthContext'

const FIGHTERS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    nickname: 'The Oracle',
    color: '#00f3ff',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3UYyokuhYothQcSAHJLprchnOXB6TL_2ZNsTa8u3vdRbSL00kh2470uUMB-6clxbMy-V7TY2gfq7iB2BK_cesjFwQz2q06W1TFx_cyxWwIfTjItKh-6uFHBhCbnuADhloboPerxWUK2TL5BDgU_AHvcJ6rZJmQ5bx9TrcOHp9XuV0HVKxtBdz2tQP_eyd3ostMkqnx8oBHGhxLiHeIovoU8gsMsI4onXsTRx-HHdR6LHCCgzNRaCG04dQfQGD7gjrCEIvgE3ArzFb',
  },
  {
    id: 'claude-3.5',
    name: 'Claude 3.5',
    nickname: 'The Sage',
    color: '#bc13fe',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9BqrM7VxC3khcL6lLVVEk6PkJjl8JkXwIsu4es-zEzTuqgKwIe3ztZyGso3M-mu4ZbEXONjCaonY0BCh3w6WUc8eXmu-ClhK6wd68tRYGYDLZSfO02u2gX-JqfkqFFrHq658yVMoULrmy9Eg2cOt99Ukn1Vx2yiYCsh_6FzWfiTV1jstX5dszS68UAOUSvriIVebes-SEgOIsk-jy0TG5Ql9FstBbju8rKq6J2JAu69xvyEuHIJSINUq6UfK7humqZFU39IB4XQrI',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    nickname: 'The Catalyst',
    color: '#39ff14',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBio7HFjS0vM_AwJs9CHE4UcE6D8OESu7S8K-Kcjco3cf2b6DhgpvcF4-5e30qFjDy8K_-D0ks4p1sptgTHEyB4leNELdgUmxwgZhteOTS-n8c2-b_DhBxnFv_3vHvDZ-bx0p-b9mRnic_P3HBf65sjxwK-YEKToHxbU88PQt9hdS3HS50wzt40yK0LjRtkurjq-SfePzR8payQ5wSRLU7MUguYQ0kx_vei_wjV4reuHO6d0oex6eKSQ4ZFJs1VStGz4K1_ERwonOfu',
  },
  {
    id: 'llama-3',
    name: 'Llama 3',
    nickname: 'The Brutalist',
    color: '#ff9d00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4jHWeI-TIUMgGNP-8J031mnaWdnM5hAl4QqpSdNet-HYLpiZ99UaL3h-KMBtTyb7fOYi4XsUW9tk5iZ_IxC96CTXAZZhYCstXJqCpmInhLmeCk888doghMXYi8pR2VcQ2aXTyllgfLA0-pS-s-KSRaknbjNBLhfhLmF0Qus7rmonSH34ajkbQt77rl6sIn_H_vEY82QemRNvXO907KQO0DAHG-2p2YJayhHMeYiFZwDdSonNl4q0FlToYDlrn9_8YM4O3IxsrzVKs',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    nickname: 'The Ghost',
    color: '#ffffff',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMmPAeYVf6xt5KLHcJV17iG1SQxdzJ3CFTl8ooEBddrP02b4A8TJAuVfbOWv4jHr0IvSyp-2hc5liXJF9S9OCHDEc5cXt--MHceMhbpsE8i0xfXugg-zdLRdxhqIIxCH26_9-LjXbF9foTYllatBjCENZOTiF4fIMek9J4sotsNTSbKW8D9QSKCItlRHoM4UDNI0GJBTI_jBywJ-suNU4Wjwvw4kNOz1003wgFUbZbtDOmbPkPWaHLlgvHCxHdbAdzK_tjyE1GMcAd',
  },
]

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 pt-12 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="font-display font-black text-7xl md:text-9xl tracking-tighter uppercase italic animate-glitch relative inline-block">
            ARENA<span className="text-primary">AI</span>
            <div className="absolute -inset-1 blur-2xl opacity-30 bg-primary/50 -z-10" />
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-400 font-light tracking-[0.3em] uppercase">
            Street Fighter, but with <span className="text-primary font-bold">AI models</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-8 mb-24">
          {isAuthenticated && (
            <NeonButton href="/admin" variant="cyan" icon="🏆">
              Create Battle (Admin)
            </NeonButton>
          )}
          <NeonButton href="/rooms" variant="purple" icon="👁️">
            Join as Spectator
          </NeonButton>
          <NeonButton href="/rooms/demo" variant="amber" icon="▶️">
            Watch Demo
          </NeonButton>
        </div>

        {/* Fighter Selection */}
        <div className="w-full max-w-7xl px-4">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-[2px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h2 className="font-display text-2xl font-bold tracking-[0.2em] uppercase italic text-white/80">
              Fighters
            </h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {FIGHTERS.map((fighter) => (
              <FighterCard
                key={fighter.id}
                id={fighter.id}
                name={fighter.name}
                nickname={fighter.nickname}
                color={fighter.color}
                image={fighter.image}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
