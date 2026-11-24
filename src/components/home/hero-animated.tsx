'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import FoldText from '@/components/ui/fold-text'
import { MessageCircle, ArrowDown, ArrowRight } from 'lucide-react'

// Curva de desaceleración suave (Emil Kowalski standard ease-out)
const EASE_OUT = [0.16, 1, 0.3, 1] as const

interface HeroDesktopProps {
  whatsappUrl: string
}

export function HeroDesktopContent({ whatsappUrl }: HeroDesktopProps) {
  return (
    <div className="flex flex-col space-y-8 text-left z-10">
      <div className="space-y-1">
        <h1 className="font-serif text-8xl xl:text-9xl font-bold tracking-tight text-[#1C1917] leading-none">
          <FoldText
            text="SICA"
            foldStyle="paper"
            hinge="top"
            duration={0.8}
            stagger={0.06}
            hoverRefold={true}
            className="font-serif"
          />
        </h1>

        {/* Texto 'ESTUDIO' entrando desde la izquierda */}
        <motion.p
          initial={{ x: -70, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            delay: 0.35,
            duration: 0.8,
            ease: EASE_OUT,
          }}
          className="font-sans font-light text-3xl xl:text-4xl tracking-[0.35em] uppercase text-[#846C12] pl-1"
        >
          ESTUDIO
        </motion.p>
      </div>

      {/* Slogan entrando desde la izquierda */}
      <motion.p
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          delay: 0.55,
          duration: 0.8,
          ease: EASE_OUT,
        }}
        className="text-[#57534E] text-base lg:text-lg max-w-lg leading-relaxed"
      >
        Hacemos tangibles tus momentos e ideas. Diseños de autor en etiquetas personalizadas para vinos, álbumes de figuritas y papelería corporativa de alta gama.
      </motion.p>

      {/* Botones entrando con fade-in desde abajo */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.75,
          duration: 0.7,
          ease: EASE_OUT,
        }}
        className="flex items-center gap-4 pt-2"
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#1C1917] hover:bg-[#2E2825] text-[#FAF7F0] font-medium text-sm transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-xl hover:shadow-[#1C1917]/10"
        >
          <MessageCircle className="w-5 h-5 text-[#DDC385]" />
          Pedir por WhatsApp
        </a>
        <Link
          href="/proyectos"
          className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-[#E8DECF] bg-white/80 backdrop-blur-sm hover:bg-[#F5EFE6] text-[#1C1917] font-medium text-sm transition-all duration-200 shadow-sm"
        >
          <span>Ver Trabajos</span>
          <ArrowRight className="w-4 h-4 text-[#846C12]" />
        </Link>
      </motion.div>
    </div>
  )
}

export function HeroMobileContent() {
  return (
    <>
      {/* Bloque Central Centrado: Nombre y Slogan Completo */}
      <div className="flex flex-col items-center justify-center my-auto pt-28 sm:pt-32 pb-16 px-2 z-10 max-w-sm sm:max-w-md mx-auto">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="font-serif text-8xl sm:text-9xl font-bold tracking-tight text-[#1C1917] leading-none">
            <FoldText
              text="SICA"
              foldStyle="paper"
              hinge="top"
              duration={0.8}
              stagger={0.06}
              hoverRefold={true}
              className="font-serif"
            />
          </h1>

          {/* Texto 'ESTUDIO' entrando desde la izquierda */}
          <motion.p
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              delay: 0.35,
              duration: 0.8,
              ease: EASE_OUT,
            }}
            className="font-sans font-light text-3xl sm:text-4xl tracking-[0.38em] uppercase text-[#846C12] pl-1"
          >
            ESTUDIO
          </motion.p>
        </div>

        {/* Slogan entrando desde la izquierda */}
        <motion.p
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            delay: 0.55,
            duration: 0.8,
            ease: EASE_OUT,
          }}
          className="text-[#57534E] text-sm sm:text-base leading-relaxed pt-4 max-w-xs sm:max-w-sm"
        >
          Hacemos tangibles tus momentos e ideas. Diseños de autor en etiquetas personalizadas para vinos, álbumes de figuritas y papelería corporativa de alta gama.
        </motion.p>
      </div>

      {/* Botón flotante inferior: "Ver Diseños" entrando con fade-in desde abajo */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.75,
          duration: 0.7,
          ease: EASE_OUT,
        }}
        className="absolute bottom-7 inset-x-0 flex justify-center z-20 pointer-events-auto"
      >
        <a
          href="#espiral-mobile"
          className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8DECF] text-[#1C1917] font-medium text-xs tracking-wide shadow-md hover:shadow-lg hover:border-[#DDC385] transition-all duration-200 active:scale-95 animate-bounce"
        >
          <span>Ver Diseños</span>
          <ArrowDown className="w-4 h-4 text-[#A18417] group-hover:translate-y-0.5 transition-transform" />
        </a>
      </motion.div>
    </>
  )
}

interface HeroSpiralWrapperProps {
  children: React.ReactNode
  className?: string
}

export function HeroDesktopSpiral({ children, className = '' }: HeroSpiralWrapperProps) {
  return (
    <motion.div
      initial={{ x: 140, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        delay: 0.35,
        duration: 0.9,
        ease: EASE_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function HeroMobileSpiral({ children, className = '' }: HeroSpiralWrapperProps) {
  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.85,
        ease: EASE_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
