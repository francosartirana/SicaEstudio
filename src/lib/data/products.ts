import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/utils'
import type { Product } from '@/types'

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    title: 'Etiqueta Gran Reserva Malbec',
    description: 'Diseño elegante con acabados en dorado metalizado, relieve y papel texturado para botellas premium.',
    category: 'etiquetas-vinos',
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-01-15T12:00:00Z',
  },
  {
    id: 'demo-2',
    title: 'Etiqueta Espumante Celebración',
    description: 'Etiqueta moderna con tintas holográficas e ilustraciones personalizadas para eventos y bodas.',
    category: 'etiquetas-vinos',
    image_url: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-02-10T15:30:00Z',
  },
  {
    id: 'demo-3',
    title: 'Álbum Coleccionable Mundial & Recuerdos',
    description: 'Álbum de fotos familiar estilo figuritas con paquetes de cromos autoadhesivos brillantes.',
    category: 'albumes-figuritas',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-02-20T18:00:00Z',
  },
  {
    id: 'demo-4',
    title: 'Álbum Infantil Aventuras Mágicas',
    description: 'Álbum de 24 páginas personalizado con la historia e ilustraciones para cumpleaños infantiles.',
    category: 'albumes-figuritas',
    image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'demo-5',
    title: 'Tarjetas Corporativas Soft Touch & Oro',
    description: 'Papelería de alta gama con laminado mate aterciopelado, despuntes y foil dorado.',
    category: 'tarjetas-empresariales',
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-03-12T14:15:00Z',
  },
  {
    id: 'demo-6',
    title: 'Tarjetas Minimalistas con QR Conectado',
    description: 'Tarjetas de presentación en papel reciclado kraft con código QR a tu portafolio o contacto directo.',
    category: 'tarjetas-empresariales',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-03-15T09:45:00Z',
  },
]

export async function getProducts(category?: string): Promise<Product[]> {
  const isAllProjects = !category || category === 'proyectos'

  // Si Supabase no está configurado aún con claves válidas, devuelve los datos de demostración al instante
  if (!isSupabaseConfigured()) {
    if (isAllProjects) return DEMO_PRODUCTS
    return DEMO_PRODUCTS.filter((p) => p.category === category)
  }

  try {
    const supabase = await createClient()

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isAllProjects) {
      query = query.eq('category', category)
    }

    // Usamos Promise.race con timeout de 3 segundos para evitar que la página quede colgada si hay problemas de red
    const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de consulta Supabase')), 3000)
    )

    const result = (await Promise.race([query, timeoutPromise])) as {
      data: Product[] | null
      error: unknown
    }

    if (result.data && result.data.length > 0) {
      return result.data
    }

    // Si la tabla está vacía o hubo error, retornamos demo para que la UI no quede vacía mientras se prueba
    return category ? DEMO_PRODUCTS.filter((p) => p.category === category) : DEMO_PRODUCTS
  } catch (err) {
    console.warn('Aviso: No se pudo conectar a Supabase, utilizando datos de muestra:', err)
    return category ? DEMO_PRODUCTS.filter((p) => p.category === category) : DEMO_PRODUCTS
  }
}
