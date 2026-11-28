'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, Loader2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin'
  const queryError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(
    queryError === 'supabase_not_configured'
      ? 'Supabase no está configurado en .env.local. Agregá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      : null
  )
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError(signInError.message || 'Credenciales inválidas. Verificá tu correo y contraseña.')
      setLoading(false)
      return
    }

    router.replace(redirectTo)
    router.refresh()
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 text-white mx-auto">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">Acceso Administrativo</h1>
        <p className="text-xs text-neutral-500">Ingresa tus credenciales para gestionar SicaEstudio</p>
      </div>

      {error && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1" htmlFor="email">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 transition"
              placeholder="admin@sicaestudio.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1" htmlFor="password">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 transition"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ingresar al Panel'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <Suspense fallback={<div className="text-sm text-neutral-500">Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
