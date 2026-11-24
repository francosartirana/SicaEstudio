import InfiniteSpiral from '@/components/ui/infinite-spiral'
import HowWeWorkSection from '@/components/home/how-we-work-section'
import { HeroDesktopContent, HeroMobileContent, HeroDesktopSpiral, HeroMobileSpiral } from '@/components/home/hero-animated'
import { ArrowDown } from 'lucide-react'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000'

function buildWhatsAppUrl(productTitle: string, customMessage?: string | null) {
  const text = customMessage || `¡Hola! Me interesa encargar el diseño personalizado de: "${productTitle}". ¿Podrían darme más información?`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

export default async function HomePage() {
  // Colección de botellas de autor (1 a 5) para el Infinite Spiral
  const bottleImages = [
    '/botella1.jpg',
    '/botella2.jpg',
    '/botella3.jpg',
    '/botella4.jpg',
    '/botella5.jpg',
  ]
  const spiralItems = Array.from({ length: 15 }).map((_, index) => ({
    id: `bottle-card-${index}`,
    src: bottleImages[index % bottleImages.length],
    alt: `Diseño personalizado SicaEstudio ${(index % bottleImages.length) + 1}`,
  }))

  return (
    <div className="flex flex-col bg-[#F6F3EC]">
      
      {/* =========================================================================
          1. HERO EN MOBILE (lg:hidden) - 100dvh con nombre centrado, slogan y botón flotante
         ========================================================================= */}
      <section className="lg:hidden relative w-full h-[100dvh] flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-[#F6F3EC]">
        <HeroMobileContent />
      </section>

      {/* =========================================================================
          2. SECCIÓN ESPIRAL EN MOBILE (lg:hidden) - ~70dvh con botón estático debajo
         ========================================================================= */}
      <section
        id="espiral-mobile"
        className="lg:hidden relative w-full min-h-[100dvh] flex flex-col items-center justify-center py-8 overflow-hidden bg-[#F6F3EC]"
      >
        {/* Contenedor del Espiral (~70% del viewport vertical) animado entrando desde la derecha */}
        <HeroMobileSpiral className="relative w-full flex flex-col items-center justify-center my-auto px-1">
          {/* Línea delimitadora superior */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#DDC385]/80 to-transparent z-20 mb-1" />

          {/* Espiral 3D ocupando el 70% del viewport vertical con margen lateral seguro */}
          <div className="relative w-full h-[70dvh] max-h-[640px] flex items-center justify-center overflow-hidden">
            <InfiniteSpiral
              items={spiralItems}
              cardWidth={105}
              cardHeight={215}
              radius={105}
              verticalSpacing={58}
              cardsPerTurn={6}
              perspective={950}
              speed={0.4}
              animationMode="all"
              pauseOnHover={true}
              imageFit="cover"
              cardRadius={18}
              centerScale={1.12}
              edgeFade={0.35}
              fadeEdges={true}
              className="h-full w-full"
            />
          </div>

          {/* Línea delimitadora inferior */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#DDC385]/80 to-transparent z-20 mt-1" />
        </HeroMobileSpiral>

        {/* Botón estático debajo del espiral */}
        <div className="w-full flex justify-center pt-5 pb-2 px-4 z-20">
          <a
            href="#como-trabajamos"
            className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8DECF] text-[#1C1917] font-medium text-xs tracking-wide shadow-md hover:shadow-lg hover:border-[#DDC385] transition-all duration-200 active:scale-95"
          >
            <span>¿Cómo trabajamos?</span>
            <ArrowDown className="w-4 h-4 text-[#A18417] group-hover:translate-y-0.5 transition-transform" />
          </a>
        </div>
      </section>

      {/* =========================================================================
          3. HERO EN DESKTOP (hidden lg:flex) - 100dvh de alto con 2 columnas (Texto + Espiral)
         ========================================================================= */}
      <section className="hidden lg:flex relative w-full min-h-[100dvh] flex-col justify-between pt-36 lg:pt-40 pb-12 px-6 lg:px-8 overflow-hidden bg-[#F6F3EC]">
        {/* Contenido Central Dividido en Dos Columnas */}
        <div className="max-w-7xl w-full mx-auto my-auto grid grid-cols-2 gap-12 items-center">
          
          {/* COLUMNA 1: SICA / ESTUDIO (Animado con Framer Motion) */}
          <HeroDesktopContent whatsappUrl={buildWhatsAppUrl('Consulta General')} />

          {/* COLUMNA 2: INFINITE SPIRAL 3D (Animado entrando desde la derecha) */}
          <HeroDesktopSpiral className="relative flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4">
            {/* Línea delimitadora superior */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#DDC385]/80 to-transparent z-20 mb-1" />

            <div className="relative w-full h-[68vh] max-h-[660px] flex items-center justify-center overflow-hidden">
              <InfiniteSpiral
                items={spiralItems}
                cardWidth={140}
                cardHeight={270}
                radius={170}
                verticalSpacing={72}
                cardsPerTurn={6}
                perspective={1000}
                speed={0.4}
                animationMode="all"
                pauseOnHover={true}
                imageFit="cover"
                cardRadius={24}
                centerScale={1.15}
                edgeFade={0.35}
                fadeEdges={true}
                className="h-full w-full"
              />
            </div>

            {/* Línea delimitadora inferior */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#DDC385]/80 to-transparent z-20 mt-1" />
          </HeroDesktopSpiral>

        </div>

        {/* Indicador inferior de Scroll en Desktop */}
        <div className="w-full flex justify-center pt-4">
          <a
            href="#como-trabajamos"
            className="flex items-center gap-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917] transition-colors py-2 px-4 rounded-full bg-white/60 backdrop-blur-sm border border-[#E8DECF]/60 shadow-sm animate-bounce"
          >
            <span>Desliza para explorar</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#A18417]" />
          </a>
        </div>
      </section>

      {/* =========================================================================
          4. SECCIÓN CÓMO TRABAJAMOS (SCROLL EXPAND + GRAINIENT + TIMELINE HORIZONTAL)
         ========================================================================= */}
      <HowWeWorkSection />

    </div>
  )
}
