import { notFound } from 'next/navigation'
import {
  getCategories,
  getGalleryWineProducts,
  getProducts,
  getShowcaseAlbums,
} from '@/lib/data/products'
import type { Metadata } from 'next'
import WineBottleViewer from '@/components/ui/wine-bottle-viewer'
import WineGalleryCarousel, { type WineBottleItem } from '@/components/ui/wine-gallery-carousel'
import AlbumsShowcase, { type AlbumEdition } from '@/components/ui/albums-showcase'
import AlbumsCatalog from '@/components/ui/albums-catalog'
import ProjectsCatalog from '@/components/ui/projects-catalog'

async function resolveCategoryMeta(slug: string) {
  if (slug === 'proyectos') {
    return {
      label: 'Proyectos',
      desc: 'Galería completa de creaciones personalizadas de SicaEstudio: etiquetas de autor, álbumes y proyectos especiales a medida.',
    }
  }
  const categories = await getCategories()
  const match = categories.find((c) => c.slug === slug)
  if (!match) return null
  return {
    label: match.nombre,
    desc: `Explorá nuestros trabajos y diseños personalizados en ${match.nombre}.`,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const info = await resolveCategoryMeta(category)
  if (!info) return { title: 'Categoría no encontrada' }
  return {
    title: `${info.label} | SicaEstudio`,
    description: info.desc,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const catInfo = await resolveCategoryMeta(category)

  if (!catInfo) {
    notFound()
  }

  // En Etiquetas de Vinos, experiencia inmersiva en dos secciones: Carrusel + Visualizador 3D
  if (category === 'etiquetas-vinos') {
    const galleryWineProducts = await getGalleryWineProducts()
    const bottles: WineBottleItem[] = galleryWineProducts
      .map((prod): WineBottleItem | null => {
        const firstImage = prod.media.find((m) => m.tipo === 'IMAGEN')
        if (!firstImage) return null
        return {
          id: prod.id,
          image: firstImage.url,
          alt: firstImage.alt_text || prod.nombre,
          title: prod.nombre,
          description:
            prod.descripcion ||
            'Diseño personalizado de etiqueta de autor creado a medida en SicaEstudio.',
          whatsappMessage: `¡Hola! Vi el diseño "${prod.nombre}" en la galería de etiquetas de vinos de SicaEstudio y quisiera consultar por un presupuesto personalizado.`,
        }
      })
      .filter((item): item is WineBottleItem => item !== null)

    return (
      <div className="flex flex-col w-full">
        {/* SECCIÓN 1: Carrusel con profundidad + Copy de Colección */}
        <WineGalleryCarousel bottles={bottles} />

        {/* SECCIÓN 2: Visualizador 3D de Botellas (100svh en mobile, 100dvh en desktop) */}
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

  // En Álbumes de Figuritas, showcase editorial mobile-first con los videos de presentación + catálogo
  if (category === 'albumes-figuritas') {
    const [showcaseAlbums, products] = await Promise.all([
      getShowcaseAlbums(),
      getProducts(category),
    ])
    const editions: AlbumEdition[] = showcaseAlbums
      .map((album, idx): AlbumEdition | null => {
        const presentationVideo =
          album.media.find((m) => m.rol === 'PRESENTACION' && m.tipo === 'VIDEO') ||
          album.media.find((m) => m.tipo === 'VIDEO')
        if (!presentationVideo) return null
        return {
          id: album.id,
          label: `Edición ${String(idx + 1).padStart(2, '0')}`,
          title: album.nombre,
          subtitle: album.categorias?.nombre || 'Álbum Personalizado',
          description:
            album.descripcion ||
            'Álbum personalizado estilo figuritas diseñado a medida en SicaEstudio.',
          videoSrc: presentationVideo.url,
          whatsappMessage: `¡Hola! Vi el video de "${album.nombre}" en la sección de Álbumes Personalizados de SicaEstudio y quisiera consultar para encargar uno.`,
        }
      })
      .filter((item): item is AlbumEdition => item !== null)

    return (
      <div className="flex flex-col w-full">
        <AlbumsShowcase editions={editions} />
        <AlbumsCatalog products={products} />
      </div>
    )
  }

  // Vista estándar para Proyectos y categorías dinámicas (con buscador, filtro por categoría, ordenamiento A-Z / Z-A y Framer Motion)
  const [products, categories] = await Promise.all([
    getProducts(category),
    category === 'proyectos' ? getCategories() : Promise.resolve([]),
  ])

  return (
    <ProjectsCatalog
      label={catInfo.label}
      description={catInfo.desc}
      products={products}
      categories={categories}
    />
  )
}
