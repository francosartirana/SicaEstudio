import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/data/products'
import { FALLBACK_ALBUM_CATALOG, PUBLIC_WINE_PROJECTS } from '@/lib/data/catalog-defaults'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import WineBottleViewer from '@/components/ui/wine-bottle-viewer'
import WineGalleryCarousel from '@/components/ui/wine-gallery-carousel'
import AlbumsShowcase from '@/components/ui/albums-showcase'
import AlbumsCatalog from '@/components/ui/albums-catalog'

const CATEGORY_MAP: Record<string, { label: string; desc: string }> = {
  'etiquetas-vinos': {
    label: 'Etiquetas de Vinos',
    desc: 'Diseños de autor personalizados para bodegas, eventos especiales y botellas únicas.',
  },
  'albumes-figuritas': {
    label: 'Álbumes de Figuritas',
    desc: 'Crea tu propio álbum coleccionable con recuerdos familiares, viajes o festejos.',
  },
  'proyectos': {
    label: 'Proyectos',
    desc: 'Galería completa de creaciones personalizadas de SicaEstudio: etiquetas de autor, álbumes y proyectos especiales a medida.',
  },
  'tarjetas-empresariales': {
    label: 'Tarjetas Empresariales',
    desc: 'Presentación corporativa premium con acabados especiales, texturas y diseño a medida.',
  },
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000'

function buildWhatsAppUrl(productTitle: string, customMessage?: string | null) {
  const text = customMessage || `¡Hola! Me interesa encargar el diseño de: "${productTitle}". ¿Me podrían asesorar?`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

interface PageProps {
  params: Promise<{
    category: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const catInfo = CATEGORY_MAP[category]

  if (!catInfo) {
    return {
      title: 'Categoría no encontrada | SicaEstudio',
    }
  }

  return {
    title: `${catInfo.label} | SicaEstudio`,
    description: catInfo.desc,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const catInfo = CATEGORY_MAP[category]

  if (!catInfo) {
    notFound()
  }

  const products = await getProducts(category)

  // En la sección de Etiquetas de Vinos, primero se muestra la Galería de Fotos (Depth Carousel)
  // y a continuación el Visualizador 3D ocupando el viewport
  if (category === 'etiquetas-vinos') {
    return (
      <div className="flex flex-col w-full">
        {/* 1. GALERÍA DE BOTELLAS DE AUTOR CON DEPTH CAROUSEL (Primero) */}
        <WineGalleryCarousel />

        {/* 2. VISUALIZADOR 3D DE BOTELLAS DE VINO (Segundo) */}
        <section
          id="vista-3d"
          aria-label="Visualizador 3D de Botellas de Vino"
          className="relative w-full min-h-[100svh] lg:min-h-[100dvh] flex flex-col justify-center lg:justify-between pt-[84px] sm:pt-28 lg:pt-36 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-8 lg:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#FAF7F0] via-[#FAF7F0] to-[#F5EFE6]/40 border-t border-[#E8DECF]/70 scroll-mt-0 lg:scroll-mt-36"
        >
          {/* Resplandor decorativo de fondo */}
          <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-[#F0D79E]/25 via-[#F5EFE6]/40 to-white/70 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Contenedor central que encaja en el viewport */}
          <div className="max-w-7xl w-full mx-auto my-auto flex-1 flex flex-col justify-center">
            <WineBottleViewer />
          </div>
        </section>
      </div>
    )
  }

  // En Álbumes de Figuritas, showcase editorial mobile-first con los 2 videos en formato 9:16 + catálogo
  if (category === 'albumes-figuritas') {
    return (
      <div className="flex flex-col w-full">
        <AlbumsShowcase />
        <AlbumsCatalog products={products} />
      </div>
    )
  }

  // Vista estándar para el resto de categorías (proyectos, etc.)
  const realProducts = products.filter((p) => !p.id.startsWith('demo-'))
  const displayProducts =
    category === 'proyectos'
      ? [...realProducts, ...PUBLIC_WINE_PROJECTS, ...FALLBACK_ALBUM_CATALOG]
      : products

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-40 pb-20 space-y-12">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a la Vidriera Principal
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight">{catInfo.label}</h1>
        <p className="text-[#57534E] text-sm mt-2 max-w-2xl leading-relaxed">{catInfo.desc}</p>
      </div>

      <div className="space-y-6">
        {displayProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E8DECF] p-16 text-center text-[#78716C] space-y-2">
            <p className="font-semibold text-[#1C1917]">Aún no hay trabajos en esta categoría</p>
            <p className="text-xs">¡Pronto subiremos nuevos proyectos a esta sección!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayProducts.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col rounded-2xl border border-[#E8DECF] overflow-hidden bg-white shadow-sm hover:shadow-xl hover:border-[#DDC385] transition-all duration-300"
              >
                <div className="relative aspect-square w-full bg-[#F5EFE6] overflow-hidden">
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-lg text-[#1C1917] group-hover:text-[#A18417] transition-colors leading-snug">
                      {product.title}
                    </h3>
                    <p className="text-xs text-[#57534E] leading-relaxed line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  <a
                    href={buildWhatsAppUrl(product.title, product.whatsapp_custom_message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#1EBE5D] hover:bg-[#17A34E] text-white font-medium text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar por WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
