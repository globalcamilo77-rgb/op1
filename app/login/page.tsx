'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/adminlr')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      router.push('/adminlr')
    } else {
      setError(result.error || 'Erro ao fazer login')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--graphite)] p-4 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-[var(--orange-primary)]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-10 h-[420px] w-[420px] rounded-full bg-[var(--orange-primary)]/10 blur-3xl"
      />

      <div className="relative bg-background p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="AlfaConstrução" className="h-20 w-auto object-contain" />
        </div>
        <p className="text-center text-muted-foreground text-sm mb-6">Painel Administrativo</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] focus:ring-2 focus:ring-[var(--orange-primary)]/10 bg-background text-foreground"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-foreground">
              Senha
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] focus:ring-2 focus:ring-[var(--orange-primary)]/10 bg-background text-foreground"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[var(--orange-primary)] text-white rounded font-bold text-sm hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  )
}
