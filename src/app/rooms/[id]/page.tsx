'use client'

export const dynamic = 'force-dynamic'

import React, { Suspense, useEffect, useState, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import Link from 'next/link'

const ATTACK_INFO: Record<string, { emoji: string; name: string; icon: string }> = {
  LIGHTNING_STRIKE: { emoji: '⚡', name: 'LIGHTNING STRIKE', icon: 'flash_on' },
  FIRE_SLASH: { emoji: '🔥', name: 'FIRE SLASH', icon: 'local_fire_department' },
  COUNTER_ATTACK: { emoji: '💥', name: 'COUNTER ATTACK', icon: 'gps_fixed' },
  WEAK_BLOW: { emoji: '🫧', name: 'WEAK BLOW', icon: 'bubble_chart' },
}

function BattleRoomContent({ roomId }: { roomId: Id<'rooms'> }) {
  const sessionIdRef = useRef<string | undefined>(undefined)

  const room = useQuery(api.rooms.getRoom, { roomId })
  const joinRoom = useMutation(api.mutations.joinRoom)
  const leaveRoom = useMutation(api.mutations.leaveRoom)
  const startBattle = useMutation(api.mutations.startBattle)

  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [adminPassword, setAdminPassword] = useState('')
  const [supportA, setSupportA] = useState(50)
  const [supportB, setSupportB] = useState(50)

  // Generate and store session ID
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID()
    }
  }, [])

  // Join room when roomId is set
  useEffect(() => {
    if (roomId && sessionIdRef.current) {
      joinRoom({ roomId, sessionId: sessionIdRef.current })

      return () => {
        leaveRoom({ sessionId: sessionIdRef.current! })
      }
    }
  }, [roomId])

  // Countdown logic
  useEffect(() => {
    if (!room || room.status !== 'scheduled') return

    const updateCountdown = () => {
      const now = Date.now()
      const diff = room.startTime - now
      setTimeLeft(Math.max(0, diff))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [room])

  const handleStartBattle = async () => {
    if (!roomId) return

    try {
      await startBattle({ roomId, adminPassword })
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error starting battle')
    }
  }

  // Get participants HP
  const participantA = room?.participants?.find(p => p.side === 'A')
  const participantB = room?.participants?.find(p => p.side === 'B')
  const hpA = participantA?.hp ?? 100
  const hpB = participantB?.hp ?? 100

  // Get last messages from each participant
  const messagesA = room?.messages?.filter(m => m.participantId === participantA?._id) ?? []
  const messagesB = room?.messages?.filter(m => m.participantId === participantB?._id) ?? []
  const lastMessageA = messagesA[messagesA.length - 1]?.content ?? ''
  const lastMessageB = messagesB[messagesB.length - 1]?.content ?? ''

  // Determine whose turn it is based on room status and messages
  const totalTurns = (room?.currentRound ?? 0) * 2 + (room?.currentTurn ?? 0)
  const currentTurn = totalTurns % 2 === 0 ? 'A' : 'B'

  // Get current round from messages
  const currentRoundFromMessages = Math.max(
    ...[...messagesA, ...messagesB].map(m => m.roundNumber ?? 0),
    1
  )

  if (!room) {
    return (
      <>
        <div className="scanline pointer-events-none" />
        <div className="fixed inset-0 cyber-grid pointer-events-none z-0" />
        <main className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-pulse">⏳</div>
            <p className="text-gray-400 font-display text-lg uppercase tracking-widest">Loading arena...</p>
          </div>
        </main>
      </>
    )
  }

  // Countdown view
  if (room.status === 'scheduled' && timeLeft > 0) {
    const minutes = Math.floor(timeLeft / 60000)
    const seconds = Math.floor((timeLeft % 60000) / 1000)

    return (
      <>
        {/* Background Effects */}
        <div className="scanline pointer-events-none" />
        <div className="fixed inset-0 cyber-grid pointer-events-none z-0" />
        <div className="fixed inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none z-0" />
        <div className="fixed top-1/4 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[180px] pointer-events-none"></div>
        <div className="fixed bottom-1/4 -right-32 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[180px] pointer-events-none"></div>

        {/* Header */}
        <header className="relative z-20 p-6 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link href="/rooms" className="bg-white/5 hover:bg-white/10 p-2 rounded border border-white/20 transition-all">
              <span className="material-symbols-outlined text-primary neon-glow-blue">arrow_back</span>
            </Link>
            <h1 className="font-display text-2xl font-black tracking-tighter italic text-white">
              ARENA<span className="text-primary neon-glow-blue">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-display uppercase tracking-widest text-slate-500">Live Viewers</span>
              <span className="text-xl font-bold text-primary neon-glow-blue">{room.viewerCount || 0}</span>
            </div>
          </div>
        </header>

        {/* Countdown Content */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-8">
          <div className="text-center max-w-4xl">
            <p className="text-gray-400 font-display text-sm uppercase tracking-[0.5em] mb-8">Battle starts in:</p>

            <div className="text-9xl md:text-[12rem] font-bold text-accent font-display font-mono tracking-tighter neon-glow-blue mb-12">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>

            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-display text-3xl font-bold text-white mb-6">
                "{room.topic}"
              </h2>
              <div className="flex justify-center gap-12 text-xl">
                <span className="text-primary font-display font-bold">{room.participants?.[0]?.modelName || 'Model A'}</span>
                <span className="text-gray-600 font-display text-xs uppercase tracking-widest self-center">VS</span>
                <span className="text-secondary font-display font-bold">{room.participants?.[1]?.modelName || 'Model B'}</span>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-lg max-w-md mx-auto">
              <h3 className="text-sm font-display font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                Admin Controls
              </h3>
              <div className="flex gap-3 items-center justify-center">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Admin password"
                  className="px-4 py-3 bg-black/60 border border-white/20 rounded text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-body"
                />
                <button
                  onClick={handleStartBattle}
                  className="px-6 py-3 bg-accent/20 border border-accent/50 rounded-lg text-accent hover:bg-accent/30 transition-all font-display font-bold uppercase tracking-widest whitespace-nowrap"
                >
                  ⚔️ Start Now
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center font-display uppercase tracking-wider">
                Or wait for the scheduled time
              </p>
            </div>

            {/* Share Link */}
            <div className="mt-12">
              <p className="text-gray-500 text-sm mb-3 font-display uppercase tracking-wider">Share this battle:</p>
              <div className="bg-black/60 border border-white/10 px-6 py-4 rounded-lg inline-block">
                <code className="text-primary text-sm">{typeof window !== 'undefined' ? window.location.href : ''}</code>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 w-full p-4 border-t border-white/5 bg-black/80 backdrop-blur-md z-30">
          <div className="max-w-7xl mx-auto flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">
            <span>© 2024 ARENA_AI_NEURAL_SYS</span>
          </div>
        </footer>
      </>
    )
  }

  // Ready to start view
  if (room.status === 'scheduled' && timeLeft <= 0) {
    return (
      <>
        <div className="scanline pointer-events-none" />
        <div className="fixed inset-0 cyber-grid pointer-events-none z-0" />
        <div className="fixed inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none z-0" />

        <main className="relative z-10 min-h-screen flex items-center justify-center px-8">
          <div className="text-center max-w-lg">
            <div className="text-8xl mb-8">⚔️</div>
            <h1 className="font-display text-4xl font-black text-accent mb-6 tracking-wider">
              Ready to Battle!
            </h1>
            <p className="text-gray-400 mb-12 text-lg">
              Waiting for admin to start the battle...
            </p>
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-8">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full px-5 py-4 bg-black/60 border border-white/20 rounded text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-body text-lg mb-4"
              />
              <button
                onClick={handleStartBattle}
                className="w-full px-8 py-5 bg-accent/20 border-2 border-accent rounded-lg text-accent hover:bg-accent/30 transition-all text-xl font-display font-black uppercase tracking-widest"
              >
                ⚔️ Start Battle
              </button>
              <p className="text-xs text-gray-500 mt-4 font-display uppercase tracking-wider">
                Admin password required
              </p>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Battle in progress or finished - Full battle interface
  return (
    <body className="font-body min-h-screen overflow-hidden relative bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-overlay opacity-20 z-0"></div>
      <div className="fixed inset-0 scanlines opacity-10 z-0"></div>
      <div className="fixed top-1/4 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[180px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-32 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-20 p-6 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/rooms" className="bg-white/5 hover:bg-white/10 p-2 rounded border border-white/20 transition-all">
            <span className="material-symbols-outlined text-primary neon-glow-blue">arrow_back</span>
          </Link>
          <h1 className="font-display text-2xl font-black tracking-tighter italic text-white">
            ARENA<span className="text-primary neon-glow-blue">AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-display uppercase tracking-widest text-slate-500">Live Viewers</span>
            <span className="text-xl font-bold text-primary neon-glow-blue">{room.viewerCount || 0}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-display uppercase tracking-widest text-slate-500">Round</span>
            <span className="text-xl font-bold text-white">{String(currentRoundFromMessages).padStart(2, '0')}/03</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded font-display text-xs uppercase tracking-widest ${
            room.status === 'debating' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
            room.status === 'finished' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/50' :
            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
          }`}>
            {room.status === 'debating' ? '🔴 LIVE' : room.status === 'finished' ? 'FINISHED' : 'WAITING'}
          </div>
        </div>
      </header>

      {/* Winner Overlay */}
      {room.status === 'finished' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90">
          <div className="text-center">
            <div className="text-9xl mb-4">🏆</div>
            <h2 className="font-display text-5xl font-black text-accent tracking-wider mb-8">
              {hpA > hpB ? (participantA?.modelName || 'Fighter A') : hpB > hpA ? (participantB?.modelName || 'Fighter B') : 'DRAW'} WINS!
            </h2>
            <div className="flex gap-4 justify-center">
              <Link
                href="/rooms"
                className="px-8 py-4 bg-primary/20 border-2 border-primary rounded-lg text-primary hover:bg-primary/30 transition-all font-display font-bold uppercase tracking-widest"
              >
                ← Back to Rooms
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-white/5 border border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-white/40 transition-all font-display font-bold uppercase tracking-widest"
              >
                🔄 Watch Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Battle Area */}
      <main className="relative z-10 grid grid-cols-12 gap-0 h-[calc(100vh-180px)] mt-4">
        {/* VS Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="vs-outline font-display font-black italic text-[24rem] opacity-30">VS</span>
        </div>

        {/* Fighter A - Left Side */}
        <div className="col-span-6 flex flex-col px-12 z-10">
          {/* HP Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h2 className="font-display text-3xl font-black text-primary neon-glow-blue tracking-wider">
                  {participantA?.modelName || 'Model A'}
                </h2>
                <p className="text-xs uppercase tracking-[0.3em] text-primary/60 font-medium">
                  {participantA?.modelId === 'openai/gpt-4o' ? 'Neural Architect' : 'AI Fighter'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-display font-black text-primary neon-glow-blue italic">{hpA}</span>
                <span className="text-sm font-display text-white/40">/100 HP</span>
              </div>
            </div>
            <div className="h-8 w-full bg-white/5 border border-primary/40 skew-x-[-15deg] overflow-hidden p-1">
              <div className="hp-bar-blue h-full transition-all duration-700" style={{ width: `${hpA}%` }}></div>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-grow flex flex-col justify-center">
            <div className={`relative transition-all ${currentTurn === 'A' && room.status === 'debating' ? 'opacity-100 scale-100' : 'opacity-50 grayscale-[0.3] scale-95'}`}>
              {currentTurn === 'A' && room.status === 'debating' && (
                <div className="absolute -inset-2 bg-primary/20 blur-2xl rounded-xl animate-pulse"></div>
              )}
              <div className={`relative ${currentTurn === 'A' && room.status === 'debating' ? 'bg-black/60 backdrop-blur-xl border-2 neon-border-blue' : 'bg-black/40 backdrop-blur-md border border-white/20'} p-10 rounded-lg min-h-[300px]`}>
                <div className="flex items-center gap-3 mb-6">
                  <span className={`material-symbols-outlined text-sm ${currentTurn === 'A' && room.status === 'debating' ? 'text-primary neon-glow-blue animate-pulse' : 'text-white/40'}`}>
                    {currentTurn === 'A' && room.status === 'debating' ? 'bolt' : 'hourglass_empty'}
                  </span>
                  <span className={`text-[10px] font-display uppercase tracking-[0.4em] ${currentTurn === 'A' && room.status === 'debating' ? 'text-primary' : 'text-white/40'}`}>
                    {currentTurn === 'A' && room.status === 'debating' ? 'Generating Response...' : lastMessageA ? 'Response Delivered' : 'Awaiting turn...'}
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-bold leading-relaxed text-white whitespace-pre-wrap">
                  {lastMessageA || 'Awaiting battle initiation...'}
                </p>
              </div>
            </div>

            {/* Attack Indicator */}
            {lastMessageA && currentTurn !== 'A' && messagesA.length > 0 && (
              <div className="mt-10 flex items-center gap-6">
                <div className="flex items-center gap-2 px-8 py-4 bg-primary text-black font-display font-black italic tracking-tighter skew-x-[-15deg] shadow-[0_0_30px_rgba(0,243,255,0.4)]">
                  <span className="material-symbols-outlined">flash_on</span>
                  {ATTACK_INFO[messagesA[messagesA.length - 1]?.attackType || 'WEAK_BLOW']?.name || 'ATTACK'}
                  {messagesA[messagesA.length - 1]?.damage && (
                    <span className="text-sm">-{messagesA[messagesA.length - 1].damage} HP</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Divider */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 flex flex-col items-center h-full z-20">
          <div className="w-16 h-16 bg-black border-2 border-white/40 rounded-full flex items-center justify-center font-display font-black text-2xl text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] my-4 divider-glow">
            {currentRoundFromMessages}
          </div>
          <div className="h-full w-[2px] bg-white/20 divider-glow"></div>
        </div>

        {/* Fighter B - Right Side */}
        <div className="col-span-6 flex flex-col px-12 z-10">
          {/* HP Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-end mb-3 flex-row-reverse">
              <div className="text-right">
                <h2 className="font-display text-3xl font-black text-secondary neon-glow-purple tracking-wider">
                  {participantB?.modelName || 'Model B'}
                </h2>
                <p className="text-xs uppercase tracking-[0.3em] text-secondary/60 font-medium">
                  {participantB?.modelId === 'anthropic/claude-3.5-sonnet' ? 'Core Philosopher' : 'AI Fighter'}
                </p>
              </div>
              <div>
                <span className="text-4xl font-display font-black text-secondary neon-glow-purple italic">{hpB}</span>
                <span className="text-sm font-display text-white/40">/100 HP</span>
              </div>
            </div>
            <div className="h-8 w-full bg-white/5 border border-secondary/40 skew-x-[15deg] overflow-hidden p-1">
              <div className="hp-bar-purple h-full transition-all duration-700 ml-auto" style={{ width: `${hpB}%` }}></div>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-grow flex flex-col justify-center">
            <div className={`relative transition-all ${currentTurn === 'B' && room.status === 'debating' ? 'opacity-100 scale-100' : 'opacity-50 grayscale-[0.3] scale-95'}`}>
              {currentTurn === 'B' && room.status === 'debating' && (
                <div className="absolute -inset-2 bg-secondary/20 blur-2xl rounded-xl animate-pulse"></div>
              )}
              <div className={`relative ${currentTurn === 'B' && room.status === 'debating' ? 'bg-black/60 backdrop-blur-xl border-2 neon-border-purple' : 'bg-black/40 backdrop-blur-md border border-white/20'} p-10 rounded-lg min-h-[300px]`}>
                <div className="flex items-center gap-3 mb-6">
                  <span className={`material-symbols-outlined text-sm ${currentTurn === 'B' && room.status === 'debating' ? 'text-secondary neon-glow-purple animate-pulse' : 'text-white/40'}`}>
                    {currentTurn === 'B' && room.status === 'debating' ? 'bolt' : 'hourglass_empty'}
                  </span>
                  <span className={`text-[10px] font-display uppercase tracking-[0.4em] ${currentTurn === 'B' && room.status === 'debating' ? 'text-secondary' : 'text-white/40'}`}>
                    {currentTurn === 'B' && room.status === 'debating' ? 'Generating Response...' : lastMessageB ? 'Response Delivered' : 'Awaiting turn...'}
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-bold leading-relaxed text-white whitespace-pre-wrap">
                  {lastMessageB || 'Awaiting battle initiation...'}
                </p>
              </div>
            </div>

            {/* Attack Indicator */}
            {lastMessageB && currentTurn !== 'B' && messagesB.length > 0 && (
              <div className="mt-10 flex items-center justify-end gap-6">
                <div className="flex items-center gap-2 px-8 py-4 bg-secondary text-white font-display font-black italic tracking-tighter skew-x-[15deg] shadow-[0_0_30px_rgba(188,19,254,0.4)]">
                  {ATTACK_INFO[messagesB[messagesB.length - 1]?.attackType || 'WEAK_BLOW']?.name || 'ATTACK'}
                  {messagesB[messagesB.length - 1]?.damage && (
                    <span className="text-sm">-{messagesB[messagesB.length - 1].damage} HP</span>
                  )}
                  <span className="material-symbols-outlined">auto_fix_high</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer with Support Bars */}
      <footer className="fixed bottom-0 left-0 w-full p-8 bg-black/95 backdrop-blur-2xl border-t border-white/10 z-30">
        <div className="max-w-7xl mx-auto flex items-end gap-16">
          {/* Fighter A Support */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-display text-sm text-primary uppercase font-black neon-glow-blue">Crowd Support</span>
              <span className="font-display text-2xl font-black text-primary neon-glow-blue">{supportA}%</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-primary shadow-[0_0_20px_#00f3ff]" style={{ width: `${supportA}%` }}></div>
            </div>
            <button
              onClick={() => setSupportA(prev => Math.min(100, prev + 5))}
              className="mt-4 w-full bg-primary/5 hover:bg-primary text-primary hover:text-black border-2 border-primary/50 py-4 font-display font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group"
            >
              <span className="material-symbols-outlined">bolt</span>
              Boost {participantA?.modelName || 'Fighter A'}
            </button>
          </div>

          {/* Live Stakes */}
          <div className="px-8 flex flex-col items-center">
            <span className="text-[10px] font-display uppercase tracking-[0.5em] text-white/40 mb-4 font-bold">Live Stakes</span>
            <div className="flex gap-2 h-16 items-end">
              <div className="w-1.5 bg-primary/30 h-1/2"></div>
              <div className="w-1.5 bg-primary/60 h-3/4 shadow-[0_0_10px_var(--primary)]"></div>
              <div className="w-1.5 bg-primary h-full shadow-[0_0_15px_var(--primary)]"></div>
              <div className="w-1.5 bg-secondary h-full shadow-[0_0_15px_var(--secondary)]"></div>
              <div className="w-1.5 bg-secondary/60 h-3/4 shadow-[0_0_10px_var(--secondary)]"></div>
              <div className="w-1.5 bg-secondary/30 h-1/2"></div>
            </div>
          </div>

          {/* Fighter B Support */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-display text-2xl font-black text-secondary neon-glow-purple">{supportB}%</span>
              <span className="font-display text-sm text-secondary uppercase font-black neon-glow-purple">Crowd Support</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-secondary shadow-[0_0_20px_#bc13fe] ml-auto" style={{ width: `${supportB}%` }}></div>
            </div>
            <button
              onClick={() => setSupportB(prev => Math.min(100, prev + 5))}
              className="mt-4 w-full bg-secondary/5 hover:bg-secondary text-secondary hover:text-black border-2 border-secondary/50 py-4 font-display font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group"
            >
              Boost {participantB?.modelName || 'Fighter B'}
              <span className="material-symbols-outlined">auto_awesome</span>
            </button>
          </div>
        </div>
      </footer>
    </body>
  )
}

// Page wrapper with Suspense
export default function BattleRoomPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    }>
      <BattleRoomContent roomId={params.id as Id<'rooms'>} />
    </Suspense>
  )
}
