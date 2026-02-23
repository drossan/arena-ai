'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const MODELS = [
  { id: 'openai/gpt-4o', name: 'GPT-4o', nickname: 'The Oracle' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5', nickname: 'The Sage' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', nickname: 'The Catalyst' },
  { id: 'meta-llama/llama-3-70b', name: 'Llama 3', nickname: 'The Brutalist' },
  { id: 'mistralai/mistral-large', name: 'Mistral', nickname: 'The Ghost' },
]

export default function AdminPage() {
  const createRoom = useMutation(api.mutations.createRoom)
  const { isAuthenticated, user, login, logout, isLoading } = useAuth()

  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [showSetupHint, setShowSetupHint] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    topic: '',
    modelA: 'openai/gpt-4o',
    modelB: 'anthropic/claude-3.5-sonnet',
    startDateTime: '',
    rounds: 3,
  })
  const [success, setSuccess] = useState(false)
  const [roomId, setRoomId] = useState<string>('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setShowSetupHint(false)

    const result = await login(loginUsername, loginPassword)

    if (!result.success) {
      const error = result.error || 'Usuario o contraseña incorrectos'
      setAuthError(error)
      // Show setup hint if user not found
      if (error.includes('no encontrado') || error.includes('not found')) {
        setShowSetupHint(true)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const startTime = new Date(formData.startDateTime).getTime()

    if (!user?._id) {
      alert('Authentication required')
      return
    }

    try {
      const result = await createRoom({
        topic: formData.topic,
        modelA: formData.modelA,
        modelB: formData.modelB,
        startTime,
        createdBy: user._id as any,
      })

      setRoomId(result as string)
      setSuccess(true)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error creating room')
    }
  }

  // Not authenticated - Show login
  if (!isAuthenticated) {
    return (
      <>
        {/* Background Effects */}
        <div className="fixed inset-0 cyber-grid pointer-events-none z-0 opacity-30"></div>
        <div className="fixed inset-0 digital-rain animate-matrix pointer-events-none z-0"></div>
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none z-0"></div>

        {/* Floating Particles */}
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-[1px] h-[1px] bg-primary shadow-[0_0_15px_3px_rgba(0,243,255,0.6)] animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[1px] h-[1px] bg-accent shadow-[0_0_15px_3px_rgba(255,157,0,0.4)] animate-pulse animation-delay-500"></div>
        </div>

        {/* Header */}
        <nav className="relative z-50 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/20">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span className="text-xs uppercase tracking-widest font-bold">Back to Arena</span>
            </Link>
            <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-accent animate-pulse"></div>
              <span className="font-display font-black text-lg tracking-tighter italic">ARENA_OS // LOGIN</span>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            <span className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]"></span>
              <span>Authentication Required</span>
            </span>
          </div>
        </nav>

        {/* Login Form */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🔐</div>
            <h1 className="font-display font-black text-5xl tracking-tighter uppercase italic mb-2">
              Admin <span className="text-accent">Access</span>
            </h1>
            <p className="text-gray-400 font-light tracking-[0.3em] uppercase text-sm">
              Enter credentials to access <span className="text-accent font-bold">Command Center</span>
            </p>
          </div>

          <div className="w-full max-w-md neon-panel p-8">
            <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-2 border-l-2 border-accent"></div>
            <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-2 border-r-2 border-accent"></div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="font-display text-xs uppercase tracking-widest text-accent/70 mb-2 block">
                  Usuario
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Nombre de usuario"
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="font-display text-xs uppercase tracking-widest text-accent/70 mb-2 block">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="•••••••••••••"
                    className={`w-full bg-white/5 border rounded px-4 py-3 text-white focus:outline-none transition-all ${
                      authError
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                        : 'border-white/10 focus:border-accent/50 focus:ring-1 focus:ring-accent/20'
                    }`}
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-accent/50">security</span>
                </div>
                {authError && (
                  <p className="text-red-400 text-xs mt-2 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative py-4 bg-black border-2 border-accent transition-all hover:scale-[1.02] active:scale-95 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-accent/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <span className="material-symbols-outlined text-2xl text-accent">login</span>
                  <span className="font-display font-black text-xl tracking-[0.15em] uppercase italic text-white">
                    {isLoading ? 'Authenticating...' : 'Access System'}
                  </span>
                </div>
              </button>
            </form>

            {/* Setup Instructions - Show when no users exist */}
            {showSetupHint && (
              <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded">
                <p className="text-[10px] text-yellow-400 uppercase tracking-widest mb-2">
                  ⚠️ Primer usuario no encontrado
                </p>
                <p className="text-[10px] text-gray-400 mb-3">
                  Para crear el primer admin, ejecuta en la consola del navegador (F12):
                </p>
                <pre className="text-[9px] bg-black/50 p-2 rounded text-green-400 overflow-x-auto">
{`fetch('/api/setup-admin', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123',
    displayName: 'Administrador'
  })
}).then(r => r.json()).then(console.log)`}
                </pre>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Unauthorized access attempts are logged and monitored
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 w-full p-4 border-t border-white/5 bg-black/80 backdrop-blur-md z-50">
          <div className="max-w-7xl mx-auto flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">
            <span className="text-white/20">© 2024 ARENA_AI_NEURAL_SYS // SECURE ACCESS ONLY</span>
          </div>
        </footer>
      </>
    )
  }

  // Success view
  if (success && roomId) {
    return (
      <>
        <div className="fixed inset-0 cyber-grid pointer-events-none z-0 opacity-30"></div>
        <div className="fixed inset-0 digital-rain animate-matrix pointer-events-none z-0"></div>

        <main className="relative z-10 min-h-screen flex items-center justify-center px-8">
          <div className="text-center max-w-2xl">
            <div className="text-9xl mb-8">✅</div>
            <h1 className="font-display text-5xl font-black text-accent mb-6 tracking-wider">
              Battle Protocol Initiated!
            </h1>
            <p className="text-gray-400 text-xl mb-12 font-body">
              The arena has been configured. Neural combatants are standing by.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/rooms/${roomId}`}
                className="px-12 py-5 bg-accent/20 border-2 border-accent rounded-lg text-accent hover:bg-accent/30 transition-all text-xl font-display font-black uppercase tracking-widest"
              >
                ⚔️ Enter Arena →
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setRoomId('')
                  setFormData({
                    topic: '',
                    modelA: 'openai/gpt-4o',
                    modelB: 'anthropic/claude-3.5-sonnet',
                    startDateTime: '',
                    rounds: 3,
                  })
                }}
                className="px-8 py-4 bg-white/5 border border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-white/40 transition-all font-display font-bold uppercase tracking-widest"
              >
                Create Another
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Main admin panel (authenticated)
  return (
    <>
      {/* Background Effects */}
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>
      <div className="fixed inset-0 digital-rain animate-matrix pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none z-0"></div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[1px] h-[1px] bg-primary shadow-[0_0_15px_3px_rgba(0,243,255,0.6)] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[1px] h-[1px] bg-accent shadow-[0_0_15px_3px_rgba(255,157,0,0.4)] animate-pulse animation-delay-500"></div>
      </div>

      {/* Header */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/20">
        <div className="flex items-center space-x-4">
          <Link href="/rooms" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-xs uppercase tracking-widest font-bold">Back to Arena</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary animate-pulse"></div>
            <span className="font-display font-black text-lg tracking-tighter italic">ARENA_OS v1.0.4 // ADMIN</span>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          <span className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
            <span>System Operational</span>
          </span>
          <span className="text-primary">SECURE_NODE: ADMIN_AUTH</span>
          <button
            onClick={logout}
            className="hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="font-display font-black text-5xl md:text-6xl tracking-tighter uppercase italic animate-glitch mb-2">
            ADMIN <span className="text-primary">PANEL</span>
          </h1>
          <p className="text-gray-400 font-light tracking-[0.3em] uppercase text-sm">
            Initiate New Neural <span className="text-primary font-bold">Combat Protocol</span>
          </p>
        </div>

        <div className="w-full max-w-2xl neon-panel p-8 md:p-12">
          <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-2 border-l-2 border-primary"></div>
          <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-2 border-r-2 border-primary"></div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Topic */}
            <div>
              <label className="font-display text-xs uppercase tracking-widest text-primary/70 mb-2 block">
                Battle Topic / Neural Objective
              </label>
              <textarea
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Is artificial consciousness possible within current transformer architectures?"
                className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-display text-lg resize-none"
                required
              />
            </div>

            {/* Fighters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fighter A */}
              <div>
                <label className="font-display text-xs uppercase tracking-widest text-primary/70 mb-2 block">
                  Select Fighter A
                </label>
                <div className="relative">
                  <select
                    value={formData.modelA}
                    onChange={(e) => setFormData({ ...formData, modelA: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all appearance-none pr-10 font-display uppercase tracking-wider"
                  >
                    {MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.nickname})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">smart_toy</span>
                </div>
              </div>

              {/* Fighter B */}
              <div>
                <label className="font-display text-xs uppercase tracking-widest text-secondary/70 mb-2 block">
                  Select Fighter B
                </label>
                <div className="relative">
                  <select
                    value={formData.modelB}
                    onChange={(e) => setFormData({ ...formData, modelB: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/20 transition-all appearance-none pr-10 font-display uppercase tracking-wider"
                  >
                    {MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.nickname})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">smart_toy</span>
                </div>
              </div>
            </div>

            {/* Rounds & Start Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rounds */}
              <div>
                <label className="font-display text-xs uppercase tracking-widest text-primary/70 mb-2 block">
                  Rounds
                </label>
                <div className="flex items-center space-x-1 border border-white/10 rounded bg-white/5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, rounds: Math.max(1, formData.rounds - 1) })}
                    className="w-12 py-3 hover:bg-primary/20 transition-colors border-r border-white/10"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={formData.rounds}
                    onChange={(e) => setFormData({ ...formData, rounds: parseInt(e.target.value) || 1 })}
                    className="w-full bg-transparent text-center border-none focus:ring-0 font-display text-lg"
                    min="1"
                    max="10"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, rounds: Math.min(10, formData.rounds + 1) })}
                    className="w-12 py-3 hover:bg-primary/20 transition-colors border-l border-white/10"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Start Time */}
              <div>
                <label className="font-display text-xs uppercase tracking-widest text-primary/70 mb-2 block">
                  Start Time (System Clock)
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Authenticated User Info */}
            <div className="pt-6 border-t border-white/10">
              <div className="bg-primary/5 border border-primary/20 p-4 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="material-symbols-outlined text-primary">verified_user</span>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Authenticated As</p>
                      <p className="text-sm text-white font-bold">{user?.displayName || user?.username}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-primary uppercase tracking-widest font-bold">Admin Access</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full group relative py-6 bg-black border-2 border-accent transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-accent/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center justify-center space-x-4">
                <span className="material-symbols-outlined text-3xl text-accent group-hover:animate-bounce">rocket_launch</span>
                <span className="font-display font-black text-2xl tracking-[0.15em] uppercase italic text-white">
                  Create Battle Room
                </span>
              </div>
              <div className="absolute inset-0 shadow-[0_0_30px_rgba(255,157,0,0.4)] pointer-events-none"></div>
            </button>
          </form>
        </div>

        {/* Guidelines */}
        <div className="mt-12 w-full max-w-2xl">
          <div className="flex items-center space-x-4 mb-4">
            <span className="material-symbols-outlined text-gray-500 text-sm">info</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Creation Guidelines</span>
            <div className="h-[1px] flex-grow bg-white/5"></div>
          </div>
          <ul className="text-[11px] text-gray-500 uppercase tracking-widest space-y-2 list-disc list-inside px-2">
            <li>Topic must be clear and facilitate multiple perspectives.</li>
            <li>Both fighters must be initialized with the latest system firmware.</li>
            <li>Battle durations are capped at 45 minutes for spectator retention.</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full p-4 border-t border-white/5 bg-black/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">
          <div className="flex space-x-8 mb-4 md:mb-0">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>System Online</span>
            </span>
            <span>Active Matches: 42</span>
            <span className="text-primary">Admin Session: Active</span>
          </div>
          <div className="flex space-x-8">
            <a className="hover:text-primary transition-colors" href="#">Documentation</a>
            <a className="hover:text-primary transition-colors" href="#">Support</a>
            <span className="text-white/20">© 2024 ARENA_AI_NEURAL_SYS</span>
          </div>
        </div>
      </footer>
    </>
  )
}
