import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[#E8DECF] bg-[#F5EFE6] py-14 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#DDC385]/60 bg-[#F0D79E]">
            <Image
              src="/logo.jpg"
              alt="SicaEstudio Isotipo"
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-serif font-bold text-base text-[#1C1917]">SicaEstudio</p>
            <p className="text-xs text-[#78716C]">Diseños personalizados para momentos únicos</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium text-[#57534E]">
          <Link href="/etiquetas-vinos" className="hover:text-[#A18417] transition-colors">
            Etiquetas
          </Link>
          <Link href="/albumes-figuritas" className="hover:text-[#A18417] transition-colors">
            Álbumes
          </Link>
          <Link href="/proyectos" className="hover:text-[#A18417] transition-colors">
            Proyectos
          </Link>
          <Link href="/admin" className="text-[#A8A29E] hover:text-[#1C1917] transition-colors ml-2">
            Administración
          </Link>
        </div>

        <p className="text-xs text-[#78716C] text-center md:text-right">
          &copy; {new Date().getFullYear()} SicaEstudio. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
