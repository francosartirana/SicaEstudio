import type { Metadata } from 'next'
import { getCategories, getProducts } from '@/lib/data/products'
import ProjectsCatalog from '@/components/ui/projects-catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Proyectos | SicaEstudio',
  description:
    'Galería completa de creaciones personalizadas de SicaEstudio: etiquetas de autor, álbumes y proyectos especiales a medida.',
}

export default async function ProyectosPage() {
  const [products, categories] = await Promise.all([
    getProducts('proyectos'),
    getCategories(),
  ])

  return (
    <ProjectsCatalog
      label="Proyectos"
      description="Galería completa de creaciones personalizadas de SicaEstudio: etiquetas de autor, álbumes y proyectos especiales a medida."
      products={products}
      categories={categories}
    />
  )
}
