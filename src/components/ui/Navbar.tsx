'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export function Navbar() {
  const { isAuthenticated, user, login, logout, isLoading } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = await login(username, password)

    if (result.success) {
      setShowLoginModal(false)
      setUsername('')
      setPassword('')
    } else {
      setError(result.error || 'Error al iniciar sesión')
    }
  }

  return (
    <>
      <nav className="relative z-50 flex items-center justify-between px-8 py-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary animate-pulse" />
          <span className="font-display font-black text-xl tracking-tighter italic">
            ARENA_OS v1.0.4
          </span>
        </div>
        <div className="flex items-center space-x-6 text-sm font-medium uppercase tracking-widest text-gray-400">
          <span className="hover:text-primary transition-colors">Server: US-EAST-1</span>
          <span className="hover:text-primary transition-colors">Latency: 14ms</span>

          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-1 rounded border border-primary/30 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                  <span>Admin</span>
                </Link>
              )}
              <div className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded">
                <span className="material-symbols-outlined text-sm text-primary">person</span>
                <span className="text-xs text-white">{user?.displayName || user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 px-4 py-1 rounded border border-white/10 transition-all"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center space-x-2 bg-white/5 hover:bg-primary/20 hover:text-primary px-4 py-1 rounded border border-white/10 transition-all"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>Login</span>
            </button>
          )}

          <button className="flex items-center space-x-2 bg-white/5 px-4 py-1 rounded border border-white/10 hover:bg-white/10 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-black/90 border border-white/10 rounded-lg p-8 neon-panel">
            <div className="absolute -top-[2px] -left-[2px] w-6 h-6 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute -bottom-[2px] -right-[2px] w-6 h-6 border-b-2 border-r-2 border-primary"></div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold text-primary">Iniciar Sesión</h3>
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  setUsername('')
                  setPassword('')
                  setError('')
                }}
                className="text-gray-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="font-display text-xs uppercase tracking-widest text-primary/70 mb-2 block">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="font-display text-xs uppercase tracking-widest text-primary/70 mb-2 block">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className={`w-full bg-white/5 border rounded px-4 py-3 text-white focus:outline-none transition-all ${
                    error
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/10 focus:border-primary/50'
                  }`}
                  required
                />
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded font-display font-bold uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {isLoading ? 'Verificando...' : 'Entrar'}
              </button>
            </form>

            <p className="text-[10px] text-gray-500 mt-4 text-center uppercase tracking-widest">
              Acceso restringido a usuarios registrados
            </p>
          </div>
        </div>
      )}
    </>
  )
}
