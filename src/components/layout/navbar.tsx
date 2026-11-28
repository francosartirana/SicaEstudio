'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, ChevronRight, MessageCircle } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/whatsapp'

const WHATSAPP_CONTACT_URL = buildWhatsAppLink(
  '¡Hola SicaEstudio! Me gustaría hacer una consulta sobre sus diseños personalizados.'
)

const NAV_LINKS = [
  { href: '/etiquetas-vinos', label: 'Etiquetas de Vinos' },
  { href: '/albumes-figuritas', label: 'Álbumes de Figuritas' },
  { href: '/proyectos', label: 'Proyectos' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Cerrar el menú móvil automáticamente al cambiar de ruta
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Cerrar menú con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <motion.div
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="fixed top-3 sm:top-5 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none"
    >
      <header className="pointer-events-auto relative w-full max-w-4xl rounded-full border border-[#E8DECF]/80 bg-[#FAF7F0]/80 sm:bg-white/75 backdrop-blur-xl shadow-[0_8px_32px_-4px_rgba(28,25,23,0.08),inset_0_1px_0_0_rgba(255,255,255,0.8)] transition-all duration-300">
        <div className="h-16 sm:h-18 px-3 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Logo Isotipo */}
          <Link
            href="/"
            onClick={(e) => {
              setIsOpen(false)
              if (pathname === '/') {
                e.preventDefault()
                if (window.location.hash) {
                  window.history.replaceState(null, '', '/')
                }
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="flex items-center group relative z-10 p-1"
            title="SicaEstudio - Inicio"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#DDC385]/70 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-[#A18417] group-active:scale-95 bg-[#F0D79E]">
              <Image
                src="/logo.jpg"
                alt="SicaEstudio"
                fill
                sizes="(max-width: 640px) 44px, 48px"
                className="object-cover"
                priority
              />
            </div>
          </Link>

          {/* Navegación Desktop (Pill Nav con Microinteracciones) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F5EFE6]/50 p-1.5 rounded-full border border-[#E8DECF]/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 select-none active:scale-[0.97] ${
                    isActive
                      ? 'bg-white text-[#846C12] shadow-sm font-semibold border border-[#E8D99E]/60'
                      : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Botón de Contacto Separado (Color de contraste) y Menú Móvil */}
          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#1C1917] hover:bg-[#2E2825] text-[#FAF7F0] font-medium text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.96]"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#DDC385]" />
              <span>Contacto</span>
            </a>

            {/* Botón de Menú Móvil */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5EFE6] transition-all duration-200 active:scale-90"
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Menú Desplegable Móvil (Glass Island Dropdown) */}
        {isOpen && (
          <div className="md:hidden absolute top-[calc(100%+0.5rem)] inset-x-0 p-3 rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#E8DECF] shadow-[0_16px_36px_-6px_rgba(28,25,23,0.14)] animate-in fade-in slide-in-from-top-3 duration-200 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'bg-[#FAF7EC] text-[#846C12] font-semibold border border-[#E8D99E]/50'
                      : 'text-[#1C1917] hover:bg-[#F5EFE6]/60'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#846C12]' : 'text-[#A8A29E]'}`} />
                </Link>
              )
            })}
          </div>
        )}
      </header>
    </motion.div>
  )
}
