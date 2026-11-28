'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AdminNav() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.replace('/login')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <header className="border-b border-neutral-200 bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-bold text-lg tracking-tight">
            SicaEstudio{' '}
            <span className="text-amber-400 font-normal text-xs uppercase px-2 py-0.5 rounded bg-neutral-800">
              Admin
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-neutral-300">
            <Link href="/admin" className="hover:text-white transition-colors">
              Catálogo y Categorías
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          <Link
            href="/"
            target="_blank"
            className="text-neutral-300 hover:text-white transition-colors text-xs"
          >
            Ver web pública &rarr;
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-medium transition disabled:opacity-50 cursor-pointer"
          >
            {signingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}
