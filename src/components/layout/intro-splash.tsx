'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'

export function IntroSplash() {
  const [shouldShow, setShouldShow] = useState<boolean | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const topPanelRef = useRef<HTMLDivElement>(null)
  const bottomPanelRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const forceIntro = params.get('intro') === '1'
      const hasSeen = sessionStorage.getItem('sica_intro_seen')

      if (!forceIntro && hasSeen) {
        document.documentElement.classList.remove('sica-intro-active')
        setShouldShow(false)
        return
      }

      setShouldShow(true)
    } catch {
      setShouldShow(false)
    }
  }, [])

  useEffect(() => {
    if (shouldShow !== true) return

    const overlay = overlayRef.current
    const topPanel = topPanelRef.current
    const bottomPanel = bottomPanelRef.current
    const circle = circleRef.current

    if (!overlay || !topPanel || !bottomPanel || !circle) return

    // Bloquear scroll mientras se ejecuta la animación
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Soporte para usuarios con preferencias de movimiento reducido
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      document.documentElement.classList.remove('sica-intro-active')
      document.body.style.overflow = originalOverflow
      sessionStorage.setItem('sica_intro_seen', 'true')
      setShouldShow(false)
      return
    }

    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    // Posición inicial del círculo fuera de pantalla hacia la izquierda
    const offscreenX = -(windowWidth * 0.5 + 260)

    // Configuración inicial mediante GSAP (centrado exacto sobre la línea con xPercent: -50, yPercent: -50)
    gsap.set(circle, {
      xPercent: -50,
      yPercent: -50,
      x: offscreenX,
      rotation: -720,
      scale: 0.9,
      opacity: 1,
      visibility: 'visible',
    })

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove('sica-intro-active')
        document.body.style.overflow = originalOverflow
        try {
          sessionStorage.setItem('sica_intro_seen', 'true')
        } catch {}
        setShouldShow(false)
      },
    })

    // 1. Entra girando desde el lado izquierdo hasta el centro
    tl.to(circle, {
      x: 0,
      rotation: 0,
      scale: 1,
      duration: 1.0,
      ease: 'power2.out',
    })

    // 2. Al llegar al centro, se hace un poco más grande
    tl.to(
      circle,
      {
        scale: 1.15,
        duration: 0.35,
        ease: 'back.out(2)',
      },
      '+=0.04'
    )

    // Breve pausa para apreciar el isotipo
    tl.to({}, { duration: 0.16 })

    // 3. El fondo sólido se divide en dos de forma horizontal:
    // - La parte superior se mueve hacia arriba (llevando el círculo consigo a la misma velocidad)
    // - La parte inferior se mueve hacia abajo
    const topDistance = windowHeight * 0.5 + 240
    const bottomDistance = windowHeight * 0.5 + 60

    tl.to(
      topPanel,
      {
        y: -topDistance,
        duration: 0.9,
        ease: 'power3.inOut',
      },
      'split'
    )

    tl.to(
      bottomPanel,
      {
        y: bottomDistance,
        duration: 0.9,
        ease: 'power3.inOut',
      },
      'split'
    )

    return () => {
      tl.kill()
      document.body.style.overflow = originalOverflow
    }
  }, [shouldShow])

  if (shouldShow === false) return null

  return (
    <div
      ref={overlayRef}
      className="sica-intro-overlay fixed inset-0 z-[9999] pointer-events-auto overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Panel Superior (color temático Vainilla Cálido de SicaEstudio - z-20 para que el círculo no sea tapado por el panel inferior) */}
      <div
        ref={topPanelRef}
        className="absolute top-0 inset-x-0 h-1/2 bg-[#FAF7F0] z-20 overflow-visible"
        style={{ willChange: 'transform' }}
      >
        {/* Línea divisoria central sutil */}
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-[#E8DECF] pointer-events-none" />

        {/* Círculo con el logo de SicaEstudio anclado exactamente sobre la línea central (top-full) */}
        <div
          ref={circleRef}
          className="absolute top-full left-1/2 z-30 w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full shadow-[0_20px_50px_rgba(28,25,23,0.22)] border-3 sm:border-4 border-[#A18417] bg-[#FAF7F0] overflow-hidden flex items-center justify-center pointer-events-none"
          style={{
            willChange: 'transform',
            opacity: 0,
            visibility: 'hidden',
          }}
        >
          <div className="relative w-full h-full bg-[#FAF7F0]">
            <Image
              src="/logo.jpg"
              alt="SicaEstudio"
              fill
              sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 208px"
              className="object-cover select-none pointer-events-none"
              priority
            />
          </div>
        </div>
      </div>

      {/* Panel Inferior (color temático Vainilla Cálido de SicaEstudio - z-10 por debajo del círculo) */}
      <div
        ref={bottomPanelRef}
        className="absolute bottom-0 inset-x-0 h-1/2 bg-[#FAF7F0] z-10"
        style={{ willChange: 'transform' }}
      >
        {/* Línea divisoria central sutil */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-[#E8DECF] pointer-events-none" />
      </div>
    </div>
  )
}
export default IntroSplash
