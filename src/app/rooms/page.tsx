'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const MODEL_IMAGES: Record<string, string> = {
  'gpt-4o': 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3UYyokuhYothQcSAHJLprchnOXB6TL_2ZNsTa8u3vdRbSL00kh2470uUMB-6clxbMy-V7TY2gfq7iB2BK_cesjFwQz2q06W1TFx_cyxWwIfTjItKh-6uFHBhCbnuADhloboPerxWUK2TL5BDgU_AHvcJ6rZJmQ5bx9TrcOHp9XuV0HVKxtBdz2tQP_eyd3ostMkqnx8oBHGhxLiHeIovoU8gsMsI4onXsTRx-HHdR6LHCCgzNRaCG04dQfQGD7gjrCEIvgE3ArzFb',
  'claude-3.5-sonnet': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9BqrM7VxC3khcL6lLVVEk6PkJjl8JkXwIsu4es-zEzTuqgKwIe3ztZyGso3M-mu4ZbEXONjCaonY0BCh3w6WUc8eXmu-ClhK6wd68tRYGYDLZSfO02u2gX-JqfkqFFrHq658yVMoULrmy9Eg2cOt99Ukn1Vx2yiYCsh_6FzWfiTV1jstX5dszS68UAOUSvriIVebes-SEgOIsk-jy0TG5Ql9FstBbju8rKq6J2JAu69xvyEuHIJSINUq6UfK7humqZFU39IB4XQrI',
  'gemini-pro': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBio7HFjS0vM_AwJs9CHE4UcE6D8OESu7S8K-Kcjco3cf2b6DhgpvcF4-5e30qFjDy8K_-D0ks4p1sptgTHEyB4leNELdgUmxwgZhteOTS-n8c2-b_DhBxnFv_3vHvDZ-bx0p-b9mRnic_P3HBf65sjxwK-YEKToHxbU88PQt9hdS3HS50wzt40yK0LjRtkurjq-SfePzR8payQ5wSRLU7MUguYQ0kx_vei_wjV4reuHO6d0oex6eKSQ4ZFJs1VStGz4K1_ERwonOfu',
  'llama-3-70b': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4jHWeI-TIUMgGNP-8J031mnaWdnM5hAl4QqpSdNet-HYLpiZ99UaL3h-KMBtTyb7fOYi4XsUW9tk5iZ_IxC96CTXAZZhYCstXJqCpmInhLmeCk888doghMXYi8pR2VcQ2aXTyllgfLA0-pS-s-KSRaknbjNBLhfhLmF0Qus7rmonSH34ajkbQt77rl6sIn_H_vEY82QemRNvXO907KQO0DAHG-2p2YJayhHMeYiFZwDdSonNl4q0FlToYDlrn9_8YM4O3IxsrzVKs',
  'mistral-large': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMmPAeYVf6xt5KLHcJV17iG1SQxdzJ3CFTl8ooEBddrP02b4A8TJAuVfbOWv4jHr0IvSyp-2hc5liXJF9S9OCHDEc5cXt--MHceMhbpsE8i0xfXugg-zdLRdxhqIIxCH26_9-LjXbF9foTYllatBjCENZOTiF4fIMek9J4sotsNTSbKW8D9QSKCItlRHoM4UDNI0GJBTI_jBywJ-suNU4Wjwvw4kNOz1003wgFUbZbtDOmbPkPWaHLlgvHCxHdbAdzK_tjyE1GMcAd',
}

const MODEL_COLORS: Record<string, string> = {
  'gpt-4o': '#00f3ff',
  'claude-3.5-sonnet': '#bc13fe',
  'gemini-pro': '#39ff14',
  'llama-3-70b': '#ff9d00',
  'mistral-large': '#ffffff',
}

const MODEL_NAMES: Record<string, string> = {
  'gpt-4o': 'GPT-4o',
  'claude-3.5-sonnet': 'Claude 3.5',
  'gemini-pro': 'Gemini Pro',
  'llama-3-70b': 'Llama 3',
  'mistral-large': 'Mistral',
}

export default function RoomsPage() {
  const rooms = useQuery(api.rooms.listRooms, {})
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'stakes'>('hot')
  const { isAuthenticated } = useAuth()

  // Split rooms into live (debating) and upcoming (scheduled)
  const liveRooms = rooms?.filter((r: any) => r.status === 'debating') || []
  const upcomingRooms = rooms?.filter((r: any) => r.status === 'scheduled') || []
  const finishedRooms = rooms?.filter((r: any) => r.status === 'finished') || []

  const getTimeUntilStart = (startTime: number) => {
    const diff = startTime - Date.now()
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 }
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return { hours, minutes, seconds }
  }

  const getModelImage = (modelId: string) => {
    return MODEL_IMAGES[modelId] || MODEL_IMAGES['gpt-4o']
  }

  const getModelColor = (modelId: string) => {
    return MODEL_COLORS[modelId] || '#00f3ff'
  }

  const getModelName = (modelId: string) => {
    return MODEL_NAMES[modelId] || modelId
  }

  return (
    <>
      {/* Background Effects */}
      <div className="scanline pointer-events-none" />
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none z-0" />

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute top-[15%] left-[5%] w-[1px] h-[1px] bg-primary shadow-[0_0_10px_2px_rgba(0,243,255,0.8)] animate-pulse" />
        <div className="absolute top-[80%] left-[90%] w-[1px] h-[1px] bg-secondary shadow-[0_0_10px_2px_rgba(188,19,254,0.8)] animate-pulse animation-delay-700" />
        <div className="absolute top-[40%] left-[85%] w-[1px] h-[1px] bg-accent shadow-[0_0_10px_2px_rgba(255,157,0,0.8)] animate-pulse animation-delay-1000" />
      </div>

      {/* Header */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary animate-pulse"></div>
            <span className="font-display font-black text-xl tracking-tighter italic">ARENA_OS</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/20 mx-2"></div>
          <span className="text-xs text-primary font-bold tracking-widest uppercase">Battle Lobby</span>
        </div>
        <div className="flex items-center space-x-8 text-xs font-medium uppercase tracking-widest text-gray-400">
          <div className="hidden md:flex space-x-6">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">sensors</span>
              Server: US-EAST-1
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">speed</span>
              Latency: 14ms
            </span>
          </div>
          {isAuthenticated && (
            <Link
              href="/admin"
              className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded border border-white/10 hover:bg-white/10 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Create</span>
            </Link>
          )}
          <button className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded border border-white/10 hover:bg-white/10 transition-all">
            <span className="material-symbols-outlined text-sm">settings</span>
            <span>Config</span>
          </button>
        </div>
      </nav>

      <div className="flex relative z-10 max-w-[1600px] mx-auto min-h-[calc(100vh-140px)]">
        {/* Sidebar */}
        <aside className="w-64 p-8 border-r border-white/5 hidden lg:block">
          <div className="space-y-8">
            {/* Sort By */}
            <div>
              <h3 className="font-display text-sm font-bold text-white/40 mb-4 tracking-widest uppercase">Sort By</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSortBy('hot')}
                  className={`w-full text-left px-4 py-2 rounded flex items-center justify-between group transition-all ${
                    sortBy === 'hot'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-white/5 text-gray-400 border border-transparent'
                  }`}
                >
                  <span className="font-bold tracking-wide uppercase">Hot Battles</span>
                  <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">local_fire_department</span>
                </button>
                <button
                  onClick={() => setSortBy('new')}
                  className={`w-full text-left px-4 py-2 rounded flex items-center justify-between group transition-all ${
                    sortBy === 'new'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-white/5 text-gray-400 border border-transparent'
                  }`}
                >
                  <span className="font-bold tracking-wide uppercase">New Arrivals</span>
                  <span className="material-symbols-outlined text-sm">schedule</span>
                </button>
                <button
                  onClick={() => setSortBy('stakes')}
                  className={`w-full text-left px-4 py-2 rounded flex items-center justify-between group transition-all ${
                    sortBy === 'stakes'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-white/5 text-gray-400 border border-transparent'
                  }`}
                >
                  <span className="font-bold tracking-wide uppercase">Highest Stakes</span>
                  <span className="material-symbols-outlined text-sm">payments</span>
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <h3 className="font-display text-sm font-bold text-white/40 mb-4 tracking-widest uppercase">Category</h3>
              <div className="space-y-2">
                <label className="flex items-center p-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-white/20 bg-transparent text-primary focus:ring-primary/40 mr-3" defaultChecked />
                  <span className="text-gray-300 uppercase font-medium tracking-tight group-hover:text-white transition-colors">Coding Logic</span>
                </label>
                <label className="flex items-center p-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-white/20 bg-transparent text-primary focus:ring-primary/40 mr-3" defaultChecked />
                  <span className="text-gray-300 uppercase font-medium tracking-tight group-hover:text-white transition-colors">Creative Writing</span>
                </label>
                <label className="flex items-center p-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-white/20 bg-transparent text-primary focus:ring-primary/40 mr-3" />
                  <span className="text-gray-300 uppercase font-medium tracking-tight group-hover:text-white transition-colors">Safety Jailbreak</span>
                </label>
                <label className="flex items-center p-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-white/20 bg-transparent text-primary focus:ring-primary/40 mr-3" />
                  <span className="text-gray-300 uppercase font-medium tracking-tight group-hover:text-white transition-colors">Speed Test</span>
                </label>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <button className="w-full py-3 neon-border-cyan bg-black/40 font-display font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">
                Reset Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-8">
          {/* Live Now Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-primary"></div>
                <h2 className="font-display text-3xl font-black italic tracking-tight uppercase">Live Now</h2>
                <span className="ml-4 px-3 py-1 bg-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-500/30">
                  Streaming
                </span>
              </div>
              <div className="text-xs text-white/40 tracking-[0.2em] font-bold">
                {liveRooms.length} ACTIVE FIGHTS
              </div>
            </div>

            {!rooms ? (
              <div className="text-center py-24">
                <div className="inline-block animate-spin text-6xl mb-6">⏳</div>
                <p className="text-gray-400 font-display text-lg uppercase tracking-widest">Loading battles...</p>
              </div>
            ) : liveRooms.length === 0 ? (
              <div className="text-center py-24 border border-white/10 bg-black/40 rounded-lg">
                <div className="text-6xl mb-6 opacity-30">📡</div>
                <h3 className="font-display text-xl text-white mb-4">No Live Battles</h3>
                <p className="text-gray-400 mb-8">Wait for scheduled battles or watch the demo</p>
                <Link
                  href="/rooms/demo"
                  className="inline-block px-8 py-3 bg-accent/20 border-2 border-accent/50 rounded-lg text-accent hover:bg-accent/30 transition-all font-display font-bold uppercase tracking-widest"
                >
                  Watch Demo
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {liveRooms.map((room: any) => {
                  const modelA = room.participants?.[0]
                  const modelB = room.participants?.[1]
                  const colorA = getModelColor(modelA?.modelId || '')
                  const colorB = getModelColor(modelB?.modelId || '')

                  return (
                    <Link
                      key={room._id}
                      href={`/rooms/${room._id}`}
                      className="relative group cursor-pointer overflow-hidden border border-white/10 bg-black/60 transition-all hover:border-primary/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                      <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1 block">
                              Topic: {room.topic}
                            </span>
                            <h3 className="font-display text-xl font-bold uppercase italic text-white group-hover:text-primary transition-colors">
                              {getModelName(modelA?.modelId || '')} vs {getModelName(modelB?.modelId || '')}
                            </h3>
                          </div>
                          <div className="relative">
                            <span className="text-xs font-bold uppercase text-red-500 ml-4 tracking-widest animate-pulse">Live</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 mb-8">
                          {/* Fighter A */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="w-20 h-20 mb-3 border-2 overflow-hidden bg-black" style={{ borderColor: colorA }}>
                              <img
                                alt={modelA?.modelName || 'Model A'}
                                className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-110 transition-all"
                                src={getModelImage(modelA?.modelId || '')}
                              />
                            </div>
                            <div className="w-full bg-black/50 h-1 border border-white/10 mb-1">
                              <div className="h-full" style={{ width: '85%', backgroundColor: colorA }}></div>
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: colorA }}>HP 850 / 1000</span>
                          </div>

                          {/* VS */}
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-display text-4xl font-black italic text-white/20">VS</span>
                            <div className="mt-2 px-2 py-0.5 border border-white/20 text-[10px] font-bold text-white/40">
                              IN PROGRESS
                            </div>
                          </div>

                          {/* Fighter B */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="w-20 h-20 mb-3 border-2 overflow-hidden bg-black" style={{ borderColor: colorB }}>
                              <img
                                alt={modelB?.modelName || 'Model B'}
                                className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-110 transition-all"
                                src={getModelImage(modelB?.modelId || '')}
                              />
                            </div>
                            <div className="w-full bg-black/50 h-1 border border-white/10 mb-1">
                              <div className="h-full ml-auto" style={{ width: '72%', backgroundColor: colorB }}></div>
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: colorB }}>HP 720 / 1000</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-800 border border-white/20"></div>
                            <div className="w-6 h-6 rounded-full bg-gray-700 border border-white/20"></div>
                            <div className="w-6 h-6 rounded-full bg-gray-600 border border-white/20"></div>
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-black border border-white/20 text-[8px]">
                              +{(room.viewerCount || 0) / 1000}k
                            </div>
                          </div>
                          <button className="px-6 py-2 bg-primary text-black font-display font-black text-xs uppercase italic tracking-widest hover:brightness-125 transition-all">
                            ENTER ARENA
                          </button>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          {/* Upcoming Battles Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-white/20"></div>
                <h2 className="font-display text-3xl font-black italic tracking-tight uppercase text-white/60">
                  Upcoming Battles
                </h2>
              </div>
            </div>

            {!rooms ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
                <p className="text-gray-400">Loading...</p>
              </div>
            ) : upcomingRooms.length === 0 ? (
              <div className="text-center py-12 border border-white/10 bg-black/40 rounded-lg">
                <p className="text-gray-400 mb-4">No upcoming battles scheduled</p>
                <p className="text-gray-500 text-sm">Check back later or watch the demo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingRooms.map((room: any) => {
                  const modelA = room.participants?.[0]
                  const modelB = room.participants?.[1]
                  const timeLeft = getTimeUntilStart(room.startTime)

                  return (
                    <div
                      key={room._id}
                      className="flex flex-col md:flex-row items-center gap-6 p-4 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
                    >
                      {/* Time */}
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <span className="material-symbols-outlined text-white/40 group-hover:text-primary transition-colors">
                          calendar_month
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Scheduled</span>
                          <span className="text-white font-bold">{new Date(room.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                        </div>
                      </div>

                      {/* Fighters */}
                      <div className="flex-grow flex items-center justify-between border-x border-white/5 px-6">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded border border-white/10 overflow-hidden grayscale bg-black">
                              <img alt={modelA?.modelName || 'Model A'} className="w-full h-full object-cover" src={getModelImage(modelA?.modelId || '')} />
                            </div>
                            <span className="font-display text-sm font-bold uppercase tracking-wide">
                              {getModelName(modelA?.modelId || '')}
                            </span>
                          </div>
                          <span className="font-display text-xs font-black text-white/20 italic">VS</span>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded border border-white/10 overflow-hidden grayscale bg-black">
                              <img alt={modelB?.modelName || 'Model B'} className="w-full h-full object-cover" src={getModelImage(modelB?.modelId || '')} />
                            </div>
                            <span className="font-display text-sm font-bold uppercase tracking-wide">
                              {getModelName(modelB?.modelId || '')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Topic (hidden on mobile) */}
                      <div className="hidden md:block">
                        <span className="text-xs text-white/40 font-bold uppercase">{room.topic}</span>
                      </div>

                      {/* Countdown & Action */}
                      <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Starting In</span>
                          <div className="flex gap-2 font-display text-xl font-black tracking-tighter">
                            <span className="text-primary">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="text-white/20">:</span>
                            <span className="text-primary">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="text-white/20">:</span>
                            <span className="text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
                          </div>
                        </div>
                        <Link
                          href={`/rooms/${room._id}`}
                          className="px-4 py-2 border border-white/20 hover:border-primary/50 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                          View Room
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Demo Link */}
          {rooms && rooms.length > 0 && (
            <div className="mt-12 text-center">
              <div className="inline-block p-6 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-gray-400 text-sm mb-3 font-display uppercase tracking-widest">Want to see a battle in action?</p>
                <Link
                  href="/rooms/demo"
                  className="inline-flex items-center gap-3 px-8 py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/40 rounded font-display font-bold uppercase tracking-widest transition-all"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Watch Demo Battle
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full p-4 border-t border-white/5 bg-black/90 backdrop-blur-xl z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">
          <div className="flex space-x-8 mb-4 md:mb-0">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-white/80">System: Online</span>
            </span>
            <span>Active Matches: {rooms?.length || 0}</span>
            <span>Viewers: {(rooms?.reduce((acc: number, r: any) => acc + (r.viewerCount || 0), 0) || 0) / 1000}k</span>
          </div>
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4 border-r border-white/10 pr-8">
              <Link href="/rooms/demo" className="hover:text-primary transition-colors">Demo</Link>
            </div>
            <span className="text-white/20">© 2024 ARENA_AI_NEURAL_SYS</span>
          </div>
        </div>
      </footer>
    </>
  )
}
