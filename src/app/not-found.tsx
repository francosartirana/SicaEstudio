import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export default function NotFound() {
  const whatsappUrl = buildWhatsAppLink(
    '¡Hola SicaEstudio! Llegué a una página que no existe (404) y me gustaría consultar por sus diseños personalizados.'
  )

  return (
    <main className="relative min-h-[100dvh] w-full bg-[#F6F3EC] text-[#1C1917] flex flex-col items-center justify-center px-4 sm:px-6 py-12 overflow-hidden">
      {/* Resplandores cálidos sutiles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] rounded-full bg-gradient-to-tr from-[#F0D79E]/35 via-[#FAF7F0]/50 to-[#9AA484]/15 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-xl mx-auto text-center space-y-7 sm:space-y-8">
        {/* Isotipo SicaEstudio */}
        <Link
          href="/"
          className="inline-flex items-center justify-center group"
          title="Ir al inicio de SicaEstudio"
        >
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#DDC385] bg-[#F0D79E] shadow-md transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.jpg"
              alt="SicaEstudio"
              fill
              sizes="64px"
              className="object-cover"
              priority
            />
          </div>
        </Link>

        {/* Número 404 y título editorial */}
        <div className="space-y-3">
          <p className="font-serif text-7xl sm:text-8xl md:text-9xl font-bold tracking-tight text-[#5A6347]/25 leading-none select-none">
            404
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1C1917] tracking-tight leading-tight [text-wrap:balance] -mt-3 sm:-mt-4">
            Esta página no está en nuestra vidriera
          </h1>
          <p className="text-sm sm:text-base text-[#57534E] max-w-md mx-auto leading-relaxed [text-wrap:pretty]">
            Es posible que el enlace haya cambiado o que la dirección tenga un error. Podés volver al inicio o explorar nuestras colecciones.
          </p>
        </div>

        {/* Acciones principales (Mobile-first apiladas, en sm+ en fila) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-1">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] font-medium text-sm transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 text-[#DDC385]" />
            <span>Volver al Inicio</span>
          </Link>

          <Link
            href="/proyectos"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#E8DECF] bg-white/85 hover:bg-[#F5EFE6] hover:border-[#DDC385] text-[#1C1917] font-medium text-sm transition-all duration-200 active:scale-[0.98] shadow-xs min-h-[44px]"
          >
            <span>Explorar Proyectos</span>
            <ArrowRight className="w-4 h-4 text-[#A18417]" />
          </Link>
        </div>

        {/* Accesos rápidos de categorías y contacto */}
        <div className="pt-4 border-t border-[#E8DECF]/80 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-xs font-medium text-[#57534E]">
          <Link
            href="/etiquetas-vinos"
            className="hover:text-[#A18417] transition-colors py-1"
          >
            Etiquetas de Vinos
          </Link>
          <span aria-hidden="true" className="text-[#C4B59D]">
            •
          </span>
          <Link
            href="/albumes-figuritas"
            className="hover:text-[#A18417] transition-colors py-1"
          >
            Álbumes de Figuritas
          </Link>
          <span aria-hidden="true" className="text-[#C4B59D]">
            •
          </span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#5A6347] hover:text-[#1C1917] transition-colors py-1"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#A18417]" />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    </main>
  )
}
